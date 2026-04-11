import { prisma } from "../src/lib/prisma";
import { ProductCollection } from "@prisma/client";

type PriceSeed = {
  customerType: "B2C" | "B2B_SMALL" | "B2B_BIG";
  amountCzk: number;
};

type ProductSeed = {
  sku: string;
  slug: string;
  collection: ProductCollection;
  name: string;
  description?: string | null;
  imageUrl?: string;
  prices: PriceSeed[];
};

const PRODUCTS: ProductSeed[] = [
  {
    sku: "LAM-CLASSIC",
    slug: "classic-lamelovy-panel",
    collection: ProductCollection.CLASSIC,
    name: "Lamelové panely CLASSIC",
    imageUrl: "/products/lam-001.jpeg",
    prices: [
      { customerType: "B2C", amountCzk: 78500 },
      { customerType: "B2B_SMALL", amountCzk: 78500 },
      { customerType: "B2B_BIG", amountCzk: 78500 },
    ],
  },
  {
    sku: "LAM-PREMIUM",
    slug: "premium-lamelovy-panel",
    collection: ProductCollection.PREMIUM,
    name: "Lamelové panely PREMIUM",
    imageUrl: "/products/premium/premium-zlata.jpg",
    prices: [
      { customerType: "B2C", amountCzk: 100000 },
      { customerType: "B2B_SMALL", amountCzk: 100000 },
      { customerType: "B2B_BIG", amountCzk: 100000 },
    ],
  },
  {
    sku: "LAM-SPAZIO",
    slug: "spazio-lamelovy-panel",
    collection: ProductCollection.SPAZIO,
    name: "Lamelové panely SPAZIO",
    imageUrl: "/products/spazio/spazio-antracit.jpg",
    prices: [
      { customerType: "B2C", amountCzk: 63000 },
      { customerType: "B2B_SMALL", amountCzk: 63000 },
      { customerType: "B2B_BIG", amountCzk: 63000 },
    ],
  },
  {
    sku: "LAM-MODULLO",
    slug: "modullo-lamelovy-panel",
    collection: ProductCollection.MODULLO,
    name: "Lamelové panely MODULLO",
    imageUrl: "/products/modullo/modullo-medovydub-bila.jpg",
    prices: [
      { customerType: "B2C", amountCzk: 78000 },
      { customerType: "B2B_SMALL", amountCzk: 78000 },
      { customerType: "B2B_BIG", amountCzk: 78000 },
    ],
  },

  {
    sku: "RIFFCELLO-SET-STD",
    slug: "riffcello-sestava-standard",
    collection: ProductCollection.RIFFCELLO,
    name: "Panely RIFFCELLO",
    description: "Sestava 2 kusů",
    imageUrl: "/products/riffcello/riffcello-oakviking.jpg",
    prices: [
      { customerType: "B2C", amountCzk: 83500 },
      { customerType: "B2B_SMALL", amountCzk: 83500 },
      { customerType: "B2B_BIG", amountCzk: 83500 },
    ],
  },
  {
    sku: "RIFFCELLO-SET-PREMIUM",
    slug: "riffcello-sestava-premium",
    collection: ProductCollection.RIFFCELLO,
    name: "Panely RIFFCELLO PREMIUM",
    description: "Sestava 2 kusů PREMIUM",
    imageUrl: "/products/riffcello/riffcello-cernybeton.jpg",
    prices: [
      { customerType: "B2C", amountCzk: 99400 },
      { customerType: "B2B_SMALL", amountCzk: 99400 },
      { customerType: "B2B_BIG", amountCzk: 99400 },
    ],
  },
  {
    sku: "RIFFCELLO-LISTY-STD",
    slug: "riffcello-doplnkove-listy-standard",
    collection: ProductCollection.RIFFCELLO,
    name: "Lišty RIFFCELLO",
    description: "Doplňkové lišty",
    imageUrl: "/products/riffcello/listy/riffcello-oaknatural.jpg",
    prices: [
      { customerType: "B2C", amountCzk: 51900 },
      { customerType: "B2B_SMALL", amountCzk: 51900 },
      { customerType: "B2B_BIG", amountCzk: 51900 },
    ],
  },
  {
    sku: "RIFFCELLO-LISTY-PREMIUM",
    slug: "riffcello-doplnkove-listy-premium",
    collection: ProductCollection.RIFFCELLO,
    name: "Lišty RIFFCELLO",
    description: "Doplňkové lišty PREMIUM",
    imageUrl: "/products/riffcello/listy/riffcello-cernybeton.jpg",
    prices: [
      { customerType: "B2C", amountCzk: 68800 },
      { customerType: "B2B_SMALL", amountCzk: 68800 },
      { customerType: "B2B_BIG", amountCzk: 68800 },
    ],
  },
];

async function main() {
  const activeSkus = PRODUCTS.map((p) => p.sku);

  await prisma.product.updateMany({
    where: {
      sku: { notIn: activeSkus },
    },
    data: {
      isActive: false,
    },
  });

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findUnique({
      where: { sku: p.sku },
      select: { id: true, description: true },
    });

    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      create: {
        sku: p.sku,
        slug: p.slug,
        collection: p.collection,
        name: p.name,
        description: p.description ?? null,
        imageUrl: p.imageUrl ?? null,
        isActive: true,
      },
      update: {
        slug: p.slug,
        collection: p.collection,
        name: p.name,
        imageUrl: p.imageUrl ?? null,
        isActive: true,
        ...(existing?.description == null
          ? { description: p.description ?? null }
          : {}),
      },
      select: { id: true },
    });

    await prisma.price.deleteMany({
      where: { productId: product.id },
    });

    await prisma.price.createMany({
      data: p.prices.map((pr) => ({
        productId: product.id,
        customerType: pr.customerType,
        amountCzk: pr.amountCzk,
      })),
    });
  }

  console.log(`Seed OK (${PRODUCTS.length} aktivních produktů)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });