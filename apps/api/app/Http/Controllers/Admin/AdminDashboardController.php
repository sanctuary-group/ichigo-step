<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Friend;
use App\Models\LineChannel;
use App\Models\Message;
use App\Models\Organization;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $from = Carbon::now()->subDays(29)->startOfDay();
        $days = collect(range(0, 29))
            ->map(fn ($i) => $from->copy()->addDays($i)->format('Y-m-d'));

        $newByDay = Organization::whereBetween('created_at', [$from, Carbon::now()])
            ->selectRaw('DATE(created_at) d, COUNT(*) c')
            ->groupBy('d')
            ->pluck('c', 'd');

        $recent = Organization::orderByDesc('id')
            ->limit(6)
            ->get(['id', 'name', 'plan', 'is_active', 'created_at'])
            ->map(fn (Organization $o) => [
                'id' => $o->id,
                'name' => $o->name,
                'plan' => $o->plan,
                'status' => $o->is_active ? 'active' : 'suspended',
                'created_at' => $o->created_at->toIso8601String(),
            ]);

        return Inertia::render('Admin/Dashboard/Index', [
            'kpis' => [
                'total_agencies' => Organization::count(),
                'active_agencies' => Organization::where('is_active', true)->count(),
                'total_channels' => LineChannel::withoutGlobalScopes()->count(),
                'total_friends' => Friend::withoutGlobalScopes()->count(),
                'monthly_messages' => Message::withoutGlobalScopes()
                    ->where('created_at', '>=', $from)->count(),
            ],
            'newAgencySeries' => $days
                ->map(fn ($d) => ['date' => $d, 'value' => (int) ($newByDay[$d] ?? 0)])
                ->all(),
            'recentAgencies' => $recent,
        ]);
    }
}
