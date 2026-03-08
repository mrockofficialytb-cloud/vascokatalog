import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import AdminInquiriesSmartRefresh from "@/components/AdminInquiriesSmartRefresh";
import DeleteInquiryButton from "@/components/DeleteInquiryButton";

function customerTypeCz(t: string) {
  if (t === "B2B_BIG") return "Velkoodběratel";
  if (t === "B2B_SMALL") return "Maloodběratel";
  if (t === "B2C") return "Základní nabídka";
  return t;
}

function statusCz(s: string) {
  if (s === "ACTIVE") return "Schváleno";
  if (s === "PENDING") return "Čeká na schválení";
  if (s === "DISABLED") return "Odmítnuto";
  return s;
}

function inquiryStatusCz(status: string) {
  if (status === "NEW") return "Nové";
  if (status === "IN_PROGRESS") return "Ve zpracování";
  if (status === "DONE") return "Vyřízené";
  if (status === "CANCELED") return "Stornované";
  return status;
}

function InquiryBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

  if (status === "NEW") {
    return (
      <span className={`${base} border-amber-400/30 bg-amber-400/10 text-amber-100`}>
        NOVÁ POPTÁVKA
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className={`${base} border-sky-400/30 bg-sky-400/10 text-sky-100`}>
        VE ZPRACOVÁNÍ
      </span>
    );
  }

  if (status === "DONE") {
    return (
      <span className={`${base} border-emerald-400/30 bg-emerald-400/10 text-emerald-100`}>
        VYŘÍZENO
      </span>
    );
  }

  if (status === "CANCELED") {
    return (
      <span className={`${base} border-red-400/30 bg-red-400/10 text-red-100`}>
        STORNOVÁNO
      </span>
    );
  }

  return (
    <span className={`${base} border-zinc-700 bg-zinc-950/40 text-zinc-200`}>
      {status}
    </span>
  );
}

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "—";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(val);
}

