<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $friends = Friend::with('tags')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();

        $selectedId = $request->query('friend');
        $selectedFriend = $selectedId
            ? Friend::with(['tags'])->find($selectedId)
            : $friends->first();

        $messages = $selectedFriend
            ? Message::where('friend_id', $selectedFriend->id)
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
            : collect();

        if ($selectedFriend && $selectedFriend->unread_count > 0) {
            Friend::where('id', $selectedFriend->id)->update(['unread_count' => 0]);
            $selectedFriend->unread_count = 0;
        }

        return Inertia::render('Chat/Index', [
            'friends' => $friends,
            'selectedFriend' => $selectedFriend,
            'messages' => $messages,
        ]);
    }
}
