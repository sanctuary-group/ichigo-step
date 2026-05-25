"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCircle,
  faCircleHalfStroke,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { MOCK_FRIENDS } from "@/mocks/data";
import { formatRelativeShort } from "@/lib/time";

type ChatStatus = "open" | "in_progress" | "resolved";

const STATUS_MAP: Record<
  ChatStatus,
  { label: string; cls: string; icon: IconDefinition }
> = {
  open: {
    label: "未対応",
    cls: "bg-destructive/10 text-destructive border-0",
    icon: faCircle,
  },
  in_progress: {
    label: "対応中",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0",
    icon: faCircleHalfStroke,
  },
  resolved: {
    label: "完了",
    cls: "bg-primary/10 text-primary border-0",
    icon: faCircleCheck,
  },
};

const ASSIGNEES = ["未割り当て", "Ryu", "Mika", "Aya"] as const;

// 各友だちに対するチャット管理状態（モック）
const CHAT_META: Record<
  string,
  { status: ChatStatus; assignee: (typeof ASSIGNEES)[number] }
> = {
  f_1: { status: "resolved", assignee: "Ryu" },
  f_2: { status: "in_progress", assignee: "Mika" },
  f_3: { status: "in_progress", assignee: "Ryu" },
  f_4: { status: "open", assignee: "未割り当て" },
  f_5: { status: "resolved", assignee: "Aya" },
  f_6: { status: "open", assignee: "未割り当て" },
  f_7: { status: "in_progress", assignee: "Aya" },
  f_8: { status: "resolved", assignee: "Ryu" },
};

export default function ChatManagementPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ChatStatus>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | string>("all");

  const rows = useMemo(() => {
    return MOCK_FRIENDS.map((f) => ({
      friend: f,
      meta: CHAT_META[f.id] ?? { status: "resolved" as ChatStatus, assignee: "未割り当て" },
    }))
      .filter((r) => {
        if (statusFilter !== "all" && r.meta.status !== statusFilter)
          return false;
        if (assigneeFilter !== "all" && r.meta.assignee !== assigneeFilter)
          return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          if (
            !r.friend.displayName.toLowerCase().includes(q) &&
            !(r.friend.lastMessagePreview?.toLowerCase().includes(q) ?? false)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) =>
        (b.friend.lastMessageAt ?? "").localeCompare(a.friend.lastMessageAt ?? "")
      );
  }, [query, statusFilter, assigneeFilter]);

  const stats = useMemo(() => {
    return {
      open: Object.values(CHAT_META).filter((m) => m.status === "open").length,
      inProgress: Object.values(CHAT_META).filter(
        (m) => m.status === "in_progress"
      ).length,
      resolved: Object.values(CHAT_META).filter((m) => m.status === "resolved")
        .length,
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">チャット管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            全 LINE channel 横断のチャット対応状況を一元管理（モック）
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="未対応"
          value={stats.open}
          icon={faCircle}
          accent="text-destructive"
        />
        <StatCard
          label="対応中"
          value={stats.inProgress}
          icon={faCircleHalfStroke}
          accent="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="完了"
          value={stats.resolved}
          icon={faCircleCheck}
          accent="text-primary"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="友だち名・メッセージで検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              v && setStatusFilter(v as "all" | ChatStatus)
            }
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全状態</SelectItem>
              <SelectItem value="open">未対応</SelectItem>
              <SelectItem value="in_progress">対応中</SelectItem>
              <SelectItem value="resolved">完了</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={assigneeFilter}
            onValueChange={(v) => v && setAssigneeFilter(v)}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全担当者</SelectItem>
              {ASSIGNEES.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">友だち</TableHead>
              <TableHead>最終メッセージ</TableHead>
              <TableHead className="w-24">状態</TableHead>
              <TableHead className="w-28">担当者</TableHead>
              <TableHead className="w-24">最終更新</TableHead>
              <TableHead className="w-20 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-sm text-muted-foreground py-12"
                >
                  該当するチャットがありません
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ friend, meta }) => {
                const s = STATUS_MAP[meta.status];
                return (
                  <TableRow key={friend.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-8">
                          <AvatarFallback>
                            {friend.displayName.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {friend.displayName}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {friend.source}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                        {friend.lastMessagePreview ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={s.cls + " text-[10px]"}>
                        <FontAwesomeIcon icon={s.icon} className="size-2" />
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {meta.assignee === "未割り当て" ? (
                        <span className="text-muted-foreground italic">
                          未割り当て
                        </span>
                      ) : (
                        meta.assignee
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {friend.lastMessageAt
                        ? formatRelativeShort(friend.lastMessageAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        開く
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: IconDefinition;
  accent: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className={`size-4 ${accent}`} />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold tabular-nums mt-0.5">{value}</div>
        </div>
      </div>
    </Card>
  );
}
