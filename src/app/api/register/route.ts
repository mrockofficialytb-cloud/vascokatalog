import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Demand = "SMALL" | "MEDIUM" | "LARGE";

function mapDemandToCustomerType(demand: Demand) {
  if (demand === "LARGE") return "B2B_BIG";
  if (demand === "MEDIUM") return "B2B_SMALL";
  return "B2C";
}

function mapDemandToStatus(demand: Demand) {
  // Malý = hned aktivní, Střední/Velký = čeká na schválení
  return demand === "SMALL" ? "ACTIVE" : "PENDING";
}

function mapDemandToVolume(demand: Demand) {
  // VolumeTier v DB: SMALL | MEDIUM | LARGE
  return demand;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? "").toString();

    const isCompany =
      body.isCompany === true ||
      body.isCompany === "true" ||
      body.isCompany === 1 ||
      body.isCompany === "1";

    const buyerType = isCompany ? "COMPANY" : "PERSON";

    const firstName = (body.firstName ?? "").toString().trim();
    const lastName = (body.lastName ?? "").toString().trim();
    const phone = (body.phone ?? "").toString().trim();

    const companyName = (body.companyName ?? "").toString().trim();
    const ico = (body.ico ?? "").toString().trim();
    const dic = (body.dic ?? "").toString().trim(); // nepovinné

    const street = (body.street ?? "").toString().trim();
    const houseNumber = (body.houseNumber ?? "").toString().trim();
    const city = (body.city ?? "").toString().trim();
    const zip = (body.zip ?? "").toString().trim();

    const demandLevel =
      (((body.demandLevel ?? "SMALL").toString().trim().toUpperCase() as Demand) || "SMALL");

    const consent = !!body.consent;

    // --- VALIDACE ---
    if (!email) return NextResponse.json({ error: "Chybí e-mail." }, { status: 400 });

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Heslo musí mít alespoň 6 znaků." }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Musíš potvrdit pravdivost údajů a souhlas." },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Vyplň jméno a příjmení." }, { status: 400 });
    }

    if (!phone) return NextResponse.json({ error: "Vyplň telefon." }, { status: 400 });

    if (!street || !houseNumber || !city || !zip) {
      return NextResponse.json(
        { error: "Vyplň kompletní adresu (ulice, č.p., město, PSČ)." },
        { status: 400 }
      );
    }

    if (isCompany) {
      if (!companyName) return NextResponse.json({ error: "Vyplň název firmy." }, { status: 400 });
      if (!ico) return NextResponse.json({ error: "Vyplň IČO." }, { status: 400 });
      // DIČ je nepovinné
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Tento e-mail už je registrovaný." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);

    const customerType = mapDemandToCustomerType(demandLevel);
    const status = mapDemandToStatus(demandLevel);
    const volume = mapDemandToVolume(demandLevel);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,

        // pokud máš v DB firstName/lastName, nech to klidně ukládat taky
        // (když je nemáš ve schema, smaž tyhle 2 řádky)
        firstName,
        lastName,

        name: `${firstName} ${lastName}`.trim(),
        phone,

        // NIKDY neposílej isCompany do Prisma (v modelu není)
        buyerType: buyerType as any,     // PERSON / COMPANY
        volume: volume as any,           // SMALL / MEDIUM / LARGE

        companyName: isCompany ? companyName : null,
        ico: isCompany ? ico : null,
        dic: isCompany && dic ? dic : null,

        street,
        houseNumber,
        city,
        zip,

        customerType: customerType as any,
        status: status as any,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}