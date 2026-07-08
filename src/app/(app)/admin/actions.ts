"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export type ActionState =
  | { ok: true }
  | { ok: false; error: string }
  | undefined;

const memberSchema = z.object({
  name: z.string().trim().min(1, "氏名を入力してください").max(100),
  email: z.email("正しいメールアドレスを入力してください").trim().toLowerCase(),
  password: z.string().min(8, "パスワードは8文字以上で入力してください").max(100),
});

export async function createMemberAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = memberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容に誤りがあります。" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { ok: false, error: "同じメールアドレスのユーザーが既に存在します。" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: Role.MEMBER,
    },
  });

  revalidatePath("/admin");
  return { ok: true };
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "カテゴリ名を入力してください").max(100),
});

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容に誤りがあります。" };
  }

  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return { ok: false, error: "同じ名前のカテゴリが既に存在します。" };
  }

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  await prisma.category.create({
    data: { name: parsed.data.name, order: (maxOrder._max.order ?? -1) + 1 },
  });

  revalidatePath("/admin");
  revalidatePath("/work");
  return { ok: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionState> {
  await requireAdmin();

  const usageCount = await prisma.businessTask.count({ where: { categoryId } });
  if (usageCount > 0) {
    return {
      ok: false,
      error: `このカテゴリは${usageCount}件の業務で使用されているため削除できません。`,
    };
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin");
  revalidatePath("/work");
  return { ok: true };
}

export async function updateUserRoleAction(
  userId: string,
  role: Role
): Promise<ActionState> {
  const admin = await requireAdmin();

  if (admin.id === userId) {
    return { ok: false, error: "自分自身の権限は変更できません。" };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin");
  return { ok: true };
}
