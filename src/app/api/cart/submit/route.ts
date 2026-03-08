import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import path from "path";

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "—";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(val);
}

function buildInquiryCreatedTimeline() {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="color:#34d399; font-size:12px; font-weight:700;">●</td>
              <td style="width:48px; border-top:1px solid #3f3f46;"></td>
              <td align="center" style="color:#71717a; font-size:12px; font-weight:700;">●</td>
              <td style="width:48px; border-top:1px solid #3f3f46;"></td>
              <td align="center" style="color:#71717a; font-size:12px; font-weight:700;">●</td>
            </tr>
            <tr>
              <td align="center" style="padding-top:8px; color:#e4e4e7; font-size:11px;">Nová</td>
              <td></td>
              <td align="center" style="padding-top:8px; color:#71717a; font-size:11px;">Připravuje se</td>
              <td></td>
              <td align="center" style="padding-top:8px; color:#71717a; font-size:11px;">Dokončeno</td>
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

function buildInquiryCreatedEmailHtml(args: {
  orderLabel: string;
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
                    <img src="cid:vasco-logo" alt="VASCO" style="width:160px;height:auto;display:block;margin:0 auto;" />
                  </div>

                  <div style="text-align:center;">
                    <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#34d39922;border:1px solid #34d39955;color:#34d399;font-size:12px;font-weight:700;">
                      Poptávka přijata
                    </div>
                  </div>

                  <div style="margin-top:22px;text-align:center;">
                    <div style="color:#a1a1aa;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">
                      Číslo poptávky
                    </div>
                    <div style="margin-top:8px;color:#ffffff;font-size:34px;line-height:1.1;font-weight:800;letter-spacing:.02em;">
                      ${args.orderLabel}
                    </div>
                  </div>

                  ${buildInquiryCreatedTimeline()}

                  <div style="margin-top:20px;text-align:center;color:#e4e4e7;font-size:15px;line-height:1.7;">
                    Vaši poptávku jsme úspěšně přijali a budeme ji zpracovávat.
                  </div>
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

function buildAdminInquiryEmailHtml(args: {
  orderLabel: string;
  customer: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    companyName?: string | null;
    ico?: string | null;
    street?: string | null;
    houseNumber?: string | null;
    city?: string | null;
    zip?: string | null;
  };
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

  const fullName = [args.customer.firstName, args.customer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const address = [
    [args.customer.street, args.customer.houseNumber].filter(Boolean).join(" "),
    [args.customer.zip, args.customer.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return `
  <!doctype html>
  <html lang="cs">
    <body style="margin:0;padding:0;background:#09090b;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;background:#111114;border:1px solid #27272a;border-radius:22px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 18px 28px;background:linear-gradient(180deg,#131318 0%,#111114 100%);">
                  <div style="text-align:center;margin-bottom:22px;">
                    <img src="cid:vasco-logo" alt="VASCO" style="width:160px;height:auto;display:block;margin:0 auto;" />
                  </div>

                  <div style="text-align:center;">
                    <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#f59e0b22;border:1px solid #f59e0b55;color:#fbbf24;font-size:12px;font-weight:700;">
                      Nová poptávka
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
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 28px 28px;">
                  <div style="margin:8px 0 14px 0;color:#ffffff;font-size:16px;font-weight:700;">
                    Údaje zákazníka
                  </div>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    ${
                      fullName
                        ? `<tr><td style="padding:6px 0;color:#a1a1aa;font-size:13px;width:180px;">Jméno</td><td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;">${fullName}</td></tr>`
                        : ""
                    }
                    <tr><td style="padding:6px 0;color:#a1a1aa;font-size:13px;width:180px;">E-mail</td><td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;">${args.customer.email}</td></tr>
                    ${
                      args.customer.phone
                        ? `<tr><td style="padding:6px 0;color:#a1a1aa;font-size:13px;">Telefon</td><td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;">${args.customer.phone}</td></tr>`
                        : ""
                    }
                    ${
                      args.customer.companyName
                        ? `<tr><td style="padding:6px 0;color:#a1a1aa;font-size:13px;">Firma</td><td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;">${args.customer.companyName}</td></tr>`
                        : ""
                    }
                    ${
                      args.customer.ico
                        ? `<tr><td style="padding:6px 0;color:#a1a1aa;font-size:13px;">IČO</td><td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;">${args.customer.ico}</td></tr>`
                        : ""
                    }
                    ${
                      address
                        ? `<tr><td style="padding:6px 0;color:#a1a1aa;font-size:13px;">Adresa</td><td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;">${address}</td></tr>`
                        : ""
                    }
                  </table>

                  <div style="margin:24px 0 14px 0;color:#ffffff;font-size:16px;font-weight:700;">
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
                    Automatická notifikace z projektu <strong style="color:#d4d4d8;">VASCO katalog</strong>.
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
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const userId = (session as any).userId as string | undefined;
  const customerType = (session as any).customerType as "B2C" | "B2B_SMALL" | "B2B_BIG" | undefined;
  const status = (session as any).status as "ACTIVE" | "PENDING" | "DISABLED" | undefined;

  if (!userId || !customerType || !status) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { note?: string } | null;
  const note = (body?.note ?? "").trim().slice(0, 2000) || null;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              prices:
                status === "ACTIVE"
                  ? { where: { customerType }, take: 1 }
                  : false,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return new Response("Cart empty", { status: 400 });
  }
  
  const customer = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    companyName: true,
    ico: true,
    street: true,
    houseNumber: true,
    city: true,
    zip: true,
  },
});

if (!customer) {
  return new Response("Customer not found", { status: 404 });
}

  const inquiry = await prisma.$transaction(async (tx) => {
    const lastInquiry = await tx.inquiry.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });

    const nextOrderNumber = (lastInquiry?.orderNumber ?? 0) + 1;

    const created = await tx.inquiry.create({
      data: {
        orderNumber: nextOrderNumber,
        userId,
        note,
        customerTypeSnapshot: customerType,
        statusSnapshot: status,
        items: {
          create: cart.items.map((it) => ({
            productId: it.productId,
            skuSnapshot: it.product.sku,
            nameSnapshot: it.product.name,
            quantity: it.quantity,
            decorSnapshot: (it as any).decor ?? null,
            feltSnapshot: (it as any).felt ?? null,
            unitPriceCzkSnapshot:
              status === "ACTIVE" ? (it.product.prices?.[0]?.amountCzk ?? null) : null,
            currencySnapshot: "CZK",
          })),
        },
      },
      select: { id: true, orderNumber: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  const humanNumber = `VASCO-${String(inquiry.orderNumber).padStart(4, "0")}`;

try {
  const customerHtml = buildInquiryCreatedEmailHtml({
    orderLabel: humanNumber,
    items: cart.items.map((it) => ({
      nameSnapshot: it.product.name,
      quantity: it.quantity,
      decorSnapshot: (it as any).decor ?? null,
      feltSnapshot: (it as any).felt ?? null,
      unitPriceCzkSnapshot:
        status === "ACTIVE" ? (it.product.prices?.[0]?.amountCzk ?? null) : null,
    })),
  });

  await sendMail({
    to: session.user.email,
    subject: `Poptávka ${humanNumber} byla přijata`,
    html: customerHtml,
    text: `Poptávka ${humanNumber} byla přijata.`,
    attachments: [
      {
        filename: "vascologo.png",
        path: path.join(process.cwd(), "public", "vascologo.png"),
        cid: "vasco-logo",
      },
    ],
  });

  if (process.env.ADMIN_EMAIL) {
  const adminHtml = buildAdminInquiryEmailHtml({
    orderLabel: humanNumber,
    customer: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      companyName: customer.companyName,
      ico: customer.ico,
      street: customer.street,
      houseNumber: customer.houseNumber,
      city: customer.city,
      zip: customer.zip,
    },
    items: cart.items.map((it) => ({
      nameSnapshot: it.product.name,
      quantity: it.quantity,
      decorSnapshot: (it as any).decor ?? null,
      feltSnapshot: (it as any).felt ?? null,
      unitPriceCzkSnapshot:
        status === "ACTIVE" ? (it.product.prices?.[0]?.amountCzk ?? null) : null,
    })),
  });

  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `Nová poptávka ${humanNumber}`,
    html: adminHtml,
    text: `Nová poptávka ${humanNumber}. Zákazník: ${customer.email}`,
    attachments: [
      {
        filename: "vascologo.png",
        path: path.join(process.cwd(), "public", "vascologo.png"),
        cid: "vasco-logo",
      },
    ],
  });
}
  } catch (e) {
    console.error("MAIL ERROR:", e);
  }

  return Response.json({ ok: true, inquiryId: inquiry.id });
}