import { Head, router, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { friendDisplayName } from "@/lib/friend";
import { cn } from "@/lib/utils";
import type { Friend } from "@/types/chat";

type FriendsPagination = {
    data: Friend[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    q: string;
    view: string;
    from: string | null;
    to: string | null;
};

type PageProps = {
    friends: FriendsPagination;
    filters: Filters;
};

function pad(n: number): string {
    return n.toString().padStart(2, "0");
}

function formatReceivedAt(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ChatManagement() {
    const { props } = usePage<PageProps>();
    const { friends, filters } = props;
    const [query, setQuery] = useState(filters.q ?? "");
    const [dateFrom, setDateFrom] = useState(filters.from ?? "");
    const [dateTo, setDateTo] = useState(filters.to ?? "");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkStatus, setBulkStatus] = useState<"read" | "unread">("read");

    const applyFilters = (next: Partial<Filters>) => {
        router.get(
            "/chat/management",
            {
                q: next.q ?? filters.q,
                view: next.view ?? filters.view,
                from: next.from === undefined ? filters.from : next.from,
                to: next.to === undefined ? filters.to : next.to,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilters({ q: query });
    };

    const setView = (view: string) => {
        applyFilters({ view });
    };

    const setAllTime = () => {
        setDateFrom("");
        setDateTo("");
        applyFilters({ from: null, to: null });
    };

    const allCheckedInView =
        friends.data.length > 0 &&
        friends.data.every((f) => selectedIds.has(f.id));

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allCheckedInView) {
                for (const r of friends.data) next.delete(r.id);
            } else {
                for (const r of friends.data) next.add(r.id);
            }
            return next;
        });
    };

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const onBulkUpdate = () => {
        if (selectedIds.size === 0) return;
        router.post(
            "/chat/management/bulk-read",
            {
                friend_ids: Array.from(selectedIds),
                status: bulkStatus,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSelectedIds(new Set()),
            },
        );
    };

    return (
        <>
            <Head title="チャット管理" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
                <h1 className="text-2xl font-bold tracking-tight">
                    チャット管理
                </h1>

                <form onSubmit={onSearch} className="flex items-center gap-3">
                    <Label className="font-bold w-28 shrink-0">
                        メッセージ検索
                    </Label>
                    <div className="relative max-w-xl flex-1">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="LINE 名 / システム表示名 / メッセージ内容"
                            className="pr-10 h-10"
                        />
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="size-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                    </div>
                    <Button type="submit" className="h-10 px-5">
                        検索
                    </Button>
                </form>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => setView("all")}
                        className={cn(
                            "h-10 px-8 rounded-md text-sm font-medium transition-colors border",
                            filters.view === "all"
                                ? "bg-background text-primary border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/40",
                        )}
                    >
                        一覧
                    </button>
                    <button
                        onClick={() => setView("unread")}
                        className={cn(
                            "h-10 px-6 rounded-md text-sm font-medium transition-colors",
                            filters.view === "unread"
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/80 text-primary-foreground hover:bg-primary",
                        )}
                    >
                        未確認のみ
                    </button>

                    <div className="ml-auto flex items-center gap-3">
                        <button
                            onClick={setAllTime}
                            className={cn(
                                "h-10 px-6 rounded-md text-sm font-medium transition-colors",
                                !filters.from && !filters.to
                                    ? "bg-muted text-foreground"
                                    : "bg-background border border-border text-muted-foreground hover:bg-muted/50",
                            )}
                        >
                            全期間
                        </button>
                        <Label className="font-bold">表示期間</Label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                applyFilters({ from: e.target.value || null });
                            }}
                            className="w-40 h-10"
                        />
                        <span className="text-sm">から</span>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                applyFilters({ to: e.target.value || null });
                            }}
                            className="w-40 h-10"
                        />
                    </div>
                </div>

                <div className="rounded-md overflow-x-auto border border-border">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-primary text-primary-foreground">
                            <tr>
                                <th className="w-24 px-3 py-2 text-left align-bottom">
                                    <div className="text-[10px] font-normal mb-1">
                                        ページ内選択
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={allCheckedInView}
                                        onChange={toggleAll}
                                        disabled={friends.data.length === 0}
                                        className="size-4 rounded border-white/40 accent-white"
                                        aria-label="すべて選択"
                                    />
                                </th>
                                <th className="px-3 py-3 text-left font-semibold w-28">
                                    ステータス
                                </th>
                                <th className="px-3 py-3 text-left font-semibold w-40">
                                    受信日時
                                </th>
                                <th className="px-3 py-3 text-left font-semibold w-44">
                                    LINE 名
                                </th>
                                <th className="px-3 py-3 text-left font-semibold">
                                    メッセージ内容
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {friends.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center text-sm text-foreground py-8"
                                    >
                                        該当するメッセージがありません。
                                    </td>
                                </tr>
                            ) : (
                                friends.data.map((r) => {
                                    const isUnread = r.unread_count > 0;
                                    const checked = selectedIds.has(r.id);
                                    return (
                                        <tr
                                            key={r.id}
                                            className={cn(
                                                "border-t border-border hover:bg-muted/30",
                                                checked && "bg-primary/5",
                                            )}
                                        >
                                            <td className="px-3 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleRow(r.id)
                                                    }
                                                    className="size-4 rounded border-border accent-primary"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center h-6 px-2 rounded-full text-[11px] font-medium",
                                                        isUnread
                                                            ? "bg-destructive/10 text-destructive"
                                                            : "bg-muted text-muted-foreground",
                                                    )}
                                                >
                                                    {isUnread
                                                        ? "未確認"
                                                        : "確認済"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                {formatReceivedAt(
                                                    r.last_message_at,
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <a
                                                    href={`/chat?friend=${r.id}`}
                                                    className="text-sm font-medium truncate text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {friendDisplayName(r)}
                                                </a>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-xs text-foreground line-clamp-1 max-w-xl">
                                                    {r.last_message_preview ??
                                                        "—"}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-end justify-between gap-3">
                    <div>
                        <div className="text-sm font-bold text-foreground">
                            ステータス 一括変更
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    name="bulk-status"
                                    checked={bulkStatus === "read"}
                                    onChange={() => setBulkStatus("read")}
                                    className="accent-primary"
                                />
                                確認済
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    name="bulk-status"
                                    checked={bulkStatus === "unread"}
                                    onChange={() => setBulkStatus("unread")}
                                    className="accent-primary"
                                />
                                未確認
                            </label>
                            <Button
                                size="sm"
                                disabled={selectedIds.size === 0}
                                onClick={onBulkUpdate}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-5"
                            >
                                変更 ({selectedIds.size})
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="h-9 px-3"
                            disabled={!friends.prev_page_url}
                            onClick={() =>
                                friends.prev_page_url &&
                                router.get(friends.prev_page_url, {}, {
                                    preserveScroll: true,
                                    preserveState: true,
                                })
                            }
                        >
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className="size-3"
                            />
                            前へ
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {friends.current_page} / {friends.last_page}
                        </span>
                        <Button
                            variant="outline"
                            className="h-9 px-3"
                            disabled={!friends.next_page_url}
                            onClick={() =>
                                friends.next_page_url &&
                                router.get(friends.next_page_url, {}, {
                                    preserveScroll: true,
                                    preserveState: true,
                                })
                            }
                        >
                            次へ
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className="size-3"
                            />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

ChatManagement.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
