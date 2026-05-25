"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faQrcode,
  faHeadset,
  faBell,
  faChartColumn,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_CHANNELS, MOCK_CURRENT_USER } from "@/mocks/data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const currentChannel = MOCK_CHANNELS[0];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-16 px-4 lg:px-6 bg-background/95 backdrop-blur border-b border-border">
      {/* Center: channel switcher */}
      <div className="flex items-center gap-2 flex-1 max-w-2xl mx-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="flex-1 justify-between h-11 rounded-full px-2 w-full"
              />
            }
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8">
                <AvatarImage src={currentChannel.pictureUrl} />
                <AvatarFallback>
                  {currentChannel.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium">
                {currentChannel.name}
              </span>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="size-3 ml-2 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>LINE 公式アカウント</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MOCK_CHANNELS.map((c) => (
                <DropdownMenuItem key={c.id} className="gap-2 py-2">
                  <Avatar className="size-7">
                    <AvatarImage src={c.pictureUrl} />
                    <AvatarFallback>{c.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {c.basicId}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="rounded-full size-11"
              />
            }
          >
            <FontAwesomeIcon icon={faQrcode} className="size-4" />
          </TooltipTrigger>
          <TooltipContent>友だち追加 QR</TooltipContent>
        </Tooltip>
      </div>

      {/* Right utilities */}
      <div className="flex items-center gap-1">
        <HeaderIconButton icon={faChartColumn} label="配信数" />
        <HeaderIconButton icon={faHeadset} label="サポート" />
        <HeaderIconButton icon={faBell} label="お知らせ" dot />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-11 rounded-full pl-1 pr-2 gap-2 ml-1"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback>
                {MOCK_CURRENT_USER.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm hidden md:inline">
              {MOCK_CURRENT_USER.name}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="size-3 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{MOCK_CURRENT_USER.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                {MOCK_CURRENT_USER.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>プロフィール</DropdownMenuItem>
              <DropdownMenuItem>組織を切り替え</DropdownMenuItem>
              <DropdownMenuSeparator />
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
