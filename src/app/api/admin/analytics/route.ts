import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Get Logged-in vs Anonymous counts
    const totalUsers = await prisma.user.count();
    const totalVisitors = await prisma.visitor.count();

    // 2. Get activities from the last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivities = await prisma.userActivity.findMany({
      where: { createdAt: { gte: last24h } },
      select: { userId: true, visitorId: true, createdAt: true }
    });

    // 3. Calculate Traffic Split
    const loggedInCount = recentActivities.filter(a => a.userId).length;
    const anonymousCount = recentActivities.filter(a => !a.userId).length;

    // 4. Get conversion data (Visitors who made an order)
    const orders = await prisma.order.findMany({
      select: { userId: true, amount: true }
    });
    
    const uniqueBuyers = new Set(orders.map(o => o.userId)).size;
    const conversionRate = totalVisitors > 0 ? (uniqueBuyers / totalVisitors) * 100 : 0;

    return NextResponse.json({
      summary: {
        totalUsers,
        totalVisitors,
        loggedInCount,
        anonymousCount,
        conversionRate: conversionRate.toFixed(2) + "%",
        totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0)
      },
      trafficSplit: [
        { name: "Registered Users", value: loggedInCount, color: "#2563eb" },
        { name: "Anonymous Visitors", value: anonymousCount, color: "#8b5cf6" }
      ]
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
