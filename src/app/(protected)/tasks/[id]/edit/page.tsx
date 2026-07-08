import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

import { updateTaskAction } from "../../actions";
import { TaskForm } from "../../TaskForm";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const [task, categories] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!task || task.userId !== session.user.id) notFound();

  const boundAction = updateTaskAction.bind(null, task.id);

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>業務を編集</CardTitle>
        </CardHeader>
        <CardBody>
          <TaskForm
            categories={categories}
            defaults={{
              name: task.name,
              categoryId: task.categoryId,
              frequency: task.frequency,
              currentHours: task.currentHours,
              policy: task.policy,
              afterHours: task.afterHours,
              memo: task.memo ?? "",
            }}
            action={boundAction}
            submitLabel="更新する"
          />
        </CardBody>
      </Card>
    </div>
  );
}
