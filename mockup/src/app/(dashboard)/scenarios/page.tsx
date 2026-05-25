import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faStairs,
  faUserPlus,
  faTag,
  faHand,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

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
import { EmptyState } from "@/components/empty-state";
import { MOCK_SCENARIOS, MOCK_TAGS, type MockScenario } from "@/mocks/data";

const TRIGGER_META: Record<
  MockScenario["triggerType"],
  { label: string; icon: IconDefinition }
> = {
  friend_add: { label: "友だち追加", icon: faUserPlus },
  tag_added: { label: "タグ付与", icon: faTag },
  manual: { label: "手動開始", icon: faHand },
};

export default function ScenariosPage() {
  const items = MOCK_SCENARIOS;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ステップ配信</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ドリップキャンペーンの一覧と作成
          </p>
        </div>
        <Link href="/scenarios/new" className={buttonVariants()}>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          新規作成
        </Link>
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState
            icon={faStairs}
            title="シナリオがまだありません"
            description="トリガーとステップを設定して新規作成しましょう"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">シナリオ名</TableHead>
                <TableHead>トリガー</TableHead>
                <TableHead className="text-right">ステップ数</TableHead>
                <TableHead className="text-right">配信中人数</TableHead>
                <TableHead className="w-20">状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => {
                const t = TRIGGER_META[s.triggerType];
                const tag = MOCK_TAGS.find((x) => x.id === s.triggerTagId);
                return (
                  <TableRow key={s.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link
                        href={`/scenarios/new?id=${s.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {s.name}
                      </Link>
                      {s.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-md">
                          {s.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <FontAwesomeIcon icon={t.icon} className="size-3" />
                          {t.label}
                        </span>
                        {tag && <TagBadge tag={tag} size="sm" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {s.steps.length}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {s.enrolledCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 h-5 rounded-full bg-primary/10 text-primary font-medium">
                          <span className="size-1.5 rounded-full bg-primary" />
                          有効
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] px-2 h-5 rounded-full bg-muted text-muted-foreground font-medium">
                          停止中
                        </span>
                      )}
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
