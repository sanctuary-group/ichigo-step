// ============================================================
// 運営側（Admin Portal）モックデータ
// 用語: 「代理店 (Agency)」= ichigo-step を契約して LINE 公式アカウントを運用する利用者
// 階層: 運営者 → 代理店（= 利用者）
// ============================================================

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "support";
};

export const MOCK_ADMIN_USER: AdminUser = {
  id: "au_1",
  name: "Platform Owner",
  email: "ops@ichigo-step.com",
  role: "owner",
};

// ============================================================
// プラン
// ============================================================

export type PlanTier = "free" | "standard" | "pro";

export type Plan = {
  id: string;
  tier: PlanTier;
  name: string;
  priceJpy: number; // 月額
  features: string[];
  limits: {
    channels: number; // -1 = unlimited
    membersPerOrg: number;
    monthlyMessages: number;
  };
  agencyCount: number; // 加入代理店数
};

export const MOCK_PLANS: Plan[] = [
  {
    id: "plan_free",
    tier: "free",
    name: "Free",
    priceJpy: 0,
    features: ["1 LINE 公式アカウント", "友だち管理", "基本配信"],
    limits: { channels: 1, membersPerOrg: 2, monthlyMessages: 1000 },
    agencyCount: 142,
  },
  {
    id: "plan_standard",
    tier: "standard",
    name: "Standard",
    priceJpy: 9800,
    features: [
      "3 LINE 公式アカウントまで",
      "ステップ配信",
      "タグ・セグメント配信",
      "メンバー 10 名まで",
    ],
    limits: { channels: 3, membersPerOrg: 10, monthlyMessages: 30000 },
    agencyCount: 87,
  },
  {
    id: "plan_pro",
    tier: "pro",
    name: "Pro",
    priceJpy: 29800,
    features: [
      "LINE 公式アカウント無制限",
      "メンバー無制限",
      "優先サポート",
      "監査ログ",
      "SSO（予定）",
    ],
    limits: { channels: -1, membersPerOrg: -1, monthlyMessages: 200000 },
    agencyCount: 24,
  },
];

// ============================================================
// 代理店 (= 利用者 = LINE 公式アカウント運用者)
// ============================================================

export type AgencyStatus = "active" | "trial" | "suspended";

export type Agency = {
  id: string;
  name: string; // 会社名
  slug: string;
  plan: PlanTier;
  status: AgencyStatus;
  memberCount: number;
  channelCount: number; // LINE 公式アカウント数
  monthlyMessageCount: number;
  mrrJpy: number; // 月次収益
  contractedAt: string; // ISO（契約開始）
  lastActiveAt: string; // ISO
  ownerEmail: string;
  contactName?: string;
  contactPhone?: string;
  note?: string;
};

export const MOCK_AGENCIES: Agency[] = [
  {
    id: "ag_1",
    name: "サンクチュアリ株式会社",
    slug: "sanctuary",
    plan: "pro",
    status: "active",
    memberCount: 12,
    channelCount: 5,
    monthlyMessageCount: 78421,
    mrrJpy: 29800,
    contractedAt: "2025-09-12T10:00:00+09:00",
    lastActiveAt: "2026-05-25T11:34:00+09:00",
    ownerEmail: "ryu.ichigo20250310@gmail.com",
    contactName: "Ryu Ichigo",
    contactPhone: "03-1234-5678",
  },
  {
    id: "ag_2",
    name: "美波コンサルティング",
    slug: "minami",
    plan: "standard",
    status: "active",
    memberCount: 4,
    channelCount: 2,
    monthlyMessageCount: 12480,
    mrrJpy: 9800,
    contractedAt: "2025-11-03T10:00:00+09:00",
    lastActiveAt: "2026-05-25T10:12:00+09:00",
    ownerEmail: "minami@example.com",
    contactName: "美波 みなみ",
  },
  {
    id: "ag_3",
    name: "ワンステップスタジオ",
    slug: "one-step-studio",
    plan: "standard",
    status: "active",
    memberCount: 6,
    channelCount: 3,
    monthlyMessageCount: 18230,
    mrrJpy: 9800,
    contractedAt: "2026-01-22T10:00:00+09:00",
    lastActiveAt: "2026-05-24T19:50:00+09:00",
    ownerEmail: "owner@one-step-studio.jp",
    contactName: "佐藤 健太",
  },
  {
    id: "ag_4",
    name: "Hana 整体院",
    slug: "hana-seitai",
    plan: "free",
    status: "active",
    memberCount: 2,
    channelCount: 1,
    monthlyMessageCount: 412,
    mrrJpy: 0,
    contractedAt: "2026-03-15T10:00:00+09:00",
    lastActiveAt: "2026-05-25T08:00:00+09:00",
    ownerEmail: "hana@example.com",
    contactName: "花田 さくら",
    note: "個人経営の整体院、まだ Free プラン",
  },
  {
    id: "ag_5",
    name: "新規トライアル A",
    slug: "trial-a",
    plan: "standard",
    status: "trial",
    memberCount: 1,
    channelCount: 1,
    monthlyMessageCount: 38,
    mrrJpy: 0,
    contractedAt: "2026-05-20T10:00:00+09:00",
    lastActiveAt: "2026-05-25T12:00:00+09:00",
    ownerEmail: "trial-a@example.com",
    note: "14日トライアル中、5/27 まで",
  },
  {
    id: "ag_6",
    name: "未払い停止中アカウント",
    slug: "suspended-b",
    plan: "standard",
    status: "suspended",
    memberCount: 3,
    channelCount: 1,
    monthlyMessageCount: 0,
    mrrJpy: 0,
    contractedAt: "2025-08-01T10:00:00+09:00",
    lastActiveAt: "2026-04-10T18:00:00+09:00",
    ownerEmail: "owner@suspended-b.com",
    note: "2 ヶ月連続未払いで停止中",
  },
  {
    id: "ag_7",
    name: "Pro 大口顧客 C",
    slug: "pro-c",
    plan: "pro",
    status: "active",
    memberCount: 28,
    channelCount: 12,
    monthlyMessageCount: 156000,
    mrrJpy: 29800,
    contractedAt: "2025-06-05T10:00:00+09:00",
    lastActiveAt: "2026-05-25T13:00:00+09:00",
    ownerEmail: "admin@pro-c.com",
    contactName: "高田 真一",
    contactPhone: "03-9876-5432",
    note: "12 channel 運用の大口、優先サポート対象",
  },
];

