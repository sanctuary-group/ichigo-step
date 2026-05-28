<?php

namespace App\Http\Controllers;

use App\Models\ChatStatus;
use App\Models\Friend;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Home/Index', [
            'friendDailyRows' => $this->buildFriendDailyRows(),
            'statusBuckets' => $this->buildStatusBuckets(),
        ]);
    }

    /**
     * 直近 7 日間の友だち数推移
     */
    private function buildFriendDailyRows(): array
    {
        $today = Carbon::today();
        $rows = [];

        for ($i = 0; $i < 7; $i++) {
            $day = $today->copy()->subDays($i);
            $start = $day->copy()->startOfDay();
            $end = $day->copy()->endOfDay();

            $added = Friend::whereBetween('followed_at', [$start, $end])->count();
            $blocked = Friend::whereBetween('unfollowed_at', [$start, $end])->count();
            // その日の終了時点で is_following=true の友だち
            $active = Friend::where('followed_at', '<=', $end)
                ->where(function ($q) use ($end) {
                    $q->whereNull('unfollowed_at')
                        ->orWhere('unfollowed_at', '>', $end);
                })
                ->count();
            $total = Friend::where('followed_at', '<=', $end)->count();

            $rows[] = [
                'date' => $day->format('Y年m月d日'),
                'weekday' => ['日', '月', '火', '水', '木', '金', '土'][$day->dayOfWeek],
                'added' => $added,
                'blocked' => $blocked,
                'diff' => $added - $blocked,
                'active' => $active,
                'total' => $total,
            ];
        }

        return $rows;
    }

    /**
     * 対応ステータス別の友だち人数 (chat_statuses + 「未設定」)
     */
    private function buildStatusBuckets(): array
    {
        $statuses = ChatStatus::orderBy('sort_order')->orderBy('id')->get();
        $buckets = [];

        foreach ($statuses as $s) {
            $count = Friend::where('chat_status_id', $s->id)
                ->where('is_following', true)
                ->count();
            $buckets[] = [
                'label' => $s->name,
                'color' => $s->color,
                'count' => $count,
            ];
        }

        $unsetCount = Friend::whereNull('chat_status_id')
            ->where('is_following', true)
            ->count();
        $buckets[] = [
            'label' => '未設定',
            'color' => '#cbd5e1',
            'count' => $unsetCount,
        ];

        return $buckets;
    }
}
