import { Head, router, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faTrash,
    faFolder,
    faFolderPlus,
    faArrowsUpDown,
    faMagnifyingGlass,
    faAngleDoubleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { Scenario, ScenarioFolder } from "@/types/scenario";

const MAX_SCENARIO_NAME = 100;

type PageProps = {
    scenarios: Scenario[];
    folders: ScenarioFolder[];
    filters: { folder: number | null; q: string };
};

export default function ScenariosIndex({
    scenarios,
    folders,
    filters,
}: PageProps) {
    const [query, setQuery] = useState(filters.q ?? "");
    const [searchOpen, setSearchOpen] = useState(!!filters.q);
    const [showFolderPane, setShowFolderPane] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const selectFolder = (folderId: number) => {
        router.get(
            "/scenarios",
            { folder: folderId, q: filters.q || undefined },
            { preserveScroll: true, preserveState: true },
        );
        setSelectedIds(new Set());
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            "/scenarios",
            {
                folder: filters.folder ?? undefined,
                q: query || undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const deleteScenario = (s: Scenario) => {
        if (!confirm(`「${s.name}」を削除しますか？`)) return;
        router.delete(`/scenarios/${s.id}`, { preserveScroll: true });
    };

    const toggleActive = (s: Scenario) => {
        router.patch(
            `/scenarios/${s.id}/toggle-active`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const deleteFolder = (f: ScenarioFolder) => {
        if (f.is_system) return;
        const count = f.scenarios_count ?? 0;
        const msg =
            count > 0
                ? `「${f.name}」を削除します。${count} 件のシナリオも一緒に削除されます。`
                : `「${f.name}」を削除しますか？`;
        if (!confirm(msg)) return;
        router.delete(`/scenario-folders/${f.id}`, { preserveScroll: true });
    };

    const allCheckedInView =
        scenarios.length > 0 && scenarios.every((s) => selectedIds.has(s.id));
    const hasSelection = selectedIds.size > 0;

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allCheckedInView) {
                for (const s of scenarios) next.delete(s.id);
            } else {
                for (const s of scenarios) next.add(s.id);
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
            <Head title="ステップ配信" />
            <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        ステップ配信
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        ステップ配信とは、友だちに対し事前に準備したメッセージを、設定した順番と間隔で自動的に配信する機能です。
                    </p>
                </div>

                <hr className="border-border" />

                <div className="flex-1 flex overflow-hidden gap-6">
                    {showFolderPane && (
                        <aside className="w-56 shrink-0 flex flex-col gap-3 overflow-hidden">
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

                            <ul className="flex-1 overflow-y-auto space-y-1">
                                {folders.map((f) => {
                                    const active = f.id === filters.folder;
                                    return (
                                        <li
                                            key={f.id}
                                            className="group flex items-center gap-1"
                                        >
                                            <button
                                                onClick={() =>
                                                    selectFolder(f.id)
                                                }
                                                className={cn(
                                                    "flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors min-w-0",
                                                    active
                                                        ? "bg-muted text-foreground"
                                                        : "text-foreground hover:bg-muted/50",
                                                )}
                                            >
                                                <span className="truncate">
                                                    {f.name} (
                                                    {f.scenarios_count ?? 0})
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

                            <button
                                onClick={() => setShowFolderPane(false)}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-2"
                            >
                                <FontAwesomeIcon
                                    icon={faAngleDoubleLeft}
                                    className="size-3"
                                />
                                フォルダを非表示
                            </button>
                        </aside>
                    )}

                    <section className="flex-1 flex flex-col overflow-hidden min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                {!showFolderPane && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9"
                                        onClick={() => setShowFolderPane(true)}
                                    >
                                        フォルダを表示
                                    </Button>
                                )}
                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                >
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="size-3"
                                    />
                                    新規作成
                                </button>
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

                            {searchOpen ? (
                                <form
                                    onSubmit={onSearch}
                                    className="relative w-64"
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
                                        onBlur={() =>
                                            !query && setSearchOpen(false)
                                        }
                                        autoFocus
                                        className="pl-9 h-9"
                                    />
                                </form>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-9"
                                    onClick={() => setSearchOpen(true)}
                                    aria-label="検索"
                                >
                                    <FontAwesomeIcon
                                        icon={faMagnifyingGlass}
                                        className="size-3.5"
                                    />
                                </Button>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="w-10 px-3 py-2 text-left">
                                            <input
                                                type="checkbox"
                                                checked={allCheckedInView}
                                                onChange={toggleAll}
                                                disabled={scenarios.length === 0}
                                                className="size-4 rounded border-border accent-primary"
                                                aria-label="すべて選択"
                                            />
                                        </th>
                                        <th className="px-3 py-2 text-left font-bold text-foreground">
                                            管理名
                                        </th>
                                        <th className="px-3 py-2 text-right font-bold text-foreground w-40">
                                            購読中の友だち
                                        </th>
                                        <th className="px-3 py-2 text-right font-bold text-foreground w-40">
                                            途中で終了した友だち
                                        </th>
                                        <th className="px-3 py-2 text-right font-bold text-foreground w-40">
                                            読了済の友だち
                                        </th>
                                        <th className="px-3 py-2 text-center font-bold text-foreground w-24">
                                            稼働
                                        </th>
                                        <th className="px-3 py-2 text-left font-bold text-foreground w-20">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scenarios.length === 0 ? (
                                        <tr className="border-b border-border">
                                            <td
                                                colSpan={7}
                                                className="px-3 py-12 text-center text-sm text-muted-foreground"
                                            >
                                                データがありません。
                                            </td>
                                        </tr>
                                    ) : (
                                        scenarios.map((s) => {
                                            const checked = selectedIds.has(
                                                s.id,
                                            );
                                            return (
                                                <tr
                                                    key={s.id}
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
                                                                toggleRow(s.id)
                                                            }
                                                            className="size-4 rounded border-border accent-primary"
                                                            aria-label={`${s.name} を選択`}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <a
                                                            href={`/scenarios/${s.id}/edit`}
                                                            className="text-sm font-medium hover:underline"
                                                        >
                                                            {s.name}
                                                        </a>
                                                        {s.description && (
                                                            <div className="text-[11px] text-muted-foreground truncate max-w-md">
                                                                {s.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm tabular-nums">
                                                        {(
                                                            s.active_count ?? 0
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm tabular-nums">
                                                        {(
                                                            s.terminated_count ??
                                                            0
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm tabular-nums">
                                                        {(
                                                            s.completed_count ??
                                                            0
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Switch
                                                                checked={
                                                                    s.is_active
                                                                }
                                                                onCheckedChange={() =>
                                                                    toggleActive(
                                                                        s,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    s.is_active
                                                                        ? "停止する"
                                                                        : "稼働する"
                                                                }
                                                            />
                                                            <span
                                                                className={cn(
                                                                    "text-[11px]",
                                                                    s.is_active
                                                                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                                                        : "text-muted-foreground",
                                                                )}
                                                            >
                                                                {s.is_active
                                                                    ? "稼働中"
                                                                    : "停止中"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <button
                                                            onClick={() =>
                                                                deleteScenario(
                                                                    s,
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                                                            aria-label="削除"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                                className="size-3.5"
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 mt-auto">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!hasSelection}
                                    className="h-9"
                                >
                                    <FontAwesomeIcon
                                        icon={faFolder}
                                        className="size-3"
                                    />
                                    一括フォルダ変更
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!hasSelection}
                                    className="h-9 text-destructive hover:text-destructive"
                                >
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="size-3"
                                    />
                                    一括削除
                                </Button>
                            </div>

                            <span className="text-xs text-muted-foreground tabular-nums">
                                全 {scenarios.length} 件
                            </span>
                        </div>
                    </section>
                </div>
            </div>

            <FolderDialog
                open={folderDialogOpen}
                onClose={() => setFolderDialogOpen(false)}
            />
            <CreateScenarioDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                folders={folders}
                defaultFolderId={filters.folder ?? folders[0]?.id ?? null}
            />
        </>
    );
}

ScenariosIndex.layout = (page: React.ReactNode) => (
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
        form.post("/scenario-folders", {
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
                        <Label htmlFor="sc-folder-name">名前</Label>
                        <Input
                            id="sc-folder-name"
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

function CreateScenarioDialog({
    open,
    onClose,
    folders,
    defaultFolderId,
}: {
    open: boolean;
    onClose: () => void;
    folders: ScenarioFolder[];
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
        const params = new URLSearchParams({
            name,
            folder: String(folderId),
        });
        router.visit(`/scenarios/create?${params.toString()}`);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle className="text-center text-lg font-bold">
                    ステップ配信 新規作成
                </DialogTitle>

                <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <div className="flex items-end justify-between">
                            <Label
                                htmlFor="sc-name"
                                className="text-sm font-bold"
                            >
                                管理名
                            </Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {name.length}/{MAX_SCENARIO_NAME}
                            </span>
                        </div>
                        <Input
                            id="sc-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={MAX_SCENARIO_NAME}
                            className="h-11"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold">フォルダ</Label>
                        <select
                            value={folderId}
                            onChange={(e) =>
                                setFolderId(Number(e.target.value))
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
                            variant="outline"
                            disabled={name.length === 0}
                            className="border-primary text-primary hover:bg-primary/10 hover:text-primary px-10 h-11 disabled:opacity-50"
                            onClick={onSubmit}
                        >
                            メッセージの登録に進む
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
