import { Head, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faPenToSquare,
    faTrash,
    faTriangleExclamation,
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
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { ChatStatus } from "@/types/chat";

type CategoryId =
    | "statuses"
    | "auto-read"
    | "shortcuts"
    | "short-url"
    | "preview"
    | "read-info";

const CATEGORIES: { id: CategoryId; label: string }[] = [
    { id: "statuses", label: "対応ステータス編集" },
    { id: "auto-read", label: "メッセージの自動確認済み変更" },
    { id: "shortcuts", label: "送信ショートカット" },
    { id: "short-url", label: "短縮URLの利用" },
    { id: "preview", label: "送信プレビュー" },
    { id: "read-info", label: "既読情報の表示" },
];

const COLOR_PRESETS = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#22c55e",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
    "#94a3b8",
];

export default function ChatSettings() {
    const [active, setActive] = useState<CategoryId>("statuses");

    return (
        <>
            <Head title="1:1 チャット設定" />
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        1:1 チャット設定
                    </h1>
                </div>

                <div className="flex-1 flex overflow-hidden border-t border-border">
                    <aside className="w-60 shrink-0 border-r border-border py-2 overflow-y-auto">
                        <ul>
                            {CATEGORIES.map((c) => {
                                const on = c.id === active;
                                return (
                                    <li key={c.id}>
                                        <button
                                            onClick={() => setActive(c.id)}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-sm transition-colors border-l-2",
                                                on
                                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                                    : "border-transparent text-foreground hover:bg-muted/40",
                                            )}
                                        >
                                            {c.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {active === "statuses" && <StatusesPanel />}
                        {active === "auto-read" && <AutoReadPanel />}
                        {active === "shortcuts" && <ShortcutsPanel />}
                        {active === "short-url" && <ShortUrlPanel />}
                        {active === "preview" && <PreviewPanel />}
                        {active === "read-info" && <ReadInfoPanel />}
                    </section>
                </div>
            </div>
        </>
    );
}

ChatSettings.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function PanelHeader({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            {description && (
                <p className="text-sm text-muted-foreground mt-1">
                    {description}
                </p>
            )}
        </div>
    );
}

function StatusesPanel() {
    const { props } = usePage<{ chatStatuses?: ChatStatus[] }>();
    const statuses = props.chatStatuses ?? [];
    const [editing, setEditing] = useState<ChatStatus | null>(null);
    const [creating, setCreating] = useState(false);

    const onDelete = (s: ChatStatus) => {
        if (!confirm(`「${s.name}」を削除しますか？`)) return;
        router.delete(`/chat-statuses/${s.id}`, { preserveScroll: true });
    };

    return (
        <div className="space-y-5">
            <PanelHeader
                title="対応ステータス編集"
                description="対応ステータスのテキストとカラーが変更できます"
            />

            <div className="flex items-center gap-2">
                <Button onClick={() => setCreating(true)}>
                    <FontAwesomeIcon icon={faPlus} className="size-3" />
                    追加
                </Button>
            </div>

            <ul className="space-y-2 max-w-2xl">
                {statuses.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                        まだ登録されていません
                    </li>
                ) : (
                    statuses.map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                            <div
                                className="flex-1 flex items-center gap-2 h-10 px-4 rounded-md border"
                                style={{
                                    backgroundColor: hexToRgba(s.color, 0.1),
                                    borderColor: hexToRgba(s.color, 0.3),
                                    color: s.color,
                                }}
                            >
                                <span
                                    className="inline-block size-2.5 rounded-full"
                                    style={{ backgroundColor: s.color }}
                                />
                                <span className="text-sm font-medium">
                                    {s.name}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                className="size-9 p-0"
                                aria-label="編集"
                                onClick={() => setEditing(s)}
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
                                onClick={() => onDelete(s)}
                            >
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className="size-3.5"
                                />
                            </Button>
                        </li>
                    ))
                )}
            </ul>

            <StatusDialog
                open={creating}
                onClose={() => setCreating(false)}
                status={null}
            />
            <StatusDialog
                open={editing !== null}
                onClose={() => setEditing(null)}
                status={editing}
            />
        </div>
    );
}

