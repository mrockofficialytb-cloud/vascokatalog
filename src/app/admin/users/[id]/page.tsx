import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import UserDetailClient from "./UserDetailClient";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/catalog");

  const { id: rawId } = await params;
  const id = (rawId ?? "").toString().trim();
  if (!id) notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      companyName: true,
      ico: true,
      // @ts-ignore – pokud DIČ existuje, Prisma select projde
      dic: true,
      // @ts-ignore
      street: true,
      // @ts-ignore
      houseNumber: true,
      city: true,
      // @ts-ignore
      zip: true,
      customerType: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xl font-semibold tracking-tight">Karta klienta</div>
            <div className="mt-1 text-sm text-zinc-400">Detail pro schválení a kontakt.</div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 inline-flex items-center"
            >
              Zpět na schvalování
            </Link>
            <Link
              href="/admin/users"
              className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 inline-flex items-center"
            >
              Uživatelé
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <UserDetailClient user={user as any} />
      </div>
    </main>
  );
}