import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "mrockuw@seznam.cz";
const ALLOWED = new Set(["ACTIVE", "PENDING", "DISABLED"]);

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const userId = formData.get("userId");
  const status = formData.get("status");

  if (typeof userId !== "string" || typeof status !== "string" || !ALLOWED.has(status)) {
    return new Response("Bad Request", { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
  });

  redirect("/admin/users");
}