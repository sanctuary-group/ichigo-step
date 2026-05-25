"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faPenToSquare,
  faClipboard,
  faImage,
  faLayerGroup,
  faFont,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { MOCK_TEMPLATES } from "@/mocks/data";
import { formatRelativeShort } from "@/lib/time";

const CATEGORY_ALL = "all" as const;
type CategoryFilter =
  | typeof CATEGORY_ALL
  | "あいさつ"
  | "案内"
  | "フォロー"
  | "その他";

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: CATEGORY_ALL, label: "すべて" },
  { value: "あいさつ", label: "あいさつ" },
  { value: "案内", label: "案内" },
  { value: "フォロー", label: "フォロー" },
  { value: "その他", label: "その他" },
];

const TYPE_ICONS: Record<string, IconDefinition> = {
  text: faFont,
  image: faImage,
  flex: faLayerGroup,
  sticker: faFont,
};

export default function TemplatesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(CATEGORY_ALL);

  const filtered = useMemo(() => {
    return MOCK_TEMPLATES.filter((t) => {
      if (category !== CATEGORY_ALL && t.category !== category) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.preview.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [query, category]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">テンプレート</h1>
          <p className="text-sm text-muted-foreground mt-1">
            よく使うメッセージを保存して再利用（モック）
          </p>
        </div>
        <Button>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          テンプレートを追加
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
              placeholder="テンプレート名・本文で検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={
                  "h-9 px-3 rounded-md text-xs font-medium transition-colors " +
                  (category === c.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={faClipboard}
            title="該当するテンプレートがありません"
            description="検索条件を変えるか、新しいテンプレートを作成してください"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid place-items-center size-8 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FontAwesomeIcon
                        icon={TYPE_ICONS[t.messageType]}
                        className="size-3.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {t.name}
                      </div>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">
                        {t.category}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="編集"
                  >
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="size-3.5"
                    />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {t.preview}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span>使用回数 {t.useCount.toLocaleString()}</span>
                  <span>
                    {t.lastUsedAt
                      ? `最終: ${formatRelativeShort(t.lastUsedAt)}`
                      : "未使用"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
