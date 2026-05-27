import { Head, Link, router, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faBan,
    faEye,
    faEyeSlash,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FriendAvatar } from "@/components/friend-avatar";
import { TagBadge } from "@/components/tag-badge";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { friendDisplayName } from "@/lib/friend";
import { cn } from "@/lib/utils";
import type { Friend, Tag } from "@/types/chat";

type FriendsPagination = {
    data: Friend[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    mode: string;
    q: string;
    tag: number | null;
};

type PageProps = {
    friends: FriendsPagination;
    filters: Filters;
    tags?: Tag[];
};

const MODE_BUTTONS: { value: string; label: string; icon?: typeof faBan }[] = [
    { value: "active", label: "アクティブ" },
    { value: "hidden", label: "非表示中" },
    { value: "blocked", label: "ブロック済み", icon: faBan },
];

function formatYmd(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

export default function FriendsIndex() {
    const { props } = usePage<PageProps>();
    const { friends, filters } = props;
    const allTags = props.tags ?? [];
    const [query, setQuery] = useState(filters.q ?? "");

    const applyFilters = (next: Partial<Filters>) => {
        router.get(
            "/friends",
            {
                mode: next.mode ?? filters.mode,
                q: next.q ?? filters.q,
                tag: next.tag === undefined ? filters.tag : next.tag,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilters({ q: query });
    };

    const toggleHidden = (friend: Friend) => {
        router.patch(
            `/friends/${friend.id}/hidden`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="友だちリスト" />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-3 border-b border-border">
                    <h1 className="text-lg font-bold tracking-tight">
                        友だちリスト
                    </h1>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-6 py-4 flex-wrap">
                        <form
                            onSubmit={onSearch}
                            className="flex items-center gap-2 flex-1 min-w-0"
                        >
                            <div className="relative w-72 max-w-full">
                                <Input
                                    placeholder="LINE 名 / システム表示名で検索"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="h-10 pr-9"
                                />
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="size-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                />
                            </div>
                            <Button type="submit" className="h-10 px-5">
                                検索
                            </Button>
                            {filters.q && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 px-3"
                                    onClick={() => {
                                        setQuery("");
                                        applyFilters({ q: "" });
                                    }}
                                >
                                    クリア
                                </Button>
                            )}
                        </form>

                        <div className="flex items-center gap-2">
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                value={filters.tag ?? ""}
                                onChange={(e) =>
                                    applyFilters({
                                        tag: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                            >
                                <option value="">タグで絞り込み</option>
                                {allTags.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>

                            {MODE_BUTTONS.map((m) => (
                                <Button
                                    key={m.value}
                                    variant={
                                        filters.mode === m.value
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => applyFilters({ mode: m.value })}
                                    className="h-10"
                                >
                                    {m.icon && (
                                        <FontAwesomeIcon
                                            icon={m.icon}
                                            className="size-3.5"
                                        />
                                    )}
                                    {m.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-muted/40 px-6 py-3 border-y border-border text-sm">
                        <div>
                            合計{" "}
                            <span className="font-bold">{friends.total}</span> 人
                        </div>
                        <div className="text-muted-foreground tabular-nums">
                            {friends.from ?? 0} - {friends.to ?? 0} 人目を表示
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-primary sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-3 text-left text-primary-foreground font-bold w-40">
                                        友だち追加日
                                    </th>
                                    <th className="px-3 py-3 text-left text-primary-foreground font-bold w-40">
                                        最終メッセージ
                                    </th>
                                    <th className="px-3 py-3 text-left text-primary-foreground font-bold">
                                        LINE 表示名
                                    </th>
                                    <th className="px-3 py-3 text-left text-primary-foreground font-bold">
                                        タグ
                                    </th>
                                    <th className="px-3 py-3 text-left text-primary-foreground font-bold w-28">
                                        状態
                                    </th>
                                    <th className="px-3 py-3 text-right text-primary-foreground font-bold w-32">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {friends.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-3 py-12 text-sm text-center text-muted-foreground"
                                        >
                                            該当する友だちはいません
                                        </td>
                                    </tr>
                                ) : (
                                    friends.data.map((f) => (
                                        <tr
                                            key={f.id}
                                            className="border-b border-border hover:bg-muted/30"
                                        >
                                            <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                {formatYmd(f.followed_at)}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                                                {formatYmd(f.last_message_at)}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Link
                                                    href={`/chat?friend=${f.id}`}
                                                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    <FriendAvatar
                                                        friend={f}
                                                        className="size-7"
                                                    />
                                                    <span className="font-medium">
                                                        {friendDisplayName(f)}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {f.tags && f.tags.length > 0 ? (
                                                        f.tags.map((t) => (
                                                            <TagBadge
                                                                key={t.id}
                                                                tag={t}
                                                                size="sm"
                                                            />
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-xs">
                                                {!f.is_following ? (
                                                    <span className="text-destructive">
                                                        ブロック
                                                    </span>
                                                ) : f.is_hidden ? (
                                                    <span className="text-muted-foreground">
                                                        非表示
                                                    </span>
                                                ) : (
                                                    <span className="text-primary">
                                                        アクティブ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    className="size-9 p-0"
                                                    aria-label={
                                                        f.is_hidden
                                                            ? "表示する"
                                                            : "非表示にする"
                                                    }
                                                    onClick={() =>
                                                        toggleHidden(f)
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            f.is_hidden
                                                                ? faEye
                                                                : faEyeSlash
                                                        }
                                                        className="size-3.5"
                                                    />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                            ページ {friends.current_page} / {friends.last_page}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                disabled={!friends.prev_page_url}
                                onClick={() =>
                                    friends.prev_page_url &&
                                    router.get(friends.prev_page_url, {}, {
                                        preserveScroll: true,
                                        preserveState: true,
                                    })
                                }
                                className={cn(
                                    "h-9 px-3",
                                    !friends.prev_page_url && "opacity-50",
                                )}
                            >
                                <FontAwesomeIcon
                                    icon={faChevronLeft}
                                    className="size-3"
                                />
                                前へ
                            </Button>
                            <Button
                                variant="outline"
                                disabled={!friends.next_page_url}
                                onClick={() =>
                                    friends.next_page_url &&
                                    router.get(friends.next_page_url, {}, {
                                        preserveScroll: true,
                                        preserveState: true,
                                    })
                                }
                                className={cn(
                                    "h-9 px-3",
                                    !friends.next_page_url && "opacity-50",
                                )}
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
            </div>
        </>
    );
}

FriendsIndex.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
