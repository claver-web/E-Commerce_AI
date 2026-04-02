import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = [
    {
      name: "iPhone 15 Pro Max",
      description: "Experience the ultimate iPhone with a titanium design, powerful A17 Pro chip, and advanced camera system.",
      price: 159900,
      category: "electronics",
      stock: 50,
      specifications: JSON.stringify([
        { key: "Storage", value: "256GB" },
        { key: "Color", value: "Natural Titanium" },
        { key: "Chip", value: "A17 Pro" }
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1695048133142-1a20484d2524?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1695048132961-0d2948680072?auto=format&fit=crop&q=80&w=1000"
      ]),
    },
    {
      name: "MacBook Pro M3 Max",
      description: "The most advanced MacBook Pro ever, featuring the M3 Max chip for extreme performance and stunning Liquid Retina XDR display.",
      price: 349900,
      category: "electronics",
      stock: 15,
      specifications: JSON.stringify([
        { key: "CPU", value: "14-core" },
        { key: "Memory", value: "36GB" },
        { key: "Storage", value: "1TB SSD" }
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000"
      ]),
    },
    {
      name: "Premium Leather Jacket",
      description: "Timeless style meets modern comfort. Handcrafted from genuine Italian leather with a quilted lining.",
      price: 12999,
      category: "fashion",
      stock: 25,
      specifications: JSON.stringify([
        { key: "Material", value: "Genuine Leather" },
        { key: "Fit", value: "Slim" },
        { key: "Lining", value: "Silk" }
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1551028711-03057e49514e?auto=format&fit=crop&q=80&w=1000"
      ]),
    },
    {
      name: "Minimalist Pendant Lamp",
      description: "Sleek Nordic design for your modern home. Provides warm ambient lighting with a brushed aluminum finish.",
      price: 4500,
      category: "home decor",
      stock: 40,
      specifications: JSON.stringify([
        { key: "Voltage", value: "220V" },
        { key: "Material", value: "Aluminum" },
        { key: "Bulb", value: "LED E27" }
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=1000"
      ]),
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
