import { Frequency, Policy } from "@/generated/prisma/client";

export const POLICY_LABELS: Record<Policy, string> = {
  NEW: "新規",
  STRENGTHEN: "強化",
  MAINTAIN: "維持",
  REDUCE: "削減",
  DELEGATE: "委譲",
  ABOLISH: "廃止",
};

export const POLICY_ORDER: Policy[] = [
  "NEW",
  "STRENGTHEN",
  "MAINTAIN",
  "REDUCE",
  "DELEGATE",
  "ABOLISH",
];

// バッジの配色。ネイビー基調の台帳UIの上で判別しやすい配色にしている。
export const POLICY_BADGE_CLASS: Record<Policy, string> = {
  NEW: "bg-sky-100 text-sky-800 border-sky-300",
  STRENGTHEN: "bg-emerald-100 text-emerald-800 border-emerald-300",
  MAINTAIN: "bg-slate-100 text-slate-700 border-slate-300",
  REDUCE: "bg-amber-100 text-amber-800 border-amber-300",
  DELEGATE: "bg-violet-100 text-violet-800 border-violet-300",
  ABOLISH: "bg-rose-100 text-rose-800 border-rose-300",
};

export const POLICY_DOT_CLASS: Record<Policy, string> = {
  NEW: "bg-sky-500",
  STRENGTHEN: "bg-emerald-500",
  MAINTAIN: "bg-slate-500",
  REDUCE: "bg-amber-500",
  DELEGATE: "bg-violet-500",
  ABOLISH: "bg-rose-500",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "日次",
  WEEKLY: "週次",
  MONTHLY: "月次",
  QUARTERLY: "四半期",
  YEARLY: "年次",
  ADHOC: "随時",
};

export const FREQUENCY_ORDER: Frequency[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "ADHOC",
];

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

/** 方針を選んだ時に「現状の月間工数」欄をロックすべきか。ロックする場合は固定値も返す。 */
export function currentHoursConstraint(policy: Policy): { locked: boolean; value: number | null } {
  if (policy === "NEW") return { locked: true, value: 0 };
  return { locked: false, value: null };
}

/** 方針を選んだ時に「適用後の想定月間工数」欄の初期提案値とロック有無を返す。 */
export function suggestAfterHours(
  policy: Policy,
  currentHours: number,
): { locked: boolean; value: number } {
  switch (policy) {
    case "NEW":
      return { locked: false, value: 0 };
    case "ABOLISH":
      return { locked: true, value: 0 };
    case "REDUCE":
      return { locked: false, value: round1(currentHours * 0.6) };
    case "DELEGATE":
      return { locked: false, value: round1(currentHours * 0.1) };
    case "MAINTAIN":
    case "STRENGTHEN":
      return { locked: false, value: round1(currentHours) };
  }
}
