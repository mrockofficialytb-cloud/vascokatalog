import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const emailRaw = String(body?.email ?? "");
    const codeRaw = String(body?.code ?? "");

    const email = emailRaw.trim().toLowerCase();
    const code = codeRaw.replace(/\s+/g, "").trim();

    if (!email || !code) {
      return NextResponse.json({ error: "Chybí e-mail nebo kód." }, { status: 400 });
    }

    const token = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token: code } },
      select: { expires: true },
    });

    if (!token) {
      return NextResponse.json({ error: "Neplatný ověřovací kód." }, { status: 400 });
    }

    if (token.expires.getTime() < Date.now()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: code } },
      });

      return NextResponse.json({ error: "Kód vypršel. Pošli si prosím nový." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, volume: true, customerType: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Uživatel neexistuje." }, { status: 404 });
    }

    // ✅ správná logika:
    // SMALL = ACTIVE
    // MEDIUM/LARGE = PENDING (čeká na schválení)
    const nextStatus =
      user.volume === "SMALL"
        ? "ACTIVE"
        : "PENDING";

    await prisma.user.update({
      where: { email },
      data: { status: nextStatus as any },
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ověření se nezdařilo." }, { status: 500 });
  }
}