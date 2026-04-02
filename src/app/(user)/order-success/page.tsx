"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  Download,
  CreditCard,
  MapPin,
  Calendar
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ReactConfetti from "react-confetti";
import { cn } from "@/lib/utils";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/user/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        console.error("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, router]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.1}
      />

      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight italic">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase. Your order <span className="font-mono text-blue-600 font-bold">#{orderId?.slice(-6).toUpperCase()}</span> has been placed successfully.
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <Link href="/profile" className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-blue-600 hover:bg-blue-700")}>
                View Order History
              </Link>
              <Link href="/products" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Snapshot */}
          <Card className="rounded-3xl shadow-xl border-none overflow-hidden">
            <CardHeader className="bg-zinc-900 text-white p-8">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Order Details</CardTitle>
                <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                  <Download className="mr-2 h-4 w-4" /> Download Receipt
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 bg-white dark:bg-zinc-900">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    <Calendar className="mr-2 h-4 w-4" /> Date
                  </div>
                  <p className="font-medium">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    <CreditCard className="mr-2 h-4 w-4" /> Payment Status
                  </div>
                  <p className="font-medium text-green-600">COMPLETED (Via Razorpay)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    <MapPin className="mr-2 h-4 w-4" /> Shipping To
                  </div>
                  <p className="font-medium">{JSON.parse(order?.shippingAddress || '{}').city}, India</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Purchased Items</h3>
                <div className="space-y-4">
                  {order?.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center font-bold text-xs">
                          {item.quantity}x
                        </div>
                        <p className="font-medium">{item.product.name}</p>
                      </div>
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-2xl font-bold pt-4">
                <span>Total Amount Paid</span>
                <span className="text-blue-600">{formatPrice(order?.amount || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
