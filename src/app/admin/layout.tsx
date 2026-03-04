import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";

const ADMIN_EMAIL = "mrockuw@seznam.cz";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (session.user.email.toLowerCase() !== ADMIN_EMAIL) redirect("/catalog");

  const newCount = await prisma.inquiry.count({
    where: { status: "NEW" },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">PANEL ADMINISTRÁTORA</div>
            <div className="text-xs text-zinc-400">Správa uživatelů a poptávek</div>
          </div>

          <AdminNav newCount={newCount} />
        </div>
      </header>

      {children}
    </main>
  );
}