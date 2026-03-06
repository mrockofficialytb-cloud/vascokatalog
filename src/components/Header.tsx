import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

function customerTypeCz(type?: string) {
  if (type === "B2B_BIG") return "Velkoodběratel";
  if (type === "B2B_SMALL") return "Maloodběratel";
  if (type === "B2C") return "Základní nabídka";
  return "Zákazník";
}

function statusCz(status?: string) {
  if (status === "ACTIVE") return "Schváleno";
  if (status === "PENDING") return "Čeká na schválení";
  if (status === "DISABLED") return "Odmítnuto";
  if (status === "PENDING_EMAIL") return "Čeká na ověření e-mailu";
  return "Neznámý stav";
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return ((parts[0][0] ?? "") + (parts[1][0] ?? "")).toUpperCase();
}

export default async function Header() {
  const session = await auth();

  const isLoggedIn = !!session?.user?.email;
  const customerType = (session as any)?.customerType as string | undefined;
  const status = (session as any)?.status as string | undefined;
  const userId = (session as any)?.userId as string | undefined;

  const email = session?.user?.email ?? null;
  const isAdmin = isAdminEmail(email);

  const userName =
    (session?.user as any)?.name ||
    (session as any)?.name ||
    (session as any)?.user?.name ||
    null;

  const primaryLabel = userName || email || "Uživatel";

  const cartCount =
    isLoggedIn && userId ? await prisma.cartItem.count({ where: { cart: { userId } } }) : 0;

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left brand */}
        <Link href="/catalog" className="flex items-center">
          <Image
            src="/vascologo.png"
            alt="VASCO"
            width={400}
            height={200}
            priority
            style={{ height: "100px", width: "auto" }}
          />
        </Link>

        {/* Right actions */}
        {!isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold text-zinc-200 hover:text-white" href="/login">
              Přihlásit
            </Link>
            <span className="text-zinc-700">•</span>
            <Link className="text-sm font-semibold text-zinc-200 hover:text-white" href="/register">
              Registrovat
            </Link>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center gap-3">
              {/* Poptávka */}
              <Link
                href="/cart"
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                Poptávka
                <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-0.5 text-xs">
                  {cartCount}
                </span>
              </Link>

              {/* User box */}
              <div className="hidden h-12 min-w-[320px] items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
                  {getInitials(userName || email || "")}
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="whitespace-nowrap text-sm font-semibold text-zinc-100">
                    {primaryLabel}
                  </span>

                  {isAdmin ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      Administrátor
                    </span>
                  ) : (
                    <span className="mt-1 text-xs font-semibold text-zinc-400">
                      {customerTypeCz(customerType)} • {statusCz(status)}
                    </span>
                  )}
                </div>
              </div>

              {/* Odhlásit */}
              <form action="/logout" method="post">
                <button className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200">
                  Odhlásit
                </button>
              </form>

              {/* Admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="ml-6 inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                >
                  <svg
                    className="h-5 w-5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 3h10v18H4z" />
                    <circle cx="11" cy="12" r="0.8" fill="currentColor" />
                    <path
                      d="M14 12h6M17 9l3 3-3 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Administrace</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}