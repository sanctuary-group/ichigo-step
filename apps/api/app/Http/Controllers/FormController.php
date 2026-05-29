<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureDefaultFolder();

        $folders = FormFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount('forms')
            ->get();

        $folderId = $request->integer('folder') ?: $folders->first()?->id;
        $query = trim((string) $request->query('q', ''));

        $forms = Form::with('folder')
            ->withCount('fields')
            ->withCount('responses')
            ->when($folderId, fn ($q) => $q->where('form_folder_id', $folderId))
            ->when($query !== '', fn ($q) => $q->where('name', 'like', "%{$query}%"))
            ->orderByDesc('id')
            ->get()
            ->map(fn (Form $f) => [
                ...$f->toArray(),
                'public_url' => $this->publicUrl($f),
            ]);

        return Inertia::render('Forms/Index', [
            'forms' => $forms,
            'folders' => $folders,
            'filters' => ['folder' => $folderId, 'q' => $query],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureDefaultFolder();

        return Inertia::render('Forms/Form', [
            'form' => null,
            'folders' => $this->folderOptions(),
            'defaultName' => trim((string) $request->query('name', '')),
            'defaultFolderId' => $request->integer('folder')
                ?: FormFolder::orderBy('is_system', 'desc')->orderBy('sort_order')->value('id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request);

        $form = DB::transaction(function () use ($validated) {
            $form = Form::create([
                'form_folder_id' => $validated['form_folder_id'],
                'token' => $this->uniqueToken(),
                'name' => $validated['name'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'form_type' => $validated['form_type'],
                'submit_message' => $validated['submit_message'] ?? null,
                'status' => 'draft',
            ]);
            $this->syncFields($form, $validated['fields'] ?? []);

            return $form;
        });

        return redirect()->route('forms.edit', $form)
            ->with('flash.success', 'フォームを作成しました');
    }

    public function edit(Form $form): Response
    {
        $form->load('fields');

        return Inertia::render('Forms/Form', [
            'form' => [
                ...$form->toArray(),
                'public_url' => $this->publicUrl($form),
            ],
            'folders' => $this->folderOptions(),
            'defaultFolderId' => $form->form_folder_id,
        ]);
    }

    public function update(Request $request, Form $form): RedirectResponse
    {
        $validated = $this->validatePayload($request);

        DB::transaction(function () use ($form, $validated) {
            $form->update([
                'form_folder_id' => $validated['form_folder_id'],
                'name' => $validated['name'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'form_type' => $validated['form_type'],
                'submit_message' => $validated['submit_message'] ?? null,
            ]);
            $this->syncFields($form, $validated['fields'] ?? []);
        });

        return back()->with('flash.success', 'フォームを更新しました');
    }

    public function destroy(Form $form): RedirectResponse
    {
        $form->delete();

        return redirect()->route('forms.index')->with('flash.success', '削除しました');
    }

    public function publish(Form $form): RedirectResponse
    {
        if ($form->fields()->count() === 0) {
            return back()->with('flash.error', '質問が登録されていないため公開できません');
        }
        $form->update(['status' => 'published']);

        return back()->with('flash.success', 'フォームを公開しました');
    }

    public function unpublish(Form $form): RedirectResponse
    {
        $form->update(['status' => 'draft']);

        return back()->with('flash.success', 'フォームを下書きに戻しました');
    }

    public function responses(Form $form): Response
    {
        $form->load('fields');
        $responses = $form->responses()
            ->with('friend:id,display_name,system_display_name')
            ->orderByDesc('submitted_at')
            ->limit(500)
            ->get();

        return Inertia::render('Forms/Responses', [
            'form' => $form->toArray(),
            'fields' => $form->fields->toArray(),
            'responses' => $responses->toArray(),
        ]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'form_folder_id' => ['required', 'integer', 'exists:form_folders,id'],
            'form_type' => ['required', 'in:standard,survey,reservation'],
            'submit_message' => ['nullable', 'string', 'max:500'],
            'fields' => ['present', 'array'],
            'fields.*.label' => ['required', 'string', 'max:200'],
            'fields.*.type' => ['required', 'in:text,textarea,radio,checkbox,select,email,number,date'],
            'fields.*.required' => ['boolean'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.options.*' => ['string', 'max:200'],
        ]);
    }

    private function syncFields(Form $form, array $fields): void
    {
        $form->fields()->delete();
        foreach ($fields as $i => $f) {
            $needsOptions = in_array($f['type'], ['radio', 'checkbox', 'select'], true);
            $form->fields()->create([
                'sort_order' => $i + 1,
                'label' => $f['label'],
                'type' => $f['type'],
                'required' => (bool) ($f['required'] ?? false),
                'options' => $needsOptions
                    ? array_values(array_filter(
                        $f['options'] ?? [],
                        fn ($o) => trim((string) $o) !== '',
                    ))
                    : null,
            ]);
        }
    }

    private function publicUrl(Form $form): string
    {
        $base = rtrim((string) config('line.public_base_url'), '/');

        return $base.'/f/'.$form->token;
    }

    private function uniqueToken(): string
    {
        do {
            $token = Str::random(40);
        } while (Form::withoutGlobalScopes()->where('token', $token)->exists());

        return $token;
    }

    private function folderOptions()
    {
        return FormFolder::orderBy('is_system', 'desc')
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

        FormFolder::firstOrCreate(
            ['organization_id' => $orgId, 'is_system' => true],
            ['name' => '未分類', 'sort_order' => 0],
        );
    }
}
