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

    private function http()
    {
        return Http::withToken($this->accessToken)
            ->acceptJson()
            ->timeout(10);
    }
}
