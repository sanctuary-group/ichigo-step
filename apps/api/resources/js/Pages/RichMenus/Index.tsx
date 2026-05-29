import { Head, router, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faMagnifyingGlass,
    faFolderPlus,
    faArrowsUpDown,
    faSort,
    faClockRotateLeft,
    faTrashCan,
    faFolderTree,
    faEyeSlash,
    faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { RichMenu, RichMenuFolder } from "@/types/rich-menu";

const MAX_NAME = 50;

type PageProps = {
    richMenus: RichMenu[];
    folders: RichMenuFolder[];
    filters: { folder: number | null; q: string };
};

function formatYmd(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}

export default function RichMenusIndex({
    richMenus,
    folders,
    filters,
}: PageProps) {
    const [query, setQuery] = useState(filters.q ?? "");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [folderVisible, setFolderVisible] = useState(true);
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const selectFolder = (folderId: number) => {
        router.get(
            "/rich-menus",
            { folder: folderId, q: filters.q || undefined },
            { preserveScroll: true, preserveState: true },
        );
        setSelectedIds(new Set());
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            "/rich-menus",
            { folder: filters.folder ?? undefined, q: query || undefined },
            { preserveScroll: true, preserveState: true },
        );
    };

    const deleteRichMenu = (m: RichMenu) => {
        const msg = m.is_published
            ? `「${m.name}」は公開中です。削除すると LINE 側のリッチメニューも取り下げられます。削除しますか？`
            : `「${m.name}」を削除しますか？`;
        if (!confirm(msg)) return;
        router.delete(`/rich-menus/${m.id}`, { preserveScroll: true });
    };

    const deleteFolder = (f: RichMenuFolder) => {
        if (f.is_system) return;
        const count = f.rich_menus_count ?? 0;
        const msg =
            count > 0
                ? `「${f.name}」を削除します。${count} 件のリッチメニューも一緒に削除されます。`
                : `「${f.name}」を削除しますか？`;
        if (!confirm(msg)) return;
        router.delete(`/rich-menu-folders/${f.id}`, { preserveScroll: true });
    };

    const allCheckedInView =
        richMenus.length > 0 && richMenus.every((m) => selectedIds.has(m.id));

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allCheckedInView) {
                for (const m of richMenus) next.delete(m.id);
            } else {
                for (const m of richMenus) next.add(m.id);
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
            <Head title="リッチメニュー" />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-border bg-muted/30">
                    <h1 className="text-lg font-bold tracking-tight">
                        リッチメニュー
                    </h1>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 rounded-md font-bold text-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} className="size-3.5" />
                        新規作成
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {folderVisible && (
                        <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border flex flex-col max-h-[40vh] md:max-h-none">
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="text-sm font-bold">フォルダ</div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setFolderDialogOpen(true)}
                                        className="grid place-items-center size-7 rounded hover:bg-muted text-muted-foreground"
                                        aria-label="フォルダ追加"
                                    >
                                        <FontAwesomeIcon
                                            icon={faFolderPlus}
                                            className="size-3.5"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className="grid place-items-center size-7 rounded hover:bg-muted text-muted-foreground disabled:opacity-40"
                                        aria-label="並べ替え"
                                    >
                                        <FontAwesomeIcon
                                            icon={faArrowsUpDown}
                                            className="size-3.5"
                                        />
                                    </button>
                                </div>
                            </div>
                            <ul className="flex-1 overflow-y-auto px-2 space-y-1">
                                {folders.map((f) => {
                                    const active = f.id === filters.folder;
                                    return (
                                        <li
                                            key={f.id}
                                            className="group flex items-center gap-1"
                                        >
                                            <button
                                                onClick={() => selectFolder(f.id)}
                                                className={cn(
                                                    "flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between gap-2 min-w-0",
                                                    active
                                                        ? "bg-muted text-foreground"
                                                        : "text-foreground hover:bg-muted/50",
                                                )}
                                            >
                                                <span className="truncate">
                                                    {f.name}
                                                </span>
                                                <span className="text-muted-foreground text-xs tabular-nums">
                                                    ({f.rich_menus_count ?? 0})
                                                </span>
                                            </button>
                                            {!f.is_system && (
                                                <button
                                                    onClick={() => deleteFolder(f)}
                                                    className="grid place-items-center size-7 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="削除"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTrashCan}
                                                        className="size-3"
                                                    />
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
                                <FontAwesomeIcon
                                    icon={faEyeSlash}
                                    className="size-3.5"
                                />
                                フォルダを非表示
                            </button>
                        </aside>
                    )}

                    <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border flex-wrap">
                            <form onSubmit={onSearch} className="relative w-72 max-w-full">
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                />
                                <Input
                                    placeholder="管理名を入力して検索"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </form>
                            <div className="flex items-center gap-2 flex-wrap">
                                {!folderVisible && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9"
                                        onClick={() => setFolderVisible(true)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faFolderTree}
                                            className="size-3.5"
                                        />
                                        フォルダを表示
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className="h-9" disabled>
                                    <FontAwesomeIcon
                                        icon={faClockRotateLeft}
                                        className="size-3.5"
                                    />
                                    操作予約・履歴
                                </Button>
                                <Button variant="outline" size="sm" className="h-9" disabled>
                                    <FontAwesomeIcon
                                        icon={faArrowsUpDown}
                                        className="size-3.5"
                                    />
                                    並べ替え
                                </Button>
                                <Button variant="outline" size="sm" className="h-9" disabled>
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        className="size-3.5"
                                    />
                                    削除したアイテム
                                </Button>
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
                                                disabled={richMenus.length === 0}
                                                className="size-4 rounded border-border accent-primary"
                                                aria-label="すべて選択"
                                            />
                                        </th>
                                        <SortableHeader label="管理名" />
                                        <th className="px-3 py-2 text-left font-bold text-foreground">
                                            設定済みアクション
                                        </th>
                                        <SortableHeader label="作成日" className="w-32" />
                                        <SortableHeader label="最終編集日" className="w-32" />
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-20">
                                            操作
                                        </th>
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-20">
                                            表示中
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {richMenus.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className="flex flex-col items-center justify-center py-24 gap-2 text-muted-foreground">
                                                    <FontAwesomeIcon
                                                        icon={faInbox}
                                                        className="size-14 text-muted-foreground/30"
                                                    />
                                                    <div className="text-sm">
                                                        まだデータがありません
                                                    </div>
                                                    <div className="text-xs">
                                                        <button
                                                            onClick={() =>
                                                                setCreateOpen(true)
                                                            }
                                                            className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                                                        >
                                                            新規作成
                                                        </button>{" "}
                                                        するとここにデータが表示されます
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        richMenus.map((m) => {
                                            const checked = selectedIds.has(m.id);
                                            const actionCount = (
                                                m.areas ?? []
                                            ).filter(
                                                (a) => a.type !== "none",
                                            ).length;
                                            return (
                                                <tr
                                                    key={m.id}
                                                    className={cn(
                                                        "border-b border-border hover:bg-muted/30",
                                                        checked && "bg-primary/5",
                                                    )}
                                                >
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() =>
                                                                toggleRow(m.id)
                                                            }
                                                            className="size-4 rounded border-border accent-primary"
                                                            aria-label={`${m.name} を選択`}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <a
                                                            href={`/rich-menus/${m.id}/edit`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {m.name}
                                                        </a>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground">
                                                        {actionCount} 件
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                        {formatYmd(m.created_at)}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                        {formatYmd(m.updated_at)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <button
                                                            onClick={() =>
                                                                deleteRichMenu(m)
                                                            }
                                                            className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                                                            aria-label="削除"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrashCan}
                                                                className="size-3.5"
                                                            />
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs">
                                                        {m.is_published ? (
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                                公開中
                                                            </span>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border flex-wrap">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={selectionCount === 0}
                                    className="h-9 disabled:opacity-50"
                                >
                                    <FontAwesomeIcon
                                        icon={faFolderTree}
                                        className="size-3.5"
                                    />
                                    一括フォルダ変更
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={selectionCount === 0}
                                    className="h-9 disabled:opacity-50 text-destructive hover:text-destructive"
                                >
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        className="size-3.5"
                                    />
                                    一括削除
                                </Button>
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                全 {richMenus.length} 件
                            </span>
                        </div>
                    </section>
                </div>
            </div>

            <FolderDialog
                open={folderDialogOpen}
                onClose={() => setFolderDialogOpen(false)}
            />
            <CreateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                folders={folders}
                defaultFolderId={filters.folder ?? folders[0]?.id ?? null}
            />
        </>
    );
}

RichMenusIndex.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function SortableHeader({
    label,
    className,
}: {
    label: string;
    className?: string;
}) {
    return (
        <th
            className={cn(
                "px-3 py-2 text-left font-bold text-foreground",
                className,
            )}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                <FontAwesomeIcon
                    icon={faSort}
                    className="size-2.5 text-muted-foreground"
                />
            </span>
        </th>
    );
}

function FolderDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const form = useForm({ name: "" });

    useEffect(() => {
        if (open) {
            form.setData({ name: "" });
            form.clearErrors();
        }
    }, [open]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.post("/rich-menu-folders", {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>フォルダを追加</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="rmf-name">名前</Label>
                        <Input
                            id="rmf-name"
                            value={form.data.name}
                            onChange={(e) => form.setData("name", e.target.value)}
                            autoFocus
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={form.processing}
                        >
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "保存中..." : "作成"}
                        </Button>
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
    folders: RichMenuFolder[];
    defaultFolderId: number | null;
}) {
    const [name, setName] = useState("");
    const [folderId, setFolderId] = useState<number>(defaultFolderId ?? 0);
    const [addToTop, setAddToTop] = useState(false);

    useEffect(() => {
        if (open) {
            setName("");
            setFolderId(defaultFolderId ?? folders[0]?.id ?? 0);
            setAddToTop(false);
        }
    }, [open, defaultFolderId, folders]);

    const onSubmit = () => {
        const params = new URLSearchParams({
            name,
            folder: String(folderId),
        });
        router.visit(`/rich-menus/create?${params.toString()}`);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-xl">
                <DialogTitle className="text-base font-bold">
                    リッチメニュー 新規作成
                </DialogTitle>

                <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <div className="flex items-end justify-between">
                            <Label htmlFor="rm-name" className="text-sm font-bold">
                                管理名
                            </Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {name.length}/{MAX_NAME}
                            </span>
                        </div>
                        <Input
                            id="rm-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={MAX_NAME}
                            placeholder="管理名を入力して下さい"
                            className="h-11"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold">フォルダ</Label>
                        <select
                            value={folderId}
                            onChange={(e) => setFolderId(Number(e.target.value))}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {folders.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={addToTop}
                            onChange={(e) => setAddToTop(e.target.checked)}
                            className="size-4 rounded border-border accent-primary"
                        />
                        フォルダ内の一番上に追加する
                    </label>

                    <p className="text-xs text-muted-foreground">
                        ※ 未選択の場合、フォルダの一番下に追加されます
                    </p>

                    <div className="pt-2 flex justify-end">
                        <button
                            disabled={name.length === 0}
                            onClick={onSubmit}
                            className="inline-flex items-center bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 rounded-md font-bold text-sm disabled:opacity-50 transition-colors"
                        >
                            リッチメニューの登録に進む
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
