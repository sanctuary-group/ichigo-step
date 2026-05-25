/**
 * 運営側ダッシュボード用の 30 日分時系列ダミーデータ。
 * 末尾 = 2026/05/25 想定。
 */

export type DailyPlatformPoint = {
  date: string; // YYYY-MM-DD
  newAgencies: number; // 新規代理店（利用者）
  totalMessages: number; // 全代理店合計の配信メッセージ数
  mrrJpy: number; // その日時点での MRR スナップショット
};

const SEED_NEW_AGENCIES = [
  1, 0, 2, 1, 3, 0, 1, 2, 1, 4, 2, 1, 0, 1, 2, 3, 1, 2, 0, 1, 1, 2, 1, 3, 2, 1,
  0, 1, 1, 0,
];
const SEED_TOTAL_MESSAGES = [
  5800, 4200, 7100, 8900, 7600, 4100, 3800, 6500, 8400, 11200, 9800, 6700, 5100,
  3900, 6300, 8800, 11400, 14200, 8900, 6500, 5200, 4400, 6100, 8500, 11800,
  15600, 11200, 8100, 6200, 5400,
];
const SEED_MRR = [
  1820000, 1820000, 1830000, 1830000, 1850000, 1850000, 1850000, 1860000,
  1860000, 1880000, 1890000, 1890000, 1890000, 1900000, 1910000, 1920000,
  1920000, 1930000, 1930000, 1940000, 1940000, 1950000, 1950000, 1970000,
  1980000, 1980000, 1980000, 1990000, 1990000, 2010000,
];

export const LAST_30_DAYS: DailyPlatformPoint[] = (() => {
  const today = new Date("2026-05-25T00:00:00+09:00");
  const days: DailyPlatformPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const idx = 29 - i;
    days.push({
      date: iso,
      newAgencies: SEED_NEW_AGENCIES[idx],
      totalMessages: SEED_TOTAL_MESSAGES[idx],
      mrrJpy: SEED_MRR[idx],
    });
  }
  return days;
})();

export type PlatformKpi = {
  label: string;
  value: number;
  unit?: string;
  diff?: number; // %
  isCurrency?: boolean;
};

const TOTAL_AGENCIES = 253;
const TOTAL_ACTIVE_AGENCIES = 234;
const TOTAL_CHANNELS = 412;
const CURRENT_MRR = 2010000;

export const PLATFORM_KPIS: PlatformKpi[] = [
  {
    label: "MRR",
    value: CURRENT_MRR,
    isCurrency: true,
    diff: +5.2,
  },
  {
    label: "総代理店",
    value: TOTAL_AGENCIES,
    diff: +6.8,
  },
  {
    label: "アクティブ代理店",
    value: TOTAL_ACTIVE_AGENCIES,
    diff: +6.1,
  },
  {
    label: "総 LINE channel",
    value: TOTAL_CHANNELS,
    diff: +9.4,
  },
  {
    label: "直近30日 配信総数",
    value: LAST_30_DAYS.reduce((s, d) => s + d.totalMessages, 0),
    unit: "通",
    diff: +14.3,
  },
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
