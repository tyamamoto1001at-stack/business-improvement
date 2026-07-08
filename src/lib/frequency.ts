import { Frequency } from "@/generated/prisma/enums";

export const FREQUENCY_ORDER: Frequency[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "IRREGULAR",
];

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  DAILY: "毎日",
  WEEKLY: "毎週",
  MONTHLY: "毎月",
  QUARTERLY: "四半期",
  YEARLY: "年次",
  IRREGULAR: "不定期",
};
