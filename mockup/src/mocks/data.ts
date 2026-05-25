export type MockChannel = {
  id: string;
  name: string;
  basicId: string;
  pictureUrl?: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
};

export type MockTag = {
  id: string;
  name: string;
  color: string; // tailwind-ish hex
};

export type MockFriend = {
  id: string;
  channelId: string;
  displayName: string;
  pictureUrl?: string;
  isFollowing: boolean;
  followedAt: string;
  source: string; // 流入経路
  tagIds: string[];
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
  scenarioId?: string;
  scenarioStepLabel?: string;
};

export type MockMessageType = "text" | "image" | "flex" | "sticker";

export type MockMessage = {
  id: string;
  friendId: string;
  direction: "incoming" | "outgoing";
  type: MockMessageType;
  content: string; // text body or image url or label
  timestamp: string;
  source?: "user" | "broadcast" | "scenario" | "manual";
};

export type MockBroadcast = {
  id: string;
  title: string;
  messageType: MockMessageType;
  preview: string;
  targetType: "all" | "tag";
  targetTagId?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  totalCount: number;
  successCount: number;
};

export type MockScenarioStep = {
  id: string;
  order: number;
  delayMinutes: number;
  messageType: MockMessageType;
  preview: string;
};

export type MockScenario = {
  id: string;
  name: string;
  description?: string;
  triggerType: "friend_add" | "tag_added" | "manual";
  triggerTagId?: string;
  isActive: boolean;
  enrolledCount: number;
  steps: MockScenarioStep[];
};

export const MOCK_CHANNELS: MockChannel[] = [
  { id: "ch_1", name: "ichigo-step 公式LINE", basicId: "@ichigo-step" },
  { id: "ch_2", name: "サブアカウント (テスト)", basicId: "@ichigo-step-test" },
];

export const MOCK_CURRENT_USER: MockUser = {
  id: "u_1",
  name: "Ryu Ichigo",
  email: "ryu.ichigo20250310@gmail.com",
};

export const MOCK_TAGS: MockTag[] = [
  { id: "tag_vip", name: "VIP", color: "#f59e0b" },
  { id: "tag_lead", name: "見込み客", color: "#10b981" },
  { id: "tag_customer", name: "既存顧客", color: "#3b82f6" },
  { id: "tag_event", name: "イベント参加", color: "#8b5cf6" },
  { id: "tag_cold", name: "休眠", color: "#94a3b8" },
];

