"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavBtn({
  href,
  label,
  active,
  badge,
}: {
  href: string;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={
        "relative inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition " +
        (active
          ? "border-white/20 bg-white text-zinc-950"
          : "border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-900")
      }
    >
      {label}

      {typeof badge === "number" && badge > 0 && (
        <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminNav({ newCount }: { newCount: number }) {
  const pathname = usePathname() ?? "";

  const isExact = (path: string) => pathname === path;
  const isSection = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="flex items-center gap-2">
      {/* Schvalování = jen přesně /admin */}
      <NavBtn href="/admin" label="Schvalování" active={isExact("/admin")} />

      {/* Uživatelé */}
      <NavBtn href="/admin/users" label="Uživatelé" active={isSection("/admin/users")} />

      {/* Objednávky */}
      <NavBtn
        href="/admin/inquiries"
        label="Objednávky"
        active={isSection("/admin/inquiries")}
        badge={newCount}
      />

      {/* Katalog (mimo /admin) */}
      <NavBtn href="/catalog" label="Katalog" active={isExact("/catalog")} />
    </nav>
  );
}