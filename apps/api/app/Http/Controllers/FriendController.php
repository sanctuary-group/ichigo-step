<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
            $query->where('display_name', 'like', "%{$search}%");
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
}