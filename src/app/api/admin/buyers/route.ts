import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Fetch unique users who have orders, sorted by their most recent order
    const buyers = await prisma.user.findMany({
      where: {
        orders: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            amount: true,
            createdAt: true,
            status: true
          }
        },
        _count: {
          select: { orders: true }
        }
      },
      take: 5,
      orderBy: {
        updatedAt: "desc" // Approximation of recent activity
      }
    });

    // Calculate total spend for these buyers
    const enrichedBuyers = await Promise.all(buyers.map(async (buyer) => {
      const totalSpend = await prisma.order.aggregate({
        where: { userId: buyer.id },
        _sum: { amount: true }
      });
      
      return {
        ...buyer,
        totalSpend: totalSpend._sum.amount || 0,
        latestOrder: buyer.orders[0] || null
      };
    }));

    return NextResponse.json(enrichedBuyers);
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
