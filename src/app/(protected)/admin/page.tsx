import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

import { CategoryForm } from "./CategoryForm";
import { deleteCategoryAction, updateUserRoleAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  "category-in-use": "このカテゴリは業務で使用されているため削除できません。",
  "last-admin": "管理者が0人になるため、この操作はできません。",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/tasks");

  const { error } = await searchParams;

  const [categories, users] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { tasks: true } } },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-ledger text-xl font-bold text-navy-800">管理者</h1>
        <p className="text-sm text-navy-500">カテゴリのマスタ管理とメンバーの権限管理を行います。</p>
      </div>

      {error && ERROR_MESSAGES[error] && (
        <div className="rounded-md border border-seal/30 bg-seal/5 px-4 py-3 text-sm text-seal">
          {ERROR_MESSAGES[error]}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>カテゴリ管理</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <CategoryForm />
            <ul className="divide-y divide-navy-100">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-navy-700">{category.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-navy-400">
                      利用中の業務: {category._count.tasks}件
                    </span>
                    {category._count.tasks === 0 ? (
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <button type="submit" className="text-xs font-medium text-seal hover:underline">
                          削除
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-navy-300">使用中</span>
                    )}
                  </div>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="py-4 text-center text-sm text-navy-400">
                  カテゴリが登録されていません。
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>メンバー権限管理</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-navy-100">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-navy-800">{user.name}</p>
                    <p className="text-xs text-navy-400">{user.email}</p>
                  </div>
                  <form action={updateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      type="hidden"
                      name="role"
                      value={user.role === "ADMIN" ? "MEMBER" : "ADMIN"}
                    />
                    <span
                      className={
                        user.role === "ADMIN"
                          ? "rounded-full border border-navy-700 bg-navy-700 px-2.5 py-0.5 text-xs font-medium text-white"
                          : "rounded-full border border-navy-200 bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700"
                      }
                    >
                      {user.role === "ADMIN" ? "管理者" : "メンバー"}
                    </span>
                    <button
                      type="submit"
                      className="text-xs font-medium text-navy-600 hover:underline"
                    >
                      {user.role === "ADMIN" ? "メンバーにする" : "管理者にする"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
