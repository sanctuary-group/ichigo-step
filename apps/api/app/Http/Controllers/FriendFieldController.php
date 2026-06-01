<?php

namespace App\Http\Controllers;

use App\Models\FriendField;
use App\Models\FriendFieldFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FriendFieldController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureDefaultFolder();

        $folders = FriendFieldFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount('friendFields')
            ->get();

        $folderId = $request->integer('folder') ?: $folders->first()?->id;

        $fields = FriendField::withCount('values')
            ->when($folderId, fn ($q) => $q->where('friend_field_folder_id', $folderId))
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('DataManagement/FriendFields/Index', [
            'folders' => $folders,
            'fields' => $fields,
            'filters' => ['folder' => $folderId],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureDefaultFolder();

        return Inertia::render('DataManagement/FriendFields/Form', [
            'field' => null,
            'folders' => $this->folderOptions(),
            'defaultFolderId' => $request->integer('folder')
                ?: FriendFieldFolder::orderBy('is_system', 'desc')->orderBy('sort_order')->value('id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request, isCreate: true);

        FriendField::create([
            'friend_field_folder_id' => $validated['friend_field_folder_id'],
            'name' => $validated['name'],
            'field_type' => $validated['field_type'],
            'options' => $validated['field_type'] === 'choice' ? array_values($validated['options'] ?? []) : null,
            'run_mode' => $validated['run_mode'],
        ]);

        return redirect()->route('friendFields.index', ['folder' => $validated['friend_field_folder_id']])
            ->with('flash.success', '友だち情報を作成しました');
    }

    public function edit(FriendField $friendField): Response
    {
        return Inertia::render('DataManagement/FriendFields/Form', [
            'field' => $friendField,
            'folders' => $this->folderOptions(),
            'defaultFolderId' => $friendField->friend_field_folder_id,
        ]);
    }

    public function update(Request $request, FriendField $friendField): RedirectResponse
    {
        // field_type は保存後変更不可（mockup 仕様）
        $validated = $this->validatePayload($request, isCreate: false);

        $friendField->update([
            'friend_field_folder_id' => $validated['friend_field_folder_id'],
            'name' => $validated['name'],
            'options' => $friendField->field_type === 'choice' ? array_values($validated['options'] ?? []) : null,
            'run_mode' => $validated['run_mode'],
        ]);

        return redirect()->route('friendFields.index', ['folder' => $validated['friend_field_folder_id']])
            ->with('flash.success', '友だち情報を更新しました');
    }

    public function destroy(FriendField $friendField): RedirectResponse
    {
        $folderId = $friendField->friend_field_folder_id;
        $friendField->delete();

        return redirect()->route('friendFields.index', ['folder' => $folderId])
            ->with('flash.success', '削除しました');
    }

    private function validatePayload(Request $request, bool $isCreate): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:20'],
            'friend_field_folder_id' => ['required', 'integer', 'exists:friend_field_folders,id'],
            'run_mode' => ['required', 'in:once,repeat'],
            'options' => ['nullable', 'array'],
            'options.*' => ['nullable', 'string', 'max:100'],
        ];
        if ($isCreate) {
            $rules['field_type'] = ['required', 'in:choice,text,number,date,phone,email'];
        }

        return $request->validate($rules);
    }

    private function folderOptions()
    {
        return FriendFieldFolder::orderBy('is_system', 'desc')
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

        FriendFieldFolder::firstOrCreate(
            ['organization_id' => $orgId, 'is_system' => true],
            ['name' => '未分類', 'sort_order' => 0],
        );
    }
}
