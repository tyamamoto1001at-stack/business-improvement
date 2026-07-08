"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCurrentHours } from "@/lib/policy";
import { Frequency, Policy } from "@/generated/prisma/enums";

const taskSchema = z.object({
  name: z.string().trim().min(1, "業務名を入力してください").max(200),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  frequency: z.enum(
    Object.values(Frequency) as [Frequency, ...Frequency[]],
  ),
  policy: z.enum(Object.values(Policy) as [Policy, ...Policy[]]),
  currentHours: z.coerce.number().min(0).max(1000),
  afterHours: z.coerce.number().min(0).max(1000),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

function parseTaskForm(formData: FormData) {
  const parsed = taskSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    frequency: formData.get("frequency"),
    policy: formData.get("policy"),
    currentHours: formData.get("currentHours"),
    afterHours: formData.get("afterHours"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "入力内容が不正です");
  }

  const data = parsed.data;
  const currentHours = normalizeCurrentHours(data.policy, data.currentHours);
  const afterHours = data.policy === "ABOLISH" ? 0 : data.afterHours;

  return { ...data, currentHours, afterHours };
}

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("ログインが必要です");

  const data = parseTaskForm(formData);

  await prisma.businessTask.create({
    data: {
      ...data,
      note: data.note || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/team");
}

export async function updateTask(taskId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("ログインが必要です");

  const existing = await prisma.businessTask.findFirst({
    where: { id: taskId, userId: session.user.id },
  });
  if (!existing) throw new Error("対象の業務が見つかりません");

  const data = parseTaskForm(formData);

  await prisma.businessTask.update({
    where: { id: taskId },
    data: {
      ...data,
      note: data.note || null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/team");
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("ログインが必要です");

  await prisma.businessTask.deleteMany({
    where: { id: taskId, userId: session.user.id },
  });

  revalidatePath("/tasks");
  revalidatePath("/team");
}
