import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();

  if (!userId || ((sessionClaims?.metadata as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.razorpayPaymentId) {
      return NextResponse.json({ error: "Order or payment not found" }, { status: 404 });
    }

    // Process refund via Razorpay
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(order.amount * 100),
      notes: { reason: "Admin initiated refund" },
    });

    if (refund.status === "processed") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });

      return NextResponse.json({ message: "Refund processed successfully" });
    } else {
      return NextResponse.json({ error: "Refund failed at Razorpay level" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
