import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = await request.json();

    // 1. Find the local user first (mapping Clerk ID to our DB ID)
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    // Self-healing: If user doesn't exist in DB yet (webhook delay), create them
    if (!user) {
      const clerkUser = await currentUser();
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || "guest@example.com",
          name: `${clerkUser?.firstName || "Guest"} ${clerkUser?.lastName || "User"}`.trim(),
        }
      });
    }

    // 2. Get or Create the user's cart using the local DB user.id
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: { updatedAt: new Date() }
    });

    // 2. Clear existing items to sync with the current state
    // (A more optimized approach would be to diff, but clear/re-create is safer for a full sync)
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // 3. Create the new items
    if (items && items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map((item: any) => ({
          cartId: cart.id,
          productId: item.id,
          quantity: item.quantity
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) return NextResponse.json([]);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(cart?.items || []);
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
