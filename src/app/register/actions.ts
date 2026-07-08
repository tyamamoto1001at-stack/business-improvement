"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type RegisterState = { error?: string };

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "氏名を入力してください。"),
    email: z.string().trim().email("メールアドレスの形式が正しくありません。"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません。",
    path: ["confirmPassword"],
  });

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "このメールアドレスは既に登録されています。" };
  }

  // 最初に登録したユーザーを管理者として扱う(初期セットアップ用)。
  const userCount = await prisma.user.count();
  const role = userCount === 0 ? "ADMIN" : "MEMBER";

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/tasks" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "登録は完了しましたが、自動ログインに失敗しました。ログイン画面からお試しください。" };
    }
    throw error;
  }
}
