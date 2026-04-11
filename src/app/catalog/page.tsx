import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

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
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(val);
}

const COLLECTION_BY_SKU: Record<string, string> = {
  "LAM-CLASSIC": "CLASSIC",
  "LAM-PREMIUM": "PREMIUM",
  "LAM-SPAZIO": "SPAZIO",
  "LAM-MODULLO": "MODULLO",
  "RIFFCELLO-SET-STD": "RIFFCELLO",
  "RIFFCELLO-SET-PREMIUM": "RIFFCELLO",
  "RIFFCELLO-LISTY-STD": "RIFFCELLO",
  "RIFFCELLO-LISTY-PREMIUM": "RIFFCELLO",
};

function getCollection(p: Product) {
  const direct = (p.collection ?? "").trim();
  if (direct) return direct.toUpperCase();
  const sku = (p.sku ?? "").trim().toUpperCase();
  return sku && COLLECTION_BY_SKU[sku] ? COLLECTION_BY_SKU[sku] : "COLLECTION";
}

function ProductCard({ p }: { p: Product }) {
  const img = p.imageUrl || "/products/placeholder.jpg";
  const collection = getCollection(p);

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-zinc-100">
        <Image
          src={img}
          alt={p.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />

        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-800 backdrop-blur">
            {collection}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 sm:text-base">
            {p.name}
          </div>

          {p.description ? (
            <div className="mt-2 text-sm text-zinc-500">{p.description}</div>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="text-xs text-zinc-500">Cena je uvedena bez DPH</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            {p.price ? formatCzk(p.price.amountCzk) : null}
          </div>
        </div>

        <div className="mt-5">
          <Link
            href={`/catalog/${p.slug}`}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:h-12"
          >
            Zobrazit produkt
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function CatalogPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const baseUrl =
    process.env.NEXTAUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  const data = (await res.json()) as { products: Product[] };

  const mainProducts = data.products.filter(
    (p) => !(p.sku ?? "").toUpperCase().startsWith("RIFFCELLO-LISTY")
  );

  const accessoryProducts = data.products.filter((p) =>
    (p.sku ?? "").toUpperCase().startsWith("RIFFCELLO-LISTY")
  );

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Header />

      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            KATALOG PRODUKTŮ
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Vyberte produkt a zobrazte detail. Ceny budou potvrzeny v nabídce.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {mainProducts.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {accessoryProducts.length > 0 && (
          <>
            <div className="mb-8 mt-16">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
                DOPLŇKY K PANELŮM
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                Doplňkové lišty k panelům RIFFCELLO. Vyberte variantu a zobrazte detail produktu.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {accessoryProducts.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </>
        )}

        {data.products.length === 0 && (
          <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
            <div className="text-base font-semibold text-zinc-900">
              Zatím tu nejsou žádné produkty
            </div>
            <div className="mt-2 text-sm text-zinc-500">
              Přidej je přes seed nebo admin část.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}