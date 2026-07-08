import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "ログイン | 業務棚卸し台帳",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-serif text-3xl font-bold tracking-wide text-white">
            業務棚卸し台帳
          </p>
          <p className="mt-1 text-sm text-white/60">
            業務を棚卸しし、方針を定めるための社内台帳
          </p>
        </div>
        <div className="ledger-card rounded-sm p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
