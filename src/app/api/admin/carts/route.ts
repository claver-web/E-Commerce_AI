import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const carts = await prisma.cart.findMany({
      where: {
        items: {
          some: {}
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, price: true, images: true }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Calculate total value for each cart
    const enrichedCarts = carts.map(cart => {
      const totalValue = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);
      
      return {
        ...cart,
        totalValue
      };
    });

    return NextResponse.json(enrichedCarts);
  } catch (error) {
    console.error("Error fetching admin carts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
