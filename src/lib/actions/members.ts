"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("管理者のみ実行できます");
  }
  if (session.user.id === userId) {
    throw new Error("自分自身の権限は変更できません");
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin");
}
