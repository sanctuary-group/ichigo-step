import { Head, Link, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faMagnifyingGlass,
    faUser,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { useAdminBase } from "@/lib/admin";
import { cn } from "@/lib/utils";

type TagLite = { id: number; name: string; color: string };

type FriendRow = {
    id: number;
    display_name: string | null;
    system_display_name: string | null;
    picture_url: string | null;
    line_user_id: string;
    is_following: boolean;
    is_hidden: boolean;
    followed_at: string | null;
    last_message_at: string | null;
    channel_name: string | null;
    tags: TagLite[];
};

type Paginated<T> = {
    data: T[];
    prev_page_url: string | null;
    next_page_url: string | null;
    from: number | null;
    to: number | null;
    total: number;
};

type PageProps = {
    agency: { id: number; name: string };
    friends: Paginated<FriendRow>;
    filters: { q: string; mode: string };
    stats: { total: number; active: number; blocked: number };
};

function ymd(iso: string | null) {
    return iso ? iso.slice(0, 10).replace(/-/g, "/") : "—";
}

function displayName(f: FriendRow) {
    return (
        f.system_display_name?.trim() ||
        f.display_name?.trim() ||
        "(名前未取得)"
    );
}

export default function AgencyFriendsIndex({
    agency,
    friends,
    filters,
    stats,
}: PageProps) {
    const base = useAdminBase();
    const [query, setQuery] = useState(filters.q ?? "");

    const apply = (next: Partial<PageProps["filters"]>) => {
        const merged = { ...filters, q: query, ...next };
        router.get(
            `${base}/agencies/${agency.id}/friends`,
            {
                q: merged.q || undefined,
                mode: merged.mode !== "active" ? merged.mode : undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const search = (e: FormEvent) => {
        e.preventDefault();
        apply({});
    };

    return (
        <>
            <Head title={`${agency.name} の友だち`} />
            <div className="p-4 sm:p-6 lg:p-8 space-y-5">
                <div className="flex items-center gap-3">
                    <Link
                        href={`${base}/agencies/${agency.id}`}
                        className="grid place-items-center size-9 rounded-md hover:bg-muted text-muted-foreground"
                        aria-label="代理店詳細に戻る"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="size-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            友だち一覧
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {agency.name}（閲覧専用）
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <FilterChip
                            active={filters.mode === "active"}
                            onClick={() => apply({ mode: "active" })}
                        >
                            アクティブ ({stats.active})
                        </FilterChip>
                        <FilterChip
                            active={filters.mode === "blocked"}
                            onClick={() => apply({ mode: "blocked" })}
                        >
                            ブロック ({stats.blocked})
                        </FilterChip>
                        <FilterChip
                            active={filters.mode === "all"}
                            onClick={() => apply({ mode: "all" })}
                        >
                            すべて ({stats.total})
                        </FilterChip>
                    </div>
                    <form onSubmit={search} className="relative w-64 max-w-full">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <Input
                            placeholder="名前で検索"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </form>
                </div>

                <Card className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold">
                                    友だち
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-40">
                                    チャネル
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-28">
                                    追加日
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-28">
                                    最終MSG
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-24">
                                    状態
                                </th>
                                <th className="px-4 py-3 text-left font-bold">
                                    タグ
                                </th>
                                <th className="px-4 py-3 w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {friends.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        該当する友だちがいません。
                                    </td>
                                </tr>
                            ) : (
                                friends.data.map((f) => (
                                    <tr
                                        key={f.id}
                                        className="border-b border-border hover:bg-muted/30 cursor-pointer"
                                        onClick={() =>
                                            router.get(
                                                `${base}/agencies/${agency.id}/friends/${f.id}`,
                                            )
                                        }
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Avatar friend={f} />
                                                <span className="font-medium truncate">
                                                    {displayName(f)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground truncate">
                                            {f.channel_name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                            {ymd(f.followed_at)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                            {ymd(f.last_message_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StateBadge friend={f} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {f.tags.length === 0 ? (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                ) : (
                                                    f.tags.map((t) => (
                                                        <TagChip
                                                            key={t.id}
                                                            tag={t}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <FontAwesomeIcon
                                                icon={faArrowRight}
                                                className="size-3"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>

                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {friends.total > 0
                            ? `${friends.from}–${friends.to} / ${friends.total} 件`
                            : "0 件"}
                    </span>
                    <div className="flex items-center gap-2">
                        <PagerButton
                            url={friends.prev_page_url}
                            label="前へ"
                        />
                        <PagerButton
                            url={friends.next_page_url}
                            label="次へ"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

AgencyFriendsIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

function Avatar({ friend }: { friend: FriendRow }) {
    return (
        <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full size-7">
            {friend.picture_url ? (
                <img
                    src={friend.picture_url}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="size-full bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faUser} className="size-1/2" />
                </div>
            )}
        </div>
    );
}

function StateBadge({ friend }: { friend: FriendRow }) {
    if (!friend.is_following) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-destructive/15 text-destructive">
                ブロック
            </span>
        );
    }
    if (friend.is_hidden) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground">
                非表示
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary">
            アクティブ
        </span>
    );
}

function TagChip({ tag }: { tag: TagLite }) {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full font-medium border h-5 px-1.5 text-[10px]"
            style={{
                backgroundColor: hexToRgba(tag.color, 0.12),
                borderColor: hexToRgba(tag.color, 0.4),
                color: tag.color,
            }}
        >
            <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: tag.color }}
            />
            {tag.name}
        </span>
    );
}

function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-3 h-8 rounded-md text-xs font-medium transition-colors",
                active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted",
            )}
        >
            {children}
        </button>
    );
}

function PagerButton({ url, label }: { url: string | null; label: string }) {
    return (
        <button
            type="button"
            disabled={!url}
            onClick={() =>
                url &&
                router.get(url, {}, { preserveScroll: true, preserveState: true })
            }
            className={cn(
                "px-3 h-9 rounded-md border border-border text-sm",
                url
                    ? "hover:bg-muted text-foreground"
                    : "opacity-40 cursor-not-allowed text-muted-foreground",
            )}
        >
            {label}
        </button>
    );
}

function hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace("#", "");
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
