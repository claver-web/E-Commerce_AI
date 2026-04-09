import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // 1. Verify Razorpay Signature OR User Authentication
    const { userId } = await auth();
    let isAuthorized = false;

    // A. Check if valid Razorpay Signature is provided
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret) {
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
      
      if (generated_signature === razorpay_signature) {
        isAuthorized = true;
      }
    }

    // B. Check if User is Authenticated and owns this order (for manual downloads)
    const order = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isAuthorized) {
      if (userId && order.user.clerkId === userId && order.status === "COMPLETED") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized or invalid signature" }, { status: 401 });
    }

    const shippingInfo = JSON.parse(order.shippingAddress || "{}");

    // 3. Generate PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: any[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Styling and Content
      const blueColor = "#2563eb";

      // Header
      doc.fillColor(blueColor).fontSize(24).text("AI-COMMERCE PLATFORM", { align: "right" });
      doc.fillColor("#444444").fontSize(10).text("Precision Hardware & Software Solutions", { align: "right" });
      doc.moveDown();

      // Horizontal Line
      doc.strokeColor("#eeeeee").lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

      // Invoice Info
      doc.moveDown(2);
      doc.fillColor("#000000").fontSize(20).text("INVOICE", 50, 120);
      doc.fontSize(10).fillColor("#777777");
      doc.text(`Invoice Number: INV-${order.id.slice(-8).toUpperCase()}`, 50, 145);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 160);
      doc.text(`Payment ID: ${order.razorpayPaymentId || razorpay_payment_id}`, 50, 175);

      // Customer Info
      doc.fontSize(12).fillColor("#000000").text("Billed To:", 350, 120);
      doc.fontSize(10).fillColor("#444444");
      doc.text(shippingInfo.fullName || order.user.name || "Customer", 350, 135);
      doc.text(order.user.email, 350, 150);
      doc.text(shippingInfo.address || "No address provided", 350, 165);
      doc.text(`${shippingInfo.city || ""} - ${shippingInfo.pincode || ""}`, 350, 180);

      doc.moveDown(4);

      // Table Header
      const tableTop = 250;
      doc.fillColor(blueColor).rect(50, tableTop, 500, 20).fill();
      doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold");
      doc.text("Product", 60, tableTop + 5);
      doc.text("Qty", 350, tableTop + 5, { width: 50, align: "center" });
      doc.text("Price", 400, tableTop + 5, { width: 70, align: "right" });
      doc.text("Total", 480, tableTop + 5, { width: 60, align: "right" });

      // Table Rows
      let currentY = tableTop + 25;
      doc.fillColor("#000000").font("Helvetica");

      order.items.forEach((item) => {
        const productTotal = item.price * item.quantity;
        doc.text(item.product.name, 60, currentY, { width: 280 });
        doc.text(item.quantity.toString(), 350, currentY, { width: 50, align: "center" });
        doc.text(`₹${item.price.toLocaleString()}`, 400, currentY, { width: 70, align: "right" });
        doc.text(`₹${productTotal.toLocaleString()}`, 480, currentY, { width: 60, align: "right" });
        
        currentY += 20;
        doc.strokeColor("#eeeeee").moveTo(50, currentY - 5).lineTo(550, currentY - 5).stroke();
      });

      // Totals
      const subtotal = order.amount / 1.18;
      const tax = order.amount - subtotal;
      
      doc.moveDown(2);
      const summaryY = currentY + 30;
      doc.fontSize(10).fillColor("#777777").text("Subtotal:", 350, summaryY);
      doc.fillColor("#000000").text(`₹${subtotal.toFixed(2)}`, 480, summaryY, { align: "right" });
      
      doc.fillColor("#777777").text("GST (18%):", 350, summaryY + 15);
      doc.fillColor("#000000").text(`₹${tax.toFixed(2)}`, 480, summaryY + 15, { align: "right" });
      
      doc.fontSize(14).font("Helvetica-Bold").fillColor(blueColor).text("Grand Total:", 350, summaryY + 40);
      doc.text(`₹${order.amount.toLocaleString()}`, 480, summaryY + 40, { align: "right" });

      // Footer
      doc.fontSize(8).fillColor("#aaaaaa").text("This is a computer generated invoice. No signature required.", 50, 750, { align: "center" });

      doc.end();
    });

    // 4. Return as Response
    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/json", // Changed so we can send as fetch result or just let browser handle
        "Content-Disposition": `attachment; filename=Invoice-${order.id.slice(-8)}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
