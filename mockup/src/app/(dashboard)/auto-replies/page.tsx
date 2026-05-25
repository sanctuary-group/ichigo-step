"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faKey,
  faUserPlus,
  faCircleQuestion,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_AUTO_REPLIES, type MockAutoReply } from "@/mocks/data";

const TRIGGER_META: Record<
  MockAutoReply["triggerType"],
  { label: string; icon: IconDefinition; cls: string }
> = {
  keyword: {
    label: "キーワード",
    icon: faKey,
    cls: "bg-primary/10 text-primary",
  },
  follow: {
    label: "友だち追加",
    icon: faUserPlus,
    cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  default: {
    label: "デフォルト",
    icon: faCircleQuestion,
    cls: "bg-muted text-muted-foreground",
  },
};

export default function AutoRepliesPage() {
  const totalHit = MOCK_AUTO_REPLIES.reduce((s, r) => s + r.hitCount, 0);
  const activeCount = MOCK_AUTO_REPLIES.filter((r) => r.isActive).length;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">自動応答</h1>
          <p className="text-sm text-muted-foreground mt-1">
            キーワードや友だち追加に応じて自動で返信メッセージを送信（モック）
          </p>
        </div>
        <Button>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          ルールを追加
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">有効ルール</div>
          <div className="text-2xl font-bold tabular-nums mt-1">
            {activeCount}
            <span className="text-sm text-muted-foreground ml-1">
              / {MOCK_AUTO_REPLIES.length}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">累計反応数</div>
          <div className="text-2xl font-bold tabular-nums mt-1">
            {totalHit.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">直近 30 日</div>
          <div className="text-2xl font-bold tabular-nums mt-1">
            {Math.round(totalHit * 0.42).toLocaleString()}
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">タイプ</TableHead>
              <TableHead className="w-[28%]">トリガー</TableHead>
              <TableHead>返信メッセージ</TableHead>
              <TableHead className="text-right">反応数</TableHead>
              <TableHead className="w-20">状態</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_AUTO_REPLIES.map((r) => {
              const m = TRIGGER_META[r.triggerType];
              return (
                <TableRow key={r.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Badge className={m.cls + " border-0 text-[10px]"}>
                      <FontAwesomeIcon icon={m.icon} className="size-2.5" />
                      {m.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{r.trigger}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                      {r.replyPreview}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {r.hitCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Switch checked={r.isActive} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" aria-label="編集">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="size-3.5"
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
