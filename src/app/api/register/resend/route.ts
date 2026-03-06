import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

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
      <title>Nový ověřovací kód</title>
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
                    Nový ověřovací kód
                  </div>
                  <div style="font-size:15px;line-height:1.65;color:#a1a1aa;max-width:420px;margin:0 auto;">
                    Na základě vašeho požadavku zasíláme nový kód pro potvrzení e-mailové adresy.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 32px 32px 32px;">
                  <div style="font-size:14px;line-height:1.7;color:#ffffff;margin-bottom:16px;font-weight:700;">
                    Váš nový ověřovací kód:
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
                      Pokud jste o nový kód nežádali, tento e-mail můžete ignorovat.
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Chybí e-mail." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Uživatel neexistuje." }, { status: 404 });
    }

    // posílej jen pokud je DISABLED (= ještě neověřeno)
    if (user.status !== ("DISABLED" as any)) {
      return NextResponse.json(
        { error: "E-mail už je ověřený / účet není v režimu ověření." },
        { status: 400 }
      );
    }

    const code = makeCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: code, expires },
    });

    await sendMail({
      to: email,
      subject: "VASCO katalog – nový ověřovací kód",
      html: codeEmailHtml(code),
      text: `Váš nový ověřovací kód je: ${code} (platnost 15 minut)`,
      attachments: [
        {
          filename: "vascologo.png",
          path: "./public/vascologo.png",
          cid: "vasco-logo",
        },
      ],
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}