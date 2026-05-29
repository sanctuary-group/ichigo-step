<?php

namespace App\Http\Controllers;

use App\Models\AutoReply;
use App\Models\AutoReplyFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AutoReplyController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureDefaultFolder();

        $folders = AutoReplyFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount('autoReplies')
            ->get();

        $folderId = $request->integer('folder') ?: $folders->first()?->id;

        $autoReplies = AutoReply::with('folder')
            ->when($folderId, fn ($q) => $q->where('auto_reply_folder_id', $folderId))
            ->orderByDesc('id')
            ->get();

        return Inertia::render('AutoReplies/Index', [
            'autoReplies' => $autoReplies,
            'folders' => $folders,
            'filters' => ['folder' => $folderId],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureDefaultFolder();

        return Inertia::render('AutoReplies/Form', [
            'autoReply' => null,
            'folders' => $this->folderOptions(),
            'defaultFolderId' => $request->integer('folder')
                ?: AutoReplyFolder::orderBy('is_system', 'desc')->orderBy('sort_order')->value('id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request);
        AutoReply::create($this->attributes($validated));

        return redirect()->route('autoReplies.index')
            ->with('flash.success', '自動応答を作成しました');
    }

    public function edit(AutoReply $autoReply): Response
    {
        $autoReply->load('folder');

        return Inertia::render('AutoReplies/Form', [
            'autoReply' => $autoReply->toArray(),
            'folders' => $this->folderOptions(),
            'defaultFolderId' => $autoReply->auto_reply_folder_id,
        ]);
    }

    public function update(Request $request, AutoReply $autoReply): RedirectResponse
    {
        $validated = $this->validatePayload($request);
        $autoReply->update($this->attributes($validated));

        return redirect()->route('autoReplies.index')
            ->with('flash.success', '自動応答を更新しました');
    }

    public function destroy(AutoReply $autoReply): RedirectResponse
    {
        $autoReply->delete();

        return back()->with('flash.success', '削除しました');
    }

    public function toggleActive(AutoReply $autoReply): RedirectResponse
    {
        $autoReply->update(['is_active' => ! $autoReply->is_active]);

        return back()->with(
            'flash.success',
            $autoReply->is_active ? '稼働を開始しました' : '停止しました',
        );
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:10240']]);
        $path = $request->file('image')->store('auto-replies', 'public');
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
            'auto_reply_folder_id' => ['required', 'integer', 'exists:auto_reply_folders,id'],
            'trigger_type' => ['required', 'in:all,keyword,follow'],
            'match_mode' => ['required', 'in:partial,exact'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:200'],
            'exclude_bracket' => ['boolean'],
            'audience' => ['required', 'in:active,blocked'],
            'schedule_type' => ['required', 'in:always,business,custom'],
            'schedule_start' => ['nullable', 'date', 'required_if:schedule_type,custom'],
            'schedule_end' => ['nullable', 'date', 'after_or_equal:schedule_start'],
            'action_mode' => ['required', 'in:once,repeat'],
            'message_type' => ['required', 'in:text,image'],
            'text_content' => ['nullable', 'string', 'max:5000', 'required_if:message_type,text'],
            'image_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://', 'required_if:message_type,image'],
            'image_preview_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://'],
            'is_active' => ['boolean'],
        ]);
    }

    private function attributes(array $v): array
    {
        $isKeyword = $v['trigger_type'] === 'keyword';

        return [
            'auto_reply_folder_id' => $v['auto_reply_folder_id'],
            'trigger_type' => $v['trigger_type'],
            'match_mode' => $v['match_mode'],
            'keywords' => $isKeyword
                ? array_values(array_filter(
                    $v['keywords'] ?? [],
                    fn ($k) => trim((string) $k) !== '',
                ))
                : [],
            'exclude_bracket' => (bool) ($v['exclude_bracket'] ?? false),
            'audience' => $v['audience'],
            'schedule_type' => $v['schedule_type'],
            'schedule_start' => $v['schedule_type'] === 'custom' ? ($v['schedule_start'] ?? null) : null,
            'schedule_end' => $v['schedule_type'] === 'custom' ? ($v['schedule_end'] ?? null) : null,
            'action_mode' => $v['action_mode'],
            'message_type' => $v['message_type'],
            'text_content' => $v['message_type'] === 'text' ? ($v['text_content'] ?? '') : null,
            'image_url' => $v['message_type'] === 'image' ? ($v['image_url'] ?? null) : null,
            'image_preview_url' => $v['message_type'] === 'image'
                ? ($v['image_preview_url'] ?? $v['image_url'] ?? null)
                : null,
            'is_active' => (bool) ($v['is_active'] ?? true),
        ];
    }

    private function folderOptions()
    {
        return AutoReplyFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name', 'is_system']);
    }

    private function ensureDefaultFolder(): void
    {
        $orgId = auth()->user()?->current_organization_id;
        if (! $orgId) {
            return;
        }

        AutoReplyFolder::firstOrCreate(
            ['organization_id' => $orgId, 'is_system' => true],
            ['name' => '未分類', 'sort_order' => 0],
        );
    }
}
