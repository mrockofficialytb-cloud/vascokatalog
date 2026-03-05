import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function codeEmailHtml(code: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
    <h2>Ověření e-mailu</h2>
    <p>Váš nový ověřovací kód:</p>
    <div style="font-size:28px;font-weight:700;letter-spacing:4px;padding:12px 16px;border:1px solid #ddd;display:inline-block;border-radius:10px">
      ${code}
    </div>
    <p style="margin-top:16px;color:#555">Platnost kódu je 15 minut.</p>
  </div>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").toString().trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Chybí e-mail." }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    if (!user) return NextResponse.json({ error: "Uživatel neexistuje." }, { status: 404 });

    // posílej jen pokud je DISABLED (= ještě neověřeno)
    if (user.status !== ("DISABLED" as any)) {
      return NextResponse.json({ error: "E-mail už je ověřený / účet není v režimu ověření." }, { status: 400 });
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
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}