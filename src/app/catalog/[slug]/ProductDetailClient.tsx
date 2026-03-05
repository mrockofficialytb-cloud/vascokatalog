"use client";

import { useMemo, useRef, useState } from "react";
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
    decors: { id: string; label: string; swatchUrl: string }[];
  };
  canOrder: boolean;
};

export default function ProductDetailClient({ product, canOrder }: Props) {
  const [activeImage, setActiveImage] = useState(0);

  // default dekor = první v seznamu (když není, tak prázdný)
  const [decor, setDecor] = useState(product.decors?.[0]?.id ?? "");

  const [withFelt, setWithFelt] = useState<"WITH" | "WITHOUT">("WITHOUT");
  const [qty, setQty] = useState(1);

  const decorDetailsRef = useRef<HTMLDetailsElement | null>(null);

  const decorLabel = useMemo(
    () => product.decors.find((d) => d.id === decor)?.label ?? "—",
    [decor, product.decors]
  );

  const safeQty = Math.max(1, Math.min(999, qty));

  // swatche bereme primárně z decors (jsou kolekčně správné)
  const swatches = useMemo(() => {
    return (product.decors ?? []).slice(0, 8);
  }, [product.decors]);

  const gallery = product.gallery?.length ? product.gallery : ["/products/placeholder.jpg"];
  const activeSrc = gallery[Math.min(activeImage, gallery.length - 1)] || "/products/placeholder.jpg";

  function closeDecorDropdown() {
    if (decorDetailsRef.current) decorDetailsRef.current.open = false;
  }

  function selectDecor(id: string) {
    setDecor(id);
    closeDecorDropdown();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* LEFT: gallery */}
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/25">
          <div className="relative aspect-[4/3] w-full bg-zinc-950/40">
            <Image
              src={activeSrc}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />

            {/* left/right controls */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImage((v) => (v - 1 + gallery.length) % gallery.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-950/60 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
                  aria-label="Předchozí"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((v) => (v + 1) % gallery.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-950/60 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
                  aria-label="Další"
                >
                  →
                </button>
              </>
            )}

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
              {swatches.map((d) => {
                const isActive = d.id === decor;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => selectDecor(d.id)}
                    className={[
                      "h-16 w-16 overflow-hidden rounded-xl border bg-zinc-900/30 hover:border-zinc-700",
                      isActive ? "border-white/60" : "border-zinc-800",
                    ].join(" ")}
                    aria-label={d.label}
                    title={d.label}
                  >
                    <div className="relative h-full w-full">
                      <Image src={d.swatchUrl} alt={d.label} fill className="object-cover" />
                      {isActive && <div className="absolute inset-0 ring-2 ring-white/30" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: product info + variants */}
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/25 p-6">
          <div className="text-xl font-semibold tracking-tight">{product.name}</div>
          <div className="mt-2 text-sm text-zinc-400">{product.description || "—"}</div>

          <div className="mt-6">
            <div className="text-xs text-zinc-500">Cena</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">{product.priceLabel}</div>
          </div>

          {/* variants */}
          <div className="mt-8 grid gap-5">
            {/* decor dropdown */}
            <div>
              <div className="mb-2 text-xs font-semibold text-zinc-400">Vyberte dekor:</div>

              <details ref={decorDetailsRef} className="group rounded-2xl border border-zinc-800 bg-zinc-950/40">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-zinc-100 flex items-center justify-between">
                  <span>{decorLabel}</span>
                  <span className="text-zinc-500 group-open:rotate-180 transition">▾</span>
                </summary>

                <div className="border-t border-zinc-800 p-2">
                  {product.decors.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => selectDecor(d.id)} // ✅ vybere + zavře dropdown
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-zinc-900",
                        decor === d.id ? "bg-white text-zinc-950 hover:bg-zinc-200" : "text-zinc-200",
                      ].join(" ")}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>

            {/* felt toggle */}
            <div>
              <div className="mb-2 text-xs font-semibold text-zinc-400">Vyberte variantu:</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWithFelt("WITHOUT")}
                  className={[
                    "h-12 flex-1 rounded-2xl border px-4 text-sm font-semibold transition",
                    withFelt === "WITHOUT"
                      ? "border-zinc-700 bg-white text-zinc-950"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  Bez filcu
                </button>

                <button
                  type="button"
                  onClick={() => setWithFelt("WITH")}
                  className={[
                    "h-12 flex-1 rounded-2xl border px-4 text-sm font-semibold transition",
                    withFelt === "WITH"
                      ? "border-zinc-700 bg-white text-zinc-950"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900",
                  ].join(" ")}
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
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 text-sm font-semibold text-zinc-100 outline-none focus:border-zinc-700 text-center"
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
                onClick={async () => {
                  try {
                    const res = await fetch("/api/cart/add", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: product.id,
                        qty: safeQty,
                        decorId: decor,          // ✅ ukládej ID (stabilní)
                        decorLabel: decorLabel,  // ✅ můžeš logovat/zobrazovat
                        felt: withFelt === "WITH" ? "S_FILCEM" : "BEZ_FILCU",
                      }),
                    });

                    if (!res.ok) {
                      const txt = await res.text();
                      alert("Chyba při přidání do poptávky: " + txt);
                      return;
                    }

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
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Přihlásit a vytvořit poptávku
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}