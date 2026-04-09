import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            clerkId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rating, title, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5 || !comment) {
    return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for verified purchase (optional but good)
    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          userId: user.id,
          status: "COMPLETED",
        },
      },
    });

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: id,
        },
      },
      update: {
        rating,
        title,
        comment,
        isVerified: !!verifiedPurchase,
      },
      create: {
        rating,
        title,
        comment,
        isVerified: !!verifiedPurchase,
        userId: user.id,
        productId: id,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
