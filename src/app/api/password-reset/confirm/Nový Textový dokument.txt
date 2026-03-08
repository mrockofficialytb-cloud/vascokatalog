import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      token?: string;
      password?: string;
    } | null;

    const token = (body?.token ?? "").toString().trim();
    const password = (body?.password ?? "").toString();

    if (!token || !password) {
      return NextResponse.json({ error: "Chybí token nebo heslo." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Heslo musí mít alespoň 6 znaků." }, { status: 400 });
    }

    const reset = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (!reset) {
      return NextResponse.json({ error: "Neplatný reset odkaz." }, { status: 400 });
    }

    if (reset.usedAt) {
      return NextResponse.json({ error: "Tento odkaz už byl použit." }, { status: 400 });
    }

    if (reset.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Platnost odkazu vypršela." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: reset.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({
        where: {
          user: { email: reset.email },
        },
      }),
    ]);

    return NextResponse.json({ ok: true, email: reset.email }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}