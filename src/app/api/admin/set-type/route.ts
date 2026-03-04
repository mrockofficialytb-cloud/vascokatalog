import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "mrockuw@seznam.cz";
const ALLOWED = new Set(["B2C", "B2B_SMALL", "B2B_BIG"]);

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const userId = formData.get("userId");
  const customerType = formData.get("customerType");

  if (typeof userId !== "string" || typeof customerType !== "string" || !ALLOWED.has(customerType)) {
    return new Response("Bad Request", { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { customerType: customerType as any },
  });

  redirect("/admin/users");
}