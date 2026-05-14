"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  User as UserIcon, 
  Clock, 
  ArrowRight,
  Sparkles,
  Percent,
  ChevronRight,
  Package,
  Mail,
  RefreshCw
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import Image from "next/image";
import { seedTestCarts } from "./actions";
import { toast } from "react-hot-toast";


export default function AdminCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCarts = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/carts");
      const data = await res.json();
      setCarts(data);
    } catch (error) {
      console.error("Error fetching carts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchCarts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Analyzing Active Carts...</p>
      </div>
    );
  }

  const handleSeed = async () => {
    const res = await seedTestCarts();
    if (res.success) {
      toast.success("Sample carts generated!");
      fetchCarts();
    } else {
      toast.error(res.error || "Failed to generate data");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Cart Users</h1>
          <p className="text-zinc-500 font-medium">Monitor active shopping carts and offer targeted discounts to increase conversion.</p>
        </div>
        <div className="flex items-center space-x-3">
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={handleSeed}
             className="h-10 rounded-xl text-zinc-500 hover:text-blue-600 font-bold"
           >
             <Sparkles className="h-4 w-4 mr-2" />
             Generate Test Data
           </Button>
           <Button 
             variant="outline" 
             size="sm" 
             onClick={fetchCarts} 
             disabled={refreshing}
             className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800"
           >
             <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
             {refreshing ? "Refreshing..." : "Refresh Data"}
           </Button>
           <Badge className="bg-blue-600 text-white border-none h-10 px-4 rounded-xl flex items-center space-x-2">
             <ShoppingBag className="h-4 w-4" />
             <span>{carts.length} Active Carts</span>
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {carts.length > 0 ? (
          carts.map((cart) => (
            <Card key={cart.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none hover:border-blue-600/30 transition-all group">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* User & Summary Info */}
                  <div className="p-8 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 text-lg">
                        {cart.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-none">{cart.user?.name || 'Anonymous'}</h3>
                        <p className="text-sm text-zinc-500 mt-1">{cart.user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Cart Total</p>
                        <p className="text-xl font-black text-blue-600">{formatPrice(cart.totalValue)}</p>
                      </div>
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Items</p>
                        <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{cart.items.length}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last updated {new Date(cart.updatedAt).toLocaleString()}</span>
                    </div>

                    <div className="pt-4 flex flex-col space-y-3">
                      <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                        <Percent className="mr-2 h-4 w-4" /> Apply Custom Discount
                      </Button>
                      <Button variant="outline" className="w-full h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold">
                        <Mail className="mr-2 h-4 w-4" /> Send Reminder Email
                      </Button>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="p-8 lg:flex-grow bg-zinc-50/30 dark:bg-zinc-900/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest flex items-center">
                        <Sparkles className="mr-2 h-4 w-4 text-blue-600" /> Items in Cart
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cart.items.map((item: any, idx: number) => {
                        const product = item.product;
                        const images = product.images ? JSON.parse(product.images) : [];
                        return (
                          <div key={idx} className="flex items-center space-x-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-16 w-16 relative rounded-xl bg-zinc-50 dark:bg-zinc-800 border overflow-hidden flex-shrink-0">
                               <Image 
                                 src={images[0] || "/placeholder.jpg"} 
                                 alt={product.name} 
                                 fill 
                                 className="object-contain p-2"
                               />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-sm font-bold truncate">{product.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                <p className="text-sm font-black text-blue-600">{formatPrice(product.price)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-600 border-none px-3 py-1 rounded-full text-[10px] font-bold">
                          HIGH INTENT
                        </Badge>
                        <p className="text-xs text-zinc-500">This user has {cart.items.length} items ready for checkout.</p>
                      </div>
                      <Button variant="ghost" className="text-xs font-bold text-blue-600">
                        View User History <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <ShoppingBag className="h-16 w-16 text-zinc-200 mx-auto mb-6" />
            <p className="text-xl font-bold text-zinc-400">No active carts found.</p>
            <p className="text-zinc-500 text-sm mt-2">Check back later when users start adding products to their carts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
