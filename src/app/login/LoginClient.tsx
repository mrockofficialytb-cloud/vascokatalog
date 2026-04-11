"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setMsg("Přihlášení se nepodařilo. Zkontrolujte e-mail, heslo nebo stav účtu.");
      return;
    }

    router.push("/catalog");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md py-12 sm:py-16">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Přihlášení
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Zadejte své přihlašovací údaje
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Nemáte účet?{" "}
              <Link className="underline transition hover:text-black" href="/register">
                Zaregistrovat se
              </Link>
            </p>
          </div>

          {verified && (
            <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              Váš e-mail byl úspěšně ověřen. Pokračujte přihlášením.
            </div>
          )}

          {reset && (
            <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              Heslo bylo úspěšně změněno. Přihlaste se novým heslem.
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <form onSubmit={onSubmit} className="grid gap-3">
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
              />

              <input
                placeholder="Heslo"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
              />

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-zinc-500 underline transition hover:text-black"
                >
                  Zapomněli jste heslo?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Přihlašuji…" : "Přihlásit se"}
              </button>

              {msg && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {msg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}