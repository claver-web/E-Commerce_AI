import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const activities = await prisma.userActivity.findMany({
      where: search ? {
        OR: [
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { action: { contains: search } },
          { details: { contains: search } }
        ]
      } : {},
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    // If any activity is a purchase, we'll try to find the associated order
    // This is a bit expensive but okay for a 'Recent Activity' list of 20 items.
    const enrichedActivities = await Promise.all(activities.map(async (activity) => {
      if (activity.action === "purchase" && activity.details) {
        // Try to find order by ID if it's in details
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { id: activity.details },
              { razorpayOrderId: activity.details }
            ]
          },
          include: {
            items: {
              include: { product: { select: { name: true } } }
            }
          }
        });
        return { ...activity, order };
      }
      return activity;
    }));
    
    return NextResponse.json(enrichedActivities);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
