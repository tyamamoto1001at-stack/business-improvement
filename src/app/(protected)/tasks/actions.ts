"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { Frequency, Policy } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type TaskFormState = { error?: string };

const taskSchema = z.object({
  name: z.string().trim().min(1, "業務名を入力してください。").max(200),
  categoryId: z.string().min(1, "カテゴリを選択してください。"),
  frequency: z.enum(Frequency),
  currentHours: z.coerce.number().min(0, "0以上の数値を入力してください。"),
  policy: z.enum(Policy),
  afterHours: z.coerce.number().min(0, "0以上の数値を入力してください。"),
  memo: z.string().trim().max(2000).optional(),
});

async function requireUser() {
  const session = await auth();
  if (!session) redirect("/login");
  return session.user;
}

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    frequency: formData.get("frequency"),
    currentHours: formData.get("currentHours"),
    policy: formData.get("policy"),
    afterHours: formData.get("afterHours"),
    memo: formData.get("memo") ?? "",
  });
}

export async function createTaskAction(
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireUser();
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return { error: "選択したカテゴリが見つかりません。" };

  await prisma.task.create({
    data: { ...parsed.data, userId: user.id },
  });

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTaskAction(
  taskId: string,
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireUser();
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing || existing.userId !== user.id) {
    return { error: "対象の業務が見つかりません。" };
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return { error: "選択したカテゴリが見つかりません。" };

  await prisma.task.update({
    where: { id: taskId },
    data: parsed.data,
  });

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function deleteTaskAction(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");

  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing || existing.userId !== user.id) {
    return;
  }

  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/tasks");
}
