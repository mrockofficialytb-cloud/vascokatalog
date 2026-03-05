import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  const isLoggedIn = !!session?.user?.email;
  const customerType = (session as any)?.customerType as
    | "B2C"
    | "B2B_SMALL"
    | "B2B_BIG"
    | undefined;

  const status = (session as any)?.status as
    | "ACTIVE"
    | "PENDING"
    | "DISABLED"
    | undefined;

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      slug: true,          // ✅
      name: true,
      description: true,
      imageUrl: true,      // ✅
      collection: true,    // ✅
      prices:
        isLoggedIn && status === "ACTIVE" && customerType
          ? {
              where: { customerType },
              select: { amountCzk: true, currency: true },
              take: 1,
            }
          : false,
    },
    orderBy: { name: "asc" },
  });

  const out = products.map((p: any) => ({
    id: p.id,
    sku: p.sku,
    slug: p.slug,                 // ✅
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl ?? null, // ✅
    collection: p.collection ?? null, // ✅
    price: p.prices?.[0] ?? null,
  }));

  return NextResponse.json({ products: out });
}