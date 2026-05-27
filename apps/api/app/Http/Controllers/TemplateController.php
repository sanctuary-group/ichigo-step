<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\TemplateFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $folders = TemplateFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount('templates')
            ->get();

        $folderId = $request->integer('folder') ?: $folders->first()?->id;
        $query = trim((string) $request->query('q', ''));

        $templates = Template::query()
            ->when($folderId, fn ($q) => $q->where('template_folder_id', $folderId))
            ->when($query !== '', function ($q) use ($query) {
                $q->where(function ($qq) use ($query) {
                    $qq->where('name', 'like', "%{$query}%")
                        ->orWhere('content', 'like', "%{$query}%");
                });
            })
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render('Templates/Index', [
            'folders' => $folders,
            'templates' => $templates,
            'filters' => ['folder' => $folderId, 'q' => $query],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'content' => ['nullable', 'string', 'max:5000'],
            'template_folder_id' => ['required', 'integer', 'exists:template_folders,id'],
        ]);

        Template::create([
            ...$validated,
            'content' => $validated['content'] ?? '',
        ]);

        return back()->with('flash.success', 'テンプレートを作成しました');
    }

    public function update(Request $request, Template $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'content' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'template_folder_id' => ['sometimes', 'required', 'integer', 'exists:template_folders,id'],
        ]);

        $template->update($validated);

        return back()->with('flash.success', 'テンプレートを更新しました');
    }

    public function destroy(Template $template): RedirectResponse
    {
        $template->delete();

        return back()->with('flash.success', 'テンプレートを削除しました');
    }
}