function totalInquiryCzk(
  items: Array<{ quantity: number; unitPriceCzkSnapshot: number | null }>
) {
  return items.reduce((sum, it) => {
    const unit = it.unitPriceCzkSnapshot ?? 0;
    return sum + unit * it.quantity;
  }, 0);
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-10 items-center rounded-2xl border px-4 text-xs font-semibold transition",
        active
          ? "border-white bg-white text-zinc-950"
          : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/catalog");

  const params = await searchParams;
  const allowedStatuses = ["NEW", "IN_PROGRESS", "DONE", "CANCELED"] as const;
  const filter = params?.status;
  const activeFilter = allowedStatuses.includes(filter as any) ? filter : null;

  const inquiries = await prisma.inquiry.findMany({
    where: activeFilter ? { status: activeFilter as any } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      status: true,
      customerTypeSnapshot: true,
      statusSnapshot: true,
      user: {
        select: {
          email: true,
          name: true,
          buyerType: true,
          companyName: true,
        },
      },
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          quantity: true,
          nameSnapshot: true,
          decorSnapshot: true,
          feltSnapshot: true,
          unitPriceCzkSnapshot: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <AdminInquiriesSmartRefresh intervalMs={15000} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold tracking-tight">ADMINISTRACE OBJEDNÁVEK</div>
          <div className="mt-1 text-sm text-zinc-400">Přehled poptávek (RFQ)</div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterLink href="/admin/inquiries" label="Vše" active={!activeFilter} />
          <FilterLink
            href="/admin/inquiries?status=NEW"
            label="Nové"
            active={activeFilter === "NEW"}
          />
          <FilterLink
            href="/admin/inquiries?status=IN_PROGRESS"
            label="Ve zpracování"
            active={activeFilter === "IN_PROGRESS"}
          />
          <FilterLink
            href="/admin/inquiries?status=DONE"
            label="Vyřízené"
            active={activeFilter === "DONE"}
          />
          <FilterLink
            href="/admin/inquiries?status=CANCELED"
            label="Stornované"
            active={activeFilter === "CANCELED"}
          />
        </div>

        {inquiries.length === 0 ? (
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 text-sm text-zinc-300">
            {activeFilter
              ? `Žádné poptávky se stavem „${inquiryStatusCz(activeFilter)}“.`
              : "Zatím žádné objednávky."}
          </div>
        ) : (
          <div className="grid gap-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="relative group rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 transition hover:border-zinc-800 hover:bg-zinc-900/40"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white">
                        {inq.user.name || inq.user.email}
                      </div>

                      <div className="mt-1 text-sm text-zinc-400">
                        Objednávka VASCO-{String(inq.orderNumber).padStart(4, "0")}
                      </div>

                      <div className="text-sm text-zinc-400">{inq.user.email}</div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                        <span>
                          Vytvořeno: {new Date(inq.createdAt).toLocaleString("cs-CZ")}
                        </span>
                        <span>Typ: {customerTypeCz(inq.customerTypeSnapshot)}</span>
                        <span>Stav účtu: {statusCz(inq.statusSnapshot)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <InquiryBadge status={inq.status} />

                      <form action="/api/admin/inquiries/set-status" method="post">
                        <input type="hidden" name="inquiryId" value={inq.id} />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={`/admin/inquiries`}
                        />
                        <input type="hidden" name="status" value="NEW" />
                        <button className="h-10 rounded-2xl border border-zinc-700 bg-white px-5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200">
                          PŘIJMOUT
                        </button>
                      </form>

                      <form action="/api/admin/inquiries/set-status" method="post">
                        <input type="hidden" name="inquiryId" value={inq.id} />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={`/admin/inquiries`}
                        />
                        <input type="hidden" name="status" value="DONE" />
                        <button className="h-10 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/15">
                          DOKONČIT
                        </button>
                      </form>

                      <form action="/api/admin/inquiries/set-status" method="post">
                        <input type="hidden" name="inquiryId" value={inq.id} />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={`/admin/inquiries`}
                        />
                        <input type="hidden" name="status" value="CANCELED" />
                        <button className="h-10 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 text-xs font-semibold text-red-100 hover:bg-red-400/15">
                          ODMÍTNOUT
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-zinc-900">
                    <div className="grid grid-cols-[120px_1fr_140px_140px] bg-zinc-950/40 px-4 py-3 text-xs font-semibold text-zinc-300">
                      <div>Počet kusů</div>
                      <div>Název položky</div>
                      <div className="text-right">Cena za MJ</div>
                      <div className="text-right">Cena celkem</div>
                    </div>

                    <div className="divide-y divide-zinc-900">
                      {inq.items.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[120px_1fr_140px_140px] items-start px-4 py-4 text-sm"
                        >
                          <div className="text-zinc-100">{item.quantity} ks</div>

                          <div>
                            <div className="font-semibold text-white">{item.nameSnapshot}</div>

                            {item.decorSnapshot && (
                              <div className="mt-1 text-xs text-zinc-400">
                                Dekor: {item.decorSnapshot}
                              </div>
                            )}

                            {item.feltSnapshot && (
                              <div className="text-xs text-zinc-400">
                                Varianta: {item.feltSnapshot}
                              </div>
                            )}
                          </div>

                          <div className="text-right text-zinc-200">
                            {typeof item.unitPriceCzkSnapshot === "number"
                              ? formatCzk(item.unitPriceCzkSnapshot)
                              : "—"}
                          </div>

                          <div className="text-right font-semibold text-white">
                            {typeof item.unitPriceCzkSnapshot === "number"
                              ? formatCzk(item.unitPriceCzkSnapshot * item.quantity)
                              : "—"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end border-t border-zinc-900 px-4 py-4">
                      <div className="text-sm text-zinc-300">
                        Celkem:{" "}
                        <span className="font-semibold text-white">
                          {formatCzk(totalInquiryCzk(inq.items))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-start">
                    <Link
                      href={`/admin/inquiries/${inq.id}`}
                      className="text-xs font-semibold text-zinc-300 transition hover:text-white"
                    >
                      Zobrazit detail objednávky →
                    </Link>
                  </div>
                </div>

                <DeleteInquiryButton
                  inquiryId={inq.id}
                  orderLabel={`VASCO-${String(inq.orderNumber).padStart(4, "0")}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}