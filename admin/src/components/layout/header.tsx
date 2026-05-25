"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faBell,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MOCK_ADMIN_USER } from "@/mocks/admin-data";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-16 px-4 lg:px-6 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-destructive/10 text-destructive border border-destructive/30 text-[11px] font-semibold uppercase tracking-wider">
          <FontAwesomeIcon icon={faShieldHalved} className="size-3" />
          Admin Portal
        </span>
        <span className="text-xs text-muted-foreground hidden md:inline">
          このコンソールでの操作は全テナントに影響します
        </span>
      </div>

      <div className="flex items-center gap-1">
        <HeaderIconButton icon={faBell} label="運営通知" dot />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-10 rounded-full pl-1 pr-2 gap-2 ml-1"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback>
                {MOCK_ADMIN_USER.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm hidden md:inline">
              {MOCK_ADMIN_USER.name}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="size-3 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{MOCK_ADMIN_USER.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                {MOCK_ADMIN_USER.email} ({MOCK_ADMIN_USER.role})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>監査ログ</DropdownMenuItem>
              <DropdownMenuItem>ログアウト</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function HeaderIconButton({
  icon,
  label,
  dot,
}: {
  icon: IconDefinition;
  label: string;
  dot?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-10 rounded-full text-muted-foreground hover:text-foreground"
          />
        }
      >
        <FontAwesomeIcon icon={icon} className="size-4" />
        {dot && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
        <span className="sr-only">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
