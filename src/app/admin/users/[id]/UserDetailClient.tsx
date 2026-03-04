"use client";

import { useMemo, useState } from "react";

type UserPayload = {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  companyName?: string | null;
  ico?: string | null;
  dic?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  city?: string | null;
  zip?: string | null;
  customerType: string;
  status: string;
  createdAt: string | Date;
};

function customerTypeCz(t: string) {
  if (t === "B2B_BIG") return "Velkoodběratel";
  if (t === "B2B_SMALL") return "Maloodběratel";
  if (t === "B2C") return "Základní nabídka";
  return t;
}

function statusCz(s: string) {
  if (s === "ACTIVE") return "Schváleno";
  if (s === "PENDING") return "Čeká na schválení";
  if (s === "DISABLED") return "Odmítnuto";
  return s;
}

function FieldCard({
  label,
  value,
  editing,
  input,
}: {
  label: string;
  value: string;
  editing: boolean;
  input: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3">
      <div className="text-xs font-semibold text-zinc-400">{label}</div>
      <div className="mt-1">
        {editing ? (
          input
        ) : (
          <div className="text-sm font-semibold text-zinc-100 break-words">{value || "—"}</div>
        )}
      </div>
    </div>
  );
}

export default function UserDetailClient({ user }: { user: UserPayload }) {
  const created = useMemo(() => new Date(user.createdAt).toLocaleString("cs-CZ"), [user.createdAt]);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    companyName: user.companyName ?? "",
    ico: user.ico ?? "",
    dic: (user as any).dic ?? "",
    street: (user as any).street ?? "",
    houseNumber: (user as any).houseNumber ?? "",
    city: user.city ?? "",
    zip: (user as any).zip ?? "",
  });

  function cancel() {
    setErr(null);
    setOk(null);
    setForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
      companyName: user.companyName ?? "",
      ico: user.ico ?? "",
      dic: (user as any).dic ?? "",
      street: (user as any).street ?? "",
      houseNumber: (user as any).houseNumber ?? "",
      city: user.city ?? "",
      zip: (user as any).zip ?? "",
    });
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setOk(null);

const trimmed = form.name.trim();
const parts = trimmed.split(/\s+/).filter(Boolean);
if (parts.length < 2) {
  setErr("Vyplň jméno a příjmení (např. „Jan Novák“).");
  return;
}

    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...form }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Nepodařilo se uložit změny.");
        return;
      }

      setOk("Uloženo.");
      setEditing(false);

      // Volitelné: refresh, aby se server stránka překreslila s novými daty
      // (když nechceš refresh, můžeš si jen upravit lokální user, ale tohle je nejjednodušší)
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 text-sm font-semibold text-zinc-100 outline-none focus:border-zinc-700";

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">{user.name || "—"}</div>
          <div className="mt-1 text-sm text-zinc-400 truncate">{user.email}</div>
        </div>

        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => {
                setErr(null);
                setOk(null);
                setEditing(true);
              }}
              className="h-12 rounded-2xl bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
              disabled={saving}
            >
              Upravit údaje
            </button>
          ) : (
            <>
              <button
                onClick={save}
                className="h-12 rounded-2xl bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Ukládám…" : "Uložit"}
              </button>

              <button
                onClick={cancel}
                className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-6 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 disabled:opacity-60"
                disabled={saving}
              >
                Zrušit
              </button>
            </>
          )}
        </div>
      </div>

      {(err || ok) && (
        <div
          className={[
            "mt-4 rounded-2xl border px-5 py-4 text-sm",
            err
              ? "border-red-400/25 bg-red-400/10 text-red-100"
              : "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
          ].join(" ")}
        >
          {err ?? ok}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <FieldCard
          label="Jméno"
          value={user.name ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jméno a příjmení"
            />
          }
        />

        <FieldCard
          label="Email"
          value={user.email}
          editing={false}
          input={null}
        />

        <FieldCard
          label="Telefon"
          value={(user.phone as any) ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+420…"
            />
          }
        />

        <FieldCard
          label="Firma"
          value={(user.companyName as any) ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.companyName}
              onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              placeholder="Název firmy"
            />
          }
        />

        <FieldCard
          label="IČO"
          value={(user.ico as any) ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.ico}
              onChange={(e) => setForm((p) => ({ ...p, ico: e.target.value }))}
              placeholder="IČO"
            />
          }
        />

        <FieldCard
          label="DIČ"
          value={(user as any).dic ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.dic}
              onChange={(e) => setForm((p) => ({ ...p, dic: e.target.value }))}
              placeholder="DIČ (nepovinné)"
            />
          }
        />

        <FieldCard
          label="Ulice"
          value={(user as any).street ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.street}
              onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
              placeholder="Ulice"
            />
          }
        />

        <FieldCard
          label="Číslo popisné"
          value={(user as any).houseNumber ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.houseNumber}
              onChange={(e) => setForm((p) => ({ ...p, houseNumber: e.target.value }))}
              placeholder="Č.p."
            />
          }
        />

        <FieldCard
          label="Město"
          value={user.city ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="Město"
            />
          }
        />

        <FieldCard
          label="PSČ"
          value={(user as any).zip ?? "—"}
          editing={editing}
          input={
            <input
              className={inputClass}
              value={form.zip}
              onChange={(e) => setForm((p) => ({ ...p, zip: e.target.value }))}
              placeholder="PSČ"
            />
          }
        />

        <FieldCard label="Typ zákazníka" value={customerTypeCz(user.customerType)} editing={false} input={null} />
        <FieldCard label="Stav účtu" value={statusCz(user.status)} editing={false} input={null} />
        <FieldCard label="Vytvořeno" value={created} editing={false} input={null} />
      </div>
    </div>
  );
}