"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Frequency, Policy } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const taskSchema = z.object({
  name: z.string().trim().min(1, "業務名を入力してください").max(200),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  frequency: z.enum(Frequency),
  currentHours: z.coerce.number().min(0, "0以上の数値を入力してください").max(1000),
  policy: z.enum(Policy),
  plannedHours: z.coerce.number().min(0, "0以上の数値を入力してください").max(1000),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type TaskFormState =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof z.infer<typeof taskSchema>, string>>;
    }
  | undefined;

function parseTask(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    frequency: formData.get("frequency"),
    currentHours: formData.get("currentHours"),
    policy: formData.get("policy"),
    plannedHours: formData.get("plannedHours"),
    note: formData.get("note") ?? "",
  };
  return taskSchema.safeParse(raw);
}

function toFieldErrors(result: z.ZodError<z.infer<typeof taskSchema>>) {
  const flat = result.flatten().fieldErrors;
  const out: Partial<Record<keyof z.infer<typeof taskSchema>, string>> = {};
  for (const key of Object.keys(flat) as (keyof typeof flat)[]) {
    const messages = flat[key];
    if (messages && messages.length > 0) out[key] = messages[0];
  }
  return out;
}

export async function createTaskAction(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const user = await requireUser();
  const parsed = parseTask(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "入力内容に誤りがあります。",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return { ok: false, error: "選択したカテゴリが見つかりません。" };
  }

  await prisma.businessTask.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      categoryId: parsed.data.categoryId,
      frequency: parsed.data.frequency,
      currentHours: parsed.data.currentHours,
      policy: parsed.data.policy,
      plannedHours: parsed.data.plannedHours,
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/work");
  revalidatePath("/team");
  return { ok: true };
}

export async function updateTaskAction(
  taskId: string,
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const user = await requireUser();
  const parsed = parseTask(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "入力内容に誤りがあります。",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const existing = await prisma.businessTask.findUnique({ where: { id: taskId } });
  if (!existing || existing.userId !== user.id) {
    return { ok: false, error: "対象の業務が見つかりません。" };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return { ok: false, error: "選択したカテゴリが見つかりません。" };
  }

  await prisma.businessTask.update({
    where: { id: taskId },
    data: {
      name: parsed.data.name,
      categoryId: parsed.data.categoryId,
      frequency: parsed.data.frequency,
      currentHours: parsed.data.currentHours,
      policy: parsed.data.policy,
      plannedHours: parsed.data.plannedHours,
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/work");
  revalidatePath("/team");
  return { ok: true };
}

export async function deleteTaskAction(taskId: string) {
  const user = await requireUser();
  const existing = await prisma.businessTask.findUnique({ where: { id: taskId } });
  if (!existing || existing.userId !== user.id) {
    throw new Error("対象の業務が見つかりません。");
  }
  await prisma.businessTask.delete({ where: { id: taskId } });
  revalidatePath("/work");
  revalidatePath("/team");
}
