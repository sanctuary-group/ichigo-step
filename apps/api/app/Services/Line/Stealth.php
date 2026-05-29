<?php

namespace App\Services\Line;

use Illuminate\Support\Carbon;

/**
 * BAN 予防のための送信パターン最適化（ステルスモード）。
 *
 * line-harness-oss の stealth.ts を Laravel/PHP に翻訳:
 *  - ジッター付きディレイ
 *  - 文面バリエーション（ゼロ幅文字）
 *  - スタッガード（時間分散）配信
 *  - 配信時刻ジッター
 *
 * すべて純粋関数。config('line.stealth_enabled') で全体 ON/OFF。
 */
class Stealth
{
    /** 文面バリエーションに使うゼロ幅文字 */
    private const ZERO_WIDTH = ["\u{200B}", "\u{200C}", "\u{200D}", "\u{FEFF}"];

    public static function enabled(): bool
    {
        return (bool) config('line.stealth_enabled', true);
    }

    /**
     * base + 0〜range ミリ秒のランダム遅延（ミリ秒）。
     */
    public static function jitterMs(int $baseMs, int $rangeMs): int
    {
        return $baseMs + random_int(0, max(0, $rangeMs));
    }

    /**
     * jitterMs 相当をそのまま sleep する。
     */
    public static function sleepJitter(int $baseMs, int $rangeMs): void
    {
        usleep(self::jitterMs($baseMs, $rangeMs) * 1000);
    }

    /**
     * 同一文面の大量送信を避けるため、末尾に index 由来のゼロ幅文字を付与する。
     * 見た目は不変だがバイト列が変わる。
     */
    public static function addMessageVariation(string $text, int $index): string
    {
        if ($text === '') {
            return $text;
        }

        $a = self::ZERO_WIDTH[$index % 4];
        $b = self::ZERO_WIDTH[intdiv($index, 4) % 4];

        return $text.$a.$b;
    }

    /**
     * 送信規模に応じてバッチ間の待機時間（ミリ秒）を算出し、配信を時間分散する。
     *  - 100 通以下 : 100ms + jitter(500ms)
     *  - 1000 通以下: 2 分間に分散
     *  - 1000 通超  : 5 分間に分散
     */
    public static function staggerDelayMs(int $total, int $batchSize = 500): int
    {
        if ($total <= 100) {
            return self::jitterMs(100, 500);
        }

        $windowMs = $total <= 1000 ? 120_000 : 300_000;
        $batches = max(1, (int) ceil($total / max(1, $batchSize)));

        return intdiv($windowMs, $batches) + random_int(0, 500);
    }

    /**
     * 配信予定時刻に -max〜+max 分のランダムオフセットを加える。
     */
    public static function jitterDeliveryTime(Carbon $scheduledAt, int $maxMinutes = 5): Carbon
    {
        $offset = random_int(-$maxMinutes * 60, $maxMinutes * 60);

        return $scheduledAt->copy()->addSeconds($offset);
    }

    /**
     * テキストメッセージ payload にバリエーションを適用したコピーを返す。
     * stealth 無効時・テキスト以外はそのまま返す。
     *
     * @param  array<string, mixed>  $message
     * @return array<string, mixed>
     */
    public static function varyTextMessage(array $message, int $index): array
    {
        if (! self::enabled()) {
            return $message;
        }
        if (($message['type'] ?? null) !== 'text' || ! isset($message['text'])) {
            return $message;
        }

        $message['text'] = self::addMessageVariation((string) $message['text'], $index);

        return $message;
    }
}
