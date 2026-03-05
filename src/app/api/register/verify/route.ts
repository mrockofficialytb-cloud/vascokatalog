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
      // token je expirovaný
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: code } },
      });

      return NextResponse.json({ error: "Kód vypršel. Pošli si prosím nový." }, { status: 400 });
    }

    // Aktivace účtu
    await prisma.user.update({
      where: { email },
      data: { status: "ACTIVE" as any },
    });

    // Smazat všechny tokeny pro tento email (čistota)
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ověření se nezdařilo." }, { status: 500 });
  }
}