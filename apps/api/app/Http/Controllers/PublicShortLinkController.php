<?php

namespace App\Http\Controllers;

use App\Models\ShortLink;
use Illuminate\Http\RedirectResponse;

class PublicShortLinkController extends Controller
{
    public function redirect(string $token): RedirectResponse
    {
        $link = ShortLink::withoutGlobalScopes()
            ->where('token', $token)
            ->firstOrFail();

        // クリック計測（URL分析用）
        $link->forceFill([
            'click_count' => $link->click_count + 1,
            'last_clicked_at' => now(),
        ])->save();

        return redirect()->away($link->original_url);
    }
}
