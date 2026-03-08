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
    dic: true,
    street: true,
    houseNumber: true,
    city: true,
    zip: true,

    invoiceStreet: true,
    invoiceHouseNumber: true,
    invoiceCity: true,
    invoiceZip: true,

    customerType: true,
    status: true,
    createdAt: true,

    inquiries: {
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
    },
  },
});

  if (!user) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xl font-semibold tracking-tight">KARTA ZÁKAZNÍKA</div>
            <div className="mt-1 text-sm text-zinc-400">
              Detail pro schválení a kontakt.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex h-12 items-center rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Zpět na schvalování
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex h-12 items-center rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Uživatelé
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <UserDetailClient user={user as any} />

        <div className="mt-10 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
          <div className="mb-4 text-lg font-semibold">Historie objednávek</div>

          {user.inquiries.length === 0 ? (
            <div className="text-sm text-zinc-400">
              Zákazník zatím nevytvořil žádnou poptávku.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-900">
              <div className="grid grid-cols-4 bg-zinc-950/40 px-4 py-2 text-xs font-semibold text-zinc-300">
                <div>ID objednávky</div>
                <div>Počet kusů</div>
                <div>Stav</div>
                <div className="text-right">Detail</div>
              </div>

              <div className="divide-y divide-zinc-900">
                {user.inquiries.map((inq) => {
                  const totalQty = inq.items.reduce((sum, it) => sum + it.quantity, 0);

                  return (
                    <div
                      key={inq.id}
                      className="grid grid-cols-4 items-center px-4 py-3 text-sm"
                    >
                      <div className="font-semibold text-zinc-100">
  VASCO-{String(inq.orderNumber).padStart(4, "0")}
</div>
                      <div className="text-zinc-300">{totalQty} ks</div>
                      <div className="text-zinc-400">{inq.status}</div>
                      <div className="text-right">
                        <Link
                          href={`/admin/inquiries/${inq.id}`}
                          className="text-xs font-semibold text-zinc-300 hover:text-white"
                        >
                          Otevřít →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}