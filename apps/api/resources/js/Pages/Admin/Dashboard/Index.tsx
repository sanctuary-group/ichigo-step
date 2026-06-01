import { Head, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBuilding,
    faCircleCheck,
    faKey,
    faUsers,
    faPaperPlane,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniBarChart } from "@/components/dashboard/mini-chart";
import { PlanBadge, StatusBadge } from "@/components/admin/badges";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { useAdminBase } from "@/lib/admin";

type Point = { date: string; value: number };

type RecentAgency = {
    id: number;
    name: string;
    plan: string;
    status: string;
    created_at: string;
};

type PageProps = {
    kpis: {
        total_agencies: number;
        active_agencies: number;
        total_channels: number;
        total_friends: number;
        monthly_messages: number;
    };
    newAgencySeries: Point[];
    recentAgencies: RecentAgency[];
};

function ymd(iso: string) {
    return iso.slice(0, 10).replace(/-/g, "/");
}

export default function AdminDashboard({
    kpis,
    newAgencySeries,
    recentAgencies,
}: PageProps) {
    const base = useAdminBase();
    return (
        <>
            <Head title="運営ダッシュボード" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        ダッシュボード
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        プラットフォーム全体のサマリ
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Kpi
                        icon={faBuilding}
                        label="代理店数"
                        value={kpis.total_agencies}
                    />
                    <Kpi
                        icon={faCircleCheck}
                        label="稼働中"
                        value={kpis.active_agencies}
                    />
                    <Kpi
                        icon={faKey}
                        label="LINEチャネル"
                        value={kpis.total_channels}
                    />
                    <Kpi
                        icon={faUsers}
                        label="総友だち"
                        value={kpis.total_friends}
                    />
                    <Kpi
                        icon={faPaperPlane}
                        label="配信(30日)"
                        value={kpis.monthly_messages}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>新規代理店（直近30日）</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MiniBarChart
                            color="oklch(0.72 0.17 152)"
                            data={newAgencySeries}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>最近の新規代理店</CardTitle>
                        <Link
                            href={`${base}/agencies`}
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                            すべて見る
                            <FontAwesomeIcon
                                icon={faArrowRight}
                                className="size-3"
                            />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentAgencies.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                代理店がまだありません。
                            </p>
                        ) : (
                            recentAgencies.map((a) => (
                                <Link
                                    key={a.id}
                                    href={`${base}/agencies/${a.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {a.name}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {ymd(a.created_at)} 契約
                                        </div>
                                    </div>
                                    <PlanBadge plan={a.plan} />
                                    <StatusBadge status={a.status} />
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

function Kpi({
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
            <CardContent className="p-4 flex items-center gap-3">
                <div className="grid place-items-center size-9 rounded-xl bg-primary/15 text-primary shrink-0">
                    <FontAwesomeIcon icon={icon} className="size-4" />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">
                        {label}
                    </div>
                    <div className="text-lg font-bold tabular-nums truncate">
                        {value.toLocaleString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
