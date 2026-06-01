<?php

namespace App\Http\Controllers;

use App\Models\QrAction;
use App\Models\QrAttribution;
use App\Services\QrActionApplier;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class PublicLiffController extends Controller
{
    /** LIFF で捕捉した紐付けの有効期限（時間） */
    private const ATTRIBUTION_TTL_HOURS = 2;

    /**
     * LIFF ランディングページ（LINE アプリ内ブラウザで開かれる）。
     * QR の token から LIFF ID を解決して Blade を返す。
     * LIFF 未設定なら従来どおり友だち追加 URL へフォールバック。
     */
    public function qr(string $token): View|RedirectResponse
    {
        $qr = $this->findQr($token);
        if (! $qr) {
            abort(404);
        }

        $channel = $qr->lineChannel;
        $friendAddUrl = $this->friendAddUrl($qr);

        // LIFF ID が無い or アクション無しなら友だち追加へ直行（発火しない）
        if (! $channel?->liff_id || $qr->action_type === 'none') {
            return redirect()->away($friendAddUrl);
        }

        return view('liff.qr', [
            'liffId' => $channel->liff_id,
            'token' => $qr->token,
            'friendAddUrl' => $friendAddUrl,
            'enterUrl' => url("/api/liff/qr/{$qr->token}/enter"),
        ]);
    }

    /**
     * LIFF から access token を受け取り、LINE userId を検証して紐付けを記録する。
     * 既存の友だちが再スキャンした場合はその場で適用。未追加なら follow webhook で適用される。
     */
    public function enter(Request $request, string $token): JsonResponse
    {
        $qr = $this->findQr($token);
        if (! $qr) {
            return response()->json(['error' => 'not_found'], 404);
        }

        $friendAddUrl = $this->friendAddUrl($qr);
        $channel = $qr->lineChannel;

        $accessToken = (string) $request->input('access_token', '');
        $userId = $accessToken !== '' ? $this->verifyUserId($accessToken) : null;

        // 検証できない場合でも友だち追加自体は止めない（アクションは発火しない）
        if ($userId && $channel) {
            $appliedNow = QrActionApplier::applyNowIfFriendExists($qr, $channel, $userId);

            if (! $appliedNow) {
                // 未追加 → follow webhook で適用するため紐付けを記録
                QrAttribution::create([
                    'organization_id' => $qr->organization_id,
                    'qr_action_id' => $qr->id,
                    'line_channel_id' => $channel->id,
                    'line_user_id' => $userId,
                    'expires_at' => Carbon::now()->addHours(self::ATTRIBUTION_TTL_HOURS),
                ]);
            }
        }

        return response()->json(['friend_add_url' => $friendAddUrl]);
    }

    private function findQr(string $token): ?QrAction
    {
        return QrAction::withoutGlobalScopes()
            ->with('lineChannel')
            ->where('token', $token)
            ->where('is_active', true)
            ->first();
    }

    /**
     * LIFF access token から LINE userId を検証して取得する。
     * LIFF（LINE Login チャネル）と Messaging API チャネルが同一プロバイダーなら
     * userId は webhook と一致する。
     */
    private function verifyUserId(string $accessToken): ?string
    {
        try {
            $response = Http::withToken($accessToken)
                ->acceptJson()
                ->timeout(10)
                ->get('https://api.line.me/v2/profile');

            if ($response->successful()) {
                return $response->json('userId');
            }
        } catch (Throwable $e) {
            Log::warning('LIFF profile verify failed', ['error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * QR のチャネルの basic_id から友だち追加 URL を組み立てる。
     */
    private function friendAddUrl(QrAction $qr): string
    {
        $basicId = $qr->lineChannel?->basic_id;
        if ($basicId) {
            return 'https://line.me/R/ti/p/'.rawurlencode($basicId);
        }

        return rtrim((string) config('line.public_base_url'), '/').'/';
    }
}
