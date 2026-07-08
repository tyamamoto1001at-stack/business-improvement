import { Policy } from "@/generated/prisma/enums";

export const POLICY_ORDER: Policy[] = [
  "NEW",
  "STRENGTHEN",
  "MAINTAIN",
  "REDUCE",
  "DELEGATE",
  "ABOLISH",
];

export const POLICY_LABEL: Record<Policy, string> = {
  NEW: "新規",
  STRENGTHEN: "強化",
  MAINTAIN: "維持",
  REDUCE: "削減",
  DELEGATE: "委譲",
  ABOLISH: "廃止",
};

export const POLICY_BADGE_CLASS: Record<Policy, string> = {
  NEW: "bg-policy-new-bg text-policy-new border-policy-new-border",
  STRENGTHEN:
    "bg-policy-strengthen-bg text-policy-strengthen border-policy-strengthen-border",
  MAINTAIN:
    "bg-policy-maintain-bg text-policy-maintain border-policy-maintain-border",
  REDUCE: "bg-policy-reduce-bg text-policy-reduce border-policy-reduce-border",
  DELEGATE:
    "bg-policy-delegate-bg text-policy-delegate border-policy-delegate-border",
  ABOLISH:
    "bg-policy-abolish-bg text-policy-abolish border-policy-abolish-border",
};

export const POLICY_CHART_COLOR: Record<Policy, string> = {
  NEW: "#1d4e89",
  STRENGTHEN: "#1f6b3b",
  MAINTAIN: "#4b4b46",
  REDUCE: "#8a5a1f",
  DELEGATE: "#5b3b85",
  ABOLISH: "#8c2e2e",
};

/**
 * 方針選択時に「適用後の想定工数」の初期値を提案する。
 * - 新規: 現状は常に0h、適用後は手入力(nullを返し呼び出し側でフォーカス)
 * - 廃止: 適用後は常に0h
 * - 削減: 現状の60%
 * - 委譲: 現状の10%
 * - 維持・強化: 現状と同値
 */
export function suggestAfterHours(
  policy: Policy,
  currentHours: number,
): number | null {
  switch (policy) {
    case "NEW":
      return null;
    case "ABOLISH":
      return 0;
    case "REDUCE":
      return round1(currentHours * 0.6);
    case "DELEGATE":
      return round1(currentHours * 0.1);
    case "MAINTAIN":
    case "STRENGTHEN":
      return currentHours;
  }
}

/**
 * 方針が「新規」の場合、現状工数は常に0h固定になる。
 */
export function normalizeCurrentHours(
  policy: Policy,
  currentHours: number,
): number {
  return policy === "NEW" ? 0 : currentHours;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
