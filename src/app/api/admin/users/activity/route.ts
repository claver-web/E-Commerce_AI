import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Fetch all users who have had activity or orders
    const users = await prisma.user.findMany({
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        orders: {
          select: { id: true, amount: true, status: true, createdAt: true }
        },
        _count: {
          select: { activities: true, orders: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // 2. Enrich data with summary stats
    const enrichedUsers = users.map(user => {
      const lastActivity = user.activities[0];
      const totalSpend = user.orders.reduce((sum, order) => sum + order.amount, 0);
      
      // Determine "Active" status (within last 30 mins)
      const isRecentlyActive = lastActivity 
        ? (new Date().getTime() - new Date(lastActivity.createdAt).getTime()) < 30 * 60 * 1000
        : false;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        lastActive: lastActivity?.createdAt || user.updatedAt,
        latestAction: lastActivity?.action || "No activity",
        orderCount: user._count.orders,
        activityCount: user._count.activities,
        totalSpend,
        isRecentlyActive,
        orders: user.orders
      };
    });

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    console.error("Error fetching user intelligence:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
