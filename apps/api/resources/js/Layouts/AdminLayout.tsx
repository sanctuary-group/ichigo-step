import { Link, router, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGaugeHigh,
    faBuilding,
    faBullhorn,
    faChartLine,
    faShieldHalved,
    faRightFromBracket,
    faCircleUser,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminBase } from "@/lib/admin";
import { cn } from "@/lib/utils";

type Operator = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type NavItem = { label: string; seg: string; icon: IconDefinition };

const NAV: NavItem[] = [
    { label: "ダッシュボード", seg: "", icon: faGaugeHigh },
    { label: "代理店一覧", seg: "/agencies", icon: faBuilding },
    { label: "チャネル分析", seg: "/channels/analytics", icon: faChartLine },
    { label: "お知らせ", seg: "/announcements", icon: faBullhorn },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const page = usePage<{ auth: { operator: Operator | null } }>();
    const operator = page.props.auth?.operator ?? null;
    const base = useAdminBase();
    const path = page.url.split("?")[0] ?? base;

    const hrefOf = (seg: string) => base + seg;
    const isActive = (seg: string) =>
        seg === "" ? path === base : path.startsWith(base + seg);

    return (
        <div className="dark">
            <div className="min-h-screen bg-background text-foreground flex">
                <aside className="w-60 shrink-0 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col">
                    <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
                        <FontAwesomeIcon
                            icon={faShieldHalved}
                            className="size-5 text-primary"
                        />
                        <span className="font-bold tracking-tight">
                            ichigo-step
                        </span>
                        <span className="text-[10px] px-1.5 h-4 inline-flex items-center rounded bg-destructive/20 text-destructive font-bold">
                            ADMIN
                        </span>
                    </div>
                    <nav className="flex-1 p-3 space-y-1">
                        {NAV.map((item) => {
                            const active = isActive(item.seg);
                            return (
                                <Link
                                    key={item.seg}
                                    href={hrefOf(item.seg)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors",
                                        active
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50",
                                    )}
                                >
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className={cn(
                                            "size-4",
                                            active
                                                ? "text-primary"
                                                : "text-sidebar-foreground/50",
                                        )}
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 shrink-0 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <span className="lg:hidden font-bold">
                                ichigo-step
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[11px] px-2 h-6 rounded-full bg-destructive/15 text-destructive font-bold">
                                <FontAwesomeIcon
                                    icon={faShieldHalved}
                                    className="size-3"
                                />
                                運営管理
                            </span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 h-10 pl-2 pr-2.5 rounded-lg hover:bg-muted transition-colors"
                                        aria-label="運営者メニュー"
                                    />
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faCircleUser}
                                    className="size-7 text-muted-foreground"
                                />
                                <div className="text-left hidden sm:block">
                                    <div className="text-sm font-medium leading-tight">
                                        {operator?.name ?? "—"}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground leading-tight">
                                        {operator?.role}
                                    </div>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className="size-3 text-muted-foreground"
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>
                                    <div className="font-medium">
                                        {operator?.name ?? "—"}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-normal">
                                        {operator?.email}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="gap-3 py-2.5 text-destructive data-highlighted:text-destructive"
                                    onClick={() =>
                                        router.post(`${base}/logout`)
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faRightFromBracket}
                                        className="size-4"
                                    />
                                    ログアウト
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>

                    {/* モバイル用ナビ */}
                    <div className="lg:hidden flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto">
                        {NAV.map((item) => (
                            <Link
                                key={item.seg}
                                href={hrefOf(item.seg)}
                                className={cn(
                                    "px-3 h-8 inline-flex items-center gap-1.5 rounded-md text-sm whitespace-nowrap",
                                    isActive(item.seg)
                                        ? "bg-sidebar-accent text-primary font-semibold"
                                        : "text-muted-foreground",
                                )}
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className="size-3.5"
                                />
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <main className="flex-1 overflow-y-auto">{children}</main>
                </div>
            </div>
        </div>
    );
}
