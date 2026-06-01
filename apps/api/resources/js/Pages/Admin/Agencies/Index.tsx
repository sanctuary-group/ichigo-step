import { Head, Link, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlanBadge, StatusBadge } from "@/components/admin/badges";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { cn } from "@/lib/utils";

type Agency = {
    id: number;
    name: string;
    plan: string;
    status: string;
    member_count: number;
    channel_count: number;
    friend_count: number;
    monthly_message_count: number;
    created_at: string;
};

type PageProps = {
    agencies: Agency[];
    filters: { q: string; plan: string; status: string };
    planCounts: { all: number; free: number; standard: number; pro: number };
};

function ymd(iso: string) {
    return iso.slice(0, 10).replace(/-/g, "/");
}

export default function AgenciesIndex({
    agencies,
    filters,
    planCounts,
}: PageProps) {
    const [query, setQuery] = useState(filters.q ?? "");

    const apply = (next: Partial<PageProps["filters"]>) => {
        const merged = { ...filters, q: query, ...next };
        router.get(
            "/admin/agencies",
            {
                q: merged.q || undefined,
                plan: merged.plan !== "all" ? merged.plan : undefined,
                status: merged.status !== "all" ? merged.status : undefined,
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
            <Head title="代理店一覧" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        代理店一覧
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        ichigo-step を契約している代理店（利用者）
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <FilterChip
                            active={filters.plan === "all"}
                            onClick={() => apply({ plan: "all" })}
                        >
                            すべて ({planCounts.all})
                        </FilterChip>
                        <FilterChip
                            active={filters.plan === "free"}
                            onClick={() => apply({ plan: "free" })}
                        >
                            Free ({planCounts.free})
                        </FilterChip>
                        <FilterChip
                            active={filters.plan === "standard"}
                            onClick={() => apply({ plan: "standard" })}
                        >
                            Standard ({planCounts.standard})
                        </FilterChip>
                        <FilterChip
                            active={filters.plan === "pro"}
                            onClick={() => apply({ plan: "pro" })}
                        >
                            Pro ({planCounts.pro})
                        </FilterChip>
                        <span className="w-px h-5 bg-border mx-1" />
                        <FilterChip
                            active={filters.status === "active"}
                            onClick={() =>
                                apply({
                                    status:
                                        filters.status === "active"
                                            ? "all"
                                            : "active",
                                })
                            }
                        >
                            稼働中のみ
                        </FilterChip>
                        <FilterChip
                            active={filters.status === "suspended"}
                            onClick={() =>
                                apply({
                                    status:
                                        filters.status === "suspended"
                                            ? "all"
                                            : "suspended",
                                })
                            }
                        >
                            停止中のみ
                        </FilterChip>
                    </div>
                    <form onSubmit={search} className="relative w-64 max-w-full">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <Input
                            placeholder="代理店名で検索"
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
                                    代理店名
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-28">
                                    プラン
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-20">
                                    メンバー
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-24">
                                    チャネル
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-24">
                                    友だち
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-28">
                                    配信(30日)
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-28">
                                    状態
                                </th>
                                <th className="px-4 py-3 w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {agencies.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        該当する代理店がありません。
                                    </td>
                                </tr>
                            ) : (
                                agencies.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b border-border hover:bg-muted/30 cursor-pointer"
                                        onClick={() =>
                                            router.get(
                                                `/admin/agencies/${a.id}`,
                                            )
                                        }
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {a.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {ymd(a.created_at)} 契約
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <PlanBadge plan={a.plan} />
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {a.member_count}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {a.channel_count}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {a.friend_count.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {a.monthly_message_count.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={a.status} />
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
            </div>
        </>
    );
}

AgenciesIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

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
