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
    faEyeSlash,
    faFileLines,
    faUpRightFromSquare,
    faCopy,
    faChartSimple,
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
import type { FormModel, FormFolder, FormType } from "@/types/form";

const MAX_NAME = 100;

const TYPE_LABEL: Record<FormType, string> = {
    standard: "標準",
    survey: "アンケート",
    reservation: "予約",
};

type PageProps = {
    forms: FormModel[];
    folders: FormFolder[];
    filters: { folder: number | null; q: string };
};

function formatYmd(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}

export default function FormsIndex({ forms, folders, filters }: PageProps) {
    const [query, setQuery] = useState(filters.q ?? "");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [folderVisible, setFolderVisible] = useState(true);
    const [searchOpen, setSearchOpen] = useState(!!filters.q);
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const selectFolder = (folderId: number) => {
        router.get(
            "/forms",
            { folder: folderId, q: filters.q || undefined },
            { preserveScroll: true, preserveState: true },
        );
        setSelectedIds(new Set());
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            "/forms",
            { folder: filters.folder ?? undefined, q: query || undefined },
            { preserveScroll: true, preserveState: true },
        );
    };

    const deleteForm = (f: FormModel) => {
        if (!confirm(`「${f.name}」を削除しますか？回答データも削除されます。`)) return;
        router.delete(`/forms/${f.id}`, { preserveScroll: true });
    };

    const deleteFolder = (f: FormFolder) => {
        if (f.is_system) return;
        const count = f.forms_count ?? 0;
        const msg =
            count > 0
                ? `「${f.name}」を削除します。${count} 件のフォームも一緒に削除されます。`
                : `「${f.name}」を削除しますか？`;
        if (!confirm(msg)) return;
        router.delete(`/form-folders/${f.id}`, { preserveScroll: true });
    };

    const copyUrl = async (f: FormModel) => {
        if (!f.public_url) return;
        try {
            await navigator.clipboard.writeText(f.public_url);
            setCopiedId(f.id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            /* noop */
        }
    };

    const allCheckedInView =
        forms.length > 0 && forms.every((f) => selectedIds.has(f.id));

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allCheckedInView) {
                for (const f of forms) next.delete(f.id);
            } else {
                for (const f of forms) next.add(f.id);
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
            <Head title="フォーム作成" />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-3 border-b border-border">
                    <h1 className="text-lg font-bold tracking-tight">フォーム作成</h1>
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
                                    <FontAwesomeIcon
                                        icon={faFolderPlus}
                                        className="size-3"
                                    />
                                    フォルダ追加
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-9 px-2"
                                    disabled
                                >
                                    <FontAwesomeIcon
                                        icon={faArrowsUpDown}
                                        className="size-3"
                                    />
                                    並べ替え
                                </Button>
                            </div>
                            <ul className="flex-1 overflow-y-auto p-2 space-y-1">
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
                                                    "flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors min-w-0 flex items-center justify-between gap-2",
                                                    active
                                                        ? "bg-muted text-foreground"
                                                        : "text-foreground hover:bg-muted/50",
                                                )}
                                            >
                                                <span className="truncate">
                                                    {f.name}
                                                </span>
                                                <span className="text-muted-foreground text-xs tabular-nums">
                                                    ({f.forms_count ?? 0})
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
                                <FontAwesomeIcon icon={faEyeSlash} className="size-3.5" />
                                フォルダを非表示
                            </button>
                        </aside>
                    )}

                    <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border flex-wrap">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="size-3" />
                                    新規作成
                                </button>
                                <Button variant="outline" size="sm" className="h-9" disabled>
                                    <FontAwesomeIcon
                                        icon={faArrowsUpDown}
                                        className="size-3"
                                    />
                                    並べ替え
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
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
                                {searchOpen ? (
                                    <form onSubmit={onSearch} className="relative w-64">
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSearchOpen(true)}
                                        className="size-9"
                                        aria-label="検索"
                                    >
                                        <FontAwesomeIcon
                                            icon={faMagnifyingGlass}
                                            className="size-3.5 text-muted-foreground"
                                        />
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
                                                disabled={forms.length === 0}
                                                className="size-4 rounded border-border accent-primary"
                                                aria-label="すべて選択"
                                            />
                                        </th>
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-24">
                                            公開状態
                                        </th>
                                        <SortableHeader label="管理名" />
                                        <th className="px-3 py-2 text-left font-bold text-foreground">
                                            配信用URL
                                        </th>
                                        <SortableHeader label="タイプ" className="w-24" />
                                        <SortableHeader label="作成日" className="w-32" />
                                        <SortableHeader
                                            label="最終編集日"
                                            className="w-32"
                                        />
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-24">
                                            クイックテスト
                                        </th>
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-24">
                                            回答情報
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forms.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="px-3 py-12 text-sm text-center text-muted-foreground"
                                            >
                                                フォームが登録されていません。
                                            </td>
                                        </tr>
                                    ) : (
                                        forms.map((f) => {
                                            const checked = selectedIds.has(f.id);
                                            return (
                                                <tr
                                                    key={f.id}
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
                                                                toggleRow(f.id)
                                                            }
                                                            className="size-4 rounded border-border accent-primary"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-xs">
                                                        <StatusBadge
                                                            status={f.status}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 font-medium">
                                                        <a
                                                            href={`/forms/${f.id}/edit`}
                                                            className="hover:underline"
                                                        >
                                                            {f.name}
                                                        </a>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground">
                                                        {f.status === "published" &&
                                                        f.public_url ? (
                                                            <div className="flex items-center gap-2 max-w-[280px]">
                                                                <span className="truncate">
                                                                    {f.public_url}
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        copyUrl(f)
                                                                    }
                                                                    className="shrink-0 text-muted-foreground hover:text-foreground"
                                                                    aria-label="URLをコピー"
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faCopy}
                                                                        className="size-3"
                                                                    />
                                                                </button>
                                                                {copiedId ===
                                                                    f.id && (
                                                                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0">
                                                                        コピー済
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground/60">
                                                                公開後に発行
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs">
                                                        {TYPE_LABEL[f.form_type]}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                        {formatYmd(f.created_at)}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                        {formatYmd(f.updated_at)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {f.status === "published" &&
                                                        f.public_url ? (
                                                            <a
                                                                href={f.public_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                                                                aria-label="回答ページを開く"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faUpRightFromSquare
                                                                    }
                                                                    className="size-3.5"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground/50 text-xs">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs">
                                                        <a
                                                            href={`/forms/${f.id}/responses`}
                                                            className="inline-flex items-center gap-1.5 text-foreground hover:underline tabular-nums"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faChartSimple}
                                                                className="size-3 text-muted-foreground"
                                                            />
                                                            {f.responses_count ?? 0}
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-start gap-3 px-6 py-3 border-t border-border flex-wrap">
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
                            <span className="text-xs text-muted-foreground tabular-nums ml-auto">
                                全 {forms.length} 件
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

FormsIndex.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function StatusBadge({ status }: { status: FormModel["status"] }) {
    if (status === "published")
        return (
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                公開中
            </span>
        );
    if (status === "closed")
        return <span className="text-muted-foreground">終了</span>;
    return <span className="text-muted-foreground">下書き</span>;
}

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
        form.post("/form-folders", {
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
                        <Label htmlFor="fmf-name">名前</Label>
                        <Input
                            id="fmf-name"
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
    folders: FormFolder[];
    defaultFolderId: number | null;
}) {
    const [name, setName] = useState("");
    const [folderId, setFolderId] = useState<number>(defaultFolderId ?? 0);

    useEffect(() => {
        if (open) {
            setName("");
            setFolderId(defaultFolderId ?? folders[0]?.id ?? 0);
        }
    }, [open, defaultFolderId, folders]);

    const onSubmit = () => {
        const params = new URLSearchParams({ name, folder: String(folderId) });
        router.visit(`/forms/create?${params.toString()}`);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle className="text-center text-lg font-bold">
                    フォーム 新規作成
                </DialogTitle>
                <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <div className="flex items-end justify-between">
                            <Label htmlFor="fm-name" className="text-sm font-bold">
                                管理名
                            </Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {name.length}/{MAX_NAME}
                            </span>
                        </div>
                        <Input
                            id="fm-name"
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
                    <div className="pt-2 flex justify-end">
                        <button
                            disabled={name.length === 0}
                            onClick={onSubmit}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 rounded-md font-bold text-sm disabled:opacity-50 transition-colors"
                        >
                            <FontAwesomeIcon icon={faFileLines} className="size-3.5" />
                            フォームの作成に進む
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
