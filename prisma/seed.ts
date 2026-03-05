import { prisma } from "../src/lib/prisma";
import { ProductCollection } from "@prisma/client";

type PriceSeed = {
  customerType: "B2C" | "B2B_SMALL" | "B2B_BIG";
  amountCzk: number;
};

type ProductSeed = {
  sku: string;
  slug: string;
  collection: ProductCollection; // ✅ enum, ne string
  name: string;
  description?: string;
  imageUrl?: string;
  prices: PriceSeed[];
};

const PRODUCTS: ProductSeed[] = [
  {
    sku: "LAM-001",
    slug: "classic-lamelovy-panel-1000",
    collection: ProductCollection.CLASSIC,
    name: "Lamelový panel 1000 mm",
    description: "Ukázkový produkt",
    imageUrl: "/products/lam-001.jpeg",
    prices: [
      { customerType: "B2C", amountCzk: 19900 },
      { customerType: "B2B_SMALL", amountCzk: 17900 },
      { customerType: "B2B_BIG", amountCzk: 14900 }
    ]
  },
  {
    sku: "LAM-002",
    slug: "premium-lamelovy-panel-2000",
    collection: ProductCollection.PREMIUM,
    name: "Lamelový panel 2000 mm",
    description: "Druhý ukázkový produkt",
    imageUrl: "/products/lam-002.jpeg",
    prices: [
      { customerType: "B2C", amountCzk: 34900 },
      { customerType: "B2B_SMALL", amountCzk: 31900 },
      { customerType: "B2B_BIG", amountCzk: 27900 }
    ]
  },
  {
    sku: "LAM-003",
    slug: "spazio-lamelovy-panel-2400",
    collection: ProductCollection.SPAZIO,
    name: "Lamelový panel 2400 mm",
    description: "Delší varianta",
    imageUrl: "/products/lam-003.jpeg",
    prices: [
      { customerType: "B2C", amountCzk: 39900 },
      { customerType: "B2B_SMALL", amountCzk: 36900 },
      { customerType: "B2B_BIG", amountCzk: 32900 }
    ]
  },
  {
    sku: "LAM-004",
    slug: "modullo-lamelovy-panel-3000",
    collection: ProductCollection.MODULLO,
    name: "Lamelový panel 3000 mm",
    description: "Maxi varianta",
    imageUrl: "/products/lam-004.jpeg",
    prices: [
      { customerType: "B2C", amountCzk: 45900 },
      { customerType: "B2B_SMALL", amountCzk: 42900 },
      { customerType: "B2B_BIG", amountCzk: 38900 }
    ]
  }
];

async function main() {
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      create: {
        sku: p.sku,
        slug: p.slug,
        collection: p.collection,
        name: p.name,
        description: p.description ?? null,
        imageUrl: p.imageUrl ?? null,
        isActive: true
      },
      update: {
        slug: p.slug,
        collection: p.collection,
        name: p.name,
        description: p.description ?? null,
        imageUrl: p.imageUrl ?? null,
        isActive: true
      },
      select: { id: true }
    });

    await prisma.price.deleteMany({ where: { productId: product.id } });
    await prisma.price.createMany({
      data: p.prices.map((pr) => ({
        productId: product.id,
        customerType: pr.customerType,
        amountCzk: pr.amountCzk
      }))
    });
  }

  console.log(`Seed OK (${PRODUCTS.length} produktů)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });