import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faUser,
    faList,
    faAngleRight,
    faPlus,
    faTrash,
    faArrowUp,
    faArrowDown,
    faImage,
    faXmark,
    faSpinner,
    faCircleQuestion,
    faGear,
    faBug,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/chat";
import type { LineChannel } from "@/types/broadcast";
import type {
    Scenario,
    ScenarioFolder,
    ScenarioStep,
} from "@/types/scenario";

const MAX_NAME = 100;
const MAX_DESC = 500;
const MAX_TEXT = 5000;

type EnrollableFriend = {
    id: number;
    display_name: string | null;
    system_display_name: string | null;
    line_user_id: string;
};

type PageProps = {
    scenario: Scenario | null;
    defaultFolderId: number | null;
    enrollableFriends?: EnrollableFriend[];
    enrolledFriendIds?: number[];
};

type FormStep = {
    delay_minutes: number;
    timing_mode: TimingMode;
    message_type: "text" | "image";
    text_content: string;
    image_url: string;
    image_preview_url: string;
};

type FormData = {
    name: string;
    description: string;
    line_channel_id: number;
    scenario_folder_id: number;
    trigger_type: "friend_add" | "tag_added";
    trigger_tag_id: number | null;
    is_active: boolean;
    steps: FormStep[];
};

type TimingMode = "immediate" | "datetime" | "elapsed";

function defaultStep(delay = 0, mode: TimingMode = "immediate"): FormStep {
    return {
        delay_minutes: delay,
        timing_mode: mode,
        message_type: "text",
        text_content: "",
        image_url: "",
        image_preview_url: "",
    };
}

function toFormSteps(steps: ScenarioStep[] | undefined): FormStep[] {
    if (!steps || steps.length === 0) return [];
    return steps.map((s) => ({
        delay_minutes: s.delay_minutes,
        timing_mode: s.timing_mode ?? "elapsed",
        message_type: s.message_type,
        text_content: s.text_content ?? "",
        image_url: s.image_url ?? "",
        image_preview_url: s.image_preview_url ?? "",
    }));
}