// ============================================================
// 請求書
// ============================================================

export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "draft";

export type Invoice = {
  id: string;
  number: string;
  agencyId: string;
  agencyName: string;
  periodMonth: string; // YYYY-MM
  amountJpy: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
};

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "iv_1",
    number: "INV-2026-0048",
    agencyId: "ag_1",
    agencyName: "サンクチュアリ株式会社",
    periodMonth: "2026-05",
    amountJpy: 29800,
    status: "paid",
    issuedAt: "2026-05-01T00:00:00+09:00",
    dueAt: "2026-05-15T23:59:59+09:00",
    paidAt: "2026-05-08T12:34:56+09:00",
  },
  {
    id: "iv_2",
    number: "INV-2026-0049",
    agencyId: "ag_2",
    agencyName: "美波コンサルティング",
    periodMonth: "2026-05",
    amountJpy: 9800,
    status: "paid",
    issuedAt: "2026-05-01T00:00:00+09:00",
    dueAt: "2026-05-15T23:59:59+09:00",
    paidAt: "2026-05-03T09:00:00+09:00",
  },
  {
    id: "iv_3",
    number: "INV-2026-0050",
    agencyId: "ag_3",
    agencyName: "ワンステップスタジオ",
    periodMonth: "2026-05",
    amountJpy: 9800,
    status: "unpaid",
    issuedAt: "2026-05-01T00:00:00+09:00",
    dueAt: "2026-05-31T23:59:59+09:00",
  },
  {
    id: "iv_4",
    number: "INV-2026-0051",
    agencyId: "ag_6",
    agencyName: "未払い停止中アカウント",
    periodMonth: "2026-04",
    amountJpy: 9800,
    status: "overdue",
    issuedAt: "2026-04-01T00:00:00+09:00",
    dueAt: "2026-04-15T23:59:59+09:00",
  },
  {
    id: "iv_5",
    number: "INV-2026-0052",
    agencyId: "ag_7",
    agencyName: "Pro 大口顧客 C",
    periodMonth: "2026-05",
    amountJpy: 29800,
    status: "paid",
    issuedAt: "2026-05-01T00:00:00+09:00",
    dueAt: "2026-05-15T23:59:59+09:00",
    paidAt: "2026-05-04T14:20:00+09:00",
  },
  {
    id: "iv_6",
    number: "INV-2026-0053",
    agencyId: "ag_1",
    agencyName: "サンクチュアリ株式会社",
    periodMonth: "2026-06",
    amountJpy: 29800,
    status: "draft",
    issuedAt: "2026-05-25T00:00:00+09:00",
    dueAt: "2026-06-15T23:59:59+09:00",
  },
];

// ============================================================
// お知らせ
// ============================================================

export type AnnouncementSeverity = "info" | "warning" | "critical";
export type AnnouncementTarget = "all" | "plan" | "agency";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  severity: AnnouncementSeverity;
  target: AnnouncementTarget;
  targetPlan?: PlanTier;
  targetAgencyId?: string;
  publishedAt: string;
  viewCount: number;
};

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "an_1",
    title: "メンテナンスのお知らせ（5/30 深夜）",
    body: "5月30日 02:00〜04:00 にデータベース更新のため一時的に管理画面が利用できなくなります。",
    severity: "warning",
    target: "all",
    publishedAt: "2026-05-24T18:00:00+09:00",
    viewCount: 248,
  },
  {
    id: "an_2",
    title: "ステップ配信の遅延障害について",
    body: "5/22 一部時間帯でステップ配信に遅延が発生していました。現在は復旧済みです。",
    severity: "critical",
    target: "all",
    publishedAt: "2026-05-22T20:30:00+09:00",
    viewCount: 312,
  },
  {
    id: "an_3",
    title: "Pro プラン向け新機能ベータ募集",
    body: "リッチメニュー一括編集機能のベータテスターを募集します。",
    severity: "info",
    target: "plan",
    targetPlan: "pro",
    publishedAt: "2026-05-18T10:00:00+09:00",
    viewCount: 41,
  },
  {
    id: "an_4",
    title: "ご契約 1 周年のお礼",
    body: "ご利用 1 周年ありがとうございます。",
    severity: "info",
    target: "agency",
    targetAgencyId: "ag_1",
    publishedAt: "2026-05-15T10:00:00+09:00",
    viewCount: 3,
  },
];

