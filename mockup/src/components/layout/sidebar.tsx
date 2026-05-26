"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { NAV_GROUPS, type NavItem } from "@/lib/nav";
import { StrawberryIcon } from "@/components/strawberry-icon";
import { cn } from "@/lib/utils";

const HOVER_CLOSE_DELAY_MS = 150;

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (href: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHoveredHref(href);
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setHoveredHref(null);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  };

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 h-16">
        <div className="grid place-items-center size-9 rounded-xl bg-primary/10">
          <StrawberryIcon className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-bold text-sidebar-foreground">
            ichigo-step
          </div>
          <div className="text-[10px] text-muted-foreground tracking-wider">
            LINE MARKETING
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
              {group.items.map((item) => (
                <SidebarRow
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isOpen={hoveredHref === item.href}
                  onOpen={() => openMenu(item.href)}
                  onClose={scheduleClose}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-[10px] text-muted-foreground">
        v0.1.0 Mockup
      </div>
    </aside>
  );
}

function SidebarRow({
  item,
  pathname,
  isOpen,
  onOpen,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const active = isActive(item.href, pathname);
  const hasChildren = !!item.children && item.children.length > 0;
  const liRef = useRef<HTMLLIElement>(null);
  const [popoutPos, setPopoutPos] = useState<{ top: number; left: number } | null>(
    null
  );

  const handleEnter = () => {
    if (!hasChildren) return;
    if (liRef.current) {
      const rect = liRef.current.getBoundingClientRect();
      setPopoutPos({ top: rect.top, left: rect.right });
    }
    onOpen();
  };

  // ポップアウト表示中にスクロール等が発生したら閉じる（位置ズレ防止）
  useEffect(() => {
    if (!isOpen) return;
    const close = () => onClose();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen, onClose]);

  return (
    <li
      ref={liRef}
      onMouseEnter={hasChildren ? handleEnter : undefined}
      onMouseLeave={hasChildren ? onClose : undefined}
    >
      <Link
        href={item.href}
        className={cn(
          "group/row flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm transition-colors",
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
              : "text-muted-foreground group-hover/row:text-sidebar-accent-foreground"
          )}
        />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <FontAwesomeIcon
            icon={faChevronRight}
            className={cn(
              "size-2.5",
              active ? "text-primary/70" : "text-muted-foreground"
            )}
          />
        )}
      </Link>

      {hasChildren && isOpen && popoutPos && (
        <div
          className="fixed z-50 ml-1 min-w-44 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg p-1"
          style={{ top: popoutPos.top, left: popoutPos.left }}
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
        >
          <ul className="space-y-0.5">
            {item.children!.map((child) => {
              const childActive = pathname === child.href;
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 h-9 rounded-md text-sm transition-colors",
                      childActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <FontAwesomeIcon
                      icon={child.icon}
                      className={cn(
                        "size-3.5",
                        childActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="flex-1 truncate">{child.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
