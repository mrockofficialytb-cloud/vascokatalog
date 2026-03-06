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
  return demand === "SMALL" ? "ACTIVE" : "PENDING";
}

function mapDemandToVolume(demand: Demand) {
  return demand;
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function codeEmailHtml(code: string) {
  return `
  <!doctype html>
  <html lang="cs">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ověření e-mailu</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#050505;border:1px solid #18181b;border-radius:24px;overflow:hidden;">
              
              <tr>
                <td style="padding:26px 32px 18px 32px;text-align:center;border-bottom:1px solid #111827;background:#050505;">
                  <img src="cid:vasco-logo" alt="VASCO" style="height:62px;width:auto;display:block;margin:0 auto 18px auto;" />
                  <div style="font-size:24px;line-height:1.25;font-weight:800;color:#ffffff;margin-bottom:10px;">
                    Ověření e-mailu
                  </div>
                  <div style="font-size:15px;line-height:1.65;color:#a1a1aa;max-width:420px;margin:0 auto;">
                    Pro dokončení registrace do online katalogu potvrďte svou e-mailovou adresu pomocí ověřovacího kódu.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 32px 32px 32px;">
                  <div style="font-size:14px;line-height:1.7;color:#ffffff;margin-bottom:16px;font-weight:700;">
                    Váš ověřovací kód:
                  </div>

                  <div style="text-align:center;margin:14px 0 28px 0;">
                    <div style="display:inline-block;background:#ffffff;color:#0f172a;border-radius:18px;padding:20px 30px;font-size:38px;font-weight:900;letter-spacing:10px;border:1px solid #e5e7eb;">
                      ${code}
                    </div>
                  </div>

                  <div style="background:#111318;border:1px solid #1f2937;border-radius:18px;padding:18px 20px;margin-bottom:24px;">
                    <div style="font-size:15px;line-height:1.7;color:#ffffff;font-weight:700;">
                      Kód je platný 15 minut.
                    </div>
                    <div style="font-size:14px;line-height:1.7;color:#a1a1aa;margin-top:6px;">
                      Pokud jste registraci neprováděli, tento e-mail můžete ignorovat.
                    </div>
                  </div>

                  <div style="font-size:13px;line-height:1.8;color:#71717a;text-align:center;">
                    Tento e-mail byl odeslán automaticky z projektu
                    <strong style="color:#ffffff;"> VASCO katalog</strong>.
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

async function createAndSendVerification(email: string) {
  const code = makeCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

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
    attachments: [
      {
        filename: "vascologo.png",
        path: "./public/vascologo.png",
        cid: "vasco-logo",
      },
    ],
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
    const dic = (body.dic ?? "").toString().trim();

    const street = (body.street ?? "").toString().trim();
    const houseNumber = (body.houseNumber ?? "").toString().trim();
    const city = (body.city ?? "").toString().trim();
    const zip = (body.zip ?? "").toString().trim();

    const demandLevel =
      (((body.demandLevel ?? "SMALL").toString().trim().toUpperCase() as Demand) || "SMALL");

    const consent = !!body.consent;

    if (!email) {
      return NextResponse.json({ error: "Chybí e-mail." }, { status: 400 });
    }

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

    if (!phone) {
      return NextResponse.json({ error: "Vyplň telefon." }, { status: 400 });
    }

    if (!street || !houseNumber || !city || !zip) {
      return NextResponse.json(
        { error: "Vyplň kompletní adresu (ulice, č.p., město, PSČ)." },
        { status: 400 }
      );
    }

    if (isCompany) {
      if (!companyName) {
        return NextResponse.json({ error: "Vyplň název firmy." }, { status: 400 });
      }
      if (!ico) {
        return NextResponse.json({ error: "Vyplň IČO." }, { status: 400 });
      }
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Tento e-mail už je registrovaný." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customerType = mapDemandToCustomerType(demandLevel);
    const volume = mapDemandToVolume(demandLevel);

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

        // do ověření e-mailu blokace přihlášení
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