<?php

namespace App\Services\Line;

use App\Models\ChannelHealthLog;
use App\Models\LineChannel;
use Illuminate\Support\Facades\Http;
use Throwable;

class ChannelHealthMonitor
{
    private const BOT_INFO_URL = 'https://api.line.me/v2/bot/info';

    /**
     * 指定 LineChannel に対して /v2/bot/info を ping し、結果を channel_health_logs に記録 +
     * line_channels の risk_level / last_health_checked_at / last_health_error を更新する。
     */
    public function check(LineChannel $channel): ChannelHealthLog
    {
        $checkedAt = now();
        $httpStatus = null;
        $errorCode = null;
        $errorMessage = null;
        $riskLevel = 'normal';

        try {
            $response = Http::withToken($channel->channel_access_token)
                ->acceptJson()
                ->timeout(10)
                ->get(self::BOT_INFO_URL);

            $httpStatus = $response->status();

            if ($response->successful()) {
                $riskLevel = 'normal';
            } else {
                $body = $response->json();
                $errorCode = is_array($body) ? ($body['details'][0]['property'] ?? null) : null;
                $errorMessage = is_array($body)
                    ? mb_substr((string) ($body['message'] ?? $response->body()), 0, 500)
                    : mb_substr($response->body(), 0, 500);
                $riskLevel = $this->classify($httpStatus);
            }
        } catch (Throwable $e) {
            $errorCode = 'network_error';
            $errorMessage = mb_substr($e->getMessage(), 0, 500);
            $riskLevel = 'warning';
        }

        $log = ChannelHealthLog::withoutGlobalScopes()->create([
            'organization_id' => $channel->organization_id,
            'line_channel_id' => $channel->id,
            'http_status' => $httpStatus,
            'error_code' => $errorCode,
            'error_message' => $errorMessage,
            'risk_level' => $riskLevel,
            'checked_at' => $checkedAt,
        ]);

        $channel->forceFill([
            'risk_level' => $riskLevel,
            'last_health_checked_at' => $checkedAt,
            'last_health_error' => $riskLevel === 'normal' ? null : $errorMessage,
        ])->save();

        return $log;
    }

    /**
     * HTTP ステータスからリスクレベルを判定。
     *
     * - 401 / 403 → danger (BAN / トークン無効の可能性)
     * - 429       → warning (レートリミット)
     * - その他 4xx/5xx → warning
     */
    private function classify(int $httpStatus): string
    {
        return match (true) {
            in_array($httpStatus, [401, 403], true) => 'danger',
            $httpStatus === 429 => 'warning',
            $httpStatus >= 400 => 'warning',
            default => 'normal',
        };
    }
}
