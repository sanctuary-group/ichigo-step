import { Head, router, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faMagnifyingGlass,
    faFolderPlus,
    faArrowsUpDown,
    faSort,
    faTrashCan,
    faFolderTree,
    faChevronLeft,
    faInbox,
    faQrcode,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { QrAction, QrActionFolder, QrAudience } from "@/types/qr-action";

const MAX_NAME = 50;

type PageProps = {
    qrActions: QrAction[];
    folders: QrActionFolder[];
    filters: { folder: number | null; q: string };
};

function audienceLabel(a: QrAudience): string {
    return a === "new" ? "新規友だちのみ" : "全ての友だち";
}

function actionLabel(q: QrAction): string {
    switch (q.action_type) {
        case "add_tag":
            return `タグ付与: ${q.action_tag?.name ?? "—"}`;
        case "start_scenario":
            return `シナリオ開始: ${q.action_scenario?.name ?? "—"}`;
        case "track_source":
            return "流入計測のみ";
        default:
            return "なし";
    }
}

export default function QrActionsIndex({
    qrActions,
    folders,
    filters,
}: PageProps) {
    const [query, setQuery] = useState(filters.q ?? "");
    const [searchOpen, setSearchOpen] = useState(!!filters.q);
    const [folderVisible, setFolderVisible] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const selectFolder = (folderId: number) => {
        router.get(
            "/qr-actions",
            { folder: folderId, q: filters.q || undefined },
            { preserveScroll: true, preserveState: true },
        );
        setSelectedIds(new Set());
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            "/qr-actions",
            { folder: filters.folder ?? undefined, q: query || undefined },
            { preserveScroll: true, preserveState: true },
        );
    };

    const toggleActive = (q: QrAction) => {
        router.patch(`/qr-actions/${q.id}/toggle-active`, {}, { preserveScroll: true, preserveState: true });
    };

    const deleteQr = (q: QrAction) => {
        if (!confirm(`「${q.name}」を削除しますか？`)) return;
        router.delete(`/qr-actions/${q.id}`, { preserveScroll: true });
    };

    const deleteFolder = (f: QrActionFolder) => {
        if (f.is_system) return;
        const count = f.qr_actions_count ?? 0;
        const msg =
            count > 0
                ? `「${f.name}」を削除します。${count} 件のQRコードアクションも一緒に削除されます。`
                : `「${f.name}」を削除しますか？`;
        if (!confirm(msg)) return;
        router.delete(`/qr-action-folders/${f.id}`, { preserveScroll: true });
    };

    const allCheckedInView =
        qrActions.length > 0 && qrActions.every((q) => selectedIds.has(q.id));

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allCheckedInView) {
                for (const q of qrActions) next.delete(q.id);
            } else {
                for (const q of qrActions) next.add(q.id);
            }
            return next;
        });
    };

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectionCount = selectedIds.size;

    return (
        <>
            <Head title="QRコードアクション" />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-3 border-b border-border">
                    <h1 className="text-lg font-bold tracking-tight">
                        QRコードアクション（流入経路分析）
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        個別の友だち追加URLを発行し、流入経路の分析やそのURLから登録した友だちに対して個別のアクション稼働ができる機能です。
                    </p>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {folderVisible && (
                        <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border flex flex-col max-h-[40vh] md:max-h-none">
                            <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-9 px-2"
                                    onClick={() => setFolderDialogOpen(true)}
                                >
                                    <FontAwesomeIcon icon={faFolderPlus} className="size-3" />
                                    フォルダ追加
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 h-9 px-2" disabled>
                                    <FontAwesomeIcon icon={faArrowsUpDown} className="size-3" />
                                    並べ替え
                                </Button>
                            </div>
                            <ul className="flex-1 overflow-y-auto p-2 space-y-1">
                                {folders.map((f) => {
                                    const active = f.id === filters.folder;
                                    return (
                                        <li key={f.id} className="group flex items-center gap-1">
                                            <button
                                                onClick={() => selectFolder(f.id)}
                                                className={cn(
                                                    "flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors min-w-0 flex items-center justify-between gap-2",
                                                    active
                                                        ? "bg-muted text-foreground"
                                                        : "text-foreground hover:bg-muted/50",
                                                )}
                                            >
                                                <span className="truncate">{f.name}</span>
                                                <span className="text-muted-foreground text-xs tabular-nums">
                                                    ({f.qr_actions_count ?? 0})
                                                </span>
                                            </button>
                                            {!f.is_system && (
                                                <button
                                                    onClick={() => deleteFolder(f)}
                                                    className="grid place-items-center size-7 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="削除"
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} className="size-3" />
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            <button
                                type="button"
                                onClick={() => setFolderVisible(false)}
                                className="border-t border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted/40 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="size-3" />
                                フォルダを非表示
                            </button>
                        </aside>
                    )}

                    <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border flex-wrap">
                            <button
                                onClick={() => setCreateOpen(true)}
                                className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} className="size-3" />
                                新規作成
                            </button>
                            <div className="flex items-center gap-2">
                                {!folderVisible && (
                                    <Button variant="outline" size="sm" className="h-9" onClick={() => setFolderVisible(true)}>
                                        <FontAwesomeIcon icon={faFolderTree} className="size-3.5" />
                                        フォルダを表示
                                    </Button>
                                )}
                                {searchOpen ? (
                                    <form onSubmit={onSearch} className="relative w-56">
                                        <FontAwesomeIcon
                                            icon={faMagnifyingGlass}
                                            className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                        />
                                        <Input
                                            placeholder="管理名で検索"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            autoFocus
                                            onBlur={() => !query && setSearchOpen(false)}
                                            className="pl-9 h-9"
                                        />
                                    </form>
                                ) : (
                                    <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="size-9" aria-label="検索">
                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="size-3.5 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60 sticky top-0">
                                    <tr>
                                        <th className="w-10 px-3 py-2 text-left">
                                            <input
                                                type="checkbox"
                                                checked={allCheckedInView}
                                                onChange={toggleAll}
                                                disabled={qrActions.length === 0}
                                                className="size-4 rounded border-border accent-primary"
                                                aria-label="すべて選択"
                                            />
                                        </th>
                                        <SortableHeader label="稼働状況" className="w-28" />
                                        <SortableHeader label="管理名" />
                                        <SortableHeader label="稼働対象" className="w-32" />
                                        <th className="px-3 py-2 text-left font-bold text-foreground">設定済みアクション</th>
                                        <th className="px-3 py-2 text-right font-bold text-foreground w-28">URL読込人数</th>
                                        <th className="px-3 py-2 text-right font-bold text-foreground w-28">友だち追加</th>
                                        <th className="px-3 py-2 text-center font-bold text-foreground w-24">QR</th>
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-16">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {qrActions.length === 0 ? (
                                        <tr>
                                            <td colSpan={9}>
                                                <div className="flex flex-col items-center justify-center py-24 gap-2 text-muted-foreground">
                                                    <FontAwesomeIcon icon={faInbox} className="size-14 text-muted-foreground/30" />
                                                    <div className="text-sm">まだデータがありません</div>
                                                    <div className="text-xs">
                                                        <button onClick={() => setCreateOpen(true)} className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                                                            新規作成
                                                        </button>{" "}するとここにデータが表示されます
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        qrActions.map((q) => {
                                            const checked = selectedIds.has(q.id);
                                            return (
                                                <tr key={q.id} className={cn("border-b border-border hover:bg-muted/30", checked && "bg-primary/5")}>
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleRow(q.id)}
                                                            className="size-4 rounded border-border accent-primary"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Switch checked={q.is_active} onCheckedChange={() => toggleActive(q)} aria-label={q.is_active ? "停止する" : "稼働する"} />
                                                            <span className={cn("text-[11px]", q.is_active ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground")}>
                                                                {q.is_active ? "稼働中" : "停止中"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 font-medium">
                                                        <a href={`/qr-actions/${q.id}/edit`} className="hover:underline">
                                                            {q.name}
                                                        </a>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground">{audienceLabel(q.audience)}</td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground">{actionLabel(q)}</td>
                                                    <td className="px-3 py-3 text-right text-xs tabular-nums">{q.scan_count.toLocaleString()}</td>
                                                    <td className="px-3 py-3 text-right text-xs tabular-nums text-muted-foreground">
                                                        {q.follow_count.toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        {q.image_url ? (
                                                            <a href={q.image_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="QRを表示">
                                                                <FontAwesomeIcon icon={faQrcode} className="size-3.5" />
                                                            </a>
                                                        ) : (
                                                            <a href={`/qr-actions/${q.id}/edit`} className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="QRを表示">
                                                                <FontAwesomeIcon icon={faQrcode} className="size-3.5" />
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <button onClick={() => deleteQr(q)} className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive" aria-label="削除">
                                                            <FontAwesomeIcon icon={faTrashCan} className="size-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-start gap-3 px-6 py-3 border-t border-border flex-wrap">
                            <Button variant="outline" size="sm" disabled={selectionCount === 0} className="h-9 disabled:opacity-50">
                                <FontAwesomeIcon icon={faFolderTree} className="size-3.5" />
                                一括フォルダ変更
                            </Button>
                            <Button variant="outline" size="sm" disabled={selectionCount === 0} className="h-9 disabled:opacity-50 text-destructive hover:text-destructive">
                                <FontAwesomeIcon icon={faTrashCan} className="size-3.5" />
                                一括削除
                            </Button>
                            <span className="text-xs text-muted-foreground tabular-nums ml-auto">全 {qrActions.length} 件</span>
                        </div>
                    </section>
                </div>
            </div>

            <FolderDialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} />
            <CreateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                folders={folders}
                defaultFolderId={filters.folder ?? folders[0]?.id ?? null}
            />
        </>
    );
}

QrActionsIndex.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

function SortableHeader({ label, className }: { label: string; className?: string }) {
    return (
        <th className={cn("px-3 py-2 text-left font-bold text-foreground", className)}>
            <span className="inline-flex items-center gap-1">
                {label}
                <FontAwesomeIcon icon={faSort} className="size-2.5 text-muted-foreground" />
            </span>
        </th>
    );
}

function FolderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const form = useForm({ name: "" });
    useEffect(() => {
        if (open) {
            form.setData({ name: "" });
            form.clearErrors();
        }
    }, [open]);
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.post("/qr-action-folders", { preserveScroll: true, onSuccess: () => onClose() });
    };
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>フォルダを追加</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="qrf-name">名前</Label>
                        <Input id="qrf-name" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} autoFocus />
                        {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={form.processing}>キャンセル</Button>
                        <Button type="submit" disabled={form.processing}>{form.processing ? "保存中..." : "作成"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateDialog({
    open,
    onClose,
    folders,
    defaultFolderId,
}: {
    open: boolean;
    onClose: () => void;
    folders: QrActionFolder[];
    defaultFolderId: number | null;
}) {
    const [name, setName] = useState("");
    const [folderId, setFolderId] = useState<number>(defaultFolderId ?? 0);
    const [audience, setAudience] = useState<QrAudience>("new");

    useEffect(() => {
        if (open) {
            setName("");
            setFolderId(defaultFolderId ?? folders[0]?.id ?? 0);
            setAudience("new");
        }
    }, [open, defaultFolderId, folders]);

    const onSubmit = () => {
        const params = new URLSearchParams({ name, folder: String(folderId), audience });
        router.visit(`/qr-actions/create?${params.toString()}`);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogTitle className="text-center text-lg font-bold">QRコードアクション 新規作成</DialogTitle>
                <div className="space-y-5 pt-4">
                    <div className="space-y-2">
                        <div className="flex items-end justify-between">
                            <Label htmlFor="qr-name" className="text-sm font-bold">管理名</Label>
                            <span className="text-xs text-muted-foreground tabular-nums">{name.length}/{MAX_NAME}</span>
                        </div>
                        <Input id="qr-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX_NAME} placeholder="管理名" className="h-11" autoFocus />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold">フォルダ</Label>
                        <select value={folderId} onChange={(e) => setFolderId(Number(e.target.value))} className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
                            {folders.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold">稼働対象（作成後の変更はできません）</Label>
                        <RadioGroup value={audience} onValueChange={(v) => v && setAudience(v as QrAudience)} className="grid grid-cols-2 gap-3">
                            <AudienceCard value="new" label="新規友だちのみ" selected={audience === "new"} />
                            <AudienceCard value="all" label="全ての友だち" selected={audience === "all"} />
                        </RadioGroup>
                    </div>

                    <div className="pt-3 flex justify-center">
                        <button
                            disabled={name.length === 0}
                            onClick={onSubmit}
                            className="bg-blue-500 hover:bg-blue-600 text-white h-11 px-12 rounded-md font-bold disabled:opacity-50 transition-colors"
                        >
                            QRコードアクションの作成に進む
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AudienceCard({ value, label, selected }: { value: string; label: string; selected: boolean }) {
    return (
        <label
            className={cn(
                "flex items-center justify-between gap-3 rounded-md border-2 cursor-pointer transition-colors px-4 py-3",
                selected ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-border hover:border-blue-200",
            )}
        >
            <div className="flex items-center gap-3">
                <RadioGroupItem value={value} />
                <span className={cn("text-sm font-bold", selected ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")}>
                    {label}
                </span>
            </div>
            <FontAwesomeIcon icon={faCircleInfo} className="size-3.5 text-muted-foreground" />
        </label>
    );
}
