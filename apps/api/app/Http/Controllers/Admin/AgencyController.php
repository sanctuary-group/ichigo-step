<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Friend;
use App\Models\LineChannel;
use App\Models\Message;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AgencyController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $plan = $request->query('plan');
        $status = $request->query('status');

        $organizations = Organization::query()
            ->withCount('users')
            ->when($q !== '', fn ($qq) => $qq->where('name', 'like', "%{$q}%"))
            ->when(in_array($plan, ['free', 'standard', 'pro'], true),
                fn ($qq) => $qq->where('plan', $plan))
            ->when($status === 'active', fn ($qq) => $qq->where('is_active', true))
            ->when($status === 'suspended', fn ($qq) => $qq->where('is_active', false))
            ->orderByDesc('id')
            ->get();

        $channelCounts = $this->countsByOrg(LineChannel::class);
        $friendCounts = $this->countsByOrg(Friend::class);
        $monthlyMessages = $this->countsByOrg(
            Message::class,
            fn ($qq) => $qq->where('created_at', '>=', Carbon::now()->subDays(30)),
        );

        $agencies = $organizations->map(fn (Organization $o) => [
            'id' => $o->id,
            'name' => $o->name,
            'plan' => $o->plan,
            'status' => $o->is_active ? 'active' : 'suspended',
            'member_count' => $o->users_count,
            'channel_count' => (int) ($channelCounts[$o->id] ?? 0),
            'friend_count' => (int) ($friendCounts[$o->id] ?? 0),
            'monthly_message_count' => (int) ($monthlyMessages[$o->id] ?? 0),
            'created_at' => $o->created_at->toIso8601String(),
        ]);

        return Inertia::render('Admin/Agencies/Index', [
            'agencies' => $agencies,
            'filters' => ['q' => $q, 'plan' => $plan ?: 'all', 'status' => $status ?: 'all'],
            'planCounts' => [
                'all' => $organizations->count(),
                'free' => Organization::where('plan', 'free')->count(),
                'standard' => Organization::where('plan', 'standard')->count(),
                'pro' => Organization::where('plan', 'pro')->count(),
            ],
        ]);
    }

    public function show(Organization $organization): Response
    {
        $members = $organization->users()
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->pivot->role,
            ]);

        $channels = LineChannel::withoutGlobalScopes()
            ->where('organization_id', $organization->id)
            ->get(['id', 'name', 'basic_id', 'is_active'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'basic_id' => $c->basic_id,
                'is_active' => (bool) $c->is_active,
            ]);

        $friendTotal = Friend::withoutGlobalScopes()
            ->where('organization_id', $organization->id)->count();
        $friendActive = Friend::withoutGlobalScopes()
            ->where('organization_id', $organization->id)
            ->where('is_following', true)->count();
        $monthlyMessages = Message::withoutGlobalScopes()
            ->where('organization_id', $organization->id)
            ->where('created_at', '>=', Carbon::now()->subDays(30))->count();

        return Inertia::render('Admin/Agencies/Show', [
            'agency' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
                'plan' => $organization->plan,
                'status' => $organization->is_active ? 'active' : 'suspended',
                'created_at' => $organization->created_at->toIso8601String(),
            ],
            'stats' => [
                'members' => $members->count(),
                'channels' => $channels->count(),
                'friends_total' => $friendTotal,
                'friends_active' => $friendActive,
                'monthly_messages' => $monthlyMessages,
            ],
            'members' => $members,
            'channels' => $channels,
        ]);
    }

    public function updateStatus(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $organization->update(['is_active' => $validated['is_active']]);

        return back()->with(
            'flash.success',
            $validated['is_active'] ? '代理店を再開しました' : '代理店を停止しました',
        );
    }

    public function updatePlan(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'in:free,standard,pro'],
        ]);

        $organization->update(['plan' => $validated['plan']]);

        return back()->with('flash.success', 'プランを変更しました');
    }

    /** organization_id ごとの件数を返すヘルパー（グローバルスコープ無視）。 */
    private function countsByOrg(string $modelClass, ?callable $constrain = null)
    {
        $query = $modelClass::withoutGlobalScopes()
            ->selectRaw('organization_id, COUNT(*) as c')
            ->groupBy('organization_id');

        if ($constrain) {
            $constrain($query);
        }

        return $query->pluck('c', 'organization_id');
    }
}
