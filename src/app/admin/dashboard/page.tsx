"use client";

import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitySearch, setActivitySearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchActivities = async (search = "") => {
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/activity${search ? `?search=${search}` : ""}`);
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setSearching(false);
    }
  };

  const fetchBuyers = async () => {
    try {
      const res = await fetch("/api/admin/buyers");
      const data = await res.json();
      setBuyers(data);
    } catch (error) {
      console.error("Error fetching buyers:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchActivities(), fetchBuyers()]);
      setLoading(false);
    };
    init();
  }, []);


  // Debounced search for activities
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      fetchActivities(activitySearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [activitySearch]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Refresh data
        await Promise.all([fetchStats(), fetchActivities(), fetchBuyers()]);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

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

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-zinc-500 font-medium">Calculating store metrics...</p>
        </div>
      </div>
    );
  }

  // Fallback to fake data if API fails or is empty for demo purposes
  const displayStats = stats || {
    revenue: { value: 0, change: "0", trend: "up" },
    orders: { value: 0, change: "0", trend: "up" },
    users: { value: 0, change: "0", trend: "up" },
    inventory: { value: 0, change: "0", trend: "up" },
    chartData: []
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor your store's performance at a glance.</p>
        </div>
        <div className="flex space-x-2">
          {/* Dashboard filters or actions */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Revenue"
          value={`₹${displayStats.revenue.value.toLocaleString()}`}
          change={`${displayStats.revenue.change}%`}
          trend={displayStats.revenue.trend}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
        />
        <SummaryCard
          title="Total Orders"
          value={displayStats.orders.value.toString()}
          change={`${displayStats.orders.change}%`}
          trend={displayStats.orders.trend}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          title="New Users"
          value={displayStats.users.value.toString()}
          change={`${displayStats.users.change}%`}
          trend={displayStats.users.trend}
          icon={<Users className="h-5 w-5 text-purple-600" />}
        />
        <SummaryCard
          title="Inventory Items"
          value={displayStats.inventory.value.toString()}
          change={displayStats.inventory.change + "%"}
          trend={displayStats.inventory.trend}
          icon={<Package className="h-5 w-5 text-orange-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 col-span-1">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Daily revenue performance for the current week.</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayStats.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 col-span-1">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Order Frequency</CardTitle>
            <CardDescription>Number of successful orders per day.</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Buyers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Buyers</CardTitle>
            <CardDescription>Latest customers who have made purchases on your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Customer</th>
                    <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Total Orders</th>
                    <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Latest Order</th>
                    <th className="pb-4 font-black uppercase tracking-widest text-[10px]">Lifetime Value</th>
                    <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {buyers.length > 0 ? (
                    buyers.map((buyer) => (
                      <tr key={buyer.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-blue-600">
                              {buyer.name?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold">{buyer.name || 'Anonymous'}</p>
                              <p className="text-[10px] text-zinc-500">{buyer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-medium">{buyer._count.orders} orders</td>
                        <td className="py-4">
                          <p className="font-bold">₹{buyer.latestOrder?.amount.toLocaleString() || '0'}</p>
                          <p className="text-[10px] text-zinc-500">
                            {buyer.latestOrder ? new Date(buyer.latestOrder.createdAt).toLocaleDateString() : 'Never'}
                          </p>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-xs font-bold">
                            ₹{buyer.totalSpend.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex flex-col items-end space-y-1">
                            <select
                              disabled={!buyer.latestOrder || updatingStatus === buyer.latestOrder.id}
                              value={buyer.latestOrder?.status || "PENDING"}
                              onChange={(e) => updateOrderStatus(buyer.latestOrder.id, e.target.value)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 border-none cursor-pointer appearance-none text-white transition-all",
                                statusColors[buyer.latestOrder?.status || "PENDING"],
                                updatingStatus === buyer.latestOrder?.id && "opacity-50 animate-pulse"
                              )}
                            >
                              {orderStatuses.map(status => (
                                <option key={status} value={status} className="bg-white text-zinc-900">
                                  {status.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                            {updatingStatus === buyer.latestOrder?.id && (
                              <span className="text-[9px] font-bold text-zinc-400 animate-pulse">Updating...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-zinc-500">
                        No buyers recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live feed of user interactions across the store.</CardDescription>
          </div>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by user or order..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="w-full h-9 rounded-full px-4 text-xs bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
            />
            {searching && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const isPurchase = activity.action === "purchase";
                const order = activity.order;
                
                return (
                  <div key={activity.id} className="group border-b border-zinc-100 dark:border-zinc-800 last:border-none pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center mt-1",
                          isPurchase ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                        )}>
                          {isPurchase ? <ShoppingBag className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold">
                            {isPurchase ? "New Order Placed" : activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                            <span className="font-medium text-zinc-500 ml-2">by {activity.user?.name || activity.user?.email || 'Anonymous'}</span>
                          </p>
                          
                          {isPurchase && order ? (
                            <div className="space-y-3 mt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <div>
                                  <p className="text-zinc-400 uppercase font-black tracking-widest text-[9px] mb-1">Shipping Address</p>
                                  <p className="font-medium text-zinc-600 dark:text-zinc-300">
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
                                <div>
                                  <p className="text-zinc-400 uppercase font-black tracking-widest text-[9px] mb-1">Payment & Amount</p>
                                  <p className="font-medium text-zinc-600 dark:text-zinc-300">
                                    <span className="text-blue-600 font-bold">₹{order.amount.toLocaleString()}</span>
                                    <span className="mx-2 text-zinc-300">•</span>
                                    {order.razorpayPaymentId ? "Razorpay" : "Pending"}
                                  </p>
                                </div>
                                <div className="col-span-full">
                                  <p className="text-zinc-400 uppercase font-black tracking-widest text-[9px] mb-1">Products</p>
                                  <div className="flex flex-wrap gap-2">
                                    {order.items.map((item: any, idx: number) => (
                                      <Badge key={idx} variant="outline" className="bg-white dark:bg-zinc-800 text-[10px]">
                                        {item.product.name} (x{item.quantity})
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-500">{activity.details || 'Interacted with the store'}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-zinc-400">
                          {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          <span className="ml-2">{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed">
                <p className="font-medium">No activity found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: React.ReactNode }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn(
          "text-xs flex items-center mt-1 font-medium",
          trend === 'up' ? "text-green-600" : "text-red-600"
        )}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}
