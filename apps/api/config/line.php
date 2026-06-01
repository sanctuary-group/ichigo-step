<?php

return [
    /*
    | LINE が画像 / メディアを取得するための公開 base URL。
    | LINE Messaging API は originalContentUrl / previewImageUrl に HTTPS の到達可能な URL を要求する。
    | ローカル開発時は cloudflared 等のトンネル URL を指定。
    | 未設定なら APP_URL にフォールバック。
    */
    'public_base_url' => env('LINE_PUBLIC_BASE_URL', env('APP_URL')),

    /*
    | ステルスモード（BAN 予防のための送信パターン最適化）。
    | true で配信時のジッター / 文面バリエーション / 時間分散を有効化する。
    */
    'stealth_enabled' => (bool) env('LINE_STEALTH_ENABLED', true),

    /*
    | 直近 1 時間の送信数がこの値を超えたらヘルスチェックで warning にする。
    */
    'high_volume_threshold' => (int) env('LINE_HIGH_VOLUME_THRESHOLD', 5000),

    /*
    | danger（BAN 疑い）検出時に通知を飛ばす Webhook URL（Slack Incoming Webhook 等）。
    | 未設定ならログ出力のみ。
    */
    'ban_alert_webhook_url' => env('BAN_ALERT_WEBHOOK_URL'),

    /*
    | BAN（danger）検知時に、あらかじめ設定した予備チャネル（fallback_channel_id）へ
    | アクティブを自動で切り替えるか。false なら手動承認（/ban-detection の切替ボタン）のみ。
    */
    'auto_switch_enabled' => (bool) env('LINE_AUTO_SWITCH_ENABLED', true),

    /*
    | 誤検知でのバタつき防止。直近この回数連続で danger のときだけ自動切替を実行する。
    */
    'auto_switch_danger_streak' => (int) env('LINE_AUTO_SWITCH_DANGER_STREAK', 2),
];
