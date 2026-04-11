import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { isAdminEmail } from "@/lib/admin";
import ProductDetailClient from "./ProductDetailClient";

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(val);
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

type Decor = {
  id: string;
  label: string;
  swatchUrl: string;
  imageUrl: string;
};

const DECORS_BY_COLLECTION: Record<string, Decor[]> = {
  CLASSIC: [
    {
      id: "bila",
      label: "Bílá",
      swatchUrl: "/products/decors/bila.jpeg",
      imageUrl: "/products/classic/classic-bila-v2.jpg",
    },
    {
      id: "dubwindsor",
      label: "Dub Windsor",
      swatchUrl: "/products/decors/dubwindsor.jpeg",
      imageUrl: "/products/classic/classic-dubwindsor.jpg",
    },
    {
      id: "buk",
      label: "Buk",
      swatchUrl: "/products/decors/buk.jpeg",
      imageUrl: "/products/classic/classic-buk.jpg",
    },
    {
      id: "dubsanta",
      label: "Dub Santa",
      swatchUrl: "/products/decors/dubsanta.jpeg",
      imageUrl: "/products/classic/classic-dubsanta.jpg",
    },
    {
      id: "granit",
      label: "Granit",
      swatchUrl: "/products/decors/granit.jpeg",
      imageUrl: "/products/classic/classic-granit.jpg",
    },
    {
      id: "beton",
      label: "Beton",
      swatchUrl: "/products/decors/beton.jpeg",
      imageUrl: "/products/classic/classic-beton.jpg",
    },
    {
      id: "cerna",
      label: "Černá",
      swatchUrl: "/products/decors/cerna.jpeg",
      imageUrl: "/products/classic/classic-cerna-v2.jpg",
    },
  ],

  PREMIUM: [
    {
      id: "stribrna",
      label: "Broušená stříbrná",
      swatchUrl: "/products/decors/brushedsilver.jpeg",
      imageUrl: "/products/premium/premium-stribrna.jpg",
    },
    {
      id: "zlata",
      label: "Královsky zlatá",
      swatchUrl: "/products/decors/royalgold.jpeg",
      imageUrl: "/products/premium/premium-zlata.jpg",
    },
    {
      id: "bronzova",
      label: "Antická bronzová",
      swatchUrl: "/products/decors/antiquebronze.jpeg",
      imageUrl: "/products/premium/premium-bronzova.jpg",
    },
  ],

  SPAZIO: [
    {
      id: "kasmir",
      label: "Kašmír",
      swatchUrl: "/products/decors/kasmir.jpeg",
      imageUrl: "/products/spazio/spazio-kasmir.jpg",
    },
    {
      id: "bilyratan",
      label: "Bílý ratan",
      swatchUrl: "/products/decors/bilyratan.jpeg",
      imageUrl: "/products/spazio/spazio-bilyratan.jpg",
    },
    {
      id: "seda",
      label: "Šedý",
      swatchUrl: "/products/decors/seda.jpeg",
      imageUrl: "/products/spazio/spazio-sedy.jpg",
    },
    {
      id: "dubsonoma",
      label: "Dub Sonoma",
      swatchUrl: "/products/decors/dubsonoma.jpeg",
      imageUrl: "/products/spazio/spazio-dubsonoma.jpg",
    },
    {
      id: "dubartisan",
      label: "Dub Artisan",
      swatchUrl: "/products/decors/dubartisan.jpeg",
      imageUrl: "/products/spazio/spazio-dubartisan.jpg",
    },
    {
      id: "medovydub",
      label: "Medový dub",
      swatchUrl: "/products/decors/medovydub.jpeg",
      imageUrl: "/products/spazio/spazio-medovydub.jpg",
    },
    {
      id: "dubwotan",
      label: "Dub Wotan",
      swatchUrl: "/products/decors/dubwotan.jpeg",
      imageUrl: "/products/spazio/spazio-dubwotan.jpg",
    },
    {
      id: "svetlyorech",
      label: "Světlý ořech",
      swatchUrl: "/products/decors/svetlyorech.jpeg",
      imageUrl: "/products/spazio/spazio-svetlyorech.jpg",
    },
    {
      id: "tmavyorech",
      label: "Tmavý ořech",
      swatchUrl: "/products/decors/tmavyorech.jpeg",
      imageUrl: "/products/spazio/spazio-tmavyorech.jpg",
    },
    {
      id: "olivovezelena",
      label: "Olivově zelená",
      swatchUrl: "/products/decors/olivovezelena.jpeg",
      imageUrl: "/products/spazio/spazio-olivovezelena.jpg",
    },
    {
      id: "lahvovezelena",
      label: "Lahvově zelená",
      swatchUrl: "/products/decors/lahvovezelena.jpeg",
      imageUrl: "/products/spazio/spazio-lahvovezelena.jpg",
    },
    {
      id: "antracit",
      label: "Antracit",
      swatchUrl: "/products/decors/antracit.jpeg",
      imageUrl: "/products/spazio/spazio-antracit.jpg",
    },
  ],

  MODULLO: [
    {
      id: "bila",
      label: "Bílá",
      swatchUrl: "/products/decors/bilabila.jpeg",
      imageUrl: "/products/modullo/modullo-bila-v2.jpg",
    },
    {
      id: "medovydub_bila",
      label: "Medový dub",
      swatchUrl: "/products/decors/medovydubbila.jpeg",
      imageUrl: "/products/modullo/modullo-medovydub-bila.jpg",
    },
    {
      id: "dubwotan_bila",
      label: "Dub Wotan",
      swatchUrl: "/products/decors/dubwotanbila.jpeg",
      imageUrl: "/products/modullo/modullo-dubwotan-bila.jpg",
    },
    {
      id: "tmavyorech_bila",
      label: "Tmavý ořech",
      swatchUrl: "/products/decors/tmavyorechbila.jpeg",
      imageUrl: "/products/modullo/modullo-tmavyorech-bila.jpg",
    },
    {
      id: "dubwindsor_cerny",
      label: "Dub Windsor",
      swatchUrl: "/products/decors/dubwindsorcerny.jpeg",
      imageUrl: "/products/modullo/modullo-dubwindsor-cerny.jpg",
    },
    {
      id: "medovydub_cerny",
      label: "Medový dub",
      swatchUrl: "/products/decors/medovydubcerny.jpeg",
      imageUrl: "/products/modullo/modullo-medovydub-cerny.jpg",
    },
    {
      id: "cerna",
      label: "Černá",
      swatchUrl: "/products/decors/cernacerna.jpeg",
      imageUrl: "/products/modullo/modullo-cerna.jpg",
    },
  ],

  RIFFCELLO: [
    {
      id: "oakviking",
      label: "Dub Viking",
      swatchUrl: "/products/decors/dubviking.jpeg",
      imageUrl: "/products/riffcello/riffcello-oakviking.jpg",
    },
    {
      id: "oaknatural",
      label: "Dub přírodní",
      swatchUrl: "/products/decors/dubprirodni.jpeg",
      imageUrl: "/products/riffcello/riffcello-oaknatural.jpg",
    },
    {
      id: "tyk",
      label: "Týk",
      swatchUrl: "/products/decors/tyk.jpeg",
      imageUrl: "/products/riffcello/riffcello-tyk.jpg",
    },
    {
      id: "med",
      label: "Měď",
      swatchUrl: "/products/decors/med.jpeg",
      imageUrl: "/products/riffcello/riffcello-med.jpg",
    },
    {
      id: "cernybeton",
      label: "Černý beton",
      swatchUrl: "/products/decors/cernybeton.jpeg",
      imageUrl: "/products/riffcello/riffcello-cernybeton.jpg",
    },
    {
      id: "cernymat",
      label: "Černý mat",
      swatchUrl: "/products/decors/cernymat.jpeg",
      imageUrl: "/products/riffcello/riffcello-cernymat.jpg",
    },
  ],
};

