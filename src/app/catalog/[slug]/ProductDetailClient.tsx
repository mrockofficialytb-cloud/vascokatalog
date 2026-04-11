"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    collection: string;
    priceLabel: React.ReactNode;
    gallery: string[];
    decorThumbs: string[];
    decors: { id: string; label: string; swatchUrl: string; imageUrl: string }[];
  };
  canOrder: boolean;
};

type SpecItem = {
  label: string;
  value: string;
};

type SpecBlock = {
  title: string;
  items: SpecItem[];
  imageUrl?: string;
};

export default function ProductDetailClient({ product, canOrder }: Props) {
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [decor, setDecor] = useState(product.decors?.[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  const decorDetailsRef = useRef<HTMLDetailsElement | null>(null);

  const decorLabel = useMemo(
    () => product.decors.find((d) => d.id === decor)?.label ?? "—",
    [decor, product.decors]
  );

  const activeDecor = useMemo(
    () => product.decors.find((d) => d.id === decor),
    [decor, product.decors]
  );

  const safeQty = Math.max(1, Math.min(999, qty));

  const swatches = useMemo(() => {
    return product.decors ?? [];
  }, [product.decors]);

  const gallery = product.gallery?.length ? product.gallery : ["/products/placeholder.jpg"];

  const activeSrc =
    activeImage === 0
      ? activeDecor?.imageUrl || gallery[0] || "/products/placeholder.jpg"
      : gallery[Math.min(activeImage, gallery.length - 1)] || "/products/placeholder.jpg";

  function closeDecorDropdown() {
    if (decorDetailsRef.current) decorDetailsRef.current.open = false;
  }

  function selectDecor(id: string) {
    setDecor(id);
    setActiveImage(0);
    closeDecorDropdown();
  }

  const specs = useMemo<SpecBlock>(() => {
    const slug = product.slug.toLowerCase();
    const collection = (product.collection || "").toUpperCase();

    if (
      slug === "riffcello-doplnkove-listy-standard" ||
      slug === "riffcello-doplnkove-listy-premium"
    ) {
      return {
        title: "Specifikace výrobku:",
        items: [
          { label: "Výška", value: "2750 mm" },
          { label: "Počet lišt v sadě", value: "2" },
          { label: "Startovací / roh", value: "47 mm" },
          { label: "Koncová / roh", value: "40 mm" },
          { label: "Funkce", value: "Estetické zahájení nebo ukončení panelů" },
          { label: "Výsledek", value: "Jednotné a elegantní dokončení" },
        ],
        imageUrl: "/specifikace/riffcello-listy-schema.png",
      };
    }

    if (collection === "RIFFCELLO") {
      return {
        title: "Specifikace výrobku:",
        items: [
          { label: "Výška", value: "275 cm" },
          { label: "Rozměr panelu", value: "195 × 2750 mm" },
          { label: "Počet panelů v sadě", value: "2" },
          { label: "Celková šířka po spojení", value: "390 mm" },
          { label: "Typ", value: "Dekorativní nástěnné lamely" },
          { label: "Charakter", value: "Výrazná struktura a moderní vzhled" },
        ],
        imageUrl: "/specifikace/riffcello-schema.png",
      };
    }

    if (collection === "CLASSIC") {
      return {
        title: "Specifikace výrobku:",
        items: [
          { label: "Výška", value: "275 cm" },
          { label: "Šířka panelu", value: "27 cm" },
          { label: "Počet lamel na panelu", value: "6" },
          { label: "Šířka lamely", value: "27 mm" },
          { label: "Mezera mezi lamelami", value: "18 mm" },
          { label: "Výška lamely", value: "8 mm" },
          { label: "Tloušťka filcu", value: "6 mm" },
        ],
        imageUrl: "/specifikace/classic-schema.png",
      };
    }

    if (collection === "PREMIUM") {
      return {
        title: "Specifikace výrobku:",
        items: [
          { label: "Výška", value: "275 cm" },
          { label: "Šířka panelu", value: "27 cm" },
          { label: "Počet lamel na panelu", value: "6" },
          { label: "Šířka lamely", value: "27 mm" },
          { label: "Mezera mezi lamelami", value: "18 mm" },
          { label: "Výška lamely", value: "8 mm" },
          { label: "Tloušťka filcu", value: "6 mm" },
        ],
        imageUrl: "/specifikace/premium-schema.png",
      };
    }

    if (collection === "SPAZIO") {
      return {
        title: "Specifikace výrobku:",
        items: [
          { label: "Výška", value: "260 cm" },
          { label: "Šířka panelu", value: "27 cm" },
          { label: "Počet lamel na panelu", value: "4" },
          { label: "Šířka lamely", value: "35 mm" },
          { label: "Mezera mezi lamelami", value: "32 mm" },
          { label: "Výška lamely", value: "8 mm" },
          { label: "Tloušťka filcu", value: "6 mm" },
        ],
        imageUrl: "/specifikace/spazio-schema.png",
      };
    }

    if (collection === "MODULLO") {
      return {
        title: "Specifikace výrobku:",
        items: [
          { label: "Výška", value: "275 cm" },
          { label: "Šířka panelu", value: "271 mm" },
          { label: "Šířka spojky", value: "31 mm" },
          { label: "Počet lamel na panelu", value: "5" },
          { label: "Šířka lamely", value: "35 mm" },
          { label: "Mezera mezi lamelami", value: "24 mm" },
          { label: "Výška lamely", value: "8 mm" },
          { label: "Tloušťka HDF desky", value: "2,5 mm" },
        ],
        imageUrl: "/specifikace/modullo-schema.png",
      };
    }

    return {
      title: "Specifikace výrobku:",
      items: [],
    };
  }, [product.collection, product.slug]);

  const leftColumn = specs.items.slice(0, 4);
  const rightColumn = specs.items.slice(4, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
      <div className="min-w-0 lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="relative aspect-[4/5] w-full bg-zinc-100 sm:aspect-[4/3]">
            <Image
              src={activeSrc}
              alt={`${product.name} – ${decorLabel}`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />

            <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
              <span className="rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-800 backdrop-blur">
                {(product.collection || "COLLECTION").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-white p-3 sm:p-4">
            <div className="mb-2 text-xs font-semibold text-zinc-500">Vzory dekoru</div>

            <div className="-mx-1 overflow-x-auto px-1 pb-2">
              <div className="flex w-max gap-2 pr-2 sm:gap-3">
                {swatches.map((d) => {
                  const isActive = d.id === decor;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => selectDecor(d.id)}
                      className={[
                        "h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-white transition hover:border-zinc-300 sm:h-16 sm:w-16",
                        isActive ? "border-black" : "border-zinc-200",
                      ].join(" ")}
                      aria-label={d.label}
                      title={d.label}
                    >
                      <div className="relative h-full w-full">
                        <Image src={d.swatchUrl} alt={d.label} fill className="object-cover" />
                        {isActive && <div className="absolute inset-0 ring-2 ring-black/20" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 lg:col-span-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            {product.name}
          </div>

          <div className="mt-2 break-words text-sm leading-6 text-zinc-500">
            {product.description || "—"}
          </div>

          <div className="mt-6">
            <div className="text-xs text-zinc-500">Cena</div>
            <div className="mt-1 break-words text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              {product.priceLabel}
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            <div>
              <div className="mb-2 text-xs font-semibold text-zinc-500">Vyberte dekor:</div>

              <details
                ref={decorDetailsRef}
                className="group rounded-2xl border border-zinc-200 bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-zinc-900">
                  <span className="min-w-0 truncate">{decorLabel}</span>
                  <span className="shrink-0 text-zinc-400 transition group-open:rotate-180">▾</span>
                </summary>

                <div className="border-t border-zinc-200 p-2">
                  {product.decors.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => selectDecor(d.id)}
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition",
                        decor === d.id
                          ? "bg-black text-white hover:bg-zinc-800"
                          : "text-zinc-900 hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-zinc-500">Počet kusů</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  className="h-11 w-11 shrink-0 rounded-2xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:h-12 sm:w-12"
                >
                  −
                </button>

                <input
                  value={safeQty}
                  onChange={(e) => setQty(Number(e.target.value || 1))}
                  inputMode="numeric"
                  className="h-11 min-w-0 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-center text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-400 sm:h-12"
                />

                <button
                  type="button"
                  onClick={() => setQty((v) => Math.min(999, v + 1))}
                  className="h-11 w-11 shrink-0 rounded-2xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:h-12 sm:w-12"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {canOrder ? (
              <button
                type="button"
                className="h-11 w-full rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:h-12"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/cart/add", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: product.id,
                        qty: safeQty,
                        decor: decorLabel,
                      }),
                    });

                    if (!res.ok) {
                      const txt = await res.text();
                      alert("Chyba při přidání do poptávky: " + txt);
                      return;
                    }

                    router.refresh();
                    alert("Produkt přidán do poptávky");
                  } catch {
                    alert("Chyba komunikace se serverem");
                  }
                }}
              >
                Přidat do poptávky
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-black px-4 text-center text-sm font-semibold text-white transition hover:bg-zinc-800 sm:h-12"
              >
                Přihlásit a vytvořit poptávku
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="text-xl font-semibold tracking-tight text-zinc-900">
            {specs.title}
          </div>

          {specs.items.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-x-12 gap-y-2 text-sm text-zinc-700 sm:grid-cols-2">
              <div className="space-y-2">
                {leftColumn.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-1 leading-6"
                  >
                    <span className="text-zinc-500">{item.label}</span>
                    <span className="text-right font-medium text-zinc-900">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {rightColumn.map((item, i) => (
                  <div
                    key={i + 100}
                    className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-1 leading-6"
                  >
                    <span className="text-zinc-500">{item.label}</span>
                    <span className="text-right font-medium text-zinc-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {specs.imageUrl && (
            <div className="mt-6">
 <div className="relative aspect-[4/3] w-full max-w-lg mx-auto">
    <Image
      src={specs.imageUrl}
      alt="Technický nákres produktu"
      fill
      className="object-contain object-top"
    />
  </div>
</div>
          )}
        </div>
      </div>
    </div>
  );
}