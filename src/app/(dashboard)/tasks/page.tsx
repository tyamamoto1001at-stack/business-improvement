import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskManager, type TaskListItem } from "@/components/task-manager";

export default async function TasksPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [tasks, categories] = await Promise.all([
    prisma.businessTask.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const taskItems: TaskListItem[] = tasks.map((t) => ({
    id: t.id,
    name: t.name,
    categoryId: t.categoryId,
    categoryName: t.category.name,
    frequency: t.frequency,
    policy: t.policy,
    currentHours: t.currentHours,
    afterHours: t.afterHours,
    note: t.note,
  }));

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-xs tracking-widest text-gold-600">MY LEDGER</p>
        <h1 className="font-ledger text-2xl font-bold text-navy-900">
          個人ワーク
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          担当している業務を登録し、方針と想定工数を管理します。
        </p>
      </div>
      <div className="mt-4">
        <TaskManager tasks={taskItems} categories={categories} />
      </div>
    </div>
  );
}
