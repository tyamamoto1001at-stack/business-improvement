import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";

import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/tasks");

  return (
    <AuthShell title="ログイン" description="業務棚卸し台帳にログインしてください。">
      <LoginForm />
    </AuthShell>
  );
}