// ============================================================
// サポートチケット
// ============================================================

export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high";

export type Ticket = {
  id: string;
  number: string;
  agencyId: string;
  agencyName: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  lastMessagePreview: string;
  lastMessageAt: string;
  assigneeName?: string;
};

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "tk_1",
    number: "SUP-0148",
    agencyId: "ag_3",
    agencyName: "ワンステップスタジオ",
    subject: "ステップ配信が予定時刻に届かない",
    status: "open",
    priority: "high",
    lastMessagePreview: "昨日 18:00 設定の配信が翌朝になってから届きました…",
    lastMessageAt: "2026-05-25T09:12:00+09:00",
  },
  {
    id: "tk_2",
    number: "SUP-0147",
    agencyId: "ag_2",
    agencyName: "美波コンサルティング",
    subject: "請求書の宛名を変更したい",
    status: "in_progress",
    priority: "medium",
    lastMessagePreview: "請求書の宛名を法人名から代表者名に変更お願いします。",
    lastMessageAt: "2026-05-24T15:20:00+09:00",
    assigneeName: "サポート 山田",
  },
  {
    id: "tk_3",
    number: "SUP-0146",
    agencyId: "ag_4",
    agencyName: "Hana 整体院",
    subject: "Free から Standard へのアップグレード方法",
    status: "open",
    priority: "low",
    lastMessagePreview: "Standard プランへ変更する場合、いつから料金が発生しますか?",
    lastMessageAt: "2026-05-23T11:30:00+09:00",
  },
  {
    id: "tk_4",
    number: "SUP-0145",
    agencyId: "ag_7",
    agencyName: "Pro 大口顧客 C",
    subject: "API キーの追加発行希望",
    status: "resolved",
    priority: "medium",
    lastMessagePreview: "対応完了しました。新キーをメールでお送りしています。",
    lastMessageAt: "2026-05-22T16:00:00+09:00",
    assigneeName: "サポート 鈴木",
  },
];

// ============================================================
// 監査ログ
// ============================================================

export type AuditLog = {
  id: string;
  actorName: string;
  action: string;
  target: string;
  timestamp: string;
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "al_1",
    actorName: "Platform Owner",
    action: "代理店を停止",
    target: "未払い停止中アカウント (ag_6)",
    timestamp: "2026-05-23T14:30:00+09:00",
  },
  {
    id: "al_2",
    actorName: "サポート 山田",
    action: "請求書を再発行",
    target: "INV-2026-0049",
    timestamp: "2026-05-22T11:00:00+09:00",
  },
  {
    id: "al_3",
    actorName: "Platform Owner",
    action: "プランを編集",
    target: "Standard プラン",
    timestamp: "2026-05-20T09:45:00+09:00",
  },
  {
    id: "al_4",
    actorName: "サポート 鈴木",
    action: "API キーを発行",
    target: "Pro 大口顧客 C (ag_7)",
    timestamp: "2026-05-22T16:00:00+09:00",
  },
];

// ============================================================
// 運営メンバー
// ============================================================

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "support";
  joinedAt: string;
  lastActiveAt: string;
};

export const MOCK_ADMIN_MEMBERS: AdminMember[] = [
  {
    id: "am_1",
    name: "Platform Owner",
    email: "ops@ichigo-step.com",
    role: "owner",
    joinedAt: "2025-06-01",
    lastActiveAt: "2026-05-25T13:00:00+09:00",
  },
  {
    id: "am_2",
    name: "サポート 山田",
    email: "yamada@ichigo-step.com",
    role: "support",
    joinedAt: "2025-09-01",
    lastActiveAt: "2026-05-25T11:00:00+09:00",
  },
  {
    id: "am_3",
    name: "サポート 鈴木",
    email: "suzuki@ichigo-step.com",
    role: "support",
    joinedAt: "2026-02-15",
    lastActiveAt: "2026-05-24T18:00:00+09:00",
  },
  {
    id: "am_4",
    name: "管理 田中",
    email: "tanaka@ichigo-step.com",
    role: "admin",
    joinedAt: "2025-12-01",
    lastActiveAt: "2026-05-25T10:00:00+09:00",
  },
];

// ============================================================
// ヘルパ
// ============================================================

export function getPlanByTier(tier: PlanTier): Plan | undefined {
  return MOCK_PLANS.find((p) => p.tier === tier);
}

export function getAgencyById(id?: string): Agency | undefined {
  if (!id) return undefined;
  return MOCK_AGENCIES.find((a) => a.id === id);
}
