"use client";

import { useState } from "react";
import { SummaryCards } from "./SummaryCards";
import { TaskTable, type TaskRow } from "./TaskTable";
import { TaskForm } from "./TaskForm";

type Category = { id: string; name: string };

export function WorkClient({
  tasks,
  categories,
}: {
  tasks: TaskRow[];
  categories: Category[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);

  const currentTotal = tasks.reduce((sum, t) => sum + t.currentHours, 0);
  const plannedTotal = tasks.reduce((sum, t) => sum + t.plannedHours, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-navy">個人ワーク</h1>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          + 業務を追加
        </button>
      </div>

      <SummaryCards currentTotal={currentTotal} plannedTotal={plannedTotal} />

      <TaskTable
        tasks={tasks}
        onEdit={(task) => {
          setEditingTask(task);
          setModalOpen(true);
        }}
      />

      {modalOpen && (
        <TaskForm
          categories={categories}
          task={editingTask ?? undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
