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
