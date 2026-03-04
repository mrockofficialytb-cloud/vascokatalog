import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const userId = (session as any).userId as string | undefined;
  const customerType = (session as any).customerType as "B2C" | "B2B_SMALL" | "B2B_BIG" | undefined;
  const status = (session as any).status as "ACTIVE" | "PENDING" | "DISABLED" | undefined;

  if (!userId || !customerType || !status) return new Response("Unauthorized", { status: 401 });

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
    const created = await tx.inquiry.create({
      data: {
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
            unitPriceCzkSnapshot:
              status === "ACTIVE" ? (it.product.prices?.[0]?.amountCzk ?? null) : null,
            currencySnapshot: "CZK",
          })),
        },
      },
      select: { id: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  return Response.json({ ok: true, inquiryId: inquiry.id });
}