<?php

namespace App\Http\Controllers;

use App\Models\ShortLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShortLinkController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $sort = $request->query('sort') === 'recent' ? 'recent' : 'clicks';

        $links = ShortLink::with('friend:id,display_name,system_display_name')
            ->when($q !== '', fn ($qq) => $qq->where('original_url', 'like', "%{$q}%"))
            ->when($sort === 'clicks', fn ($qq) => $qq->orderByDesc('click_count')->orderByDesc('id'))
            ->when($sort === 'recent', fn ($qq) => $qq->orderByDesc('id'))
            ->limit(200)
            ->get()
            ->map(fn (ShortLink $l) => [
                'id' => $l->id,
                'token' => $l->token,
                'original_url' => $l->original_url,
                'click_count' => $l->click_count,
                'last_clicked_at' => $l->last_clicked_at?->toIso8601String(),
                'created_at' => $l->created_at->toIso8601String(),
                'friend' => $l->friend ? [
                    'id' => $l->friend->id,
                    'name' => $l->friend->system_display_name
                        ?: $l->friend->display_name
                        ?: '(名前未取得)',
                ] : null,
            ]);

        return Inertia::render('ShortLinks/Index', [
            'links' => $links,
            'stats' => [
                'total_links' => ShortLink::count(),
                'total_clicks' => (int) ShortLink::sum('click_count'),
            ],
            'filters' => ['q' => $q, 'sort' => $sort],
            'baseUrl' => rtrim((string) config('line.public_base_url'), '/'),
        ]);
    }

    public function destroy(ShortLink $shortLink): RedirectResponse
    {
        $shortLink->delete();

        return back()->with('flash.success', '短縮URLを削除しました');
    }
}
