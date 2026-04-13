import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

// In production, we use the standard PrismaClient which reads DATABASE_URL from environment variables
const prisma = new PrismaClient();

interface AmazonRecord {
  product_id: string;
  product_name: string;
  category: string;
  discounted_price: string;
  actual_price: string;
  discount_percentage: string;
  rating: string;
  rating_count: string;
  about_product: string;
  img_link: string;
  product_link: string;
  review_id: string;
  user_id: string;
  user_name: string;
  review_title: string;
  review_content: string;
}

async function runImport() {
  // Use AMZ_CSV_PATH env var if provided, otherwise default to amazon_backup.csv in root
  const csvPath = process.env.AMZ_CSV_PATH || path.join(process.cwd(), "amazon_backup.csv");
  
  console.log(`📂 Looking for CSV at: ${csvPath}`);
  
  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found. Please ensure amazon_backup.csv is in the root directory or set AMZ_CSV_PATH.");
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, "utf8");
  
  const records: AmazonRecord[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`🚀 Starting import of ${records.length} records...`);

  let count = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      const {
        product_id,
        product_name,
        category,
        discounted_price,
        actual_price,
        discount_percentage,
        rating,
        rating_count,
        about_product,
        img_link,
        product_link,
        review_id,
        user_id,
        user_name,
        review_title,
        review_content,
      } = record;

      const cleanPrice = (val: string) => {
        if (!val) return 0;
        const cleaned = val.replace(/[^\d.]/g, "");
        return parseFloat(cleaned) || 0;
      };

      const dPrice = cleanPrice(discounted_price);
      const aPrice = cleanPrice(actual_price);
      const cleanRating = parseFloat(rating) || 0;
      const cleanRatingCount = rating_count ? parseInt(rating_count.replace(/,/g, "")) : 0;

      // 1. Upsert Product
      const product = await prisma.product.upsert({
        where: { amazonId: product_id },
        update: {
          name: product_name,
          avgRating: cleanRating,
          ratingCount: cleanRatingCount,
          price: dPrice, // Ensure price is kept up to date
          specifications: JSON.stringify([
            { key: "Brand", value: "Amazon Featured" },
            { key: "Amazon ID", value: product_id },
            { key: "Original Link", value: product_link || "N/A" }
          ]),
        },
        create: {
          amazonId: product_id,
          name: product_name,
          description: about_product || product_name,
          price: dPrice,
          category: category || "Uncategorized",
          stock: 100,
          specifications: JSON.stringify([
            { key: "Brand", value: "Amazon Featured" },
            { key: "Amazon ID", value: product_id },
            { key: "Original Link", value: product_link || "N/A" }
          ]),
          images: JSON.stringify([img_link]),
          discountedPrice: dPrice,
          actualPrice: aPrice,
          discountPercentage: discount_percentage,
          avgRating: cleanRating,
          ratingCount: cleanRatingCount,
          aboutProduct: about_product,
          imgLink: img_link,
          productLink: product_link,
        },
      });

      // 2. Add Review
      if (review_id) {
        await prisma.review.upsert({
          where: { amazonReviewId: review_id },
          update: {},
          create: {
            amazonReviewId: review_id,
            rating: cleanRating,
            title: review_title,
            comment: review_content || "No detailed review content provided.",
            amazonUserId: user_id,
            amazonUserName: user_name,
            productId: product.id,
            isVerified: true,
          },
        });
      }

      successCount++;
    } catch (err) {
      console.error(`⚠️ Error processing record ${count}:`, err instanceof Error ? err.message : err);
      errorCount++;
    }

    count++;
    if (count % 100 === 0) {
      console.log(`✅ Progress: ${count}/${records.length} items processed...`);
    }
  }

  console.log("\n--- Import Summary ---");
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log("----------------------\n");
  console.log("✨ Production import completed.");
}

runImport()
  .catch((e) => {
    console.error("❌ Critical error during import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
