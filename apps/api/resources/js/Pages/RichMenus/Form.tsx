import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faCloudArrowUp,
    faImage,
    faLightbulb,
    faCircleInfo,
    faTriangleExclamation,
    faUpRightFromSquare,
    faComment,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import type { LineChannel } from "@/types/broadcast";
import type {
    RichMenu,
    RichMenuAreaAction,
    RichMenuActionType,
    RichMenuFolder,
    RichMenuLayout,
} from "@/types/rich-menu";

const MAX_NAME = 50;
const MAX_CHATBAR = 14;

type StepId = 1 | 2 | 3 | 4;
const STEPS: { id: StepId; label: string }[] = [
    { id: 1, label: "画像設定" },
    { id: 2, label: "タップエリア" },
    { id: 3, label: "タップ時アクション" },
    { id: 4, label: "詳細設定" },
];

type FolderOption = Pick<RichMenuFolder, "id" | "name" | "is_system">;

type PageProps = {
    richMenu: (RichMenu & { image_url?: string | null }) | null;
    layouts: RichMenuLayout[];
    folders: FolderOption[];
    defaultName?: string;
    defaultFolderId: number | null;
};

type FormShape = {
    name: string;
    line_channel_id: number;
    rich_menu_folder_id: number;
    chat_bar_text: string;
    layout_key: string;
    image_path: string | null;
    areas: RichMenuAreaAction[];
};

function buildAreas(
    count: number,
    existing: RichMenuAreaAction[] = [],
): RichMenuAreaAction[] {
    return Array.from({ length: count }, (_, i) => ({
        type: existing[i]?.type ?? "none",
        value: existing[i]?.value ?? "",
    }));
}

