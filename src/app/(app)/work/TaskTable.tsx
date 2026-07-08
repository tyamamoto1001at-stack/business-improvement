"use client";

import { useTransition } from "react";
import { PolicyBadge } from "@/components/PolicyBadge";
import { FREQUENCY_LABELS } from "@/lib/ledger";
import { deleteTaskAction } from "./actions";
import type { TaskFormValues } from "./TaskForm";

export type TaskRow = TaskFormValues & {
  categoryName: string;
};

export function TaskTable({
  tasks,
  onEdit,
}: {
  tasks: TaskRow[];
  onEdit: (task: TaskRow) => void;
}) {
  const [pending, startTransition] = useTransition();

  if (tasks.length === 0) {
    return (
      <div className="ledger-card rounded-sm p-10 text-center text-sm text-navy/50">
        登録されている業務はありません。「業務を追加」から棚卸しを始めましょう。
      </div>
    );
  }

  return (
    <div className="ledger-card overflow-x-auto rounded-sm">
      <table className="w-full min-w-[840px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-navy/5 text-left text-xs font-semibold tracking-wide text-navy/70">
            <th className="px-4 py-3">業務名</th>
            <th className="px-4 py-3">カテゴリ</th>
            <th className="px-4 py-3">頻度</th>
            <th className="px-4 py-3 text-right">現状工数</th>
            <th className="px-4 py-3">方針</th>
            <th className="px-4 py-3 text-right">想定工数</th>
            <th className="px-4 py-3 text-right">増減</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const diff = task.plannedHours - task.currentHours;
            return (
              <tr key={task.id} className="border-b border-line/70 last:border-b-0 hover:bg-navy/[0.03]">
                <td className="px-4 py-3 font-medium text-navy">{task.name}</td>
                <td className="px-4 py-3 text-navy/70">{task.categoryName}</td>
                <td className="px-4 py-3 text-navy/70">{FREQUENCY_LABELS[task.frequency]}</td>
                <td className="px-4 py-3 text-right tabular-nums text-navy/80">
                  {task.currentHours}h
                </td>
                <td className="px-4 py-3">
                  <PolicyBadge policy={task.policy} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-navy/80">
                  {task.plannedHours}h
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-medium ${
                    diff < 0 ? "text-emerald-700" : diff > 0 ? "text-rose-700" : "text-navy/40"
                  }`}
                >
                  {diff === 0 ? "―" : `${diff > 0 ? "+" : ""}${diff}h`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="rounded-sm border border-line px-2.5 py-1 text-xs font-medium text-navy hover:bg-line/30"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(`「${task.name}」を削除しますか？`)) return;
                        startTransition(() => {
                          deleteTaskAction(task.id);
                        });
                      }}
                      className="rounded-sm border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
