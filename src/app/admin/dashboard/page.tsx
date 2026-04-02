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
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";

const data = [
  { name: "Mon", revenue: 4000, orders: 24 },
  { name: "Tue", revenue: 3000, orders: 18 },
  { name: "Wed", revenue: 2000, orders: 12 },
  { name: "Thu", revenue: 2780, orders: 32 },
  { name: "Fri", revenue: 1890, orders: 15 },
  { name: "Sat", revenue: 2390, orders: 22 },
  { name: "Sun", revenue: 3490, orders: 28 },
];

export default function AdminDashboard() {
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
          value="₹1,28,450"
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
        />
        <SummaryCard
          title="Total Orders"
          value="456"
          change="+8.2%"
          trend="up"
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          title="New Users"
          value="120"
          change="-2.1%"
          trend="down"
          icon={<Users className="h-5 w-5 text-purple-600" />}
        />
        <SummaryCard
          title="Inventory Items"
          value="1,230"
          change="+0.5%"
          trend="up"
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
              <AreaChart data={data}>
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
              <BarChart data={data}>
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live feed of user interactions across the store.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New order placed by Rahul S.</p>
                    <p className="text-xs text-muted-foreground">iPhone 15 Pro Max • ₹1,24,000</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">2 mins ago</p>
                  <Button variant="ghost" size="sm" className="h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
