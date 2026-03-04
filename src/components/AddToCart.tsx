"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToCart({ productId }: { productId: string }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });

    setLoading(false);

    if (!res.ok) {
      setMsg("Nepodařilo se přidat do poptávky.");
      return;
    }

    setMsg("Přidáno ✅");
    router.refresh();
    setTimeout(() => setMsg(null), 900);
  }

  return (
    <div className="mt-5 flex items-center gap-3">
      <div className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-950/40">
        <button
          className="h-10 w-10 rounded-l-xl text-zinc-200 hover:bg-zinc-900"
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Méně"
        >
          –
        </button>
        <div className="min-w-[48px] text-center text-sm font-semibold text-zinc-100">{qty}</div>
        <button
          className="h-10 w-10 rounded-r-xl text-zinc-200 hover:bg-zinc-900"
          type="button"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Více"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={add}
        disabled={loading}
        className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
      >
        {loading ? "Přidávám…" : "Přidat do poptávky"}
      </button>

      {msg && <div className="text-xs text-zinc-400">{msg}</div>}
    </div>
  );
}