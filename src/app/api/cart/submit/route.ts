import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

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
    await sendMail({
      to: session.user.email,
      subject: "VASCO katalog – poptávka přijata",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>Poptávka přijata</h2>
          <p>Děkujeme za vaši poptávku.</p>
          <p>Číslo poptávky: <b>${humanNumber}</b></p>
          <p>Brzy vás budeme kontaktovat.</p>
        </div>
      `,
      text: `Děkujeme za vaši poptávku. Číslo poptávky: ${humanNumber}.`,
    });

    if (process.env.ADMIN_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: "Nová poptávka",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>Nová poptávka</h2>
            <p>Číslo: <b>${humanNumber}</b></p>
            <p>Zákazník: ${session.user.email}</p>
          </div>
        `,
        text: `Nová poptávka ${humanNumber}. Zákazník: ${session.user.email}`,
      });
    }
  } catch (e) {
    console.error("MAIL ERROR:", e);
  }

  return Response.json({ ok: true, inquiryId: inquiry.id });
}