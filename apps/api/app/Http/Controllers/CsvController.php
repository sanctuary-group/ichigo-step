<?php

namespace App\Http\Controllers;

use App\Models\CsvJob;
use App\Models\Friend;
use App\Models\Tag;
use App\Models\FriendFieldFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class CsvController extends Controller
{
    /** 単一選択項目 (mockup と対応する Friend カラム) */
    private const SINGLE_FIELDS = [
        'status_message' => ['label' => 'ステータスメッセージ', 'column' => 'status_message'],
        'memo' => ['label' => '個別メモ', 'column' => 'note'],
        'added_at' => ['label' => '友だち追加日', 'column' => 'followed_at'],
        'last_received_at' => ['label' => '最終メッセージ受信日時', 'column' => 'last_message_at'],
        'source' => ['label' => '流入経路', 'column' => 'source'],
    ];

    public function index(): Response
    {
        $exports = CsvJob::where('kind', 'export')->orderByDesc('id')->get();
        $imports = CsvJob::where('kind', 'import')->orderByDesc('id')->get();

        return Inertia::render('DataManagement/Csv/Index', [
            'exports' => $exports,
            'imports' => $imports,
        ]);
    }

    public function createExport(): Response
    {
        return Inertia::render('DataManagement/Csv/ExportForm', [
            'singleFields' => collect(self::SINGLE_FIELDS)
                ->map(fn ($f, $id) => ['id' => $id, 'label' => $f['label']])
                ->values(),
            'tagFolders' => [['id' => 'all', 'name' => '未分類', 'count' => Tag::count()]],
            'fieldFolders' => FriendFieldFolder::orderBy('is_system', 'desc')
                ->orderBy('sort_order')
                ->withCount('friendFields')
                ->get()
                ->map(fn ($f) => ['id' => $f->id, 'name' => $f->name, 'count' => $f->friend_fields_count]),
            'audienceCounts' => [
                'active' => Friend::where('is_following', true)->count(),
                'blocked' => Friend::where('is_following', false)->count(),
                'blockedBy' => Friend::where('is_following', false)->count(),
            ],
        ]);
    }

    public function storeExport(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'audience' => ['required', 'in:active,blocked,blockedBy'],
            'columns' => ['nullable', 'array'],
            'columns.*' => ['string', 'in:'.implode(',', array_keys(self::SINGLE_FIELDS))],
            'tag_ids' => ['nullable', 'array'],
            'field_ids' => ['nullable', 'array'],
        ]);

        $orgId = auth()->user()->current_organization_id;
        $friends = Friend::with(['chatStatus', 'tags', 'fieldValues'])
            ->where('is_following', $validated['audience'] === 'active')
            ->get();

        $selectedSingles = array_values(array_intersect(
            array_keys(self::SINGLE_FIELDS),
            $validated['columns'] ?? [],
        ));

        $csv = $this->buildCsv($friends, $selectedSingles);

        $path = "csv-exports/{$orgId}/".now()->format('Ymd_His')."_".uniqid().".csv";
        Storage::disk('local')->put($path, $csv);

        CsvJob::create([
            'kind' => 'export',
            'name' => $validated['name'],
            'audience' => $validated['audience'],
            'columns' => $selectedSingles,
            'target_count' => $friends->count(),
            'condition_label' => $this->audienceLabel($validated['audience']),
            'file_path' => $path,
            'row_count' => $friends->count(),
            'status' => 'completed',
        ]);

        return redirect()->route('csv.index')
            ->with('flash.success', "CSV「{$validated['name']}」を作成しました（{$friends->count()}件）");
    }

    public function download(CsvJob $csvJob): StreamedResponse
    {
        abort_unless($csvJob->kind === 'export' && $csvJob->file_path, 404);
        abort_unless(Storage::disk('local')->exists($csvJob->file_path), 404);

        $filename = "{$csvJob->name}.csv";

        return Storage::disk('local')->download($csvJob->file_path, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function storeImport(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $orgId = auth()->user()->current_organization_id;
        $file = $request->file('file');

        $rows = 0;
        if (($handle = fopen($file->getRealPath(), 'r')) !== false) {
            while (fgetcsv($handle, escape: '') !== false) {
                $rows++;
            }
            fclose($handle);
        }
        $rows = max(0, $rows - 1); // ヘッダ行を除く

        $path = $file->storeAs(
            "csv-imports/{$orgId}",
            now()->format('Ymd_His')."_".uniqid().".csv",
            'local',
        );

        CsvJob::create([
            'kind' => 'import',
            'name' => $validated['name'],
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'row_count' => $rows,
            'target_count' => $rows,
            'status' => 'completed',
        ]);

        return redirect()->route('csv.index')
            ->with('flash.success', "CSV「{$validated['name']}」を取り込みました（{$rows}件）");
    }

    public function destroy(CsvJob $csvJob): RedirectResponse
    {
        if ($csvJob->file_path) {
            Storage::disk('local')->delete($csvJob->file_path);
        }
        $csvJob->delete();

        return back()->with('flash.success', '削除しました');
    }

    private function buildCsv($friends, array $singles): string
    {
        $header = ['LINE ユーザーID', '表示名'];
        foreach ($singles as $key) {
            $header[] = self::SINGLE_FIELDS[$key]['label'];
        }
        $header[] = 'タグ';

        $out = fopen('php://temp', 'r+');
        fputcsv($out, $header, escape: '');

        foreach ($friends as $friend) {
            $row = [$friend->line_user_id, $friend->display_name];
            foreach ($singles as $key) {
                $row[] = $this->cellValue($friend, $key);
            }
            $row[] = $friend->tags->pluck('name')->implode(' / ');
            fputcsv($out, $row, escape: '');
        }

        rewind($out);
        $csv = stream_get_contents($out);
        fclose($out);

        // Excel で文字化けしないよう BOM 付与
        return "\xEF\xBB\xBF".$csv;
    }

    private function cellValue(Friend $friend, string $key): string
    {
        return match ($key) {
            'status_message' => (string) $friend->status_message,
            'memo' => (string) $friend->note,
            'added_at' => $friend->followed_at?->format('Y/m/d H:i') ?? '',
            'last_received_at' => $friend->last_message_at?->format('Y/m/d H:i') ?? '',
            'source' => (string) $friend->source,
            default => '',
        };
    }

    private function audienceLabel(string $audience): string
    {
        return match ($audience) {
            'active' => '有効友だち',
            'blocked' => 'ブロックした友だち',
            'blockedBy' => 'ブロックされた友だち',
            default => '',
        };
    }
}
