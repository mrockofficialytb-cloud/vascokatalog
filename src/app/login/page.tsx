"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Container, H1, Input, Muted, NavLink } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);

    if (!res || res.error) {
      setMsg("Přihlášení se nepodařilo. Zkontroluj email/heslo nebo je účet DISABLED.");
      return;
    }

    router.push("/catalog");
  }

  return (
    <Container>
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <H1>Přihlášení</H1>
          <Muted>
            <NavLink href="/catalog">← zpět na katalog</NavLink>
          </Muted>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="grid gap-3">
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input placeholder="Heslo" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Button type="submit" disabled={loading}>
              {loading ? "Přihlašuji…" : "Přihlásit"}
            </Button>

            {msg && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{msg}</div>}
          </form>
        </Card>
      </div>
    </Container>
  );
}