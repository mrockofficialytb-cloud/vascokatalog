import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProductDetailClient from "./ProductDetailClient";

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(val);
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
      <Header />

      <div className="mx-auto max-w-[1800px] px-3 py-6 sm:px-6 sm:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              {product.name}
            </div>
            <div className="mt-1 text-sm text-zinc-500">Kolekce: {collection}</div>
          </div>

          <Link
            href="/catalog"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:h-12"
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