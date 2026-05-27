<?php

namespace App\Http\Controllers;

use App\Http\Requests\Friend\UpdateFriendRequest;
use App\Models\Friend;
use App\Services\Line\LineClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FriendController extends Controller
{
    public function index(Request $request): Response
    {
        $mode = (string) $request->query('mode', 'active');
        $search = trim((string) $request->query('q', ''));
        $tagId = $request->integer('tag') ?: null;

        $query = Friend::with('tags');

        match ($mode) {
            'hidden' => $query->where('is_hidden', true),
            'blocked' => $query->where('is_following', false),
            default => $query->where('is_following', true)->where('is_hidden', false),
        };

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                    ->orWhere('system_display_name', 'like', "%{$search}%");
            });
        }

        if ($tagId) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        $friends = $query
            ->orderByDesc('followed_at')
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Friends/Index', [
            'friends' => $friends,
            'filters' => [
                'mode' => $mode,
                'q' => $search,
                'tag' => $tagId,
            ],
        ]);
    }

    public function toggleHidden(Friend $friend): RedirectResponse
    {
        $friend->forceFill(['is_hidden' => ! $friend->is_hidden])->save();

        return back(303);
    }

    public function toggleRead(Friend $friend): RedirectResponse
    {
        $friend->forceFill([
            'unread_count' => $friend->unread_count > 0 ? 0 : 1,
        ])->save();

        return back(303);
    }

    public function update(UpdateFriendRequest $request, Friend $friend): RedirectResponse
    {
        $friend->update($request->validated());

        return back()->with('flash.success', '友だち情報を更新しました');
    }

    public function refreshProfile(Friend $friend): RedirectResponse
    {
        try {
            $profile = LineClient::forChannel($friend->lineChannel)
                ->getProfile($friend->line_user_id);
        } catch (Throwable $e) {
            return back()->with('flash.error', 'プロフィール取得失敗: '.$e->getMessage());
        }

        $friend->forceFill([
            'display_name' => $profile['displayName'] ?? $friend->display_name,
            'picture_url' => $profile['pictureUrl'] ?? $friend->picture_url,
            'status_message' => $profile['statusMessage'] ?? $friend->status_message,
        ])->save();

        return back()->with('flash.success', 'LINE プロフィールを更新しました');
    }
}