import { prisma } from "@/lib/prisma";
import {
  aggregateByMember,
  aggregateByPolicy,
  type TaskForAggregate,
} from "@/lib/team-aggregate";
import {
  MemberBeforeAfterChart,
  PolicyBeforeAfterChart,
} from "@/components/team-charts";
import { SummaryCard } from "@/components/summary-card";
import { formatHours } from "@/lib/format";

export default async function TeamPage() {
  const tasks = await prisma.businessTask.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const aggregateInput: TaskForAggregate[] = tasks.map((t) => ({
    policy: t.policy,
    currentHours: t.currentHours,
    afterHours: t.afterHours,
    userId: t.userId,
    userName: t.user.name,
  }));

  const policyData = aggregateByPolicy(aggregateInput);
  const memberData = aggregateByMember(aggregateInput);

  const currentTotal = tasks.reduce((sum, t) => sum + t.currentHours, 0);
  const afterTotal = tasks.reduce((sum, t) => sum + t.afterHours, 0);
  const diff = currentTotal - afterTotal;
  const diffPercent = currentTotal === 0 ? 0 : (diff / currentTotal) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs tracking-widest text-gold-600">TEAM LEDGER</p>
        <h1 className="font-ledger text-2xl font-bold text-navy-900">
          チーム集計
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          全メンバーの業務データを横断集計し、方針・メンバー別の工数インパクトを確認します。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SummaryCard label="登録業務数" value={`${tasks.length}件`} />
        <SummaryCard label="現状工数計" value={formatHours(currentTotal)} />
        <SummaryCard label="適用後工数計" value={formatHours(afterTotal)} />
        <SummaryCard
          label={diff >= 0 ? "削減見込み" : "増加見込み"}
          value={`${formatHours(Math.abs(diff))} (${Math.abs(diffPercent).toFixed(0)}%)`}
          accent={diff >= 0 ? "positive" : "negative"}
        />
      </div>

      <section className="ledger-card rounded-lg p-4 sm:p-6">
        <h2 className="font-ledger text-lg font-bold text-navy-900">
          方針別 Before / After
        </h2>
        <p className="mt-1 text-xs text-foreground/50">
          方針ごとの現状工数と適用後工数の合計を比較します。
        </p>
        <div className="mt-4">
          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <PolicyBeforeAfterChart data={policyData} />
          )}
        </div>
      </section>

      <section className="ledger-card rounded-lg p-4 sm:p-6">
        <h2 className="font-ledger text-lg font-bold text-navy-900">
          メンバー別 Before / After
        </h2>
        <p className="mt-1 text-xs text-foreground/50">
          メンバーごとの現状工数と適用後工数の合計を比較します。
        </p>
        <div className="mt-4">
          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <MemberBeforeAfterChart data={memberData} />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <p className="py-12 text-center text-sm text-foreground/50">
      まだ業務が登録されていません。
    </p>
  );
}
