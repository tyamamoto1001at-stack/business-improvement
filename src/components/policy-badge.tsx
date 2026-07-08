import { POLICY_BADGE_CLASS, POLICY_LABEL } from "@/lib/policy";
import type { Policy } from "@/generated/prisma/enums";

export function PolicyBadge({ policy }: { policy: Policy }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold " +
        POLICY_BADGE_CLASS[policy]
      }
    >
      {POLICY_LABEL[policy]}
    </span>
  );
}
