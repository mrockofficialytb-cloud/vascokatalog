"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Container, H1, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState("");
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
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background vibe */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,255,255,0.05),transparent_50%),radial-gradient(700px_circle_at_50%_120%,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.6))]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/catalog" className="flex items-center">
            <Image
              src="/vascologo.png"
              alt="VASCO"
              width={400}
              height={200}
              priority
              style={{ height: "90px", width: "auto" }}
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/catalog" className="text-sm font-semibold text-zinc-200 hover:text-white">
              ← Zpět do katalogu
            </Link>
          </div>
        </div>
      </header>

      <Container>
        <div className="mx-auto max-w-md py-10">
          <div className="mb-6 text-center">
            <H1>Přihlášení</H1>
            <p className="mt-2 text-sm text-zinc-400">
              Zadejte své přihlašovací údaje
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Nemáte účet?{" "}
              <Link className="underline hover:text-white" href="/register">
                Zaregistrovat se
              </Link>
            </p>
          </div>

          {verified && (
            <div className="mb-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
              Váš e-mail byl úspěšně ověřen. Pokračujte přihlášením.
            </div>
          )}

          <Card>
            <form onSubmit={onSubmit} className="grid gap-3">
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                placeholder="Heslo"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-zinc-300 underline hover:text-white"
                >
                  Zapomněli jste heslo?
                </Link>

                <Link
                  href="/register"
                  className="text-sm font-semibold text-zinc-300 underline hover:text-white"
                >
                  Registrace
                </Link>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Přihlašuji…" : "Přihlásit"}
              </Button>

              {msg && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {msg}
                </div>
              )}
            </form>
          </Card>
        </div>
      </Container>
    </main>
  );
}