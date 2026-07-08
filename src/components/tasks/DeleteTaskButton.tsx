"use client";

import { deleteTaskAction } from "@/app/(protected)/tasks/actions";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  return (
    <form
      action={deleteTaskAction}
      onSubmit={(e) => {
        if (!confirm("この業務を削除しますか?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="taskId" value={taskId} />
      <button type="submit" className="text-xs font-medium text-seal hover:underline">
        削除
      </button>
    </form>
  );
}
