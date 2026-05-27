<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $view = (string) $request->query('view', 'all');
        $from = $request->query('from');
        $to = $request->query('to');

        $builder = Friend::query();

        if ($view === 'unread') {
            $builder->where('unread_count', '>', 0);
        }

        if ($query !== '') {
            $builder->where(function ($q) use ($query) {
                $q->where('display_name', 'like', "%{$query}%")
                    ->orWhere('system_display_name', 'like', "%{$query}%")
                    ->orWhere('last_message_preview', 'like', "%{$query}%");
            });
        }

        if ($from) {
            $builder->where('last_message_at', '>=', $from.' 00:00:00');
        }
        if ($to) {
            $builder->where('last_message_at', '<=', $to.' 23:59:59');
        }

        $friends = $builder
            ->whereNotNull('last_message_at')
            ->orderByDesc('last_message_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Chat/Management', [
            'friends' => $friends,
            'filters' => [
                'q' => $query,
                'view' => $view,
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }

    public function bulkUpdateRead(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'friend_ids' => ['required', 'array', 'min:1'],
            'friend_ids.*' => ['integer'],
            'status' => ['required', 'in:read,unread'],
        ]);

        Friend::whereIn('id', $validated['friend_ids'])
            ->update([
                'unread_count' => $validated['status'] === 'read' ? 0 : 1,
            ]);

        return back()->with(
            'flash.success',
            count($validated['friend_ids']).'件のステータスを更新しました',
        );
    }
}
