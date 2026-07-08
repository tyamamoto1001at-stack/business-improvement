import type { Policy } from "@/generated/prisma/enums";
import { POLICY_BADGE_CLASSES, POLICY_LABELS } from "@/lib/ledger";

export function PolicyBadge({ policy }: { policy: Policy }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${POLICY_BADGE_CLASSES[policy]}`}
    >
      {POLICY_LABELS[policy]}
    </span>
  );
}
