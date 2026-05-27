<?php

namespace App\Http\Controllers;

use App\Http\Requests\Message\StoreMessageRequest;
use App\Models\Friend;
use App\Models\Message;
use App\Services\Line\LineClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class MessageController extends Controller
{
    private const REPLY_TOKEN_MAX_AGE_MINUTES = 30;

    public function store(StoreMessageRequest $request, Friend $friend): RedirectResponse
    {
        if (! $friend->is_following) {
            return back()->with('flash.error', 'ブロックされている友だちには送信できません');
        }

        if ($request->hasFile('image')) {
            return $this->sendImage($request, $friend);
        }

        return $this->sendText($request, $friend);
    }

    private function sendText(StoreMessageRequest $request, Friend $friend): RedirectResponse
    {
        $text = $request->string('content')->toString();
        $channel = $friend->lineChannel;
        $client = LineClient::forChannel($channel);
        $message = ['type' => 'text', 'text' => $text];

        [$result, $delivery] = $this->dispatchMessage($client, $friend, $message);

        if ($result === null) {
            return back()->with('flash.error', '送信失敗: '.$delivery);
        }

        DB::transaction(function () use ($friend, $channel, $text, $result, $delivery) {
            Message::create([
                'organization_id' => $friend->organization_id,
                'line_channel_id' => $channel->id,
                'friend_id' => $friend->id,
                'line_message_id' => $result['request_id'],
                'direction' => 'outgoing',
                'message_type' => 'text',
                'content' => $text,
                'source' => $delivery === 'reply' ? 'auto_reply' : 'user',
                'sent_at' => now(),
            ]);

            $update = [
                'last_message_preview' => mb_substr($text, 0, 50),
                'last_message_at' => now(),
            ];
            if ($delivery === 'reply') {
                $update['pending_reply_token'] = null;
                $update['pending_reply_received_at'] = null;
            }
            $friend->forceFill($update)->save();
        });

        return back(303);
    }

    private function sendImage(StoreMessageRequest $request, Friend $friend): RedirectResponse
    {
        $channel = $friend->lineChannel;
        $file = $request->file('image');
        $path = $file->store('messages', 'public');
        $baseUrl = rtrim((string) config('line.public_base_url'), '/');
        $url = $baseUrl.'/storage/'.$path;

        if (! str_starts_with($url, 'https://')) {
            return back()->with(
                'flash.error',
                "画像送信には HTTPS の公開 URL が必要です。LINE_PUBLIC_BASE_URL を設定してください（現状: {$url}）",
            );
        }

        $message = [
            'type' => 'image',
            'originalContentUrl' => $url,
            'previewImageUrl' => $url,
        ];

        try {
            $result = LineClient::forChannel($channel)
                ->pushMessage($friend->line_user_id, [$message]);
        } catch (Throwable $e) {
            return back()->with('flash.error', '画像送信失敗: '.$e->getMessage());
        }

        DB::transaction(function () use ($friend, $channel, $url, $result) {
            Message::create([
                'organization_id' => $friend->organization_id,
                'line_channel_id' => $channel->id,
                'friend_id' => $friend->id,
                'line_message_id' => $result['request_id'],
                'direction' => 'outgoing',
                'message_type' => 'image',
                'content' => json_encode([
                    'originalContentUrl' => $url,
                    'previewImageUrl' => $url,
                ], JSON_UNESCAPED_UNICODE),
                'source' => 'user',
                'sent_at' => now(),
            ]);

            $friend->forceFill([
                'last_message_preview' => '[画像]',
                'last_message_at' => now(),
            ])->save();
        });

        return back(303);
    }

    /**
     * @return array{0: ?array, 1: string}  result, delivery type ('reply' | 'push' | error message)
     */
    private function dispatchMessage(LineClient $client, Friend $friend, array $message): array
    {
        if ($this->canUseReply($friend)) {
            try {
                $result = $client->replyMessage($friend->pending_reply_token, [$message]);
                return [$result, 'reply'];
            } catch (Throwable $e) {
                // Fall through to push
            }
        }

        try {
            $result = $client->pushMessage($friend->line_user_id, [$message]);
            return [$result, 'push'];
        } catch (Throwable $e) {
            return [null, $e->getMessage()];
        }
    }

    private function canUseReply(Friend $friend): bool
    {
        if (! $friend->pending_reply_token || ! $friend->pending_reply_received_at) {
            return false;
        }
        return $friend->pending_reply_received_at->diffInMinutes(now()) < self::REPLY_TOKEN_MAX_AGE_MINUTES;
    }
}
