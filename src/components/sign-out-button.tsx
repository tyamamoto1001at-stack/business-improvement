"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-navy-700 px-3 py-1.5 text-sm text-navy-50 transition-colors hover:bg-navy-800"
    >
      ログアウト
    </button>
  );
}
