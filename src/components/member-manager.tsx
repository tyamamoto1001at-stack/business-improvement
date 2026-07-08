"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/lib/actions/members";
import type { Role } from "@/generated/prisma/enums";

export type MemberItem = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function MemberManager({
  members,
  currentUserId,
}: {
  members: MemberItem[];
  currentUserId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleRole(member: MemberItem) {
    setError(null);
    setPendingId(member.id);
    const nextRole: Role = member.role === "ADMIN" ? "MEMBER" : "ADMIN";

    startTransition(async () => {
      try {
        await updateUserRole(member.id, nextRole);
      } catch (err) {
        setError(err instanceof Error ? err.message : "更新に失敗しました");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <section className="ledger-card rounded-lg p-4 sm:p-6">
      <h2 className="font-ledger text-lg font-bold text-navy-900">
        メンバー権限管理
      </h2>
      <p className="mt-1 text-xs text-foreground/50">
        メンバーの権限(ADMIN / MEMBER)を切り替えます。
      </p>

      {error && (
        <p className="mt-3 rounded-md border border-policy-abolish-border bg-policy-abolish-bg px-3 py-2 text-sm text-policy-abolish">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="ledger-table w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="text-navy-900">
              <th className="px-3 py-2 font-semibold">氏名</th>
              <th className="px-3 py-2 font-semibold">メールアドレス</th>
              <th className="px-3 py-2 font-semibold">権限</th>
              <th className="px-3 py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isSelf = m.id === currentUserId;
              return (
                <tr key={m.id}>
                  <td className="px-3 py-2.5 font-medium text-navy-900">
                    {m.name}
                    {isSelf && (
                      <span className="ml-1.5 text-xs text-foreground/40">
                        (自分)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-foreground/70">
                    {m.email}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold " +
                        (m.role === "ADMIN"
                          ? "border-navy-700 bg-navy-100 text-navy-900"
                          : "border-paper-line bg-paper text-foreground/70")
                      }
                    >
                      {m.role === "ADMIN" ? "管理者" : "メンバー"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => toggleRole(m)}
                      disabled={isSelf || (isPending && pendingId === m.id)}
                      className="rounded-md border border-paper-line px-2.5 py-1 text-xs font-medium text-navy-900 hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {m.role === "ADMIN" ? "メンバーにする" : "管理者にする"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
