import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const token = (body?.token ?? "").toString().trim();
    const password = (body?.password ?? "").toString();

    if (!token) {
      return NextResponse.json({ error: "Chybí token." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Heslo musí mít alespoň 6 znaků." },
        { status: 400 }
      );
    }

    const reset = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!reset) {
      return NextResponse.json({ error: "Neplatný reset odkaz." }, { status: 400 });
    }

    if (reset.usedAt) {
      return NextResponse.json({ error: "Tento odkaz už byl použit." }, { status: 400 });
    }

    if (reset.expiresAt < new Date()) {
      return NextResponse.json({ error: "Platnost odkazu vypršela." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: reset.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Uživatel nebyl nalezen." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      email: user.email,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}