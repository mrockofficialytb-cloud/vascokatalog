import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admin";
import Image from "next/image";

type Product = {
  id: string;
  sku: string | null;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  collection: string | null;
  price: { amountCzk: number; currency: string } | null;
};

function formatCzk(amountCzk: number) {
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(val);
}

function clampText(text: string, max = 120) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function customerTypeCz(type?: string) {
  if (type === "B2B_BIG") return "Velkoodběratel";
  if (type === "B2B_SMALL") return "Maloodběratel";
  if (type === "B2C") return "Základní nabídka";
  return "Zákazník";
}

function statusCz(status?: string) {
  if (status === "ACTIVE") return "Schváleno";
  if (status === "PENDING") return "Čeká na schválení";
  if (status === "DISABLED") return "Odmítnuto";
  return "Neznámý stav";
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// fallback jen kdyby collection někde chyběla
const COLLECTION_BY_SKU: Record<string, string> = {
  "LAM-001": "CLASSIC",
  "LAM-002": "PREMIUM",
  "LAM-003": "SPAZIO",
  "LAM-004": "MODULLO",
  // "LAM-005": "RIFFCELLO",
};

function getCollection(p: Product) {
  const direct = (p.collection ?? "").trim();
  if (direct) return direct.toUpperCase();
  const sku = (p.sku ?? "").trim().toUpperCase();
  return sku && COLLECTION_BY_SKU[sku] ? COLLECTION_BY_SKU[sku] : "COLLECTION";
}

export default async function CatalogPage() {
  const session = await auth();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const baseUrl = process.env.NEXTAUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  const data = (await res.json()) as { products: Product[] };

  const isLoggedIn = !!session?.user?.email;
  const customerType = (session as any)?.customerType as string | undefined;
  const status = (session as any)?.status as string | undefined;
  const userId = (session as any)?.userId as string | undefined;

  const email = session?.user?.email ?? null;
  const isAdmin = isAdminEmail(email);

  const userName =
    (session?.user as any)?.name ||
    (session as any)?.name ||
    (session as any)?.user?.name ||
    null;

  const primaryLabel = userName || email || "Uživatel";

  const cartCount =
    isLoggedIn && userId ? await prisma.cartItem.count({ where: { cart: { userId } } }) : 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background vibe */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,255,255,0.05),transparent_50%),radial-gradient(700px_circle_at_50%_120%,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.6))]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Left brand */}
          <Link href="/catalog" className="flex items-center">
            <Image
              src="/vascologo.png"
              alt="VASCO"
              width={400}
              height={200}
              priority
              style={{ height: "100px", width: "auto" }}
            />
          </Link>

          {/* Right actions */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link className="text-sm font-semibold text-zinc-200 hover:text-white" href="/login">
                Přihlásit
              </Link>
              <span className="text-zinc-700">•</span>
              <Link
                className="text-sm font-semibold text-zinc-200 hover:text-white"
                href="/register"
              >
                Registrovat
              </Link>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-end">
              <div className="flex items-center gap-3">
                {/* Poptávka */}
                <Link
                  href="/cart"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                >
                  Poptávka
                  <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-0.5 text-xs">
                    {cartCount}
                  </span>
                </Link>

                {/* User box */}
                <div className="hidden h-12 min-w-[320px] items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
                    {getInitials(userName || email || "")}
                  </div>

                  <div className="flex flex-col leading-tight">
                    <span className="whitespace-nowrap text-sm font-semibold text-zinc-100">
                      {primaryLabel}
                    </span>

                    {isAdmin ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        Administrátor
                      </span>
                    ) : (
                      <span className="mt-1 text-xs font-semibold text-zinc-400">
                        {customerTypeCz(customerType)} • {statusCz(status)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Odhlásit */}
                <form action="/logout" method="post">
                  <button className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200">
                    Odhlásit
                  </button>
                </form>

                {/* Admin */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="ml-6 inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                  >
                    <svg
                      className="h-5 w-5 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 3h10v18H4z" />
                      <circle cx="11" cy="12" r="0.8" fill="currentColor" />
                      <path
                        d="M14 12h6M17 9l3 3-3 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Administrace</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">KATALOG PRODUKTŮ</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Vyberte produkt a zobrazte detail. Ceny budou potvrzeny v nabídce.
          </p>

          {isLoggedIn && status === "PENDING" && (
            <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-amber-100">
              <div className="font-semibold">Účet čeká na schválení</div>
              <div className="mt-1 text-sm opacity-90">
                Po aktivaci velkoodběru se automaticky zobrazí ceny.
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.products.map((p) => {
            const img = p.imageUrl || "/products/placeholder.jpg";
            const collection = getCollection(p);

            return (
              <div
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/25 shadow-sm transition hover:border-zinc-800 hover:bg-zinc-900/35"
              >
                {/* IMAGE */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950/40">
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />

                  {/* collection badge */}
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-100 backdrop-blur">
                      {collection}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold leading-snug">{p.name}</div>
                    <div className="mt-2 text-sm text-zinc-400">
                      {p.description ? clampText(p.description, 90) : "—"}
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="mt-5">
                    <div className="text-xs text-zinc-500">Cena</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">
                      {p.price ? (
                        formatCzk(p.price.amountCzk)
                      ) : (
                        <span className="text-zinc-500">Po přihlášení / schválení</span>
                      )}
                    </div>
                  </div>

                  {/* CTA full width */}
                  <div className="mt-5">
                    <Link
  href={`/catalog/${p.slug}`}
  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
>
  Zobrazit produkt
</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {data.products.length === 0 && (
          <div className="mt-10 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-8 text-center">
            <div className="text-base font-semibold">Zatím tu nejsou žádné produkty</div>
            <div className="mt-2 text-sm text-zinc-400">
              Přidej je přes seed nebo admin část (doděláme).
            </div>
          </div>
        )}
      </div>
    </main>
  );
}