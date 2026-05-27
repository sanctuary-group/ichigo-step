<?php

namespace App\Http\Controllers;

use App\Models\ChatStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChatStatusController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $maxOrder = ChatStatus::max('sort_order') ?? -1;
        ChatStatus::create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
        ]);

        return back()->with('flash.success', 'ステータスを追加しました');
    }

    public function update(Request $request, ChatStatus $chatStatus): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'color' => ['sometimes', 'required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $chatStatus->update($validated);

        return back()->with('flash.success', 'ステータスを更新しました');
    }

    public function destroy(ChatStatus $chatStatus): RedirectResponse
    {
        $chatStatus->delete();

        return back()->with('flash.success', 'ステータスを削除しました');
    }
}
