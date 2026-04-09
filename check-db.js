const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

async function checkIds() {
  const adapter = new PrismaBetterSqlite3({ url: 'file:C:/Users/DELL/Documents/Projects/E-commerce_AI/ecommerce-ai/prisma/dev.db' });
  const prisma = new PrismaClient({ adapter });
  
  try {
    const products = await prisma.product.findMany({ select: { id: true, name: true } });
    console.log("Current DB Products:");
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkIds();
