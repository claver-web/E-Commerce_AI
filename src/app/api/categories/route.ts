import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    });

    // Format the response for easier frontend consumption
    const formattedCategories = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.id,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
