import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CartClient } from "@/components/CartClient";
import Header from "@/components/Header";

function formatCzk(amountCzk: number) {
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(val);
}

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const userId = (session as any).userId as string;
  const customerType = (session as any).customerType as "B2C" | "B2B_SMALL" | "B2B_BIG";
  const status = (session as any).status as "ACTIVE" | "PENDING" | "DISABLED";

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            include: {
              prices:
                status === "ACTIVE" ? { where: { customerType }, take: 1 } : false,
            },
          },
        },
      },
    },
  });

  const items = (cart?.items ?? []).map((it) => {
    const price = status === "ACTIVE" ? (it.product.prices?.[0]?.amountCzk ?? null) : null;
    const subtotal = price ? price * it.quantity : null;
    return {
      productId: it.productId,
      name: it.product.name,
      sku: it.product.sku,
      quantity: it.quantity,
      unitPriceCzk: price,
      subtotalCzk: subtotal,
    };
  });

  const totalCzk = items.reduce((sum, i) => sum + (i.subtotalCzk ?? 0), 0);
  const hasPrices = status === "ACTIVE";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
	<Header />
      <header className="border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xl font-semibold tracking-tight">POPTÁVKA</div>
            <div className="text-sm text-zinc-400">
              Nezávazná poptávka. Uvedené ceny budou potvrzeny v nabídce.
            </div>
          </div>
          <Link
            href="/catalog"
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
          >
            ← Zpět do katalogu
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {status === "PENDING" && (
          <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-amber-100">
            <div className="font-semibold">Účet čeká na schválení</div>
            <div className="mt-1 text-sm opacity-90">Ceny se zobrazí po aktivaci velkoodběru.</div>
          </div>
        )}

        <CartClient items={items} hasPrices={hasPrices} totalText={hasPrices ? formatCzk(totalCzk) : null} />
      </div>
    </main>
  );
}