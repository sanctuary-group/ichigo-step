<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\Tag;
use App\Services\ScenarioEnroller;
use Illuminate\Http\RedirectResponse;

class FriendTagController extends Controller
{
    public function attach(Friend $friend, Tag $tag): RedirectResponse
    {
        $isNew = ! $friend->tags()->where('tags.id', $tag->id)->exists();

        $friend->tags()->syncWithoutDetaching([
            $tag->id => ['assigned_at' => now()],
        ]);

        if ($isNew) {
            ScenarioEnroller::enroll($friend, 'tag_added', $tag->id);
        }

        return back()->with('flash.success', "タグ「{$tag->name}」を付与しました");
    }

    public function detach(Friend $friend, Tag $tag): RedirectResponse
    {
        $friend->tags()->detach($tag->id);

        return back()->with('flash.success', "タグ「{$tag->name}」を外しました");
    }
}