function StatusDialog({
    open,
    onClose,
    status,
}: {
    open: boolean;
    onClose: () => void;
    status: ChatStatus | null;
}) {
    const form = useForm({
        name: status?.name ?? "",
        color: status?.color ?? COLOR_PRESETS[0],
    });

    useEffect(() => {
        if (open) {
            form.setData({
                name: status?.name ?? "",
                color: status?.color ?? COLOR_PRESETS[0],
            });
            form.clearErrors();
        }
    }, [open, status?.id]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const onSuccess = () => onClose();
        if (status) {
            form.patch(`/chat-statuses/${status.id}`, {
                preserveScroll: true,
                onSuccess,
            });
        } else {
            form.post("/chat-statuses", {
                preserveScroll: true,
                onSuccess,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {status ? "ステータスを編集" : "ステータスを追加"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="cs-name">名前</Label>
                        <Input
                            id="cs-name"
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
                            {COLOR_PRESETS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => form.setData("color", c)}
                                    className={cn(
                                        "size-8 rounded-full border-2 transition-all",
                                        form.data.color === c
                                            ? "scale-110 border-foreground"
                                            : "border-transparent hover:scale-105",
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
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
                            {form.processing
                                ? "保存中..."
                                : status
                                    ? "更新"
                                    : "追加"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AutoReadPanel() {
    const [pref, setPref] = useLocalStoragePref("chatSettings.autoRead", {
        bracket: false,
        sticker: false,
        reactAll: false,
        reactKeyword: false,
        onReply: false,
        onBlock: false,
    });
    const [saved, setSaved] = useState(false);

    const types = [
        { id: "bracket" as const, label: "【〇〇】メッセージ" },
        { id: "sticker" as const, label: "スタンプ" },
        { id: "reactAll" as const, label: "[すべてのメッセージに反応] のメッセージ" },
        { id: "reactKeyword" as const, label: "[設定したキーワードに反応] のメッセージ" },
    ];

    return (
        <div className="space-y-6 max-w-3xl">
            <PanelHeader title="メッセージの自動確認済み変更" />

            <div className="p-4 rounded-lg bg-muted/60 text-sm text-foreground leading-relaxed">
                設定した受信メッセージを自動的に確認済みに変更します。
                <br />
                確認済みに変更されたメッセージは通知されません。
            </div>

            <ul className="space-y-3">
                {types.map((t) => (
                    <li key={t.id}>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={pref[t.id]}
                                onChange={(e) =>
                                    setPref({
                                        ...pref,
                                        [t.id]: e.target.checked,
                                    })
                                }
                                className="size-5 rounded border-border accent-primary"
                            />
                            <span className="text-sm text-foreground">
                                {t.label}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>

            <SectionToggle
                title="返信時の自動確認済み変更"
                description="未確認のメッセージがある場合に、メッセージの返信と同時に自動で確認済みに変更します。"
                checked={pref.onReply}
                onCheckedChange={(v) => setPref({ ...pref, onReply: v })}
            />

            <SectionToggle
                title="ブロックされた友だちの自動確認済み変更"
                description="未確認のメッセージがある状態で、友だちからブロックされた際に自動で確認済みに変更します。"
                checked={pref.onBlock}
                onCheckedChange={(v) => setPref({ ...pref, onBlock: v })}
            />

            <SaveButton
                onSave={() => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                }}
                saved={saved}
            />
        </div>
    );
}

function ShortcutsPanel() {
    const [mode, setMode] = useLocalStoragePref<"shift_enter_send" | "enter_send">(
        "chatSettings.sendShortcut",
        "shift_enter_send",
    );
    const [saved, setSaved] = useState(false);

    return (
        <div className="space-y-6 max-w-3xl">
            <PanelHeader title="送信ショートカット" />
            <p className="text-sm text-foreground">
                送信時のショートカットを変更します。
            </p>

            <RadioGroup
                value={mode}
                onValueChange={(v) =>
                    setMode(v as "shift_enter_send" | "enter_send")
                }
                className="space-y-3"
            >
                <Label
                    className={cn(
                        "flex items-center gap-3 cursor-pointer text-sm",
                        mode === "shift_enter_send"
                            ? "text-primary font-bold"
                            : "text-muted-foreground font-normal",
                    )}
                >
                    <RadioGroupItem value="shift_enter_send" />
                    <span>送信: Shift+Enter　改行: Enter</span>
                </Label>
                <Label
                    className={cn(
                        "flex items-center gap-3 cursor-pointer text-sm",
                        mode === "enter_send"
                            ? "text-primary font-bold"
                            : "text-muted-foreground font-normal",
                    )}
                >
                    <RadioGroupItem value="enter_send" />
                    <span>送信: Enter　改行: Shift+Enter</span>
                </Label>
            </RadioGroup>

            <SaveButton
                onSave={() => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                }}
                saved={saved}
            />
        </div>
    );
}

function ShortUrlPanel() {
    const [enabled, setEnabled] = useLocalStoragePref(
        "chatSettings.shortUrl",
        false,
    );
    const [saved, setSaved] = useState(false);

    return (
        <div className="space-y-6 max-w-3xl">
            <PanelHeader title="短縮URLの利用" />
            <p className="text-sm text-foreground leading-relaxed">
                1:1チャットでURLを送信する際に短縮リンクを利用します。
                <br />
                (URL分析が利用できます)
            </p>
            <LabeledSwitch
                checked={enabled}
                onCheckedChange={setEnabled}
                offLabel="利用しない"
                onLabel="利用する"
            />
            <SaveButton
                onSave={() => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                }}
                saved={saved}
            />
        </div>
    );
}

function PreviewPanel() {
    const [enabled, setEnabled] = useLocalStoragePref(
        "chatSettings.sendPreview",
        true,
    );
    const [saved, setSaved] = useState(false);

    return (
        <div className="space-y-6 max-w-3xl">
            <PanelHeader title="送信プレビュー" />
            <p className="text-sm text-foreground">
                1:1チャットでの送信時にプレビューを表示します。
            </p>
            <LabeledSwitch
                checked={enabled}
                onCheckedChange={setEnabled}
                offLabel="利用しない"
                onLabel="利用する"
            />
            <div className="p-4 rounded-lg border-2 border-destructive/70 bg-destructive/5">
                <div className="flex items-center gap-1.5 text-destructive font-bold text-sm">
                    <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        className="size-3.5"
                    />
                    ご注意
                </div>
                <p className="mt-2 text-sm text-foreground leading-relaxed">
                    LINE 公式アカウントの仕様上、ichigo-step
                    からの送信取り消しはできません。送信から 24
                    時間以内のメッセージのみ、LINE 公式アカウント管理画面のチャットから送信取り消しが可能です。
                </p>
            </div>
            <SaveButton
                onSave={() => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                }}
                saved={saved}
            />
        </div>
    );
}

const READ_INFO_FAQ = [
    {
        question:
            "Q. ichigo-step から友だちがメッセージを開いたか（既読か）はわかりますか？",
        answer:
            "A. ichigo-step から友だちが既読したかどうかの情報は確認できません。",
        body: "これは LINE 公式アカウント側の仕様のため、LINE 公式アカウントの仕様が変更されない限り、ichigo-step 側では既読情報の確認はできません。",
    },
    {
        question:
            "Q. 友だちがメッセージを送信してすぐに既読マークをつけないようにできますか？",
        answer: "A. LINE 公式アカウントの設定変更で対応可能です。",
        body: "LINE 公式アカウント管理画面の「応答設定」のチャットがオンかオフかによって表示が異なります。",
    },
    {
        question:
            "Q. 友だちからのメッセージを確認しても、相手のライン上で「既読」がつかないのですがエラーですか？",
        answer:
            "A. LINE 公式アカウント管理画面のチャット機能がオンになっている場合は LINE 公式アカウント側でチャットを確認しない限りは既読は付きません。",
        body: "オフの場合は、友だちがメッセージを送信した時点で既読になります。",
    },
];

function ReadInfoPanel() {
    return (
        <div className="space-y-6 max-w-3xl">
            <PanelHeader title="既読情報の表示" />
            <div className="space-y-8">
                {READ_INFO_FAQ.map((qa, i) => (
                    <div key={i} className="space-y-3">
                        <div className="px-4 py-3 rounded-md bg-muted/60 text-sm font-bold text-foreground leading-relaxed">
                            {qa.question}
                        </div>
                        <div className="px-1 space-y-2">
                            <div className="text-sm font-bold text-foreground underline underline-offset-2">
                                {qa.answer}
                            </div>
                            <div className="text-sm text-foreground leading-relaxed">
                                {qa.body}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SectionToggle({
    title,
    description,
    checked,
    onCheckedChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
}) {
    return (
        <div className="space-y-2 pt-2">
            <div className="text-base font-bold tracking-tight">{title}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </div>
            <LabeledSwitch
                checked={checked}
                onCheckedChange={onCheckedChange}
                offLabel="利用しない"
                onLabel="利用する"
            />
        </div>
    );
}

function LabeledSwitch({
    checked,
    onCheckedChange,
    offLabel,
    onLabel,
}: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    offLabel: string;
    onLabel: string;
}) {
    return (
        <div className="flex items-center gap-3 pt-1">
            <span
                className={cn(
                    "text-sm",
                    !checked
                        ? "font-bold text-foreground"
                        : "text-muted-foreground",
                )}
            >
                {offLabel}
            </span>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
            <span
                className={cn(
                    "text-sm",
                    checked
                        ? "font-bold text-foreground"
                        : "text-muted-foreground",
                )}
            >
                {onLabel}
            </span>
        </div>
    );
}

function SaveButton({
    onSave,
    saved,
}: {
    onSave: () => void;
    saved: boolean;
}) {
    return (
        <div className="pt-2 flex items-center gap-3">
            <Button
                variant="outline"
                onClick={onSave}
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary px-10"
            >
                保存
            </Button>
            {saved && (
                <span className="text-xs text-primary">保存しました</span>
            )}
        </div>
    );
}

function useLocalStoragePref<T>(
    key: string,
    initial: T,
): [T, (v: T) => void] {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") return initial;
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initial;
        } catch {
            return initial;
        }
    });

    const update = (v: T) => {
        setValue(v);
        try {
            window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
            // ignore
        }
    };

    return [value, update];
}

function hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace("#", "");
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
