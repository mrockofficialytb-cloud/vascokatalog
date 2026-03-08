import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

const ADMIN_EMAIL = "mrockuw@seznam.cz";

function formatCzk(amountCzk: number) {
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(val);
}

function statusLabel(status: string) {
  if (status === "NEW") return "Nová poptávka";
  if (status === "IN_PROGRESS") return "Ve zpracování";
  if (status === "DONE") return "Dokončeno";
  if (status === "CANCELED") return "Storno";
  return status;
}

function Step({
  label,
  active = false,
  done = false,
  danger = false,
}: {
  label: string;
  active?: boolean;
  done?: boolean;
  danger?: boolean;
}) {
  const dotClass = danger
    ? "bg-red-400"
    : active || done
    ? "bg-emerald-400"
    : "bg-zinc-600";

  const textClass = danger
    ? "text-red-300"
    : active
    ? "text-zinc-100"
    : done
    ? "text-emerald-300"
    : "text-zinc-500";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
      <span className={`text-xs font-semibold ${textClass}`}>{label}</span>
    </div>
  );
}

function Timeline({ status }: { status: string }) {
  const isNew = status === "NEW" || status === "IN_PROGRESS" || status === "DONE";
  const isProgress = status === "IN_PROGRESS" || status === "DONE";
  const isDone = status === "DONE";
  const isCanceled = status === "CANCELED";

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Stav objednávky
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Step label="Nová poptávka" active={status === "NEW"} done={isNew && status !== "NEW"} />
        <div className={`hidden h-px w-8 sm:block ${isProgress || isDone ? "bg-emerald-400/60" : "bg-zinc-800"}`} />

        <Step
          label="Ve zpracování"
          active={status === "IN_PROGRESS"}
          done={status === "DONE"}
        />
        <div className={`hidden h-px w-8 sm:block ${isDone ? "bg-emerald-400/60" : "bg-zinc-800"}`} />

        <Step label="Dokončeno" active={status === "DONE"} />

        <div className="hidden h-px w-8 bg-zinc-800 sm:block" />
        <Step label="Storno" active={isCanceled} danger={isCanceled} />
      </div>
    </div>
  );
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
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      status: true,
      note: true,
      customerTypeSnapshot: true,
      statusSnapshot: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      items: {
        orderBy: { id: "asc" },
      },
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
            <div className="text-xl font-semibold tracking-tight">DETAIL POPTÁVKY</div>
            <div className="text-sm text-zinc-400">
              VASCO-{String(inquiry.orderNumber).padStart(4, "0")}
            </div>
          </div>

          <Link
            href="/admin/inquiries"
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
          >
            ← Zpět
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10">
        <Timeline status={inquiry.status} />

        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
  className="flex flex-col gap-3 sm:items-end"
>
  <input type="hidden" name="inquiryId" value={inquiry.id} />
  <input type="hidden" name="redirectTo" value={`/admin/inquiries/${inquiry.id}`} />

  <details className="group relative min-w-[240px] rounded-2xl border border-zinc-800 bg-zinc-950/60">
    <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-2xl px-4 text-sm font-semibold text-zinc-100">
      <span>{statusLabel(inquiry.status).toUpperCase()}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-400 transition group-open:rotate-180"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </summary>

    <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
      <button
        type="submit"
        name="status"
        value="NEW"
        className={[
          "flex h-11 w-full items-center px-4 text-left text-sm font-semibold transition",
          inquiry.status === "NEW"
            ? "bg-white text-zinc-950"
            : "text-zinc-100 hover:bg-zinc-900",
        ].join(" ")}
      >
        Nová poptávka
      </button>

      <button
        type="submit"
        name="status"
        value="IN_PROGRESS"
        className={[
          "flex h-11 w-full items-center px-4 text-left text-sm font-semibold transition",
          inquiry.status === "IN_PROGRESS"
            ? "bg-white text-zinc-950"
            : "text-zinc-100 hover:bg-zinc-900",
        ].join(" ")}
      >
        Ve zpracování
      </button>

      <button
        type="submit"
        name="status"
        value="DONE"
        className={[
          "flex h-11 w-full items-center px-4 text-left text-sm font-semibold transition",
          inquiry.status === "DONE"
            ? "bg-white text-zinc-950"
            : "text-zinc-100 hover:bg-zinc-900",
        ].join(" ")}
      >
        Dokončeno
      </button>

      <button
        type="submit"
        name="status"
        value="CANCELED"
        className={[
          "flex h-11 w-full items-center px-4 text-left text-sm font-semibold transition",
          inquiry.status === "CANCELED"
            ? "bg-white text-zinc-950"
            : "text-red-200 hover:bg-zinc-900",
        ].join(" ")}
      >
        Storno
      </button>
    </div>
  </details>
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
              <div
                key={it.id}
                className="rounded-2xl border border-zinc-900 bg-zinc-950/30 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold">{it.nameSnapshot}</div>

                    {it.skuSnapshot && (
                      <div className="mt-1 text-xs text-zinc-500">{it.skuSnapshot}</div>
                    )}

                    {it.decorSnapshot && (
                      <div className="mt-2 text-xs text-zinc-400">
                        Dekor: {it.decorSnapshot}
                      </div>
                    )}

                    {it.feltSnapshot && (
                      <div className="text-xs text-zinc-300">
                        Varianta: {it.feltSnapshot === "felt" ? "S filcem" : "Bez filcu"}
                      </div>
                    )}
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

          <div className="mt-6 flex items-end justify-between gap-4">
            <a
  href={`/api/inquiries/${inquiry.id}/pdf`}
  target="_blank"
  className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="opacity-70"
  >
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
  Stáhnout PDF
</a>

            {hasPrices && (
              <div className="text-sm text-zinc-300">
                Celkem:{" "}
                <span className="ml-2 text-base font-semibold text-zinc-100">
                  {formatCzk(totalCzk)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}