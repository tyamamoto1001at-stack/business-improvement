import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-navy-950 px-4 py-12">
      <div className="ledger-card w-full max-w-sm rounded-lg p-8">
        <div className="mb-8 text-center">
          <p className="text-xs tracking-widest text-gold-600">LEDGER</p>
          <h1 className="font-ledger mt-1 text-2xl font-bold text-navy-900">
            業務棚卸し台帳
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            社内アカウントでログインしてください
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
