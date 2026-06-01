<?php

use App\Http\Controllers\Api\LineWebhookController;
use App\Http\Controllers\PublicLiffController;
use Illuminate\Support\Facades\Route;

Route::post('/line/webhook/{channelId}', [LineWebhookController::class, 'store'])
    ->middleware('verify.line')
    ->name('line.webhook');

// LIFF から access token を受け取り QR スキャン者を捕捉（CSRF 不要の API グループ）
Route::post('/liff/qr/{token}/enter', [PublicLiffController::class, 'enter'])
    ->name('publicLiff.enter');
