"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { logoutAction } from "@/app/(protected)/actions";
import { RoleBadge } from "@/components/ui/Badge";

const LINKS = [
  { href: "/tasks", label: "個人ワーク" },
  { href: "/team", label: "チーム集計" },
] as const;

export function Nav({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: "ADMIN" | "MEMBER" };
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-navy-700 bg-navy-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/tasks" className="font-ledger text-lg font-bold tracking-wide text-white">
          業務棚卸し台帳
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname?.startsWith(link.href)
                  ? "bg-navy-600 text-white"
                  : "text-navy-200 hover:bg-navy-700 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className={clsx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname?.startsWith("/admin")
                  ? "bg-navy-600 text-white"
                  : "text-navy-200 hover:bg-navy-700 hover:text-white",
              )}
            >
              管理者
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-navy-200">
            <span>{user.name ?? user.email}</span>
            <RoleBadge role={user.role} />
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-navy-500 px-3 py-1.5 text-xs font-medium text-navy-100 transition-colors hover:bg-navy-700"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
