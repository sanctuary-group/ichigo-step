<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::with('creator:id,name')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Announcement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'importance' => $a->importance,
                'status' => $a->status,
                'published_at' => $a->published_at?->toIso8601String(),
                'created_by_name' => $a->creator?->name,
                'created_at' => $a->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Announcements/Form', [
            'announcement' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $this->applyPublishedAt($data, null);
        $data['created_by'] = Auth::guard('admin')->id();

        Announcement::create($data);

        return redirect()
            ->route('admin.announcements.index')
            ->with('flash.success', 'お知らせを作成しました');
    }

    public function edit(Announcement $announcement): Response
    {
        return Inertia::render('Admin/Announcements/Form', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'importance' => $announcement->importance,
                'status' => $announcement->status,
                'published_at' => $announcement->published_at?->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $data = $this->validateData($request);
        $this->applyPublishedAt($data, $announcement);

        $announcement->update($data);

        return redirect()
            ->route('admin.announcements.index')
            ->with('flash.success', 'お知らせを更新しました');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return back()->with('flash.success', 'お知らせを削除しました');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:5000'],
            'importance' => ['required', 'in:normal,important,maintenance'],
            'status' => ['required', 'in:draft,published'],
        ]);
    }

    /**
     * 公開に切り替わるタイミングで published_at をセット、下書きに戻したらクリア。
     */
    private function applyPublishedAt(array &$data, ?Announcement $current): void
    {
        if ($data['status'] === 'published') {
            // 既に公開済みなら公開日時を維持、新規公開なら now()
            $data['published_at'] = $current?->published_at ?? now();
        } else {
            $data['published_at'] = null;
        }
    }
}
