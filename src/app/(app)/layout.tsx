import { requireUser } from "@/lib/dal";
import { Nav } from "@/components/Nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Nav userName={user.name ?? user.email ?? ""} isAdmin={user.role === "ADMIN"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-line bg-paper px-4 py-4 text-center text-xs text-navy/50 sm:px-6">
        業務棚卸し台帳
      </footer>
    </div>
  );
}
