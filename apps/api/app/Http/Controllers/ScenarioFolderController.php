<?php

namespace App\Http\Controllers;

use App\Models\ScenarioFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ScenarioFolderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $maxOrder = ScenarioFolder::max('sort_order') ?? -1;
        ScenarioFolder::create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
            'is_system' => false,
        ]);

        return back()->with('flash.success', 'フォルダを追加しました');
    }

    public function update(Request $request, ScenarioFolder $scenarioFolder): RedirectResponse
    {
        if ($scenarioFolder->is_system) {
            return back()->with('flash.error', 'システムフォルダは編集できません');
        }
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
        $scenarioFolder->update($validated);
        return back()->with('flash.success', 'フォルダを更新しました');
    }

    public function destroy(ScenarioFolder $scenarioFolder): RedirectResponse
    {
        if ($scenarioFolder->is_system) {
            return back()->with('flash.error', 'システムフォルダは削除できません');
        }
        $scenarioFolder->delete();
        return back()->with('flash.success', 'フォルダを削除しました');
    }
}