const RIFFCELLO_DECORS_BY_SLUG: Record<string, Decor[]> = {
  "riffcello-sestava-standard": [
    {
      id: "dub",
      label: "Dub Viking",
      swatchUrl: "/products/decors/dubviking.jpeg",
      imageUrl: "/products/riffcello/riffcello-oakviking.jpg",
    },
    {
      id: "oak",
      label: "Dub přírodní",
      swatchUrl: "/products/decors/dubprirodni.jpeg",
      imageUrl: "/products/riffcello/riffcello-oaknatural.jpg",
    },
    {
      id: "teak540",
      label: "Teak 540",
      swatchUrl: "/products/decors/tyk.jpeg",
      imageUrl: "/products/riffcello/riffcello-tyk.jpg",
    },
  ],

  "riffcello-sestava-premium": [
    {
      id: "cooper345",
      label: "Měď",
      swatchUrl: "/products/decors/med.jpeg",
      imageUrl: "/products/riffcello/no-image.png",
    },
    {
      id: "black",
      label: "Černý beton",
      swatchUrl: "/products/decors/cernybeton.jpeg",
      imageUrl: "/products/riffcello/riffcello-cernybeton.jpg",
    },
    {
      id: "blackmatt",
      label: "Černý mat",
      swatchUrl: "/products/decors/cernacerna.jpeg",
      imageUrl: "/products/riffcello/riffcello-cernymat.jpg",
    },
  ],

  "riffcello-doplnkove-listy-standard": [
    {
      id: "dub",
      label: "Dub Viking - lišta",
      swatchUrl: "/products/decors/dubviking.jpeg",
      imageUrl: "/products/riffcello/listy/riffcello-oakviking.jpg",
    },
    {
      id: "oak",
      label: "Dub přírodní - lišta",
      swatchUrl: "/products/decors/dubprirodni.jpeg",
      imageUrl: "/products/riffcello/listy/riffcello-oaknatural.jpg",
    },
    {
      id: "teak540",
      label: "Týk - lišta",
      swatchUrl: "/products/decors/tyk.jpeg",
      imageUrl: "/products/riffcello/listy/riffcello-tyk.jpg",
    },
  ],

  "riffcello-doplnkove-listy-premium": [
    {
      id: "cooper",
      label: "Měď - lišta",
      swatchUrl: "/products/decors/med.jpeg",
      imageUrl: "/products/riffcello/listy/no-image.png",
    },
    {
      id: "black",
      label: "Černá - lišta",
      swatchUrl: "/products/decors/cernybeton.jpeg",
      imageUrl: "/products/riffcello/listy/riffcello-cernybeton.jpg",
    },
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
      prices: {
        select: { amountCzk: true, currency: true },
        orderBy: { amountCzk: "asc" },
        take: 1,
      },
    },
  });

  if (!product) notFound();

  const price = product.prices?.[0]?.amountCzk ?? null;

  const gallery = [
    product.imageUrl || "/products/placeholder.jpg",
    "/products/placeholder.jpg",
    "/products/placeholder.jpg",
  ];

  const collection = (product.collection ?? "CLASSIC").toString().toUpperCase();

  const decorsRaw =
    collection === "RIFFCELLO"
      ? RIFFCELLO_DECORS_BY_SLUG[product.slug] ?? []
      : DECORS_BY_COLLECTION[collection] ?? DECORS_BY_COLLECTION.CLASSIC;

  const decors = decorsRaw.map((d) => ({
    ...d,
    imageUrl: d.imageUrl || product.imageUrl || "/products/placeholder.jpg",
  }));

  const decorThumbs = decors.map((d) => d.swatchUrl);

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-3">
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

          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                className="text-sm font-semibold text-zinc-700 transition hover:text-black"
                href="/login"
              >
                Přihlásit
              </Link>
              <span className="text-zinc-300">•</span>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                href="/register"
              >
                Registrovat
              </Link>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-end">
              <div className="flex items-center gap-3">
                <Link
                  href="/cart"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Poptávka
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                    {cartCount}
                  </span>
                </Link>

                <div className="hidden h-12 min-w-[320px] items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    {getInitials(userName || email || "")}
                  </div>

                  <div className="flex flex-col leading-tight">
                    <span className="whitespace-nowrap text-sm font-semibold text-zinc-900">
                      {primaryLabel}
                    </span>

                    {isAdmin ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Administrátor
                      </span>
                    ) : (
                      <span className="mt-1 text-xs font-semibold text-zinc-500">
                        {customerTypeCz(customerType)} • {statusCz(status)}
                      </span>
                    )}
                  </div>
                </div>

                <form action="/logout" method="post">
                  <button className="h-12 rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-800">
                    Odhlásit
                  </button>
                </form>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="ml-3 inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                  >
                    <svg
                      className="h-5 w-5 text-zinc-500"
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

      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-900">{product.name}</div>
            <div className="mt-1 text-sm text-zinc-500">Kolekce: {collection}</div>
          </div>

          <Link
            href="/catalog"
            className="inline-flex h-12 items-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
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
            priceLabel: formatCzk(price),
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