import { router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faImage,
    faXmark,
    faSpinner,
    faPlus,
    faTrash,
    faPaperPlane,
    faClock,
    faTag,
    faTableCells,
    faFileLines,
    faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { FriendAddUrlCard } from "@/components/friend-add-url-card";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/chat";
import type { LineChannel } from "@/types/broadcast";
import type {
    Greeting,
    GreetingAction,
    GreetingActionType,
    GreetingType,
} from "@/types/greeting";

const MAX_TEXT = 5000;

export type GreetingTheme = {
    badgeLabel: string;
    badgeClass: string;
    icon: IconDefinition;
    iconColorClass: string;
    description: React.ReactNode;
    sectionTitle: string;
    showSendButton?: boolean;
    testSteps: string[];
    testNote?: React.ReactNode;
};

type ScenarioRef = { id: number; name: string; line_channel_id: number };

type ServerProps = {
    greeting: Greeting | null;
    channel: LineChannel | null;
    channels: LineChannel[];
    scenarios: ScenarioRef[];
    tags: Tag[];
};

type FormData = {
    line_channel_id: number;
    is_active: boolean;
    message_type: "text" | "image";
    text_content: string;
    image_url: string;
    image_preview_url: string;
    actions: GreetingAction[];
};

export function GreetingForm({
    type,
    theme,
    submitUrl,
    sendUrl,
}: {
    type: GreetingType;
    theme: GreetingTheme;
    submitUrl: string;
    sendUrl?: string;
}) {
    const { props } = usePage<ServerProps>();
    const greeting = props.greeting;
    const channel = props.channel;
    const channels = props.channels;
    const scenarios = props.scenarios;
    const tags = props.tags;

    const form = useForm<FormData>({
        line_channel_id: channel?.id ?? 0,
        is_active: greeting?.is_active ?? true,
        message_type: greeting?.message_type ?? "text",
        text_content: greeting?.text_content ?? "",
        image_url: greeting?.image_url ?? "",
        image_preview_url: greeting?.image_preview_url ?? "",
        actions: greeting?.actions ?? [],
    });

    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [presetType, setPresetType] = useState<GreetingActionType | null>(
        null,
    );

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch(submitUrl, { preserveScroll: true });
    };

    const sendExisting = () => {
        if (!sendUrl) return;
        if (
            !confirm(
                "登録されている既存友だち全員にメッセージを送信します。よろしいですか？",
            )
        ) {
            return;
        }
        router.post(
            sendUrl,
            { line_channel_id: form.data.line_channel_id },
            { preserveScroll: true },
        );
    };

    const openActionDialog = (preset?: GreetingActionType) => {
        setPresetType(preset ?? null);
        setActionDialogOpen(true);
    };

    return (
        <form
            onSubmit={onSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4"
        >
            {/* ヘッダー */}
            <div className="flex items-center gap-3 flex-wrap">
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                        theme.badgeClass,
                    )}
                >
                    {theme.badgeLabel}
                </span>
                <h1 className="text-xl font-bold tracking-tight">
                    あいさつメッセージ設定
                </h1>
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline ml-auto"
                >
                    友だちの流入経路を分析したい場合はこちら
                </a>
            </div>

            {/* 説明カード */}
            <Card className="bg-muted/40">
                <CardContent className="p-4 flex items-start gap-3">
                    <span className="grid place-items-center size-10 rounded-full bg-background border border-border shrink-0">
                        <FontAwesomeIcon
                            icon={theme.icon}
                            className={cn("size-4", theme.iconColorClass)}
                        />
                    </span>
                    <div className="text-sm text-foreground">
                        {theme.description}
                    </div>
                </CardContent>
            </Card>

            {/* チャネル + 稼働 toolbar (mockup には無いが必須項目) */}
            <Card className="bg-background">
                <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                    <Label className="text-xs text-muted-foreground">
                        対象 LINE チャネル:
                    </Label>
                    {channels.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                            アクティブな LINE チャネルがありません
                        </span>
                    ) : (
                        <select
                            value={form.data.line_channel_id}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                form.setData("line_channel_id", id);
                                router.get(
                                    window.location.pathname,
                                    { channel: id },
                                    { preserveScroll: true },
                                );
                            }}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {channels.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">
                            稼働
                        </Label>
                        <Switch
                            checked={form.data.is_active}
                            onCheckedChange={(v) =>
                                form.setData("is_active", v)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 友だち追加 URL (新規 / 既存友だち用のみ) */}
            {type !== "unblock" && <FriendAddUrlCard channel={channel} />}

            {/* タブ */}
            <Tabs defaultValue="settings" className="flex flex-col">
                <TabsList
                    variant="line"
                    className="border-b border-border justify-start gap-2 h-auto rounded-none p-0 self-stretch"
                >
                    <TabsTrigger
                        value="settings"
                        className="!flex-none px-4 py-2 data-active:text-blue-600 data-active:font-bold"
                    >
                        メッセージ・アクション設定
                    </TabsTrigger>
                    <TabsTrigger
                        value="test"
                        className="!flex-none px-4 py-2 data-active:text-blue-600 data-active:font-bold"
                    >
                        テスト方法
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <div className="text-sm font-bold">
                                {theme.sectionTitle}
                            </div>

                            {/* 内カード: メッセージ */}
                            <Card className="border-border">
                                <CardContent className="p-4 space-y-3">
                                    <div className="text-sm font-bold">
                                        送信するメッセージを登録
                                    </div>

                                    <div className="rounded-md border border-border bg-muted/30 p-2 flex items-center gap-2 flex-wrap">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 bg-background"
                                            onClick={() =>
                                                form.setData(
                                                    "text_content",
                                                    form.data.text_content +
                                                        "{{LINE名}}",
                                                )
                                            }
                                            disabled={
                                                form.data.message_type !==
                                                "text"
                                            }
                                        >
                                            ＋ LINE名
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 bg-background"
                                            disabled
                                        >
                                            ＋ 友だち情報
                                        </Button>
                                        <span className="text-[11px] text-muted-foreground ml-auto">
                                            ※ 変数は本文末尾に挿入されます
                                        </span>
                                    </div>

                                    <div className="flex gap-2 border-b border-border">
                                        <TypeTab
                                            active={
                                                form.data.message_type ===
                                                "text"
                                            }
                                            onClick={() =>
                                                form.setData(
                                                    "message_type",
                                                    "text",
                                                )
                                            }
                                            label="テキスト"
                                        />
                                        <TypeTab
                                            active={
                                                form.data.message_type ===
                                                "image"
                                            }
                                            onClick={() =>
                                                form.setData(
                                                    "message_type",
                                                    "image",
                                                )
                                            }
                                            label="画像"
                                        />
                                    </div>

                                    {form.data.message_type === "text" ? (
                                        <>
                                            <Textarea
                                                rows={14}
                                                value={form.data.text_content}
                                                onChange={(e) =>
                                                    form.setData(
                                                        "text_content",
                                                        e.target.value.slice(
                                                            0,
                                                            MAX_TEXT,
                                                        ),
                                                    )
                                                }
                                                placeholder="本文を入力..."
                                            />
                                            <div className="text-[11px] text-muted-foreground text-right tabular-nums">
                                                {form.data.text_content.length}
                                                /
                                                {MAX_TEXT.toLocaleString()}
                                            </div>
                                            {form.errors.text_content && (
                                                <p className="text-xs text-destructive">
                                                    {form.errors.text_content}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <ImageUploader
                                            imageUrl={form.data.image_url}
                                            onChange={(url) => {
                                                form.setData("image_url", url);
                                                form.setData(
                                                    "image_preview_url",
                                                    url,
                                                );
                                            }}
                                            error={form.errors.image_url}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* 内カード: アクション */}
                            <Card className="border-border">
                                <CardContent className="p-4 space-y-3">
                                    <div className="text-sm font-bold">
                                        上記メッセージ送信以外のアクション登録
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        友だち追加時の
                                        <span className="text-foreground font-medium mx-0.5">
                                            ステップ配信の開始
                                        </span>
                                        や
                                        <span className="text-foreground font-medium mx-0.5">
                                            タグ付け・外し
                                        </span>
                                        などのアクションをこちらで設定します。
                                    </p>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        <ActionTile
                                            icon={faClock}
                                            label={[
                                                "ステップ配信を",
                                                "開始する",
                                            ]}
                                            onClick={() =>
                                                openActionDialog(
                                                    "scenario_start",
                                                )
                                            }
                                        />
                                        <ActionTile
                                            icon={faTag}
                                            label={["タグを", "付け・外しする"]}
                                            onClick={() =>
                                                openActionDialog("tag_attach")
                                            }
                                        />
                                        <ActionTile
                                            icon={faTableCells}
                                            label={[
                                                "リッチメニューを",
                                                "表示する",
                                            ]}
                                            disabled
                                        />
                                        <ActionTile
                                            icon={faFileLines}
                                            label={[
                                                "テンプレートを",
                                                "送信する",
                                            ]}
                                            disabled
                                        />
                                        <ActionTile
                                            icon={faEllipsis}
                                            label={[
                                                "その他の",
                                                "アクションをみる",
                                            ]}
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <Button
                                            type="button"
                                            onClick={() => openActionDialog()}
                                            className="bg-blue-500 hover:bg-blue-600 text-white h-9"
                                        >
                                            <FontAwesomeIcon
                                                icon={faPlus}
                                                className="size-3"
                                            />
                                            アクション追加・編集
                                        </Button>
                                    </div>

                                    {form.data.actions.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-border">
                                            <div className="text-xs text-muted-foreground">
                                                登録済みアクション (
                                                {form.data.actions.length})
                                            </div>
                                            {form.data.actions.map(
                                                (action, idx) => (
                                                    <ActionRow
                                                        key={idx}
                                                        action={action}
                                                        tags={tags}
                                                        scenarios={scenarios}
                                                        onRemove={() => {
                                                            const next =
                                                                form.data.actions.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        idx,
                                                                );
                                                            form.setData(
                                                                "actions",
                                                                next,
                                                            );
                                                        }}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={form.processing || !channel}
                            className="border-primary text-primary hover:bg-primary/10 hover:text-primary px-10 h-10"
                        >
                            {form.processing ? "保存中..." : "保存"}
                        </Button>
                        {theme.showSendButton && sendUrl && (
                            <Button
                                type="button"
                                onClick={sendExisting}
                                disabled={!channel}
                                className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-6"
                            >
                                <FontAwesomeIcon
                                    icon={faPaperPlane}
                                    className="size-3.5"
                                />
                                既存友だち全員に今すぐ送信
                            </Button>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="test" className="space-y-4 mt-4">
                    <Card>
                        <CardContent className="p-5 space-y-5">
                            <h3 className="text-sm font-bold">
                                {theme.badgeLabel} アクションのテスト方法
                            </h3>

                            <div className="relative">
                                <div
                                    className="absolute top-4 left-[12.5%] right-[12.5%] h-px bg-border"
                                    style={{
                                        display:
                                            theme.testSteps.length > 1
                                                ? "block"
                                                : "none",
                                    }}
                                />
                                <div
                                    className={cn(
                                        "grid gap-3 relative",
                                        theme.testSteps.length === 3
                                            ? "grid-cols-1 sm:grid-cols-3"
                                            : "grid-cols-2 sm:grid-cols-4",
                                    )}
                                >
                                    {theme.testSteps.map((step, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-center">
                                                <div className="relative z-10 size-8 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold tabular-nums">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-border bg-background px-3 py-3 text-xs text-center leading-relaxed min-h-20 flex items-center justify-center">
                                                <div className="whitespace-pre-line">
                                                    {step}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm font-bold">
                                ご注意事項
                            </div>
                            <div className="text-sm text-foreground">
                                {theme.testNote ?? (
                                    <p>
                                        LINE
                                        公式アカウント管理画面のあいさつメッセージが設定されている場合は、どちらも送信されます。
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ActionDialog
                open={actionDialogOpen}
                onClose={() => setActionDialogOpen(false)}
                tags={tags}
                scenarios={scenarios}
                presetType={presetType}
                onAdd={(action) => {
                    form.setData("actions", [...form.data.actions, action]);
                    setActionDialogOpen(false);
                }}
            />
        </form>
    );
}

function TypeTab({
    active,
    onClick,
    label,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "py-2 px-4 text-sm font-bold transition-colors -mb-px",
                active
                    ? "text-primary border-b-2 border-primary"
                    : "text-foreground hover:text-primary",
            )}
        >
            {label}
        </button>
    );
}

function ActionTile({
    icon,
    label,
    onClick,
    disabled,
}: {
    icon: IconDefinition;
    label: [string, string];
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-background p-4 transition-colors",
                disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-muted/40 hover:border-primary/40",
            )}
        >
            <FontAwesomeIcon icon={icon} className="size-6 text-foreground" />
            <div className="text-xs text-center leading-tight text-foreground">
                <div>{label[0]}</div>
                <div>{label[1]}</div>
            </div>
        </button>
    );
}

function ActionRow({
    action,
    tags,
    scenarios,
    onRemove,
}: {
    action: GreetingAction;
    tags: Tag[];
    scenarios: ScenarioRef[];
    onRemove: () => void;
}) {
    let label = "";
    let icon: IconDefinition = faTag;
    if (action.type === "tag_attach" || action.type === "tag_detach") {
        const tag = tags.find((t) => t.id === action.tag_id);
        const verb = action.type === "tag_attach" ? "付与" : "解除";
        label = `タグ「${tag?.name ?? "(削除済み)"}」を${verb}`;
        icon = faTag;
    } else if (action.type === "scenario_start") {
        const s = scenarios.find((s) => s.id === action.scenario_id);
        label = `ステップ配信「${s?.name ?? "(削除済み)"}」を開始`;
        icon = faClock;
    }
    return (
        <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
            <FontAwesomeIcon
                icon={icon}
                className="size-3.5 text-muted-foreground"
            />
            <span className="text-sm flex-1">{label}</span>
            <button
                type="button"
                onClick={onRemove}
                className="size-8 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                aria-label="削除"
            >
                <FontAwesomeIcon icon={faTrash} className="size-3" />
            </button>
        </div>
    );
}

function ActionDialog({
    open,
    onClose,
    tags,
    scenarios,
    presetType,
    onAdd,
}: {
    open: boolean;
    onClose: () => void;
    tags: Tag[];
    scenarios: ScenarioRef[];
    presetType: GreetingActionType | null;
    onAdd: (action: GreetingAction) => void;
}) {
    const [actionType, setActionType] = useState<GreetingActionType>(
        presetType ?? "tag_attach",
    );
    const [tagId, setTagId] = useState<number | null>(tags[0]?.id ?? null);
    const [scenarioId, setScenarioId] = useState<number | null>(
        scenarios[0]?.id ?? null,
    );

    // preset 反映
    if (open && presetType && presetType !== actionType) {
        setActionType(presetType);
    }

    const submit = () => {
        if (
            (actionType === "tag_attach" || actionType === "tag_detach") &&
            tagId
        ) {
            onAdd({ type: actionType, tag_id: tagId });
        } else if (actionType === "scenario_start" && scenarioId) {
            onAdd({ type: actionType, scenario_id: scenarioId });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle className="text-lg font-bold">
                    アクション追加
                </DialogTitle>
                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold">
                            アクション種別
                        </Label>
                        <select
                            value={actionType}
                            onChange={(e) =>
                                setActionType(
                                    e.target.value as GreetingActionType,
                                )
                            }
                            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="tag_attach">タグを付与</option>
                            <option value="tag_detach">タグを解除</option>
                            <option value="scenario_start">
                                ステップ配信を開始
                            </option>
                        </select>
                    </div>

                    {(actionType === "tag_attach" ||
                        actionType === "tag_detach") && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-bold">
                                対象タグ
                            </Label>
                            <select
                                value={tagId ?? ""}
                                onChange={(e) =>
                                    setTagId(Number(e.target.value))
                                }
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {tags.length === 0 && (
                                    <option value="">
                                        (タグが未登録です)
                                    </option>
                                )}
                                {tags.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {actionType === "scenario_start" && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-bold">
                                対象シナリオ
                            </Label>
                            <select
                                value={scenarioId ?? ""}
                                onChange={(e) =>
                                    setScenarioId(Number(e.target.value))
                                }
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {scenarios.length === 0 && (
                                    <option value="">
                                        (シナリオが未登録です)
                                    </option>
                                )}
                                {scenarios.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            キャンセル
                        </Button>
                        <Button type="button" onClick={submit}>
                            追加
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ImageUploader({
    imageUrl,
    onChange,
    error,
}: {
    imageUrl: string;
    onChange: (url: string) => void;
    error?: string;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setUploadError(null);
        try {
            const fd = new FormData();
            fd.append("image", file);
            const xsrfToken = decodeURIComponent(
                document.cookie
                    .split("; ")
                    .find((c) => c.startsWith("XSRF-TOKEN="))
                    ?.split("=")[1] ?? "",
            );
            const res = await fetch("/greetings/upload-image", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "X-XSRF-TOKEN": xsrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: fd,
                credentials: "same-origin",
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    data.error ?? `アップロード失敗 (${res.status})`,
                );
            }
            const data = (await res.json()) as { url: string };
            onChange(data.url);
        } catch (e) {
            setUploadError(e instanceof Error ? e.message : "アップロード失敗");
        } finally {
            setUploading(false);
        }
    };

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) upload(file);
        e.target.value = "";
    };

    return (
        <div className="space-y-3">
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={onFile}
                hidden
            />
            {imageUrl ? (
                <div className="relative inline-block">
                    <img
                        src={imageUrl}
                        alt="プレビュー"
                        className="max-w-xs max-h-64 rounded-md border border-border"
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-1 right-1 size-7 rounded-full bg-background/80 hover:bg-background border border-border inline-flex items-center justify-center"
                        aria-label="画像を削除"
                    >
                        <FontAwesomeIcon icon={faXmark} className="size-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center justify-center gap-2 w-full max-w-xs h-40 rounded-md border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="size-6 text-muted-foreground"
                            />
                            <span className="text-xs text-muted-foreground">
                                アップロード中...
                            </span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon
                                icon={faImage}
                                className="size-6 text-muted-foreground"
                            />
                            <span className="text-xs text-muted-foreground">
                                画像を選択 (PNG / JPEG)
                            </span>
                        </>
                    )}
                </button>
            )}
            {(uploadError || error) && (
                <p className="text-xs text-destructive">
                    {uploadError ?? error}
                </p>
            )}
        </div>
    );
}
