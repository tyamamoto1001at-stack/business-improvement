"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Field";

import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">パスワード</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "ログイン中…" : "ログイン"}
      </Button>
      <p className="text-center text-xs text-navy-500">
        アカウントをお持ちでない方は{" "}
        <Link href="/register" className="font-medium text-navy-700 underline underline-offset-2">
          新規登録
        </Link>
      </p>
    </form>
  );
}
