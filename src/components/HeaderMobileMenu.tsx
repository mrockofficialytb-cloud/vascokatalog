"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type Props = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  cartCount: number;
  primaryLabel: string;
  secondaryLabel: string;
  initials: string;
};

export default function HeaderMobileMenu({
  isLoggedIn,
  isAdmin,
  cartCount,
  primaryLabel,
  secondaryLabel,
  initials,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const menu = (
    <div
      className={`fixed inset-0 z-[9999] transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`absolute right-0 top-0 h-full w-[88vw] max-w-[360px] border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <div className="text-sm font-semibold text-zinc-900"></div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(100%-73px)] flex-col overflow-y-auto px-4 py-4">
          {isLoggedIn ? (
            <>
              <div className="mb-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900">
                      {primaryLabel}
                    </div>
                    <div
                      className={`truncate text-xs ${
                        isAdmin ? "font-semibold text-emerald-600" : "text-zinc-500"
                      }`}
                    >
                      {secondaryLabel}
                    </div>
                  </div>
                </div>
              </div>

              <nav className="grid gap-2">
                <Link
                  href="/catalog"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Katalog
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  <span>Poptávka</span>
                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                    {cartCount}
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                  >
                    Administrace
                  </Link>
                )}

                <form action="/logout" method="post" className="mt-2">
                  <button className="inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
                    Odhlásit
                  </button>
                </form>
              </nav>
            </>
          ) : (
            <nav className="grid gap-3">
              <Link
                href="/catalog"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Katalog
              </Link>

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Přihlásit
              </Link>

              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Zaregistrovat
              </Link>
            </nav>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Otevřít menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {mounted ? createPortal(menu, document.body) : null}
    </>
  );
}