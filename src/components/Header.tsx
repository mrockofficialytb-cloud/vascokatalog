import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import HeaderMobileMenu from "@/components/HeaderMobileMenu";

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
    isLoggedIn && userId
      ? await prisma.cartItem.count({ where: { cart: { userId } } })
      : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <Link href="/catalog" className="flex shrink-0 items-center">
          <Image
  src="/vascologo.png"
  alt="VASCO"
  width={400}
  height={200}
  priority
  className="h-32 sm:h-24 md:h-24 w-auto"
/>
        </Link>

        <div className="md:hidden">
          <HeaderMobileMenu
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            cartCount={cartCount}
            primaryLabel={primaryLabel}
            secondaryLabel={
              isAdmin
                ? "Administrátor"
                : `${customerTypeCz(customerType)} • ${statusCz(status)}`
            }
            initials={getInitials(userName || email || "")}
          />
        </div>

        {!isLoggedIn ? (
          <div className="hidden items-center gap-3 md:flex">
            <Link
              className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-zinc-700 transition hover:text-black"
              href="/login"
            >
              Přihlásit
            </Link>

            <Link
              className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
              href="/register"
            >
              Zaregistrovat
            </Link>
          </div>
        ) : (
          <div className="hidden min-w-0 flex-1 items-center justify-end md:flex">
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                <span>Poptávka</span>
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                  {cartCount}
                </span>
              </Link>

              <div className="hidden h-10 min-w-[240px] max-w-[320px] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 xl:flex">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  {getInitials(userName || email || "")}
                </div>

                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-semibold text-zinc-900">
                    {primaryLabel}
                  </div>

                  {isAdmin ? (
                    <div className="text-xs font-semibold text-emerald-600">
                      Administrátor
                    </div>
                  ) : (
                    <div className="truncate text-xs text-zinc-500">
                      {customerTypeCz(customerType)} • {statusCz(status)}
                    </div>
                  )}
                </div>
              </div>

              <form action="/logout" method="post">
                <button className="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
                  Odhlásit
                </button>
              </form>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden h-10 items-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 2xl:inline-flex"
                >
                  Administrace
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}