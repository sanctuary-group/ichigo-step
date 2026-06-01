import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faBan,
    faTrashCan,
    faPlus,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FriendAvatar } from "@/components/friend-avatar";
import { TagBadge } from "@/components/tag-badge";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { friendDisplayName, sourceLabel } from "@/lib/friend";
import { cn } from "@/lib/utils";
import type { Friend, Tag } from "@/types/chat";
import type { FriendField } from "@/types/data-management";

type StepDelivery = {
    scenario_name: string;
    step_label: string;
    status: string;
    next_delivery_at: string | null;
};

type StepHistoryRow = {
    id: number;
    delivered_at: string;
    scenario_name: string;
    step_label: string;
    count: number | null;
    preview: string;
};

type ScenarioOption = { id: number; name: string };

type PageProps = {
    friend: Friend;
    friendFields: FriendField[];
    messageCount: number;
    stepDelivery: StepDelivery | null;
    stepHistory: StepHistoryRow[];
    scenarioOptions: ScenarioOption[];
};

const TABS = [
    "基本情報",
    "ステップ配信",
    "リマインド配信",
    "タグ",
    "イベント予約",
    "購入履歴",
    "フォーム回答",
] as const;
type TabKey = (typeof TABS)[number];

function dot(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function FriendShow({
    friend,
    friendFields,
    messageCount,
    stepDelivery,
    stepHistory,
    scenarioOptions,
}: PageProps) {
    const name = friendDisplayName(friend);
    const [tab, setTab] = useState<TabKey>("基本情報");

    const block = () => {
        const msg = friend.is_hidden
            ? "この友だちを再表示しますか？"
            : "この友だちをブロック（非表示）しますか？";
        if (!confirm(msg)) return;
        router.patch(
            `/friends/${friend.id}/hidden`,
            {},
            { preserveScroll: true },
        );
    };

    const remove = () => {
        if (
            !confirm(
                `「${name}」を削除しますか？\nトーク履歴・友だち情報もすべて削除され、元に戻せません。`,
            )
        )
            return;
        router.delete(`/friends/${friend.id}`);
    };

    return (
        <>
            <Head title={`${name} の詳細`} />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
                <h1 className="text-xl font-bold tracking-tight">
                    友だち情報詳細
                </h1>

                {/* ヘッダーカード */}
                <div className="rounded-lg border border-border bg-muted/30 px-4 sm:px-6 py-4 flex items-center gap-4">
                    <FriendAvatar friend={friend} className="size-12" />
                    <div className="flex-1 min-w-0">
                        <div className="text-base font-bold truncate">
                            {name}
                        </div>
                        {friend.is_hidden && (
                            <span className="text-[11px] text-muted-foreground">
                                非表示中
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href={`/chat?friend=${friend.id}`}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
                        >
                            <FontAwesomeIcon
                                icon={faComments}
                                className="size-3.5"
                            />
                            チャット
                        </Link>
                        <button
                            type="button"
                            onClick={block}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium bg-zinc-500 hover:bg-zinc-600 text-white transition-colors"
                        >
                            <FontAwesomeIcon icon={faBan} className="size-3.5" />
                            {friend.is_hidden ? "再表示" : "ブロック"}
                        </button>
                        <button
                            type="button"
                            onClick={remove}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                        >
                            <FontAwesomeIcon
                                icon={faTrashCan}
                                className="size-3.5"
                            />
                            削除
                        </button>
                    </div>
                </div>

                {/* タブバー */}
                <div className="border-b border-border flex items-center gap-1 overflow-x-auto">
                    {TABS.map((t) => {
                        const active = t === tab;
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={cn(
                                    "px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors",
                                    active
                                        ? "border-primary text-primary font-bold"
                                        : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>

                {tab === "基本情報" && (
                    <div className="space-y-8">
                        <BasicInfoTable friend={friend} count={messageCount} />
                        <FriendInfoTable
                            friend={friend}
                            fields={friendFields}
                        />
                        <MemoSection friend={friend} />
                    </div>
                )}

                {tab === "ステップ配信" && (
                    <StepDeliverySection
                        friend={friend}
                        delivery={stepDelivery}
                        history={stepHistory}
                        scenarioOptions={scenarioOptions}
                    />
                )}

                {tab === "タグ" && <TagsSection friend={friend} />}

                {tab !== "基本情報" &&
                    tab !== "タグ" &&
                    tab !== "ステップ配信" && (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            「{tab}」は準備中です。
                        </div>
                    )}
            </div>
        </>
    );
}

FriendShow.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function SectionHeading({
    title,
    action,
}: {
    title: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">{title}</h2>
            {action}
        </div>
    );
}

function DisplaySettingButton() {
    return (
        <Button
            type="button"
            size="sm"
            disabled
            className="h-8 bg-zinc-500 text-white opacity-70"
        >
            表示設定
        </Button>
    );
}

function BasicInfoTable({
    friend,
    count,
}: {
    friend: Friend;
    count: number;
}) {
    const added = friend.followed_at
        ? `${dot(friend.followed_at)}${friend.source ? ` ${sourceLabel(friend.source)}` : ""}`
        : "—";

    const rows: [string, React.ReactNode][] = [
        ["LINE名", friend.display_name ?? "—"],
        ["友だち追加日時", added],
        [
            "最終メッセージ受信",
            friend.last_message_at ? dot(friend.last_message_at) : "—",
        ],
        ["QRコードアクション", "—"],
        ["紹介アフィリエイター", "—"],
        ["表示中リッチメニュー", "—"],
    ];

    return (
        <section>
            <SectionHeading title="基本情報" action={<DisplaySettingButton />} />
            <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                    <tbody>
                        {rows.map(([label, value], i) => (
                            <tr
                                key={label}
                                className={cn(
                                    i !== rows.length - 1 &&
                                        "border-b border-border",
                                )}
                            >
                                <th className="w-48 text-left align-top font-medium bg-muted/50 px-4 py-3 border-r border-border">
                                    {label}
                                </th>
                                <td className="px-4 py-3">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function FriendInfoTable({
    friend,
    fields,
}: {
    friend: Friend;
    fields: FriendField[];
}) {
    const initialValues = useMemo(() => {
        const map: Record<number, string> = {};
        for (const f of fields) {
            const v = (friend.field_values ?? []).find(
                (fv) => fv.friend_field_id === f.id,
            );
            map[f.id] = v?.value ?? "";
        }
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friend.id, fields.length]);

    const [sysName, setSysName] = useState(friend.system_display_name ?? "");
    const [values, setValues] = useState<Record<number, string>>(initialValues);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setSysName(friend.system_display_name ?? "");
        setValues(initialValues);
        setSaved(false);
    }, [friend.id, initialValues, friend.system_display_name]);

    const sysDirty = sysName !== (friend.system_display_name ?? "");
    const fieldsDirty = fields.some(
        (f) => (values[f.id] ?? "") !== initialValues[f.id],
    );
    const dirty = sysDirty || fieldsDirty;

    const finish = () => {
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const save = () => {
        setSaving(true);
        const saveFields = () => {
            if (!fieldsDirty) return finish();
            router.put(
                `/friends/${friend.id}/field-values`,
                { values },
                { preserveScroll: true, onSuccess: finish, onError: () => setSaving(false) },
            );
        };
        if (sysDirty) {
            router.patch(
                `/friends/${friend.id}`,
                { system_display_name: sysName || null },
                {
                    preserveScroll: true,
                    onSuccess: saveFields,
                    onError: () => setSaving(false),
                },
            );
        } else {
            saveFields();
        }
    };

    return (
        <section>
            <SectionHeading
                title="友だち情報"
                action={<DisplaySettingButton />}
            />
            <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                    <tbody>
                        <FriendInfoRow label="システム表示名" first>
                            <input
                                value={sysName}
                                onChange={(e) => setSysName(e.target.value)}
                                maxLength={100}
                                placeholder="社内呼称（任意）"
                                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                            />
                        </FriendInfoRow>

                        {fields.map((f) => (
                            <FriendInfoRow key={f.id} label={f.name}>
                                <FieldValueCell
                                    field={f}
                                    value={values[f.id] ?? ""}
                                    onChange={(v) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            [f.id]: v,
                                        }))
                                    }
                                />
                            </FriendInfoRow>
                        ))}
                    </tbody>
                </table>
            </div>
            {fields.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                    項目を増やすには
                    <Link
                        href="/data-management/friend-fields"
                        className="text-blue-600 dark:text-blue-400 underline mx-1"
                    >
                        友だち情報管理
                    </Link>
                    で作成してください。
                </p>
            )}
            <div className="flex items-center justify-end gap-3 mt-3">
                <span className="text-xs text-muted-foreground">
                    {saved ? "保存しました" : ""}
                </span>
                <Button size="sm" onClick={save} disabled={saving || !dirty}>
                    {saving ? "保存中..." : "保存"}
                </Button>
            </div>
        </section>
    );
}

function FriendInfoRow({
    label,
    first,
    children,
}: {
    label: string;
    first?: boolean;
    children: React.ReactNode;
}) {
    return (
        <tr className={cn(!first && "border-t border-border")}>
            <th className="w-48 text-left align-middle font-medium bg-zinc-500 text-white px-4 py-2.5">
                {label}
            </th>
            <td className="px-4 py-2.5">{children}</td>
        </tr>
    );
}

function FieldValueCell({
    field,
    value,
    onChange,
}: {
    field: FriendField;
    value: string;
    onChange: (v: string) => void;
}) {
    if (field.field_type === "choice") {
        return (
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
            >
                <option value="">未設定</option>
                {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        );
    }
    const type =
        field.field_type === "number"
            ? "number"
            : field.field_type === "date"
                ? "date"
                : field.field_type === "phone"
                    ? "tel"
                    : field.field_type === "email"
                        ? "email"
                        : "text";
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={1000}
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
        />
    );
}

function MemoSection({ friend }: { friend: Friend }) {
    const form = useForm({ note: friend.note ?? "" });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        form.setData("note", friend.note ?? "");
        setSaved(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friend.id]);

    const save = () => {
        form.transform((d) => ({ note: d.note }));
        form.patch(`/friends/${friend.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            },
        });
    };

    return (
        <section>
            <h2 className="text-base font-bold mb-3">メモ</h2>
            <textarea
                value={form.data.note}
                onChange={(e) => form.setData("note", e.target.value)}
                placeholder="この友だちに関するメモを入力..."
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y min-h-28"
            />
            <div className="flex items-center justify-end gap-3 mt-3">
                <span className="text-xs text-muted-foreground">
                    {saved ? "保存しました" : ""}
                </span>
                <Button size="sm" onClick={save} disabled={form.processing}>
                    {form.processing ? "保存中..." : "保存"}
                </Button>
            </div>
        </section>
    );
}

function StepDeliverySection({
    friend,
    delivery,
    history,
    scenarioOptions,
}: {
    friend: Friend;
    delivery: StepDelivery | null;
    history: StepHistoryRow[];
    scenarioOptions: ScenarioOption[];
}) {
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [scenarioId, setScenarioId] = useState<string>("");

    const stop = () => {
        if (!confirm("進行中のステップ配信を強制停止しますか？")) return;
        router.post(
            `/friends/${friend.id}/scenario/stop`,
            {},
            { preserveScroll: true },
        );
    };

    const enroll = () => {
        if (!scenarioId) return;
        router.post(
            `/friends/${friend.id}/scenario/enroll`,
            { scenario_id: Number(scenarioId) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEnrollOpen(false);
                    setScenarioId("");
                },
            },
        );
    };

    const stepValue = delivery
        ? `${delivery.scenario_name} / ${delivery.step_label}`
        : "停止中";
    const nextValue =
        delivery && delivery.next_delivery_at
            ? dot(delivery.next_delivery_at)
            : "停止中";

    return (
        <div className="space-y-8">
            <section>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h2 className="text-base font-bold">ステップ配信情報</h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setEnrollOpen(true)}
                            className="h-9 px-4 rounded-md text-sm font-medium bg-amber-400 hover:bg-amber-500 text-white transition-colors"
                        >
                            手動変更
                        </button>
                        <button
                            type="button"
                            onClick={stop}
                            disabled={!delivery}
                            className="h-9 px-4 rounded-md text-sm font-medium bg-zinc-500 hover:bg-zinc-600 text-white transition-colors disabled:opacity-50"
                        >
                            強制停止
                        </button>
                    </div>
                </div>
                <div className="border border-border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-border">
                                <th className="w-48 text-left align-top font-medium bg-muted/50 px-4 py-3 border-r border-border">
                                    配信中のステップ
                                </th>
                                <td className="px-4 py-3">{stepValue}</td>
                            </tr>
                            <tr>
                                <th className="w-48 text-left align-top font-medium bg-muted/50 px-4 py-3 border-r border-border">
                                    次回配信予定
                                </th>
                                <td className="px-4 py-3">{nextValue}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-base font-bold mb-3">配信履歴</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                            <tr>
                                <th className="px-3 py-2.5 text-left font-bold w-44">
                                    配信日時
                                </th>
                                <th className="px-3 py-2.5 text-left font-bold">
                                    ステップ名
                                </th>
                                <th className="px-3 py-2.5 text-left font-bold w-20">
                                    通数
                                </th>
                                <th className="px-3 py-2.5 text-left font-bold w-32">
                                    配信ステータス
                                </th>
                                <th className="px-3 py-2.5 text-left font-bold">
                                    メッセージ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr className="border-b border-border">
                                    <td
                                        colSpan={5}
                                        className="px-3 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        配信履歴はありません。
                                    </td>
                                </tr>
                            ) : (
                                history.map((h) => (
                                    <tr
                                        key={h.id}
                                        className="border-b border-border hover:bg-muted/30"
                                    >
                                        <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">
                                            {dot(h.delivered_at)}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {h.scenario_name} / {h.step_label}
                                        </td>
                                        <td className="px-3 py-2.5 tabular-nums">
                                            {h.count ?? "—"}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="inline-flex items-center text-[11px] px-2 h-5 rounded-full bg-primary/10 text-primary font-medium">
                                                配信完了
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-muted-foreground truncate max-w-xs">
                                            {h.preview}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-4">
                    全{history.length}件中 1〜{history.length}件を表示中
                </div>
                <div className="flex justify-center mt-3">
                    <span className="grid place-items-center size-8 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                        1
                    </span>
                </div>
            </section>

            <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ステップ配信を手動で開始</DialogTitle>
                    </DialogHeader>
                    {scenarioOptions.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            開始できるシナリオがありません。先に
                            <Link
                                href="/scenarios"
                                className="text-blue-600 dark:text-blue-400 underline mx-1"
                            >
                                ステップ配信
                            </Link>
                            でステップ付きのシナリオを作成してください。
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">
                                    シナリオ
                                </label>
                                <select
                                    value={scenarioId}
                                    onChange={(e) =>
                                        setScenarioId(e.target.value)
                                    }
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">選択してください</option>
                                    {scenarioOptions.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {delivery && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                    既に進行中のステップ配信があります。同じシナリオを選ぶと最初から再開します。
                                </p>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEnrollOpen(false)}
                                >
                                    キャンセル
                                </Button>
                                <Button onClick={enroll} disabled={!scenarioId}>
                                    開始する
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function TagsSection({ friend }: { friend: Friend }) {
    const { props } = usePage<{ tags?: Tag[] }>();
    const allTags = props.tags ?? [];
    const attached = friend.tags ?? [];
    const attachedIds = new Set(attached.map((t) => t.id));
    const available = allTags.filter((t) => !attachedIds.has(t.id));
    const [open, setOpen] = useState(false);

    const attach = (t: Tag) =>
        router.post(
            `/friends/${friend.id}/tags/${t.id}`,
            {},
            { preserveScroll: true, onSuccess: () => setOpen(false) },
        );
    const detach = (t: Tag) =>
        router.delete(`/friends/${friend.id}/tags/${t.id}`, {
            preserveScroll: true,
        });

    return (
        <section className="space-y-3">
            <h2 className="text-base font-bold">タグ</h2>
            <div className="flex flex-wrap gap-1.5">
                {attached.length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                        タグはまだありません
                    </div>
                ) : (
                    attached.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => detach(t)}
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
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <FontAwesomeIcon icon={faPlus} className="size-3" />
                タグを追加
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>タグを追加</DialogTitle>
                    </DialogHeader>
                    {allTags.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            タグがまだ作成されていません。先に
                            <Link
                                href="/tags"
                                className="text-blue-600 dark:text-blue-400 underline mx-1"
                            >
                                タグ管理
                            </Link>
                            で作成してください。
                        </div>
                    ) : available.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            すべてのタグが付与済みです。
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {available.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => attach(t)}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <TagBadge tag={t} />
                                </button>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
