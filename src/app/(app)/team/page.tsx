import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { POLICY_LABELS, POLICY_ORDER } from "@/lib/ledger";
import { TeamCharts } from "./TeamCharts";

export const metadata: Metadata = {
  title: "チーム集計 | 業務棚卸し台帳",
};

export default async function TeamPage() {
  await requireUser();

  const [byPolicy, byUser, users, taskCount] = await Promise.all([
    prisma.businessTask.groupBy({
      by: ["policy"],
      _sum: { currentHours: true, plannedHours: true },
    }),
    prisma.businessTask.groupBy({
      by: ["userId"],
      _sum: { currentHours: true, plannedHours: true },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.businessTask.count(),
  ]);

  const policyData = POLICY_ORDER.map((policy) => {
    const entry = byPolicy.find((p) => p.policy === policy);
    return {
      policy,
      label: POLICY_LABELS[policy],
      current: entry?._sum.currentHours ?? 0,
      planned: entry?._sum.plannedHours ?? 0,
    };
  });

  const memberData = users
    .map((user) => {
      const entry = byUser.find((u) => u.userId === user.id);
      return {
        userId: user.id,
        name: user.name,
        current: entry?._sum.currentHours ?? 0,
        planned: entry?._sum.plannedHours ?? 0,
      };
    })
    .filter((m) => m.current > 0 || m.planned > 0)
    .sort((a, b) => b.current - a.current);

  const currentTotal = policyData.reduce((sum, p) => sum + p.current, 0);
  const plannedTotal = policyData.reduce((sum, p) => sum + p.planned, 0);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-navy">チーム集計</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="登録業務数" value={`${taskCount}件`} />
        <StatCard label="対象メンバー" value={`${memberData.length}名`} />
        <StatCard label="現状工数計" value={`${round1(currentTotal)}h`} />
        <StatCard
          label="適用後工数計"
          value={`${round1(plannedTotal)}h`}
          accent={plannedTotal < currentTotal ? "down" : plannedTotal > currentTotal ? "up" : undefined}
        />
      </div>

      <TeamCharts policyData={policyData} memberData={memberData} />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "up" | "down";
}) {
  return (
    <div className="ledger-card rounded-sm p-5">
      <p className="text-xs font-medium tracking-wide text-navy/60">{label}</p>
      <p
        className={`mt-2 font-serif text-2xl font-bold ${
          accent === "down" ? "text-emerald-700" : accent === "up" ? "text-rose-700" : "text-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
