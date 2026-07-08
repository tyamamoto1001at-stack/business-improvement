import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";

import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/tasks");

  return (
    <AuthShell
      title="新規登録"
      description="社内メンバー登録です。最初に登録した方が管理者になります。"
    >
      <RegisterForm />
    </AuthShell>
  );
}
