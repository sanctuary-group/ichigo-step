import { Head, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowTrendUp,
    faUserPlus,
    faUserSlash,
    faKey,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniLineChart, type Series } from "@/components/dashboard/mini-chart";
import { RiskBadge } from "@/components/ban-detection/risk-badge";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { useAdminBase } from "@/lib/admin";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/ban-detection";

type ChannelRow = {
    id: number;
    name: string;
    basic_id: string | null;
    organization_id: number;
    agency_name: string | null;
    is_active: boolean;
    risk_level: RiskLevel;
    adds: number;
    blocks: number;
    net: number;
    active_now: number;
    messages: number;
    growth_rate: number | null;
};

type PageProps = {
    days: number;
    kpis: { net: number; adds: number; blocks: number; channels: number };
    channels: ChannelRow[];
    trend: Series[];
};

const PERIODS = [7, 30, 90];

export default function ChannelAnalytics({
    days,
    kpis,
    channels,
    trend,
}: PageProps) {
    const base = useAdminBase();

    const setDays = (d: number) => {
        router.get(
            `${base}/channels/analytics`,
            { days: d !== 30 ? d : undefined },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="チャネル分析" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            チャネル分析
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            どの LINE チャネルが伸びているか（純増 = 友だち追加 − ブロック）
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {PERIODS.map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDays(d)}
                                className={cn(
                                    "px-3 h-9 rounded-md text-sm font-medium transition-colors",
                                    days === d
                                        ? "bg-primary/15 text-primary"
                                        : "text-muted-foreground hover:bg-muted",
                                )}
                            >
                                {d}日
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Kpi
                        icon={faArrowTrendUp}
                        label={`純増（${days}日）`}
                        value={kpis.net}
                        signed
                    />
                    <Kpi
                        icon={faUserPlus}
                        label="新規追加"
                        value={kpis.adds}
                    />
                    <Kpi
                        icon={faUserSlash}
                        label="ブロック"
                        value={kpis.blocks}
                    />
                    <Kpi
                        icon={faKey}
                        label="対象チャネル"
                        value={kpis.channels}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            新規追加の推移（純増 上位5チャネル・直近{days}日）
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {trend.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-8 text-center">
                                データがありません。
                            </p>
                        ) : (
                            <MiniLineChart series={trend} />
                        )}
                    </CardContent>
                </Card>

                <Card className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold w-12">
                                    #
                                </th>
                                <th className="px-4 py-3 text-left font-bold">
                                    チャネル
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-20">
                                    新規
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-20">
                                    ブロック
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-24">
                                    純増
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-24">
                                    成長率
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-28">
                                    有効友だち
                                </th>
                                <th className="px-4 py-3 text-right font-bold w-24">
                                    配信数
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-24">
                                    状態
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {channels.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        チャネルが登録されていません。
                                    </td>
                                </tr>
                            ) : (
                                channels.map((c, i) => (
                                    <tr
                                        key={c.id}
                                        className="border-b border-border hover:bg-muted/30 cursor-pointer"
                                        onClick={() =>
                                            router.get(
                                                `${base}/agencies/${c.organization_id}`,
                                            )
                                        }
                                    >
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium truncate">
                                                {c.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground truncate">
                                                {c.agency_name ?? "—"}
                                                {c.basic_id
                                                    ? ` ・ ${c.basic_id}`
                                                    : ""}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {c.adds.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                            {c.blocks.toLocaleString()}
                                        </td>
                                        <td
                                            className={cn(
                                                "px-4 py-3 text-right tabular-nums font-bold",
                                                c.net > 0
                                                    ? "text-emerald-500"
                                                    : c.net < 0
                                                      ? "text-destructive"
                                                      : "text-muted-foreground",
                                            )}
                                        >
                                            {c.net > 0 ? "+" : ""}
                                            {c.net.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                            {c.growth_rate === null
                                                ? "—"
                                                : `${c.growth_rate > 0 ? "+" : ""}${c.growth_rate}%`}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {c.active_now.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                            {c.messages.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {!c.is_active && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                                                        停止
                                                    </span>
                                                )}
                                                {c.risk_level !== "normal" && (
                                                    <RiskBadge
                                                        risk={c.risk_level}
                                                    />
                                                )}
                                                {c.is_active &&
                                                    c.risk_level ===
                                                        "normal" && (
                                                        <span className="text-muted-foreground text-xs">
                                                            —
                                                        </span>
                                                    )}
                                            </div>
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

ChannelAnalytics.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

function Kpi({
    icon,
    label,
    value,
    signed,
}: {
    icon: IconDefinition;
    label: string;
    value: number;
    signed?: boolean;
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
                        {signed && value > 0 ? "+" : ""}
                        {value.toLocaleString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
