import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

function s(v: any) {
  return (v ?? "").toString().trim();
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isAdminEmail(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const userId = s(body.userId);
    if (!userId) return NextResponse.json({ error: "Chybí userId." }, { status: 400 });

    const name = s(body.name);
    const phone = s(body.phone);
    const companyName = s(body.companyName);
    const ico = s(body.ico);
    const dic = s(body.dic);
    const street = s(body.street);
    const houseNumber = s(body.houseNumber);
    const city = s(body.city);
    const zip = s(body.zip);

    if (!name) return NextResponse.json({ error: "Jméno nesmí být prázdné." }, { status: 400 });

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone: phone || null,
        companyName: companyName || null,
        ico: ico || null,
        // @ts-ignore
        dic: dic || null,
        // @ts-ignore
        street: street || null,
        // @ts-ignore
        houseNumber: houseNumber || null,
        city: city || null,
        // @ts-ignore
        zip: zip || null,
      } as any,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}