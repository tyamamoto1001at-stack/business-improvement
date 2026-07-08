import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { SummaryCards } from "@/components/tasks/SummaryCards";
import { GroupedBarChart, type GroupedBarDatum } from "@/components/team/GroupedBarChart";
import { POLICY_LABELS, POLICY_ORDER } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function TeamPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tasks = await prisma.task.findMany({
    include: { user: true, category: true },
  });

  const currentTotal = tasks.reduce((sum, t) => sum + t.currentHours, 0);
  const afterTotal = tasks.reduce((sum, t) => sum + t.afterHours, 0);

  const byPolicy: GroupedBarDatum[] = POLICY_ORDER.map((policy) => {
    const rows = tasks.filter((t) => t.policy === policy);
    return {
      label: POLICY_LABELS[policy],
      現状: round1(rows.reduce((sum, t) => sum + t.currentHours, 0)),
      適用後: round1(rows.reduce((sum, t) => sum + t.afterHours, 0)),
    };
  });

  const memberMap = new Map<string, { name: string; current: number; after: number }>();
  for (const task of tasks) {
    const entry = memberMap.get(task.userId) ?? {
      name: task.user.name,
      current: 0,
      after: 0,
    };
    entry.current += task.currentHours;
    entry.after += task.afterHours;
    memberMap.set(task.userId, entry);
  }
  const byMember: GroupedBarDatum[] = Array.from(memberMap.values())
    .sort((a, b) => b.current - a.current)
    .map((m) => ({ label: m.name, 現状: round1(m.current), 適用後: round1(m.after) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-ledger text-xl font-bold text-navy-800">チーム集計</h1>
        <p className="text-sm text-navy-500">全メンバーの業務棚卸しを横断集計します。</p>
      </div>

      <SummaryCards currentTotal={currentTotal} afterTotal={afterTotal} />

      <Card>
        <CardHeader>
          <CardTitle>方針別 Before / After</CardTitle>
        </CardHeader>
        <CardBody>
          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <GroupedBarChart data={byPolicy} />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>メンバー別 Before / After</CardTitle>
        </CardHeader>
        <CardBody>
          {byMember.length === 0 ? (
            <EmptyState />
          ) : (
            <GroupedBarChart data={byMember} height={Math.max(320, byMember.length * 48)} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function EmptyState() {
  return (
    <p className="py-10 text-center text-sm text-navy-400">
      まだ業務データが登録されていません。
    </p>
  );
}
