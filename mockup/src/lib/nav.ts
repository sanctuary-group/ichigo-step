import {
  faCommentDots,
  faClipboard,
  faPaperPlane,
  faStairs,
  faUserPlus,
  faTableCells,
  faRectangleList,
  faRobot,
  faQrcode,
  faDatabase,
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
      { label: "テンプレート", href: "/templates", icon: faClipboard },
      { label: "メッセージ配信", href: "/broadcasts", icon: faPaperPlane },
      { label: "ステップ配信", href: "/scenarios", icon: faStairs },
      { label: "あいさつメッセージ", href: "/greetings", icon: faUserPlus },
    ],
  },
  {
    heading: "よく使われる機能",
    items: [
      { label: "リッチメニュー", href: "/rich-menus", icon: faTableCells },
      { label: "フォーム作成", href: "/forms", icon: faRectangleList },
      { label: "自動応答", href: "/auto-replies", icon: faRobot },
      { label: "QRコードアクション", href: "/qr-actions", icon: faQrcode },
      { label: "データ管理", href: "/data-management", icon: faDatabase },
    ],
  },
];
