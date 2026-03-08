import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "asc" }
  })

  let n = 1

  for (const i of inquiries) {
    await prisma.inquiry.update({
      where: { id: i.id },
      data: { orderNumber: n }
    })

    n++
  }

  console.log("Hotovo")
}

main()