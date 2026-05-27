import { Head, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faMagnifyingGlass,
    faPenToSquare,
    faTrash,
    faFolderPlus,
    faArrowsUpDown,
    faSort,
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
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { Template, TemplateFolder } from "@/types/template";

const MAX_TEMPLATE_NAME = 50;
const MAX_TEMPLATE_CONTENT = 5000;

type PageProps = {
    folders: TemplateFolder[];
    templates: Template[];
    filters: { folder: number | null; q: string };
};

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

function formatYmd(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

export default function TemplatesIndex() {
    const { props } = usePage<PageProps>();
    const { folders, templates, filters } = props;
    const [query, setQuery] = useState(filters.q ?? "");
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Template | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const selectFolder = (folderId: number) => {
        router.get(
            "/templates",
            { folder: folderId, q: filters.q || undefined },
            { preserveScroll: true, preserveState: true },
        );
        setSelectedIds(new Set());
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            "/templates",
            {
                folder: filters.folder ?? undefined,
                q: query || undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const deleteTemplate = (t: Template) => {
        if (!confirm(`「${t.name}」を削除しますか？`)) return;
        router.delete(`/templates/${t.id}`, { preserveScroll: true });
    };

    const deleteFolder = (f: TemplateFolder) => {
        if (f.is_system) return;
        const count = f.templates_count ?? 0;
        const msg =
            count > 0
                ? `「${f.name}」を削除します。${count} 件のテンプレートも未分類に移動します。`
                : `「${f.name}」を削除しますか？`;
        if (!confirm(msg)) return;
        router.delete(`/template-folders/${f.id}`, { preserveScroll: true });
    };

    const allCheckedInView =
        templates.length > 0 && templates.every((t) => selectedIds.has(t.id));

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allCheckedInView) {
                for (const t of templates) next.delete(t.id);
            } else {
                for (const t of templates) next.add(t.id);
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

    return (
        <>
            <Head title="テンプレート" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
                <h1 className="text-2xl font-bold tracking-tight">
                    テンプレート
                </h1>

                <hr className="border-border" />

                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-6">
                    <aside className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-9"
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
                                className="h-9"
                                disabled
                            >
                                <FontAwesomeIcon
                                    icon={faArrowsUpDown}
                                    className="size-3"
                                />
                                並べ替え
                            </Button>
                        </div>

                        <ul className="space-y-1">
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
                                                {f.name} ({f.templates_count ?? 0})
                                            </span>
                                        </button>
                                        {!f.is_system && (
                                            <Button
                                                variant="ghost"
                                                className="size-7 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() =>
                                                    deleteFolder(f)
                                                }
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

                    <section className="space-y-3 min-w-0">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    className="h-9 bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="size-3"
                                    />
                                    新規作成
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    disabled
                                >
                                    <FontAwesomeIcon
                                        icon={faArrowsUpDown}
                                        className="size-3"
                                    />
                                    並べ替え
                                </Button>
                            </div>
                            <form
                                onSubmit={onSearch}
                                className="relative w-72 max-w-full"
                            >
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                />
                                <Input
                                    placeholder="管理名を入力"
                                    value={query}
                                    onChange={(e) =>
                                        setQuery(e.target.value)
                                    }
                                    className="pl-9 h-9"
                                />
                            </form>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="w-10 px-3 py-2 text-left">
                                            <input
                                                type="checkbox"
                                                checked={allCheckedInView}
                                                onChange={toggleAll}
                                                disabled={templates.length === 0}
                                                className="size-4 rounded border-border accent-primary"
                                                aria-label="すべて選択"
                                            />
                                        </th>
                                        <SortableHeader label="管理名" />
                                        <th className="px-3 py-2 text-left font-bold text-foreground">
                                            内容
                                        </th>
                                        <SortableHeader
                                            label="作成日"
                                            className="w-32"
                                        />
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-24">
                                            最終
                                        </th>
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-24">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.length === 0 ? (
                                        <tr className="border-b border-border">
                                            <td
                                                colSpan={6}
                                                className="px-3 py-5 text-sm font-bold text-foreground"
                                            >
                                                データがありません。
                                            </td>
                                        </tr>
                                    ) : (
                                        templates.map((t) => {
                                            const checked = selectedIds.has(t.id);
                                            return (
                                                <tr
                                                    key={t.id}
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
                                                                toggleRow(t.id)
                                                            }
                                                            className="size-4 rounded border-border accent-primary"
                                                            aria-label={`${t.name} を選択`}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="text-sm font-medium truncate">
                                                            {t.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                                                            {t.content || (
                                                                <span className="italic">
                                                                    （内容未設定）
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                        {formatYmd(t.created_at)}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                        {formatYmd(t.updated_at)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="inline-flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                className="size-9 p-0"
                                                                aria-label="編集"
                                                                onClick={() =>
                                                                    setEditing(t)
                                                                }
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPenToSquare
                                                                    }
                                                                    className="size-3.5"
                                                                />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="size-9 p-0 text-muted-foreground hover:text-destructive"
                                                                aria-label="削除"
                                                                onClick={() =>
                                                                    deleteTemplate(
                                                                        t,
                                                                    )
                                                                }
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={faTrash}
                                                                    className="size-3.5"
                                                                />
                                                            </Button>
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
            <CreateTemplateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                folders={folders}
                defaultFolderId={filters.folder ?? folders[0]?.id ?? null}
            />
            <EditTemplateDialog
                template={editing}
                onClose={() => setEditing(null)}
                folders={folders}
            />
        </>
    );
}

TemplatesIndex.layout = (page: React.ReactNode) => (
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
        form.post("/template-folders", {
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
                        <Label htmlFor="folder-name">名前</Label>
                        <Input
                            id="folder-name"
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

function CreateTemplateDialog({
    open,
    onClose,
    folders,
    defaultFolderId,
}: {
    open: boolean;
    onClose: () => void;
    folders: TemplateFolder[];
    defaultFolderId: number | null;
}) {
    const form = useForm({
        name: "",
        template_folder_id: defaultFolderId ?? 0,
    });

    useEffect(() => {
        if (open) {
            form.setData({
                name: "",
                template_folder_id: defaultFolderId ?? 0,
            });
            form.clearErrors();
        }
    }, [open, defaultFolderId]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.post("/templates", {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle className="text-center text-lg font-bold">
                    テンプレート作成
                </DialogTitle>
                <form onSubmit={onSubmit} className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <div className="flex items-end justify-between">
                            <Label htmlFor="tpl-name" className="text-sm font-bold">
                                管理名
                            </Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {form.data.name.length}/{MAX_TEMPLATE_NAME}
                            </span>
                        </div>
                        <Input
                            id="tpl-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                            maxLength={MAX_TEMPLATE_NAME}
                            className="h-11"
                            autoFocus
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold">フォルダ</Label>
                        <select
                            value={form.data.template_folder_id}
                            onChange={(e) =>
                                form.setData(
                                    "template_folder_id",
                                    Number(e.target.value),
                                )
                            }
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {folders.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2 flex justify-center">
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={
                                form.data.name.length === 0 || form.processing
                            }
                            className="border-primary text-primary hover:bg-primary/10 hover:text-primary px-10 h-11 disabled:opacity-50"
                        >
                            {form.processing
                                ? "作成中..."
                                : "テンプレートを作成"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditTemplateDialog({
    template,
    onClose,
    folders,
}: {
    template: Template | null;
    onClose: () => void;
    folders: TemplateFolder[];
}) {
    const form = useForm({
        name: template?.name ?? "",
        content: template?.content ?? "",
        template_folder_id: template?.template_folder_id ?? 0,
    });

    useEffect(() => {
        if (template) {
            form.setData({
                name: template.name,
                content: template.content,
                template_folder_id: template.template_folder_id ?? 0,
            });
            form.clearErrors();
        }
    }, [template?.id]);

    if (!template) return null;

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.patch(`/templates/${template.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>テンプレートを編集</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-end justify-between">
                            <Label htmlFor="tpl-edit-name">管理名</Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {form.data.name.length}/{MAX_TEMPLATE_NAME}
                            </span>
                        </div>
                        <Input
                            id="tpl-edit-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                            maxLength={MAX_TEMPLATE_NAME}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>フォルダ</Label>
                        <select
                            value={form.data.template_folder_id}
                            onChange={(e) =>
                                form.setData(
                                    "template_folder_id",
                                    Number(e.target.value),
                                )
                            }
                            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {folders.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-end justify-between">
                            <Label htmlFor="tpl-edit-content">内容</Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {form.data.content.length}/
                                {MAX_TEMPLATE_CONTENT}
                            </span>
                        </div>
                        <Textarea
                            id="tpl-edit-content"
                            value={form.data.content}
                            onChange={(e) =>
                                form.setData("content", e.target.value)
                            }
                            maxLength={MAX_TEMPLATE_CONTENT}
                            rows={6}
                            placeholder="メッセージ本文を入力..."
                        />
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
                            {form.processing ? "保存中..." : "更新"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
