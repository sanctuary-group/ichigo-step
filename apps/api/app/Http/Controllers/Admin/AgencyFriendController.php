<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Friend;
use App\Models\FriendField;
use App\Models\Message;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgencyFriendController extends Controller
{
    /**
     * 代理店配下の友だち一覧（閲覧専用）。
     */
    public function index(Request $request, Organization $organization): Response
    {
        $search = trim((string) $request->query('q', ''));
        $mode = $request->query('mode', 'active');

        $friends = Friend::withoutGlobalScopes()
            ->where('organization_id', $organization->id)
            ->with(['tags', 'lineChannel:id,name'])
            ->when($mode === 'active', fn ($q) => $q->where('is_following', true))
            ->when($mode === 'blocked', fn ($q) => $q->where('is_following', false))
            ->when($search !== '', fn ($q) => $q->where(function ($qq) use ($search) {
                $qq->where('display_name', 'like', "%{$search}%")
                    ->orWhere('system_display_name', 'like', "%{$search}%");
            }))
            ->orderByDesc('followed_at')
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString()
            ->through(fn (Friend $f) => [
                'id' => $f->id,
                'display_name' => $f->display_name,
                'system_display_name' => $f->system_display_name,
                'picture_url' => $f->picture_url,
                'line_user_id' => $f->line_user_id,
                'is_following' => $f->is_following,
                'is_hidden' => $f->is_hidden,
                'followed_at' => $f->followed_at?->toIso8601String(),
                'last_message_at' => $f->last_message_at?->toIso8601String(),
                'channel_name' => $f->lineChannel?->name,
                'tags' => $f->tags->map(fn ($t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'color' => $t->color,
                ])->values(),
            ]);

        $base = Friend::withoutGlobalScopes()->where('organization_id', $organization->id);

        return Inertia::render('Admin/Agencies/Friends/Index', [
            'agency' => [
                'id' => $organization->id,
                'name' => $organization->name,
            ],
            'friends' => $friends,
            'filters' => [
                'q' => $search,
                'mode' => $mode,
            ],
            'stats' => [
                'total' => (clone $base)->count(),
                'active' => (clone $base)->where('is_following', true)->count(),
                'blocked' => (clone $base)->where('is_following', false)->count(),
            ],
        ]);
    }

    /**
     * 友だち詳細（閲覧専用）。
     */
    public function show(Organization $organization, Friend $friend): Response
    {
        // 他代理店の友だち ID 流用を遮断
        abort_unless($friend->organization_id === $organization->id, 404);

        $friend->loadMissing(['tags', 'chatStatus', 'lineChannel:id,name', 'fieldValues']);

        $friendFields = FriendField::withoutGlobalScopes()
            ->where('organization_id', $organization->id)
            ->with('folder:id,name')
            ->orderBy('friend_field_folder_id')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'friend_field_folder_id', 'name', 'field_type', 'options']);

        $messageCount = Message::withoutGlobalScopes()
            ->where('friend_id', $friend->id)
            ->count();

        return Inertia::render('Admin/Agencies/Friends/Show', [
            'agency' => [
                'id' => $organization->id,
                'name' => $organization->name,
            ],
            'friend' => [
                'id' => $friend->id,
                'display_name' => $friend->display_name,
                'system_display_name' => $friend->system_display_name,
                'picture_url' => $friend->picture_url,
                'status_message' => $friend->status_message,
                'line_user_id' => $friend->line_user_id,
                'source' => $friend->source,
                'note' => $friend->note,
                'is_following' => $friend->is_following,
                'is_hidden' => $friend->is_hidden,
                'unread_count' => $friend->unread_count,
                'followed_at' => $friend->followed_at?->toIso8601String(),
                'unfollowed_at' => $friend->unfollowed_at?->toIso8601String(),
                'last_message_at' => $friend->last_message_at?->toIso8601String(),
                'channel_name' => $friend->lineChannel?->name,
                'chat_status' => $friend->chatStatus ? [
                    'name' => $friend->chatStatus->name,
                    'color' => $friend->chatStatus->color,
                ] : null,
                'tags' => $friend->tags->map(fn ($t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'color' => $t->color,
                ])->values(),
                'field_values' => $friend->fieldValues->map(fn ($v) => [
                    'friend_field_id' => $v->friend_field_id,
                    'value' => $v->value,
                ])->values(),
            ],
            'friendFields' => $friendFields,
            'messageCount' => $messageCount,
        ]);
    }
}
