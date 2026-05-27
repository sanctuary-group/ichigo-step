<?php

use App\Http\Controllers\Api\LineWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/line/webhook/{channelId}', [LineWebhookController::class, 'store'])
    ->middleware('verify.line')
    ->name('line.webhook');