export const MOCK_FRIENDS: MockFriend[] = [
  {
    id: "f_1",
    channelId: "ch_1",
    displayName: "佐竹 輝夫",
    isFollowing: true,
    followedAt: "2026-05-12T10:00:00+09:00",
    source: "QR広告A",
    tagIds: ["tag_vip", "tag_customer"],
    lastMessagePreview: "ありがとうございます！助かりました。",
    lastMessageAt: "2026-05-25T08:32:00+09:00",
    unreadCount: 0,
  },
  {
    id: "f_2",
    channelId: "ch_1",
    displayName: "あみ",
    isFollowing: true,
    followedAt: "2026-05-21T22:04:00+09:00",
    source: "通常友だち追加",
    tagIds: ["tag_lead"],
    lastMessagePreview: "30秒アンケートで無料プレゼント!!",
    lastMessageAt: "2026-05-21T22:04:00+09:00",
    unreadCount: 2,
    scenarioId: "sc_welcome",
    scenarioStepLabel: "Welcome Step 2/4",
  },
  {
    id: "f_3",
    channelId: "ch_1",
    displayName: "NANA",
    isFollowing: true,
    followedAt: "2026-05-21T15:00:00+09:00",
    source: "LP A",
    tagIds: ["tag_event"],
    lastMessagePreview: "SHINさん🍀 アンケート完了しました！",
    lastMessageAt: "2026-05-21T15:00:00+09:00",
    unreadCount: 0,
  },
  {
    id: "f_4",
    channelId: "ch_1",
    displayName: "よし",
    isFollowing: true,
    followedAt: "2026-05-20T09:00:00+09:00",
    source: "Instagram",
    tagIds: ["tag_lead", "tag_event"],
    lastMessagePreview: "美波に相談したい🌸",
    lastMessageAt: "2026-05-20T20:11:00+09:00",
    unreadCount: 1,
  },
  {
    id: "f_5",
    channelId: "ch_1",
    displayName: "Rio",
    isFollowing: true,
    followedAt: "2026-05-19T11:30:00+09:00",
    source: "ワンステップスタジオ流入",
    tagIds: ["tag_customer"],
    lastMessagePreview: "ワンステップスタジオの件…",
    lastMessageAt: "2026-05-20T17:50:00+09:00",
    unreadCount: 0,
  },
  {
    id: "f_6",
    channelId: "ch_1",
    displayName: "強",
    isFollowing: true,
    followedAt: "2026-05-20T07:00:00+09:00",
    source: "QR広告B",
    tagIds: ["tag_lead"],
    lastMessagePreview: "強さん🍀 アンケート…",
    lastMessageAt: "2026-05-20T19:00:00+09:00",
    unreadCount: 3,
  },
  {
    id: "f_7",
    channelId: "ch_1",
    displayName: "イルゴ",
    isFollowing: true,
    followedAt: "2026-05-18T13:00:00+09:00",
    source: "YouTube概要欄",
    tagIds: ["tag_cold"],
    lastMessagePreview: "また連絡します。",
    lastMessageAt: "2026-05-18T14:00:00+09:00",
    unreadCount: 1,
  },
  {
    id: "f_8",
    channelId: "ch_1",
    displayName: "Maki",
    isFollowing: false,
    followedAt: "2026-04-10T09:00:00+09:00",
    source: "Twitter",
    tagIds: ["tag_cold"],
    lastMessagePreview: "(ブロック済み)",
    lastMessageAt: "2026-05-01T10:00:00+09:00",
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES: MockMessage[] = [
  // f_2 あみ のチャット
  {
    id: "m_1",
    friendId: "f_2",
    direction: "outgoing",
    type: "text",
    content:
      "皆さまとの会話や\nここだけで話せる情報共有を\n\n個別にしてきたいと思っています🌸\n\n私のプライベートや\n日常的な配信もたまにしているので\n\nぜひあみさんのお話も\n気軽に聞かせて下さい(｡ơᴗơ｡)\n\nこれからよろしくお願いしますね🍀",
    timestamp: "2026-05-21T22:05:00+09:00",
    source: "scenario",
  },
  {
    id: "m_2",
    friendId: "f_2",
    direction: "outgoing",
    type: "image",
    content: "30秒アンケートで無料プレゼント!!",
    timestamp: "2026-05-21T22:06:00+09:00",
    source: "scenario",
  },
  {
    id: "m_3",
    friendId: "f_2",
    direction: "outgoing",
    type: "text",
    content:
      "無料特典を受け取るための\n30秒アンケートはこちらです🌸\n↓↓↓\nhttps://liff.line.me/2009495547-lwGYs2Hw?unique_key=2Tyck8t-177374\n\n回答後すぐに\n特典が受け取れます🌸",
    timestamp: "2026-05-21T22:07:00+09:00",
    source: "scenario",
  },
  {
    id: "m_4",
    friendId: "f_2",
    direction: "incoming",
    type: "text",
    content: "ありがとうございます！受け取ります🍀",
    timestamp: "2026-05-21T22:15:00+09:00",
  },
  // f_1 佐竹 輝夫 のチャット
  {
    id: "m_5",
    friendId: "f_1",
    direction: "incoming",
    type: "text",
    content: "先日はありがとうございました。",
    timestamp: "2026-05-25T08:30:00+09:00",
  },
  {
    id: "m_6",
    friendId: "f_1",
    direction: "outgoing",
    type: "text",
    content: "こちらこそ、お力になれて何よりです！",
    timestamp: "2026-05-25T08:31:00+09:00",
    source: "manual",
  },
  {
    id: "m_7",
    friendId: "f_1",
    direction: "incoming",
    type: "text",
    content: "ありがとうございます！助かりました。",
    timestamp: "2026-05-25T08:32:00+09:00",
  },
];

export const MOCK_BROADCASTS: MockBroadcast[] = [
  {
    id: "b_1",
    title: "5月末セールのお知らせ",
    messageType: "text",
    preview: "本日23:59まで限定30%OFF！",
    targetType: "all",
    status: "sent",
    sentAt: "2026-05-25T10:00:00+09:00",
    totalCount: 1248,
    successCount: 1240,
  },
  {
    id: "b_2",
    title: "VIP向け新商品案内",
    messageType: "flex",
    preview: "[Flex] 新商品 - VIP先行",
    targetType: "tag",
    targetTagId: "tag_vip",
    status: "scheduled",
    scheduledAt: "2026-05-26T09:00:00+09:00",
    totalCount: 56,
    successCount: 0,
  },
  {
    id: "b_3",
    title: "アンケートご協力のお願い",
    messageType: "text",
    preview: "30秒で完了するアンケートに...",
    targetType: "tag",
    targetTagId: "tag_lead",
    status: "draft",
    totalCount: 0,
    successCount: 0,
  },
  {
    id: "b_4",
    title: "イベント直前リマインダー",
    messageType: "text",
    preview: "明日13:00開始です",
    targetType: "tag",
    targetTagId: "tag_event",
    status: "sent",
    sentAt: "2026-05-22T18:00:00+09:00",
    totalCount: 142,
    successCount: 141,
  },
  {
    id: "b_5",
    title: "送信失敗テスト",
    messageType: "image",
    preview: "[Image] キャンペーンバナー",
    targetType: "all",
    status: "failed",
    sentAt: "2026-05-20T12:00:00+09:00",
    totalCount: 1200,
    successCount: 230,
  },
];

export const MOCK_SCENARIOS: MockScenario[] = [
  {
    id: "sc_welcome",
    name: "新規友だちウェルカム",
    description: "友だち追加から4日間で計4通の自動配信",
    triggerType: "friend_add",
    isActive: true,
    enrolledCount: 312,
    steps: [
      {
        id: "ss_1",
        order: 1,
        delayMinutes: 0,
        messageType: "text",
        preview: "ご登録ありがとうございます！自己紹介です…",
      },
      {
        id: "ss_2",
        order: 2,
        delayMinutes: 60,
        messageType: "image",
        preview: "[Image] 30秒アンケート特典",
      },
      {
        id: "ss_3",
        order: 3,
        delayMinutes: 1440,
        messageType: "text",
        preview: "24時間後フォローアップメッセージ",
      },
      {
        id: "ss_4",
        order: 4,
        delayMinutes: 4320,
        messageType: "flex",
        preview: "[Flex] 3日後オファー",
      },
    ],
  },
  {
    id: "sc_event",
    name: "イベント参加者向けフォロー",
    description: "イベント参加タグが付いたら開始",
    triggerType: "tag_added",
    triggerTagId: "tag_event",
    isActive: true,
    enrolledCount: 84,
    steps: [
      {
        id: "se_1",
        order: 1,
        delayMinutes: 0,
        messageType: "text",
        preview: "イベントへの参加表明ありがとうございます",
      },
      {
        id: "se_2",
        order: 2,
        delayMinutes: 60 * 24,
        messageType: "text",
        preview: "明日の持ち物リスト",
      },
    ],
  },
  {
    id: "sc_vip",
    name: "VIP昇格 オンボーディング",
    description: "VIP タグが付与されたお客様向け",
    triggerType: "tag_added",
    triggerTagId: "tag_vip",
    isActive: false,
    enrolledCount: 0,
    steps: [
      {
        id: "sv_1",
        order: 1,
        delayMinutes: 0,
        messageType: "flex",
        preview: "[Flex] VIP特典のご案内",
      },
    ],
  },
];

// ---- 拡張モック（L Message 風サイドバー追加機能） ----

export type MockTemplate = {
  id: string;
  name: string;
  category: "あいさつ" | "案内" | "フォロー" | "その他";
  messageType: MockMessageType;
  preview: string;
  lastUsedAt?: string;
  useCount: number;
};

export type MockRichMenu = {
  id: string;
  name: string;
  layout: "6grid" | "3vertical" | "4square";
  isPublished: boolean;
  publishedAt?: string;
  channelId: string;
  tapAreas: { label: string; action: string }[];
};

export type MockForm = {
  id: string;
  title: string;
  questionCount: number;
  responseCount: number;
  status: "draft" | "published" | "closed";
  createdAt: string;
};

export type MockAutoReply = {
  id: string;
  triggerType: "keyword" | "follow" | "default";
  trigger: string; // キーワード文字列 or "(友だち追加時)" 等
  replyPreview: string;
  hitCount: number;
  isActive: boolean;
};

export type MockQrAction = {
  id: string;
  name: string;
  purpose: string;
  action: "add_tag" | "start_scenario" | "track_source";
  actionLabel: string;
  scanCount: number;
  createdAt: string;
};

export type MockGreeting = {
  isActive: boolean;
  messageType: MockMessageType;
  content: string;
};

export const MOCK_TEMPLATES: MockTemplate[] = [
  {
    id: "tpl_1",
    name: "新規友だちあいさつ",
    category: "あいさつ",
    messageType: "text",
    preview: "ご登録ありがとうございます！🍀 こちらでは…",
    lastUsedAt: "2026-05-24T10:00:00+09:00",
    useCount: 312,
  },
  {
    id: "tpl_2",
    name: "セール告知（汎用）",
    category: "案内",
    messageType: "text",
    preview: "本日23:59まで限定30%OFFセール！…",
    lastUsedAt: "2026-05-25T10:00:00+09:00",
    useCount: 14,
  },
  {
    id: "tpl_3",
    name: "アンケートご協力のお願い",
    category: "案内",
    messageType: "text",
    preview: "30秒で完了する簡単なアンケートに…",
    lastUsedAt: "2026-05-22T14:00:00+09:00",
    useCount: 7,
  },
  {
    id: "tpl_4",
    name: "VIP先行案内（Flex）",
    category: "案内",
    messageType: "flex",
    preview: "[Flex] VIP限定 新商品先行ご案内",
    lastUsedAt: "2026-05-18T09:00:00+09:00",
    useCount: 5,
  },
  {
    id: "tpl_5",
    name: "1週間フォローアップ",
    category: "フォロー",
    messageType: "text",
    preview: "ご登録から1週間が経ちました。お困り事は…",
    useCount: 0,
  },
];

export const MOCK_RICH_MENUS: MockRichMenu[] = [
  {
    id: "rm_1",
    name: "メイン（6分割）",
    layout: "6grid",
    isPublished: true,
    publishedAt: "2026-05-01T09:00:00+09:00",
    channelId: "ch_1",
    tapAreas: [
      { label: "予約する", action: "URL: /booking" },
      { label: "メニュー", action: "URL: /menu" },
      { label: "店舗一覧", action: "URL: /shops" },
      { label: "クーポン", action: "メッセージ送信: クーポン" },
      { label: "お問い合わせ", action: "メッセージ送信: 問い合わせ" },
      { label: "Instagram", action: "URL: instagram.com" },
    ],
  },
  {
    id: "rm_2",
    name: "イベント期間限定",
    layout: "3vertical",
    isPublished: false,
    channelId: "ch_1",
    tapAreas: [
      { label: "イベント詳細", action: "URL: /event" },
      { label: "参加申込", action: "URL: /event/apply" },
      { label: "アクセス", action: "URL: /access" },
    ],
  },
  {
    id: "rm_3",
    name: "ショップ動線（4分割）",
    layout: "4square",
    isPublished: false,
    channelId: "ch_2",
    tapAreas: [
      { label: "新商品", action: "URL: /new" },
      { label: "ランキング", action: "URL: /ranking" },
      { label: "セール", action: "URL: /sale" },
      { label: "サポート", action: "メッセージ送信: サポート" },
    ],
  },
];

export const MOCK_FORMS: MockForm[] = [
  {
    id: "fm_1",
    title: "30秒アンケート（新規友だち用）",
    questionCount: 5,
    responseCount: 248,
    status: "published",
    createdAt: "2026-04-15T10:00:00+09:00",
  },
  {
    id: "fm_2",
    title: "イベント参加申込フォーム",
    questionCount: 8,
    responseCount: 142,
    status: "published",
    createdAt: "2026-05-01T09:00:00+09:00",
  },
  {
    id: "fm_3",
    title: "VIP向け事前ヒアリング",
    questionCount: 12,
    responseCount: 56,
    status: "closed",
    createdAt: "2026-03-20T11:00:00+09:00",
  },
  {
    id: "fm_4",
    title: "新サービス満足度調査",
    questionCount: 7,
    responseCount: 0,
    status: "draft",
    createdAt: "2026-05-24T16:00:00+09:00",
  },
];

export const MOCK_AUTO_REPLIES: MockAutoReply[] = [
  {
    id: "ar_1",
    triggerType: "keyword",
    trigger: "クーポン",
    replyPreview: "クーポンコードは『ICHIGO10』です。次回ご来店時にお使いください🍀",
    hitCount: 84,
    isActive: true,
  },
  {
    id: "ar_2",
    triggerType: "keyword",
    trigger: "予約 / 予約したい / ブッキング",
    replyPreview: "ご予約はこちらのリンクからお願いします → https://...",
    hitCount: 156,
    isActive: true,
  },
  {
    id: "ar_3",
    triggerType: "keyword",
    trigger: "営業時間",
    replyPreview: "平日 10:00-19:00 / 土日祝 10:00-18:00",
    hitCount: 42,
    isActive: true,
  },
  {
    id: "ar_4",
    triggerType: "follow",
    trigger: "(友だち追加時)",
    replyPreview: "はじめまして！ご登録ありがとうございます🌸",
    hitCount: 312,
    isActive: true,
  },
  {
    id: "ar_5",
    triggerType: "default",
    trigger: "(マッチなし時)",
    replyPreview: "メッセージありがとうございます。担当者より追ってご連絡いたします。",
    hitCount: 23,
    isActive: false,
  },
];

export const MOCK_QR_ACTIONS: MockQrAction[] = [
  {
    id: "qr_1",
    name: "QR広告A（駅前掲示）",
    purpose: "オフライン広告からの流入計測",
    action: "add_tag",
    actionLabel: "タグ付与: 見込み客",
    scanCount: 87,
    createdAt: "2026-04-10T10:00:00+09:00",
  },
  {
    id: "qr_2",
    name: "イベント受付QR",
    purpose: "イベント来場者に配布",
    action: "start_scenario",
    actionLabel: "シナリオ開始: イベント参加者フォロー",
    scanCount: 142,
    createdAt: "2026-05-01T09:00:00+09:00",
  },
  {
    id: "qr_3",
    name: "ショップカードQR",
    purpose: "店内に常設",
    action: "track_source",
    actionLabel: "流入経路記録: ショップカード",
    scanCount: 56,
    createdAt: "2026-03-01T10:00:00+09:00",
  },
  {
    id: "qr_4",
    name: "Instagramプロフィール",
    purpose: "Instagram bio から誘導",
    action: "add_tag",
    actionLabel: "タグ付与: Instagram流入",
    scanCount: 234,
    createdAt: "2026-04-20T10:00:00+09:00",
  },
];

export const MOCK_GREETING: MockGreeting = {
  isActive: true,
  messageType: "text",
  content:
    "はじめまして！ご登録ありがとうございます🌸\n\nこのアカウントでは\n・お得なキャンペーン\n・新商品のお知らせ\n・限定クーポン\n\nなどをお届けしていきます🍀\n\nまずは下のメニューから\nお気軽にお問い合わせください！",
};

export function getFriend(id: string): MockFriend | undefined {
  return MOCK_FRIENDS.find((f) => f.id === id);
}

export function getTag(id: string): MockTag | undefined {
  return MOCK_TAGS.find((t) => t.id === id);
}

export function getMessagesByFriend(friendId: string): MockMessage[] {
  return MOCK_MESSAGES.filter((m) => m.friendId === friendId).sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
}

export function getScenarioById(id?: string): MockScenario | undefined {
  if (!id) return undefined;
  return MOCK_SCENARIOS.find((s) => s.id === id);
}
