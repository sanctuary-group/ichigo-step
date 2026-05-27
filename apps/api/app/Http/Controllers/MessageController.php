<?php

namespace App\Http\Controllers;

use App\Http\Requests\Message\StoreMessageRequest;
use App\Models\Friend;
use App\Models\Message;
use App\Services\Line\LineClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class MessageController extends Controller
{
    private const REPLY_TOKEN_MAX_AGE_MINUTES = 30;

    public function store(StoreMessageRequest $request, Friend $friend): RedirectResponse
    {
        if (! $friend->is_following) {
            return back()->with('flash.error', 'ブロックされている友だちには送信できません');
        }

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

    /**
     * Try reply API first if a fresh reply token is available, fallback to push.
     *
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
