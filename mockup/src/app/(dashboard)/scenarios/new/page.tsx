"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faGripVertical,
  faPlus,
  faTrash,
  faFont,
  faImage,
  faLayerGroup,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagePreview } from "@/components/message-preview";
import { cn } from "@/lib/utils";
import { MOCK_TAGS, type MockMessageType } from "@/mocks/data";

type EditorStep = {
  id: string;
  delayMinutes: number;
  type: MockMessageType;
  content: string;
};

const DEFAULT_STEPS: EditorStep[] = [
  {
    id: "es_1",
    delayMinutes: 0,
    type: "text",
    content: "ご登録ありがとうございます！🌸\n簡単に自己紹介させてください。",
  },
  {
    id: "es_2",
    delayMinutes: 60,
    type: "image",
    content: "30秒アンケートで無料プレゼント",
  },
  {
    id: "es_3",
    delayMinutes: 24 * 60,
    type: "text",
    content: "昨日のメッセージはご覧いただけましたか？",
  },
];

export default function NewScenarioPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<
    "friend_add" | "tag_added" | "manual"
  >("friend_add");
  const [triggerTagId, setTriggerTagId] = useState<string>("tag_event");
  const [isActive, setIsActive] = useState(true);
  const [steps, setSteps] = useState<EditorStep[]>(DEFAULT_STEPS);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = steps.findIndex((s) => s.id === active.id);
      const newIdx = steps.findIndex((s) => s.id === over.id);
      setSteps(arrayMove(steps, oldIdx, newIdx));
    }
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: `es_${Date.now()}`,
        delayMinutes: 60,
        type: "text",
        content: "",
      },
    ]);
  };

  const updateStep = (id: string, patch: Partial<EditorStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/scenarios"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">シナリオを作成</h1>
            <p className="text-sm text-muted-foreground mt-1">
              トリガーとステップを設定して自動配信を組み立てます
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              id="active"
            />
            <Label htmlFor="active" className="text-sm font-normal">
              {isActive ? "有効" : "停止中"}
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>シナリオ基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">シナリオ名</Label>
              <Input
                id="name"
                placeholder="例: 新規友だちウェルカム"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">説明 (任意)</Label>
              <Textarea
                id="desc"
                rows={2}
                placeholder="このシナリオの目的や対象者をメモ"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>トリガー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RadioGroup
              value={trigger}
              onValueChange={(v) => setTrigger(v as typeof trigger)}
              className="space-y-2"
            >
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <RadioGroupItem value="friend_add" />
                友だち追加時に開始
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <RadioGroupItem value="tag_added" />
                指定タグ付与時に開始
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <RadioGroupItem value="manual" />
                手動でエンロール
              </Label>
            </RadioGroup>
            {trigger === "tag_added" && (
              <div className="pl-6">
                <Select
                  value={triggerTagId}
                  onValueChange={(v) => v && setTriggerTagId(v)}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TAGS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ステップ ({steps.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={addStep}>
              <FontAwesomeIcon icon={faPlus} className="size-3" />
              ステップを追加
            </Button>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {steps.map((s, i) => (
                    <SortableStepCard
                      key={s.id}
                      step={s}
                      index={i}
                      onChange={(patch) => updateStep(s.id, patch)}
                      onRemove={() => removeStep(s.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {steps.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                ステップがありません
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-6">
          <Link
            href="/scenarios"
            className={buttonVariants({ variant: "outline" })}
          >
            キャンセル
          </Link>
          <Button variant="outline">下書き保存</Button>
          <Button>シナリオを保存</Button>
        </div>
      </div>
    </div>
  );
}

function SortableStepCard({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: EditorStep;
  index: number;
  onChange: (patch: Partial<EditorStep>) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-border bg-background p-4",
        isDragging && "shadow-lg ring-2 ring-primary/30 z-10"
      )}
      {...attributes}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="grid place-items-center size-8 rounded-md text-muted-foreground hover:bg-muted cursor-grab active:cursor-grabbing"
          aria-label="ドラッグして並べ替え"
          {...listeners}
        >
          <FontAwesomeIcon icon={faGripVertical} className="size-3.5" />
        </button>

        <div className="grid place-items-center size-8 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faClock}
              className="size-3 text-muted-foreground"
            />
            <Label
              htmlFor={`delay-${step.id}`}
              className="text-xs text-muted-foreground"
            >
              前のステップから
            </Label>
            <Input
              id={`delay-${step.id}`}
              type="number"
              min={0}
              value={step.delayMinutes}
              onChange={(e) =>
                onChange({ delayMinutes: Number(e.target.value) })
              }
              className="w-24 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">分後に配信</span>
            <span className="text-[11px] text-muted-foreground">
              ({formatDelay(step.delayMinutes)})
            </span>
          </div>

          <Tabs
            value={step.type}
            onValueChange={(v) => onChange({ type: v as MockMessageType })}
          >
            <TabsList>
              <TabsTrigger value="text">
                <FontAwesomeIcon icon={faFont} className="size-3" />
                テキスト
              </TabsTrigger>
              <TabsTrigger value="image">
                <FontAwesomeIcon icon={faImage} className="size-3" />
                画像
              </TabsTrigger>
              <TabsTrigger value="flex">
                <FontAwesomeIcon icon={faLayerGroup} className="size-3" />
                Flex
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-3 items-start">
            <Textarea
              rows={4}
              placeholder={
                step.type === "text"
                  ? "メッセージ本文を入力…"
                  : step.type === "image"
                    ? "画像のキャプション (任意)"
                    : "Flex メッセージのラベル"
              }
              value={step.content}
              onChange={(e) => onChange({ content: e.target.value })}
            />
            <MessagePreview type={step.type} content={step.content} />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
          aria-label="削除"
        >
          <FontAwesomeIcon icon={faTrash} className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function formatDelay(min: number): string {
  if (min === 0) return "即時";
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) return m === 0 ? `${h}時間` : `${h}時間${m}分`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh === 0 ? `${d}日` : `${d}日${rh}時間`;
}
