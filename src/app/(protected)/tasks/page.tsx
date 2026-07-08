import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PolicyBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DeleteTaskButton } from "@/components/tasks/DeleteTaskButton";
import { SummaryCards } from "@/components/tasks/SummaryCards";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function TasksPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  const currentTotal = tasks.reduce((sum, t) => sum + t.currentHours, 0);
  const afterTotal = tasks.reduce((sum, t) => sum + t.afterHours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-ledger text-xl font-bold text-navy-800">個人ワーク</h1>
          <p className="text-sm text-navy-500">あなたが担当する業務の棚卸し一覧です。</p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-navy-700 bg-navy-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-600"
        >
          ＋ 業務を追加
        </Link>
      </div>

      <SummaryCards currentTotal={currentTotal} afterTotal={afterTotal} />

      <Card className="overflow-x-auto">
        {tasks.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-navy-400">
            登録された業務がありません。「業務を追加」から棚卸しを始めましょう。
          </p>
        ) : (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs text-navy-500">
                <th className="px-4 py-3 font-medium">業務名</th>
                <th className="px-4 py-3 font-medium">カテゴリ</th>
                <th className="px-4 py-3 font-medium">頻度</th>
                <th className="px-4 py-3 font-medium text-right">現状工数</th>
                <th className="px-4 py-3 font-medium">方針</th>
                <th className="px-4 py-3 font-medium text-right">適用後工数</th>
                <th className="px-4 py-3 font-medium">理由メモ</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-navy-50 last:border-0 hover:bg-navy-50/50">
                  <td className="px-4 py-3 font-medium text-navy-800">{task.name}</td>
                  <td className="px-4 py-3 text-navy-600">{task.category.name}</td>
                  <td className="px-4 py-3 text-navy-600">{FREQUENCY_LABELS[task.frequency]}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-navy-700">
                    {task.currentHours}h
                  </td>
                  <td className="px-4 py-3">
                    <PolicyBadge policy={task.policy} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-navy-700">
                    {task.afterHours}h
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-navy-500" title={task.memo ?? ""}>
                    {task.memo || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="text-xs font-medium text-navy-600 hover:underline"
                      >
                        編集
                      </Link>
                      <DeleteTaskButton taskId={task.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
