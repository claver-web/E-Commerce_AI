import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

interface UrbanicColor {
  name: string;
  img_url: string;
  selected: boolean;
}

interface UrbanicRecord {
  product_id: string;
  title: string;
  category: string;
  price_numeric: number;
  product_url: string;
  image_url: string;
  sku_id?: number;
  skc_id?: number;
  color_name?: string;
  available_colors?: UrbanicColor[];
  scrape_date?: string;
}

async function runImport() {
  const jsonDir = path.join(process.cwd(), "json");
  
  if (!fs.existsSync(jsonDir)) {
    console.error("❌ JSON directory not found.");
    process.exit(1);
  }

  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith(".json"));
  console.log(`📂 Found ${files.length} JSON files in ${jsonDir}`);

  let totalSuccess = 0;
  let totalError = 0;

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    console.log(`\n🚀 Processing ${file}...`);
    
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const records: UrbanicRecord[] = JSON.parse(content);
      
      let fileSuccess = 0;
      let fileError = 0;

      for (const record of records) {
        try {
          const allImages = [
            record.image_url,
            ...(record.available_colors?.map(c => c.img_url) || [])
          ].filter((url, index, self) => url && self.indexOf(url) === index); // Unique and non-null

          await prisma.product.upsert({
            where: { urbanicId: record.product_id },
            update: {
              name: record.title,
              price: record.price_numeric,
              category: record.category,
              skuId: record.sku_id,
              skcId: record.skc_id,
              colorName: record.color_name,
              availableColors: record.available_colors ? JSON.stringify(record.available_colors) : null,
              productUrl: record.product_url,
              scrapeDate: record.scrape_date,
              images: JSON.stringify(allImages),
            },
            create: {
              urbanicId: record.product_id,
              name: record.title,
              description: `Urbanic ${record.title} - Category: ${record.category}`,
              price: record.price_numeric,
              category: record.category,
              stock: 100, // Default stock
              skuId: record.sku_id,
              skcId: record.skc_id,
              colorName: record.color_name,
              availableColors: record.available_colors ? JSON.stringify(record.available_colors) : null,
              productUrl: record.product_url,
              scrapeDate: record.scrape_date,
              images: JSON.stringify(allImages),
              specifications: JSON.stringify([
                { key: "Source", value: "Urbanic" },
                { key: "SKU ID", value: record.sku_id || "N/A" },
                { key: "SKC ID", value: record.skc_id || "N/A" }
              ]),
            },
          });
          fileSuccess++;
        } catch (err) {
          console.error(`⚠️ Error processing product ${record.product_id}:`, err);
          fileError++;
        }
      }
      
      console.log(`✅ ${file}: ${fileSuccess} success, ${fileError} errors`);
      totalSuccess += fileSuccess;
      totalError += fileError;
    } catch (err) {
      console.error(`❌ Critical error reading file ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n--- Final Import Summary ---");
  console.log(`✅ Total successfully processed: ${totalSuccess}`);
  console.log(`❌ Total errors: ${totalError}`);
  console.log("----------------------------\n");
}

runImport()
  .catch((e) => {
    console.error("❌ Critical error during import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
