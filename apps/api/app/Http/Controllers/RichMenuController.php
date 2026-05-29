<?php

namespace App\Http\Controllers;

use App\Models\LineChannel;
use App\Models\RichMenu;
use App\Models\RichMenuFolder;
use App\Services\Line\LineClient;
use App\Support\RichMenuLayouts;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RichMenuController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureDefaultFolder();

        $folders = RichMenuFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->withCount('richMenus')
            ->get();

        $folderId = $request->integer('folder') ?: $folders->first()?->id;
        $query = trim((string) $request->query('q', ''));

        $richMenus = RichMenu::with(['lineChannel', 'folder'])
            ->when($folderId, fn ($q) => $q->where('rich_menu_folder_id', $folderId))
            ->when($query !== '', fn ($q) => $q->where('name', 'like', "%{$query}%"))
            ->orderByDesc('id')
            ->get();

        return Inertia::render('RichMenus/Index', [
            'richMenus' => $richMenus,
            'folders' => $folders,
            'filters' => ['folder' => $folderId, 'q' => $query],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureDefaultFolder();

        return Inertia::render('RichMenus/Form', [
            'richMenu' => null,
            'layouts' => RichMenuLayouts::all(),
            'folders' => $this->folderOptions(),
            'defaultName' => trim((string) $request->query('name', '')),
            'defaultFolderId' => $request->integer('folder')
                ?: RichMenuFolder::orderBy('is_system', 'desc')->orderBy('sort_order')->value('id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request);
        $layout = RichMenuLayouts::find($validated['layout_key']);

        $richMenu = RichMenu::create([
            'line_channel_id' => $validated['line_channel_id'],
            'rich_menu_folder_id' => $validated['rich_menu_folder_id'],
            'name' => $validated['name'],
            'chat_bar_text' => $validated['chat_bar_text'],
            'layout_key' => $validated['layout_key'],
            'size' => $layout['size'],
            'image_path' => $validated['image_path'] ?? null,
            'areas' => $validated['areas'] ?? [],
        ]);

        return redirect()->route('richMenus.edit', $richMenu)
            ->with('flash.success', 'リッチメニューを作成しました');
    }

    public function edit(RichMenu $richMenu): Response
    {
        $richMenu->load(['lineChannel', 'folder']);

        return Inertia::render('RichMenus/Form', [
            'richMenu' => [
                ...$richMenu->toArray(),
                'image_url' => $richMenu->image_path
                    ? Storage::disk('public')->url($richMenu->image_path)
                    : null,
            ],
            'layouts' => RichMenuLayouts::all(),
            'folders' => $this->folderOptions(),
            'defaultFolderId' => $richMenu->rich_menu_folder_id,
        ]);
    }

    public function update(Request $request, RichMenu $richMenu): RedirectResponse
    {
        $validated = $this->validatePayload($request);
        $layout = RichMenuLayouts::find($validated['layout_key']);

        $richMenu->update([
            'line_channel_id' => $validated['line_channel_id'],
            'rich_menu_folder_id' => $validated['rich_menu_folder_id'],
            'name' => $validated['name'],
            'chat_bar_text' => $validated['chat_bar_text'],
            'layout_key' => $validated['layout_key'],
            'size' => $layout['size'],
            'image_path' => $validated['image_path'] ?? $richMenu->image_path,
            'areas' => $validated['areas'] ?? [],
        ]);

        return back()->with('flash.success', 'リッチメニューを更新しました');
    }

    public function destroy(RichMenu $richMenu): RedirectResponse
    {
        // LINE 側に公開済みなら先に取り下げる
        if ($richMenu->is_published && $richMenu->line_rich_menu_id) {
            $this->withdrawFromLine($richMenu);
        }
        if ($richMenu->image_path) {
            Storage::disk('public')->delete($richMenu->image_path);
        }
        $richMenu->delete();

        return redirect()->route('richMenus.index')->with('flash.success', '削除しました');
    }

    public function publish(RichMenu $richMenu): RedirectResponse
    {
        if (! $richMenu->image_path || ! Storage::disk('public')->exists($richMenu->image_path)) {
            return back()->with('flash.error', '公開には画像のアップロードが必要です');
        }

        $channel = $richMenu->lineChannel;
        if (! $channel || ! $channel->is_active) {
            return back()->with('flash.error', 'LINE チャネルが無効です');
        }

        $layout = RichMenuLayouts::find($richMenu->layout_key);
        if (! $layout) {
            return back()->with('flash.error', 'レイアウトが不正です');
        }

        $lineAreas = $this->buildLineAreas($richMenu, $layout);
        if (empty($lineAreas)) {
            return back()->with('flash.error', 'タップ時アクションを 1 つ以上設定してください');
        }

        $client = LineClient::forChannel($channel);

        try {
            // 既に公開済みなら旧メニューを破棄してから作り直す
            if ($richMenu->line_rich_menu_id) {
                $this->withdrawFromLine($richMenu);
            }

            $richMenuId = $client->createRichMenu([
                'size' => ['width' => $layout['width'], 'height' => $layout['height']],
                'selected' => true,
                'name' => mb_substr($richMenu->name, 0, 300),
                'chatBarText' => mb_substr($richMenu->chat_bar_text ?: 'メニュー', 0, 14),
                'areas' => $lineAreas,
            ]);

            $bytes = Storage::disk('public')->get($richMenu->image_path);
            $client->uploadRichMenuImage($richMenuId, $bytes, $this->imageContentType($richMenu->image_path));
            $client->setDefaultRichMenu($richMenuId);
        } catch (Throwable $e) {
            return back()->with('flash.error', '公開に失敗しました: '.mb_substr($e->getMessage(), 0, 300));
        }

        $richMenu->update([
            'is_published' => true,
            'line_rich_menu_id' => $richMenuId,
            'published_at' => now(),
        ]);

        return back()->with('flash.success', 'リッチメニューを公開しました');
    }

    public function unpublish(RichMenu $richMenu): RedirectResponse
    {
        if ($richMenu->line_rich_menu_id) {
            try {
                $this->withdrawFromLine($richMenu);
            } catch (Throwable $e) {
                return back()->with('flash.error', '取り下げに失敗しました: '.mb_substr($e->getMessage(), 0, 300));
            }
        }

        $richMenu->update([
            'is_published' => false,
            'line_rich_menu_id' => null,
            'published_at' => null,
        ]);

        return back()->with('flash.success', 'リッチメニューを非公開にしました');
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],
        ]);

        [$width, $height] = getimagesize($request->file('image')->getRealPath());

        $size = null;
        foreach (RichMenuLayouts::SIZES as $key => $dim) {
            if ($width === $dim['width'] && $height === $dim['height']) {
                $size = $key;
                break;
            }
        }

        if ($size === null) {
            return response()->json([
                'error' => "画像サイズが正しくありません。2500×1686px または 2500×843px の画像を指定してください（現在: {$width}×{$height}px）",
            ], 422);
        }

        $path = $request->file('image')->store('rich-menus', 'public');

        return response()->json([
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'size' => $size,
        ]);
    }

    /**
     * @param  array{areas: array<int, array{x:int,y:int,width:int,height:int}>}  $layout
     */
    private function buildLineAreas(RichMenu $richMenu, array $layout): array
    {
        $cells = $richMenu->areas ?? [];
        $lineAreas = [];

        foreach ($layout['areas'] as $i => $bounds) {
            $cell = $cells[$i] ?? null;
            $type = $cell['type'] ?? 'none';
            $value = trim((string) ($cell['value'] ?? ''));

            if ($type === 'none' || $value === '') {
                continue;
            }

            $action = match ($type) {
                'uri' => ['type' => 'uri', 'uri' => $value],
                'message' => ['type' => 'message', 'text' => $value],
                default => null,
            };

            if ($action === null) {
                continue;
            }

            $lineAreas[] = ['bounds' => $bounds, 'action' => $action];
        }

        return $lineAreas;
    }

    private function withdrawFromLine(RichMenu $richMenu): void
    {
        $channel = $richMenu->lineChannel;
        if (! $channel) {
            return;
        }
        $client = LineClient::forChannel($channel);
        try {
            $client->cancelDefaultRichMenu();
        } catch (Throwable) {
            // デフォルト未設定なら無視
        }
        $client->deleteRichMenu($richMenu->line_rich_menu_id);
    }

    private function imageContentType(string $path): string
    {
        return str_ends_with(strtolower($path), '.png') ? 'image/png' : 'image/jpeg';
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'line_channel_id' => ['required', 'integer', 'exists:line_channels,id'],
            'rich_menu_folder_id' => ['required', 'integer', 'exists:rich_menu_folders,id'],
            'chat_bar_text' => ['required', 'string', 'max:14'],
            'layout_key' => ['required', 'in:'.implode(',', RichMenuLayouts::keys())],
            'image_path' => ['nullable', 'string', 'max:1024'],
            'areas' => ['nullable', 'array'],
            'areas.*.type' => ['required', 'in:none,uri,message'],
            'areas.*.value' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    private function folderOptions()
    {
        return RichMenuFolder::orderBy('is_system', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name', 'is_system']);
    }

    private function ensureDefaultFolder(): void
    {
        $orgId = auth()->user()?->current_organization_id;
        if (! $orgId) {
            return;
        }

        RichMenuFolder::firstOrCreate(
            ['organization_id' => $orgId, 'is_system' => true],
            ['name' => '未分類', 'sort_order' => 0],
        );
    }
}
