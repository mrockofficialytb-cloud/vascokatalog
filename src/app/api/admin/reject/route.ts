import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!email || !isAdminEmail(email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const form = await req.formData();
  const userId = (form.get("userId") ?? "").toString().trim();

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "DISABLED",
      // volitelné: když odmítneš, můžeš ho shodit na B2C:
      // customerType: "B2C",
    },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin" },
  });
}