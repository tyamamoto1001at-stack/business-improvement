import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/category-manager";
import { MemberManager } from "@/components/member-manager";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/tasks");
  }

  const [categories, members] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { businessTasks: true } } },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const categoryItems = categories.map((c) => ({
    id: c.id,
    name: c.name,
    taskCount: c._count.businessTasks,
  }));

  const memberItems = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs tracking-widest text-gold-600">ADMIN LEDGER</p>
        <h1 className="font-ledger text-2xl font-bold text-navy-900">
          管理者
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          カテゴリマスタとメンバーの権限を管理します。
        </p>
      </div>

      <CategoryManager categories={categoryItems} />
      <MemberManager members={memberItems} currentUserId={session.user.id} />
    </div>
  );
}
