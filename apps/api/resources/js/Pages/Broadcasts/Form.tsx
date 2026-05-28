import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendar,
    faClock,
    faPaperPlane,
    faSave,
    faImage,
    faXmark,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/chat";
import type {
    Broadcast,
    BroadcastMessageType,
    BroadcastTargetType,
    LineChannel,
} from "@/types/broadcast";

const MAX_TITLE = 50;
const MAX_TEXT = 5000;

type PageProps = {
    broadcast: Broadcast | null;
    activeFriendsCount: number;
    channels: LineChannel[];
    tags: Tag[];
};

type FormData = {
    title: string;
    line_channel_id: number;
    message_type: BroadcastMessageType;
    text_content: string;
    image_url: string;
    image_preview_url: string;
    target_type: BroadcastTargetType;
    target_tag_id: number | null;
    scheduled_at: string;
    action: "draft" | "schedule" | "send_now";
};

type SendTiming = "immediate" | "scheduled";

function toLocalInput(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BroadcastsForm({ broadcast, activeFriendsCount }: PageProps) {
    const { props } = usePage<{ channels: LineChannel[]; tags: Tag[] }>();
    const channels = props.channels;
    const tags = props.tags;

    const isEdit = !!broadcast;

    const form = useForm<FormData>({
        title: broadcast?.title ?? "",
        line_channel_id: broadcast?.line_channel_id ?? channels[0]?.id ?? 0,
        message_type: broadcast?.message_type ?? "text",
        text_content: broadcast?.text_content ?? "",
        image_url: broadcast?.image_url ?? "",
        image_preview_url: broadcast?.image_preview_url ?? "",
        target_type: broadcast?.target_type ?? "all",
        target_tag_id: broadcast?.target_tag_id ?? null,
        scheduled_at: toLocalInput(broadcast?.scheduled_at ?? null),
        action: "draft",
    });

    const [timing, setTiming] = useState<SendTiming>(
        broadcast?.scheduled_at ? "scheduled" : "scheduled",
    );

    useEffect(() => {
        if (channels.length > 0 && form.data.line_channel_id === 0) {
            form.setData("line_channel_id", channels[0].id);
        }
    }, [channels.length]);

    const submit = (action: FormData["action"]) => {
        // transform doesn't chain on subsequent calls, so set action via setData
        form.setData("action", action);
        // Allow the state to flush before submitting
        setTimeout(() => {
            if (isEdit && broadcast) {
                form.patch(`/broadcasts/${broadcast.id}`, {
                    preserveScroll: false,
                });
            } else {
                form.post("/broadcasts", { preserveScroll: false });
            }
        }, 0);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit(timing === "immediate" ? "send_now" : "schedule");
    };

    return (
        <>
            <Head title={isEdit ? "配信を編集" : "配信を作成"} />
            <form
                onSubmit={onSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5"
            >
                <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEdit ? "メッセージ編集" : "メッセージ登録"}
                    </h1>
                    <Link
                        href="/broadcasts"
                        className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
                    >
                        メッセージ配信一覧に戻る
                    </Link>
                </div>

                <hr className="border-border" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3">
                                <Label className="text-sm font-bold">
                                    管理用タイトル
                                    <span className="font-normal text-muted-foreground">
                                        （友だちには公開されません）
                                    </span>
                                    <span className="text-destructive ml-1">
                                        *
                                    </span>
                                </Label>
                                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                                    {form.data.title.length}/{MAX_TITLE}
                                </span>
                            </div>
                            <Input
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData("title", e.target.value)
                                }
                                maxLength={MAX_TITLE}
                                className="mt-3 h-11"
                            />
                            {form.errors.title && (
                                <p className="text-xs text-destructive mt-1">
                                    {form.errors.title}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <Label className="text-sm font-bold">
                                送信元 LINE アカウント
                                <span className="text-destructive ml-1">*</span>
                            </Label>
                            {channels.length === 0 ? (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    アクティブな LINE
                                    チャネルがありません。先に{" "}
                                    <Link
                                        href="/settings/channels"
                                        className="text-blue-600 dark:text-blue-400 underline"
                                    >
                                        LINE チャネル設定
                                    </Link>{" "}
                                    から登録してください。
                                </p>
                            ) : (
                                <select
                                    value={form.data.line_channel_id}
                                    onChange={(e) =>
                                        form.setData(
                                            "line_channel_id",
                                            Number(e.target.value),
                                        )
                                    }
                                    className="mt-3 w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {channels.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                            {c.basic_id ? ` (${c.basic_id})` : ""}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {form.errors.line_channel_id && (
                                <p className="text-xs text-destructive mt-1">
                                    {form.errors.line_channel_id}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <Label className="text-sm font-bold">
                                配信タイミング設定
                            </Label>
                            <RadioGroup
                                value={timing}
                                onValueChange={(v) =>
                                    v && setTiming(v as SendTiming)
                                }
                                className="space-y-3"
                            >
                                <Label
                                    className={cn(
                                        "flex items-center gap-3 cursor-pointer text-sm",
                                        timing === "immediate"
                                            ? "text-primary font-bold"
                                            : "text-foreground font-normal",
                                    )}
                                >
                                    <RadioGroupItem value="immediate" />
                                    保存後すぐに配信
                                </Label>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Label
                                        className={cn(
                                            "flex items-center gap-3 cursor-pointer text-sm",
                                            timing === "scheduled"
                                                ? "text-primary font-bold"
                                                : "text-foreground font-normal",
                                        )}
                                    >
                                        <RadioGroupItem value="scheduled" />
                                        配信予約
                                    </Label>
                                    <div className="relative">
                                        <FontAwesomeIcon
                                            icon={faCalendar}
                                            className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                        />
                                        <Input
                                            type="datetime-local"
                                            value={form.data.scheduled_at}
                                            onChange={(e) =>
                                                form.setData(
                                                    "scheduled_at",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={timing !== "scheduled"}
                                            className="pl-9 h-10 w-60"
                                        />
                                    </div>
                                    <FontAwesomeIcon
                                        icon={faClock}
                                        className="size-3 text-muted-foreground"
                                    />
                                </div>
                            </RadioGroup>
                            {form.errors.scheduled_at && (
                                <p className="text-xs text-destructive">
                                    {form.errors.scheduled_at}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <Label className="text-sm font-bold">
                                    配信先絞込み
                                </Label>
                                <div className="text-xs text-muted-foreground">
                                    アクティブ友だち:{" "}
                                    <span className="tabular-nums font-medium">
                                        {activeFriendsCount.toLocaleString()}
                                    </span>{" "}
                                    人
                                </div>
                            </div>

                            <RadioGroup
                                value={form.data.target_type}
                                onValueChange={(v) =>
                                    v &&
                                    form.setData(
                                        "target_type",
                                        v as BroadcastTargetType,
                                    )
                                }
                                className="flex items-center gap-4"
                            >
                                <Label
                                    className={cn(
                                        "flex items-center gap-2 cursor-pointer text-sm",
                                        form.data.target_type === "all"
                                            ? "text-primary font-bold"
                                            : "text-foreground font-normal",
                                    )}
                                >
                                    <RadioGroupItem value="all" />
                                    すべての友だち
                                </Label>
                                <Label
                                    className={cn(
                                        "flex items-center gap-2 cursor-pointer text-sm",
                                        form.data.target_type === "tag"
                                            ? "text-primary font-bold"
                                            : "text-foreground font-normal",
                                    )}
                                >
                                    <RadioGroupItem value="tag" />
                                    タグで絞り込み
                                </Label>
                            </RadioGroup>

                            {form.data.target_type === "tag" && (
                                <div>
                                    <select
                                        value={form.data.target_tag_id ?? ""}
                                        onChange={(e) =>
                                            form.setData(
                                                "target_tag_id",
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            )
                                        }
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">タグを選択...</option>
                                        {tags.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.target_tag_id && (
                                        <p className="text-xs text-destructive mt-1">
                                            {form.errors.target_tag_id}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-5 space-y-4">
                        <Label className="text-sm font-bold">
                            メッセージ内容
                            <span className="text-destructive ml-1">*</span>
                        </Label>

                        <div className="flex gap-2 border-b border-border">
                            <TypeTab
                                active={form.data.message_type === "text"}
                                onClick={() =>
                                    form.setData("message_type", "text")
                                }
                                label="テキスト"
                            />
                            <TypeTab
                                active={form.data.message_type === "image"}
                                onClick={() =>
                                    form.setData("message_type", "image")
                                }
                                label="画像"
                            />
                        </div>

                        {form.data.message_type === "text" ? (
                            <div className="space-y-2">
                                <div className="flex items-end justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        本文
                                    </span>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {form.data.text_content.length}/
                                        {MAX_TEXT}
                                    </span>
                                </div>
                                <Textarea
                                    value={form.data.text_content}
                                    onChange={(e) =>
                                        form.setData(
                                            "text_content",
                                            e.target.value,
                                        )
                                    }
                                    maxLength={MAX_TEXT}
                                    rows={6}
                                    placeholder="メッセージ本文を入力..."
                                />
                                {form.errors.text_content && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.text_content}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <ImageUploader
                                imageUrl={form.data.image_url}
                                onChange={(url) => {
                                    form.setData("image_url", url);
                                    form.setData("image_preview_url", url);
                                }}
                                error={form.errors.image_url}
                            />
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3 flex-wrap pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => submit("draft")}
                        disabled={form.processing}
                    >
                        <FontAwesomeIcon icon={faSave} className="size-3.5" />
                        下書き保存
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="size-3.5"
                        />
                        {timing === "immediate"
                            ? "今すぐ配信"
                            : "配信予約を登録"}
                    </Button>
                    {form.processing && (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                            <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="size-3"
                            />
                            送信中...
                        </span>
                    )}
                </div>
            </form>
        </>
    );
}

BroadcastsForm.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

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
            const res = await fetch("/broadcasts/upload-image", {
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
                throw new Error(data.error ?? `アップロード失敗 (${res.status})`);
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
                                クリックして画像を選択 (PNG / JPEG)
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
            <p className="text-xs text-muted-foreground">
                ※ローカル環境では cloudflared トンネルが起動し、`LINE_PUBLIC_BASE_URL`
                が現在のトンネル URL に一致している必要があります。
            </p>
        </div>
    );
}
