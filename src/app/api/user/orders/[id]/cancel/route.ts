import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Verify Ownership
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Order Status (Cannot cancel if already shipped or cancelled)
    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
    }
    
    // You can add more checks for 'SHIPPED' if you have those statuses

    // 3. Check 12-Hour Window
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    if (new Date(order.createdAt) < twelveHoursAgo) {
      return NextResponse.json({ 
        error: "Cancellation window has closed. You can only cancel within 12 hours of placement." 
      }, { status: 400 });
    }

    // 4. Perform Cancellation
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ 
      message: "Order cancelled successfully", 
      status: updatedOrder.status 
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
