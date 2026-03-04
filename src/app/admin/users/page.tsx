import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Container, H1, Muted } from "@/components/ui";
import UserRow from "./UserRow";

const ADMIN_EMAIL = "mrockuw@seznam.cz";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const email = session.user.email.toLowerCase();
  if (email !== ADMIN_EMAIL) {
    return (
      <Container>
        <Card>
          <H1>Admin</H1>
          <Muted>Nemáš oprávnění.</Muted>
        </Card>
      </Container>
    );
  }

  // ✅ admin info (name + fallback)
  const adminUser = await prisma.user.findUnique({
    where: { email },
    select: { name: true, email: true },
  });

  const adminName = (adminUser?.name ?? "").trim();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      customerType: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <Container>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <H1>DATABÁZE UŽIVATELŮ</H1>
          <Muted>Změna statusu a segmentu zákazníka.</Muted>
        </div>

        {/* ✅ Admin identita vpravo */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-right">
          <div className="text-sm font-semibold text-zinc-100">
            {adminName || adminUser?.email || session.user.email}
          </div>
          <div className="mt-1 inline-flex items-center justify-end gap-2 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Administrátor
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </div>
    </Container>
  );
}