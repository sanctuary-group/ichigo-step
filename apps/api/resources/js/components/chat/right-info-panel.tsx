import { router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDatabase,
    faAddressCard,
    faTag as faTagSolid,
    faNoteSticky,
    faChevronLeft,
    faPlus,
    faXmark,
    faArrowsRotate,
    faPenToSquare,
    faUser,
    faUserPen,
    faUserPlus,
    faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FormEvent, useEffect, useState } from "react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
import { TagBadge } from "@/components/tag-badge";
import { friendDisplayName, SOURCE_LABELS, sourceLabel } from "@/lib/friend";
import { formatDateTime } from "@/lib/time";
import type { Friend, FriendSource, Tag } from "@/types/chat";

export function RightInfoPanel({
    friend,
    mobileVisible = false,
    onBack,
}: {
    friend: Friend;
    mobileVisible?: boolean;
    onBack?: () => void;
}) {
    const { props } = usePage<{ tags?: Tag[] }>();
    const allTags = props.tags ?? [];
    const attachedTags = friend.tags ?? [];
    const attachedIds = new Set(attachedTags.map((t) => t.id));
    const availableTags = allTags.filter((t) => !attachedIds.has(t.id));
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [editField, setEditField] = useState<
        "system_display_name" | "source" | null
    >(null);
    const name = friendDisplayName(friend);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ friendId: number }>).detail;
            if (detail.friendId === friend.id) {
                setEditField("system_display_name");
            }
        };
        document.addEventListener("friend:edit", handler);
        return () => document.removeEventListener("friend:edit", handler);
    }, [friend.id]);

    const attachTag = (tag: Tag) => {
        router.post(
            `/friends/${friend.id}/tags/${tag.id}`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setTagDialogOpen(false),
            },
        );
    };

    const detachTag = (tag: Tag) => {
        router.delete(`/friends/${friend.id}/tags/${tag.id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const refreshProfile = () => {
        router.post(
            `/friends/${friend.id}/refresh-profile`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <aside
            className={`${mobileVisible ? "flex" : "hidden"} xl:flex w-full xl:w-80 shrink-0 flex-col border-l border-border bg-background`}
        >
            <div className="flex items-center gap-2 h-12 px-3 border-b border-border xl:hidden">
                <Button
                    variant="ghost"
                    className="text-muted-foreground size-9 p-0"
                    onClick={onBack}
                    aria-label="トークに戻る"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
                </Button>
                <div className="text-sm font-medium">友だち情報</div>
            </div>
            <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-3 mt-3 grid grid-cols-4 h-9 bg-muted/60 w-auto">
                    <TabsTrigger value="basic" aria-label="基本情報">
                        <FontAwesomeIcon icon={faDatabase} className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="profile" aria-label="LINE 情報">
                        <FontAwesomeIcon
                            icon={faAddressCard}
                            className="size-3.5"
                        />
                    </TabsTrigger>
                    <TabsTrigger value="tags" aria-label="タグ">
                        <FontAwesomeIcon icon={faTagSolid} className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="memo" aria-label="メモ">
                        <FontAwesomeIcon
                            icon={faNoteSticky}
                            className="size-3.5"
                        />
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    <TabsContent value="basic" className="space-y-5">
                        <SectionTitle>基本情報</SectionTitle>

                        <InfoRow
                            icon={faUser}
                            label="LINE 名"
                            action={
                                <IconButton
                                    icon={faArrowsRotate}
                                    label="LINE プロフィールを更新"
                                    onClick={refreshProfile}
                                />
                            }
                        >
                            <div className="text-sm">
                                {friend.display_name ?? "(名前未取得)"}
                            </div>
                            {friend.followed_at && (
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {formatDateTime(friend.followed_at)} 友だち追加
                                </div>
                            )}
                        </InfoRow>

                        <InfoRow
                            icon={faUserPen}
                            label="システム表示名"
                            action={
                                <IconButton
                                    icon={faPenToSquare}
                                    label="システム表示名を編集"
                                    onClick={() =>
                                        setEditField("system_display_name")
                                    }
                                />
                            }
                        >
                            <div className="text-sm">
                                {friend.system_display_name ?? (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </div>
                        </InfoRow>

                        <InfoRow
                            icon={faUserPlus}
                            label="流入経路"
                            action={
                                <IconButton
                                    icon={faPenToSquare}
                                    label="流入経路を編集"
                                    onClick={() => setEditField("source")}
                                />
                            }
                        >
                            <div className="text-sm">
                                {friend.source ? (
                                    sourceLabel(friend.source)
                                ) : (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </div>
                        </InfoRow>

                        {friend.status_message && (
                            <InfoRow
                                icon={faIdCard}
                                label="ステータスメッセージ"
                            >
                                <div className="text-sm">
                                    {friend.status_message}
                                </div>
                            </InfoRow>
                        )}

                        <InfoRow label="LINE userId">
                            <div className="text-xs font-mono text-muted-foreground break-all">
                                {friend.line_user_id}
                            </div>
                        </InfoRow>
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-3">
                        <SectionTitle>LINE 情報</SectionTitle>
                        <InfoRow label="フォロー状態">
                            <div className="text-sm">
                                {friend.is_following
                                    ? "アクティブ"
                                    : "ブロック済み"}
                            </div>
                        </InfoRow>
                        {friend.unfollowed_at && (
                            <InfoRow label="ブロック日時">
                                <div className="text-sm text-muted-foreground">
                                    {formatDateTime(friend.unfollowed_at)}
                                </div>
                            </InfoRow>
                        )}
                    </TabsContent>

                    <TabsContent value="tags" className="space-y-3">
                        <SectionTitle>タグ</SectionTitle>
                        <div className="flex flex-wrap gap-1.5">
                            {attachedTags.length === 0 ? (
                                <div className="text-xs text-muted-foreground">
                                    タグはまだありません
                                </div>
                            ) : (
                                attachedTags.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => detachTag(t)}
                                        className="group inline-flex items-center gap-1"
                                        aria-label={`タグ ${t.name} を外す`}
                                    >
                                        <TagBadge tag={t} />
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </button>
                                ))
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setTagDialogOpen(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} className="size-3" />
                            タグを追加
                        </Button>
                    </TabsContent>

                    <TabsContent value="memo" className="space-y-3">
                        <MemoTab friend={friend} />
                    </TabsContent>
                </div>
            </Tabs>

            <FieldEditDialog
                friend={friend}
                field={editField}
                onClose={() => setEditField(null)}
            />

            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>タグを追加</DialogTitle>
                    </DialogHeader>
                    {allTags.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            タグがまだ作成されていません。先に
                            <a
                                href="/tags"
                                className="text-blue-600 dark:text-blue-400 underline mx-1"
                            >
                                タグ管理
                            </a>
                            で作成してください。
                        </div>
                    ) : availableTags.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            すべてのタグが付与済みです。
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => attachTag(t)}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <TagBadge tag={t} />
                                </button>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </aside>
    );
}

function MemoTab({ friend }: { friend: Friend }) {
    const form = useForm({
        note: friend.note ?? "",
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        form.setData("note", friend.note ?? "");
        setSaved(false);
    }, [friend.id]);

    const onSave = () => {
        form.patch(`/friends/${friend.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            },
        });
    };

    return (
        <>
            <SectionTitle>メモ</SectionTitle>
            <textarea
                value={form.data.note}
                onChange={(e) => form.setData("note", e.target.value)}
                placeholder="この友だちに関するメモを入力..."
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-24"
            />
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    {saved ? "保存しました" : ""}
                </span>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={form.processing}
                >
                    {form.processing ? "保存中..." : "保存"}
                </Button>
            </div>
        </>
    );
}

