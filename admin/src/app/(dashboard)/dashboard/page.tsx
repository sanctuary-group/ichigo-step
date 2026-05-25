import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYenSign,
  faBuilding,
  faSignal,
  faBolt,
  faPaperPlane,
  faArrowRight,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { MiniBarChart, MiniLineChart } from "@/components/mini-chart";
import {
  AgencyStatusBadge,
  PlanBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/badges";
import {
  MOCK_AGENCIES,
  MOCK_TICKETS,
  type Agency,
} from "@/mocks/admin-data";
import { LAST_30_DAYS, PLATFORM_KPIS } from "@/mocks/admin-timeseries";
import { formatDate, formatRelativeShort } from "@/lib/time";

const KPI_ICONS = [faYenSign, faBuilding, faBolt, faSignal, faPaperPlane];

export default function DashboardPage() {
  const recentAgencies: Agency[] = [...MOCK_AGENCIES]
    .sort((a, b) => b.contractedAt.localeCompare(a.contractedAt))
    .slice(0, 4);

  const openTickets = MOCK_TICKETS.filter((t) => t.status !== "resolved").slice(
    0,
    4
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground mt-1">
          プラットフォーム全体の直近 30 日サマリ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PLATFORM_KPIS.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            diff={kpi.diff}
            icon={KPI_ICONS[i]}
            isCurrency={kpi.isCurrency}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>MRR 推移（直近30日）</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniLineChart
              series={[
                {
                  label: "MRR (JPY)",
                  color: "oklch(0.78 0.20 152)",
                  data: LAST_30_DAYS.map((d) => ({
                    date: d.date,
                    value: d.mrrJpy,
                  })),
                },
              ]}
              yFormat="currency-man"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新規代理店（直近30日）</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              color="oklch(0.78 0.20 152)"
              data={LAST_30_DAYS.map((d) => ({
                date: d.date,
                value: d.newAgencies,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全代理店の配信総数（直近30日）</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniBarChart
            color="oklch(0.78 0.13 220)"
            data={LAST_30_DAYS.map((d) => ({
              date: d.date,
              value: d.totalMessages,
            }))}
            yFormat="compact-man"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近の新規代理店</CardTitle>
            <Link
              href="/agencies"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              すべて見る
              <FontAwesomeIcon icon={faArrowRight} className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAgencies.map((a) => (
              <Link
                key={a.id}
                href={`/agencies/${a.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/40"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    契約日: {formatDate(a.contractedAt)} / メンバー {a.memberCount} 名
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PlanBadge plan={a.plan} />
                  <AgencyStatusBadge status={a.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              未対応サポート
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="size-3.5 text-destructive"
              />
            </CardTitle>
            <Link
              href="/support"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              すべて見る
              <FontAwesomeIcon icon={faArrowRight} className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {openTickets.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/40"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono">{t.number}</span>
                    <span>·</span>
                    <span className="truncate">{t.agencyName}</span>
                    <span>·</span>
                    <TicketPriorityBadge priority={t.priority} />
                  </div>
                  <div className="text-sm font-medium truncate mt-0.5">
                    {t.subject}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TicketStatusBadge status={t.status} />
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeShort(t.lastMessageAt)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
