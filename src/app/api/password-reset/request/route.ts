import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import crypto from "crypto";

function resetEmailHtml(link: string) {
  return `
  <!doctype html>
  <html lang="cs">
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#050505;border:1px solid #18181b;border-radius:24px;overflow:hidden;">
              <tr>
                <td style="padding:28px 32px;text-align:center;">
                  <div style="font-size:24px;line-height:1.25;font-weight:800;color:#ffffff;margin-bottom:10px;">
                    Obnovení hesla
                  </div>
                  <div style="font-size:15px;line-height:1.65;color:#a1a1aa;max-width:420px;margin:0 auto 24px auto;">
                    Klikněte na tlačítko níže a nastavte si nové heslo.
                  </div>

                  <a
                    href="${link}"
                    style="display:inline-block;background:#ffffff;color:#111827;text-decoration:none;border-radius:14px;padding:14px 22px;font-size:14px;font-weight:700;"
                  >
                    Nastavit nové heslo
                  </a>

                  <div style="margin-top:24px;font-size:13px;line-height:1.8;color:#71717a;">
                    Odkaz je platný 30 minut.
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
    const body = await req.json().catch(() => null) as { email?: string } | null;
    const email = (body?.email ?? "").toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Chybí e-mail." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "";
    const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await sendMail({
      to: email,
      subject: "VASCO katalog – obnovení hesla",
      html: resetEmailHtml(link),
      text: `Pro obnovení hesla otevřete tento odkaz: ${link}`,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}