import { Head, router, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faTrashCan,
    faCloudArrowUp,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import type {
    AutoReply,
    AutoReplyFolder,
    AutoReplyTriggerType,
    AutoReplyMatchMode,
    AutoReplyScheduleType,
    AutoReplyActionMode,
    AutoReplyMessageType,
    AutoReplyAudience,
} from "@/types/auto-reply";

type FolderOption = Pick<AutoReplyFolder, "id" | "name" | "is_system">;

type PageProps = {
    autoReply: AutoReply | null;
    folders: FolderOption[];
    defaultFolderId: number | null;
};

type FormShape = {
    auto_reply_folder_id: number;
    trigger_type: AutoReplyTriggerType;
    match_mode: AutoReplyMatchMode;
    keywords: string[];
    exclude_bracket: boolean;
    audience: AutoReplyAudience;
    schedule_type: AutoReplyScheduleType;
    schedule_start: string;
    schedule_end: string;
    action_mode: AutoReplyActionMode;
    message_type: AutoReplyMessageType;
    text_content: string;
    image_url: string;
    image_preview_url: string;
    is_active: boolean;
};

function toLocalInput(iso: string | null): string {
    if (!iso) return "";
    // 'YYYY-MM-DD HH:mm:ss' or ISO → 'YYYY-MM-DDTHH:mm'
    return iso.replace(" ", "T").slice(0, 16);
}

export default function AutoReplyForm({
    autoReply,
    folders,
    defaultFolderId,
}: PageProps) {
    const isEdit = !!autoReply;

    const form = useForm<FormShape>({
        auto_reply_folder_id:
            autoReply?.auto_reply_folder_id ?? defaultFolderId ?? folders[0]?.id ?? 0,
        trigger_type: autoReply?.trigger_type ?? "keyword",
        match_mode: autoReply?.match_mode ?? "partial",
        keywords: autoReply?.keywords?.length ? autoReply.keywords : [""],
        exclude_bracket: autoReply?.exclude_bracket ?? false,
        audience: autoReply?.audience ?? "active",
        schedule_type: autoReply?.schedule_type ?? "always",
        schedule_start: toLocalInput(autoReply?.schedule_start ?? null),
        schedule_end: toLocalInput(autoReply?.schedule_end ?? null),
        action_mode: autoReply?.action_mode ?? "repeat",
        message_type: autoReply?.message_type ?? "text",
        text_content: autoReply?.text_content ?? "",
        image_url: autoReply?.image_url ?? "",
        image_preview_url: autoReply?.image_preview_url ?? "",
        is_active: autoReply?.is_active ?? true,
    });

    const setKeyword = (i: number, value: string) => {
        form.setData(
            "keywords",
            form.data.keywords.map((k, idx) => (idx === i ? value : k)),
        );
    };
    const addKeyword = () => form.setData("keywords", [...form.data.keywords, ""]);
    const removeKeyword = (i: number) =>
        form.setData(
            "keywords",
            form.data.keywords.filter((_, idx) => idx !== i),
        );

    const submit = () => {
        if (isEdit) {
            form.patch(`/auto-replies/${autoReply!.id}`);
        } else {
            form.post("/auto-replies");
        }
    };

    return (
        <>
            <Head title={isEdit ? "自動応答 編集" : "自動応答 作成"} />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <h1 className="text-lg font-bold tracking-tight">自動応答</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                    {/* アクション稼働対象絞り込み */}
                    <Section title="アクション稼働対象絞り込み">
                        <RadioGroup
                            value={form.data.audience}
                            onValueChange={(v) =>
                                v && form.setData("audience", v as AutoReplyAudience)
                            }
                            className="flex items-center gap-6"
                        >
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <RadioGroupItem value="active" />
                                有効友だち
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <RadioGroupItem value="blocked" />
                                ブロックした友だち
                            </label>
                        </RadioGroup>
                        <p className="mt-3 text-xs text-muted-foreground">
                            ※ 自動応答は相手からのメッセージ受信時に送信されるため、実際に届くのは有効友だちのみです。
                        </p>
                    </Section>

                    {/* フォルダ */}
                    <Section title="フォルダ">
                        <select
                            value={form.data.auto_reply_folder_id}
                            onChange={(e) =>
                                form.setData(
                                    "auto_reply_folder_id",
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
                    </Section>

                    {/* キーワード設定 */}
                    <Section title="キーワード設定">
                        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3">
                            <Label className="text-sm bg-muted px-3 py-2 rounded-md">
                                利用設定
                            </Label>
                            <select
                                value={form.data.trigger_type}
                                onChange={(e) =>
                                    form.setData(
                                        "trigger_type",
                                        e.target.value as AutoReplyTriggerType,
                                    )
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="all">全てのメッセージに反応</option>
                                <option value="keyword">特定キーワードに反応</option>
                                <option value="follow">友だち追加時のみ反応</option>
                            </select>
                        </div>

                        {form.data.trigger_type === "keyword" && (
                            <div className="mt-4 space-y-3 rounded-md border border-border p-4">
                                <RadioGroup
                                    value={form.data.match_mode}
                                    onValueChange={(v) =>
                                        v &&
                                        form.setData(
                                            "match_mode",
                                            v as AutoReplyMatchMode,
                                        )
                                    }
                                    className="flex items-center gap-6"
                                >
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="partial" />
                                        部分一致
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="exact" />
                                        完全一致
                                    </label>
                                </RadioGroup>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">
                                        反応するキーワード
                                    </Label>
                                    {form.data.keywords.map((kw, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Input
                                                value={kw}
                                                onChange={(e) =>
                                                    setKeyword(i, e.target.value)
                                                }
                                                placeholder="例: 営業時間"
                                                className="h-9"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeKeyword(i)}
                                                disabled={form.data.keywords.length === 1}
                                                className="size-8 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-30"
                                                aria-label="削除"
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addKeyword}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="size-2.5" />
                                        キーワードを追加
                                    </button>
                                </div>
                            </div>
                        )}

                        {form.data.trigger_type !== "follow" && (
                            <label className="mt-3 inline-flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.data.exclude_bracket}
                                    onChange={(e) =>
                                        form.setData("exclude_bracket", e.target.checked)
                                    }
                                    className="size-4 rounded border-border accent-primary"
                                />
                                【〇〇】のメッセージには反応させない
                            </label>
                        )}
                    </Section>

                    {/* スケジュール設定 */}
                    <Section title="スケジュール設定">
                        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3">
                            <Label className="text-sm bg-muted px-3 py-2 rounded-md">
                                反応設定
                            </Label>
                            <select
                                value={form.data.schedule_type}
                                onChange={(e) =>
                                    form.setData(
                                        "schedule_type",
                                        e.target.value as AutoReplyScheduleType,
                                    )
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="always">常に（24時間/365日）反応する</option>
                                <option value="business">営業時間内のみ反応する</option>
                                <option value="custom">期間指定で反応する</option>
                            </select>
                        </div>
                        {form.data.schedule_type === "custom" && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">開始</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.schedule_start}
                                        onChange={(e) =>
                                            form.setData("schedule_start", e.target.value)
                                        }
                                        className="h-9"
                                    />
                                    {form.errors.schedule_start && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.schedule_start}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">終了</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.schedule_end}
                                        onChange={(e) =>
                                            form.setData("schedule_end", e.target.value)
                                        }
                                        className="h-9"
                                    />
                                </div>
                            </div>
                        )}
                        {form.data.schedule_type === "business" && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                ※ 営業時間設定は今後対応予定です。現在は常時反応として扱われます。
                            </p>
                        )}
                    </Section>

                    {/* アクション設定 */}
                    <Section title="アクション設定">
                        <RadioGroup
                            value={form.data.action_mode}
                            onValueChange={(v) =>
                                v && form.setData("action_mode", v as AutoReplyActionMode)
                            }
                            className="flex items-center gap-6 flex-wrap"
                        >
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <RadioGroupItem value="once" />
                                1度のみアクション稼働
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <RadioGroupItem value="repeat" />
                                何度でもアクション稼働
                            </label>
                        </RadioGroup>
                    </Section>

                    {/* 返信メッセージ（mockup の「設定する」に相当） */}
                    <Section title="返信メッセージ">
                        <RadioGroup
                            value={form.data.message_type}
                            onValueChange={(v) =>
                                v && form.setData("message_type", v as AutoReplyMessageType)
                            }
                            className="flex items-center gap-6 mb-3"
                        >
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <RadioGroupItem value="text" />
                                テキスト
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <RadioGroupItem value="image" />
                                画像
                            </label>
                        </RadioGroup>

                        {form.data.message_type === "text" ? (
                            <>
                                <Textarea
                                    value={form.data.text_content}
                                    onChange={(e) =>
                                        form.setData("text_content", e.target.value)
                                    }
                                    rows={5}
                                    maxLength={5000}
                                    placeholder="自動で返信するメッセージを入力"
                                />
                                {form.errors.text_content && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.text_content}
                                    </p>
                                )}
                            </>
                        ) : (
                            <ImageUploader
                                url={form.data.image_url}
                                onChange={(url) => {
                                    form.setData("image_url", url);
                                    form.setData("image_preview_url", url);
                                }}
                                error={form.errors.image_url}
                            />
                        )}
                    </Section>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => router.visit("/auto-replies")}
                        className="h-11 px-12"
                    >
                        戻る
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={form.processing}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-12 font-bold disabled:opacity-50"
                    >
                        {form.processing ? "保存中..." : "登録"}
                    </Button>
                </div>
            </div>
        </>
    );
}

AutoReplyForm.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3 border-l-[3px] border-primary pl-2">
                <h2 className="text-sm font-bold">{title}</h2>
            </div>
            <div>{children}</div>
        </div>
    );
}

