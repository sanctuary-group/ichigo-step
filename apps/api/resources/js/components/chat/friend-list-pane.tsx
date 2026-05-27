import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faSliders,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FriendListItem } from "@/components/chat/friend-list-item";
import { EmptyState } from "@/components/empty-state";
import type { Friend } from "@/types/chat";

const FILTER_LABELS: Record<string, string> = {
    all: "全ての友だち（非表示除く）",
    unread: "未読のみ",
    following: "フォロー中のみ",
};

type Filter = "all" | "unread" | "following";

export function FriendListPane({
    friends,
    selectedId,
    onSelect,
    mobileVisible = true,
}: {
    friends: Friend[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    mobileVisible?: boolean;
}) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");

    const visibleFriends = useMemo<Friend[]>(() => {
        let list = friends.filter((f) => !f.is_hidden);
        if (filter === "unread") list = list.filter((f) => f.unread_count > 0);
        if (filter === "following")
            list = list.filter((f) => f.is_following);
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter((f) =>
                (f.display_name ?? "").toLowerCase().includes(q),
            );
        }
        return list;
    }, [friends, query, filter]);

    return (
        <div
            className={`${mobileVisible ? "flex" : "hidden"} lg:flex w-full lg:w-80 shrink-0 flex-col border-r border-border bg-background`}
        >
            <div className="px-3 pt-3 pb-2 space-y-2">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-between h-9 rounded-full"
                        onClick={() => {
                            setFilter(
                                filter === "all"
                                    ? "unread"
                                    : filter === "unread"
                                        ? "following"
                                        : "all",
                            );
                        }}
                    >
                        <span className="truncate text-xs">
                            {FILTER_LABELS[filter]}
                        </span>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className="size-3 text-muted-foreground"
                        />
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full size-9 shrink-0 p-0"
                        aria-label="絞り込み"
                    >
                        <FontAwesomeIcon icon={faSliders} className="size-3.5" />
                    </Button>
                </div>
                <div className="relative">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                        placeholder="LINE名"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9 h-9 rounded-full bg-muted/40 border-transparent"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {visibleFriends.length === 0 ? (
                    <EmptyState
                        title="該当する友だちがいません"
                        description="検索条件やフィルタを変えてみてください"
                    />
                ) : (
                    visibleFriends.map((f) => (
                        <FriendListItem
                            key={f.id}
                            friend={f}
                            active={f.id === selectedId}
                            onClick={() => onSelect(f.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
