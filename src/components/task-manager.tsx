"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { PolicyBadge } from "@/components/policy-badge";
import { TaskForm, type TaskFormValues } from "@/components/task-form";
import { createTask, deleteTask, updateTask } from "@/lib/actions/tasks";
import { FREQUENCY_LABEL } from "@/lib/frequency";
import { formatHours } from "@/lib/format";
import { SummaryCard } from "@/components/summary-card";
import type { Frequency, Policy } from "@/generated/prisma/enums";

export type TaskListItem = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  frequency: Frequency;
  policy: Policy;
  currentHours: number;
  afterHours: number;
  note: string | null;
};

export function TaskManager({
  tasks,
  categories,
}: {
  tasks: TaskListItem[];
  categories: { id: string; name: string }[];
}) {
  const [modalMode, setModalMode] = useState<
    { type: "create" } | { type: "edit"; task: TaskListItem } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const summary = useMemo(() => {
    const currentTotal = tasks.reduce((sum, t) => sum + t.currentHours, 0);
    const afterTotal = tasks.reduce((sum, t) => sum + t.afterHours, 0);
    const diff = currentTotal - afterTotal;
    const diffPercent = currentTotal === 0 ? 0 : (diff / currentTotal) * 100;
    return { currentTotal, afterTotal, diff, diffPercent };
  }, [tasks]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="現状工数計" value={formatHours(summary.currentTotal)} />
        <SummaryCard
          label="適用後工数計"
          value={formatHours(summary.afterTotal)}
        />
        <SummaryCard
          label={summary.diff >= 0 ? "削減見込み" : "増加見込み"}
          value={`${formatHours(Math.abs(summary.diff))} (${Math.abs(
            summary.diffPercent,
          ).toFixed(0)}%)`}
          accent={summary.diff >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-ledger text-xl font-bold text-navy-900">
          自分の業務一覧
        </h2>
        <button
          onClick={() => setModalMode({ type: "create" })}
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          + 業務を追加
        </button>
      </div>

      <div className="ledger-card overflow-x-auto rounded-lg">
        <table className="ledger-table w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="text-navy-900">
              <th className="px-4 py-3 font-semibold">業務名</th>
              <th className="px-4 py-3 font-semibold">カテゴリ</th>
              <th className="px-4 py-3 font-semibold">頻度</th>
              <th className="px-4 py-3 font-semibold">方針</th>
              <th className="px-4 py-3 text-right font-semibold">現状</th>
              <th className="px-4 py-3 text-right font-semibold">適用後</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-foreground/50">
                  業務が登録されていません。「業務を追加」から登録してください。
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-900">{task.name}</p>
                  {task.note && (
                    <p className="mt-0.5 max-w-xs text-xs text-foreground/50">
                      {task.note}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground/80">
                  {task.categoryName}
                </td>
                <td className="px-4 py-3 text-foreground/80">
                  {FREQUENCY_LABEL[task.frequency]}
                </td>
                <td className="px-4 py-3">
                  <PolicyBadge policy={task.policy} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatHours(task.currentHours)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatHours(task.afterHours)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setModalMode({ type: "edit", task })}
                      className="rounded-md border border-paper-line px-2.5 py-1 text-xs font-medium text-navy-900 hover:bg-navy-50"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => setDeleteTarget(task)}
                      className="rounded-md border border-policy-abolish-border px-2.5 py-1 text-xs font-medium text-policy-abolish hover:bg-policy-abolish-bg"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <Modal
          title={modalMode.type === "create" ? "業務を追加" : "業務を編集"}
          onClose={() => setModalMode(null)}
        >
          <TaskForm
            categories={categories}
            submitLabel={modalMode.type === "create" ? "追加する" : "更新する"}
            initialValues={
              modalMode.type === "edit"
                ? toFormValues(modalMode.task)
                : undefined
            }
            onCancel={() => setModalMode(null)}
            onSubmit={async (formData) => {
              if (modalMode.type === "create") {
                await createTask(formData);
              } else {
                await updateTask(modalMode.task.id, formData);
              }
              setModalMode(null);
            }}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="業務の削除" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-foreground/80">
            「{deleteTarget.name}」を削除します。この操作は取り消せません。
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-navy-900 hover:bg-navy-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-md bg-policy-abolish px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isDeleting ? "削除中..." : "削除する"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function toFormValues(task: TaskListItem): TaskFormValues {
  return {
    id: task.id,
    name: task.name,
    categoryId: task.categoryId,
    frequency: task.frequency,
    policy: task.policy,
    currentHours: task.currentHours,
    afterHours: task.afterHours,
    note: task.note ?? "",
  };
}

