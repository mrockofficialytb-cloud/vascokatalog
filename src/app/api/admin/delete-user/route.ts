import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email ?? null;

    // jen admin
    if (!email || !isAdminEmail(email)) {
      return NextResponse.json({ error: "Neoprávněný přístup." }, { status: 403 });
    }

    const formData = await req.formData();
    const userId = String(formData.get("userId") ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "Chybí userId." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Uživatel neexistuje." }, { status: 404 });
    }

    // ochrana proti smazání vlastního admin účtu
    if (user.email === email) {
      return NextResponse.json(
        { error: "Nemůžete smazat svůj vlastní účet." },
        { status: 400 }
      );
    }

    // smažeme vše navázané, co by mohlo blokovat delete
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: { identifier: user.email },
      }),

      prisma.session.deleteMany({
        where: { userId },
      }),

      prisma.account.deleteMany({
        where: { userId },
      }),

      prisma.inquiry.deleteMany({
        where: { userId },
      }),

      prisma.cart.deleteMany({
        where: { userId },
      }),

      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.redirect(new URL("/admin/users", req.url));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Smazání zákazníka se nezdařilo." }, { status: 500 });
  }
}