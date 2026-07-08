import { Policy } from "@/generated/prisma/client";
import { POLICY_BADGE_CLASS, POLICY_DOT_CLASS, POLICY_LABELS } from "@/lib/constants";
import clsx from "clsx";

export function PolicyBadge({ policy, className }: { policy: Policy; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        POLICY_BADGE_CLASS[policy],
        className,
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", POLICY_DOT_CLASS[policy])} />
      {POLICY_LABELS[policy]}
    </span>
  );
}

export function RoleBadge({ role }: { role: "ADMIN" | "MEMBER" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        role === "ADMIN"
          ? "bg-navy-700 text-white border-navy-700"
          : "bg-navy-50 text-navy-700 border-navy-200",
      )}
    >
      {role === "ADMIN" ? "管理者" : "メンバー"}
    </span>
  );
}
