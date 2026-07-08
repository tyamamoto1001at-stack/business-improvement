"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/app/(app)/actions";

type NavLink = {
  href: string;
  label: string;
};

export function Nav({
  userName,
  isAdmin,
}: {
  userName: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const links: NavLink[] = [
    { href: "/work", label: "個人ワーク" },
    { href: "/team", label: "チーム集計" },
    ...(isAdmin ? [{ href: "/admin", label: "管理者" }] : []),
  ];

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/work" className="font-serif text-lg font-bold tracking-wide">
            業務棚卸し台帳
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-sm px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm text-white/80">
          <span>{userName} さん</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => logoutAction())}
            className="rounded-sm border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-60"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
