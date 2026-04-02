"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  ShoppingBag, 
  Settings, 
  MapPin, 
  CreditCard,
  Clock,
  ChevronRight,
  User as UserIcon,
  Star,
  Activity
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/user/orders");
        const data = await res.json();
        setOrders(data);
      } catch (e) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="text-center space-y-4">
              <div className="relative h-32 w-32 mx-auto rounded-full overflow-hidden border-4 border-blue-600 p-1 shadow-xl">
                <Image src={user.imageUrl} alt={user.fullName || ""} fill className="rounded-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-none px-4 py-1">
                Verified User
              </Badge>
            </div>

            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-blue-600 bg-blue-50 dark:bg-zinc-900 rounded-xl">
                <UserIcon className="mr-2 h-4 w-4" /> Profile Overview
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <MapPin className="mr-2 h-4 w-4" /> Saved Addresses
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <CreditCard className="mr-2 h-4 w-4" /> Payment Methods
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <Settings className="mr-2 h-4 w-4" /> Account Settings
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl h-14">
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900">
                  <ShoppingBag className="mr-2 h-4 w-4" /> My Orders
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900">
                  <Activity className="mr-2 h-4 w-4" /> My Activity
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900">
                  <Star className="mr-2 h-4 w-4" /> Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-6">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
                  ))
                ) : orders.length === 0 ? (
                  <Card className="border-none shadow-sm rounded-3xl p-12 text-center space-y-4">
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">No orders yet</h3>
                    <p className="text-muted-foreground">You haven't placed any orders. Start exploring our premium collection.</p>
                    <Link href="/products" className={buttonVariants({ variant: "default" })}>
                      Shop Now
                    </Link>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden rounded-3xl shadow-sm border-zinc-100 dark:border-zinc-800 group hover:shadow-md transition-shadow">
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center border">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right hidden md:block">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-lg font-bold">{formatPrice(order.amount)}</p>
                          </div>
                          <Badge className={cn(
                            "px-4 py-1 rounded-full border-none",
                            order.status === "COMPLETED" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                          )}>
                            {order.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-none">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="relative h-16 w-16 min-w-[64px] rounded-xl border overflow-hidden bg-white shadow-sm flex-shrink-0">
                              <Image src={JSON.parse(item.product.images)[0]} alt={item.product.name} fill className="object-cover p-1" />
                            </div>
                          ))}
                          {order.items.length > 5 && (
                            <div className="h-16 w-16 rounded-xl bg-zinc-100 flex items-center justify-center text-xs font-bold text-muted-foreground">
                              +{order.items.length - 5}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="activity">
                <Card className="rounded-3xl shadow-sm border-none">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Track your interactions across the store.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start space-x-4">
                          <div className="h-10 w-10 mt-1 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium">Viewed <span className="font-bold">iPhone 15 Pro Max</span> in Electronics</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                 <Card className="rounded-3xl shadow-sm border-none p-12 text-center">
                    <p className="text-muted-foreground">You haven't written any reviews yet.</p>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
