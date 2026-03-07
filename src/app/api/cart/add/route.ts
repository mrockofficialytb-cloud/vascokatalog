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
} | null;

const productId = body?.productId;
const quantity = Number(body?.quantity ?? body?.qty ?? 1);

  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    return new Response("Bad Request", { status: 400 });
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });

  const count = await prisma.cartItem.count({ where: { cartId: cart.id } });
  return Response.json({ ok: true, count });
}