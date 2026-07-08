import type { Metadata } from "next";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./CategoryManager";
import { MemberManager } from "./MemberManager";

export const metadata: Metadata = {
  title: "管理者 | 業務棚卸し台帳",
};

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [categories, members] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { tasks: true } } },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-navy">管理者</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CategoryManager
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            taskCount: c._count.tasks,
          }))}
        />
        <MemberManager members={members} currentUserId={admin.id} />
      </div>
    </div>
  );
}
