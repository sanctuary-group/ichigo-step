<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Channel\StoreChannelRequest;
use App\Http\Requests\Channel\UpdateChannelRequest;
use App\Models\LineChannel;
use App\Services\Line\LineClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ChannelController extends Controller
{
    public function index(): Response
    {
        $channels = LineChannel::orderBy('created_at')->get();

        return Inertia::render('Settings/Channels', [
            'channels' => $channels,
        ]);
    }

    public function store(StoreChannelRequest $request): RedirectResponse
    {
        LineChannel::create($request->validated());

        return back()->with('flash.success', 'チャネルを登録しました');
    }

    public function update(UpdateChannelRequest $request, LineChannel $channel): RedirectResponse
    {
        $data = Arr::except($request->validated(), ['channel_secret', 'channel_access_token']);

        if (filled($request->input('channel_secret'))) {
            $data['channel_secret'] = $request->input('channel_secret');
        }
        if (filled($request->input('channel_access_token'))) {
            $data['channel_access_token'] = $request->input('channel_access_token');
        }

        $channel->update($data);

        return back()->with('flash.success', 'チャネルを更新しました');
    }

    public function destroy(LineChannel $channel): RedirectResponse
    {
        $channel->delete();

        return back()->with('flash.success', 'チャネルを削除しました');
    }

    public function test(LineChannel $channel): RedirectResponse
    {
        try {
            $info = LineClient::forChannel($channel)->getBotInfo();
            $name = $info['displayName'] ?? '(no name)';

            return back()->with('flash.success', "接続成功: {$name}");
        } catch (Throwable $e) {
            return back()->with('flash.error', "接続失敗: {$e->getMessage()}");
        }
    }
}
