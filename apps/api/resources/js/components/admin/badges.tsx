import { cn } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
    free: "Free",
    standard: "Standard",
    pro: "Pro",
};

const PLAN_CLASSES: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    standard: "bg-blue-500/15 text-blue-400",
    pro: "bg-primary/15 text-primary",
};

export function PlanBadge({ plan }: { plan: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 h-5 rounded-full text-[11px] font-medium",
                PLAN_CLASSES[plan] ?? PLAN_CLASSES.free,
            )}
        >
            {PLAN_LABELS[plan] ?? plan}
        </span>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const active = status === "active";
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 h-5 rounded-full text-[11px] font-medium",
                active
                    ? "bg-primary/15 text-primary"
                    : "bg-destructive/15 text-destructive",
            )}
        >
            <span
                className={cn(
                    "size-1.5 rounded-full",
                    active ? "bg-primary" : "bg-destructive",
                )}
            />
            {active ? "稼働中" : "停止中"}
        </span>
    );
}
