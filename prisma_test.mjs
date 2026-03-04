import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Models on prisma:", Object.keys(prisma).filter(k => !k.startsWith("$")).sort());

await prisma.$disconnect();