import {
  faCommentDots,
  faPaperPlane,
  faStairs,
  faAddressBook,
  faTag,
  faChartLine,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type NavItem = {
  label: string;
  href: string;
  icon: IconDefinition;
  badge?: number;
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "メッセージ関連",
    items: [
      { label: "1:1 チャット", href: "/chat", icon: faCommentDots, badge: 7 },
      { label: "メッセージ配信", href: "/broadcasts", icon: faPaperPlane },
      { label: "ステップ配信", href: "/scenarios", icon: faStairs },
    ],
  },
  {
    heading: "友だち管理",
    items: [
      { label: "友だち一覧", href: "/friends", icon: faAddressBook },
      { label: "タグ管理", href: "/tags", icon: faTag },
    ],
  },
  {
    heading: "その他",
    items: [
      { label: "ダッシュボード", href: "/dashboard", icon: faChartLine },
      { label: "設定", href: "/settings/channels", icon: faGear },
    ],
  },
];