export default function RichMenuForm({
    richMenu,
    layouts,
    folders,
    defaultName,
    defaultFolderId,
}: PageProps) {
    const { props } = usePage<{ channels: LineChannel[] }>();
    const channels = props.channels;
    const isEdit = !!richMenu;

    const initialLayoutKey = richMenu?.layout_key ?? layouts[0]?.key ?? "large_6";
    const initialLayout =
        layouts.find((l) => l.key === initialLayoutKey) ?? layouts[0];

    const form = useForm<FormShape>({
        name: richMenu?.name ?? defaultName ?? "",
        line_channel_id: richMenu?.line_channel_id ?? channels[0]?.id ?? 0,
        rich_menu_folder_id:
            richMenu?.rich_menu_folder_id ??
            defaultFolderId ??
            folders[0]?.id ??
            0,
        chat_bar_text: richMenu?.chat_bar_text ?? "メニュー",
        layout_key: initialLayoutKey,
        image_path: richMenu?.image_path ?? null,
        areas: buildAreas(initialLayout?.areas.length ?? 0, richMenu?.areas ?? []),
    });

    const [step, setStep] = useState<StepId>(1);
    const [imageUrl, setImageUrl] = useState<string | null>(
        richMenu?.image_url ?? null,
    );
    const [imageSize, setImageSize] = useState<"large" | "compact" | null>(
        richMenu?.size ?? null,
    );
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const layout = useMemo(
        () => layouts.find((l) => l.key === form.data.layout_key) ?? layouts[0],
        [form.data.layout_key, layouts],
    );
    const layoutsForSize = useMemo(
        () => layouts.filter((l) => l.size === imageSize),
        [layouts, imageSize],
    );

    const selectLayout = (key: string) => {
        const next = layouts.find((l) => l.key === key);
        if (!next) return;
        form.setData((prev) => ({
            ...prev,
            layout_key: key,
            areas: buildAreas(next.areas.length, prev.areas),
        }));
    };

    const setArea = (i: number, patch: Partial<RichMenuAreaAction>) => {
        form.setData(
            "areas",
            form.data.areas.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
        );
    };

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
            const res = await fetch("/rich-menus/upload-image", {
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
            const data = (await res.json()) as {
                path: string;
                url: string;
                size: "large" | "compact";
            };
            setImageSize(data.size);
            // レイアウトが画像サイズと不一致なら、そのサイズの先頭レイアウトへ
            const matchedLayouts = layouts.filter((l) => l.size === data.size);
            const keepCurrent = matchedLayouts.some(
                (l) => l.key === form.data.layout_key,
            );
            const nextLayout = keepCurrent
                ? layouts.find((l) => l.key === form.data.layout_key)!
                : matchedLayouts[0];
            form.setData((prev) => ({
                ...prev,
                image_path: data.path,
                layout_key: nextLayout.key,
                areas: keepCurrent
                    ? prev.areas
                    : buildAreas(nextLayout.areas.length, prev.areas),
            }));
            setImageUrl(data.url);
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

    const save = (then?: () => void) => {
        if (isEdit) {
            form.patch(`/rich-menus/${richMenu!.id}`, {
                preserveScroll: true,
                onSuccess: then,
            });
        } else {
            form.post("/rich-menus", { preserveScroll: true });
        }
    };

    const publish = () => {
        if (!isEdit) return;
        save(() =>
            router.post(
                `/rich-menus/${richMenu!.id}/publish`,
                {},
                { preserveScroll: true },
            ),
        );
    };

    const unpublish = () => {
        if (!isEdit) return;
        if (!confirm("LINE 側のリッチメニューを取り下げます。よろしいですか？"))
            return;
        router.post(
            `/rich-menus/${richMenu!.id}/unpublish`,
            {},
            { preserveScroll: true },
        );
    };

    const hasImage = !!form.data.image_path;
    const canNext = step === 1 ? hasImage : true;

    return (
        <>
            <Head title={isEdit ? "リッチメニュー編集" : "リッチメニュー作成"} />
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/20">
                {/* ヘッダー: パンくず + 管理名 + フォルダ */}
                <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3 bg-background border-b border-border">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_320px] gap-6 items-end">
                        <div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Link
                                    href="/rich-menus"
                                    className="hover:text-foreground hover:underline"
                                >
                                    TOP
                                </Link>
                                <FontAwesomeIcon
                                    icon={faChevronRight}
                                    className="size-2.5"
                                />
                                <span>
                                    リッチメニュー {isEdit ? "編集" : "新規作成"}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight mt-1">
                                リッチメニュー {isEdit ? "編集" : "新規作成"}
                            </h1>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-end justify-between">
                                <Label htmlFor="rm-name" className="text-xs font-bold">
                                    管理名
                                </Label>
                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                    {form.data.name.length} / {MAX_NAME}
                                </span>
                            </div>
                            <Input
                                id="rm-name"
                                value={form.data.name}
                                onChange={(e) => form.setData("name", e.target.value)}
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
                            <Label className="text-xs font-bold">フォルダ</Label>
                            <select
                                value={form.data.rich_menu_folder_id}
                                onChange={(e) =>
                                    form.setData(
                                        "rich_menu_folder_id",
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
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* 左: ステッパー */}
                    <aside className="w-56 shrink-0 border-r border-border bg-background py-8 px-6 hidden md:block">
                        <ol className="space-y-0">
                            {STEPS.map((s, i) => {
                                const active = s.id === step;
                                const done = s.id < step;
                                const last = i === STEPS.length - 1;
                                return (
                                    <li key={s.id} className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => setStep(s.id)}
                                            className="flex items-center gap-3 text-left"
                                        >
                                            <div
                                                className={cn(
                                                    "size-7 rounded-full grid place-items-center text-xs font-bold shrink-0 tabular-nums",
                                                    active &&
                                                        "bg-primary text-primary-foreground",
                                                    done &&
                                                        "bg-primary/80 text-primary-foreground",
                                                    !active &&
                                                        !done &&
                                                        "bg-muted text-muted-foreground",
                                                )}
                                            >
                                                {done ? (
                                                    <FontAwesomeIcon
                                                        icon={faCheck}
                                                        className="size-3"
                                                    />
                                                ) : (
                                                    s.id
                                                )}
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-sm",
                                                    active && "font-bold",
                                                    !active &&
                                                        !done &&
                                                        "text-muted-foreground",
                                                )}
                                            >
                                                {s.label}
                                            </span>
                                        </button>
                                        {!last && (
                                            <div className="ml-3 my-1 h-6 w-px bg-border" />
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </aside>

                    {/* 右: ステップ内容 */}
                    <section className="flex-1 overflow-y-auto bg-background">
                        {step === 1 && (
                            <StepImage
                                layout={layout}
                                imageUrl={imageUrl}
                                areas={form.data.areas}
                                chatBarText={form.data.chat_bar_text}
                                uploading={uploading}
                                uploadError={uploadError}
                                onPick={() => fileRef.current?.click()}
                            />
                        )}
                        {step === 2 && (
                            <StepLayout
                                imageSize={imageSize}
                                layoutsForSize={layoutsForSize}
                                currentKey={form.data.layout_key}
                                onSelect={selectLayout}
                            />
                        )}
                        {step === 3 && (
                            <StepActions
                                layout={layout}
                                imageUrl={imageUrl}
                                areas={form.data.areas}
                                chatBarText={form.data.chat_bar_text}
                                setArea={setArea}
                            />
                        )}
                        {step === 4 && (
                            <StepDetails
                                form={form}
                                channels={channels}
                                layout={layout}
                                imageUrl={imageUrl}
                                isEdit={isEdit}
                                isPublished={!!richMenu?.is_published}
                            />
                        )}
                    </section>
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={onFile}
                    className="hidden"
                />

                {/* フッター */}
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-background border-t border-border gap-3">
                    <div className="text-sm flex items-center gap-1.5 text-muted-foreground">
                        編集内容の友だちへの反映は「公開する」を押したタイミングです
                        <FontAwesomeIcon icon={faCircleInfo} className="size-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setStep((s) => (s - 1) as StepId)
                                }
                                className="h-10 px-6"
                            >
                                &lt; 戻る
                            </Button>
                        )}
                        {step < 4 ? (
                            <Button
                                onClick={() => setStep((s) => (s + 1) as StepId)}
                                disabled={!canNext}
                                className="h-10 px-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                次へ &gt;
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => save()}
                                    disabled={form.processing || uploading}
                                    className="h-10 px-6"
                                >
                                    {form.processing ? "保存中..." : "下書き保存"}
                                </Button>
                                {isEdit && richMenu!.is_published ? (
                                    <Button
                                        variant="outline"
                                        onClick={unpublish}
                                        className="h-10 px-6 text-destructive hover:text-destructive"
                                    >
                                        非公開にする
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={publish}
                                        disabled={
                                            !isEdit ||
                                            form.processing ||
                                            uploading ||
                                            !hasImage ||
                                            channels.length === 0
                                        }
                                        className="h-10 px-8 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        公開する
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

RichMenuForm.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

/* ---------------- STEP 1: 画像設定 ---------------- */
function StepImage({
    layout,
    imageUrl,
    areas,
    chatBarText,
    uploading,
    uploadError,
    onPick,
}: {
    layout: RichMenuLayout;
    imageUrl: string | null;
    areas: RichMenuAreaAction[];
    chatBarText: string;
    uploading: boolean;
    uploadError: string | null;
    onPick: () => void;
}) {
    return (
        <>
            <div className="px-8 py-4 bg-muted/40 border-b border-border">
                <h2 className="text-sm font-bold">
                    STEP① リッチメニュー画像の登録・変更
                </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 px-8 py-8">
                <PhonePreview
                    layout={layout}
                    imageUrl={imageUrl}
                    areas={areas}
                    chatBarText={chatBarText}
                />

                <div className="space-y-5">
                    <p className="text-center text-sm font-medium">
                        リッチメニューとして表示する画像を設定します
                    </p>

                    <button
                        type="button"
                        onClick={onPick}
                        disabled={uploading}
                        className="w-full rounded-md border-2 border-dashed border-border bg-muted/20 p-8 text-center hover:bg-muted/40 transition-colors disabled:opacity-50"
                    >
                        <FontAwesomeIcon
                            icon={faCloudArrowUp}
                            className="size-10 text-muted-foreground/70 mb-3"
                        />
                        <div className="text-sm">
                            {uploading ? (
                                "アップロード中..."
                            ) : (
                                <>
                                    <span className="text-blue-600 dark:text-blue-400 underline">
                                        クリック
                                    </span>{" "}
                                    して画像を選択
                                </>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                            ファイル形式 : .jpg .png
                        </div>
                    </button>

                    {uploadError && (
                        <p className="text-xs text-destructive flex items-center gap-1.5">
                            <FontAwesomeIcon
                                icon={faTriangleExclamation}
                                className="size-3"
                            />
                            {uploadError}
                        </p>
                    )}

                    <div className="relative rounded-md border-2 border-primary/60 p-5">
                        <div className="absolute -top-3 left-4 inline-flex items-center gap-1 bg-primary text-primary-foreground rounded-md px-3 py-1 text-xs font-bold">
                            <FontAwesomeIcon icon={faLightbulb} className="size-3" />
                            ヒント
                        </div>
                        <p className="text-sm mt-1">
                            アップロードできる画像のサイズは
                            <span className="text-red-600 dark:text-red-400 font-medium">
                                以下の2パターンのみ
                            </span>
                            です。
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
                            <SizePreview
                                cols={3}
                                rows={2}
                                label="横) 2,500px　縦) 1,686px"
                            />
                            <SizePreview
                                cols={3}
                                rows={1}
                                label="横) 2,500px　縦) 843px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ---------------- STEP 2: タップエリア ---------------- */
function StepLayout({
    imageSize,
    layoutsForSize,
    currentKey,
    onSelect,
}: {
    imageSize: "large" | "compact" | null;
    layoutsForSize: RichMenuLayout[];
    currentKey: string;
    onSelect: (key: string) => void;
}) {
    return (
        <>
            <div className="px-8 py-4 bg-muted/40 border-b border-border">
                <h2 className="text-sm font-bold">
                    STEP② タップエリアのレイアウトを選択
                </h2>
            </div>
            <div className="px-8 py-8">
                {imageSize === null ? (
                    <div className="text-center text-sm text-muted-foreground py-16">
                        先に STEP① で画像をアップロードしてください。
                        <br />
                        画像サイズに応じて選べるレイアウトが変わります。
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground mb-5">
                            アップロードした画像（
                            {imageSize === "large" ? "大サイズ" : "小サイズ"}
                            ）に合わせて、タップエリアの分割パターンを選択してください。
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl">
                            {layoutsForSize.map((l) => (
                                <button
                                    key={l.key}
                                    type="button"
                                    onClick={() => onSelect(l.key)}
                                    className={cn(
                                        "rounded-md border p-3 text-left transition-colors",
                                        l.key === currentKey
                                            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                                            : "border-border hover:bg-muted/40",
                                    )}
                                >
                                    <LayoutThumb layout={l} />
                                    <div className="text-[11px] font-medium mt-2">
                                        {l.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

/* ---------------- STEP 3: タップ時アクション ---------------- */
function StepActions({
    layout,
    imageUrl,
    areas,
    chatBarText,
    setArea,
}: {
    layout: RichMenuLayout;
    imageUrl: string | null;
    areas: RichMenuAreaAction[];
    chatBarText: string;
    setArea: (i: number, patch: Partial<RichMenuAreaAction>) => void;
}) {
    return (
        <>
            <div className="px-8 py-4 bg-muted/40 border-b border-border">
                <h2 className="text-sm font-bold">STEP③ タップ時アクション</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 px-8 py-8">
                <PhonePreview
                    layout={layout}
                    imageUrl={imageUrl}
                    areas={areas}
                    chatBarText={chatBarText}
                />

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        各エリア（番号）をタップしたときの動作を設定します。「なし」のエリアはタップしても反応しません。
                    </p>
                    {areas.map((area, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="size-7 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold tabular-nums mt-1">
                                {i + 1}
                            </div>
                            <div className="flex-1 space-y-2 min-w-0">
                                <select
                                    value={area.type}
                                    onChange={(e) =>
                                        setArea(i, {
                                            type: e.target
                                                .value as RichMenuActionType,
                                        })
                                    }
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="none">なし（タップ無効）</option>
                                    <option value="uri">リンクを開く (URL)</option>
                                    <option value="message">
                                        メッセージを送信
                                    </option>
                                </select>
                                {area.type === "uri" && (
                                    <Input
                                        value={area.value}
                                        onChange={(e) =>
                                            setArea(i, { value: e.target.value })
                                        }
                                        placeholder="https://example.com"
                                        className="h-9"
                                    />
                                )}
                                {area.type === "message" && (
                                    <Input
                                        value={area.value}
                                        onChange={(e) =>
                                            setArea(i, { value: e.target.value })
                                        }
                                        placeholder="送信するテキスト"
                                        className="h-9"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ---------------- STEP 4: 詳細設定 ---------------- */
function StepDetails({
    form,
    channels,
    layout,
    imageUrl,
    isEdit,
    isPublished,
}: {
    form: ReturnType<typeof useForm<FormShape>>;
    channels: LineChannel[];
    layout: RichMenuLayout;
    imageUrl: string | null;
    isEdit: boolean;
    isPublished: boolean;
}) {
    const actionCount = form.data.areas.filter((a) => a.type !== "none").length;
    return (
        <>
            <div className="px-8 py-4 bg-muted/40 border-b border-border">
                <h2 className="text-sm font-bold">STEP④ 詳細設定</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 px-8 py-8">
                <PhonePreview
                    layout={layout}
                    imageUrl={imageUrl}
                    areas={form.data.areas}
                    chatBarText={form.data.chat_bar_text}
                />

                <div className="space-y-6 max-w-md">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold">配信する LINE チャネル</Label>
                        {channels.length === 0 ? (
                            <Link
                                href="/settings/channels"
                                className="block text-sm text-blue-600 dark:text-blue-400 underline"
                            >
                                先に LINE チャネルを登録してください
                            </Link>
                        ) : (
                            <select
                                value={form.data.line_channel_id}
                                onChange={(e) =>
                                    form.setData(
                                        "line_channel_id",
                                        Number(e.target.value),
                                    )
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
                        {form.errors.line_channel_id && (
                            <p className="text-xs text-destructive">
                                {form.errors.line_channel_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-end justify-between">
                            <Label htmlFor="rm-chatbar" className="text-sm font-bold">
                                メニューバーのテキスト
                            </Label>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                                {form.data.chat_bar_text.length} / {MAX_CHATBAR}
                            </span>
                        </div>
                        <Input
                            id="rm-chatbar"
                            value={form.data.chat_bar_text}
                            onChange={(e) =>
                                form.setData("chat_bar_text", e.target.value)
                            }
                            maxLength={MAX_CHATBAR}
                            className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                            トーク画面下部のメニューを開閉するバーに表示されるテキストです。
                        </p>
                    </div>

                    <div className="rounded-md bg-muted/40 border border-border p-4 text-sm space-y-1">
                        <div className="text-muted-foreground">
                            設定済みアクション:{" "}
                            <span className="font-bold text-foreground">
                                {actionCount}
                            </span>{" "}
                            件
                        </div>
                        {isEdit && isPublished && (
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                                現在 LINE に公開中です
                            </div>
                        )}
                        {!isEdit && (
                            <div className="text-xs text-muted-foreground">
                                ※ 公開は「下書き保存」後に行えます
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ---------------- 共通パーツ ---------------- */
function LayoutThumb({ layout }: { layout: RichMenuLayout }) {
    return (
        <div
            className="relative w-full rounded bg-muted overflow-hidden"
            style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
        >
            {layout.areas.map((a, i) => (
                <div
                    key={i}
                    className="absolute border border-primary/40 bg-primary/10"
                    style={{
                        left: `${(a.x / layout.width) * 100}%`,
                        top: `${(a.y / layout.height) * 100}%`,
                        width: `${(a.width / layout.width) * 100}%`,
                        height: `${(a.height / layout.height) * 100}%`,
                    }}
                />
            ))}
        </div>
    );
}

function SizePreview({
    cols,
    rows,
    label,
}: {
    cols: number;
    rows: number;
    label: string;
}) {
    return (
        <div className="space-y-2">
            <div
                className="grid gap-1 aspect-[5/3]"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: cols * rows }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-primary/15 grid place-items-center text-[9px] text-primary"
                    >
                        <FontAwesomeIcon icon={faImage} className="size-4 opacity-70" />
                    </div>
                ))}
            </div>
            <div className="text-xs font-bold text-center">{label}</div>
        </div>
    );
}

/** スマホ枠 + リッチメニュー画像 + 番号付きエリアオーバーレイ */
function PhonePreview({
    layout,
    imageUrl,
    areas,
    chatBarText,
}: {
    layout: RichMenuLayout;
    imageUrl: string | null;
    areas: RichMenuAreaAction[];
    chatBarText: string;
}) {
    return (
        <div className="mx-auto w-[260px] rounded-[2.5rem] border-[10px] border-foreground/90 bg-background overflow-hidden shadow-xl">
            <div className="text-center text-[10px] py-1 bg-foreground/90 text-background">
                プレビュー
            </div>
            <div className="aspect-[9/16] bg-sky-200/50 dark:bg-sky-900/30 grid grid-rows-[1fr_auto]">
                <div />
                <div className="bg-background">
                    <div
                        className="relative w-full"
                        style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
                    >
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="リッチメニュー"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 grid place-items-center bg-muted/70 text-muted-foreground">
                                <div className="flex flex-col items-center gap-1">
                                    <FontAwesomeIcon
                                        icon={faImage}
                                        className="size-6 opacity-50"
                                    />
                                    <span className="text-[10px]">画像未設定</span>
                                </div>
                            </div>
                        )}
                        {layout.areas.map((a, i) => {
                            const action = areas[i];
                            const active = action && action.type !== "none";
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "absolute border flex items-center justify-center",
                                        active
                                            ? "border-primary bg-primary/15"
                                            : "border-white/60 bg-black/5",
                                    )}
                                    style={{
                                        left: `${(a.x / layout.width) * 100}%`,
                                        top: `${(a.y / layout.height) * 100}%`,
                                        width: `${(a.width / layout.width) * 100}%`,
                                        height: `${(a.height / layout.height) * 100}%`,
                                    }}
                                >
                                    <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-foreground/80 text-background grid place-items-center text-[9px] font-bold tabular-nums">
                                        {i + 1}
                                    </span>
                                    {active && (
                                        <FontAwesomeIcon
                                            icon={
                                                action.type === "uri"
                                                    ? faUpRightFromSquare
                                                    : faComment
                                            }
                                            className="size-2.5 text-primary"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-muted/80 px-2 py-2 text-center text-[10px] text-foreground">
                        {chatBarText || "メニュー"}
                    </div>
                </div>
            </div>
        </div>
    );
}
