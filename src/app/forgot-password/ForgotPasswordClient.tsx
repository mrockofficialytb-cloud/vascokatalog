"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Container, H1, Input } from "@/components/ui";

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

      setMsg("Pokud účet s tímto e-mailem existuje, poslali jsme vám odkaz pro nastavení nového hesla.");
      setLoading(false);
    } catch {
      setErr("Nepodařilo se odeslat reset hesla.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,255,255,0.05),transparent_50%),radial-gradient(700px_circle_at_50%_120%,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.6))]" />
      </div>

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
            <Link href="/login" className="text-sm font-semibold text-zinc-200 hover:text-white">
              ← Zpět na přihlášení
            </Link>
          </div>
        </div>
      </header>

      <Container>
        <div className="mx-auto max-w-md py-10">
          <div className="mb-6 text-center">
            <H1>Obnovení hesla</H1>
            <p className="mt-2 text-sm text-zinc-400">
              Zadejte e-mailovou adresu a pošleme vám odkaz pro nastavení nového hesla.
            </p>
          </div>

          {msg && (
            <div className="mb-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
              {msg}
            </div>
          )}

          {err && (
            <div className="mb-4 rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm text-red-100">
              {err}
            </div>
          )}

          <Card>
            <form onSubmit={onSubmit} className="grid gap-3">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Odesílám…" : "Poslat odkaz"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </main>
  );
}