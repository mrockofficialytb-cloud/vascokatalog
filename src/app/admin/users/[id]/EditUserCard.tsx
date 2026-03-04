import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "mrockuw@seznam.cz";

function clean(v: unknown) {
  return (v ?? "").toString().trim();
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase() ?? "";
    if (!email) return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
    if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });

    const body = await req.json();

    const userId = clean(body.userId);
    if (!userId) return NextResponse.json({ error: "Chybí userId." }, { status: 400 });

    const buyerType = clean(body.buyerType) === "COMPANY" ? "COMPANY" : "PERSON";

    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const name = `${firstName} ${lastName}`.trim();

    const phone = clean(body.phone);

    const companyName = clean(body.companyName);
    const ico = clean(body.ico);
    const dic = clean(body.dic);

    const street = clean(body.street);
    const houseNumber = clean(body.houseNumber);
    const city = clean(body.city);
    const zip = clean(body.zip);

    // minimální validace
    if (!firstName || !lastName) return NextResponse.json({ error: "Vyplň jméno a příjmení." }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Vyplň telefon." }, { status: 400 });
    if (!street || !houseNumber || !city || !zip)
      return NextResponse.json({ error: "Vyplň kompletní adresu (ulice, č.p., město, PSČ)." }, { status: 400 });

    if (buyerType === "COMPANY") {
      if (!companyName) return NextResponse.json({ error: "Vyplň název firmy." }, { status: 400 });
      if (!ico) return NextResponse.json({ error: "Vyplň IČO." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        // pokud tyhle fieldy v DB nemáš, smaž je:
        firstName,
        lastName,

        phone,

        buyerType: buyerType as any,
        companyName: buyerType === "COMPANY" ? companyName : null,
        ico: buyerType === "COMPANY" ? ico : null,
        dic: buyerType === "COMPANY" && dic ? dic : null,

        street,
        houseNumber,
        city,
        zip,
      } as any,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}