import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faSliders,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FriendListItem } from "@/components/chat/friend-list-item";
import { EmptyState } from "@/components/empty-state";
import type { Friend } from "@/types/chat";

type Filter =
    | "all"
    | "unread"
    | "read"
    | "hidden"
    | "scheduled"
    | "group";

const FILTER_OPTIONS: { value: Filter; label: string; disabled?: boolean }[] = [
    { value: "all", label: "全ての友だち（非表示除く）" },
    { value: "unread", label: "未確認" },
    { value: "read", label: "確認済み" },
    { value: "hidden", label: "非表示中" },
    { value: "scheduled", label: "送信予約中の友だち", disabled: true },
    { value: "group", label: "グループ", disabled: true },
];

const FILTER_LABELS: Record<Filter, string> = Object.fromEntries(
    FILTER_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Filter, string>;

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
        let list: Friend[];
        switch (filter) {
            case "hidden":
                list = friends.filter((f) => f.is_hidden);
                break;
            case "unread":
                list = friends.filter(
                    (f) => !f.is_hidden && f.unread_count > 0,
                );
                break;
            case "read":
                list = friends.filter(
                    (f) => !f.is_hidden && f.unread_count === 0,
                );
                break;
            case "scheduled":
            case "group":
                list = [];
                break;
            default:
                list = friends.filter((f) => !f.is_hidden);
        }
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter((f) => {
                const a = (f.display_name ?? "").toLowerCase();
                const b = (f.system_display_name ?? "").toLowerCase();
                return a.includes(q) || b.includes(q);
            });
        }
        return list;
    }, [friends, query, filter]);

    return (
        <div
            className={`${mobileVisible ? "flex" : "hidden"} lg:flex w-full lg:w-80 shrink-0 flex-col border-r border-border bg-background`}
        >
            <div className="px-3 pt-3 pb-2 space-y-2">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 justify-between h-9 rounded-full"
                                />
                            }
                        >
                            <span className="truncate text-xs">
                                {FILTER_LABELS[filter]}
                            </span>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className="size-3 text-muted-foreground"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-60"
                        >
                            {FILTER_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    disabled={opt.disabled}
                                    onClick={() => setFilter(opt.value)}
                                    className={
                                        filter === opt.value
                                            ? "bg-muted font-medium"
                                            : ""
                                    }
                                >
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        placeholder="LINE名 / システム表示名"
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
