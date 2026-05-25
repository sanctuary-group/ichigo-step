"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { AgencyStatusBadge, PlanBadge } from "@/components/badges";
import {
  MOCK_AGENCIES,
  type AgencyStatus,
  type PlanTier,
} from "@/mocks/admin-data";
import { formatRelativeShort } from "@/lib/time";

export default function AgenciesPage() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | PlanTier>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AgencyStatus>("all");

  const filtered = useMemo(() => {
    return MOCK_AGENCIES.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (planFilter !== "all" && a.plan !== planFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !a.name.toLowerCase().includes(q) &&
          !(a.contactName?.toLowerCase().includes(q) ?? false) &&
          !a.ownerEmail.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [query, planFilter, statusFilter]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">代理店一覧</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ichigo-step を契約して LINE 公式アカウントを運用する利用者の管理（全 {MOCK_AGENCIES.length} 社）
          </p>
        </div>
        <Button>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          代理店を追加
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="代理店名・担当者・メールで検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select
            value={planFilter}
            onValueChange={(v) => v && setPlanFilter(v as "all" | PlanTier)}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全プラン</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              v && setStatusFilter(v as "all" | AgencyStatus)
            }
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全状態</SelectItem>
              <SelectItem value="active">有効</SelectItem>
              <SelectItem value="trial">トライアル</SelectItem>
              <SelectItem value="suspended">停止中</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="該当する代理店がいません"
            description="検索条件を変えてみてください"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">代理店</TableHead>
                <TableHead>プラン</TableHead>
                <TableHead className="text-right">メンバー</TableHead>
                <TableHead className="text-right">channel</TableHead>
                <TableHead className="text-right">月間配信</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead>最終アクティブ</TableHead>
                <TableHead className="w-20">状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/agencies/${a.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {a.name}
                    </Link>
                    <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                      {a.ownerEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={a.plan} />
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {a.memberCount}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {a.channelCount}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {a.monthlyMessageCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    ¥{a.mrrJpy.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatRelativeShort(a.lastActiveAt)}
                  </TableCell>
                  <TableCell>
                    <AgencyStatusBadge status={a.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
