import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faEnvelope,
  faPhone,
  faBuilding,
  faYenSign,
  faPaperPlane,
  faSignal,
  faUsers,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AgencyStatusBadge, PlanBadge } from "@/components/badges";
import {
  getAgencyById,
  getPlanByTier,
  MOCK_AGENCIES,
} from "@/mocks/admin-data";
import { formatDate, formatDateTime } from "@/lib/time";

export function generateStaticParams() {
  return MOCK_AGENCIES.map((a) => ({ id: a.id }));
}

export default async function AgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agency = getAgencyById(id);
  if (!agency) notFound();

  const plan = getPlanByTier(agency.plan);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/agencies"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
          </Link>
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="text-base">
                {agency.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {agency.name}
                </h1>
                <PlanBadge plan={agency.plan} />
                <AgencyStatusBadge status={agency.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {agency.ownerEmail} · 契約日 {formatDate(agency.contractedAt)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agency.status === "suspended" ? (
            <Button variant="outline" size="sm" disabled>
              <FontAwesomeIcon icon={faPlay} className="size-3.5" />
              再開
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled
            >
              <FontAwesomeIcon icon={faPause} className="size-3.5" />
              停止
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiSmall
          icon={faUsers}
          label="メンバー"
          value={agency.memberCount.toString()}
        />
        <KpiSmall
          icon={faSignal}
          label="LINE channel"
          value={agency.channelCount.toString()}
        />
        <KpiSmall
          icon={faPaperPlane}
          label="月間配信"
          value={agency.monthlyMessageCount.toLocaleString()}
        />
        <KpiSmall
          icon={faYenSign}
          label="MRR"
          value={`¥${agency.mrrJpy.toLocaleString()}`}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="members">メンバー</TabsTrigger>
          <TabsTrigger value="channels">LINE channel</TabsTrigger>
          <TabsTrigger value="broadcasts">配信実績</TabsTrigger>
          <TabsTrigger value="billing">課金履歴</TabsTrigger>
          <TabsTrigger value="logs">操作ログ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>担当者連絡先</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agency.contactName && (
                <div className="text-sm font-medium">{agency.contactName}</div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FontAwesomeIcon icon={faEnvelope} className="size-3.5" />
                <a
                  href={`mailto:${agency.ownerEmail}`}
                  className="text-primary hover:underline"
                >
                  {agency.ownerEmail}
                </a>
              </div>
              {agency.contactPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FontAwesomeIcon icon={faPhone} className="size-3.5" />
                  {agency.contactPhone}
                </div>
              )}
              {agency.note && (
                <div className="text-xs text-muted-foreground italic mt-2">
                  {agency.note}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>契約情報</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="プラン" value={plan?.name ?? agency.plan} />
              <InfoRow
                label="月額料金"
                value={`¥${(plan?.priceJpy ?? 0).toLocaleString()}`}
              />
              <InfoRow label="契約開始" value={formatDate(agency.contractedAt)} />
              <InfoRow
                label="最終アクティブ"
                value={formatDateTime(agency.lastActiveAt)}
              />
              <InfoRow label="スラッグ" value={agency.slug} mono />
              <InfoRow label="代理店 ID" value={agency.id} mono />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <FontAwesomeIcon
                icon={faUsers}
                className="size-6 mb-2 text-muted-foreground/60"
              />
              <div>メンバー一覧（モック予定）</div>
              <div className="text-xs mt-1">
                {agency.memberCount} 名が登録されています
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <FontAwesomeIcon
                icon={faSignal}
                className="size-6 mb-2 text-muted-foreground/60"
              />
              <div>LINE channel 一覧（モック予定）</div>
              <div className="text-xs mt-1">
                {agency.channelCount} 個の LINE 公式アカウントが運用中
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="size-6 mb-2 text-muted-foreground/60"
              />
              <div>配信実績グラフ（モック予定）</div>
              <div className="text-xs mt-1">
                月間 {agency.monthlyMessageCount.toLocaleString()} 通の配信
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <FontAwesomeIcon
                icon={faYenSign}
                className="size-6 mb-2 text-muted-foreground/60"
              />
              <div>課金履歴・請求書（モック予定）</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <FontAwesomeIcon
                icon={faBuilding}
                className="size-6 mb-2 text-muted-foreground/60"
              />
              <div>操作ログ（モック予定）</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiSmall({
  icon,
  label,
  value,
}: {
  icon: typeof faUsers;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="grid place-items-center size-9 rounded-xl bg-primary/10 text-primary shrink-0">
          <FontAwesomeIcon icon={icon} className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground">{label}</div>
          <div className="text-lg font-bold tabular-nums truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground tracking-wider uppercase">
        {label}
      </div>
      <div className={mono ? "text-xs font-mono mt-0.5" : "text-sm mt-0.5"}>
        {value}
      </div>
    </div>
  );
}
