import {
  faGaugeHigh,
  faBuilding,
  faLayerGroup,
  faFileInvoiceDollar,
  faBullhorn,
  faLifeRing,
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
    heading: "概要",
    items: [{ label: "ダッシュボード", href: "/dashboard", icon: faGaugeHigh }],
  },
  {
    heading: "テナント管理",
    items: [
      { label: "テナント一覧", href: "/tenants", icon: faBuilding },
      { label: "プラン管理", href: "/plans", icon: faLayerGroup },
    ],
  },
  {
    heading: "収益",
    items: [
      { label: "課金・請求", href: "/billing", icon: faFileInvoiceDollar },
    ],
  },
  {
    heading: "コミュニケーション",
    items: [
      { label: "お知らせ配信", href: "/announcements", icon: faBullhorn },
      { label: "サポート", href: "/support", icon: faLifeRing, badge: 3 },
    ],
  },
  {
    heading: "その他",
    items: [{ label: "設定", href: "/settings/members", icon: faGear }],
  },
];
