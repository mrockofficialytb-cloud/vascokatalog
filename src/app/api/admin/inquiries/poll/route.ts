import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });
  }

  const latest = await prisma.inquiry.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, status: true },
  });

  const countNew = await prisma.inquiry.count({
    where: { status: "NEW" },
  });

  return NextResponse.json(
    {
      latestId: latest?.id ?? null,
      latestCreatedAt: latest?.createdAt?.toISOString() ?? null,
      latestStatus: latest?.status ?? null,
      countNew,
    },
    { status: 200 }
  );
}