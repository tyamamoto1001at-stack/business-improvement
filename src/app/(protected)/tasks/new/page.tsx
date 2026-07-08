import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

import { createTaskAction } from "../actions";
import { TaskForm } from "../TaskForm";

export default async function NewTaskPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>業務を追加</CardTitle>
        </CardHeader>
        <CardBody>
          <TaskForm categories={categories} action={createTaskAction} submitLabel="登録する" />
        </CardBody>
      </Card>
    </div>
  );
}