function ImageUploader({
    url,
    onChange,
    error,
}: {
    url: string;
    onChange: (url: string) => void;
    error?: string;
}) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setUploadError(null);
        try {
            const fd = new FormData();
            fd.append("image", file);
            const xsrf = decodeURIComponent(
                document.cookie
                    .split("; ")
                    .find((c) => c.startsWith("XSRF-TOKEN="))
                    ?.split("=")[1] ?? "",
            );
            const res = await fetch("/auto-replies/upload-image", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "X-XSRF-TOKEN": xsrf,
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

    return (
        <div className="space-y-3">
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                    e.target.value = "";
                }}
                className="hidden"
            />
            {url ? (
                <div className="space-y-2">
                    <img
                        src={url}
                        alt="返信画像"
                        className="max-h-48 rounded-md border border-border"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                    >
                        画像を変更
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full rounded-md border-2 border-dashed border-border bg-muted/20 p-6 text-center hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                    <FontAwesomeIcon
                        icon={faCloudArrowUp}
                        className="size-8 text-muted-foreground/70 mb-2"
                    />
                    <div className="text-sm">
                        {uploading ? "アップロード中..." : "クリックして画像を選択"}
                    </div>
                </button>
            )}
            {(uploadError || error) && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="size-3" />
                    {uploadError ?? error}
                </p>
            )}
            <p className="text-xs text-muted-foreground">
                ※ 画像配信には HTTPS の公開 URL が必要です（cloudflared 等のトンネル / 本番ドメイン）。
            </p>
        </div>
    );
}
