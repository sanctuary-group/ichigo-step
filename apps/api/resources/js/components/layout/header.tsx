import { Link, router, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faQrcode,
  faHeadset,
  faBell,
  faChartColumn,
  faUser,
  faFileLines,
  faYenSign,
  faRightFromBracket,
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
import { MobileNavTrigger } from "@/components/layout/mobile-nav-trigger";

type AuthUser = { id: number; name: string; email: string } | null;
type ChannelSummary = {
  id: number;
  name: string;
  basic_id: string | null;
  channel_id: string;
  is_active: boolean;
};

export function Header() {
  const { props } = usePage<{
    auth: { user: AuthUser };
    channels?: ChannelSummary[];
  }>();
  const user = props.auth?.user ?? null;
  const channels = props.channels ?? [];
  const activeChannel = channels[0] ?? null;
  const initial = user?.name?.slice(0, 1) ?? "?";

  const handleLogout = () => {
    router.post("/logout");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 h-16 px-2 sm:px-4 lg:px-6 bg-background/95 backdrop-blur border-b border-border">
      <MobileNavTrigger />
      {/* Center: channel switcher (B-3a では Coming Soon ダミー) */}
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-2xl lg:mx-auto">
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
                <AvatarFallback>
                  {activeChannel ? activeChannel.name.slice(0, 1) : "?"}
                </AvatarFallback>
              </Avatar>
              <span
                className={
                  activeChannel
                    ? "truncate text-sm font-medium text-foreground"
                    : "truncate text-sm font-medium text-muted-foreground"
                }
              >
                {activeChannel
                  ? activeChannel.name
                  : "LINE 公式アカウント 未連携"}
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
              {channels.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground space-y-2">
                  <div>まだ連携されていません。</div>
                  <Link
                    href="/settings/channels"
                    className="inline-block text-blue-600 dark:text-blue-400 underline hover:no-underline"
                  >
                    設定 / LINE 公式アカウント へ
                  </Link>
                </div>
              ) : (
                <div className="py-1">
                  {channels.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      <Avatar className="size-7">
                        <AvatarFallback>{c.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{c.name}</div>
                        {c.basic_id && (
                          <div className="truncate text-xs text-muted-foreground">
                            {c.basic_id}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <DropdownMenuSeparator />
                  <Link
                    href="/settings/channels"
                    className="block px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-muted"
                  >
                    チャネルを管理
                  </Link>
                </div>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="hidden md:inline-flex rounded-full size-11"
              />
            }
          >
            <FontAwesomeIcon icon={faQrcode} className="size-4" />
          </TooltipTrigger>
          <TooltipContent>友だち追加 QR</TooltipContent>
        </Tooltip>
      </div>

      {/* Right utilities */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="hidden sm:flex items-center gap-1">
          <HeaderIconButton icon={faChartColumn} label="配信数" />
          <HeaderIconButton icon={faHeadset} label="サポート" />
          <HeaderIconButton icon={faBell} label="お知らせ" dot />
        </div>

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
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="text-sm hidden md:inline">{user?.name}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="size-3 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="size-10">
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div className="text-base font-bold">{user?.name}</div>
            </div>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-2 px-2 py-2.5 text-sm">
              <span className="size-2.5 rounded-full bg-primary" />
              <span>フリープラン</span>
            </div>
            <div className="px-2 pb-2">
              <Link
                href="/settings/profile"
                className="block w-full text-center rounded-md border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 h-10 leading-10 text-sm font-bold transition-colors"
              >
                マイページ
              </Link>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link href="/settings/channels" />}
              className="gap-3 py-2.5"
            >
              <FontAwesomeIcon
                icon={faUser}
                className="size-4 text-muted-foreground"
              />
              LINE公式アカウント一覧
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2.5">
              <FontAwesomeIcon
                icon={faFileLines}
                className="size-4 text-muted-foreground"
              />
              契約情報
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2.5">
              <FontAwesomeIcon
                icon={faYenSign}
                className="size-4 text-muted-foreground"
              />
              決済履歴・領収書
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-3 py-2.5"
              onClick={handleLogout}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="size-4 text-muted-foreground"
              />
              ログアウト
            </DropdownMenuItem>
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
