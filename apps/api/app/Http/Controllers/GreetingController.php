<?php

namespace App\Http\Controllers;

use App\Models\Greeting;
use App\Models\LineChannel;
use App\Models\Scenario;
use App\Services\GreetingDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GreetingController extends Controller
{
    private const TYPES = ['new_friend', 'existing', 'unblock'];

    public function show(Request $request, string $type): Response
    {
        if (! in_array($type, self::TYPES, true)) {
            abort(404);
        }

        $channelId = $request->integer('channel');
        $channels = LineChannel::where('is_active', true)->orderBy('id')->get(['id', 'name', 'basic_id', 'channel_id']);
        $channel = $channelId
            ? $channels->firstWhere('id', $channelId)
            : $channels->first();

        $greeting = $channel
            ? Greeting::firstOrNew([
                'line_channel_id' => $channel->id,
                'type' => $type,
            ])
            : null;

        if ($greeting && ! $greeting->exists) {
            $greeting->is_active = true;
            $greeting->message_type = 'text';
            $greeting->text_content = '';
            $greeting->actions = [];
        }

        $scenarios = Scenario::orderBy('name')->get(['id', 'name', 'line_channel_id']);

        return Inertia::render($this->componentFor($type), [
            'greeting' => $greeting,
            'channel' => $channel,
            'channels' => $channels,
            'scenarios' => $scenarios,
            'type' => $type,
        ]);
    }

    public function update(Request $request, string $type): RedirectResponse
    {
        if (! in_array($type, self::TYPES, true)) {
            abort(404);
        }

        $validated = $request->validate([
            'line_channel_id' => ['required', 'integer', 'exists:line_channels,id'],
            'is_active' => ['boolean'],
            'message_type' => ['required', 'in:text,image'],
            'text_content' => ['nullable', 'string', 'max:5000', 'required_if:message_type,text'],
            'image_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://', 'required_if:message_type,image'],
            'image_preview_url' => ['nullable', 'string', 'max:1024', 'starts_with:https://'],
            'actions' => ['array'],
            'actions.*.type' => ['required', 'in:tag_attach,tag_detach,scenario_start'],
            'actions.*.tag_id' => ['nullable', 'integer', 'exists:tags,id'],
            'actions.*.scenario_id' => ['nullable', 'integer', 'exists:scenarios,id'],
        ]);

        if ($validated['message_type'] === 'text') {
            $validated['image_url'] = null;
            $validated['image_preview_url'] = null;
        } else {
            $validated['text_content'] = null;
            $validated['image_preview_url'] = $validated['image_preview_url'] ?? ($validated['image_url'] ?? null);
        }

        $validated['is_active'] = (bool) ($validated['is_active'] ?? true);

        Greeting::updateOrCreate(
            ['line_channel_id' => $validated['line_channel_id'], 'type' => $type],
            $validated,
        );

        return back()->with('flash.success', '保存しました');
    }

    public function sendExisting(Request $request, string $type): RedirectResponse
    {
        if ($type !== 'existing') {
            abort(404);
        }

        $request->validate([
            'line_channel_id' => ['required', 'integer', 'exists:line_channels,id'],
        ]);

        $greeting = Greeting::where('line_channel_id', $request->integer('line_channel_id'))
            ->where('type', 'existing')
            ->first();

        if (! $greeting) {
            return back()->with('flash.error', 'まずメッセージを保存してください');
        }

        $result = GreetingDispatcher::dispatchExisting($greeting);

        if ($result['error']) {
            return back()->with('flash.error', "送信に一部失敗しました: {$result['success']}/{$result['total']} ({$result['error']})");
        }
        return back()->with('flash.success', "{$result['success']}/{$result['total']} 名に送信しました");
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:10240']]);
        $path = $request->file('image')->store('greetings', 'public');
        $baseUrl = rtrim((string) config('line.public_base_url'), '/');
        $url = $baseUrl.'/storage/'.$path;
        if (! str_starts_with($url, 'https://')) {
            return response()->json([
                'error' => "画像配信には HTTPS の公開 URL が必要です（現状: {$url}）",
            ], 422);
        }
        return response()->json(['url' => $url]);
    }

    private function componentFor(string $type): string
    {
        return match ($type) {
            'new_friend' => 'Greetings/NewFriend',
            'existing' => 'Greetings/Existing',
            'unblock' => 'Greetings/Unblock',
        };
    }
}
