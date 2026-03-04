import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { InquiryStatus } from "@prisma/client";

const ALLOWED: InquiryStatus[] = ["NEW", "IN_PROGRESS", "DONE", "CANCELED"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });
    }

    const body = await req.formData();
    const inquiryId = (body.get("inquiryId") ?? "").toString().trim();
    const statusRaw = (body.get("status") ?? "").toString().trim().toUpperCase();

    if (!inquiryId) {
      return NextResponse.json({ error: "Chybí inquiryId." }, { status: 400 });
    }

    if (!ALLOWED.includes(statusRaw as InquiryStatus)) {
      return NextResponse.json(
        { error: `Neplatný status: ${statusRaw}` },
        { status: 400 }
      );
    }

    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: statusRaw as InquiryStatus },
    });

    return NextResponse.redirect(new URL("/admin/inquiries", req.url));
  } catch (e: any) {
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}