"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPriceCzk: number | null;
  subtotalCzk: number | null;
};

function formatCzk(amountCzk: number) {
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(val);
}

export function CartClient({
  items,
  hasPrices,
  totalText,
}: {
  items: Item[];
  hasPrices: boolean;
  totalText: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const empty = items.length === 0;

  const total = useMemo(() => {
    if (!hasPrices) return null;
    const sum = items.reduce((s, i) => s + (i.subtotalCzk ?? 0), 0);
    return formatCzk(sum);
  }, [items, hasPrices]);

  async function setQty(productId: string, quantity: number) {
    await fetch("/api/cart/set-qty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    router.refresh();
  }

  async function remove(productId: string) {
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    router.refresh();
  }

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/cart/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setLoading(false);

    if (!res.ok) {
      alert("Poptávku se nepodařilo odeslat.");
      return;
    }

    const data = await res.json();
    router.push(`/inquiry/sent/${data.inquiryId}`);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5">
        <div className="text-sm font-semibold text-zinc-200">Položky</div>

        {empty ? (
          <div className="mt-4 text-sm text-zinc-400">Košík je prázdný.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map((it) => (
              <div
                key={it.productId}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-900 bg-zinc-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="mt-1 text-xs text-zinc-500">{it.sku ?? ""}</div>

                  {hasPrices ? (
                    <div className="mt-2 text-sm text-zinc-300">
                      {formatCzk(it.unitPriceCzk!)} / ks
                      <span className="text-zinc-600"> · </span>
                      <span className="font-semibold">{formatCzk(it.subtotalCzk!)}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-zinc-500">Cena po schválení / přihlášení</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-950/40">
                    <button
                      className="h-10 w-10 rounded-l-xl text-zinc-200 hover:bg-zinc-900"
                      type="button"
                      onClick={() => setQty(it.productId, Math.max(0, it.quantity - 1))}
                    >
                      –
                    </button>
                    <div className="min-w-[52px] text-center text-sm font-semibold">{it.quantity}</div>
                    <button
                      className="h-10 w-10 rounded-r-xl text-zinc-200 hover:bg-zinc-900"
                      type="button"
                      onClick={() => setQty(it.productId, it.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="h-10 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                    type="button"
                    onClick={() => remove(it.productId)}
                  >
                    Odebrat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5">
        <div className="text-sm font-semibold text-zinc-200">Poznámka k poptávce</div>
        <textarea
          className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          placeholder="Např. termín dodání, doprava, montáž, specifikace…"
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-400">
            Poptávka je nezávazná. Uvedené ceny budou potvrzeny v nabídce.
          </div>

          <div className="flex items-center gap-3">
            {hasPrices && (
              <div className="text-sm text-zinc-300">
                Celkem: <span className="font-semibold text-zinc-100">{total ?? totalText}</span>
              </div>
            )}

            <button
              type="button"
              disabled={loading || empty}
              onClick={submit}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
            >
              {loading ? "Odesílám…" : "Odeslat poptávku"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}