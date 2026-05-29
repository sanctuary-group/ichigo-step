<?php

namespace App\Http\Controllers;

use App\Models\RichMenuFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RichMenuFolderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $maxOrder = RichMenuFolder::max('sort_order') ?? -1;
        RichMenuFolder::create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
            'is_system' => false,
        ]);

        return back()->with('flash.success', 'フォルダを追加しました');
    }

    public function update(Request $request, RichMenuFolder $richMenuFolder): RedirectResponse
    {
        if ($richMenuFolder->is_system) {
            return back()->with('flash.error', 'システムフォルダは編集できません');
        }
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
        $richMenuFolder->update($validated);

        return back()->with('flash.success', 'フォルダを更新しました');
    }

    public function destroy(RichMenuFolder $richMenuFolder): RedirectResponse
    {
        if ($richMenuFolder->is_system) {
            return back()->with('flash.error', 'システムフォルダは削除できません');
        }
        $richMenuFolder->delete();

        return back()->with('flash.success', 'フォルダを削除しました');
    }
}