function formatDelay(minutes: number, mode: TimingMode): string {
    if (mode === "immediate" || minutes === 0) return "ステップ開始直後";

    if (mode === "datetime") {
        const days = Math.floor(minutes / 1440);
        const remainder = minutes % 1440;
        const h = Math.floor(remainder / 60);
        const m = remainder % 60;
        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        return `${days} 日後 ${time} に配信`;
    }

    // elapsed
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} 分後`;
    if (m === 0) return `${h} 時間後`;
    return `${h} 時間 ${m} 分後`;
}

export default function ScenariosForm({
    scenario,
    defaultFolderId,
    enrollableFriends = [],
    enrolledFriendIds = [],
}: PageProps) {
    const { props } = usePage<{
        channels: LineChannel[];
        tags: Tag[];
    }>();
    const channels = props.channels;
    const tags = props.tags;

    // フォルダリストはサーバから常時 share してない (templates 同様) ので、追加 fetch するか
    // ここでは scenario.folder のみあり、それ以外は select で他フォルダに変更できない。
    // mockup の挙動に合わせるため、初期値以外は変更不要として固定でも構わない。
    // 簡易: defaultFolderId をフォーム初期値にする。
    const queryParams = useMemo(() => {
        if (typeof window === "undefined") return new URLSearchParams();
        return new URLSearchParams(window.location.search);
    }, []);

    const initialName =
        scenario?.name ?? queryParams.get("name") ?? "";
    const initialFolderId =
        scenario?.scenario_folder_id ??
        (queryParams.get("folder")
            ? Number(queryParams.get("folder"))
            : defaultFolderId ?? 0);

    const isEdit = !!scenario;

    const form = useForm<FormData>({
        name: initialName,
        description: scenario?.description ?? "",
        line_channel_id: scenario?.line_channel_id ?? channels[0]?.id ?? 0,
        scenario_folder_id: initialFolderId,
        trigger_type: scenario?.trigger_type ?? "friend_add",
        trigger_tag_id: scenario?.trigger_tag_id ?? null,
        is_active: scenario?.is_active ?? false,
        steps: toFormSteps(scenario?.steps),
    });

    const [timingOpen, setTimingOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [debugOpen, setDebugOpen] = useState(false);
    const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState("50");

    const updateStep = (idx: number, patch: Partial<FormStep>) => {
        const next = form.data.steps.map((s, i) =>
            i === idx ? { ...s, ...patch } : s,
        );
        form.setData("steps", next);
    };

    const addStep = (delayMinutes: number, mode: TimingMode) => {
        form.setData("steps", [
            ...form.data.steps,
            defaultStep(delayMinutes, mode),
        ]);
        setTimingOpen(false);
    };

    const removeStep = (idx: number) => {
        form.setData(
            "steps",
            form.data.steps.filter((_, i) => i !== idx),
        );
    };

    const moveStep = (idx: number, dir: -1 | 1) => {
        const next = [...form.data.steps];
        const dest = idx + dir;
        if (dest < 0 || dest >= next.length) return;
        [next[idx], next[dest]] = [next[dest], next[idx]];
        form.setData("steps", next);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (form.data.steps.length === 0) {
            alert("配信タイミングを 1 つ以上追加してください");
            return;
        }
        if (isEdit && scenario) {
            form.patch(`/scenarios/${scenario.id}`, { preserveScroll: true });
        } else {
            form.post("/scenarios");
        }
    };

    return (
        <>
            <Head title={isEdit ? "シナリオを編集" : "シナリオを作成"} />
            <form
                onSubmit={onSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6"
            >
                {/* トップ: 管理名 + フォルダ + 戻る */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 lg:items-end">
                    <div className="space-y-1.5">
                        <div className="flex items-end justify-between">
                            <Label
                                htmlFor="sc-name"
                                className="text-sm font-medium"
                            >
                                管理名
                                <span className="text-destructive ml-1">*</span>
                            </Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {form.data.name.length}/{MAX_NAME}
                            </span>
                        </div>
                        <Input
                            id="sc-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                            maxLength={MAX_NAME}
                            className="h-10"
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">フォルダ</Label>
                        {scenario?.folder ? (
                            <div className="h-10 px-3 rounded-md border border-input bg-background text-sm inline-flex items-center">
                                {scenario.folder.name}
                            </div>
                        ) : (
                            <div className="h-10 px-3 rounded-md border border-input bg-muted/30 text-sm text-muted-foreground inline-flex items-center">
                                {form.data.scenario_folder_id
                                    ? `フォルダ #${form.data.scenario_folder_id}`
                                    : "未分類"}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 lg:self-center lg:pb-2.5">
                        {isEdit && (
                            <button
                                type="button"
                                onClick={() => setDebugOpen(true)}
                                className="inline-flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                            >
                                <FontAwesomeIcon
                                    icon={faBug}
                                    className="size-3.5"
                                />
                                デバッグ: 手動で開始
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <FontAwesomeIcon
                                icon={faGear}
                                className="size-3.5"
                            />
                            詳細設定
                        </button>
                        <Link
                            href="/scenarios"
                            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
                        >
                            ステップ配信一覧へ戻る
                        </Link>
                    </div>
                </div>

                {/* 配信対象 (UI のみ - 全員固定) */}
                <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full bg-muted/40 hover:bg-muted px-1.5 py-1.5 pr-4 transition-colors disabled:opacity-100"
                    disabled
                >
                    <span className="grid place-items-center size-8 rounded-full bg-muted-foreground/20">
                        <FontAwesomeIcon
                            icon={faUser}
                            className="size-3.5 text-muted-foreground"
                        />
                    </span>
                    <span className="text-sm text-muted-foreground">
                        選択中の配信対象
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-3 py-1">
                        <span className="text-sm font-bold text-foreground">
                            ステップ購読者全員
                        </span>
                        <FontAwesomeIcon
                            icon={faAngleRight}
                            className="size-2.5 text-muted-foreground"
                        />
                    </span>
                </button>

                {/* アクションバー */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        type="button"
                        onClick={() => setTimingOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-5"
                    >
                        <FontAwesomeIcon icon={faClock} className="size-3.5" />
                        ＋ 配信タイミング
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 border-blue-500 text-blue-600 hover:bg-blue-50/40 hover:text-blue-600"
                        disabled
                    >
                        <FontAwesomeIcon icon={faList} className="size-3.5" />
                        一括プレビュー
                    </Button>

                    <div className="ml-auto flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">表示件数:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value)}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            <option value="25">25件</option>
                            <option value="50">50件</option>
                            <option value="100">100件</option>
                        </select>
                        <span className="text-muted-foreground tabular-nums">
                            {form.data.steps.length}件
                        </span>
                    </div>
                </div>

                <hr className="border-border" />

                {/* ステップリスト */}
                <div className="space-y-3">
                    {form.data.steps.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                            「＋ 配信タイミング」ボタンから配信ステップを追加してください
                        </div>
                    ) : (
                        form.data.steps.map((step, idx) => (
                            <StepCard
                                key={idx}
                                index={idx}
                                step={step}
                                totalSteps={form.data.steps.length}
                                errors={form.errors as Record<string, string>}
                                onChange={(patch) => updateStep(idx, patch)}
                                onEditTiming={() => {
                                    setEditingStepIdx(idx);
                                    setTimingOpen(true);
                                }}
                                onRemove={() => removeStep(idx)}
                                onMoveUp={() => moveStep(idx, -1)}
                                onMoveDown={() => moveStep(idx, 1)}
                            />
                        ))
                    )}

                    {form.data.steps.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setTimingOpen(true)}
                            className="h-10 border-blue-500 text-blue-600 hover:text-blue-600 hover:bg-blue-50/40"
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="size-3"
                            />
                            次の配信タイミングを追加
                        </Button>
                    )}
                </div>

                {/* 保存 + 戻る */}
                <div className="flex items-center gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-8"
                    >
                        {form.processing
                            ? "保存中..."
                            : isEdit
                              ? "更新"
                              : "作成"}
                    </Button>
                    <Link
                        href="/scenarios"
                        className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-border bg-background text-sm text-muted-foreground hover:bg-muted"
                    >
                        戻る
                    </Link>
                </div>
            </form>

            {isEdit && scenario && (
                <DebugDialog
                    open={debugOpen}
                    onClose={() => setDebugOpen(false)}
                    scenarioId={scenario.id}
                    friends={enrollableFriends}
                    enrolledFriendIds={enrolledFriendIds}
                />
            )}

            <SettingsDialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                triggerType={form.data.trigger_type}
                triggerTagId={form.data.trigger_tag_id}
                description={form.data.description}
                isActive={form.data.is_active}
                lineChannelId={form.data.line_channel_id}
                channels={channels}
                tags={tags}
                errors={form.errors as Record<string, string>}
                onChange={(patch) => {
                    Object.entries(patch).forEach(([k, v]) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        form.setData(k as keyof FormData, v as any);
                    });
                }}
            />

            <TimingDialog
                open={timingOpen}
                onClose={() => {
                    setTimingOpen(false);
                    setEditingStepIdx(null);
                }}
                initialDelay={
                    editingStepIdx !== null
                        ? form.data.steps[editingStepIdx]?.delay_minutes ?? 0
                        : 0
                }
                initialMode={
                    editingStepIdx !== null
                        ? form.data.steps[editingStepIdx]?.timing_mode ??
                          "immediate"
                        : "immediate"
                }
                onConfirm={(minutes, mode) => {
                    if (editingStepIdx !== null) {
                        updateStep(editingStepIdx, {
                            delay_minutes: minutes,
                            timing_mode: mode,
                        });
                        setEditingStepIdx(null);
                    } else {
                        addStep(minutes, mode);
                    }
                    setTimingOpen(false);
                }}
            />
        </>
    );
}

