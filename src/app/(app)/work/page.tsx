import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { WorkClient } from "./WorkClient";

export const metadata: Metadata = {
  title: "個人ワーク | 業務棚卸し台帳",
};

export default async function WorkPage() {
  const user = await requireUser();

  const [tasks, categories] = await Promise.all([
    prisma.businessTask.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const rows = tasks.map((t) => ({
    id: t.id,
    name: t.name,
    categoryId: t.categoryId,
    categoryName: t.category.name,
    frequency: t.frequency,
    currentHours: t.currentHours,
    policy: t.policy,
    plannedHours: t.plannedHours,
    note: t.note,
  }));

  return (
    <WorkClient
      tasks={rows}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
