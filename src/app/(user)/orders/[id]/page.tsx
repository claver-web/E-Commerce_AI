"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Download, 
  HelpCircle,
  Clock,
  ArrowRight,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, cn } from "@/lib/utils";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { toast } from "react-hot-toast";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { ShoppingBag } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/user/orders/${id}`);
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        console.error("Failed to fetch order:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, isLoaded, userId]);

  if (!isLoaded || (userId && loading)) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading order details...</p>
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
              <p className="text-zinc-500 dark:text-zinc-400">Please log in to your account to view this order's tracking details.</p>
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

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Order not found</h2>
          <Button variant="ghost" onClick={() => router.push("/orders")} className="mt-4">
            Back to My Orders
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const shippingAddr = JSON.parse(order.shippingAddress || "{}");
  const subtotal = order.amount / 1.18; // Reverse calculation for tax mock
  const tax = order.amount - subtotal;

  const steps = [
    { label: "Ordered", date: new Date(order.createdAt).toLocaleDateString(), completed: true, icon: <Package className="h-4 w-4" /> },
    { label: "Paid", date: (order.status === "COMPLETED" || order.status === "CANCELLED") ? new Date(order.updatedAt).toLocaleDateString() : "Pending", completed: true, icon: <CreditCard className="h-4 w-4" /> },
  ];

  if (order.status === "CANCELLED") {
    steps.push({ 
      label: "Cancelled", 
      date: new Date(order.updatedAt).toLocaleDateString(), 
      completed: true, 
      icon: <XCircle className="h-4 w-4" /> 
    });
  } else {
    steps.push(
      { label: "Shipped", date: order.status === "COMPLETED" ? "In Transit" : "-", completed: false, icon: <Truck className="h-4 w-4" /> },
      { label: "Delivered", date: "-", completed: false, icon: <CheckCircle2 className="h-4 w-4" /> }
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <Button variant="ghost" onClick={() => router.back()} className="items-center space-x-1">
            <ChevronLeft className="h-4 w-4" /> <span>Back to Orders</span>
          </Button>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-black">Order #{order.id.slice(-8).toUpperCase()}</h1>
                <Badge className={cn(
                  "rounded-lg h-6 px-2",
                  order.status === "CANCELLED" ? "bg-red-500 hover:bg-red-600" : ""
                )}>{order.status}</Badge>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              {/* Cancellation Window */}
              {order.status !== "CANCELLED" && (
                <div className="flex flex-col">
                  {(() => {
                    const twelveHours = 12 * 60 * 60 * 1000;
                    const elapsed = Date.now() - new Date(order.createdAt).getTime();
                    const remaining = twelveHours - elapsed;
                    
                    if (remaining > 0) {
                      const hours = Math.floor(remaining / (60 * 60 * 1000));
                      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                      return (
                        <div className="flex flex-col items-center sm:items-end">
                          <p className="text-xs text-zinc-500 mb-1">Eligible for cancellation for {hours}h {minutes}m</p>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={async () => {
                              if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                                try {
                                  const res = await fetch(`/api/user/orders/${order.id}/cancel`, { method: "POST" });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setOrder({ ...order, status: data.status });
                                    toast.success("Order cancelled successfully");
                                  } else {
                                    const data = await res.json();
                                    toast.error(data.error || "Failed to cancel order");
                                  }
                                } catch (e) {
                                  toast.error("An error occurred. Please try again.");
                                }
                              }
                            }}
                            className="h-10 rounded-xl px-6 bg-red-600 hover:bg-red-700"
                          >
                            Cancel Order
                          </Button>
                        </div>
                      );
                    }
                    return <p className="text-xs text-zinc-400">Wait: Eligibility expired</p>;
                  })()}
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button variant="outline" className="flex-grow lg:flex-none h-12 rounded-xl">
                  <HelpCircle className="mr-2 h-4 w-4" /> Support
                </Button>
                <Button className="flex-grow lg:flex-none h-12 rounded-xl bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2 h-4 w-4" /> Download Invoice
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white dark:bg-zinc-900">
            <CardContent className="p-12">
              <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800 -z-0" />
                {steps.map((step, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      step.completed 
                        ? (step.label === "Cancelled" ? "bg-red-500 text-white shadow-lg shadow-red-500/50" : "bg-blue-600 text-white shadow-lg shadow-blue-500/50")
                        : "bg-white dark:bg-zinc-800 border-2"
                    )}>
                      {step.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{step.label}</p>
                      <p className="text-xs text-zinc-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <CardTitle className="text-lg">Items Purchased</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {order.items.map((item: any, idx: number) => {
                      const product = item.product;
                      const images = product?.images ? JSON.parse(product.images) : [];
                      return (
                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 relative rounded-2xl bg-white dark:bg-zinc-900 border overflow-hidden">
                              <Image src={images[0] || "/placeholder.jpg"} alt={product?.name || "Product"} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain p-2" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-lg">{product?.name}</p>
                              <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-xs text-zinc-500">{formatPrice(item.price)} each</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" /> Shipping Destination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-bold text-xl">{shippingAddr.fullName}</p>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
                    {shippingAddr.address},<br />
                    {shippingAddr.city} - {shippingAddr.pincode}<br />
                    Phone: {shippingAddr.phone}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Invoice/Payment Summary */}
            <div className="space-y-6">
              <Card className="rounded-[2rem] border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                <CardHeader className="bg-blue-600 text-white p-8">
                  <CardTitle className="text-xl">Payment Invoice</CardTitle>
                  <CardDescription className="text-blue-100">Transaction Summary</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Shipping (Standard)</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">GST (18%)</span>
                      <span className="font-medium font-mono">+{formatPrice(tax)}</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-2xl font-black text-blue-600">
                      <span>Total</span>
                      <span>{formatPrice(order.amount)}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-dashed">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 text-center">Payment Info</p>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-zinc-500" />
                        <div>
                          <p className="text-xs font-bold uppercase">Razorpay</p>
                          <p className="text-[10px] text-zinc-500">{order.razorpayPaymentId || "Auth Pending"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-900/10">PAID</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-tight">
                  Estimation: Delivered by {new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
