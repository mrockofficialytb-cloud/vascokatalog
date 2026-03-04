import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";

function labelCustomerType(type?: string | null) {
  switch (type) {
    case "B2B_BIG":
      return "Velkoodběratel";
    case "B2B_SMALL":
      return "Maloodběratel";
    case "B2C":
    default:
      return "Základní nabídka";
  }
}

function labelStatus(status?: string | null) {
  switch (status) {
    case "ACTIVE":
      return "Aktivní";
    case "PENDING":
      return "Čeká na schválení";
    case "DISABLED":
      return "Odmítnutý";
    default:
      return status ?? "—";
  }
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="text-sm font-semibold text-zinc-300">{label}</div>
      <div className="text-sm text-zinc-100">{value && value.trim() ? value : "—"}</div>
    </div>
  );
}

export default async function AdminApprovalPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/catalog");

  const pendingUsers = await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background vibe */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,255,255,0.05),transparent_50%),radial-gradient(700px_circle_at_50%_120%,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.6))]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">SCHVALOVÁNÍ ODBĚRATELŮ</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Uživatelé ve stavu <b>Čeká na schválení</b>. Můžete je schválit nebo odmítnout.
          </p>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 text-sm text-zinc-300">
            Žádní čekající uživatelé.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((u) => {
              const x = u as any;

              const fullName = (x.fullName as string | undefined) || u.name || "—";
              const phone = (x.phone as string | undefined) || null;
              const company = (x.companyName as string | undefined) || (x.company as string | undefined) || null;
              const ico = (x.ico as string | undefined) || null;
              const dic = (x.dic as string | undefined) || null;
              const city = (x.city as string | undefined) || null;
              const street = (x.street as string | undefined) || null;
              const zip = (x.zip as string | undefined) || null;
              const note = (x.note as string | undefined) || (x.registrationNote as string | undefined) || null;

              return (
                <div
                  key={u.id}
                  className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 shadow-sm transition hover:border-zinc-800 hover:bg-zinc-900/40"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* LEFT: Client card */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-lg font-semibold">{fullName}</div>
                          <div className="mt-1 truncate text-sm text-zinc-400">{u.email}</div>
                        </div>

                        <div className="shrink-0 rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs font-semibold text-zinc-200">
                          {labelCustomerType(u.customerType)} · {labelStatus(u.status)}
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5">
                        <div className="mb-3 text-sm font-semibold text-zinc-200">Kontaktní údaje</div>

                        <div className="divide-y divide-zinc-800/70">
                          <Row label="Jméno a příjmení" value={fullName} />
                          <Row label="Telefonní číslo" value={phone} />
                          <Row label="E-mail" value={u.email} />
                          <Row label="Typ" value={labelCustomerType(u.customerType)} />
                          <Row label="Stav" value={labelStatus(u.status)} />
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                            <div className="text-xs font-semibold text-zinc-400">Firma</div>
                            <div className="mt-1 text-sm text-zinc-100">{company && company.trim() ? company : "—"}</div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-zinc-200">
                                IČO: {ico && ico.trim() ? ico : "—"}
                              </span>
                              <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-zinc-200">
                                DIČ: {dic && dic.trim() ? dic : "—"}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                            <div className="text-xs font-semibold text-zinc-400">Adresa</div>
                            <div className="mt-1 text-sm text-zinc-100">
                              {[street, city, zip].filter(Boolean).join(", ") || "—"}
                            </div>
                          </div>
                        </div>

                        {note && note.trim() && (
                          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                            <div className="text-xs font-semibold text-zinc-400">Poznámka</div>
                            <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-100">{note}</div>
                          </div>
                        )}

                        <div className="mt-4 text-xs text-zinc-500">
                          Vytvořeno: {new Date(u.createdAt).toLocaleString("cs-CZ")}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex shrink-0 flex-col gap-2 lg:w-[220px]">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                      >
                        Karta klienta
                      </Link>

                      <form action="/api/admin/approve" method="post">
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="h-12 w-full rounded-2xl bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-200">
                         Přijmout
                        </button>
                      </form>

                      <form action="/api/admin/reject" method="post">
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="h-12 w-full rounded-2xl border border-red-400/30 bg-red-400/10 px-6 text-sm font-semibold text-red-100 hover:bg-red-400/15">
                          Odmítnout
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}