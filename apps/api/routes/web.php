<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'show'])->name('register.show');
    Route::post('/register/email', [RegisterController::class, 'email'])->name('register.email');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');

    Route::get('/login', [SessionController::class, 'create'])->name('login');
    Route::post('/login', [SessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/', [HomeController::class, 'show'])->name('home');
    Route::post('/logout', [SessionController::class, 'destroy'])->name('logout');

    // サイドバー項目の placeholder（B-3b 以降で順次実装）
    $placeholderRoutes = [
        '/chat' => '1:1 チャット',
        '/chat/settings' => 'チャット設定',
        '/chat/management' => 'チャット管理',
        '/templates' => 'テンプレート',
        '/broadcasts' => 'メッセージ配信',
        '/scenarios' => 'ステップ配信',
        '/greetings' => 'あいさつメッセージ',
        '/greetings/existing' => 'あいさつメッセージ（既存友だち用）',
        '/greetings/unblock' => 'あいさつメッセージ（ブロック解除友だち用）',
        '/rich-menus' => 'リッチメニュー',
        '/forms' => 'フォーム作成',
        '/auto-replies' => '自動応答',
        '/qr-actions' => 'QR コードアクション',
        '/data-management' => 'データ管理',
        '/tags' => 'タグ管理',
        '/data-management/friend-fields' => '友だち情報管理',
        '/friends' => '友だちリスト',
        '/data-management/csv' => 'CSV 管理',
        '/settings/channels' => '設定 / LINE 公式アカウント',
        '/settings/profile' => 'マイページ',
        '/settings/members' => 'メンバー管理',
    ];
    foreach ($placeholderRoutes as $path => $title) {
        Route::get($path, fn () => Inertia::render('Placeholder/Index', ['title' => $title]));
    }
});
