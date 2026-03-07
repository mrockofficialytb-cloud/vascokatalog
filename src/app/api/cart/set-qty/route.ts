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
    decor?: string | null;
    felt?: string | null;
  } | null;

  const productId = body?.productId;
  const quantity = Number(body?.quantity);
  const decor = body?.decor ?? null;
  const felt = body?.felt ?? null;

  if (!productId || !Number.isInteger(quantity) || quantity < 0) {
    return new Response("Bad Request", { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!cart) return Response.json({ ok: true });

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
        decor,
        felt,
      },
    });

    return Response.json({ ok: true });
  }

  await prisma.cartItem.updateMany({
    where: {
      cartId: cart.id,
      productId,
      decor,
      felt,
    },
    data: { quantity },
  });

  return Response.json({ ok: true });
}