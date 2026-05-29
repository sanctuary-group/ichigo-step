<?php

namespace App\Jobs\Broadcast;

use App\Models\Broadcast;
use App\Models\Friend;
use App\Models\Message;
use App\Services\Line\LineClient;
use App\Services\Line\Stealth;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class DispatchBroadcastJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 600;

    public function __construct(public int $broadcastId) {}

    public function handle(): void
    {
        $broadcast = Broadcast::withoutGlobalScopes()->find($this->broadcastId);
        if (! $broadcast) {
            return;
        }

        $claimed = Broadcast::withoutGlobalScopes()
            ->where('id', $broadcast->id)
            ->whereIn('status', ['scheduled', 'draft', 'sending'])
            ->whereNull('sent_at')
            ->update(['status' => 'sending']);

        if ($claimed === 0) {
            return;
        }

        $broadcast->refresh();

        $channel = $broadcast->lineChannel;
        if (! $channel || ! $channel->is_active) {
            $broadcast->forceFill([
                'status' => 'failed',
                'error_message' => 'LINE チャネルが無効です',
            ])->save();
            return;
        }

        $message = $this->buildMessage($broadcast);
        if (! $message) {
            $broadcast->forceFill([
                'status' => 'failed',
                'error_message' => 'メッセージ内容が不正です',
            ])->save();
            return;
        }

        $client = LineClient::forChannel($channel);

        $query = Friend::withoutGlobalScopes()
            ->where('organization_id', $broadcast->organization_id)
            ->where('line_channel_id', $channel->id)
            ->where('is_following', true);

        if ($broadcast->target_type === 'tag' && $broadcast->target_tag_id) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $broadcast->target_tag_id));
        }

        $totalCount = (clone $query)->count();
        $successCount = 0;
        $lastError = null;

        $messageType = $broadcast->message_type;
        $dbContent = $this->buildDbContent($broadcast);
        $preview = $this->buildPreview($broadcast);

        $batchIndex = 0;

        $query->orderBy('id')
            ->chunkById(500, function ($chunk) use ($client, $message, $broadcast, $messageType, $dbContent, $preview, $totalCount, &$successCount, &$lastError, &$batchIndex) {
                $userIds = $chunk->pluck('line_user_id')->all();

                // ステルス: バッチごとに文面を僅かに変えて同一文面の大量送信を避ける
                $batchMessage = Stealth::varyTextMessage($message, $batchIndex);

                try {
                    $result = $client->multicast($userIds, [$batchMessage]);
                    $successCount += count($userIds);
                    $this->recordMessages($chunk, $broadcast, $messageType, $dbContent, $preview, $result['request_id'] ?? null);
                } catch (Throwable $e) {
                    $lastError = $e->getMessage();
                    Log::warning('LINE multicast failed', [
                        'count' => count($userIds),
                        'error' => $e->getMessage(),
                    ]);
                }

                // ステルス: 送信規模に応じて時間分散（ジッター付き）。無効時は従来の 200ms。
                $delayMs = Stealth::enabled()
                    ? Stealth::staggerDelayMs($totalCount)
                    : 200;
                usleep($delayMs * 1000);
                $batchIndex++;
            });

        $broadcast->forceFill([
            'status' => $lastError && $successCount === 0 ? 'failed' : 'sent',
            'total_count' => $totalCount,
            'success_count' => $successCount,
            'sent_at' => now(),
            'error_message' => $lastError,
        ])->save();
    }

    private function recordMessages(
        \Illuminate\Support\Collection $chunk,
        Broadcast $broadcast,
        string $messageType,
        string $dbContent,
        string $preview,
        ?string $requestId,
    ): void {
        $now = now();
        foreach ($chunk as $friend) {
            Message::withoutGlobalScopes()->create([
                'organization_id' => $broadcast->organization_id,
                'line_channel_id' => $broadcast->line_channel_id,
                'friend_id' => $friend->id,
                'line_message_id' => $requestId,
                'direction' => 'outgoing',
                'message_type' => $messageType,
                'content' => $dbContent,
                'source' => 'broadcast',
                'sent_at' => $now,
            ]);

            Friend::withoutGlobalScopes()->where('id', $friend->id)->update([
                'last_message_preview' => $preview,
                'last_message_at' => $now,
            ]);
        }
    }

    private function buildDbContent(Broadcast $broadcast): string
    {
        if ($broadcast->message_type === 'text') {
            return (string) $broadcast->text_content;
        }
        return json_encode([
            'originalContentUrl' => (string) $broadcast->image_url,
            'previewImageUrl' => (string) ($broadcast->image_preview_url ?: $broadcast->image_url),
        ], JSON_UNESCAPED_UNICODE);
    }

    private function buildPreview(Broadcast $broadcast): string
    {
        if ($broadcast->message_type === 'text') {
            return mb_substr((string) $broadcast->text_content, 0, 50);
        }
        return '[画像]';
    }

    private function buildMessage(Broadcast $broadcast): ?array
    {
        if ($broadcast->message_type === 'text') {
            $text = (string) $broadcast->text_content;
            if ($text === '') {
                return null;
            }
            return ['type' => 'text', 'text' => $text];
        }

        if ($broadcast->message_type === 'image') {
            $original = (string) $broadcast->image_url;
            $preview = (string) ($broadcast->image_preview_url ?: $broadcast->image_url);
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
}