function FieldEditDialog({
    friend,
    field,
    onClose,
}: {
    friend: Friend;
    field: "system_display_name" | "source" | null;
    onClose: () => void;
}) {
    const isSystemName = field === "system_display_name";
    const isSource = field === "source";
    const form = useForm<{ value: string }>({
        value:
            (isSystemName
                ? friend.system_display_name
                : isSource
                    ? friend.source
                    : "") ?? "",
    });

    useEffect(() => {
        if (field) {
            form.setData(
                "value",
                (isSystemName
                    ? friend.system_display_name
                    : isSource
                        ? friend.source
                        : "") ?? "",
            );
            form.clearErrors();
        }
    }, [field, friend.id]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!field) return;
        const payload = { [field]: form.data.value || null };
        form.transform(() => payload);
        form.patch(`/friends/${friend.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: onClose,
        });
    };

    const title = isSystemName
        ? "システム表示名を編集"
        : isSource
            ? "流入経路を編集"
            : "";

    return (
        <Dialog
            open={field !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    {isSystemName && (
                        <div className="space-y-1.5">
                            <Label htmlFor="field-input">システム表示名</Label>
                            <Input
                                id="field-input"
                                placeholder="社内呼称（任意）"
                                value={form.data.value}
                                onChange={(e) =>
                                    form.setData("value", e.target.value)
                                }
                                autoFocus
                            />
                            <p className="text-[11px] text-muted-foreground">
                                LINE 表示名の代わりに各画面で表示されます
                            </p>
                        </div>
                    )}

                    {isSource && (
                        <div className="space-y-1.5">
                            <Label htmlFor="field-input">流入経路</Label>
                            <select
                                id="field-input"
                                value={form.data.value}
                                onChange={(e) =>
                                    form.setData("value", e.target.value)
                                }
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                autoFocus
                            >
                                <option value="">未設定</option>
                                {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {field && form.errors[field as keyof typeof form.errors] && (
                        <p className="text-xs text-destructive">
                            {String(
                                form.errors[
                                    field as keyof typeof form.errors
                                ],
                            )}
                        </p>
                    )}

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
                            {form.processing ? "保存中..." : "保存"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function IconButton({
    icon,
    label,
    onClick,
}: {
    icon: IconDefinition;
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            variant="ghost"
            className="size-6 p-0 text-muted-foreground hover:text-foreground"
            aria-label={label}
            onClick={onClick}
        >
            <FontAwesomeIcon icon={icon} className="size-3" />
        </Button>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-sm font-semibold text-foreground/90">
            {children}
        </div>
    );
}

function InfoRow({
    label,
    icon,
    action,
    children,
}: {
    label: string;
    icon?: IconDefinition;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1.5 bg-muted/40 rounded-md px-2 py-1 w-fit">
                {icon && (
                    <FontAwesomeIcon
                        icon={icon}
                        className="size-3 text-muted-foreground"
                    />
                )}
                <div className="text-xs font-medium text-foreground/80">
                    {label}
                </div>
                {action && <div className="ml-1">{action}</div>}
            </div>
            <div className="px-2">{children}</div>
        </div>
    );
}
