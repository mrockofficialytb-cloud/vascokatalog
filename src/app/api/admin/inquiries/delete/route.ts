import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const inquiryId = (formData.get("inquiryId") ?? "").toString().trim();

    if (!inquiryId) {
      return NextResponse.json({ error: "Chybí inquiryId." }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      select: { id: true },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Poptávka nebyla nalezena." }, { status: 404 });
    }

    await prisma.inquiry.delete({
      where: { id: inquiryId },
    });

    return NextResponse.redirect(new URL("/admin/inquiries", req.url));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}