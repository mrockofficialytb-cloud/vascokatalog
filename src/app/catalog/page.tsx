import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { AddToCart } from "@/components/AddToCart";
import { isAdminEmail } from "@/lib/admin";

type Product = {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
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

  // ✅ jméno (když existuje)
  const userName =
    (session?.user as any)?.name ||
    (session as any)?.name ||
    (session as any)?.user?.name ||
    null;

  // ✅ co zobrazit nahoře v bublině
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
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/50" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">VASCO</div>
              <div className="text-xs text-zinc-400">B2B katalog</div>
            </div>
          </div>

          {/* Right actions */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link className="text-sm font-semibold text-zinc-200 hover:text-white" href="/login">
                Přihlásit
              </Link>
              <span className="text-zinc-700">•</span>
              <Link className="text-sm font-semibold text-zinc-200 hover:text-white" href="/register">
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

                {/* User box (ADMIN = jméno, ostatní = email) */}
               <div className="hidden min-w-[320px] h-12 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 sm:flex">

  {/* Avatar */}
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
    {getInitials(userName || email || "")}
  </div>

  {/* User info */}
  <div className="flex flex-col leading-tight">
    <span className="text-sm font-semibold text-zinc-100 whitespace-nowrap">
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

                {/* ADMIN PANEL úplně vpravo */}
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
                      {/* dveře */}
                      <path d="M4 3h10v18H4z" />
                      {/* klika */}
                      <circle cx="11" cy="12" r="0.8" fill="currentColor" />
                      {/* šipka ven */}
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
          <h1 className="text-3xl font-semibold tracking-tight">Katalog produktů</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Vytvoř si poptávku. Poptávka je nezávazná – ceny budou potvrzeny v nabídce.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 shadow-sm transition hover:border-zinc-800 hover:bg-zinc-900/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold leading-snug">{p.name}</div>
                  <div className="mt-2 inline-flex items-center gap-2">
                    {p.sku && (
                      <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-xs font-semibold text-zinc-200">
                        {p.sku}
                      </span>
                    )}
                    <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                      {p.price ? "Cena dostupná" : "Cena skrytá"}
                    </span>
                  </div>
                </div>

                <div className="h-10 w-10 shrink-0 rounded-xl border border-zinc-800 bg-zinc-950/40" />
              </div>

              <div className="mt-4 text-sm text-zinc-400">
                {p.description ? clampText(p.description) : "—"}
              </div>

              <div className="mt-6">
                <div className="text-xs text-zinc-500">Cena</div>
                <div className="mt-1 text-lg font-semibold">
                  {p.price ? (
                    formatCzk(p.price.amountCzk)
                  ) : (
                    <span className="text-zinc-500">Po přihlášení / schválení</span>
                  )}
                </div>

                {isLoggedIn ? (
                  <AddToCart productId={p.id} />
                ) : (
                  <div className="mt-5 text-sm text-zinc-400">
                    Pro tvorbu poptávky se prosím{" "}
                    <Link className="underline" href="/login">
                      přihlas
                    </Link>
                    .
                  </div>
                )}
              </div>
            </div>
          ))}
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