<?php

return [
    /*
    | LINE が画像 / メディアを取得するための公開 base URL。
    | LINE Messaging API は originalContentUrl / previewImageUrl に HTTPS の到達可能な URL を要求する。
    | ローカル開発時は cloudflared 等のトンネル URL を指定。
    | 未設定なら APP_URL にフォールバック。
    */
    'public_base_url' => env('LINE_PUBLIC_BASE_URL', env('APP_URL')),
];
