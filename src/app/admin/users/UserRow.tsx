"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

type UserRowProps = {
  user: {
    id: string;
    email: string;
    name: string | null;
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

function customerTypeLabel(type: string) {
  if (type === "B2B_BIG") return "VELKOODBĚRATEL";
  if (type === "B2B_SMALL") return "MALOODBĚRATEL";
  if (type === "B2C") return "ZÁKLADNÍ NABÍDKA";
  return type;
}

function customerTypeIndicator(type: string) {
  if (type === "B2B_BIG") return "🟢 Velkoodběratel";
  if (type === "B2B_SMALL") return "🟡 Maloodběratel";
  if (type === "B2C") return "⚪ Základní nabídka";
  return type;
}

function customerTypeBadgeClass(type: string) {
  if (type === "B2B_BIG") return "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200";
  if (type === "B2B_SMALL") return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
  if (type === "B2C") return "border-zinc-500/30 bg-zinc-500/10 text-zinc-200";
  return "border-zinc-600 bg-zinc-900/40 text-zinc-300";
}

function TypeBadge({ t }: { t: string }) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";
  return <span className={`${base} ${customerTypeBadgeClass(t)}`}>{customerTypeLabel(t)}</span>;
}

export default function UserRow({ user }: UserRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* LEFT */}
        <div className="min-w-0">
          <div className="text-base font-semibold truncate">{user.email}</div>
          <div className="mt-1 text-xs text-zinc-500">
            {(user.name ?? "").trim()} • {new Date(user.createdAt).toLocaleString("cs-CZ")}
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
            Zobrazit kartu zákazníka <span aria-hidden className="text-zinc-500">→</span>
          </Link>
        </div>

        {/* RIGHT */}
        <div className="shrink-0">
         <Button
  type="button"
  onClick={() => setOpen((v) => !v)}
  className="h-9 px-4 py-0 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200"
>
  {open ? "Skrýt" : "Upravit"}
</Button>
        </div>
      </div>

      {/* EXPAND */}
      {open && (
        <div className="mt-4 grid gap-4 border-t border-zinc-900 pt-4 sm:grid-cols-2">
          {/* STATUS */}
          <div>
            <div className="mb-2 text-xs font-semibold text-zinc-400">Status</div>
            <div className="flex flex-wrap gap-2">
              <form action="/api/admin/set-status" method="post">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="status" value="ACTIVE" />
                <Button className="h-9 px-3 py-0 text-xs">Přijmout</Button>
              </form>

              <form action="/api/admin/set-status" method="post">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="status" value="PENDING" />
                <Button className="h-9 px-3 py-0 text-xs">Čeká na schválení</Button>
              </form>

              <form action="/api/admin/set-status" method="post">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="status" value="DISABLED" />
                <Button className="h-9 px-3 py-0 text-xs">Odmítnout</Button>
              </form>
            </div>
          </div>

          {/* TYPE */}
          <div>
            <div className="mb-2 text-xs font-semibold text-zinc-400">Typ zákazníka</div>
            <div className="flex flex-wrap gap-2">
              <form action="/api/admin/set-type" method="post">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="customerType" value="B2C" />
                <Button className="h-9 px-3 py-0 text-xs">Základní nabídka</Button>
              </form>

              <form action="/api/admin/set-type" method="post">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="customerType" value="B2B_SMALL" />
                <Button className="h-9 px-3 py-0 text-xs">Maloodběratel</Button>
              </form>

              <form action="/api/admin/set-type" method="post">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="customerType" value="B2B_BIG" />
                <Button className="h-9 px-3 py-0 text-xs">Velkoodběratel</Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}