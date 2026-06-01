<?php

namespace App\Http\Controllers;

use App\Models\Broadcast;
use App\Models\Friend;
use App\Models\Tag;
use Inertia\Inertia;
use Inertia\Response;

class DataManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('DataManagement/Index', [
            'stats' => [
                'friends_total' => Friend::count(),
                'friends_active' => Friend::where('is_following', true)->count(),
                'tags' => Tag::count(),
                'broadcast_success' => (int) Broadcast::sum('success_count'),
            ],
        ]);
    }
}
