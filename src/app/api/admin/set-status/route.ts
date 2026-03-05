import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AccountStatus } from "@prisma/client";

const ALLOWED: AccountStatus[] = ["ACTIVE", "PENDING", "DISABLED"];

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const userId = (formData.get("userId") ?? "").toString().trim();
  const statusRaw = (formData.get("status") ?? "").toString().trim().toUpperCase();

  if (!userId) {
    return NextResponse.json({ error: "Chybí userId." }, { status: 400 });
  }

  if (!ALLOWED.includes(statusRaw as AccountStatus)) {
    return NextResponse.json({ error: "Neplatný status." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: statusRaw as AccountStatus },
  });

  // po akci zpět na uživatele
  return NextResponse.redirect(new URL("/admin/users", req.url));
}