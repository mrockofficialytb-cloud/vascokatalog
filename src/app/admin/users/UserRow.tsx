"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

type UserRowProps = {
  user: {
    id: string;
    email: string;
    name: string | null;
    companyName?: string | null;
    ico?: string | null;
    customerType: string;
    status: string;
    createdAt: Date;
  };
};

function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

  if (status === "ACTIVE")
    return (
      <span className={`${base} border-emerald-400/30 bg-emerald-400/10 text-emerald-100`}>
        SCHVÁLENO
      </span>
    );

  if (status === "PENDING")
    return (
      <span className={`${base} border-amber-400/30 bg-amber-400/10 text-amber-100`}>
        ČEKÁ NA SCHVÁLENÍ
      </span>
    );

  return (
    <span className={`${base} border-red-500/30 bg-red-500/10 text-red-100`}>
      ODMÍTNUTO
    </span>
  );
}

function customerTypeIndicator(type: string) {
  if (type === "B2B_BIG") return "🟢 Velkoodběratel";
  if (type === "B2B_SMALL") return "🟡 Maloodběratel";
  if (type === "B2C") return "⚪ Základní nabídka";
  return type;
}

export default function UserRow({ user }: UserRowProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fullName = user.name ?? "Neznámý uživatel";

  return (
   <Card className="relative group">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        {/* LEFT */}
        <div className="min-w-0">

          {/* JMÉNO + FIRMA */}
          <div className="text-base font-semibold text-white truncate">
            {fullName}
            {user.companyName && (
              <span className="ml-2 text-sm font-normal text-zinc-400">
                {user.companyName}
              </span>
            )}
          </div>

          {/* EMAIL */}
          <div className="mt-1 text-sm text-zinc-400">
            {user.email}
          </div>

          {/* ICO */}
          {user.ico && (
            <div className="text-xs text-zinc-500">
              IČO: {user.ico}
            </div>
          )}

          {/* CREATED */}
          <div className="mt-1 text-xs text-zinc-500">
            {new Date(user.createdAt).toLocaleString("cs-CZ")}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={user.status} />
            <span className="text-sm font-semibold text-zinc-200">
              {customerTypeIndicator(user.customerType)}
            </span>
          </div>

          <Link
            href={`/admin/users/${user.id}`}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            Zobrazit kartu zákazníka →
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end gap-3">

          <Button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-9 px-4 py-0 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200"
          >
            {open ? "Skrýt" : "Upravit"}
          </Button>

         {/* IKONA KOŠE */}
<button
  onClick={() => setConfirmDelete(true)}
  title="Smazat zákazníka"
  className="absolute bottom-3 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v7m4-7v7m4-7v7M8 7l1 12h6l1-12"
    />
  </svg>
</button>

        </div>
      </div>

      {/* EXPAND */}
     {open && (
  <div className="mt-4 grid gap-4 border-t border-zinc-900 pt-4 sm:grid-cols-2">

    {/* STATUS */}
    <div>
      <div className="mb-2 text-xs font-semibold text-zinc-400">
        Status
      </div>

      <div className="flex flex-wrap gap-2">
        <form action="/api/admin/set-status" method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="status" value="ACTIVE" />
          <Button className="h-9 px-3 py-0 text-xs">Přijmout</Button>
        </form>

        <form action="/api/admin/set-status" method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="status" value="PENDING" />
          <Button className="h-9 px-3 py-0 text-xs">
            Čeká na schválení
          </Button>
        </form>

        <form action="/api/admin/set-status" method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="status" value="DISABLED" />
          <Button className="h-9 px-3 py-0 text-xs">
            Odmítnout
          </Button>
        </form>
      </div>
    </div>

    {/* TYP ZÁKAZNÍKA */}
    <div>
      <div className="mb-2 text-xs font-semibold text-zinc-400">
        Typ zákazníka
      </div>

      <div className="flex flex-wrap gap-2">
        <form action="/api/admin/set-type" method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="customerType" value="B2C" />
          <Button className="h-9 px-3 py-0 text-xs">
            Základní nabídka
          </Button>
        </form>

        <form action="/api/admin/set-type" method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="customerType" value="B2B_SMALL" />
          <Button className="h-9 px-3 py-0 text-xs">
            Maloodběratel
          </Button>
        </form>

        <form action="/api/admin/set-type" method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="customerType" value="B2B_BIG" />
          <Button className="h-9 px-3 py-0 text-xs">
            Velkoodběratel
          </Button>
        </form>
      </div>
    </div>

  </div>
)}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* overlay */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={() => setConfirmDelete(false)}
    />

    {/* modal */}
    <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      <div className="text-lg font-semibold text-white">
        Opravdu chcete odstranit zákazníka?
      </div>

      <div className="mt-3 text-sm text-zinc-400">
        Tato akce je nevratná.
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <span className="font-semibold text-white">{fullName}</span>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setConfirmDelete(false)}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
        >
          Ne
        </button>

        <form action="/api/admin/delete-user" method="post">
          <input type="hidden" name="userId" value={user.id} />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600"
          >
            Ano
          </button>
        </form>
      </div>
    </div>
  </div>
)}

    </Card>
  );
}