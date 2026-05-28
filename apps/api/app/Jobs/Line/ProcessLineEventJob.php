<?php

namespace App\Jobs\Line;

use App\Models\Friend;
use App\Models\LineChannel;
use App\Models\Message;
use App\Services\GreetingDispatcher;
use App\Services\Line\LineClient;
use App\Services\ScenarioEnroller;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessLineEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 5;

    public function __construct(public int $channelId, public array $event) {}

    public function handle(): void
    {
        $channel = LineChannel::withoutGlobalScopes()->find($this->channelId);
        if (! $channel) {
            return;
        }

        match ($this->event['type'] ?? null) {
            'follow' => $this->handleFollow($channel),
            'unfollow' => $this->handleUnfollow($channel),
            'message' => $this->handleMessage($channel),
            'postback' => $this->handlePostback($channel),
            default => null,
        };
    }

    private function handleFollow(LineChannel $channel): void
    {
        $userId = $this->event['source']['userId'] ?? null;
        if (! $userId) {
            return;
        }

        $profile = $this->fetchProfile($channel, $userId);
        $timestamp = $this->eventTimestamp();

        // 既存友だち or 新規友だちかを判定するために事前ロード
        $existing = Friend::withoutGlobalScopes()
            ->where('line_channel_id', $channel->id)
            ->where('line_user_id', $userId)
            ->first();

        $isUnblock = $existing && ! $existing->is_following;
        $isNewFriend = ! $existing;

        $friend = Friend::withoutGlobalScopes()->updateOrCreate(
            ['line_channel_id' => $channel->id, 'line_user_id' => $userId],
            [
                'organization_id' => $channel->organization_id,
                'display_name' => $profile['displayName'] ?? null,
                'picture_url' => $profile['pictureUrl'] ?? null,
                'status_message' => $profile['statusMessage'] ?? null,
                'is_following' => true,
                'followed_at' => $timestamp,
                'unfollowed_at' => null,
                'pending_reply_token' => $this->event['replyToken'] ?? null,
                'pending_reply_received_at' => isset($this->event['replyToken']) ? $timestamp : null,
            ],
        );

        $replyToken = $this->event['replyToken'] ?? null;

        if ($isNewFriend) {
            GreetingDispatcher::dispatch($friend, $channel, 'new_friend', $replyToken);
            ScenarioEnroller::enroll($friend, 'friend_add');
        } elseif ($isUnblock) {
            GreetingDispatcher::dispatch($friend, $channel, 'unblock', $replyToken);
            // ブロック解除も友だち追加トリガーシナリオは発火させない (再度走らないように)
        }
    }

    private function handleUnfollow(LineChannel $channel): void
    {
        $userId = $this->event['source']['userId'] ?? null;
        if (! $userId) {
            return;
        }

        Friend::withoutGlobalScopes()
            ->where('line_channel_id', $channel->id)
            ->where('line_user_id', $userId)
            ->update([
                'is_following' => false,
                'unfollowed_at' => $this->eventTimestamp(),
            ]);
    }

    private function handleMessage(LineChannel $channel): void
    {
        $userId = $this->event['source']['userId'] ?? null;
        if (! $userId) {
            return;
        }

        $friend = $this->ensureFriend($channel, $userId);
        $message = $this->event['message'] ?? [];
        $messageType = $message['type'] ?? 'text';
        $content = $this->normalizeContent($message);
        $lineMessageId = $message['id'] ?? null;
        $timestamp = $this->eventTimestamp();

        $created = Message::withoutGlobalScopes()->firstOrCreate(
            ['line_message_id' => $lineMessageId, 'friend_id' => $friend->id],
            [
                'organization_id' => $channel->organization_id,
                'line_channel_id' => $channel->id,
                'direction' => 'incoming',
                'message_type' => $this->normalizeMessageType($messageType),
                'content' => $content,
                'source' => 'webhook',
                'sent_at' => $timestamp,
            ],
        );

        if ($created->wasRecentlyCreated) {
            $friend->forceFill([
                'last_message_preview' => $this->previewFor($messageType, $content),
                'last_message_at' => $timestamp,
                'unread_count' => $friend->unread_count + 1,
                'pending_reply_token' => $this->event['replyToken'] ?? null,
                'pending_reply_received_at' => isset($this->event['replyToken']) ? $timestamp : null,
            ])->save();
        }
    }

    private function handlePostback(LineChannel $channel): void
    {
        $userId = $this->event['source']['userId'] ?? null;
        if (! $userId) {
            return;
        }

        $friend = $this->ensureFriend($channel, $userId);
        $data = $this->event['postback']['data'] ?? '';
        $timestamp = $this->eventTimestamp();

        Message::withoutGlobalScopes()->create([
            'organization_id' => $channel->organization_id,
            'line_channel_id' => $channel->id,
            'friend_id' => $friend->id,
            'line_message_id' => null,
            'direction' => 'incoming',
            'message_type' => 'postback',
            'content' => $data,
            'source' => 'postback',
            'sent_at' => $timestamp,
        ]);

        $friend->forceFill([
            'last_message_preview' => '[ボタン操作]',
            'last_message_at' => $timestamp,
            'pending_reply_token' => $this->event['replyToken'] ?? null,
            'pending_reply_received_at' => isset($this->event['replyToken']) ? $timestamp : null,
        ])->save();
    }

    private function ensureFriend(LineChannel $channel, string $userId): Friend
    {
        $existing = Friend::withoutGlobalScopes()
            ->where('line_channel_id', $channel->id)
            ->where('line_user_id', $userId)
            ->first();

        if ($existing) {
            return $existing;
        }

        $profile = $this->fetchProfile($channel, $userId);

        return Friend::withoutGlobalScopes()->create([
            'organization_id' => $channel->organization_id,
            'line_channel_id' => $channel->id,
            'line_user_id' => $userId,
            'display_name' => $profile['displayName'] ?? null,
            'picture_url' => $profile['pictureUrl'] ?? null,
            'status_message' => $profile['statusMessage'] ?? null,
            'is_following' => true,
            'followed_at' => $this->eventTimestamp(),
        ]);
    }

    private function fetchProfile(LineChannel $channel, string $userId): array
    {
        try {
            return LineClient::forChannel($channel)->getProfile($userId);
        } catch (Throwable $e) {
            Log::warning('LINE profile fetch failed', [
                'channel_id' => $channel->id,
                'line_user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    private function normalizeMessageType(string $type): string
    {
        return in_array($type, ['text', 'image', 'sticker', 'video', 'audio', 'file', 'location', 'flex'], true)
            ? $type
            : 'text';
    }

    private function normalizeContent(array $message): string
    {
        return match ($message['type'] ?? 'text') {
            'text' => (string) ($message['text'] ?? ''),
            'image' => json_encode([
                'message_id' => $message['id'] ?? null,
                'preview' => null,
                'original' => null,
            ], JSON_UNESCAPED_UNICODE),
            'sticker' => '[スタンプ]',
            'video' => '[動画]',
            'audio' => '[音声]',
            'file' => '[ファイル]',
            'location' => '[位置情報]',
            default => '[未対応メッセージ]',
        };
    }

    private function previewFor(string $type, string $content): string
    {
        if ($type === 'text') {
            return mb_substr($content, 0, 50);
        }
        return $this->normalizeContent(['type' => $type]);
    }

    private function eventTimestamp(): Carbon
    {
        $ms = $this->event['timestamp'] ?? null;
        if (is_numeric($ms)) {
            return Carbon::createFromTimestampMs((int) $ms);
        }
        return Carbon::now();
    }
}
