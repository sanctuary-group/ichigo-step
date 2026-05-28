<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\FriendScenario;
use App\Models\Scenario;
use App\Models\ScenarioFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ScenarioController extends Controller
{
    public function index(Request $request): Response
    {
        $folders = ScenarioFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount('scenarios')
            ->get();

        $folderId = $request->integer('folder') ?: $folders->first()?->id;
        $query = trim((string) $request->query('q', ''));

        $scenarios = Scenario::with(['steps', 'triggerTag', 'lineChannel', 'folder'])
            ->withCount(['friendScenarios as active_count' => fn ($q) => $q->where('status', 'active')])
            ->withCount(['friendScenarios as completed_count' => fn ($q) => $q->where('status', 'completed')])
            ->withCount(['friendScenarios as terminated_count' => fn ($q) => $q->whereIn('status', ['paused', 'failed'])])
            ->when($folderId, fn ($q) => $q->where('scenario_folder_id', $folderId))
            ->when($query !== '', function ($q) use ($query) {
                $q->where(function ($qq) use ($query) {
                    $qq->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });
            })
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Scenarios/Index', [
            'scenarios' => $scenarios,
            'folders' => $folders,
            'filters' => ['folder' => $folderId, 'q' => $query],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Scenarios/Form', [
            'scenario' => null,
            'defaultFolderId' => $request->integer('folder') ?: ScenarioFolder::orderBy('is_system', 'desc')->orderBy('sort_order')->value('id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request);

        $scenario = DB::transaction(function () use ($validated) {
            $scenario = Scenario::create([
                'line_channel_id' => $validated['line_channel_id'],
                'scenario_folder_id' => $validated['scenario_folder_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'trigger_type' => $validated['trigger_type'],
                'trigger_tag_id' => $validated['trigger_tag_id'] ?? null,
                'is_active' => (bool) ($validated['is_active'] ?? false),
            ]);
            $this->syncSteps($scenario, $validated['steps']);
            return $scenario;
        });

        return redirect()->route('scenarios.edit', $scenario)
            ->with('flash.success', 'シナリオを作成しました');
    }

    public function edit(Scenario $scenario): Response
    {
        $scenario->load(['steps', 'triggerTag', 'lineChannel', 'folder']);

        $friends = Friend::where('line_channel_id', $scenario->line_channel_id)
            ->where('is_following', true)
            ->orderByDesc('followed_at')
            ->limit(200)
            ->get(['id', 'display_name', 'system_display_name', 'line_user_id']);

        $enrolledFriendIds = FriendScenario::where('scenario_id', $scenario->id)
            ->pluck('id', 'friend_id');

        return Inertia::render('Scenarios/Form', [
            'scenario' => $scenario,
            'defaultFolderId' => $scenario->scenario_folder_id,
            'enrollableFriends' => $friends,
            'enrolledFriendIds' => $enrolledFriendIds->keys()->values(),
        ]);
    }

    public function update(Request $request, Scenario $scenario): RedirectResponse
    {
        $validated = $this->validatePayload($request);

        DB::transaction(function () use ($scenario, $validated) {
            $scenario->update([
                'line_channel_id' => $validated['line_channel_id'],
                'scenario_folder_id' => $validated['scenario_folder_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'trigger_type' => $validated['trigger_type'],
                'trigger_tag_id' => $validated['trigger_tag_id'] ?? null,
                'is_active' => (bool) ($validated['is_active'] ?? false),
            ]);
            $this->syncSteps($scenario, $validated['steps']);
        });

        return back()->with('flash.success', 'シナリオを更新しました');
    }

    public function destroy(Scenario $scenario): RedirectResponse
    {
        $scenario->delete();
        return redirect()->route('scenarios.index')
            ->with('flash.success', '削除しました');
    }

    public function toggleActive(Scenario $scenario): RedirectResponse
    {
        $scenario->update(['is_active' => ! $scenario->is_active]);
        return back()->with(
            'flash.success',
            $scenario->is_active ? 'シナリオを稼働開始しました' : 'シナリオを停止しました',
        );
    }

    public function manualEnroll(Request $request, Scenario $scenario): RedirectResponse
    {
        if ($scenario->steps()->count() === 0) {
            return back()->with('flash.error', 'ステップが登録されていないため開始できません');
        }

        $firstStep = $scenario->steps()->orderBy('step_order')->first();
        $now = now();
        $nextDeliveryAt = $firstStep->computeDeliveryAt($now);

        $friends = Friend::where('line_channel_id', $scenario->line_channel_id)
            ->where('is_following', true)
            ->get();

        if ($friends->isEmpty()) {
            return back()->with('flash.error', 'このシナリオの LINE チャネルに有効な友だちがいません');
        }

        $count = 0;
        foreach ($friends as $friend) {
            FriendScenario::withoutGlobalScopes()->updateOrCreate(
                ['friend_id' => $friend->id, 'scenario_id' => $scenario->id],
                [
                    'organization_id' => $friend->organization_id,
                    'current_step_order' => 0,
                    'status' => 'active',
                    'started_at' => $now,
                    'next_delivery_at' => $nextDeliveryAt,
                    'completed_at' => null,
                    'error_message' => null,
                ],
            );
            $count++;
        }

        $when = $nextDeliveryAt->equalTo($now)
            ? '次回 cron (約 1 分以内)'
            : $nextDeliveryAt->format('Y/m/d H:i');

        return back()->with(
            'flash.success',
            "{$count} 名の友だちをシナリオに登録しました。1 通目は {$when} に配信されます",
        );
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:10240']]);
        $path = $request->file('image')->store('scenarios', 'public');
        $baseUrl = rtrim((string) config('line.public_base_url'), '/');
        $url = $baseUrl.'/storage/'.$path;
        if (! str_starts_with($url, 'https://')) {
            return response()->json([
                'error' => "画像配信には HTTPS の公開 URL が必要です（現状: {$url}）",
            ], 422);
        }
        return response()->json(['url' => $url]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'line_channel_id' => ['required', 'integer', 'exists:line_channels,id'],
            'scenario_folder_id' => ['required', 'integer', 'exists:scenario_folders,id'],
            'trigger_type' => ['required', 'in:friend_add,tag_added'],
            'trigger_tag_id' => ['nullable', 'integer', 'exists:tags,id', 'required_if:trigger_type,tag_added'],
            'is_active' => ['boolean'],
            'steps' => ['required', 'array', 'min:1'],
            'steps.*.delay_minutes' => ['required', 'integer', 'min:0', 'max:525600'],
            'steps.*.timing_mode' => ['required', 'in:immediate,datetime,elapsed'],
            'steps.*.message_type' => ['required', 'in:text,image'],
            'steps.*.text_content' => ['nullable', 'string', 'max:5000', 'required_if:steps.*.message_type,text'],
            'steps.*.image_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://', 'required_if:steps.*.message_type,image'],
            'steps.*.image_preview_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://'],
        ]);
    }

    private function syncSteps(Scenario $scenario, array $steps): void
    {
        // 全削除 → 再作成 (シンプル)
        $scenario->steps()->delete();
        foreach ($steps as $i => $s) {
            $scenario->steps()->create([
                'step_order' => $i + 1,
                'delay_minutes' => (int) $s['delay_minutes'],
                'timing_mode' => $s['timing_mode'],
                'message_type' => $s['message_type'],
                'text_content' => $s['message_type'] === 'text' ? ($s['text_content'] ?? '') : null,
                'image_url' => $s['message_type'] === 'image' ? ($s['image_url'] ?? null) : null,
                'image_preview_url' => $s['message_type'] === 'image'
                    ? ($s['image_preview_url'] ?? $s['image_url'] ?? null)
                    : null,
            ]);
        }
    }
}
