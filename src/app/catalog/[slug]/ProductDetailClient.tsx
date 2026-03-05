"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    collection: string;
    priceLabel: string;
    gallery: string[];
    decorThumbs: string[];
  };
  canOrder: boolean;
};

const DECORS = [
  { id: "classic-oak", label: "Classic Oak" },
  { id: "natural-oak", label: "Natural Oak" },
  { id: "walnut", label: "Walnut" },
  { id: "black", label: "Black" },
];

export default function ProductDetailClient({ product, canOrder }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [decor, setDecor] = useState(DECORS[0].id);
  const [withFelt, setWithFelt] = useState<"WITH" | "WITHOUT">("WITHOUT");
  const [qty, setQty] = useState(1);

  const decorLabel = useMemo(
    () => DECORS.find((d) => d.id === decor)?.label ?? "—",
    [decor]
  );

  const safeQty = Math.max(1, Math.min(999, qty));

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* LEFT: gallery */}
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/25">
          <div className="relative aspect-[4/3] w-full bg-zinc-950/40">
            <Image
              src={product.gallery[activeImage] || "/products/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />

            {/* left/right controls */}
            <button
              type="button"
              onClick={() => setActiveImage((v) => (v - 1 + product.gallery.length) % product.gallery.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-950/60 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
              aria-label="Předchozí"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setActiveImage((v) => (v + 1) % product.gallery.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-950/60 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
              aria-label="Další"
            >
              →
            </button>

            {/* collection badge */}
            <div className="absolute left-4 top-4">
              <span className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-100 backdrop-blur">
                {(product.collection || "COLLECTION").toUpperCase()}
              </span>
            </div>
          </div>

          {/* decor thumbs (vzory) */}
          <div className="border-t border-zinc-900 bg-zinc-950/30 p-4">
            <div className="mb-2 text-xs font-semibold text-zinc-400">Vzory dekoru</div>

            <div className="flex flex-wrap gap-3">
              {product.decorThumbs.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(0)} // zatím jen demo (později: dekor mění galerii)
                  className="h-16 w-16 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  aria-label={`Dekor ${i + 1}`}
                >
                  <div className="relative h-full w-full">
                    <Image src={src} alt={`Dekor ${i + 1}`} fill className="object-cover" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: product info + variants */}
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/25 p-6">
          <div className="text-xl font-semibold tracking-tight">{product.name}</div>
          <div className="mt-2 text-sm text-zinc-400">
            {product.description || "—"}
          </div>

          <div className="mt-6">
            <div className="text-xs text-zinc-500">Cena</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">{product.priceLabel}</div>
          </div>

          {/* variants */}
          <div className="mt-8 grid gap-5">
            {/* decor dropdown */}
            <div>
              <div className="mb-2 text-xs font-semibold text-zinc-400">Varianta / dekor</div>
              <details className="group rounded-2xl border border-zinc-800 bg-zinc-950/40">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-zinc-100 flex items-center justify-between">
                  <span>{decorLabel}</span>
                  <span className="text-zinc-500 group-open:rotate-180 transition">▾</span>
                </summary>
                <div className="border-t border-zinc-800 p-2">
                  {DECORS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDecor(d.id)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-900 ${
                        decor === d.id ? "bg-white text-zinc-950 hover:bg-zinc-200" : "text-zinc-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>

            {/* felt toggle */}
            <div>
              <div className="mb-2 text-xs font-semibold text-zinc-400">Filc</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWithFelt("WITHOUT")}
                  className={`h-12 flex-1 rounded-2xl border px-4 text-sm font-semibold transition ${
                    withFelt === "WITHOUT"
                      ? "border-zinc-700 bg-white text-zinc-950"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  Bez filcu
                </button>
                <button
                  type="button"
                  onClick={() => setWithFelt("WITH")}
                  className={`h-12 flex-1 rounded-2xl border px-4 text-sm font-semibold transition ${
                    withFelt === "WITH"
                      ? "border-zinc-700 bg-white text-zinc-950"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  S filcem
                </button>
              </div>
            </div>

            {/* qty */}
            <div>
              <div className="mb-2 text-xs font-semibold text-zinc-400">Počet kusů</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  className="h-12 w-12 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-lg font-semibold text-zinc-100 hover:bg-zinc-900"
                >
                  −
                </button>

                <input
                  value={safeQty}
                  onChange={(e) => setQty(Number(e.target.value || 1))}
                  inputMode="numeric"
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 text-sm font-semibold text-zinc-100 outline-none focus:border-zinc-700"
                />

                <button
                  type="button"
                  onClick={() => setQty((v) => Math.min(999, v + 1))}
                  className="h-12 w-12 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-lg font-semibold text-zinc-100 hover:bg-zinc-900"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            {canOrder ? (
              <button
                type="button"
                className="h-12 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
                onClick={() => {
                  alert(
                    `DEMO: Přidat do poptávky\n\nProdukt: ${product.name}\nDekor: ${decorLabel}\nFilc: ${
                      withFelt === "WITH" ? "S filcem" : "Bez filcu"
                    }\nKs: ${safeQty}\n\nDalší krok: napojíme to na /api/cart/add (varianty + qty).`
                  );
                }}
              >
                Přidat do poptávky
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Přihlásit a vytvořit poptávku
              </Link>
            )}
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            Později: napojíme varianty/dekory do DB + přenos do poptávky.
          </div>
        </div>
      </div>
    </div>
  );
}