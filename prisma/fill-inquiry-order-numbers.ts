import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, orderNumber: true },
  });

  let n = 1;

  for (const inquiry of inquiries) {
    if (inquiry.orderNumber == null) {
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { orderNumber: n },
      });
    }
    n++;
  }

  console.log(`Hotovo. Doplněno ${inquiries.length} poptávkám.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });