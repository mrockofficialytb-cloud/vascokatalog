import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

const ADMIN_EMAIL = "mrockuw@seznam.cz";

function formatCzk(amountCzk: number) {
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(val);
}

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (session.user.email.toLowerCase() !== ADMIN_EMAIL) redirect("/catalog");

  const { id: rawId } = await params;
  const id = (rawId ?? "").toString().trim();
  if (!id) notFound();

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  if (!inquiry) notFound();

  const hasPrices = inquiry.items.some((x) => typeof x.unitPriceCzkSnapshot === "number");
  const totalCzk = inquiry.items.reduce(
    (s, it) => s + (it.unitPriceCzkSnapshot ?? 0) * it.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xl font-semibold tracking-tight">Detail poptávky</div>
            <div className="text-sm text-zinc-400">{inquiry.id}</div>
          </div>
          <Link
            href="/admin/inquiries"
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
          >
            ← Zpět
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 grid gap-6">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-base font-semibold">
                {inquiry.user.email}
                {inquiry.user.name ? ` · ${inquiry.user.name}` : ""}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {new Date(inquiry.createdAt).toLocaleString("cs-CZ")} ·{" "}
                {inquiry.customerTypeSnapshot}/{inquiry.statusSnapshot}
              </div>
            </div>

            <form
              action="/api/admin/inquiries/set-status"
              method="post"
              className="flex items-center gap-2"
            >
              <input type="hidden" name="id" value={inquiry.id} />
              <select
                name="status"
                defaultValue={inquiry.status}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100"
              >
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200">
                Uložit
              </button>
            </form>
          </div>

          {inquiry.note && (
            <div className="mt-4 rounded-2xl border border-zinc-900 bg-zinc-950/30 p-4 text-sm text-zinc-200">
              <div className="text-xs font-semibold text-zinc-400">Poznámka</div>
              <div className="mt-2 whitespace-pre-wrap">{inquiry.note}</div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
          <div className="text-sm font-semibold text-zinc-200">Položky</div>

          <div className="mt-4 grid gap-3">
            {inquiry.items.map((it) => (
              <div key={it.id} className="rounded-2xl border border-zinc-900 bg-zinc-950/30 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold">{it.nameSnapshot}</div>
                    <div className="mt-1 text-xs text-zinc-500">{it.skuSnapshot ?? ""}</div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-xs font-semibold text-zinc-200">
                      ks: {it.quantity}
                    </span>

                    {typeof it.unitPriceCzkSnapshot === "number" ? (
                      <div className="text-zinc-200">
                        {formatCzk(it.unitPriceCzkSnapshot)} / ks
                        <span className="text-zinc-600"> · </span>
                        <span className="font-semibold">
                          {formatCzk(it.unitPriceCzkSnapshot * it.quantity)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-zinc-500">Cena nebyla dostupná</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasPrices && (
            <div className="mt-5 flex items-center justify-end text-sm text-zinc-300">
              Celkem:{" "}
              <span className="ml-2 text-base font-semibold text-zinc-100">
                {formatCzk(totalCzk)}
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}