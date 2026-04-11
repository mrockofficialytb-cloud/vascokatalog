"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!token) {
      setErr("Chybí reset token.");
      return;
    }

    if (password.length < 6) {
      setErr("Heslo musí mít alespoň 6 znaků.");
      return;
    }

    if (password !== password2) {
      setErr("Hesla se neshodují.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setErr(data?.error ?? "Nepodařilo se nastavit nové heslo.");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push(`/login?reset=1&email=${encodeURIComponent(data.email ?? "")}`);
    } catch {
      setErr("Nepodařilo se nastavit nové heslo.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md py-12 sm:py-16">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Nové heslo
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Zadejte nové heslo pro svůj účet.
            </p>
          </div>

          {err && (
            <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-600">
              {err}
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <form onSubmit={onSubmit} className="grid gap-3">
              <input
                placeholder="Nové heslo"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
              />

              <input
                placeholder="Potvrdit nové heslo"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Ukládám…" : "Uložit nové heslo"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}