import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const orders = await prisma.order.findMany({
      where: search ? {
        OR: [
          { id: { contains: search } },
          { razorpayOrderId: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } }
        ]
      } : {},
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
