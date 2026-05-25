"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faQrcode,
  faTag,
  faStairs,
  faRoute,
  faDownload,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_QR_ACTIONS, type MockQrAction } from "@/mocks/data";
import { formatRelativeShort } from "@/lib/time";

const ACTION_ICON: Record<MockQrAction["action"], IconDefinition> = {
  add_tag: faTag,
  start_scenario: faStairs,
  track_source: faRoute,
};

export default function QrActionsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            QRコードアクション
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            QR スキャン時にタグ付与・シナリオ開始などのアクションを設定（モック）
          </p>
        </div>
        <Button>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          QR を作成
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCK_QR_ACTIONS.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-4 space-y-3">
              <div className="grid place-items-center aspect-square rounded-lg bg-muted/60 border border-border">
                <div className="grid grid-cols-7 grid-rows-7 gap-px size-32 p-2">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const filled = QR_PATTERN[i];
                    return (
                      <div
                        key={i}
                        className={
                          filled
                            ? "bg-foreground rounded-[1px]"
                            : "bg-transparent"
                        }
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium truncate">{q.name}</div>
                <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {q.purpose}
                </div>
              </div>

              <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                <FontAwesomeIcon
                  icon={ACTION_ICON[q.action]}
                  className="size-2.5"
                />
                {q.actionLabel}
              </Badge>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                <span>スキャン {q.scanCount.toLocaleString()} 回</span>
                <span>{formatRelativeShort(q.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="flex-1 h-8">
                  <FontAwesomeIcon icon={faDownload} className="size-3" />
                  画像
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="編集">
                  <FontAwesomeIcon icon={faPenToSquare} className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <FontAwesomeIcon
            icon={faQrcode}
            className="size-4 text-muted-foreground/70"
          />
          QR コードは LINE 公式アカウントの友だち追加 URL にパラメータを付けた形で生成されます。スキャン時に紐づくアクションが自動実行されます。
        </div>
      </Card>
    </div>
  );
}

// 適当な疑似 QR コードパターン（7x7）
const QR_PATTERN = [
  1, 1, 1, 0, 1, 1, 1,
  1, 0, 1, 0, 1, 0, 1,
  1, 1, 1, 1, 0, 1, 1,
  0, 0, 1, 0, 1, 1, 0,
  1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 0, 0, 1, 0,
  1, 1, 1, 0, 1, 1, 1,
];
