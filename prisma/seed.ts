import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing products to avoid duplicates
  await prisma.product.deleteMany();

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
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1000"
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
        "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&q=80&w=1000"
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
        "https://images.unsplash.com/photo-1507473885765-e6ed457f7d1f?auto=format&fit=crop&q=80&w=1000"
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
