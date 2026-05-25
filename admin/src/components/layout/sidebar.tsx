"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";

import { NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 h-16">
        <div className="grid place-items-center size-9 rounded-xl bg-primary/10 text-primary">
          <FontAwesomeIcon icon={faShieldHalved} className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-bold text-sidebar-foreground">
            ichigo-step
          </div>
          <div className="text-[10px] text-muted-foreground tracking-wider">
            ADMIN PORTAL
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            <div className="px-3 mb-1.5 text-[11px] font-medium text-muted-foreground tracking-wider">
              {group.heading}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href.split("?")[0]);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={cn(
                          "size-4",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-[10px] text-muted-foreground">
        v0.1.0 Admin Mockup
      </div>
    </aside>
  );
}
