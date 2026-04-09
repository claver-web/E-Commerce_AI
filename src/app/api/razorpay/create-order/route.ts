import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, currency, receipt, items, shippingAddress } = await req.json();
    console.log("Creating Razorpay order for items:", items.map((i: any) => i.id));

    // 1. Validate that all products exist in our DB
    const productIds = items.map((item: any) => item.id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });

    if (existingProducts.length !== productIds.length) {
      const existingIds = existingProducts.map(p => p.id);
      const missingIds = productIds.filter((id: string) => !existingIds.includes(id));
      console.error("Missing products in DB:", missingIds);
      return NextResponse.json(
        { error: "Some products in your cart no longer exist. Please refresh your cart or clear the cart and add items again." },
        { status: 400 }
      );
    }

    let order;
    try {
      const options = {
        amount: Math.round(amount * 100),
        currency: currency || "INR",
        receipt: receipt || `receipt_${Date.now()}`,
      };
      order = await razorpay.orders.create(options);
    } catch (razorError) {
      console.error("Razorpay API Error:", razorError);
      return NextResponse.json({ error: "Razorpay order creation failed" }, { status: 500 });
    }
    
    // Auto-sync user if not found in our database
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    console.log("User in DB:", !!user);
    
    if (!user) {
      console.log("Attempting auto-sync with Clerk for userId:", userId);
      try {
        const { currentUser } = await import("@clerk/nextjs/server");
        const clerkUser = await currentUser();
        console.log("Clerk User fetched:", !!clerkUser);
        
        if (clerkUser) {
          user = await prisma.user.create({
            data: {
              clerkId: userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || "",
              name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
              role: "USER"
            }
          });
          console.log("Auto-sync successful for user:", user.id);
        }
      } catch (syncError) {
        console.error("Clerk Auto-sync Error:", syncError);
        // We don't fail yet, maybe the DB query failed for another reason
      }
    }
    
    if (!user) {
      console.error("User sync failed and user not found in DB");
      return NextResponse.json({ error: "User sync failed" }, { status: 404 });
    }

    try {
      console.log("Creating DB order for user:", user.id);
      const dbOrder = await prisma.order.create({
        data: {
          userId: user.id,
          razorpayOrderId: order.id,
          amount: parseFloat(amount),
          status: "PENDING",
          shippingAddress: JSON.stringify(shippingAddress),
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
      console.log("DB Order created:", dbOrder.id);

      return NextResponse.json({ 
        orderId: order.id, 
        amount: order.amount, 
        currency: order.currency,
        dbOrderId: dbOrder.id
      });
    } catch (dbError) {
      console.error("Database Order Creation Error:", dbError);
      return NextResponse.json({ error: "Database order creation failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("General Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
