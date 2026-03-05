import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendMail } from "@/lib/mailer";

type Demand = "SMALL" | "MEDIUM" | "LARGE";

function mapDemandToCustomerType(demand: Demand) {
  if (demand === "LARGE") return "B2B_BIG";
  if (demand === "MEDIUM") return "B2B_SMALL";
  return "B2C";
}

function mapDemandToStatusAfterVerify(demand: Demand) {
  // Malý = hned aktivní, Střední/Velký = čeká na schválení
  return demand === "SMALL" ? "ACTIVE" : "PENDING";
}

function mapDemandToVolume(demand: Demand) {
  return demand; // VolumeTier: SMALL | MEDIUM | LARGE
}

function makeCode() {
  // 6 číslic, bez 0 na začátku (ať lidi nemají "000123")
  return String(Math.floor(100000 + Math.random() * 900000));
}

function codeEmailHtml(code: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
    <h2>Ověření e-mailu</h2>
    <p>Pro dokončení registrace zadejte tento kód:</p>
    <div style="font-size:28px;font-weight:700;letter-spacing:4px;padding:12px 16px;border:1px solid #ddd;display:inline-block;border-radius:10px">
      ${code}
    </div>
    <p style="margin-top:16px;color:#555">Platnost kódu je 15 minut.</p>
  </div>`;
}

async function createAndSendVerification(email: string) {
  const code = makeCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // smaž staré tokeny pro tento email (ať je vždy jen 1 kód)
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
    },
  });

  await sendMail({
    to: email,
    subject: "VASCO katalog – ověřovací kód",
    html: codeEmailHtml(code),
    text: `Váš ověřovací kód je: ${code} (platnost 15 minut)`,
  });
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
      return NextResponse.json({ error: "Musíš potvrdit pravdivost údajů a souhlas." }, { status: 400 });
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
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Tento e-mail už je registrovaný." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);

    const customerType = mapDemandToCustomerType(demandLevel);
    const volume = mapDemandToVolume(demandLevel);

    // 👇 klíč: dokud není ověřeno, účet je DISABLED (nepůjde login)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,

        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone,

        buyerType: buyerType as any,
        volume: volume as any,

        companyName: isCompany ? companyName : null,
        ico: isCompany ? ico : null,
        dic: isCompany && dic ? dic : null,

        street,
        houseNumber,
        city,
        zip,

        customerType: customerType as any,
        status: "DISABLED" as any,
      },
      select: { id: true },
    });

    await createAndSendVerification(email);

    return NextResponse.json(
      {
        ok: true,
        userId: user.id,
        next: "VERIFY_EMAIL",
        statusAfterVerify: mapDemandToStatusAfterVerify(demandLevel),
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}