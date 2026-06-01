<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user()?->only(['id', 'name', 'email']),
            ],
            'channels' => fn () => $request->user()
                ? \App\Models\LineChannel::where('is_active', true)
                    ->get(['id', 'name', 'basic_id', 'channel_id', 'is_active'])
                    ->values()
                : [],
            'tags' => fn () => $request->user()
                ? \App\Models\Tag::orderBy('name')->get(['id', 'organization_id', 'name', 'color'])->values()
                : [],
            'chatStatuses' => fn () => $request->user()
                ? \App\Models\ChatStatus::orderBy('sort_order')->get(['id', 'organization_id', 'name', 'color', 'sort_order'])->values()
                : [],
            'chatSettings' => fn () => $request->user()
                ? (\App\Models\ChatSetting::first()?->toPayload()
                    ?? \App\Models\ChatSetting::defaultPayload())
                : \App\Models\ChatSetting::defaultPayload(),
            'flash' => [
                'success' => fn () => $request->session()->get('flash.success'),
                'error' => fn () => $request->session()->get('flash.error'),
                'sent' => fn () => $request->session()->get('flash.sent'),
            ],
        ];
    }
}
