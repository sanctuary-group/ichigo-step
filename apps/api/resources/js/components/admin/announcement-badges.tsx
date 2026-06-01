export type Importance = "normal" | "important" | "maintenance";
export type Status = "draft" | "published";

const IMPORTANCE: Record<
    Importance,
    { label: string; className: string }
> = {
    normal: {
        label: "通常",
        className:
            "bg-muted text-muted-foreground border-border",
    },
    important: {
        label: "重要",
        className:
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
    },
    maintenance: {
        label: "メンテナンス",
        className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    },
};

const STATUS: Record<Status, { label: string; className: string }> = {
    draft: {
        label: "下書き",
        className: "bg-muted text-muted-foreground border-border",
    },
    published: {
        label: "公開中",
        className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
    },
};

export function ImportanceBadge({ importance }: { importance: Importance }) {
    const c = IMPORTANCE[importance] ?? IMPORTANCE.normal;
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-bold ${c.className}`}
        >
            {c.label}
        </span>
    );
}

export function StatusBadge({ status }: { status: Status }) {
    const c = STATUS[status] ?? STATUS.draft;
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-bold ${c.className}`}
        >
            {c.label}
        </span>
    );
}
