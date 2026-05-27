<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;

class FriendTagController extends Controller
{
    public function attach(Friend $friend, Tag $tag): RedirectResponse
    {
        $friend->tags()->syncWithoutDetaching([
            $tag->id => ['assigned_at' => now()],
        ]);

        return back()->with('flash.success', "タグ「{$tag->name}」を付与しました");
    }

    public function detach(Friend $friend, Tag $tag): RedirectResponse
    {
        $friend->tags()->detach($tag->id);

        return back()->with('flash.success', "タグ「{$tag->name}」を外しました");
    }
}
