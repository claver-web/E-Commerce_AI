import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  const headerPayload = await headers();
  const userAgent = headerPayload.get("user-agent");
  const ipAddress = headerPayload.get("x-forwarded-for") || "unknown";

  try {
    const { visitorId, action, productId, details } = await request.json();

    if (!visitorId) return NextResponse.json({ error: "Visitor ID required" }, { status: 400 });

    // 1. Ensure Visitor exists in DB
    await prisma.visitor.upsert({
      where: { visitorId },
      create: { 
        visitorId, 
        userAgent, 
        ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0] 
      },
      update: { lastSeen: new Date() }
    });

    // 2. Find local user if clerkId is present
    let localUserId = null;
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true }
      });
      localUserId = user?.id;
    }

    // 3. Log the activity
    await prisma.userActivity.create({
      data: {
        userId: localUserId,
        visitorId,
        action: action || "visit",
        productId,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        userAgent,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0]
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
