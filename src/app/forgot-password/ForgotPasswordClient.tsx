"use client";

import { useState } from "react";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setErr(data?.error ?? "Nepodařilo se odeslat reset hesla.");
        setLoading(false);
        return;
      }

      setMsg(
        "Pokud účet s tímto e-mailem existuje, poslali jsme vám odkaz pro nastavení nového hesla."
      );
      setLoading(false);
    } catch {
      setErr("Nepodařilo se odeslat reset hesla.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md py-12 sm:py-16">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Obnovení hesla
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Zadejte e-mail a pošleme vám odkaz pro nové heslo.
            </p>
          </div>

          {msg && (
            <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              {msg}
            </div>
          )}

          {err && (
            <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-600">
              {err}
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <form onSubmit={onSubmit} className="grid gap-3">
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Odesílám…" : "Poslat odkaz"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}