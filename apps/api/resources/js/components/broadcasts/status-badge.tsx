import { cn } from "@/lib/utils";
import type { BroadcastStatus } from "@/types/broadcast";

const STATUS_LABELS: Record<BroadcastStatus, string> = {
    draft: "下書き",
    scheduled: "予約",
    sending: "送信中",
    sent: "送信済み",
    failed: "失敗",
};

const STATUS_CLASSES: Record<BroadcastStatus, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    sending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    sent: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

export function BroadcastStatusBadge({
    status,
    className,
}: {
    status: BroadcastStatus;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium",
                STATUS_CLASSES[status],
                className,
            )}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}
