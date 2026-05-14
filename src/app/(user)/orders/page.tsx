"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ShoppingBag,
  ArrowRight,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, cn } from "@/lib/utils";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import Image from "next/image";

import { useAuth, SignInButton } from "@clerk/nextjs";

function StatusDot({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={cn(
        "h-4 w-4 rounded-full border-4 border-white dark:border-zinc-950 transition-colors duration-500",
        active ? "bg-blue-600 scale-125" : "bg-zinc-200 dark:bg-zinc-800"
      )} />
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        active ? "text-blue-600" : "text-zinc-400"
      )}>{label}</span>
    </div>
  );
}

export default function OrdersPage() {
  const { isLoaded, userId } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/user/orders");
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API did not return an array:", data);
          setOrders([]);
        }
      } catch (e) {
        console.error("Failed to fetch orders:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isLoaded, userId]);

  if (!isLoaded || (userId && loading)) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading your orders...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full border-none shadow-2xl rounded-[3rem] p-12 text-center space-y-8 bg-white dark:bg-zinc-900">
            <div className="h-24 w-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="h-10 w-10 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tightest">Sign in Required</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Please log in to your account to view and track your orders.</p>
            </div>
            <SignInButton mode="modal">
              <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-500/20">
                Sign In Now
              </Button>
            </SignInButton>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-zinc-400" />;
      case "PAID":
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case "PACKED":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "DISPATCHED":
      case "OUT_FOR_DELIVERY":
        return <Truck className="h-4 w-4 text-orange-600" />;
      case "CANCELLED":
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-zinc-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "DELIVERED":
        return "default";
      case "PAID":
      case "PACKED":
      case "DISPATCHED":
      case "OUT_FOR_DELIVERY":
        return "secondary";
      case "CANCELLED":
      case "FAILED":
        return "destructive";
      case "PENDING":
        return "outline";
      default:
        return "secondary";
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading your orders...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Streamlined Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tightest uppercase text-zinc-900 dark:text-zinc-50">My Orders</h1>
            <p className="text-zinc-500 font-medium">Track your recent purchases and manage your delivery details.</p>
          </div>

          {orders.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent py-20">
              <CardContent className="flex flex-col items-center text-center space-y-6">
                <div className="h-24 w-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">No orders found</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Looks like you haven't made any purchases yet.</p>
                </div>
                <Link href="/products">
                  <Button size="lg" className="rounded-2xl h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
                    Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all duration-300 border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-zinc-500 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                          <Badge variant={getStatusBadgeVariant(order.status)} className="rounded-lg px-2 flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider">{order.status}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl">Ordered on {new Date(order.createdAt).toLocaleDateString()}</CardTitle>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-blue-600">{formatPrice(order.amount)}</p>
                        <p className="text-sm text-zinc-500">{order.items.length} Products</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Order Progress Tracker - Aligned Fixed */}
                      <div className="relative pt-2 pb-8">
                        <div className="absolute top-[8px] left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                        <div 
                          className="absolute top-[8px] left-0 h-1 bg-blue-600 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: (() => {
                              const s = order.status.toUpperCase();
                              if (s === "DELIVERED") return "100%";
                              if (s === "OUT_FOR_DELIVERY") return "75%";
                              if (s === "DISPATCHED") return "50%";
                              if (s === "PACKED") return "25%";
                              if (s === "PAID") return "10%";
                              return "0%";
                            })()
                          }}
                        />
                        <div className="relative flex justify-between z-10">
                          <StatusDot label="Paid" active={["PAID", "PACKED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status.toUpperCase())} />
                          <StatusDot label="Packed" active={["PACKED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status.toUpperCase())} />
                          <StatusDot label="Dispatched" active={["DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status.toUpperCase())} />
                          <StatusDot label="Delivery" active={["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status.toUpperCase())} />
                          <StatusDot label="Arrived" active={order.status.toUpperCase() === "DELIVERED"} />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 overflow-hidden">
                        {order.items.slice(0, 4).map((item: any, idx: number) => {
                          const product = item.product;
                          const images = product?.images ? JSON.parse(product.images) : [];
                          return (
                            <div key={idx} className="relative h-20 w-20 flex-shrink-0 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden group-hover:scale-105 transition-transform">
                              <Image 
                                src={images[0] || "/placeholder.jpg"} 
                                alt={product?.name || "Product"} 
                                fill 
                                className="object-contain p-2"
                              />
                            </div>
                          );
                        })}
                        {order.items.length > 4 && (
                          <div className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-dashed flex items-center justify-center font-bold text-zinc-500">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center py-4">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium italic">
                        {(() => {
                          switch (order.status.toUpperCase()) {
                            case "PAID": return "Payment successful. Awaiting packing.";
                            case "PACKED": return "Your order has been packed and is ready for dispatch.";
                            case "DISPATCHED": return "Order is on its way to the delivery hub.";
                            case "OUT_FOR_DELIVERY": return "Order is out for delivery. Keep your phone handy!";
                            case "DELIVERED": return "Package delivered successfully. Enjoy your purchase!";
                            case "CANCELLED": return "This order was cancelled.";
                            default: return "Order is being processed by our system.";
                          }
                        })()}
                      </p>
                      <Button variant="ghost" className="group-hover:translate-x-2 transition-transform">
                        Manage Order <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
