import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { InquiryStatus } from "@prisma/client";
import { sendMail } from "@/lib/mailer";
import path from "path";

const ALLOWED: InquiryStatus[] = ["NEW", "IN_PROGRESS", "DONE", "CANCELED"];

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "—";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(val);
}

function statusLabel(status: string) {
  if (status === "IN_PROGRESS") return "Objednávka se připravuje";
  if (status === "DONE") return "Objednávka dokončena";
  if (status === "CANCELED") return "Objednávka stornována";
  return "Stav objednávky byl změněn";
}

function statusBadgeColor(status: string) {
  if (status === "IN_PROGRESS") return "#38bdf8";
  if (status === "DONE") return "#34d399";
  if (status === "CANCELED") return "#f87171";
  return "#a1a1aa";
}

function buildTimeline(currentStatus: string) {
  const isNew = currentStatus === "NEW" || currentStatus === "IN_PROGRESS" || currentStatus === "DONE";
  const isProgress = currentStatus === "IN_PROGRESS" || currentStatus === "DONE";
  const isDone = currentStatus === "DONE";
  const isCanceled = currentStatus === "CANCELED";

  const dotNew = isCanceled ? "#71717a" : isNew ? "#34d399" : "#71717a";
  const dotProgress = isCanceled ? "#71717a" : isProgress ? "#34d399" : "#71717a";
  const dotDone = isCanceled ? "#f87171" : isDone ? "#34d399" : "#71717a";

  const textNew = isCanceled ? "#71717a" : isNew ? "#e4e4e7" : "#71717a";
  const textProgress = isCanceled ? "#71717a" : isProgress ? "#e4e4e7" : "#71717a";
  const textDone = isCanceled ? "#fca5a5" : isDone ? "#e4e4e7" : "#71717a";

  const line1 = isCanceled ? "#3f3f46" : isProgress ? "#34d399" : "#3f3f46";
  const line2 = isCanceled ? "#3f3f46" : isDone ? "#34d399" : "#3f3f46";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="color:${dotNew}; font-size:12px; font-weight:700;">●</td>
              <td style="width:48px; border-top:1px solid ${line1};"></td>
              <td align="center" style="color:${dotProgress}; font-size:12px; font-weight:700;">●</td>
              <td style="width:48px; border-top:1px solid ${line2};"></td>
              <td align="center" style="color:${dotDone}; font-size:12px; font-weight:700;">●</td>
            </tr>
            <tr>
              <td align="center" style="padding-top:8px; color:${textNew}; font-size:11px;">Nová</td>
              <td></td>
              <td align="center" style="padding-top:8px; color:${textProgress}; font-size:11px;">Připravuje se</td>
              <td></td>
              <td align="center" style="padding-top:8px; color:${textDone}; font-size:11px;">
                ${isCanceled ? "Storno" : "Dokončeno"}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function buildItemsHtml(
  items: Array<{
    nameSnapshot: string;
    quantity: number;
    decorSnapshot: string | null;
    feltSnapshot: string | null;
    unitPriceCzkSnapshot: number | null;
  }>
) {
  return items
    .map((it) => {
      const lineTotal =
        typeof it.unitPriceCzkSnapshot === "number"
          ? it.unitPriceCzkSnapshot * it.quantity
          : null;

      return `
        <tr>
          <td style="padding:14px 0;border-top:1px solid #27272a;vertical-align:top;">
            <div style="color:#ffffff;font-size:14px;font-weight:700;line-height:1.4;">
              ${it.nameSnapshot}
            </div>
            ${
              it.decorSnapshot
                ? `<div style="margin-top:4px;color:#a1a1aa;font-size:12px;">Dekor: ${it.decorSnapshot}</div>`
                : ""
            }
            ${
              it.feltSnapshot
                ? `<div style="margin-top:2px;color:#a1a1aa;font-size:12px;">Varianta: ${it.feltSnapshot}</div>`
                : ""
            }
            <div style="margin-top:2px;color:#a1a1aa;font-size:12px;">Počet kusů: ${it.quantity}</div>
          </td>
          <td style="padding:14px 0;border-top:1px solid #27272a;vertical-align:top;text-align:right;">
            <div style="color:#e4e4e7;font-size:13px;">${formatCzk(it.unitPriceCzkSnapshot)} / ks</div>
            <div style="margin-top:4px;color:#ffffff;font-size:14px;font-weight:700;">${formatCzk(lineTotal)}</div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function buildStatusEmailHtml(args: {
  orderLabel: string;
  statusRaw: string;
  note?: string;
  items: Array<{
    nameSnapshot: string;
    quantity: number;
    decorSnapshot: string | null;
    feltSnapshot: string | null;
    unitPriceCzkSnapshot: number | null;
  }>;
}) {
  const totalCzk = args.items.reduce((sum, it) => {
    return sum + (it.unitPriceCzkSnapshot ?? 0) * it.quantity;
  }, 0);

  const badgeColor = statusBadgeColor(args.statusRaw);
  const title = statusLabel(args.statusRaw);
  const logoCid = "vasco-logo";

  const intro =
    args.statusRaw === "IN_PROGRESS"
      ? "Vaše objednávka byla přijata a právě ji připravujeme."
      : args.statusRaw === "DONE"
      ? "Vaše objednávka byla úspěšně dokončena."
      : args.statusRaw === "CANCELED"
      ? "Vaše objednávka byla stornována."
      : "Stav objednávky byl změněn.";

  return `
  <!doctype html>
  <html lang="cs">
    <body style="margin:0;padding:0;background:#09090b;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#111114;border:1px solid #27272a;border-radius:22px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 18px 28px;background:linear-gradient(180deg,#131318 0%,#111114 100%);">
                  <div style="text-align:center;margin-bottom:22px;">
                    <img src="cid:${logoCid}" alt="VASCO" style="width:160px;height:auto;display:block;margin:0 auto;" />
                  </div>

                  <div style="text-align:center;">
                    <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:${badgeColor}22;border:1px solid ${badgeColor}55;color:${badgeColor};font-size:12px;font-weight:700;">
                      ${title}
                    </div>
                  </div>

                  <div style="margin-top:22px;text-align:center;">
                    <div style="color:#a1a1aa;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">
                      Číslo objednávky
                    </div>
                    <div style="margin-top:8px;color:#ffffff;font-size:34px;line-height:1.1;font-weight:800;letter-spacing:.02em;">
                      ${args.orderLabel}
                    </div>
                  </div>

                  ${buildTimeline(args.statusRaw)}

                  <div style="margin-top:20px;text-align:center;color:#e4e4e7;font-size:15px;line-height:1.7;">
                    ${intro}
                  </div>

                  ${
                    args.statusRaw === "CANCELED" && args.note
                      ? `
                    <div style="margin-top:20px;border:1px solid #7f1d1d;background:#2a0f12;border-radius:16px;padding:16px 18px;">
                      <div style="color:#fca5a5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Důvod storna</div>
                      <div style="margin-top:8px;color:#ffe4e6;font-size:14px;line-height:1.7;">
                        ${args.note}
                      </div>
                    </div>
                  `
                      : ""
                  }
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 28px 28px;">
                  <div style="margin:8px 0 14px 0;color:#ffffff;font-size:16px;font-weight:700;">
                    Přehled položek
                  </div>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${buildItemsHtml(args.items)}
                  </table>

                  <div style="margin-top:18px;padding-top:18px;border-top:1px solid #27272a;text-align:right;">
                    <div style="color:#a1a1aa;font-size:13px;">Celkem</div>
                    <div style="margin-top:6px;color:#ffffff;font-size:24px;font-weight:800;">
                      ${formatCzk(totalCzk)}
                    </div>
                  </div>

                  <div style="margin-top:24px;color:#71717a;font-size:12px;line-height:1.7;text-align:center;">
                    Tento e-mail byl odeslán automaticky z projektu <strong style="color:#d4d4d8;">VASCO katalog</strong>.
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
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Nemáš oprávnění." }, { status: 403 });
    }

    const body = await req.formData();

    const inquiryId = (body.get("inquiryId") ?? "").toString().trim();
    const statusRaw = (body.get("status") ?? "").toString().trim().toUpperCase();
    const note = (body.get("note") ?? "").toString().trim();
	const redirectTo = (body.get("redirectTo") ?? "").toString().trim();

    if (!inquiryId) {
      return NextResponse.json({ error: "Chybí inquiryId." }, { status: 400 });
    }

    if (!ALLOWED.includes(statusRaw as InquiryStatus)) {
      return NextResponse.json({ error: "Neplatný status." }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.update({
  where: { id: inquiryId },
  data: {
    status: statusRaw as InquiryStatus,
    note: note || undefined,
  },
  include: {
    user: true,
    items: {
      orderBy: { id: "asc" },
    },
  },
});

    const orderLabel = `VASCO-${String(inquiry.orderNumber).padStart(4, "0")}`;

   let subject = "";

if (statusRaw === "IN_PROGRESS") {
  subject = `Objednávka ${orderLabel} se připravuje`;
}

if (statusRaw === "DONE") {
  subject = `Objednávka ${orderLabel} je dokončena`;
}

if (statusRaw === "CANCELED") {
  subject = `Objednávka ${orderLabel} byla stornována`;
}

if (subject) {
  const html = buildStatusEmailHtml({
    orderLabel,
    statusRaw,
    note,
    items: inquiry.items.map((it) => ({
      nameSnapshot: it.nameSnapshot,
      quantity: it.quantity,
      decorSnapshot: it.decorSnapshot ?? null,
      feltSnapshot: it.feltSnapshot ?? null,
      unitPriceCzkSnapshot: it.unitPriceCzkSnapshot ?? null,
    })),
  });

  await sendMail({
    to: inquiry.user.email,
    subject,
    html,
    text: `${subject} — ${orderLabel}`,
    attachments: [
      {
        filename: "vascologo.png",
        path: path.join(process.cwd(), "public", "vascologo.png"),
        cid: "vasco-logo",
      },
    ],
  });
}

    return NextResponse.redirect(
  new URL(redirectTo || `/admin/inquiries/${inquiryId}`, req.url)
);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}