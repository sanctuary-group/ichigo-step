<?php

namespace App\Services;

use App\Models\AutoReply;
use App\Models\Friend;
use App\Models\LineChannel;
use App\Models\Message;
use App\Services\Line\LineClient;
use App\Services\Line\Stealth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class AutoReplyDispatcher
{
    /**
     * 受信メッセージに対する自動応答（trigger_type = all / keyword）。
     */
    public static function handleMessage(Friend $friend, LineChannel $channel, string $text, ?string $replyToken): void
    {
        $rule = self::activeRules($channel, ['all', 'keyword'])
            ->first(fn (AutoReply $r) => $r->isWithinSchedule(now()) && $r->matchesText($text));

        if ($rule) {
            self::fire($rule, $friend, $channel, $replyToken);
        }
    }

    /**
     * 友だち追加時の自動応答（trigger_type = follow）。
     */
    public static function handleFollow(Friend $friend, LineChannel $channel, ?string $replyToken): void
    {
        $rule = self::activeRules($channel, ['follow'])
            ->first(fn (AutoReply $r) => $r->isWithinSchedule(now()));

        if ($rule) {
            self::fire($rule, $friend, $channel, $replyToken);
        }
    }

    private static function activeRules(LineChannel $channel, array $triggerTypes)
    {
        return AutoReply::withoutGlobalScopes()
            ->where('organization_id', $channel->organization_id)
            ->where('is_active', true)
            ->whereIn('trigger_type', $triggerTypes)
            ->orderBy('id')
            ->get();
    }

    private static function fire(AutoReply $rule, Friend $friend, LineChannel $channel, ?string $replyToken): void
    {
        // action_mode = once は 1 友だち 1 回まで
        if ($rule->action_mode === 'once') {
            $already = DB::table('auto_reply_triggers')
                ->where('auto_reply_id', $rule->id)
                ->where('friend_id', $friend->id)
                ->exists();
            if ($already) {
                return;
            }
        }

        $payload = self::buildPayload($rule);
        if (! $payload) {
            return;
        }

        // ステルス: 同一文面の連続送信を避けるため友だちごとに僅かに変える
        $payload = Stealth::varyTextMessage($payload, $friend->id);

        $client = LineClient::forChannel($channel);

        try {
            if ($replyToken) {
                $result = $client->replyMessage($replyToken, [$payload]);
            } else {
                $result = $client->pushMessage($friend->line_user_id, [$payload]);
            }
        } catch (Throwable $e) {
            // reply 失敗時は push にフォールバック
            if ($replyToken) {
                try {
                    $result = $client->pushMessage($friend->line_user_id, [$payload]);
                } catch (Throwable $e2) {
                    Log::warning('AutoReply send failed', [
                        'auto_reply_id' => $rule->id,
                        'friend_id' => $friend->id,
                        'error' => $e2->getMessage(),
                    ]);

                    return;
                }
            } else {
                Log::warning('AutoReply send failed', [
                    'auto_reply_id' => $rule->id,
                    'friend_id' => $friend->id,
                    'error' => $e->getMessage(),
                ]);

                return;
            }
        }

        self::recordMessage($rule, $friend, $channel, $result['request_id'] ?? null);

        DB::table('auto_reply_triggers')->updateOrInsert(
            ['auto_reply_id' => $rule->id, 'friend_id' => $friend->id],
            ['triggered_at' => now()],
        );

        AutoReply::withoutGlobalScopes()->where('id', $rule->id)->increment('hit_count');
    }

    private static function buildPayload(AutoReply $rule): ?array
    {
        if ($rule->message_type === 'text') {
            $text = trim((string) $rule->text_content);
            if ($text === '') {
                return null;
            }

            return ['type' => 'text', 'text' => $text];
        }

        if ($rule->message_type === 'image') {
            $original = (string) $rule->image_url;
            $preview = (string) ($rule->image_preview_url ?: $rule->image_url);
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

    private static function recordMessage(AutoReply $rule, Friend $friend, LineChannel $channel, ?string $requestId): void
    {
        $content = $rule->message_type === 'text'
            ? (string) $rule->text_content
            : json_encode([
                'originalContentUrl' => (string) $rule->image_url,
                'previewImageUrl' => (string) ($rule->image_preview_url ?: $rule->image_url),
            ], JSON_UNESCAPED_UNICODE);

        $preview = $rule->message_type === 'text'
            ? mb_substr((string) $rule->text_content, 0, 50)
            : '[画像]';

        Message::withoutGlobalScopes()->create([
            'organization_id' => $rule->organization_id,
            'line_channel_id' => $channel->id,
            'friend_id' => $friend->id,
            'line_message_id' => $requestId,
            'direction' => 'outgoing',
            'message_type' => $rule->message_type,
            'content' => $content,
            'source' => 'auto_reply',
            'sent_at' => now(),
        ]);

        Friend::withoutGlobalScopes()->where('id', $friend->id)->update([
            'last_message_preview' => $preview,
            'last_message_at' => now(),
        ]);
    }
}
