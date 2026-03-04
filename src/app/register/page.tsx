"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Demand = "SMALL" | "MEDIUM" | "LARGE";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Přihlašovací údaje
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Kontaktní údaje
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");

  // Adresa
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  // Odběr
  const [demandLevel, setDemandLevel] = useState<Demand>("SMALL");

  // Souhlas
  const [consent, setConsent] = useState(false);

  const isValid = useMemo(() => {
    if (!email.trim()) return false;
    if (password.length < 6) return false;

    if (!firstName.trim() || !lastName.trim()) return false;
    if (!phone.trim()) return false;

    if (!street.trim() || !houseNumber.trim() || !city.trim() || !zip.trim()) return false;

    if (isCompany) {
      if (!companyName.trim()) return false;
      if (!ico.trim()) return false;
    }

    if (!consent) return false;
    return true;
  }, [email, password, firstName, lastName, phone, street, houseNumber, city, zip, isCompany, companyName, ico, consent]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!isValid) {
      setErr("Zkontroluj prosím vyplnění všech povinných polí.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,

          isCompany,
          companyName: isCompany ? companyName : null,

          firstName,
          lastName,
          phone,

          ico: isCompany ? ico : null,
          dic: isCompany ? dic : null,

          street,
          houseNumber,
          city,
          zip,

          demandLevel,
          consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? "Registrace se nezdařila.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setErr("Registrace se nezdařila.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background vibe */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,255,255,0.05),transparent_50%),radial-gradient(700px_circle_at_50%_120%,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.6))]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Registrace</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Už máte účet?{" "}
            <Link className="underline hover:text-white" href="/login">
              Přihlásit se
            </Link>
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-6">
          {/* 1) Přihlašovací údaje */}
          <section className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
            <div className="text-lg font-semibold">Vyplňte přihlašovací údaje</div>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-300">E-mailová adresa:</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Heslo:</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>
            </div>
          </section>

          {/* 2) Kontaktní údaje */}
          <section className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
            <div className="text-lg font-semibold">Kontaktní údaje</div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-zinc-300">Nakupuji jako:</div>
              <div className="mt-2 flex flex-wrap gap-3">
                <label className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 text-sm font-semibold text-zinc-200">
                  <input
                    type="radio"
                    name="buyer"
                    checked={!isCompany}
                    onChange={() => setIsCompany(false)}
                  />
                  Soukromá osoba
                </label>

                <label className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 text-sm font-semibold text-zinc-200">
                  <input
                    type="radio"
                    name="buyer"
                    checked={isCompany}
                    onChange={() => setIsCompany(true)}
                  />
                  Firma / živnostník
                </label>
              </div>
            </div>

            {isCompany && (
              <div className="mt-4">
                <label className="text-sm font-semibold text-zinc-300">Název firmy:</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"              
                />
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-300">Jméno</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Příjmení</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Telefonní číslo</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Emailová adresa</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              {isCompany && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-zinc-300">IČO</label>
                    <input
                      value={ico}
                      onChange={(e) => setIco(e.target.value)}
                      className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-zinc-300">DIČ (nepovinné)</label>
                    <input
                      value={dic}
                      onChange={(e) => setDic(e.target.value)}
                      className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 3) Adresa */}
          <section className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
            <div className="text-lg font-semibold">Adresa</div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-300">Ulice</label>
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Číslo popisné</label>
                <input
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Město</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">PSČ</label>
                <input
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>
            </div>
          </section>

          {/* 4) Odhadovaný odběr */}
          <section className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
            <div className="text-lg font-semibold">Odhadovaný odběr:</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">

  <label className="cursor-pointer">
    <input
      type="radio"
      name="demand"
      checked={demandLevel === "SMALL"}
      onChange={() => setDemandLevel("SMALL")}
      className="peer hidden"
    />
    <div className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 text-center transition 
      peer-checked:border-emerald-400 peer-checked:bg-emerald-400/10">
      <span className="text-sm font-semibold text-zinc-200">Malý</span>
      <span className="text-xs text-zinc-400">
        základní nabídka
      </span>
    </div>
  </label>

  <label className="cursor-pointer">
    <input
      type="radio"
      name="demand"
      checked={demandLevel === "MEDIUM"}
      onChange={() => setDemandLevel("MEDIUM")}
      className="peer hidden"
    />
    <div className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 text-center transition 
      peer-checked:border-emerald-400 peer-checked:bg-emerald-400/10">
      <span className="text-sm font-semibold text-zinc-200">Střední</span>
      <span className="text-xs text-zinc-400">
        pravidelné objednávky
      </span>
    </div>
  </label>

  <label className="cursor-pointer">
    <input
      type="radio"
      name="demand"
      checked={demandLevel === "LARGE"}
      onChange={() => setDemandLevel("LARGE")}
      className="peer hidden"
    />
    <div className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 text-center transition 
      peer-checked:border-emerald-400 peer-checked:bg-emerald-400/10">
      <span className="text-sm font-semibold text-zinc-200">Velký</span>
      <span className="text-xs text-zinc-400">
        velkoobchodní odběr
      </span>
    </div>
  </label>

</div>
          </section>

          {/* 5) Souhlas */}
          <section className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-zinc-200">
                Potvrzuji, že údaje jsou pravdivé a souhlasím se zpracováním pro účely vyřízení poptávky.
              </span>
            </label>

            {err && (
              <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                {err}
              </div>
            )}

            <button
              disabled={loading}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
            >
              {loading ? "Odesílám..." : "Vytvořit účet"}
            </button>

            <div className="mt-3 text-xs text-zinc-500">
              Střední a Velký odběr se po registraci zařadí do schválení administrátorem.
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}