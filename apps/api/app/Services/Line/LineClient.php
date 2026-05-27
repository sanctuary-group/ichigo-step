<?php

namespace App\Services\Line;

use App\Models\LineChannel;
use Illuminate\Support\Facades\Http;

class LineClient
{
    private const BASE_URL = 'https://api.line.me';

    public function __construct(private string $accessToken) {}

    public static function forChannel(LineChannel $channel): self
    {
        return new self($channel->channel_access_token);
    }

    public function getBotInfo(): array
    {
        return $this->http()->get(self::BASE_URL.'/v2/bot/info')->throw()->json();
    }

    public function getProfile(string $userId): array
    {
        return $this->http()->get(self::BASE_URL."/v2/bot/profile/{$userId}")->throw()->json();
    }

    /**
     * Push messages to a single LINE user.
     *
     * @param  array<int, array<string, mixed>>  $messages
     * @return array{request_id: ?string, body: array}
     */
    public function pushMessage(string $toUserId, array $messages): array
    {
        $response = $this->http()
            ->post(self::BASE_URL.'/v2/bot/message/push', [
                'to' => $toUserId,
                'messages' => $messages,
            ])
            ->throw();

        return [
            'request_id' => $response->header('X-Line-Request-Id') ?: null,
            'body' => $response->json() ?? [],
        ];
    }

    /**
     * Multicast messages to up to 500 LINE users at once.
     *
     * @param  array<int, string>  $toUserIds
     * @param  array<int, array<string, mixed>>  $messages
     * @return array{request_id: ?string, body: array}
     */
    public function multicast(array $toUserIds, array $messages): array
    {
        $response = $this->http()
            ->post(self::BASE_URL.'/v2/bot/message/multicast', [
                'to' => array_values($toUserIds),
                'messages' => $messages,
            ])
            ->throw();

        return [
            'request_id' => $response->header('X-Line-Request-Id') ?: null,
            'body' => $response->json() ?? [],
        ];
    }

    /**
     * Reply messages using a reply token (free, no quota).
     *
     * @param  array<int, array<string, mixed>>  $messages
     * @return array{request_id: ?string, body: array}
     */
    public function replyMessage(string $replyToken, array $messages): array
    {
        $response = $this->http()
            ->post(self::BASE_URL.'/v2/bot/message/reply', [
                'replyToken' => $replyToken,
                'messages' => $messages,
            ])
            ->throw();

        return [
            'request_id' => $response->header('X-Line-Request-Id') ?: null,
            'body' => $response->json() ?? [],
        ];
    }

    private function http()
    {
        return Http::withToken($this->accessToken)
            ->acceptJson()
            ->timeout(10);
    }
}
