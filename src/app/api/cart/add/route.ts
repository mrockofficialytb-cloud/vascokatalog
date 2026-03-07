import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const userId = (session as any).userId as string | undefined;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    productId?: string;
    quantity?: number;
    qty?: number;
    decor?: string;
    felt?: string;
  } | null;

  const productId = body?.productId;
  const quantity = Number(body?.quantity ?? body?.qty ?? 1);
  const decor = body?.decor?.toString().trim() || null;
  const felt = body?.felt?.toString().trim() || null;

  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    return new Response("Bad Request", { status: 400 });
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      decor,
      felt,
    },
    select: { id: true, quantity: true },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        decor,
        felt,
      },
    });
  }

  const count = await prisma.cartItem.count({ where: { cartId: cart.id } });
  return Response.json({ ok: true, count });
}