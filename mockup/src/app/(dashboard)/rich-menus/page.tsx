"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faEye,
  faEyeSlash,
  faTableCells,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_RICH_MENUS, MOCK_CHANNELS, type MockRichMenu } from "@/mocks/data";
import { formatRelativeShort } from "@/lib/time";

export default function RichMenusPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">リッチメニュー</h1>
          <p className="text-sm text-muted-foreground mt-1">
            LINE トーク画面下部に常駐するメニューを設定（モック）
          </p>
        </div>
        <Button>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          新しいリッチメニュー
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_RICH_MENUS.map((rm) => {
          const channel = MOCK_CHANNELS.find((c) => c.id === rm.channelId);
          return (
            <Card key={rm.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{rm.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {channel?.name ?? "—"}
                    </div>
                  </div>
                  {rm.isPublished ? (
                    <Badge className="bg-primary/10 text-primary border-0">
                      <FontAwesomeIcon icon={faEye} className="size-2.5" />
                      公開中
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      <FontAwesomeIcon icon={faEyeSlash} className="size-2.5" />
                      下書き
                    </Badge>
                  )}
                </div>

                <LayoutPreview menu={rm} />

                <div className="space-y-1">
                  <div className="text-[11px] text-muted-foreground tracking-wider uppercase">
                    タップエリア
                  </div>
                  <ul className="text-xs space-y-0.5">
                    {rm.tapAreas.slice(0, 3).map((a, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <span className="size-1 rounded-full bg-primary shrink-0" />
                        <span className="font-medium">{a.label}</span>
                        <span className="text-muted-foreground truncate">
                          — {a.action}
                        </span>
                      </li>
                    ))}
                    {rm.tapAreas.length > 3 && (
                      <li className="text-[11px] text-muted-foreground pl-2.5">
                        他 {rm.tapAreas.length - 3} 件
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span>
                    {rm.publishedAt
                      ? `公開: ${formatRelativeShort(rm.publishedAt)}`
                      : "未公開"}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7">
                    <FontAwesomeIcon icon={faPenToSquare} className="size-3" />
                    編集
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LayoutPreview({ menu }: { menu: MockRichMenu }) {
  if (menu.layout === "6grid") {
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-0.5 aspect-[5/3] rounded-lg overflow-hidden border border-border bg-muted/40">
        {menu.tapAreas.slice(0, 6).map((a, i) => (
          <div
            key={i}
            className="bg-primary/5 grid place-items-center text-[10px] text-primary font-medium px-1 text-center"
          >
            {a.label}
          </div>
        ))}
      </div>
    );
  }
  if (menu.layout === "3vertical") {
    return (
      <div className="grid grid-rows-3 gap-0.5 aspect-[5/3] rounded-lg overflow-hidden border border-border bg-muted/40">
        {menu.tapAreas.slice(0, 3).map((a, i) => (
          <div
            key={i}
            className="bg-primary/5 grid place-items-center text-[11px] text-primary font-medium px-1"
          >
            {a.label}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-0.5 aspect-[5/3] rounded-lg overflow-hidden border border-border bg-muted/40">
      {menu.tapAreas.slice(0, 4).map((a, i) => (
        <div
          key={i}
          className="bg-primary/5 grid place-items-center text-[11px] text-primary font-medium px-1 text-center"
        >
          {a.label}
        </div>
      ))}
      {menu.tapAreas.length === 0 && (
        <div className="col-span-2 row-span-2 grid place-items-center text-muted-foreground">
          <FontAwesomeIcon icon={faTableCells} className="size-6" />
        </div>
      )}
    </div>
  );
}
