"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-navy">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm text-navy shadow-inner outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-navy">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm text-navy shadow-inner outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-sm border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-sm bg-navy px-4 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
