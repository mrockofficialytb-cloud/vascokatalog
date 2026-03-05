import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { cookies } from "next/headers";
import { isAdminEmail } from "@/lib/admin";
import ProductDetailClient from "./ProductDetailClient";

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "—";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(val);
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

type Decor = { id: string; label: string; swatchUrl: string };

const DECORS_BY_COLLECTION: Record<string, Decor[]> = {
  CLASSIC: [
    { id: "bila", label: "Bílá", swatchUrl: "/products/decors/bila.jpeg" },
    { id: "dubwindsor", label: "Dub Windsor", swatchUrl: "/products/decors/dubwindsor.jpeg" },
    { id: "buk", label: "Buk", swatchUrl: "/products/decors/buk.jpeg" },
    { id: "dubsanta", label: "Dub Santa", swatchUrl: "/products/decors/dubsanta.jpeg" },
    { id: "granit", label: "Granit", swatchUrl: "/products/decors/granit.jpeg" },
    { id: "beton", label: "Beton", swatchUrl: "/products/decors/beton.jpeg" },
    { id: "cerna", label: "Černá", swatchUrl: "/products/decors/cerna.jpeg" },
  ],

  PREMIUM: [
    { id: "stribrna", label: "Broušená stříbrná", swatchUrl: "/products/decors/brushedsilver.jpeg" },
    { id: "zlata", label: "Královsky zlatá", swatchUrl: "/products/decors/royalgold.jpeg" },
    { id: "bronzova", label: "Antická bronzová", swatchUrl: "/products/decors/antiquebronze.jpeg" },
  ],

  SPAZIO: [
    { id: "kasmir", label: "Kašmír", swatchUrl: "/products/decors/kasmir.jpeg" },
    { id: "bilyratan", label: "Bílý ratan", swatchUrl: "/products/decors/bilyratan.jpeg" },
    { id: "seda", label: "Šedý", swatchUrl: "/products/decors/seda.jpeg" },
    { id: "dubsonoma", label: "Dub Sonoma", swatchUrl: "/products/decors/dubsonoma.jpeg" },
    { id: "dubartisan", label: "Dub Artisan", swatchUrl: "/products/decors/dubartisan.jpeg" },
    { id: "medovydub", label: "Medový dub", swatchUrl: "/products/decors/medovydub.jpeg" },
    { id: "dubwotan", label: "Dub Wotan", swatchUrl: "/products/decors/dubwotan.jpeg" },
    { id: "svetlyorech", label: "Světlý ořech", swatchUrl: "/products/decors/svetlyorech.jpeg" },
    { id: "tmavyorech", label: "Tmavý ořech", swatchUrl: "/products/decors/tmavyorech.jpeg" },
    { id: "kamen", label: "Kámen", swatchUrl: "/products/decors/kamen.jpeg" },
    { id: "olivovezelena", label: "Olivově zelená", swatchUrl: "/products/decors/olivovezelena.jpeg" },
    { id: "lahvovezelena", label: "Lahvově zelená", swatchUrl: "/products/decors/lahvovezelena.jpeg" },
    { id: "antracit", label: "Antracit", swatchUrl: "/products/decors/antracit.jpeg" },
  ],

  MODULLO: [
    { id: "bila", label: "Bílá", swatchUrl: "/products/decors/bilabila.jpeg" },
    { id: "medovydub_bila", label: "Medový dub", swatchUrl: "/products/decors/medovydubbila.jpeg" },
    { id: "dubwotan_bila", label: "Dub Wotan", swatchUrl: "/products/decors/dubwotanbila.jpeg" },
    { id: "tmavyorech_bila", label: "Tmavý ořech", swatchUrl: "/products/decors/tmavyorechbila.jpeg" },
    { id: "dubwindsor_cerny", label: "Dub Windsor", swatchUrl: "/products/decors/dubwindsorcerny.jpeg" },
    { id: "medovydub_cerny", label: "Medový dub", swatchUrl: "/products/decors/medovydubcerny.jpeg" },
    { id: "cerna", label: "Černá", swatchUrl: "/products/decors/cernacerna.jpeg" },
  ],

  RIFFCELLO: [
    { id: "oakviking", label: "Dub Viking", swatchUrl: "/products/decors/dubviking.jpeg" },
    { id: "oaknatural", label: "Dub přírodní", swatchUrl: "/products/decors/dubprirodni.jpeg" },
    { id: "tyk", label: "Týk", swatchUrl: "/products/decors/tyk.jpeg" },
    { id: "med", label: "Měď", swatchUrl: "/products/decors/med.jpeg" },
    { id: "cernybeton", label: "Černý beton", swatchUrl: "/products/decors/cernybeton.jpeg" },
    { id: "cernymat", label: "Černý mat", swatchUrl: "/products/decors/cernymat.jpeg" },
  ],
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  if (!slug) notFound();

  const isLoggedIn = !!session?.user?.email;
  const customerType = (session as any)?.customerType as
    | "B2C"
    | "B2B_SMALL"
    | "B2B_BIG"
    | undefined;

  const status = (session as any)?.status as "ACTIVE" | "PENDING" | "DISABLED" | undefined;

  const email = session?.user?.email ?? null;
  const isAdmin = isAdminEmail(email);

  const userId = (session as any)?.userId as string | undefined;

  const userName =
    (session?.user as any)?.name ||
    (session as any)?.name ||
    (session as any)?.user?.name ||
    null;

  const primaryLabel = userName || email || "Uživatel";

  const cartCount =
    isLoggedIn && userId ? await prisma.cartItem.count({ where: { cart: { userId } } }) : 0;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      collection: true,
      prices:
        isLoggedIn && status === "ACTIVE" && customerType
          ? {
              where: { customerType },
              select: { amountCzk: true, currency: true },
              take: 1,
            }
          : false,
    },
  });

  if (!product) notFound();

  const price = (product as any).prices?.[0]?.amountCzk ?? null;

  // Galerie – zatím 1 reálná + placeholdery
  const gallery = [
    product.imageUrl || "/products/placeholder.jpg",
    "/products/placeholder.jpg",
    "/products/placeholder.jpg",
  ];

  const collection = (product.collection ?? "CLASSIC").toString().toUpperCase();
  const decors = DECORS_BY_COLLECTION[collection] ?? DECORS_BY_COLLECTION.CLASSIC;

  // Thumbs podle kolekce (max 8)
  const decorThumbs = decors.map((d) => d.swatchUrl).slice(0, 8);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background vibe */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,255,255,0.05),transparent_50%),radial-gradient(700px_circle_at_50%_120%,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.6))]" />
      </div>

      {/* TOP BAR (stejné jako katalog) */}
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

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{product.name}</div>
            <div className="mt-1 text-sm text-zinc-400">Kolekce: {collection}</div>
          </div>

          <Link
            href="/catalog"
            className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 inline-flex items-center"
          >
            Zpět do katalogu
          </Link>
        </div>

        <ProductDetailClient
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description ?? "",
            collection,
            priceLabel: price == null ? "Po přihlášení / schválení" : formatCzk(price),
            gallery,
            decorThumbs,
            decors,
          }}
          canOrder={isLoggedIn}
        />
      </div>
    </main>
  );
}