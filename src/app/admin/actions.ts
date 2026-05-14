"use server";

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function importPlatformData(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) return { error: "No file uploaded" };

  try {
    const fileContent = await file.text();
    let records: any[] = [];

    // Attempt to parse as JSON first
    try {
      records = JSON.parse(fileContent);
      // If it's a single object, wrap it in an array
      if (!Array.isArray(records)) records = [records];
    } catch (e) {
      // If JSON fails, attempt to parse as CSV
      try {
        records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
        });
      } catch (csvError) {
        return { error: "Invalid file format. Please upload a valid JSON or CSV file." };
      }
    }

    console.log(`🚀 Starting upload-triggered import of ${records.length} records...`);

    let successCount = 0;
    for (const record of records) {
      try {
        // Handle Urbanic-specific and other possible field names
        const name = record.title || record.product_name || record.name;
        const id = record.product_id || record.id || record.amazonId || record.asin;
        const priceNum = record.price_numeric || record.price || "0";
        const desc = record.about_product || record.description || record.desc || "No description available.";
        
        // Smart Image Extraction (Including image_url)
        let finalImages: string[] = [];
        const rawImages = record.images || record.image_url || record.img_link || record.image || record.img || record.url || record.thumbnail || record.photo;

        if (Array.isArray(rawImages)) {
          finalImages = rawImages.filter(img => img && img !== "/placeholder.jpg" && img !== "/placeholder.png");
        } else if (rawImages && rawImages !== "/placeholder.jpg" && rawImages !== "/placeholder.png") {
          finalImages = [rawImages];
        }

        // If no valid images found, use the neutral placeholder
        if (finalImages.length === 0) {
          finalImages = ["https://placehold.co/600x600/e2e8f0/64748b?text=Product"];
        }

        if (!name || !id) continue;

        const cleanPrice = (p: any) => {
          if (typeof p === 'number') return p;
          return parseFloat(String(p).replace(/[^\d.]/g, "")) || 0;
        };

        const colors = record.available_colors ? JSON.stringify(record.available_colors) : null;
        
        await prisma.product.upsert({
          where: { amazonId: String(id) },
          update: {
            name: String(name),
            description: String(desc),
            price: cleanPrice(priceNum),
            images: JSON.stringify(finalImages),
            stock: 50,
          },
          create: {
            amazonId: String(id),
            name: String(name),
            description: String(desc),
            price: cleanPrice(priceNum),
            category: String(record.category || "General").split("|")[0].trim(),
            images: JSON.stringify(finalImages),
            specifications: JSON.stringify({ detail: desc }),
            stock: 50,
          },
        });
        successCount++;
      } catch (err) {
        console.error(`Skipped record due to error:`, err);
      }
    }

    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Import Error:", error);
    return { error: error.message || "Failed to process the uploaded file" };
  }
}
