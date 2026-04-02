import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment successful
      await prisma.order.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      return NextResponse.json({ message: "Payment verified successfully" });
    } else {
      // Payment failed
      await prisma.order.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: "FAILED",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
