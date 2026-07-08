import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Nav } from "@/components/Nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-paper">
      <Nav user={session.user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
