"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("管理者のみ実行できます");
  }
  return session;
}

const nameSchema = z.string().trim().min(1, "カテゴリ名を入力してください").max(50);

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "入力内容が不正です");
  }

  try {
    await prisma.category.create({ data: { name: parsed.data } });
  } catch {
    throw new Error("同じ名前のカテゴリが既に存在します");
  }

  revalidatePath("/admin");
  revalidatePath("/tasks");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();

  const inUse = await prisma.businessTask.count({ where: { categoryId } });
  if (inUse > 0) {
    throw new Error(
      `このカテゴリは${inUse}件の業務で使用されているため削除できません`,
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/admin");
  revalidatePath("/tasks");
}