ScenariosForm.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function StepCard({
    index,
    step,
    totalSteps,
    errors,
    onChange,
    onEditTiming,
    onRemove,
    onMoveUp,
    onMoveDown,
}: {
    index: number;
    step: FormStep;
    totalSteps: number;
    errors: Record<string, string>;
    onChange: (patch: Partial<FormStep>) => void;
    onEditTiming: () => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const stepNo = index + 1;
    const textErr = errors[`steps.${index}.text_content`];
    const imageErr = errors[`steps.${index}.image_url`];

    return (
        <Card>
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {stepNo}
                    </span>
                    <button
                        type="button"
                        onClick={onEditTiming}
                        className="inline-flex items-center gap-2 px-3 h-8 rounded-md border border-border hover:border-primary/40 text-sm transition-colors"
                    >
                        <FontAwesomeIcon
                            icon={faClock}
                            className="size-3 text-muted-foreground"
                        />
                        <span className="font-bold">
                            {formatDelay(step.delay_minutes, step.timing_mode)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            (クリックで変更)
                        </span>
                    </button>
                    <span className="ml-auto inline-flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onMoveUp}
                            disabled={index === 0}
                            className="size-8 inline-flex items-center justify-center rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="上へ"
                        >
                            <FontAwesomeIcon
                                icon={faArrowUp}
                                className="size-3"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={onMoveDown}
                            disabled={index === totalSteps - 1}
                            className="size-8 inline-flex items-center justify-center rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="下へ"
                        >
                            <FontAwesomeIcon
                                icon={faArrowDown}
                                className="size-3"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="size-8 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                            aria-label="削除"
                        >
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="size-3"
                            />
                        </button>
                    </span>
                </div>

                <div className="flex gap-2 border-b border-border">
                    <button
                        type="button"
                        onClick={() => onChange({ message_type: "text" })}
                        className={cn(
                            "py-2 px-4 text-sm font-bold transition-colors -mb-px",
                            step.message_type === "text"
                                ? "text-primary border-b-2 border-primary"
                                : "text-foreground hover:text-primary",
                        )}
                    >
                        テキスト
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ message_type: "image" })}
                        className={cn(
                            "py-2 px-4 text-sm font-bold transition-colors -mb-px",
                            step.message_type === "image"
                                ? "text-primary border-b-2 border-primary"
                                : "text-foreground hover:text-primary",
                        )}
                    >
                        画像
                    </button>
                </div>

                {step.message_type === "text" ? (
                    <div className="space-y-1.5">
                        <div className="flex justify-end">
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {step.text_content.length}/{MAX_TEXT}
                            </span>
                        </div>
                        <Textarea
                            value={step.text_content}
                            onChange={(e) =>
                                onChange({ text_content: e.target.value })
                            }
                            maxLength={MAX_TEXT}
                            rows={4}
                            placeholder="メッセージ本文を入力..."
                        />
                        {textErr && (
                            <p className="text-xs text-destructive">
                                {textErr}
                            </p>
                        )}
                    </div>
                ) : (
                    <StepImageUploader
                        imageUrl={step.image_url}
                        onChange={(url) =>
                            onChange({
                                image_url: url,
                                image_preview_url: url,
                            })
                        }
                        error={imageErr}
                    />
                )}
            </CardContent>
        </Card>
    );
}

