import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faTrash,
    faBookOpen,
    faSort,
    faPenToSquare,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tag-badge";
import { BroadcastStatusBadge } from "@/components/broadcasts/status-badge";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";
import type { Broadcast, BroadcastStatus } from "@/types/broadcast";

type TabId = "scheduled" | "draft" | "history";

const TABS: { id: TabId; label: string; statuses: BroadcastStatus[] }[] = [
    { id: "scheduled", label: "配信予約", statuses: ["scheduled", "sending"] },
    { id: "draft", label: "下書き", statuses: ["draft"] },
    { id: "history", label: "配信履歴", statuses: ["sent", "failed"] },
];

type PageProps = {
    broadcasts: Broadcast[];
    tab: TabId;
};

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

function formatDt(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BroadcastsIndex({ broadcasts, tab }: PageProps) {
    const activeTab = tab;

    const handleTabChange = (id: TabId) => {
        router.get(
            "/broadcasts",
            { tab: id },
            { preserveScroll: true, preserveState: false },
        );
    };

    const emptyMessage = {
        scheduled: "配信予約の登録はありません",
        draft: "下書きはありません",
        history: "配信履歴はありません",
    }[activeTab];

    const onDelete = (b: Broadcast) => {
        if (!confirm(`「${b.title}」を削除しますか？`)) return;
        router.delete(`/broadcasts/${b.id}`, { preserveScroll: true });
    };

    const onSendNow = (b: Broadcast) => {
        if (!confirm(`「${b.title}」を今すぐ配信しますか？`)) return;
        router.post(
            `/broadcasts/${b.id}/send-now`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="メッセージ配信" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            メッセージ配信
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            通信状況により配信予定時間から数分遅れて配信される場合があります。
                        </p>
                    </div>
                    <Button variant="outline" disabled>
                        <FontAwesomeIcon icon={faBookOpen} className="size-3.5" />
                        マニュアル
                    </Button>
                </div>

                <div className="border-b border-border">
                    <nav className="flex gap-6">
                        {TABS.map((t) => {
                            const on = t.id === activeTab;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => handleTabChange(t.id)}
                                    className={cn(
                                        "py-2 text-sm font-bold transition-colors relative -mb-px",
                                        on
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-foreground hover:text-primary",
                                    )}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {activeTab !== "history" && (
                        <Link
                            href="/broadcasts/create"
                            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                            <FontAwesomeIcon icon={faPlus} className="size-3" />
                            新規作成
                        </Link>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {activeTab === "draft"
                            ? "下書きは配信予定日時を過ぎても配信されません。"
                            : activeTab === "scheduled"
                              ? "配信日時5分前から配信内容の編集はできません。"
                              : "配信履歴は変更できません。"}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === "history" ? (
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60">
                                <tr>
                                    <SortableHeader
                                        label="配信日時"
                                        className="w-44"
                                    />
                                    <th className="px-3 py-2 text-left font-bold text-foreground">
                                        管理用タイトル
                                    </th>
                                    <th className="px-3 py-2 text-left font-bold text-foreground w-32">
                                        配信先絞込み
                                    </th>
                                    <th className="px-3 py-2 text-right font-bold text-foreground w-28">
                                        配信数
                                    </th>
                                    <th className="px-3 py-2 text-left font-bold text-foreground w-24">
                                        状態
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {broadcasts.length === 0 ? (
                                    <tr className="border-b border-border">
                                        <td
                                            colSpan={5}
                                            className="px-3 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                ) : (
                                    broadcasts.map((b) => (
                                        <tr
                                            key={b.id}
                                            className="border-b border-border hover:bg-muted/30"
                                        >
                                            <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                {formatDt(b.sent_at)}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-sm font-medium truncate">
                                                    {b.title}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground truncate max-w-md">
                                                    {previewText(b)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <TargetCell broadcast={b} />
                                            </td>
                                            <td className="px-3 py-3 text-right text-xs tabular-nums">
                                                {b.success_count.toLocaleString()}
                                                <span className="text-muted-foreground">
                                                    {" / "}
                                                    {b.total_count.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <BroadcastStatusBadge
                                                    status={b.status}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60">
                                <tr>
                                    <SortableHeader
                                        label={
                                            activeTab === "draft"
                                                ? "更新日時"
                                                : "配信予定日時"
                                        }
                                        className="w-44"
                                    />
                                    <th className="px-3 py-2 text-left font-bold text-foreground">
                                        管理用タイトル
                                    </th>
                                    <th className="px-3 py-2 text-left font-bold text-foreground w-32">
                                        配信先絞込み
                                    </th>
                                    <th className="px-3 py-2 text-left font-bold text-foreground w-24">
                                        状態
                                    </th>
                                    <th className="px-3 py-2 text-left font-bold text-foreground w-36">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {broadcasts.length === 0 ? (
                                    <tr className="border-b border-border">
                                        <td
                                            colSpan={5}
                                            className="px-3 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                ) : (
                                    broadcasts.map((b) => {
                                        const when =
                                            activeTab === "draft"
                                                ? b.updated_at
                                                : b.scheduled_at;
                                        return (
                                            <tr
                                                key={b.id}
                                                className="border-b border-border hover:bg-muted/30"
                                            >
                                                <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                    {formatDt(when)}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-sm font-medium truncate">
                                                        {b.title}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground truncate max-w-md">
                                                        {previewText(b)}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <TargetCell broadcast={b} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <BroadcastStatusBadge
                                                        status={b.status}
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="inline-flex items-center gap-1">
                                                        <Link
                                                            href={`/broadcasts/${b.id}/edit`}
                                                            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted text-foreground"
                                                            aria-label="編集"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faPenToSquare
                                                                }
                                                                className="size-3.5"
                                                            />
                                                        </Link>
                                                        {b.status !==
                                                            "sending" && (
                                                            <button
                                                                onClick={() =>
                                                                    onSendNow(b)
                                                                }
                                                                className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted text-blue-600 dark:text-blue-400"
                                                                aria-label="今すぐ配信"
                                                                title="今すぐ配信"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faPaperPlane
                                                                    }
                                                                    className="size-3.5"
                                                                />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                onDelete(b)
                                                            }
                                                            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                                                            aria-label="削除"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                                className="size-3.5"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    全 {broadcasts.length} 件
                </div>
            </div>
        </>
    );
}

BroadcastsIndex.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function previewText(b: Broadcast): string {
    if (b.message_type === "text") {
        return (b.text_content ?? "").slice(0, 80);
    }
    return "[画像]";
}

function TargetCell({ broadcast }: { broadcast: Broadcast }) {
    if (broadcast.target_type === "all") {
        return (
            <span className="text-xs text-muted-foreground">全員</span>
        );
    }
    if (broadcast.target_tag) {
        return <TagBadge tag={broadcast.target_tag} size="sm" />;
    }
    return <span className="text-xs text-muted-foreground">—</span>;
}

function SortableHeader({
    label,
    className,
}: {
    label: string;
    className?: string;
}) {
    return (
        <th
            className={cn(
                "px-3 py-2 text-left font-bold text-foreground",
                className,
            )}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                <FontAwesomeIcon
                    icon={faSort}
                    className="size-2.5 text-muted-foreground"
                />
            </span>
        </th>
    );
}
