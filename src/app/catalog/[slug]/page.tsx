import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "—";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(val);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  const isLoggedIn = !!session?.user?.email;
  const customerType = (session as any)?.customerType as "B2C" | "B2B_SMALL" | "B2B_BIG" | undefined;
  const status = (session as any)?.status as "ACTIVE" | "PENDING" | "DISABLED" | undefined;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      collection: true,
      prices:
        isLoggedIn && status === "ACTIVE" && customerType
          ? {
              where: { customerType },
              select: { amountCzk: true, currency: true },
              take: 1,
            }
          : false,
    },
  });

  if (!product) notFound();

  const price = (product as any).prices?.[0]?.amountCzk ?? null;

  // Demo galerie: zatím z imageUrl uděláme 1. fotku + placeholdery
  // (Jakmile budeš chtít, uděláme ProductImage model a bude to real data.)
  const gallery = [
    product.imageUrl || "/products/placeholder.jpg",
    "/products/placeholder.jpg",
    "/products/placeholder.jpg",
  ];

  // Demo dekory (vzorky pod fotkou) – později to napojíme na DB (varianty/dekory)
  const decorThumbs = [
    "/products/decors/ash.jpeg",
    "/products/decors/black-oak.jpeg",
    "/products/decors/classic-oak.jpeg",
    "/products/decors/white-oak.jpeg",
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{product.name}</div>
            <div className="mt-1 text-sm text-zinc-400">
              Kolekce: {(product.collection || "—").toString()}
            </div>
          </div>

          <Link
            href="/catalog"
            className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 inline-flex items-center"
          >
            Zpět do katalogu
          </Link>
        </div>

        <ProductDetailClient
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description ?? "",
            collection: (product.collection ?? "") as any,
            priceLabel: price == null ? "Po přihlášení / schválení" : formatCzk(price),
            gallery,
            decorThumbs,
          }}
          canOrder={isLoggedIn}
        />
      </div>
    </main>
  );
}