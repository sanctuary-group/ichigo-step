import { Head, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faPenToSquare,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagBadge } from "@/components/tag-badge";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/chat";

type TagWithCount = Tag & { friends_count: number };

type PageProps = {
    tags: TagWithCount[];
    flash?: { success?: string; error?: string };
};

const COLOR_PRESETS = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#94a3b8", // slate (default)
];

export default function TagsIndex() {
    const { props } = usePage<PageProps>();
    const [editing, setEditing] = useState<TagWithCount | null>(null);
    const [creating, setCreating] = useState(false);
    const [toast, setToast] = useState<
        { kind: "success" | "error"; text: string } | null
    >(null);

    useEffect(() => {
        if (props.flash?.success) {
            setToast({ kind: "success", text: props.flash.success });
        } else if (props.flash?.error) {
            setToast({ kind: "error", text: props.flash.error });
        }
    }, [props.flash?.success, props.flash?.error]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const handleDelete = (tag: TagWithCount) => {
        const note =
            tag.friends_count > 0
                ? `「${tag.name}」を削除します。${tag.friends_count} 件の友だちから外されます。`
                : `「${tag.name}」を削除しますか？`;
        if (!confirm(note)) return;
        router.delete(`/tags/${tag.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="タグ管理" />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                タグ管理
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                友だちを分類するためのタグを管理します
                            </p>
                        </div>
                        <Button onClick={() => setCreating(true)}>
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="size-3.5"
                            />
                            タグを作成
                        </Button>
                    </div>

                    {toast && (
                        <div
                            className={
                                toast.kind === "success"
                                    ? "rounded-md px-3 py-2 text-sm bg-primary/10 text-primary"
                                    : "rounded-md px-3 py-2 text-sm bg-destructive/10 text-destructive"
                            }
                        >
                            {toast.text}
                        </div>
                    )}

                    {props.tags.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                まだタグが登録されていません
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {props.tags.map((tag) => (
                                <Card key={tag.id}>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <TagBadge tag={tag} />
                                            <div className="text-xs text-muted-foreground">
                                                {tag.friends_count} 人に付与
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="size-9 p-0"
                                            aria-label="編集"
                                            onClick={() => setEditing(tag)}
                                        >
                                            <FontAwesomeIcon
                                                icon={faPenToSquare}
                                                className="size-3.5"
                                            />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="size-9 p-0 text-muted-foreground hover:text-destructive"
                                            aria-label="削除"
                                            onClick={() => handleDelete(tag)}
                                        >
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className="size-3.5"
                                            />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <TagDialog
                open={creating}
                onOpenChange={setCreating}
                tag={null}
            />
            <TagDialog
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
                tag={editing}
            />
        </>
    );
}

function TagDialog({
    open,
    onOpenChange,
    tag,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tag: TagWithCount | null;
}) {
    const form = useForm({
        name: tag?.name ?? "",
        color: tag?.color ?? COLOR_PRESETS[8],
    });

    useEffect(() => {
        if (open) {
            form.setData({
                name: tag?.name ?? "",
                color: tag?.color ?? COLOR_PRESETS[8],
            });
            form.clearErrors();
        }
    }, [open, tag?.id]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const onSuccess = () => onOpenChange(false);
        if (tag) {
            form.patch(`/tags/${tag.id}`, {
                preserveScroll: true,
                onSuccess,
            });
        } else {
            form.post("/tags", { preserveScroll: true, onSuccess });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {tag ? "タグを編集" : "タグを作成"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="tag-name">タグ名</Label>
                        <Input
                            id="tag-name"
                            placeholder="例: VIP / リード / 問合せ"
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

                    <div className="space-y-1.5">
                        <Label>色</Label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`色 ${color}`}
                                    onClick={() => form.setData("color", color)}
                                    className={cn(
                                        "size-8 rounded-full border-2 transition-all",
                                        form.data.color === color
                                            ? "scale-110 border-foreground"
                                            : "border-transparent hover:scale-105",
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        {form.errors.color && (
                            <p className="text-xs text-destructive">
                                {form.errors.color}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>プレビュー</Label>
                        <div className="p-3 rounded-md bg-muted/40">
                            <TagBadge
                                tag={{
                                    id: 0,
                                    organization_id: 0,
                                    name: form.data.name || "プレビュー",
                                    color: form.data.color,
                                }}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={form.processing}
                        >
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? "保存中..."
                                : tag
                                    ? "更新"
                                    : "作成"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

TagsIndex.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
