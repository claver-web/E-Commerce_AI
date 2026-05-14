import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { status } = await request.json();
    
    const validStatuses = [
      "PENDING", 
      "PAID", 
      "PACKED", 
      "DISPATCHED", 
      "OUT_FOR_DELIVERY", 
      "DELIVERED", 
      "CANCELLED"
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Log this as a user activity as well
    await prisma.userActivity.create({
      data: {
        userId: updatedOrder.userId,
        action: "status_update",
        details: JSON.stringify({ info: `Order ${updatedOrder.id} status changed to ${status}` }),
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
