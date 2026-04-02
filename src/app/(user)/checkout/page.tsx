"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CreditCard, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Loader2,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/use-cart-store";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { toast } from "react-hot-toast";
import Script from "next/script";
import Image from "next/image";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address is too short"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().length(6, "Pincode must be 6 digits"),
  phone: z.string().length(10, "Phone number must be 10 digits"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && items.length === 0) {
      router.push("/cart");
    }
  }, [items, router, isMounted]);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  if (!isMounted) return null;

  const subtotal = totalPrice();
  const shipping = subtotal > 10000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const handlePayment = async (data: CheckoutFormValues) => {
    setLoading(true);
    try {
      // 1. Create order on server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          items,
          shippingAddress: data,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI-Commerce Platform",
        description: "Payment for your order",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify payment on server
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            toast.success("Payment successful!");
            clearCart();
            router.push(`/order-success?orderId=${orderData.dbOrderId}`);
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="flex-grow container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Cart
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 transition-all">
              <h2 className="text-2xl font-bold mb-8 flex items-center tracking-tight">
                <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                Shipping Details
              </h2>
              <form onSubmit={handleSubmit(handlePayment)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" {...register("email")} placeholder="john@example.com" />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <textarea 
                    id="address" 
                    {...register("address")} 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Sector, Street, Apartment..."
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} placeholder="Bangalore" />
                    {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" {...register("pincode")} placeholder="560001" />
                    {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register("phone")} placeholder="+91 000 000 000" />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-xl shadow-blue-500/20 border-0 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <><CreditCard className="mr-2 h-5 w-5" /> Secure Payment via Razorpay</>}
                </Button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
              <h2 className="text-2xl font-bold mb-8 tracking-tight">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <Image 
                          src={item.image || "/placeholder.jpg"} 
                          alt={item.name} 
                          fill 
                          className="object-contain p-1" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Tax (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-xl font-bold pt-2">
                  <span>Grand Total</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center space-x-3">
                <ShieldCheck className="h-8 w-8 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  Your information is secure. We use bank-level encryption (SSL) to protect your transaction.
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
