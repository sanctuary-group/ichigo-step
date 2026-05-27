<?php

namespace App\Http\Controllers;

use App\Jobs\Broadcast\DispatchBroadcastJob;
use App\Models\Broadcast;
use App\Models\Friend;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BroadcastController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->query('tab', 'scheduled');
        $tab = in_array($tab, ['scheduled', 'draft', 'history'], true) ? $tab : 'scheduled';

        $statuses = match ($tab) {
            'scheduled' => ['scheduled', 'sending'],
            'draft' => ['draft'],
            'history' => ['sent', 'failed'],
        };

        $broadcasts = Broadcast::with(['lineChannel', 'targetTag'])
            ->whereIn('status', $statuses)
            ->orderByDesc(DB::raw('COALESCE(sent_at, scheduled_at, updated_at)'))
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Broadcasts/Index', [
            'broadcasts' => $broadcasts,
            'tab' => $tab,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Broadcasts/Form', [
            'broadcast' => null,
            'activeFriendsCount' => $this->activeFriendsCount(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->save($request, null);
    }

    public function edit(Broadcast $broadcast): Response
    {
        if (! in_array($broadcast->status, ['draft', 'scheduled'], true)) {
            abort(403, '配信済み・送信中のものは編集できません');
        }

        return Inertia::render('Broadcasts/Form', [
            'broadcast' => $broadcast->load('targetTag'),
            'activeFriendsCount' => $this->activeFriendsCount(),
        ]);
    }

    public function update(Request $request, Broadcast $broadcast): RedirectResponse
    {
        if (! in_array($broadcast->status, ['draft', 'scheduled'], true)) {
            return back()->with('flash.error', '配信済み・送信中のものは編集できません');
        }
        return $this->save($request, $broadcast);
    }

    public function destroy(Broadcast $broadcast): RedirectResponse
    {
        if ($broadcast->status === 'sending') {
            return back()->with('flash.error', '送信中のものは削除できません');
        }
        $broadcast->delete();
        return back()->with('flash.success', '削除しました');
    }

    public function sendNow(Broadcast $broadcast): RedirectResponse
    {
        if (! in_array($broadcast->status, ['draft', 'scheduled'], true)) {
            return back()->with('flash.error', 'この状態からは送信できません');
        }
        $broadcast->update(['status' => 'sending', 'scheduled_at' => null]);
        DispatchBroadcastJob::dispatch($broadcast->id);
        return redirect()->route('broadcasts.index', ['tab' => 'scheduled'])
            ->with('flash.success', '配信を開始しました');
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:10240'],
        ]);

        $path = $request->file('image')->store('broadcasts', 'public');
        $baseUrl = rtrim((string) config('line.public_base_url'), '/');
        $url = $baseUrl.'/storage/'.$path;

        if (! str_starts_with($url, 'https://')) {
            return response()->json([
                'error' => "画像配信には HTTPS の公開 URL が必要です。LINE_PUBLIC_BASE_URL を設定してください（現状: {$url}）",
            ], 422);
        }

        return response()->json(['url' => $url]);
    }

    private function save(Request $request, ?Broadcast $broadcast): RedirectResponse
    {
        $action = $request->input('action', 'draft');
        $action = in_array($action, ['draft', 'schedule', 'send_now'], true) ? $action : 'draft';

        $rules = [
            'title' => ['required', 'string', 'max:50'],
            'line_channel_id' => ['required', 'integer', 'exists:line_channels,id'],
            'message_type' => ['required', 'in:text,image'],
            'text_content' => ['nullable', 'string', 'max:5000'],
            'image_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://'],
            'image_preview_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://'],
            'target_type' => ['required', 'in:all,tag'],
            'target_tag_id' => ['nullable', 'integer', 'exists:tags,id'],
            'scheduled_at' => ['nullable', 'date'],
        ];

        if ($action !== 'draft') {
            // 即時 or 予約は本格バリデーション
            if ($request->input('message_type') === 'text') {
                $rules['text_content'] = ['required', 'string', 'max:5000'];
            }
            if ($request->input('message_type') === 'image') {
                $rules['image_url'] = ['required', 'string', 'max:1024', 'starts_with:https://'];
            }
            if ($request->input('target_type') === 'tag') {
                $rules['target_tag_id'] = ['required', 'integer', 'exists:tags,id'];
            }
            if ($action === 'schedule') {
                $rules['scheduled_at'] = ['required', 'date', 'after:now'];
            }
        }

        $validated = $request->validate($rules);

        if (($validated['message_type'] ?? null) === 'text') {
            $validated['image_url'] = null;
            $validated['image_preview_url'] = null;
        } else {
            $validated['text_content'] = null;
            $validated['image_preview_url'] = $validated['image_preview_url'] ?? ($validated['image_url'] ?? null);
        }

        if (($validated['target_type'] ?? null) === 'all') {
            $validated['target_tag_id'] = null;
        }

        $validated['scheduled_at'] = isset($validated['scheduled_at'])
            ? Carbon::parse($validated['scheduled_at'])
            : null;

        $status = match ($action) {
            'send_now' => 'sending',
            'schedule' => 'scheduled',
            default => 'draft',
        };

        if ($action !== 'schedule') {
            $validated['scheduled_at'] = $action === 'send_now' ? null : ($validated['scheduled_at'] ?? null);
        }

        $payload = [...$validated, 'status' => $status];

        if ($broadcast === null) {
            $broadcast = Broadcast::create($payload);
        } else {
            $broadcast->update($payload);
        }

        if ($action === 'send_now') {
            DispatchBroadcastJob::dispatch($broadcast->id);
            return redirect()->route('broadcasts.index', ['tab' => 'scheduled'])
                ->with('flash.success', '配信を開始しました');
        }

        $tab = $action === 'schedule' ? 'scheduled' : 'draft';
        $msg = $action === 'schedule' ? '配信予約を登録しました' : '下書きを保存しました';
        return redirect()->route('broadcasts.index', ['tab' => $tab])
            ->with('flash.success', $msg);
    }

    private function activeFriendsCount(): int
    {
        return Friend::where('is_following', true)->count();
    }
}
