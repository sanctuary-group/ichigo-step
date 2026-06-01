<?php

namespace App\Http\Controllers;

use App\Models\ChatSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatSettingController extends Controller
{
    public function edit(): Response
    {
        // chatSettings は HandleInertiaRequests で共有済み
        return Inertia::render('Chat/Settings');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'send_shortcut' => ['sometimes', 'in:shift_enter_send,enter_send'],
            'short_url' => ['sometimes', 'boolean'],
            'send_preview' => ['sometimes', 'boolean'],
            'auto_read' => ['sometimes', 'array'],
            'auto_read.bracket' => ['boolean'],
            'auto_read.sticker' => ['boolean'],
            'auto_read.reactAll' => ['boolean'],
            'auto_read.reactKeyword' => ['boolean'],
            'auto_read.onReply' => ['boolean'],
            'auto_read.onBlock' => ['boolean'],
        ]);

        $orgId = auth()->user()->current_organization_id;
        $setting = ChatSetting::firstOrNew(['organization_id' => $orgId]);

        if (array_key_exists('auto_read', $validated)) {
            $validated['auto_read'] = array_merge(
                ChatSetting::AUTO_READ_DEFAULTS,
                $setting->auto_read ?? [],
                $validated['auto_read'],
            );
        }

        $setting->fill($validated)->save();

        return back()->with('flash.success', 'チャット設定を保存しました');
    }
}
