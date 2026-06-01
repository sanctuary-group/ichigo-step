<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Friend;
use App\Models\LineChannel;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ChannelAnalyticsController extends Controller
{
    /** 推移グラフ（上位N件）の系列数と色パレット */
    private const TREND_TOP_N = 5;

    private const PALETTE = [
        '#22c55e', // green
        '#3b82f6', // blue
        '#f59e0b', // amber
        '#a855f7', // purple
        '#ef4444', // red
    ];

    public function index(Request $request): Response
    {
        $days = in_array((int) $request->query('days'), [7, 30, 90], true)
            ? (int) $request->query('days')
            : 30;

        $start = Carbon::today()->subDays($days - 1)->startOfDay();
        $end = Carbon::now();

        // チャネル別の期間集計（グローバルスコープ無視で横断）
        $adds = $this->countByChannel(
            Friend::class,
            fn ($q) => $q->whereBetween('followed_at', [$start, $end]),
        );
        $blocks = $this->countByChannel(
            Friend::class,
            fn ($q) => $q->whereBetween('unfollowed_at', [$start, $end]),
        );
        $activeNow = $this->countByChannel(
            Friend::class,
            fn ($q) => $q->where('is_following', true),
        );
        $messages = $this->countByChannel(
            Message::class,
            fn ($q) => $q->whereBetween('created_at', [$start, $end]),
        );

        $channels = LineChannel::withoutGlobalScopes()
            ->with('organization:id,name')
            ->get(['id', 'name', 'basic_id', 'organization_id', 'is_active', 'risk_level']);

        $rows = $channels->map(function (LineChannel $c) use ($adds, $blocks, $activeNow, $messages) {
            $a = (int) ($adds[$c->id] ?? 0);
            $b = (int) ($blocks[$c->id] ?? 0);
            $net = $a - $b;
            $active = (int) ($activeNow[$c->id] ?? 0);
            // 期首友だち数（概算）= 現在の有効友だち − 期間純増
            $baseline = max(0, $active - $net);

            return [
                'id' => $c->id,
                'name' => $c->name,
                'basic_id' => $c->basic_id,
                'organization_id' => $c->organization_id,
                'agency_name' => $c->organization?->name,
                'is_active' => (bool) $c->is_active,
                'risk_level' => $c->risk_level,
                'adds' => $a,
                'blocks' => $b,
                'net' => $net,
                'active_now' => $active,
                'messages' => (int) ($messages[$c->id] ?? 0),
                'growth_rate' => $baseline > 0
                    ? round($net / $baseline * 100, 1)
                    : null,
            ];
        })
            ->sortByDesc('net')
            ->values();

        return Inertia::render('Admin/Channels/Analytics', [
            'days' => $days,
            'kpis' => [
                'net' => (int) $rows->sum('net'),
                'adds' => (int) $rows->sum('adds'),
                'blocks' => (int) $rows->sum('blocks'),
                'channels' => $rows->count(),
            ],
            'channels' => $rows,
            'trend' => $this->buildTrend($rows, $start, $days),
        ]);
    }

    /**
     * line_channel_id ごとの件数を返す（グローバルスコープ無視）。
     */
    private function countByChannel(string $modelClass, callable $constrain)
    {
        $query = $modelClass::withoutGlobalScopes()
            ->selectRaw('line_channel_id, COUNT(*) as c')
            ->groupBy('line_channel_id');

        $constrain($query);

        return $query->pluck('c', 'line_channel_id');
    }

    /**
     * 純増上位 N チャネルの「日次新規追加数」をゼロ埋め系列で返す（MiniLineChart 形式）。
     * 日付は JST 揃え（DATE(followed_at + INTERVAL 9 HOUR)）。
     */
    private function buildTrend($rows, Carbon $start, int $days): array
    {
        $top = $rows->take(self::TREND_TOP_N)->values();
        if ($top->isEmpty()) {
            return [];
        }

        $dates = collect(range(0, $days - 1))
            ->map(fn ($i) => $start->copy()->addDays($i)->format('Y-m-d'));

        $end = Carbon::now();
        $topIds = $top->pluck('id')->all();

        $addsByChannelDate = Friend::withoutGlobalScopes()
            ->whereIn('line_channel_id', $topIds)
            ->whereBetween('followed_at', [$start, $end])
            ->selectRaw('line_channel_id, DATE(followed_at + INTERVAL 9 HOUR) d, COUNT(*) c')
            ->groupBy('line_channel_id', 'd')
            ->get()
            ->groupBy('line_channel_id');

        return $top->map(function ($row, $i) use ($dates, $addsByChannelDate) {
            $byDate = ($addsByChannelDate[$row['id']] ?? collect())
                ->pluck('c', 'd');

            return [
                'label' => $row['name'],
                'color' => self::PALETTE[$i % count(self::PALETTE)],
                'data' => $dates
                    ->map(fn ($d) => ['date' => $d, 'value' => (int) ($byDate[$d] ?? 0)])
                    ->all(),
            ];
        })->all();
    }
}
