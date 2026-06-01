<?php

namespace App\Http\Controllers;

use App\Models\FriendFieldFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FriendFieldFolderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $maxOrder = FriendFieldFolder::max('sort_order') ?? -1;
        FriendFieldFolder::create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
            'is_system' => false,
        ]);

        return back()->with('flash.success', 'フォルダを追加しました');
    }

    public function update(Request $request, FriendFieldFolder $friendFieldFolder): RedirectResponse
    {
        if ($friendFieldFolder->is_system) {
            return back()->with('flash.error', 'システムフォルダは編集できません');
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $friendFieldFolder->update($validated);

        return back()->with('flash.success', 'フォルダを更新しました');
    }

    public function destroy(FriendFieldFolder $friendFieldFolder): RedirectResponse
    {
        if ($friendFieldFolder->is_system) {
            return back()->with('flash.error', 'システムフォルダは削除できません');
        }

        $friendFieldFolder->delete();

        return back()->with('flash.success', 'フォルダを削除しました');
    }
}
