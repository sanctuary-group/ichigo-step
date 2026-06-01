<?php

namespace App\Http\Controllers;

use App\Models\LineChannel;
use App\Services\Line\ChannelResolver;
use Illuminate\Http\RedirectResponse;

class PublicFriendAddController extends Controller
{
    public function __construct(private ChannelResolver $resolver) {}

    /**
     * 配布用の友だち追加リダイレクト (/add/{token})。
     *
     * public_token でチャネルを特定し、そのチャネルが BAN で停止していれば
     * 予備チャネル（fallback）を辿って「現在アクティブなチャネル」の友だち追加 URL へ飛ばす。
     * 配布済みの URL / QR を変えずに、BAN 後は新規の人を予備アカウントへ自動誘導できる。
     */
    public function redirect(string $token): RedirectResponse
    {
        $channel = LineChannel::withoutGlobalScopes()
            ->where('public_token', $token)
            ->first();

        if (! $channel) {
            abort(404);
        }

        $resolved = $this->resolver->activeFor($channel) ?? $channel;
        $basicId = $resolved->basic_id;

        if ($basicId) {
            return redirect()->away('https://line.me/R/ti/p/'.rawurlencode($basicId));
        }

        return redirect()->away(rtrim((string) config('line.public_base_url'), '/').'/');
    }
}
