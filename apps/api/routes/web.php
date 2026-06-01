<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminSessionController;
use App\Http\Controllers\Admin\AgencyController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\AutoReplyController;
use App\Http\Controllers\AutoReplyFolderController;
use App\Http\Controllers\BanDetectionController;
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\ScenarioController;
use App\Http\Controllers\ScenarioFolderController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatManagementController;
use App\Http\Controllers\ChatSettingController;
use App\Http\Controllers\ChatStatusController;
use App\Http\Controllers\CsvController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataManagementController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\FriendFieldController;
use App\Http\Controllers\FriendFieldFolderController;
use App\Http\Controllers\FriendFieldValueController;
use App\Http\Controllers\FriendScenarioController;
use App\Http\Controllers\FriendTagController;
use App\Http\Controllers\GreetingController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\FormFolderController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PublicFormController;
use App\Http\Controllers\PublicFriendAddController;
use App\Http\Controllers\PublicQrController;
use App\Http\Controllers\PublicShortLinkController;
use App\Http\Controllers\QrActionController;
use App\Http\Controllers\QrActionFolderController;
use App\Http\Controllers\RichMenuController;
use App\Http\Controllers\RichMenuFolderController;
use App\Http\Controllers\Settings\ChannelController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\ShortLinkController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\TemplateFolderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| 運営側 管理画面（/admin・operators guard）
|--------------------------------------------------------------------------
*/
Route::prefix(config('admin.path'))->group(function () {
    Route::middleware('guest:admin')->group(function () {
        Route::get('login', [AdminSessionController::class, 'create'])->name('admin.login');
        Route::post('login', [AdminSessionController::class, 'store'])->name('admin.login.store');
    });

    Route::middleware('auth:admin')->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::post('logout', [AdminSessionController::class, 'destroy'])->name('admin.logout');

        Route::get('agencies', [AgencyController::class, 'index'])->name('admin.agencies.index');
        Route::get('agencies/{organization}', [AgencyController::class, 'show'])->name('admin.agencies.show');
        Route::patch('agencies/{organization}/status', [AgencyController::class, 'updateStatus'])->name('admin.agencies.status');
        Route::patch('agencies/{organization}/plan', [AgencyController::class, 'updatePlan'])->name('admin.agencies.plan');

        Route::get('announcements', [AnnouncementController::class, 'index'])->name('admin.announcements.index');
        Route::get('announcements/create', [AnnouncementController::class, 'create'])->name('admin.announcements.create');
        Route::post('announcements', [AnnouncementController::class, 'store'])->name('admin.announcements.store');
        Route::get('announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('admin.announcements.edit');
        Route::patch('announcements/{announcement}', [AnnouncementController::class, 'update'])->name('admin.announcements.update');
        Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('admin.announcements.destroy');
    });
});

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

    Route::get('settings/profile', [ProfileController::class, 'show'])->name('settings.profile');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');
    Route::patch('settings/profile/password', [ProfileController::class, 'updatePassword'])->name('settings.profile.password');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat');
    Route::get('/chat/settings', [ChatSettingController::class, 'edit'])->name('chat.settings');
    Route::patch('/chat/settings', [ChatSettingController::class, 'update'])->name('chat.settings.update');

    Route::get('/short-links', [ShortLinkController::class, 'index'])->name('shortLinks.index');
    Route::delete('/short-links/{shortLink}', [ShortLinkController::class, 'destroy'])->name('shortLinks.destroy');
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

    Route::get('greetings', fn () => redirect('/greetings/new-friend'));
    Route::get('greetings/new-friend', fn (\Illuminate\Http\Request $r) => app(GreetingController::class)->show($r, 'new_friend'))->name('greetings.newFriend');
    Route::patch('greetings/new-friend', fn (\Illuminate\Http\Request $r) => app(GreetingController::class)->update($r, 'new_friend'))->name('greetings.newFriend.update');
    Route::get('greetings/existing', fn (\Illuminate\Http\Request $r) => app(GreetingController::class)->show($r, 'existing'))->name('greetings.existing');
    Route::patch('greetings/existing', fn (\Illuminate\Http\Request $r) => app(GreetingController::class)->update($r, 'existing'))->name('greetings.existing.update');
    Route::post('greetings/existing/send', fn (\Illuminate\Http\Request $r) => app(GreetingController::class)->sendExisting($r, 'existing'))->name('greetings.existing.send');
    Route::get('greetings/unblock', fn (\Illuminate\Http\Request $r) => app(GreetingController::class)->show($r, 'unblock'))->name('greetings.unblock');
    Route::patch('greetings/unblock', fn (\Illuminate\Http\Request $r) => app(GreetingController::class)->update($r, 'unblock'))->name('greetings.unblock.update');
    Route::post('greetings/upload-image', [GreetingController::class, 'uploadImage'])->name('greetings.uploadImage');

    Route::get('qr-actions', [QrActionController::class, 'index'])->name('qrActions.index');
    Route::get('qr-actions/create', [QrActionController::class, 'create'])->name('qrActions.create');
    Route::post('qr-actions', [QrActionController::class, 'store'])->name('qrActions.store');
    Route::get('qr-actions/{qrAction}/edit', [QrActionController::class, 'edit'])->name('qrActions.edit');
    Route::patch('qr-actions/{qrAction}', [QrActionController::class, 'update'])->name('qrActions.update');
    Route::delete('qr-actions/{qrAction}', [QrActionController::class, 'destroy'])->name('qrActions.destroy');
    Route::patch('qr-actions/{qrAction}/toggle-active', [QrActionController::class, 'toggleActive'])->name('qrActions.toggleActive');
    Route::resource('qr-action-folders', QrActionFolderController::class)
        ->only(['store', 'update', 'destroy'])
        ->names('qrActionFolders');

    Route::get('auto-replies', [AutoReplyController::class, 'index'])->name('autoReplies.index');
    Route::get('auto-replies/create', [AutoReplyController::class, 'create'])->name('autoReplies.create');
    Route::post('auto-replies', [AutoReplyController::class, 'store'])->name('autoReplies.store');
    Route::get('auto-replies/{autoReply}/edit', [AutoReplyController::class, 'edit'])->name('autoReplies.edit');
    Route::patch('auto-replies/{autoReply}', [AutoReplyController::class, 'update'])->name('autoReplies.update');
    Route::delete('auto-replies/{autoReply}', [AutoReplyController::class, 'destroy'])->name('autoReplies.destroy');
    Route::patch('auto-replies/{autoReply}/toggle-active', [AutoReplyController::class, 'toggleActive'])->name('autoReplies.toggleActive');
    Route::post('auto-replies/upload-image', [AutoReplyController::class, 'uploadImage'])->name('autoReplies.uploadImage');
    Route::resource('auto-reply-folders', AutoReplyFolderController::class)
        ->only(['store', 'update', 'destroy'])
        ->names('autoReplyFolders');

    Route::get('forms', [FormController::class, 'index'])->name('forms.index');
    Route::get('forms/create', [FormController::class, 'create'])->name('forms.create');
    Route::post('forms', [FormController::class, 'store'])->name('forms.store');
    Route::get('forms/{form}/edit', [FormController::class, 'edit'])->name('forms.edit');
    Route::get('forms/{form}/responses', [FormController::class, 'responses'])->name('forms.responses');
    Route::patch('forms/{form}', [FormController::class, 'update'])->name('forms.update');
    Route::delete('forms/{form}', [FormController::class, 'destroy'])->name('forms.destroy');
    Route::post('forms/{form}/publish', [FormController::class, 'publish'])->name('forms.publish');
    Route::post('forms/{form}/unpublish', [FormController::class, 'unpublish'])->name('forms.unpublish');
    Route::resource('form-folders', FormFolderController::class)
        ->only(['store', 'update', 'destroy'])
        ->names('formFolders');

    Route::get('rich-menus', [RichMenuController::class, 'index'])->name('richMenus.index');
    Route::get('rich-menus/create', [RichMenuController::class, 'create'])->name('richMenus.create');
    Route::post('rich-menus', [RichMenuController::class, 'store'])->name('richMenus.store');
    Route::get('rich-menus/{richMenu}/edit', [RichMenuController::class, 'edit'])->name('richMenus.edit');
    Route::patch('rich-menus/{richMenu}', [RichMenuController::class, 'update'])->name('richMenus.update');
    Route::delete('rich-menus/{richMenu}', [RichMenuController::class, 'destroy'])->name('richMenus.destroy');
    Route::post('rich-menus/{richMenu}/publish', [RichMenuController::class, 'publish'])->name('richMenus.publish');
    Route::post('rich-menus/{richMenu}/unpublish', [RichMenuController::class, 'unpublish'])->name('richMenus.unpublish');
    Route::post('rich-menus/upload-image', [RichMenuController::class, 'uploadImage'])->name('richMenus.uploadImage');
    Route::resource('rich-menu-folders', RichMenuFolderController::class)
        ->only(['store', 'update', 'destroy'])
        ->names('richMenuFolders');

    Route::get('ban-detection', [BanDetectionController::class, 'index'])->name('banDetection.index');
    Route::post('ban-detection/check', [BanDetectionController::class, 'runCheck'])->name('banDetection.check');
    Route::post('ban-detection/switch', [BanDetectionController::class, 'switchActive'])->name('banDetection.switch');
    Route::post('ban-detection/fallback', [BanDetectionController::class, 'setFallback'])->name('banDetection.fallback');
    Route::resource('scenario-folders', ScenarioFolderController::class)
        ->only(['store', 'update', 'destroy']);

    Route::get('friends', [FriendController::class, 'index'])->name('friends.index');
    Route::get('friends/{friend}', [FriendController::class, 'show'])->name('friends.show');
    Route::patch('friends/{friend}', [FriendController::class, 'update'])
        ->name('friends.update');
    Route::delete('friends/{friend}', [FriendController::class, 'destroy'])
        ->name('friends.destroy');
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

    Route::put('friends/{friend}/field-values', [FriendFieldValueController::class, 'update'])
        ->name('friends.fieldValues.update');

    Route::post('friends/{friend}/scenario/enroll', [FriendScenarioController::class, 'enroll'])
        ->name('friends.scenario.enroll');
    Route::post('friends/{friend}/scenario/stop', [FriendScenarioController::class, 'stop'])
        ->name('friends.scenario.stop');

    Route::post('friends/{friend}/tags/{tag}', [FriendTagController::class, 'attach'])
        ->name('friends.tags.attach');
    Route::delete('friends/{friend}/tags/{tag}', [FriendTagController::class, 'detach'])
        ->name('friends.tags.detach');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // データ管理
    Route::get('data-management', [DataManagementController::class, 'index'])->name('dataManagement.index');

    Route::get('data-management/friend-fields', [FriendFieldController::class, 'index'])->name('friendFields.index');
    Route::get('data-management/friend-fields/new', [FriendFieldController::class, 'create'])->name('friendFields.create');
    Route::post('data-management/friend-fields', [FriendFieldController::class, 'store'])->name('friendFields.store');
    Route::get('data-management/friend-fields/{friendField}/edit', [FriendFieldController::class, 'edit'])->name('friendFields.edit');
    Route::patch('data-management/friend-fields/{friendField}', [FriendFieldController::class, 'update'])->name('friendFields.update');
    Route::delete('data-management/friend-fields/{friendField}', [FriendFieldController::class, 'destroy'])->name('friendFields.destroy');
    Route::resource('friend-field-folders', FriendFieldFolderController::class)
        ->only(['store', 'update', 'destroy'])
        ->names('friendFieldFolders');

    Route::get('data-management/csv', [CsvController::class, 'index'])->name('csv.index');
    Route::get('data-management/csv/new', [CsvController::class, 'createExport'])->name('csv.createExport');
    Route::post('data-management/csv/export', [CsvController::class, 'storeExport'])->name('csv.storeExport');
    Route::post('data-management/csv/import', [CsvController::class, 'storeImport'])->name('csv.storeImport');
    Route::get('data-management/csv/{csvJob}/download', [CsvController::class, 'download'])->name('csv.download');
    Route::delete('data-management/csv/{csvJob}', [CsvController::class, 'destroy'])->name('csv.destroy');
});

// 公開フォーム回答ページ（認証不要）
Route::get('/f/{token}', [PublicFormController::class, 'show'])->name('publicForm.show');
Route::post('/f/{token}', [PublicFormController::class, 'submit'])->name('publicForm.submit');

// QR コードアクション 追跡 URL / QR 画像（認証不要）
Route::get('/qr/{token}/image', [PublicQrController::class, 'image'])->name('publicQr.image');
Route::get('/qr/{token}', [PublicQrController::class, 'redirect'])->name('publicQr.redirect');

// 短縮 URL リダイレクト（認証不要）
Route::get('/s/{token}', [PublicShortLinkController::class, 'redirect'])->name('shortLink.redirect');

// 友だち追加 追跡リダイレクト（認証不要）。BAN 後はアクティブ/予備チャネルへ自動追従。
Route::get('/add/{token}', [PublicFriendAddController::class, 'redirect'])->name('publicFriendAdd.redirect');
