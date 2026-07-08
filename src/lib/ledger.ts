import { Policy, Frequency } from "@/generated/prisma/enums";

export const POLICY_ORDER: Policy[] = [
  Policy.NEW,
  Policy.STRENGTHEN,
  Policy.MAINTAIN,
  Policy.REDUCE,
  Policy.DELEGATE,
  Policy.ABOLISH,
];

export const POLICY_LABELS: Record<Policy, string> = {
  NEW: "新規",
  STRENGTHEN: "強化",
  MAINTAIN: "維持",
  REDUCE: "削減",
  DELEGATE: "委譲",
  ABOLISH: "廃止",
};

// 台帳の朱書き風に、方針ごとに色分けしたバッジ用クラス
export const POLICY_BADGE_CLASSES: Record<Policy, string> = {
  NEW: "bg-sky-50 text-sky-800 border-sky-300",
  STRENGTHEN: "bg-emerald-50 text-emerald-800 border-emerald-300",
  MAINTAIN: "bg-slate-100 text-slate-700 border-slate-300",
  REDUCE: "bg-amber-50 text-amber-800 border-amber-300",
  DELEGATE: "bg-violet-50 text-violet-800 border-violet-300",
  ABOLISH: "bg-rose-50 text-rose-800 border-rose-300",
};

// グラフ等で使う塗り色 (Before/After棒グラフの凡例にも利用)
export const POLICY_CHART_COLORS: Record<Policy, string> = {
  NEW: "#0284c7",
  STRENGTHEN: "#059669",
  MAINTAIN: "#64748b",
  REDUCE: "#d97706",
  DELEGATE: "#7c3aed",
  ABOLISH: "#e11d48",
};

export const FREQUENCY_ORDER: Frequency[] = [
  Frequency.DAILY,
  Frequency.WEEKLY,
  Frequency.MONTHLY,
  Frequency.QUARTERLY,
  Frequency.YEARLY,
  Frequency.IRREGULAR,
];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "毎日",
  WEEKLY: "毎週",
  MONTHLY: "毎月",
  QUARTERLY: "四半期",
  YEARLY: "毎年",
  IRREGULAR: "不定期",
};

export type PlannedHoursSuggestion = {
  /** 提案値。nullの場合は手入力のまま変更しない */
  value: number | null;
  /** 現状工数の入力欄を固定するか (新規は0固定) */
  lockCurrentHoursAtZero: boolean;
  /** 想定工数の入力欄を固定するか (廃止は0固定) */
  lockPlannedHoursAtZero: boolean;
};

/**
 * 方針選択時に想定工数の初期値を提案する。
 * - 新規: 現状0h固定、適用後は手入力
 * - 廃止: 適用後0h固定
 * - 削減: 現状の60%を初期提案
 * - 委譲: 現状の10%を初期提案
 * - 維持・強化: 現状と同値を初期提案 (手動調整可)
 */
export function suggestPlannedHours(
  policy: Policy,
  currentHours: number
): PlannedHoursSuggestion {
  switch (policy) {
    case Policy.NEW:
      return { value: null, lockCurrentHoursAtZero: true, lockPlannedHoursAtZero: false };
    case Policy.ABOLISH:
      return { value: 0, lockCurrentHoursAtZero: false, lockPlannedHoursAtZero: true };
    case Policy.REDUCE:
      return {
        value: round1(currentHours * 0.6),
        lockCurrentHoursAtZero: false,
        lockPlannedHoursAtZero: false,
      };
    case Policy.DELEGATE:
      return {
        value: round1(currentHours * 0.1),
        lockCurrentHoursAtZero: false,
        lockPlannedHoursAtZero: false,
      };
    case Policy.MAINTAIN:
    case Policy.STRENGTHEN:
      return {
        value: currentHours,
        lockCurrentHoursAtZero: false,
        lockPlannedHoursAtZero: false,
      };
    default:
      return { value: null, lockCurrentHoursAtZero: false, lockPlannedHoursAtZero: false };
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
