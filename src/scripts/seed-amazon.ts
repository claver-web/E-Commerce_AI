import "dotenv/config";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { prisma } from "../lib/prisma";

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

async function seed() {
  const csvPath = path.join(process.cwd(), "amazon_backup.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found at:", csvPath);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, "utf8");
  
  const records: AmazonRecord[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`🚀 Parsed ${records.length} records from CSV.`);

  // To speed up, we'll track products we've already upserted in this run
  const productCache = new Set<string>();

  let count = 0;
  for (const record of records) {
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
      // Remove symbols like ₹ and commas
      const cleaned = val.replace(/[^\d.]/g, "");
      return parseFloat(cleaned) || 0;
    };

    const dPrice = cleanPrice(discounted_price);
    const aPrice = cleanPrice(actual_price);
    const cleanRating = parseFloat(rating) || 0;
    const cleanRatingCount = rating_count ? parseInt(rating_count.replace(/,/g, "")) : 0;

    // 1. Upsert Product
    // We only need to upsert the product data once per product_id in the row
    let productId = "";
    
    // In this specific CSV, many rows have the same product_id but different review info.
    // We check cache to minimize DB calls.
    const product = await prisma.product.upsert({
      where: { amazonId: product_id },
      update: {
        // Just in case some fields were missing in previous rows
        name: product_name,
        avgRating: cleanRating,
        ratingCount: cleanRatingCount,
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
    
    productId = product.id;

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
          productId: productId,
          isVerified: true,
        },
      });
    }

    count++;
    if (count % 100 === 0) {
      console.log(`✅ Processed ${count} entries...`);
    }
  }

  console.log("✨ Seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
