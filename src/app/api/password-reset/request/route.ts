import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import path from "path";

function resetEmailHtml(resetUrl: string) {
  return `
  <!doctype html>
  <html lang="cs">
    <body style="margin:0;padding:0;background:#09090b;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#111114;border:1px solid #27272a;border-radius:22px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 18px 28px;background:linear-gradient(180deg,#131318 0%,#111114 100%);text-align:center;">
                  <img src="cid:vasco-logo" alt="VASCO" style="width:160px;height:auto;display:block;margin:0 auto 18px auto;" />
                  <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#34d39922;border:1px solid #34d39955;color:#34d399;font-size:12px;font-weight:700;">
                    Obnovení hesla
                  </div>
                  <div style="margin-top:22px;color:#ffffff;font-size:30px;line-height:1.1;font-weight:800;">
                    Nastavení nového hesla
                  </div>
                  <div style="margin-top:16px;color:#d4d4d8;font-size:15px;line-height:1.7;">
                    Klikněte na tlačítko níže a nastavte si nové heslo ke svému účtu.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 28px 28px;">
                  <div style="margin-top:8px;text-align:center;">
                    <a
                      href="${resetUrl}"
                      style="display:inline-block;padding:14px 22px;border-radius:14px;background:#ffffff;color:#111114;text-decoration:none;font-size:14px;font-weight:700;"
                    >
                      Nastavit nové heslo
                    </a>
                  </div>

                  <div style="margin-top:20px;color:#a1a1aa;font-size:13px;line-height:1.8;text-align:center;">
                    Pokud tlačítko nefunguje, použijte tento odkaz:
                  </div>
                  <div style="margin-top:8px;color:#e4e4e7;font-size:12px;line-height:1.8;text-align:center;word-break:break-all;">
                    ${resetUrl}
                  </div>

                  <div style="margin-top:24px;color:#71717a;font-size:12px;line-height:1.7;text-align:center;">
                    Odkaz je platný 60 minut. Pokud jste o změnu hesla nežádali, tento e-mail ignorujte.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email ?? "").toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Chybí e-mail." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    // kvůli bezpečnosti vždy stejná odpověď
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendMail({
      to: email,
      subject: "VASCO katalog – obnovení hesla",
      html: resetEmailHtml(resetUrl),
      text: `Pro nastavení nového hesla otevřete tento odkaz: ${resetUrl}`,
      attachments: [
        {
          filename: "vascologo.png",
          path: path.join(process.cwd(), "public", "vascologo.png"),
          cid: "vasco-logo",
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}