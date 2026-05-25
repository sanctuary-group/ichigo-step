"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChartLine,
  faPenToSquare,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_FORMS, type MockForm } from "@/mocks/data";
import { formatRelativeShort } from "@/lib/time";

const STATUS_MAP: Record<MockForm["status"], { label: string; cls: string }> = {
  draft: {
    label: "下書き",
    cls: "bg-muted text-muted-foreground",
  },
  published: {
    label: "公開中",
    cls: "bg-primary/10 text-primary border-0",
  },
  closed: {
    label: "終了",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0",
  },
};

export default function FormsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">フォーム作成</h1>
          <p className="text-sm text-muted-foreground mt-1">
            LIFF フォームを作成して友だち情報を収集（モック）
          </p>
        </div>
        <Button>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          フォームを作成
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">タイトル</TableHead>
              <TableHead className="text-right">質問数</TableHead>
              <TableHead className="text-right">回答数</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_FORMS.map((f) => {
              const s = STATUS_MAP[f.status];
              return (
                <TableRow key={f.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="text-sm font-medium">{f.title}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {f.id}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {f.questionCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1 text-sm tabular-nums">
                      {f.responseCount.toLocaleString()}
                      {f.responseCount > 0 && (
                        <FontAwesomeIcon
                          icon={faChartLine}
                          className="size-3 text-muted-foreground ml-1"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={s.cls + " text-[10px]"}>{s.label}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatRelativeShort(f.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="共有"
                        disabled={f.status !== "published"}
                      >
                        <FontAwesomeIcon
                          icon={faShareNodes}
                          className="size-3.5"
                        />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="編集">
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="size-3.5"
                        />
                      </Button>
                    </div>
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