function StepImageUploader({
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
            const res = await fetch("/scenarios/upload-image", {
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
                        className="max-w-xs max-h-48 rounded-md border border-border"
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
                    className="flex flex-col items-center justify-center gap-2 w-full max-w-xs h-32 rounded-md border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="size-5 text-muted-foreground"
                            />
                            <span className="text-xs text-muted-foreground">
                                アップロード中...
                            </span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon
                                icon={faImage}
                                className="size-5 text-muted-foreground"
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

function DebugDialog({
    open,
    onClose,
    scenarioId,
    friends,
    enrolledFriendIds,
}: {
    open: boolean;
    onClose: () => void;
    scenarioId: number;
    friends: EnrollableFriend[];
    enrolledFriendIds: number[];
}) {
    const [submitting, setSubmitting] = useState(false);
    const enrolledCount = useMemo(
        () =>
            friends.filter((f) => enrolledFriendIds.includes(f.id)).length,
        [friends, enrolledFriendIds],
    );

    const submit = () => {
        setSubmitting(true);
        router.post(
            `/scenarios/${scenarioId}/manual-enroll`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
                onSuccess: () => onClose(),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle className="text-lg font-bold inline-flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={faBug}
                        className="size-4 text-orange-600 dark:text-orange-400"
                    />
                    デバッグ: 手動でシナリオ開始
                </DialogTitle>
                <div className="space-y-4 pt-2">
                    <p className="text-xs text-muted-foreground">
                        このシナリオの LINE
                        チャネルに紐付く有効な友だち
                        <span className="font-bold mx-0.5">全員</span>
                        を、トリガー条件を無視して即時 enroll
                        します。既に enroll 済みの友だちはリセットされて step 1
                        から再開します。
                    </p>

                    {friends.length === 0 ? (
                        <p className="text-sm text-destructive">
                            このシナリオの LINE
                            チャネルに紐付くアクティブな友だちがいません。
                        </p>
                    ) : (
                        <div className="rounded-md bg-muted/40 px-4 py-3 space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    対象友だち数:
                                </span>
                                <span className="font-bold tabular-nums">
                                    {friends.length} 名
                                </span>
                            </div>
                            {enrolledCount > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        うち enroll 済み (リセット対象):
                                    </span>
                                    <span className="tabular-nums">
                                        {enrolledCount} 名
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            キャンセル
                        </Button>
                        <Button
                            type="button"
                            onClick={submit}
                            disabled={friends.length === 0 || submitting}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {submitting
                                ? "開始中..."
                                : `${friends.length} 名に開始`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SettingsDialog({
    open,
    onClose,
    triggerType,
    triggerTagId,
    description,
    isActive,
    lineChannelId,
    channels,
    tags,
    errors,
    onChange,
}: {
    open: boolean;
    onClose: () => void;
    triggerType: "friend_add" | "tag_added";
    triggerTagId: number | null;
    description: string;
    isActive: boolean;
    lineChannelId: number;
    channels: LineChannel[];
    tags: Tag[];
    errors: Record<string, string>;
    onChange: (patch: Partial<FormData>) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-xl">
                <DialogTitle className="text-lg font-bold">
                    詳細設定
                </DialogTitle>
                <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold">
                            トリガー
                            <span className="text-destructive ml-1">*</span>
                        </Label>
                        <RadioGroup
                            value={triggerType}
                            onValueChange={(v) =>
                                v &&
                                onChange({
                                    trigger_type: v as
                                        | "friend_add"
                                        | "tag_added",
                                })
                            }
                            className="space-y-2"
                        >
                            <Label className="flex items-center gap-2 cursor-pointer text-sm">
                                <RadioGroupItem value="friend_add" />
                                友だち追加時
                            </Label>
                            <Label className="flex items-center gap-2 cursor-pointer text-sm">
                                <RadioGroupItem value="tag_added" />
                                タグ付与時
                            </Label>
                        </RadioGroup>
                        {triggerType === "tag_added" && (
                            <select
                                value={triggerTagId ?? ""}
                                onChange={(e) =>
                                    onChange({
                                        trigger_tag_id: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
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
                        )}
                        {errors.trigger_tag_id && (
                            <p className="text-xs text-destructive">
                                {errors.trigger_tag_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold">
                            送信元 LINE アカウント
                            <span className="text-destructive ml-1">*</span>
                        </Label>
                        {channels.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                アクティブな LINE チャネルがありません。
                            </p>
                        ) : (
                            <select
                                value={lineChannelId}
                                onChange={(e) =>
                                    onChange({
                                        line_channel_id: Number(e.target.value),
                                    })
                                }
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {channels.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-end justify-between">
                            <Label className="text-sm font-bold">説明</Label>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {description.length}/{MAX_DESC}
                            </span>
                        </div>
                        <Textarea
                            value={description}
                            onChange={(e) =>
                                onChange({ description: e.target.value })
                            }
                            maxLength={MAX_DESC}
                            rows={2}
                            placeholder="社内メモ用..."
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                        <div>
                            <Label className="text-sm font-bold">
                                稼働状態
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                OFF にすると新規友だちは登録されません
                            </p>
                        </div>
                        <Switch
                            checked={isActive}
                            onCheckedChange={(v) =>
                                onChange({ is_active: v })
                            }
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            閉じる
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TimingDialog({
    open,
    onClose,
    initialDelay,
    initialMode,
    onConfirm,
}: {
    open: boolean;
    onClose: () => void;
    initialDelay: number;
    initialMode: TimingMode;
    onConfirm: (minutes: number, mode: TimingMode) => void;
}) {
    const [mode, setMode] = useState<TimingMode>("immediate");
    const [dayOffset, setDayOffset] = useState("0");
    const [timeOfDay, setTimeOfDay] = useState("00:00");
    const [elapsedHours, setElapsedHours] = useState("0");
    const [elapsedMinutes, setElapsedMinutes] = useState("0");

    useEffect(() => {
        if (!open) return;
        setMode(initialMode);

        if (initialMode === "datetime") {
            const days = Math.floor(initialDelay / 1440);
            const rem = initialDelay % 1440;
            const h = Math.floor(rem / 60);
            const m = rem % 60;
            setDayOffset(String(days));
            setTimeOfDay(
                `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
            );
        } else if (initialMode === "elapsed") {
            setElapsedHours(String(Math.floor(initialDelay / 60)));
            setElapsedMinutes(String(initialDelay % 60));
        }
    }, [open, initialDelay, initialMode]);

    const confirm = () => {
        let minutes = 0;
        if (mode === "immediate") {
            minutes = 0;
        } else if (mode === "datetime") {
            const days = Math.max(0, Number(dayOffset) || 0);
            const [hh, mm] = timeOfDay.split(":").map((v) => Number(v) || 0);
            minutes = days * 1440 + hh * 60 + mm;
        } else {
            const hh = Math.max(0, Math.min(72, Number(elapsedHours) || 0));
            const mm = Math.max(0, Math.min(59, Number(elapsedMinutes) || 0));
            minutes = hh * 60 + mm;
        }
        onConfirm(minutes, mode);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogTitle className="text-center text-lg font-bold">
                    配信タイミング選択
                </DialogTitle>

                <RadioGroup
                    value={mode}
                    onValueChange={(v) => v && setMode(v as TimingMode)}
                    className="space-y-3 pt-3"
                >
                    <label
                        className={cn(
                            "block p-4 rounded-lg border-2 cursor-pointer transition-colors",
                            mode === "immediate"
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/40",
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <RadioGroupItem
                                value="immediate"
                                className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-foreground">
                                    ステップ開始直後
                                </div>
                                <p className="text-sm text-foreground mt-1.5">
                                    トリガーが稼働したらすぐに送信します
                                </p>
                            </div>
                        </div>
                    </label>

                    <label
                        className={cn(
                            "block p-4 rounded-lg border-2 cursor-pointer transition-colors",
                            mode === "datetime"
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/40",
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <RadioGroupItem
                                value="datetime"
                                className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-foreground">
                                    日時で指定
                                </div>
                                <p className="text-sm text-foreground mt-1.5">
                                    ステップ開始時からの経過日数と時間で配信タイミングを指定します
                                </p>
                                <div className="mt-3 rounded-md bg-muted/60 p-3 space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap text-sm">
                                        <span className="font-bold">
                                            ステップ開始から
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={dayOffset}
                                            onChange={(e) =>
                                                setDayOffset(e.target.value)
                                            }
                                            onClick={() => setMode("datetime")}
                                            disabled={mode !== "datetime"}
                                            className="w-20 h-9 text-center"
                                        />
                                        <span>日後の</span>
                                        <Input
                                            type="time"
                                            value={timeOfDay}
                                            onChange={(e) =>
                                                setTimeOfDay(e.target.value)
                                            }
                                            onClick={() => setMode("datetime")}
                                            disabled={mode !== "datetime"}
                                            className="h-9 w-32"
                                        />
                                        <span>に配信する</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        ※ステップ開始当日に送信する場合は「0日後」を選択してください
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>

                    <label
                        className={cn(
                            "block p-4 rounded-lg border-2 cursor-pointer transition-colors",
                            mode === "elapsed"
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/40",
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <RadioGroupItem
                                value="elapsed"
                                className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-foreground">
                                    経過時間で指定
                                </div>
                                <p className="text-sm text-foreground mt-1.5">
                                    ステップ開始時からの72時間以内の経過時間を指定します
                                </p>
                                <div className="mt-3 rounded-md bg-muted/60 p-3 space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap text-sm">
                                        <span className="font-bold">
                                            ステップ開始から
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={72}
                                            value={elapsedHours}
                                            onChange={(e) =>
                                                setElapsedHours(e.target.value)
                                            }
                                            onClick={() => setMode("elapsed")}
                                            disabled={mode !== "elapsed"}
                                            className="w-20 h-9 text-center"
                                        />
                                        <span className="font-bold">時間</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={elapsedMinutes}
                                            onChange={(e) =>
                                                setElapsedMinutes(
                                                    e.target.value,
                                                )
                                            }
                                            onClick={() => setMode("elapsed")}
                                            disabled={mode !== "elapsed"}
                                            className="w-20 h-9 text-center"
                                        />
                                        <span>分後に配信する</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        ※設定できるのは72時間00分以内です
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>
                </RadioGroup>

                <div className="pt-4 text-center">
                    <div className="text-sm text-foreground inline-flex items-center gap-1.5">
                        登録できる配信タイミング
                        <FontAwesomeIcon
                            icon={faCircleQuestion}
                            className="size-3.5 text-muted-foreground"
                        />
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 hover:text-primary px-12 h-11"
                        onClick={confirm}
                    >
                        決定
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
