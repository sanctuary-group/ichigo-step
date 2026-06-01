import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faUsers,
    faKey,
    faUserGroup,
    faPaperPlane,
    faBan,
    faPlay,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanBadge, StatusBadge } from "@/components/admin/badges";
import { AdminLayout } from "@/Layouts/AdminLayout";

type Agency = {
    id: number;
    name: string;
    slug: string | null;
    plan: string;
    status: string;
    created_at: string;
};

type Member = { id: number; name: string; email: string; role: string };
type Channel = {
    id: number;
    name: string;
    basic_id: string | null;
    is_active: boolean;
};

type PageProps = {
    agency: Agency;
    stats: {
        members: number;
        channels: number;
        friends_total: number;
        friends_active: number;
        monthly_messages: number;
    };
    members: Member[];
    channels: Channel[];
};

function ymd(iso: string) {
    return iso.slice(0, 10).replace(/-/g, "/");
}

export default function AgencyShow({
    agency,
    stats,
    members,
    channels,
}: PageProps) {
    const active = agency.status === "active";

    const toggleStatus = () => {
        const msg = active
            ? `「${agency.name}」を停止しますか？利用者はログインできなくなります。`
            : `「${agency.name}」を再開しますか？`;
        if (!confirm(msg)) return;
        router.patch(
            `/admin/agencies/${agency.id}/status`,
            { is_active: !active },
            { preserveScroll: true },
        );
    };

    const changePlan = (plan: string) => {
        if (plan === agency.plan) return;
        router.patch(
            `/admin/agencies/${agency.id}/plan`,
            { plan },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={agency.name} />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/agencies"
                        className="grid place-items-center size-9 rounded-md hover:bg-muted text-muted-foreground"
                        aria-label="一覧に戻る"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="size-4" />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">代理店詳細</h1>
                </div>

                {/* ヘッダーカード */}
                <Card>
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg font-bold truncate">
                                    {agency.name}
                                </span>
                                <StatusBadge status={agency.status} />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {agency.slug ? `@${agency.slug}・` : ""}
                                {ymd(agency.created_at)} 契約
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <select
                                value={agency.plan}
                                onChange={(e) => changePlan(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="free">Free</option>
                                <option value="standard">Standard</option>
                                <option value="pro">Pro</option>
                            </select>
                            <Button
                                variant={active ? "outline" : "default"}
                                onClick={toggleStatus}
                                className={
                                    active
                                        ? "border-destructive/50 text-destructive hover:bg-destructive/10"
                                        : ""
                                }
                            >
                                <FontAwesomeIcon
                                    icon={active ? faBan : faPlay}
                                    className="size-3.5"
                                />
                                {active ? "停止" : "再開"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 統計 */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Stat icon={faUsers} label="メンバー" value={stats.members} />
                    <Stat icon={faKey} label="チャネル" value={stats.channels} />
                    <Stat
                        icon={faUserGroup}
                        label="友だち総数"
                        value={stats.friends_total}
                    />
                    <Stat
                        icon={faUserGroup}
                        label="有効友だち"
                        value={stats.friends_active}
                    />
                    <Stat
                        icon={faPaperPlane}
                        label="配信(30日)"
                        value={stats.monthly_messages}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>メンバー ({members.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {members.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    メンバーがいません。
                                </p>
                            ) : (
                                members.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {m.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground truncate">
                                                {m.email}
                                            </div>
                                        </div>
                                        <span className="text-[11px] px-2 h-5 inline-flex items-center rounded-full bg-muted text-muted-foreground font-medium">
                                            {m.role}
                                        </span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                LINEチャネル ({channels.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {channels.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    チャネル未登録です。
                                </p>
                            ) : (
                                channels.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {c.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground truncate">
                                                {c.basic_id ?? "—"}
                                            </div>
                                        </div>
                                        <StatusBadge
                                            status={
                                                c.is_active
                                                    ? "active"
                                                    : "suspended"
                                            }
                                        />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AgencyShow.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

function Stat({
    icon,
    label,
    value,
}: {
    icon: IconDefinition;
    label: string;
    value: number;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                    <FontAwesomeIcon icon={icon} className="size-3" />
                    {label}
                </div>
                <div className="text-xl font-bold tabular-nums mt-1">
                    {value.toLocaleString()}
                </div>
            </CardContent>
        </Card>
    );
}
