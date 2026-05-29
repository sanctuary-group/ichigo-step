<?php

namespace App\Services;

use App\Models\Friend;
use App\Models\FriendScenario;
use App\Models\Greeting;
use App\Models\LineChannel;
use App\Models\Message;
use App\Models\Scenario;
use App\Services\Line\LineClient;
use App\Services\Line\Stealth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class GreetingDispatcher
{
    /**
     * 友だち追加 / ブロック解除のタイミングであいさつメッセージを送信し、アクションを実行する
     *
     * @param  string  $type  'new_friend' | 'unblock'
     * @param  ?string  $replyToken  follow イベントの reply token (あれば優先利用)
     */
    public static function dispatch(Friend $friend, LineChannel $channel, string $type, ?string $replyToken = null): void
    {
        $greeting = Greeting::withoutGlobalScopes()
            ->where('line_channel_id', $channel->id)
            ->where('type', $type)
            ->where('is_active', true)
            ->first();

        if (! $greeting) {
            return;
        }

        $payload = self::buildMessagePayload($greeting, $friend);

        if ($payload !== null) {
            self::sendMessage($greeting, $friend, $channel, $payload, $replyToken);
        }

        self::runActions($greeting, $friend, $channel);
    }

    /**
     * 既存友だち向けの一斉送信 (UI の「送信」ボタンから呼ばれる)
     */
    public static function dispatchExisting(Greeting $greeting): array
    {
        $channel = $greeting->lineChannel;
        if (! $channel || ! $channel->is_active) {
            return ['success' => 0, 'total' => 0, 'error' => 'LINE チャネルが無効です'];
        }

        $query = Friend::withoutGlobalScopes()
            ->where('organization_id', $greeting->organization_id)
            ->where('line_channel_id', $channel->id)
            ->where('is_following', true);

        $totalCount = (clone $query)->count();
        $successCount = 0;
        $lastError = null;

        $client = LineClient::forChannel($channel);

        $index = 0;

        $query->orderBy('id')->chunkById(500, function ($chunk) use ($greeting, $channel, $client, &$successCount, &$lastError, &$index) {
            // 個別 user の名前を差し込むため multicast ではなく 1 件ずつ push
            foreach ($chunk as $friend) {
                $payload = self::buildMessagePayload($greeting, $friend);
                if (! $payload) continue;
                // ステルス: 友だちごとに文面を僅かに変える
                $payload = Stealth::varyTextMessage($payload, $index);
                try {
                    $result = $client->pushMessage($friend->line_user_id, [$payload]);
                    self::recordMessage($greeting, $friend, $channel, $result['request_id'] ?? null);
                    $successCount++;
                } catch (Throwable $e) {
                    $lastError = $e->getMessage();
                    Log::warning('Greeting existing push failed', [
                        'friend_id' => $friend->id,
                        'error' => $e->getMessage(),
                    ]);
                }
                $index++;
                // ステルス: ジッター付きの送信間隔（無効時は従来の 50ms）
                if (Stealth::enabled()) {
                    Stealth::sleepJitter(50, 150);
                } else {
                    usleep(50_000);
                }
            }
        });

        return ['success' => $successCount, 'total' => $totalCount, 'error' => $lastError];
    }

    private static function sendMessage(Greeting $greeting, Friend $friend, LineChannel $channel, array $payload, ?string $replyToken): void
    {
        $client = LineClient::forChannel($channel);

        try {
            if ($replyToken) {
                $result = $client->replyMessage($replyToken, [$payload]);
                // Reply 成功 → friend.pending_reply_token を消費
                Friend::withoutGlobalScopes()->where('id', $friend->id)->update([
                    'pending_reply_token' => null,
                    'pending_reply_received_at' => null,
                ]);
            } else {
                $result = $client->pushMessage($friend->line_user_id, [$payload]);
            }
        } catch (Throwable $e) {
            // Reply に失敗したら push にフォールバック
            if ($replyToken) {
                try {
                    $result = $client->pushMessage($friend->line_user_id, [$payload]);
                } catch (Throwable $e2) {
                    Log::warning('Greeting send failed', [
                        'friend_id' => $friend->id,
                        'type' => $greeting->type,
                        'error' => $e2->getMessage(),
                    ]);
                    return;
                }
            } else {
                Log::warning('Greeting send failed', [
                    'friend_id' => $friend->id,
                    'type' => $greeting->type,
                    'error' => $e->getMessage(),
                ]);
                return;
            }
        }

        self::recordMessage($greeting, $friend, $channel, $result['request_id'] ?? null);
    }

    private static function recordMessage(Greeting $greeting, Friend $friend, LineChannel $channel, ?string $requestId): void
    {
        $messageType = $greeting->message_type;
        $content = $messageType === 'text'
            ? (string) $greeting->text_content
            : json_encode([
                'originalContentUrl' => (string) $greeting->image_url,
                'previewImageUrl' => (string) ($greeting->image_preview_url ?: $greeting->image_url),
            ], JSON_UNESCAPED_UNICODE);

        $preview = $messageType === 'text'
            ? mb_substr(self::substituteVariables((string) $greeting->text_content, $friend), 0, 50)
            : '[画像]';

        Message::withoutGlobalScopes()->create([
            'organization_id' => $greeting->organization_id,
            'line_channel_id' => $channel->id,
            'friend_id' => $friend->id,
            'line_message_id' => $requestId,
            'direction' => 'outgoing',
            'message_type' => $messageType,
            'content' => $messageType === 'text'
                ? self::substituteVariables($content, $friend)
                : $content,
            'source' => 'greeting',
            'sent_at' => now(),
        ]);

        Friend::withoutGlobalScopes()->where('id', $friend->id)->update([
            'last_message_preview' => $preview,
            'last_message_at' => now(),
        ]);
    }

    private static function buildMessagePayload(Greeting $greeting, Friend $friend): ?array
    {
        if ($greeting->message_type === 'text') {
            $text = self::substituteVariables((string) $greeting->text_content, $friend);
            if ($text === '') return null;
            return ['type' => 'text', 'text' => $text];
        }
        if ($greeting->message_type === 'image') {
            $original = (string) $greeting->image_url;
            $preview = (string) ($greeting->image_preview_url ?: $greeting->image_url);
            if (! str_starts_with($original, 'https://') || ! str_starts_with($preview, 'https://')) {
                return null;
            }
            return [
                'type' => 'image',
                'originalContentUrl' => $original,
                'previewImageUrl' => $preview,
            ];
        }
        return null;
    }

    private static function substituteVariables(string $text, Friend $friend): string
    {
        $name = $friend->system_display_name ?: $friend->display_name ?: '';
        return str_replace(['{{LINE名}}', '{{display_name}}'], $name, $text);
    }

    private static function runActions(Greeting $greeting, Friend $friend, LineChannel $channel): void
    {
        $actions = $greeting->actions ?? [];
        if (! is_array($actions)) return;

        foreach ($actions as $action) {
            $type = $action['type'] ?? null;
            try {
                match ($type) {
                    'tag_attach' => self::actionTagAttach($friend, (int) ($action['tag_id'] ?? 0)),
                    'tag_detach' => self::actionTagDetach($friend, (int) ($action['tag_id'] ?? 0)),
                    'scenario_start' => self::actionScenarioStart($friend, (int) ($action['scenario_id'] ?? 0)),
                    default => null,
                };
            } catch (Throwable $e) {
                Log::warning('Greeting action failed', [
                    'friend_id' => $friend->id,
                    'action' => $action,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    private static function actionTagAttach(Friend $friend, int $tagId): void
    {
        if ($tagId === 0) return;
        DB::table('friend_tag')->upsert(
            [['friend_id' => $friend->id, 'tag_id' => $tagId, 'assigned_at' => now()]],
            ['friend_id', 'tag_id'],
            ['assigned_at'],
        );
    }

    private static function actionTagDetach(Friend $friend, int $tagId): void
    {
        if ($tagId === 0) return;
        DB::table('friend_tag')
            ->where('friend_id', $friend->id)
            ->where('tag_id', $tagId)
            ->delete();
    }

    private static function actionScenarioStart(Friend $friend, int $scenarioId): void
    {
        if ($scenarioId === 0) return;
        $scenario = Scenario::withoutGlobalScopes()->with('steps')->find($scenarioId);
        if (! $scenario || ! $scenario->is_active) return;
        $firstStep = $scenario->steps->first();
        if (! $firstStep) return;

        $now = now();
        FriendScenario::withoutGlobalScopes()->updateOrCreate(
            ['friend_id' => $friend->id, 'scenario_id' => $scenario->id],
            [
                'organization_id' => $friend->organization_id,
                'current_step_order' => 0,
                'status' => 'active',
                'started_at' => $now,
                'next_delivery_at' => $firstStep->computeDeliveryAt($now),
                'completed_at' => null,
                'error_message' => null,
            ],
        );
    }
}
