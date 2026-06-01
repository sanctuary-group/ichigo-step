<?php

namespace App\Http\Controllers;

use App\Http\Requests\Friend\UpdateFriendRequest;
use App\Models\Friend;
use App\Models\FriendField;
use App\Models\FriendScenario;
use App\Models\Message;
use App\Models\Scenario;
use App\Models\ScenarioStep;
use App\Services\Line\LineClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FriendController extends Controller
{
    public function index(Request $request): Response
    {
        $mode = (string) $request->query('mode', 'active');
        $search = trim((string) $request->query('q', ''));
        $tagId = $request->integer('tag') ?: null;

        $query = Friend::with('tags');

        match ($mode) {
            'hidden' => $query->where('is_hidden', true),
            'blocked' => $query->where('is_following', false),
            default => $query->where('is_following', true)->where('is_hidden', false),
        };

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                    ->orWhere('system_display_name', 'like', "%{$search}%");
            });
        }

        if ($tagId) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        $friends = $query
            ->orderByRaw('pinned_at IS NULL, pinned_at DESC')
            ->orderByDesc('followed_at')
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Friends/Index', [
            'friends' => $friends,
            'filters' => [
                'mode' => $mode,
                'q' => $search,
                'tag' => $tagId,
            ],
        ]);
    }

    public function show(Friend $friend): Response
    {
        $friend->load(['tags', 'chatStatus', 'fieldValues', 'lineChannel:id,name']);

        $friendFields = FriendField::with('folder:id,name')
            ->orderBy('friend_field_folder_id')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'friend_field_folder_id', 'name', 'field_type', 'options']);

        return Inertia::render('Friends/Show', [
            'friend' => $friend,
            'friendFields' => $friendFields,
            'messageCount' => Message::where('friend_id', $friend->id)->count(),
            'stepDelivery' => $this->stepDelivery($friend),
            'stepHistory' => $this->stepHistory($friend),
            'scenarioOptions' => Scenario::where('line_channel_id', $friend->line_channel_id)
                ->where('is_active', true)
                ->has('steps')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /** 進行中（または一時停止中）のステップ配信状況を返す。 */
    private function stepDelivery(Friend $friend): ?array
    {
        $enroll = FriendScenario::with('scenario:id,name')
            ->where('friend_id', $friend->id)
            ->whereIn('status', ['active', 'delivering', 'paused'])
            ->orderByDesc('id')
            ->first();

        if (! $enroll) {
            return null;
        }

        return [
            'scenario_name' => $enroll->scenario?->name ?? '(削除済みシナリオ)',
            'step_label' => 'ステップ '.($enroll->current_step_order + 1),
            'status' => $enroll->status,
            'next_delivery_at' => $enroll->next_delivery_at?->toIso8601String(),
        ];
    }

    /** ステップ配信の配信履歴（このシナリオ起点のメッセージ）を返す。 */
    private function stepHistory(Friend $friend): array
    {
        $messages = Message::where('friend_id', $friend->id)
            ->whereNotNull('scenario_step_id')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(100)
            ->get(['id', 'scenario_step_id', 'content', 'sent_at', 'created_at']);

        $steps = ScenarioStep::with('scenario:id,name')
            ->whereIn('id', $messages->pluck('scenario_step_id')->unique())
            ->get(['id', 'scenario_id', 'step_order'])
            ->keyBy('id');

        return $messages->map(function (Message $m) use ($steps) {
            $step = $steps->get($m->scenario_step_id);

            return [
                'id' => $m->id,
                'delivered_at' => ($m->sent_at ?? $m->created_at)->toIso8601String(),
                'scenario_name' => $step?->scenario?->name ?? '—',
                'step_label' => $step ? 'ステップ '.($step->step_order + 1) : '—',
                'count' => $step ? $step->step_order + 1 : null,
                'preview' => mb_strimwidth((string) $m->content, 0, 40, '…'),
            ];
        })->all();
    }

    public function toggleHidden(Friend $friend): RedirectResponse
    {
        $friend->forceFill(['is_hidden' => ! $friend->is_hidden])->save();

        return back(303);
    }

    public function destroy(Friend $friend): RedirectResponse
    {
        $friend->delete();

        return redirect()->route('friends.index')
            ->with('flash.success', '友だちを削除しました');
    }

    public function toggleRead(Friend $friend): RedirectResponse
    {
        $friend->forceFill([
            'unread_count' => $friend->unread_count > 0 ? 0 : 1,
        ])->save();

        return back(303);
    }

    public function update(UpdateFriendRequest $request, Friend $friend): RedirectResponse
    {
        $friend->update($request->validated());

        return back()->with('flash.success', '友だち情報を更新しました');
    }

    public function togglePin(Friend $friend): RedirectResponse
    {
        $friend->forceFill([
            'pinned_at' => $friend->pinned_at ? null : now(),
        ])->save();

        return back(303);
    }

    public function setChatStatus(Request $request, Friend $friend): RedirectResponse
    {
        $validated = $request->validate([
            'chat_status_id' => ['nullable', 'integer', 'exists:chat_statuses,id'],
        ]);

        $friend->forceFill([
            'chat_status_id' => $validated['chat_status_id'] ?? null,
        ])->save();

        return back(303);
    }

    public function refreshProfile(Friend $friend): RedirectResponse
    {
        try {
            $profile = LineClient::forChannel($friend->lineChannel)
                ->getProfile($friend->line_user_id);
        } catch (Throwable $e) {
            return back()->with('flash.error', 'プロフィール取得失敗: '.$e->getMessage());
        }

        $friend->forceFill([
            'display_name' => $profile['displayName'] ?? $friend->display_name,
            'picture_url' => $profile['pictureUrl'] ?? $friend->picture_url,
            'status_message' => $profile['statusMessage'] ?? $friend->status_message,
        ])->save();

        return back()->with('flash.success', 'LINE プロフィールを更新しました');
    }
}