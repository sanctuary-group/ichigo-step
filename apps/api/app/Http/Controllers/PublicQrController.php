<?php

namespace App\Http\Controllers;

use App\Models\QrAction;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PublicQrController extends Controller
{
    /**
     * 追跡 URL。読み込み数を加算して LINE 友だち追加 URL へリダイレクトする。
     */
    public function redirect(string $token): RedirectResponse
    {
        $qr = QrAction::withoutGlobalScopes()
            ->with('lineChannel')
            ->where('token', $token)
            ->where('is_active', true)
            ->first();

        if (! $qr) {
            abort(404);
        }

        // 流入計測（読み込み人数）
        QrAction::withoutGlobalScopes()->where('id', $qr->id)->increment('scan_count');

        $addUrl = $this->friendAddUrl($qr);

        return redirect()->away($addUrl);
    }

    /**
     * 追跡 URL を QR コード（PNG）として返す。
     */
    public function image(string $token): HttpResponse
    {
        $qr = QrAction::withoutGlobalScopes()->where('token', $token)->first();
        if (! $qr) {
            abort(404);
        }

        $base = rtrim((string) config('line.public_base_url'), '/');
        $trackedUrl = $base.'/qr/'.$qr->token;

        $result = (new Builder(
            writer: new PngWriter(),
            data: $trackedUrl,
            size: 320,
            margin: 16,
        ))->build();

        return new Response($result->getString(), 200, [
            'Content-Type' => $result->getMimeType(),
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * チャネルの basic_id から LINE 友だち追加 URL を組み立てる。
     */
    private function friendAddUrl(QrAction $qr): string
    {
        $basicId = $qr->lineChannel?->basic_id;
        if ($basicId) {
            // 例: @134zjbyu → https://line.me/R/ti/p/%40134zjbyu
            return 'https://line.me/R/ti/p/'.rawurlencode($basicId);
        }

        // basic_id 未設定時は公開トップへフォールバック
        return rtrim((string) config('line.public_base_url'), '/').'/';
    }
}
