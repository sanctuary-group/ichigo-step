import { cn } from "@/lib/utils";
import type {
  InvoiceStatus,
  PlanTier,
  AgencyStatus,
  TicketPriority,
  TicketStatus,
} from "@/mocks/admin-data";

const BASE =
  "inline-flex items-center gap-1 text-[10px] px-2 h-5 rounded-full font-medium";

// ---- Agency status ----

const AGENCY_STATUS_MAP: Record<AgencyStatus, { label: string; cls: string }> =
  {
    active: { label: "有効", cls: "bg-primary/10 text-primary" },
    trial: {
      label: "トライアル",
      cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    suspended: {
      label: "停止中",
      cls: "bg-destructive/10 text-destructive",
    },
  };

export function AgencyStatusBadge({
  status,
  className,
}: {
  status: AgencyStatus;
  className?: string;
}) {
  const v = AGENCY_STATUS_MAP[status];
  return <span className={cn(BASE, v.cls, className)}>{v.label}</span>;
}

// ---- Plan ----

const PLAN_MAP: Record<PlanTier, { label: string; cls: string }> = {
  free: {
    label: "Free",
    cls: "bg-muted text-muted-foreground border border-border",
  },
  standard: {
    label: "Standard",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  pro: {
    label: "Pro",
    cls: "bg-primary/10 text-primary",
  },
};

export function PlanBadge({
  plan,
  className,
}: {
  plan: PlanTier;
  className?: string;
}) {
  const v = PLAN_MAP[plan];
  return <span className={cn(BASE, v.cls, className)}>{v.label}</span>;
}

// ---- Invoice status ----

const INVOICE_STATUS_MAP: Record<
  InvoiceStatus,
  { label: string; cls: string }
> = {
  draft: {
    label: "下書き",
    cls: "bg-muted text-muted-foreground",
  },
  unpaid: {
    label: "未払い",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  overdue: {
    label: "期限超過",
    cls: "bg-destructive/10 text-destructive",
  },
  paid: {
    label: "支払い済",
    cls: "bg-primary/10 text-primary",
  },
};

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  const v = INVOICE_STATUS_MAP[status];
  return <span className={cn(BASE, v.cls, className)}>{v.label}</span>;
}

// ---- Ticket ----

const TICKET_STATUS_MAP: Record<TicketStatus, { label: string; cls: string }> =
  {
    open: {
      label: "未対応",
      cls: "bg-destructive/10 text-destructive",
    },
    in_progress: {
      label: "対応中",
      cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    resolved: {
      label: "解決済",
      cls: "bg-primary/10 text-primary",
    },
  };

export function TicketStatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  const v = TICKET_STATUS_MAP[status];
  return <span className={cn(BASE, v.cls, className)}>{v.label}</span>;
}

const TICKET_PRIORITY_MAP: Record<
  TicketPriority,
  { label: string; cls: string }
> = {
  low: { label: "低", cls: "text-muted-foreground" },
  medium: { label: "中", cls: "text-amber-600 dark:text-amber-400" },
  high: { label: "高", cls: "text-destructive" },
};

export function TicketPriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}) {
  const v = TICKET_PRIORITY_MAP[priority];
  return (
    <span className={cn("inline-flex items-center text-[11px] font-medium", v.cls, className)}>
      ● {v.label}
    </span>
  );
}
