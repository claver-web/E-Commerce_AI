import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  
  // Basic protection - check if user is admin
  // In a real app, you'd strictly check the role
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Total Revenue
    const revenueStats = await prisma.order.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        amount: true
      }
    });

    const prevRevenueStats = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalRevenue = revenueStats._sum.amount || 0;
    const prevRevenue = prevRevenueStats._sum.amount || 0;
    const revenueChange = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;

    // 2. Total Orders
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const prevOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });

    const ordersChange = prevOrders === 0 ? 100 : ((totalOrders - prevOrders) / prevOrders) * 100;

    // 3. New Users
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const prevUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });

    const usersChange = prevUsers === 0 ? 100 : ((newUsers - prevUsers) / prevUsers) * 100;

    // 4. Inventory Items
    const inventoryItems = await prisma.product.count();

    // 5. Chart Data (Last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        amount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Group by day for chart
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartDataMap = new Map();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = days[d.getDay()];
      chartDataMap.set(dayName, { name: dayName, revenue: 0, orders: 0 });
    }

    recentOrders.forEach(order => {
      const dayName = days[order.createdAt.getDay()];
      if (chartDataMap.has(dayName)) {
        const current = chartDataMap.get(dayName);
        current.revenue += order.amount;
        current.orders += 1;
      }
    });

    const chartData = Array.from(chartDataMap.values());

    return NextResponse.json({
      revenue: {
        value: totalRevenue,
        change: revenueChange.toFixed(1),
        trend: revenueChange >= 0 ? "up" : "down"
      },
      orders: {
        value: totalOrders,
        change: ordersChange.toFixed(1),
        trend: ordersChange >= 0 ? "up" : "down"
      },
      users: {
        value: newUsers,
        change: usersChange.toFixed(1),
        trend: usersChange >= 0 ? "up" : "down"
      },
      inventory: {
        value: inventoryItems,
        change: "0",
        trend: "up"
      },
      chartData
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
