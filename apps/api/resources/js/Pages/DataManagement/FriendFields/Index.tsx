import { Head, Link, router, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faFolderPlus,
    faArrowsUpDown,
    faTrashCan,
    faFolderTree,
    faPenToSquare,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import {
    FIELD_TYPE_LABELS,
    type FriendField,
    type FriendFieldFolder,
} from "@/types/data-management";

type PageProps = {
    folders: FriendFieldFolder[];
    fields: FriendField[];
    filters: { folder: number | null };
};

function formatYmd(iso: string) {
    return iso.slice(0, 10).replace(/-/g, "/");
}

export default function FriendFieldsIndex({
    folders,
    fields,
    filters,
}: PageProps) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);

    const selectFolder = (folderId: number) => {
        router.get(
            "/data-management/friend-fields",
            { folder: folderId },
            { preserveScroll: true, preserveState: true },
        );
        setSelectedIds(new Set());
    };

    const deleteField = (f: FriendField) => {
        if (!confirm(`「${f.name}」を削除しますか？`)) return;
        router.delete(`/data-management/friend-fields/${f.id}`, {
            preserveScroll: true,
        });
    };

    const deleteFolder = (f: FriendFieldFolder) => {
        if (f.is_system) return;
        if (!confirm(`「${f.name}」を削除しますか？`)) return;
        router.delete(`/friend-field-folders/${f.id}`, { preserveScroll: true });
    };

    const allCheckedInView =
        fields.length > 0 && fields.every((f) => selectedIds.has(f.id));

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allCheckedInView) {
                for (const f of fields) next.delete(f.id);
            } else {
                for (const f of fields) next.add(f.id);
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
            <Head title="友だち情報管理" />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-3 border-b border-border">
                    <h1 className="text-lg font-bold tracking-tight">
                        友だち情報管理
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        友だち情報のページや1:1チャットに表示させる情報を追加で登録することができます。
                    </p>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
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
                                    className="grid place-items-center size-7 rounded text-muted-foreground/50"
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
                                                "flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors min-w-0",
                                                active
                                                    ? "bg-muted text-foreground"
                                                    : "text-foreground hover:bg-muted/50",
                                            )}
                                        >
                                            <span className="truncate">
                                                {f.name} (
                                                {f.friend_fields_count ?? 0})
                                            </span>
                                        </button>
                                        {!f.is_system && (
                                            <Button
                                                variant="ghost"
                                                className="size-7 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteFolder(f)}
                                                aria-label="削除"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className="size-3"
                                                />
                                            </Button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-6 py-3 flex-wrap">
                            <Link
                                href={`/data-management/friend-fields/new${filters.folder ? `?folder=${filters.folder}` : ""}`}
                                className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className="size-3"
                                />
                                新規作成
                            </Link>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    disabled
                                    className="h-9 bg-zinc-500 text-white opacity-50"
                                >
                                    <FontAwesomeIcon
                                        icon={faArrowsUpDown}
                                        className="size-3"
                                    />
                                    並べ替え
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={selectionCount === 0}
                                    className="h-9 bg-zinc-500 hover:bg-zinc-600 text-white disabled:opacity-50"
                                >
                                    <FontAwesomeIcon
                                        icon={faFolderTree}
                                        className="size-3"
                                    />
                                    一括フォルダ変更
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={selectionCount === 0}
                                    onClick={() => {
                                        if (
                                            !confirm(
                                                `${selectionCount} 件を削除しますか？`,
                                            )
                                        )
                                            return;
                                        selectedIds.forEach((id) =>
                                            router.delete(
                                                `/data-management/friend-fields/${id}`,
                                                { preserveScroll: true },
                                            ),
                                        );
                                        setSelectedIds(new Set());
                                    }}
                                    className="h-9 bg-zinc-400 hover:bg-zinc-500 text-white disabled:opacity-50"
                                >
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        className="size-3"
                                    />
                                    一括削除
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto px-6 pb-6">
                            <table className="w-full text-sm">
                                <thead className="bg-primary sticky top-0">
                                    <tr>
                                        <th className="w-10 px-3 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={allCheckedInView}
                                                onChange={toggleAll}
                                                disabled={fields.length === 0}
                                                className="size-4 rounded border-white/30 accent-white bg-white/10"
                                                aria-label="すべて選択"
                                            />
                                        </th>
                                        <th className="px-3 py-3 text-left font-bold text-primary-foreground w-40">
                                            作成日
                                        </th>
                                        <th className="px-3 py-3 text-left font-bold text-primary-foreground">
                                            管理名
                                        </th>
                                        <th className="px-3 py-3 text-left font-bold text-primary-foreground w-40">
                                            情報タイプ
                                        </th>
                                        <th className="px-3 py-3 text-left font-bold text-primary-foreground w-28">
                                            回答人数
                                        </th>
                                        <th className="px-3 py-3 text-left font-bold text-primary-foreground w-24">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-3 py-6 text-sm text-center text-muted-foreground"
                                            >
                                                データがありません。
                                            </td>
                                        </tr>
                                    ) : (
                                        fields.map((f) => {
                                            const checked = selectedIds.has(
                                                f.id,
                                            );
                                            return (
                                                <tr
                                                    key={f.id}
                                                    className={cn(
                                                        "border-b border-border hover:bg-muted/30",
                                                        checked &&
                                                            "bg-primary/5",
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
                                                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                        {formatYmd(f.created_at)}
                                                    </td>
                                                    <td className="px-3 py-3 font-medium">
                                                        {f.name}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs">
                                                        {
                                                            FIELD_TYPE_LABELS[
                                                                f.field_type
                                                            ]
                                                        }
                                                    </td>
                                                    <td className="px-3 py-3 text-xs tabular-nums">
                                                        {f.values_count ?? 0}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="inline-flex items-center gap-1">
                                                            <Link
                                                                href={`/data-management/friend-fields/${f.id}/edit`}
                                                                className="grid place-items-center size-8 rounded hover:bg-muted text-muted-foreground"
                                                                aria-label="編集"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPenToSquare
                                                                    }
                                                                    className="size-3.5"
                                                                />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteField(
                                                                        f,
                                                                    )
                                                                }
                                                                className="grid place-items-center size-8 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                                                                aria-label="削除"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faTrash
                                                                    }
                                                                    className="size-3.5"
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            <FolderDialog
                open={folderDialogOpen}
                onClose={() => setFolderDialogOpen(false)}
            />
        </>
    );
}

FriendFieldsIndex.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

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
        form.post("/friend-field-folders", {
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
                        <Label htmlFor="ff-folder-name">名前</Label>
                        <Input
                            id="ff-folder-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
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
