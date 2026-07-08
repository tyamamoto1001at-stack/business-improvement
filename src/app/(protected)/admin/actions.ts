"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CategoryFormState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/tasks");
  return session.user;
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "カテゴリ名を入力してください。").max(100),
});

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return { error: "同名のカテゴリが既に存在します。" };
  }

  const last = await prisma.category.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.category.create({
    data: { name: parsed.data.name, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });

  revalidatePath("/admin");
  revalidatePath("/tasks");
  return {};
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "");

  const inUse = await prisma.task.count({ where: { categoryId } });
  if (inUse > 0) {
    redirect("/admin?error=category-in-use");
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin");
  revalidatePath("/tasks");
}

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const nextRole = String(formData.get("role") ?? "");
  if (nextRole !== "ADMIN" && nextRole !== "MEMBER") return;

  if (userId === admin.id && nextRole === "MEMBER") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      redirect("/admin?error=last-admin");
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role: nextRole } });
  revalidatePath("/admin");
}
