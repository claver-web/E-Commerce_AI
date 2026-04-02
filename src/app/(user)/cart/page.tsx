"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag,
  ShieldCheck,
  Truck
} from "lucide-react";
import { ShoppingCart, Minus as MinusIcon, Plus as PlusIcon, Trash2 as TrashIcon, ArrowRight as ArrowRightIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/use-cart-store";
import { formatPrice, cn } from "@/lib/utils";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const subtotal = totalPrice();
  const shipping = subtotal > 10000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-10 flex items-center">
          <ShoppingCart className="mr-4 h-8 w-8 text-blue-600" /> Your Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl space-y-6">
            <div className="h-24 w-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Time to start shopping!</p>
                <Link href="/products" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-8 bg-blue-600 hover:bg-blue-700")}>
                  Browse Products
                </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-md">
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 mb-4 sm:mb-0">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                  </div>
                  <div className="sm:ml-6 flex-grow space-y-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Original Premium Item</p>
                    <p className="text-blue-600 font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                    <div className="flex items-center border rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-4 font-semibold w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl h-10 w-10">
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Subtotal ({totalItems()} items)</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Estimated Tax (18%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-xl font-bold py-2">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>
                <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full mt-8 h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-500/20")}>
                  Proceed to Checkout <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-600" /> Secure SSL Encryption Payment
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Truck className="h-4 w-4 mr-2 text-blue-600" /> Free Shipping on orders over ₹10k
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
