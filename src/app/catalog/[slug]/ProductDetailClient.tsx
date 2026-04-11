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

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="relative aspect-[4/3] w-full bg-zinc-100">
            <Image
              src={activeSrc}
              alt={`${product.name} – ${decorLabel}`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImage((v) => (v - 1 + gallery.length) % gallery.length)}
                  className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white/90 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                  aria-label="Předchozí"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((v) => (v + 1) % gallery.length)}
                  className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white/90 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                  aria-label="Další"
                >
                  →
                </button>
              </>
            )}

            <div className="absolute left-4 top-4">
              <span className="rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-800 backdrop-blur">
                {(product.collection || "COLLECTION").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-white p-4">
            <div className="mb-2 text-xs font-semibold text-zinc-500">Vzory dekoru</div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {swatches.map((d) => {
                const isActive = d.id === decor;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => selectDecor(d.id)}
                    className={[
                      "h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition hover:border-zinc-300",
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

      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="text-xl font-semibold tracking-tight text-zinc-900">{product.name}</div>
          <div className="mt-2 text-sm text-zinc-500">{product.description || "—"}</div>

          <div className="mt-6">
            <div className="text-xs text-zinc-500">Cena</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
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
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900">
                  <span>{decorLabel}</span>
                  <span className="text-zinc-400 transition group-open:rotate-180">▾</span>
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
                  className="h-12 w-12 rounded-2xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  −
                </button>

                <input
                  value={safeQty}
                  onChange={(e) => setQty(Number(e.target.value || 1))}
                  inputMode="numeric"
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-center text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-400"
                />

                <button
                  type="button"
                  onClick={() => setQty((v) => Math.min(999, v + 1))}
                  className="h-12 w-12 rounded-2xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-900 transition hover:bg-zinc-50"
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
                className="h-12 w-full rounded-2xl bg-black text-sm font-semibold text-white transition hover:bg-zinc-800"
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
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white transition hover:bg-zinc-800"
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