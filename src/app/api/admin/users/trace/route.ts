import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId: adminId } = await auth();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.userActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching user trace:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
