import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFont, faImage, faLayerGroup } from "@fortawesome/free-solid-svg-icons";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TagBadge } from "@/components/tag-badge";
import { BroadcastStatusBadge } from "@/components/broadcasts/status-badge";
import { EmptyState } from "@/components/empty-state";
import { MOCK_BROADCASTS, MOCK_TAGS } from "@/mocks/data";
import { formatDateTime } from "@/lib/time";

export default function BroadcastsPage() {
  const items = MOCK_BROADCASTS;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">メッセージ配信</h1>
          <p className="text-sm text-muted-foreground mt-1">
            一斉配信の一覧と新規作成
          </p>
        </div>
        <Link href="/broadcasts/new" className={buttonVariants()}>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          新規作成
        </Link>
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState
            title="配信履歴がまだありません"
            description="新規作成からメッセージを送信してみましょう"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">タイトル</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>対象</TableHead>
                <TableHead>送信日時 / 予定</TableHead>
                <TableHead className="text-right">成功数</TableHead>
                <TableHead className="w-20">状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => {
                const tag = MOCK_TAGS.find((t) => t.id === b.targetTagId);
                const when = b.sentAt ?? b.scheduledAt;
                return (
                  <TableRow key={b.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="font-medium text-sm">{b.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-md">
                        {b.preview}
                      </div>
                    </TableCell>
                    <TableCell>
                      <MessageTypeBadge type={b.messageType} />
                    </TableCell>
                    <TableCell>
                      {b.targetType === "all" ? (
                        <span className="text-xs text-muted-foreground">
                          全員
                        </span>
                      ) : tag ? (
                        <TagBadge tag={tag} size="sm" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {when ? formatDateTime(when) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {b.successCount.toLocaleString()}
                      <span className="text-muted-foreground">
                        {" "}
                        / {b.totalCount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <BroadcastStatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function MessageTypeBadge({ type }: { type: "text" | "image" | "flex" | "sticker" }) {
  const map = {
    text: { icon: faFont, label: "テキスト" },
    image: { icon: faImage, label: "画像" },
    flex: { icon: faLayerGroup, label: "Flex" },
    sticker: { icon: faFont, label: "スタンプ" },
  };
  const v = map[type];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <FontAwesomeIcon icon={v.icon} className="size-3" />
      {v.label}
    </span>
  );
}
