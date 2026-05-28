<?php

namespace App\Http\Controllers;

use App\Models\ChannelHealthLog;
use App\Models\LineChannel;
use App\Services\Line\ChannelHealthMonitor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BanDetectionController extends Controller
{
    public function index(): Response
    {
        $channels = LineChannel::orderBy('id')->get();

        $logs = ChannelHealthLog::whereIn('line_channel_id', $channels->pluck('id'))
            ->orderByDesc('checked_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $grouped = $logs->groupBy('line_channel_id')
            ->map(fn ($items) => $items->take(10)->values());

        return Inertia::render('BanDetection/Index', [
            'channelHealth' => $channels->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'basic_id' => $c->basic_id,
                'channel_id' => $c->channel_id,
                'is_active' => $c->is_active,
                'risk_level' => $c->risk_level,
                'last_health_checked_at' => $c->last_health_checked_at?->toIso8601String(),
                'last_health_error' => $c->last_health_error,
            ]),
            'logsByChannel' => $grouped,
        ]);
    }

    public function runCheck(Request $request, ChannelHealthMonitor $monitor): RedirectResponse
    {
        $request->validate([
            'line_channel_id' => ['nullable', 'integer', 'exists:line_channels,id'],
        ]);

        $query = LineChannel::query();
        if ($id = $request->integer('line_channel_id')) {
            $query->where('id', $id);
        }

        $channels = $query->get();
        $count = 0;
        foreach ($channels as $channel) {
            $monitor->check($channel);
            $count++;
        }

        return back()->with('flash.success', "{$count} 件のチャネルをチェックしました");
    }

    public function switchActive(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_channel_id' => ['required', 'integer', 'exists:line_channels,id'],
            'to_channel_id' => ['required', 'integer', 'exists:line_channels,id', 'different:from_channel_id'],
        ]);

        $from = LineChannel::findOrFail($validated['from_channel_id']);
        $to = LineChannel::findOrFail($validated['to_channel_id']);

        if ($from->organization_id !== $to->organization_id) {
            return back()->with('flash.error', '同じ組織のチャネル間でのみ切替できます');
        }

        $from->update(['is_active' => false]);
        $to->update(['is_active' => true]);

        return back()->with(
            'flash.success',
            "「{$from->name}」を停止し「{$to->name}」を有効化しました",
        );
    }
}
