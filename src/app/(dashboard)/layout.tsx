import { auth } from "@/auth";
import { NavLinks } from "@/components/nav-links";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-navy-900 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] tracking-widest text-gold-100/80">
                LEDGER
              </p>
              <h1 className="font-ledger text-lg font-bold text-white">
                業務棚卸し台帳
              </h1>
            </div>
            <NavLinks isAdmin={isAdmin} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm text-navy-100">
              <p className="font-medium text-white">{session?.user?.name}</p>
              <p className="text-xs text-navy-100/70">
                {isAdmin ? "管理者" : "メンバー"}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
