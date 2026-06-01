<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyLineSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // cloudflared / リバースプロキシ経由でも HTTPS を正しく検出させる
        // （X-Forwarded-Proto を信頼し、アセット URL を https で生成 → 混在コンテンツ防止）
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'verify.line' => VerifyLineSignature::class,
        ]);

        // 運営側 管理画面（秘密パス）配下は運営者ログイン、それ以外は利用者ログインへ誘導
        // config() はリクエスト時に評価（ミドルウェア設定時点では config 未ロードのため）
        $isAdminPath = fn (Request $request) => $request->is(config('admin.path'), config('admin.path').'/*');
        $middleware->redirectGuestsTo(fn (Request $request) => $isAdminPath($request)
            ? route('admin.login')
            : route('login'));
        $middleware->redirectUsersTo(fn (Request $request) => $isAdminPath($request)
            ? route('admin.dashboard')
            : '/');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
