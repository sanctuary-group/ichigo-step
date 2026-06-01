<?php

namespace App\Http\Controllers;

use App\Models\LineChannel;
use App\Models\QrAction;
use App\Models\QrActionFolder;
use App\Models\Scenario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class QrActionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureDefaultFolder();

        $folders = QrActionFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount('qrActions')
            ->get();

        $folderId = $request->integer('folder') ?: $folders->first()?->id;
        $query = trim((string) $request->query('q', ''));

        $qrActions = QrAction::with(['folder', 'actionTag', 'actionScenario'])
            ->when($folderId, fn ($q) => $q->where('qr_action_folder_id', $folderId))
            ->when($query !== '', fn ($q) => $q->where('name', 'like', "%{$query}%"))
            ->orderByDesc('id')
            ->get()
            ->map(fn (QrAction $q) => [
                ...$q->toArray(),
                'public_url' => $this->publicUrl($q),
            ]);

        return Inertia::render('QrActions/Index', [
            'qrActions' => $qrActions,
            'folders' => $folders,
            'filters' => ['folder' => $folderId, 'q' => $query],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureDefaultFolder();

        return Inertia::render('QrActions/Form', [
            'qrAction' => null,
            'folders' => $this->folderOptions(),
            'scenarios' => $this->scenarioOptions(),
            'defaultName' => trim((string) $request->query('name', '')),
            'defaultFolderId' => $request->integer('folder')
                ?: QrActionFolder::orderBy('is_system', 'desc')->orderBy('sort_order')->value('id'),
            'defaultAudience' => in_array($request->query('audience'), ['new', 'all'], true)
                ? $request->query('audience')
                : 'new',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request, includeAudience: true);

        $qrAction = QrAction::create([
            'line_channel_id' => LineChannel::where('is_active', true)->value('id'),
            'qr_action_folder_id' => $validated['qr_action_folder_id'],
            'token' => $this->uniqueToken(),
            'name' => $validated['name'],
            'audience' => $validated['audience'],
            'action_type' => $validated['action_type'],
            'action_tag_id' => $validated['action_type'] === 'add_tag' ? ($validated['action_tag_id'] ?? null) : null,
            'action_scenario_id' => $validated['action_type'] === 'start_scenario' ? ($validated['action_scenario_id'] ?? null) : null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('qrActions.edit', $qrAction)
            ->with('flash.success', 'QRコードアクションを作成しました');
    }

    public function edit(QrAction $qrAction): Response
    {
        $qrAction->load(['folder', 'actionTag', 'actionScenario', 'lineChannel']);

        return Inertia::render('QrActions/Form', [
            'qrAction' => [
                ...$qrAction->toArray(),
                'public_url' => $this->publicUrl($qrAction),
                'image_url' => $this->publicUrl($qrAction).'/image',
            ],
            'folders' => $this->folderOptions(),
            'scenarios' => $this->scenarioOptions(),
            'defaultFolderId' => $qrAction->qr_action_folder_id,
        ]);
    }

    public function update(Request $request, QrAction $qrAction): RedirectResponse
    {
        // audience は作成後変更不可
        $validated = $this->validatePayload($request, includeAudience: false);

        $qrAction->update([
            'qr_action_folder_id' => $validated['qr_action_folder_id'],
            'name' => $validated['name'],
            'action_type' => $validated['action_type'],
            'action_tag_id' => $validated['action_type'] === 'add_tag' ? ($validated['action_tag_id'] ?? null) : null,
            'action_scenario_id' => $validated['action_type'] === 'start_scenario' ? ($validated['action_scenario_id'] ?? null) : null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return back()->with('flash.success', 'QRコードアクションを更新しました');
    }

    public function destroy(QrAction $qrAction): RedirectResponse
    {
        $qrAction->delete();

        return redirect()->route('qrActions.index')->with('flash.success', '削除しました');
    }

    public function toggleActive(QrAction $qrAction): RedirectResponse
    {
        $qrAction->update(['is_active' => ! $qrAction->is_active]);

        return back()->with(
            'flash.success',
            $qrAction->is_active ? '稼働を開始しました' : '停止しました',
        );
    }

    private function validatePayload(Request $request, bool $includeAudience): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:50'],
            'qr_action_folder_id' => ['required', 'integer', 'exists:qr_action_folders,id'],
            'action_type' => ['required', 'in:none,add_tag,start_scenario,track_source'],
            'action_tag_id' => ['nullable', 'integer', 'exists:tags,id', 'required_if:action_type,add_tag'],
            'action_scenario_id' => ['nullable', 'integer', 'exists:scenarios,id', 'required_if:action_type,start_scenario'],
            'is_active' => ['boolean'],
        ];
        if ($includeAudience) {
            $rules['audience'] = ['required', 'in:new,all'];
        }

        return $request->validate($rules);
    }

    private function publicUrl(QrAction $qrAction): string
    {
        $base = rtrim((string) config('line.public_base_url'), '/');

        return $base.'/qr/'.$qrAction->token;
    }

    private function uniqueToken(): string
    {
        do {
            $token = Str::random(40);
        } while (QrAction::withoutGlobalScopes()->where('token', $token)->exists());

        return $token;
    }

    private function scenarioOptions()
    {
        return Scenario::orderBy('name')->get(['id', 'name']);
    }

    private function folderOptions()
    {
        return QrActionFolder::orderBy('is_system', 'desc')
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

        QrActionFolder::firstOrCreate(
            ['organization_id' => $orgId, 'is_system' => true],
            ['name' => '未分類', 'sort_order' => 0],
        );
    }
}
