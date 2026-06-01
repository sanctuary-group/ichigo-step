<?php

namespace App\Http\Controllers;

use App\Models\Broadcast;
use App\Models\Friend;
use App\Models\FriendScenario;
use App\Models\Message;
use App\Models\Scenario;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $from = $now->copy()->subDays(29)->startOfDay();   // 直近30日（当日含む）
        $prevFrom = $from->copy()->subDays(30);            // 前30日
        $prevTo = $from->copy()->subSecond();

        $followingTotal = Friend::where('is_following', true)->count();

        $newCur = Friend::whereBetween('followed_at', [$from, $now])->count();
        $newPrev = Friend::whereBetween('followed_at', [$prevFrom, $prevTo])->count();

        $blockCur = Friend::whereBetween('unfollowed_at', [$from, $now])->count();
        $blockPrev = Friend::whereBetween('unfollowed_at', [$prevFrom, $prevTo])->count();

        $msgCur = Message::where('direction', 'outgoing')
            ->whereBetween('created_at', [$from, $now])->count();
        $msgPrev = Message::where('direction', 'outgoing')
            ->whereBetween('created_at', [$prevFrom, $prevTo])->count();

        $days = collect(range(0, 29))
            ->map(fn ($i) => $from->copy()->addDays($i)->format('Y-m-d'));

        $recentBroadcasts = Broadcast::with('targetTag')
            ->orderByRaw('COALESCE(sent_at, scheduled_at, created_at) DESC')
            ->limit(5)
            ->get()
            ->map(fn (Broadcast $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'preview' => mb_strimwidth((string) $b->text_content, 0, 50, '…'),
                'status' => $b->status,
                'tag' => $b->targetTag
                    ? [
                        'id' => $b->targetTag->id,
                        'organization_id' => $b->targetTag->organization_id,
                        'name' => $b->targetTag->name,
                        'color' => $b->targetTag->color,
                    ]
                    : null,
            ]);

        $activeCounts = FriendScenario::whereIn('status', ['active', 'delivering'])
            ->selectRaw('scenario_id, COUNT(*) as c')
            ->groupBy('scenario_id')
            ->pluck('c', 'scenario_id');

        $activeScenarios = Scenario::where('is_active', true)
            ->withCount('steps')
            ->orderByDesc('id')
            ->limit(6)
            ->get()
            ->map(fn (Scenario $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'steps_count' => $s->steps_count,
                'enrolled_count' => (int) ($activeCounts[$s->id] ?? 0),
            ]);

        return Inertia::render('Dashboard/Index', [
            'kpis' => [
                ['label' => '友だち合計', 'value' => $followingTotal, 'unit' => '人', 'diff' => null],
                ['label' => '新規追加（30日）', 'value' => $newCur, 'unit' => '人', 'diff' => $this->diff($newCur, $newPrev)],
                ['label' => 'ブロック（30日）', 'value' => $blockCur, 'unit' => '人', 'diff' => $this->diff($blockCur, $blockPrev)],
                ['label' => '送信メッセージ（30日）', 'value' => $msgCur, 'unit' => '件', 'diff' => $this->diff($msgCur, $msgPrev)],
            ],
            'followerSeries' => $this->dailySeries($days, 'friends', 'followed_at', ['is_following_any' => true]),
            'blockSeries' => $this->dailySeries($days, 'friends', 'unfollowed_at'),
            'messageSeries' => $this->dailySeries($days, 'messages', 'created_at', ['direction' => 'outgoing']),
            'recentBroadcasts' => $recentBroadcasts,
            'activeScenarios' => $activeScenarios,
        ]);
    }

    private function diff(int $cur, int $prev): ?float
    {
        if ($prev === 0) {
            return $cur === 0 ? 0.0 : null; // 前期間0かつ今期間ありは「—」表示
        }

        return round((($cur - $prev) / $prev) * 100, 1);
    }

    /**
     * 直近30日を日別カウントにし、欠損日を0で埋めた配列を返す。
     * 返り値: [['date' => '2026-06-01', 'value' => 3], ...]
     */
    private function dailySeries(Collection $days, string $table, string $dateColumn, array $where = []): array
    {
        $query = match ($table) {
            'friends' => Friend::query(),
            'messages' => Message::query(),
        };

        if (isset($where['direction'])) {
            $query->where('direction', $where['direction']);
        }
        // is_following_any: フィルタなし（追加日ベースで全件カウント）

        $start = Carbon::parse($days->first())->startOfDay();
        $end = Carbon::parse($days->last())->endOfDay();

        $counts = $query
            ->whereNotNull($dateColumn)
            ->whereBetween($dateColumn, [$start, $end])
            ->selectRaw("DATE({$dateColumn}) as d, COUNT(*) as c")
            ->groupBy('d')
            ->pluck('c', 'd');

        return $days
            ->map(fn (string $day) => [
                'date' => $day,
                'value' => (int) ($counts[$day] ?? 0),
            ])
            ->all();
    }
}
