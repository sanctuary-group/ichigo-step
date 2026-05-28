<?php

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\ScenarioController;
use App\Http\Controllers\ScenarioFolderController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatManagementController;
use App\Http\Controllers\ChatStatusController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\FriendTagController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Settings\ChannelController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\TemplateFolderController;
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

    Route::resource('settings/channels', ChannelController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['channels' => 'channel'])
        ->names('settings.channels');
    Route::post('settings/channels/{channel}/test', [ChannelController::class, 'test'])
        ->name('settings.channels.test');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat');
    Route::get('/chat/settings', fn () => Inertia::render('Chat/Settings'))->name('chat.settings');
    Route::get('/chat/management', [ChatManagementController::class, 'index'])
        ->name('chat.management');
    Route::post('/chat/management/bulk-read', [ChatManagementController::class, 'bulkUpdateRead'])
        ->name('chat.management.bulkRead');
    Route::post('/chat/{friend}/messages', [MessageController::class, 'store'])
        ->name('chat.messages.store');

    Route::resource('chat-statuses', ChatStatusController::class)
        ->only(['store', 'update', 'destroy']);

    Route::resource('tags', TagController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('templates', TemplateController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('template-folders', TemplateFolderController::class)
        ->only(['store', 'update', 'destroy']);

    Route::get('broadcasts', [BroadcastController::class, 'index'])->name('broadcasts.index');
    Route::get('broadcasts/create', [BroadcastController::class, 'create'])->name('broadcasts.create');
    Route::post('broadcasts', [BroadcastController::class, 'store'])->name('broadcasts.store');
    Route::get('broadcasts/{broadcast}/edit', [BroadcastController::class, 'edit'])->name('broadcasts.edit');
    Route::patch('broadcasts/{broadcast}', [BroadcastController::class, 'update'])->name('broadcasts.update');
    Route::delete('broadcasts/{broadcast}', [BroadcastController::class, 'destroy'])->name('broadcasts.destroy');
    Route::post('broadcasts/{broadcast}/send-now', [BroadcastController::class, 'sendNow'])->name('broadcasts.sendNow');
    Route::post('broadcasts/upload-image', [BroadcastController::class, 'uploadImage'])->name('broadcasts.uploadImage');

    Route::get('scenarios', [ScenarioController::class, 'index'])->name('scenarios.index');
    Route::get('scenarios/create', [ScenarioController::class, 'create'])->name('scenarios.create');
    Route::post('scenarios', [ScenarioController::class, 'store'])->name('scenarios.store');
    Route::get('scenarios/{scenario}/edit', [ScenarioController::class, 'edit'])->name('scenarios.edit');
    Route::patch('scenarios/{scenario}', [ScenarioController::class, 'update'])->name('scenarios.update');
    Route::delete('scenarios/{scenario}', [ScenarioController::class, 'destroy'])->name('scenarios.destroy');
    Route::post('scenarios/upload-image', [ScenarioController::class, 'uploadImage'])->name('scenarios.uploadImage');
    Route::patch('scenarios/{scenario}/toggle-active', [ScenarioController::class, 'toggleActive'])->name('scenarios.toggleActive');
    Route::post('scenarios/{scenario}/manual-enroll', [ScenarioController::class, 'manualEnroll'])->name('scenarios.manualEnroll');
    Route::resource('scenario-folders', ScenarioFolderController::class)
        ->only(['store', 'update', 'destroy']);

    Route::get('friends', [FriendController::class, 'index'])->name('friends.index');
    Route::patch('friends/{friend}', [FriendController::class, 'update'])
        ->name('friends.update');
    Route::patch('friends/{friend}/hidden', [FriendController::class, 'toggleHidden'])
        ->name('friends.toggleHidden');
    Route::patch('friends/{friend}/read', [FriendController::class, 'toggleRead'])
        ->name('friends.toggleRead');
    Route::patch('friends/{friend}/pin', [FriendController::class, 'togglePin'])
        ->name('friends.togglePin');
    Route::patch('friends/{friend}/chat-status', [FriendController::class, 'setChatStatus'])
        ->name('friends.setChatStatus');
    Route::post('friends/{friend}/refresh-profile', [FriendController::class, 'refreshProfile'])
        ->name('friends.refreshProfile');

    Route::post('friends/{friend}/tags/{tag}', [FriendTagController::class, 'attach'])
        ->name('friends.tags.attach');
    Route::delete('friends/{friend}/tags/{tag}', [FriendTagController::class, 'detach'])
        ->name('friends.tags.detach');

    // サイドバー項目の placeholder（B-3b 以降で順次実装）
    $placeholderRoutes = [
        '/greetings' => 'あいさつメッセージ',
        '/greetings/existing' => 'あいさつメッセージ（既存友だち用）',
        '/greetings/unblock' => 'あいさつメッセージ（ブロック解除友だち用）',
        '/rich-menus' => 'リッチメニュー',
        '/forms' => 'フォーム作成',
        '/auto-replies' => '自動応答',
        '/qr-actions' => 'QR コードアクション',
        '/data-management' => 'データ管理',
        '/data-management/friend-fields' => '友だち情報管理',
        '/data-management/csv' => 'CSV 管理',
        '/settings/profile' => 'マイページ',
        '/settings/members' => 'メンバー管理',
    ];
    foreach ($placeholderRoutes as $path => $title) {
        Route::get($path, fn () => Inertia::render('Placeholder/Index', ['title' => $title]));
    }
});
