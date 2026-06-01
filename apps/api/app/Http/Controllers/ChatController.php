<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\FriendField;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $friends = Friend::with('tags')
            ->orderByRaw('pinned_at IS NULL, pinned_at DESC')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();

        $selectedId = $request->query('friend');
        $selectedFriend = $selectedId
            ? Friend::with(['tags', 'fieldValues'])->find($selectedId)
            : $friends->first();

        if ($selectedFriend && ! $selectedFriend->relationLoaded('fieldValues')) {
            $selectedFriend->load('fieldValues');
        }

        $messages = $selectedFriend
            ? Message::where('friend_id', $selectedFriend->id)
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
            : collect();

        $friendFields = FriendField::with('folder:id,name')
            ->orderBy('friend_field_folder_id')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'friend_field_folder_id', 'name', 'field_type', 'options']);

        return Inertia::render('Chat/Index', [
            'friends' => $friends,
            'selectedFriend' => $selectedFriend,
            'messages' => $messages,
            'friendFields' => $friendFields,
        ]);
    }
}
