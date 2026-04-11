"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Step = "FORM" | "VERIFY";

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verifyParam = searchParams.get("verify");
  const emailParam = searchParams.get("email");

  const [step, setStep] = useState<Step>(verifyParam === "1" ? "VERIFY" : "FORM");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [email, setEmail] = useState(emailParam ?? "");
  const [password, setPassword] = useState("");

  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");

  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const [sameInvoiceAddress, setSameInvoiceAddress] = useState(true);
  const [invoiceStreet, setInvoiceStreet] = useState("");
  const [invoiceHouseNumber, setInvoiceHouseNumber] = useState("");
  const [invoiceCity, setInvoiceCity] = useState("");
  const [invoiceZip, setInvoiceZip] = useState("");

  const [consent, setConsent] = useState(false);

  const [code, setCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    setStep(verifyParam === "1" ? "VERIFY" : "FORM");
    if (emailParam) setEmail(emailParam);
  }, [verifyParam, emailParam]);

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

    if (!sameInvoiceAddress) {
      if (
        !invoiceStreet.trim() ||
        !invoiceHouseNumber.trim() ||
        !invoiceCity.trim() ||
        !invoiceZip.trim()
      ) {
        return false;
      }
    }

    if (!consent) return false;
    return true;
  }, [
    email,
    password,
    firstName,
    lastName,
    phone,
    street,
    houseNumber,
    city,
    zip,
    isCompany,
    companyName,
    ico,
    consent,
    sameInvoiceAddress,
    invoiceStreet,
    invoiceHouseNumber,
    invoiceCity,
    invoiceZip,
  ]);

  function normalizeEmail(v: string) {
    return v.trim().toLowerCase();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

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
          email: normalizeEmail(email),
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

          invoiceStreet: sameInvoiceAddress ? street : invoiceStreet,
          invoiceHouseNumber: sameInvoiceAddress ? houseNumber : invoiceHouseNumber,
          invoiceCity: sameInvoiceAddress ? city : invoiceCity,
          invoiceZip: sameInvoiceAddress ? zip : invoiceZip,

          consent,
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setErr(data?.error ?? "Registrace se nezdařila.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setOk("Účet byl vytvořen. Ověřovací kód jsme poslali na e-mail.");
      setCode("");
      router.push(`/register?verify=1&email=${encodeURIComponent(normalizeEmail(email))}`);
    } catch {
      setErr("Registrace se nezdařila.");
      setLoading(false);
    }
  }

  async function verifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const trimmed = code.replace(/\s+/g, "").trim();
    if (trimmed.length < 4) {
      setErr("Zadej prosím ověřovací kód z e-mailu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(email),
          code: trimmed,
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setErr(data?.error ?? "Ověření se nezdařilo. Zkontroluj kód a zkus to znovu.");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/login?verified=1");
    } catch {
      setErr("Ověření se nezdařilo. Zkus to prosím znovu.");
      setLoading(false);
    }
  }

  async function resendCode() {
    setErr(null);
    setOk(null);

    const em = normalizeEmail(email);
    if (!em) {
      setErr("Chybí e-mail.");
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch("/api/register/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: em }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setErr(data?.error ?? "Kód se nepodařilo odeslat znovu.");
        setResendLoading(false);
        return;
      }

      setOk("Nový ověřovací kód byl odeslán na e-mail.");
      setResendLoading(false);
    } catch {
      setErr("Kód se nepodařilo odeslat znovu.");
      setResendLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Registrace</h1>

            <p className="mt-2 text-sm text-zinc-500">
              Už máte účet?{" "}
              <Link className="underline transition hover:text-black" href="/login">
                Přihlásit se
              </Link>
            </p>
          </div>
        </div>

        {(err || ok) && (
          <div className="mb-6 grid gap-3">
            {err && (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-600">
                {err}
              </div>
            )}
            {ok && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                {ok}
              </div>
            )}
          </div>
        )}

        {step === "VERIFY" ? (
          <form onSubmit={verifyEmail} className="grid gap-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-zinc-900">Potvrzení e-mailu</div>
              <div className="mt-2 text-sm text-zinc-500">
                Na e-mail{" "}
                <span className="font-semibold text-zinc-900">{normalizeEmail(email)}</span> jsme
                poslali ověřovací kód.
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-zinc-700">Ověřovací kód</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Např. 123456"
                  className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <button
                disabled={loading}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Ověřuji..." : "Potvrdit e-mail"}
              </button>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={resendLoading}
                  className="text-sm font-semibold text-zinc-600 underline transition hover:text-black disabled:opacity-60"
                >
                  {resendLoading ? "Odesílám..." : "Poslat kód znovu"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOk(null);
                    setErr(null);
                    setCode("");
                    router.push("/register");
                  }}
                  className="text-sm font-semibold text-zinc-600 transition hover:text-black"
                >
                  Změnit e-mail
                </button>
              </div>
            </section>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-zinc-900">Vyplňte přihlašovací údaje</div>

              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-sm font-semibold text-zinc-700">E-mailová adresa</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700">Heslo</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="mt-2 text-xs text-zinc-500">Min. 6 znaků.</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-zinc-900">Kontaktní údaje</div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-zinc-700">Nakupuji jako:</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <label className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900">
                    <input
                      type="radio"
                      name="buyer"
                      checked={!isCompany}
                      onChange={() => setIsCompany(false)}
                    />
                    Soukromá osoba
                  </label>

                  <label className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900">
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
                  <label className="text-sm font-semibold text-zinc-700">Název firmy</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-700">Jméno</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700">Příjmení</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700">Telefonní číslo</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700">Emailová adresa</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {isCompany && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-zinc-700">IČO</label>
                      <input
                        value={ico}
                        onChange={(e) => setIco(e.target.value)}
                        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-700">DIČ (nepovinné)</label>
                      <input
                        value={dic}
                        onChange={(e) => setDic(e.target.value)}
                        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-zinc-900">Kontaktní adresa</div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-700">Ulice</label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700">Číslo popisné</label>
                  <input
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700">Město</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-700">PSČ</label>
                  <input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-zinc-700">
                <input
                  type="checkbox"
                  checked={sameInvoiceAddress}
                  onChange={(e) => setSameInvoiceAddress(e.target.checked)}
                />
                Fakturační adresa je stejná jako kontaktní
              </label>

              {!sameInvoiceAddress && (
                <div className="mt-6">
                  <div className="text-lg font-semibold text-zinc-900">Fakturační adresa</div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-zinc-700">Ulice</label>
                      <input
                        value={invoiceStreet}
                        onChange={(e) => setInvoiceStreet(e.target.value)}
                        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-700">Číslo popisné</label>
                      <input
                        value={invoiceHouseNumber}
                        onChange={(e) => setInvoiceHouseNumber(e.target.value)}
                        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-700">Město</label>
                      <input
                        value={invoiceCity}
                        onChange={(e) => setInvoiceCity(e.target.value)}
                        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-700">PSČ</label>
                      <input
                        value={invoiceZip}
                        onChange={(e) => setInvoiceZip(e.target.value)}
                        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-zinc-700">
                  Potvrzuji, že údaje jsou pravdivé a souhlasím se zpracováním pro účely
                  vyřízení poptávky.
                </span>
              </label>

              <button
                disabled={loading}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Odesílám..." : "Vytvořit účet"}
              </button>

              <div className="mt-3 text-xs text-zinc-500">
                Po vytvoření účtu bude potřeba potvrdit e-mail kódem.
              </div>
            </section>
          </form>
        )}
      </div>
    </main>
  );
}