import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "mrockuw@seznam.cz";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const userId = formData.get("userId") as string;

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  redirect("/admin");
}