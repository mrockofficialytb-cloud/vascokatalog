import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      collection: true,
      prices: {
        select: {
          amountCzk: true,
          currency: true,
        },
        orderBy: {
          amountCzk: "asc",
        },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const out = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl ?? null,
    collection: p.collection ?? null,
    price: p.prices[0] ?? null,
  }));

  return NextResponse.json({ products: out });
}