"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Truck, 
  Package, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  CreditCard,
  ChevronRight,
  Filter
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
import { cn } from "@/lib/utils";

export default function TrackOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    PENDING: "bg-zinc-500",
    PAID: "bg-blue-500",
    PACKED: "bg-purple-500",
    DISPATCHED: "bg-orange-500",
    OUT_FOR_DELIVERY: "bg-yellow-600",
    DELIVERED: "bg-green-600",
    CANCELLED: "bg-red-600",
  };

  const orderStatuses = [
    "PENDING", "PAID", "PACKED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"
  ];

  const fetchOrders = async (query = "") => {
    try {
      const res = await fetch(`/api/admin/orders${query ? `?search=${query}` : ""}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchOrders(search);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Order Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Track Orders</h1>
          <p className="text-zinc-500 font-medium">Manage and monitor the fulfillment status of all customer orders.</p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by ID, User or Receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-blue-600/50 transition-all shadow-sm"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-zinc-200 dark:border-zinc-800">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none hover:border-blue-600/30 transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Order Basic Info */}
                  <div className="p-8 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID</p>
                        <h3 className="font-bold font-mono text-sm">#{order.id.substring(0, 12)}...</h3>
                      </div>
                      <Badge className={cn("text-[10px] font-black uppercase tracking-widest", statusColors[order.status])}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                          <UserIcon className="h-4 w-4 text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Customer</p>
                          <p className="font-bold text-sm">{order.user?.name || 'Anonymous'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                          <Clock className="h-4 w-4 text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Date</p>
                          <p className="font-bold text-sm">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                          <CreditCard className="h-4 w-4 text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Payment</p>
                          <p className="font-bold text-sm">₹{order.amount.toLocaleString()} via Razorpay</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Status Update */}
                  <div className="p-8 lg:flex-grow bg-zinc-50/50 dark:bg-zinc-900/20 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <h4 className="text-xs font-black uppercase tracking-widest">Delivery Address</h4>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
                          {(() => {
                            try {
                              const addr = JSON.parse(order.shippingAddress);
                              return `${addr.address}, ${addr.city}, ${addr.state} - ${addr.zipCode}`;
                            } catch (e) {
                              return order.shippingAddress;
                            }
                          })()}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <h4 className="text-xs font-black uppercase tracking-widest">Update Fulfillment</h4>
                        </div>
                        <div className="space-y-2">
                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={cn(
                              "w-full h-11 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all cursor-pointer",
                              updatingId === order.id && "opacity-50 animate-pulse"
                            )}
                          >
                            {orderStatuses.map(status => (
                              <option key={status} value={status}>
                                {status.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                          {updatingId === order.id && (
                            <p className="text-[10px] font-bold text-blue-600 animate-pulse text-center">Syncing with system...</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-xs font-black uppercase tracking-widest mb-4">Ordered Items</h4>
                      <div className="flex flex-wrap gap-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center space-x-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                               {/* Product image placeholder if needed */}
                               <Package className="h-5 w-5 text-zinc-400 m-auto mt-2.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{item.product.name}</p>
                              <p className="text-[10px] text-zinc-500">Qty: {item.quantity} • ₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Truck className="h-16 w-16 text-zinc-200 mx-auto mb-6" />
            <p className="text-xl font-bold text-zinc-400">No matching orders found.</p>
            <p className="text-zinc-500 text-sm mt-2">Try adjusting your search filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
