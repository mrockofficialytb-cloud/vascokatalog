import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.product.create({
    data: {
      sku: "LAM-001",
      name: "Lamelový panel 1000 mm",
      description: "Ukázkový produkt",
      prices: {
        create: [
          { customerType: "B2C", amountCzk: 19900 },
          { customerType: "B2B_SMALL", amountCzk: 17900 },
          { customerType: "B2B_BIG", amountCzk: 14900 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      sku: "LAM-002",
      name: "Lamelový panel 2000 mm",
      description: "Druhý ukázkový produkt",
      prices: {
        create: [
          { customerType: "B2C", amountCzk: 34900 },
          { customerType: "B2B_SMALL", amountCzk: 31900 },
          { customerType: "B2B_BIG", amountCzk: 27900 },
        ],
      },
    },
  });

  console.log("Seed OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });