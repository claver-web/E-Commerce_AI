"use server";

import prisma from "@/lib/prisma";

export async function seedTestCarts() {
  try {
    // 1. Get some users and products
    const users = await prisma.user.findMany({ take: 2 });
    const products = await prisma.product.findMany({ take: 3 });

    if (users.length < 2 || products.length < 2) {
      return { error: "You need at least 2 users and 2 products in your database to generate test data." };
    }

    // 2. Create Cart for User 1
    const cart1 = await prisma.cart.upsert({
      where: { userId: users[0].id },
      create: { userId: users[0].id },
      update: {}
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart1.id } });
    await prisma.cartItem.createMany({
      data: [
        { cartId: cart1.id, productId: products[0].id, quantity: 2 },
        { cartId: cart1.id, productId: products[1].id, quantity: 1 }
      ]
    });

    // 3. Create Cart for User 2
    const cart2 = await prisma.cart.upsert({
      where: { userId: users[1].id },
      create: { userId: users[1].id },
      update: {}
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart2.id } });
    await prisma.cartItem.createMany({
      data: [
        { cartId: cart2.id, productId: products[1].id, quantity: 4 }
      ]
    });

    return { success: true };
  } catch (error) {
    console.error("Seed Action Error:", error);
    return { error: "Internal Server Error" };
  }
}
