"use client";

import { useActionState, useState, useTransition } from "react";
import { Role } from "@/generated/prisma/enums";
import { createMemberAction, updateUserRoleAction } from "./actions";

type Member = { id: string; name: string; email: string; role: Role };

export function MemberManager({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createState, createAction, createPending] = useActionState(createMemberAction, undefined);
  const [formKey, setFormKey] = useState(0);
  const [prevCreateState, setPrevCreateState] = useState(createState);
  if (prevCreateState !== createState) {
    setPrevCreateState(createState);
    if (createState?.ok) {
      setFormKey((k) => k + 1);
    }
  }

  return (
    <div className="ledger-card rounded-sm p-5">
      <h2 className="mb-4 font-serif text-base font-bold text-navy">メンバー権限管理</h2>

      <form key={formKey} action={createAction} className="mb-5 flex flex-col gap-2 border-b border-line/70 pb-5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input name="name" placeholder="氏名" required maxLength={100} className="ledger-input" />
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            className="ledger-input"
          />
          <input
            name="password"
            type="password"
            placeholder="初期パスワード (8文字以上)"
            required
            minLength={8}
            className="ledger-input"
          />
        </div>
        {createState && !createState.ok && (
          <p className="text-xs text-rose-700">{createState.error}</p>
        )}
        <button
          type="submit"
          disabled={createPending}
          className="self-start rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-60"
        >
          メンバーを追加
        </button>
      </form>

      {error && (
        <p className="mb-3 rounded-sm border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}

      <ul className="divide-y divide-line/70">
        {members.map((member) => {
          const isSelf = member.id === currentUserId;
          const nextRole = member.role === Role.ADMIN ? Role.MEMBER : Role.ADMIN;
          return (
            <li key={member.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div>
                <p className="font-medium text-navy">
                  {member.name}
                  {isSelf && <span className="ml-2 text-xs text-navy/40">(自分)</span>}
                </p>
                <p className="text-xs text-navy/50">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    member.role === Role.ADMIN
                      ? "border-navy/30 bg-navy/10 text-navy"
                      : "border-slate-300 bg-slate-100 text-slate-700"
                  }`}
                >
                  {member.role === Role.ADMIN ? "管理者" : "メンバー"}
                </span>
                <button
                  type="button"
                  disabled={isSelf || (pending && pendingId === member.id)}
                  onClick={() => {
                    setError(null);
                    setPendingId(member.id);
                    startTransition(async () => {
                      const result = await updateUserRoleAction(member.id, nextRole);
                      if (result && !result.ok) {
                        setError(result.error);
                      }
                    });
                  }}
                  className="rounded-sm border border-line px-2.5 py-1 text-xs font-medium text-navy hover:bg-line/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {member.role === Role.ADMIN ? "メンバーにする" : "管理者にする"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
