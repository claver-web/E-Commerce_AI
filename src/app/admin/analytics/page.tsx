"use client";

import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  MousePointer2,
  Clock,
  Globe
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
  Area,
  PieChart,
  Cell,
  Pie
} from "recharts";
import { cn } from "@/lib/utils";

const revenueData = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Apr", total: 2400 },
  { name: "May", total: 3200 },
  { name: "Jun", total: 2800 },
];

const categoryData = [
  { name: "Electronics", value: 45, color: "#2563eb" },
  { name: "Fashion", value: 30, color: "#8b5cf6" },
  { name: "Home Decor", value: 15, color: "#f59e0b" },
  { name: "Other", value: 10, color: "#10b981" },
];

const userBehaviorData = [
  { time: "00:00", active: 120 },
  { time: "04:00", active: 40 },
  { time: "08:00", active: 320 },
  { time: "12:00", active: 580 },
  { time: "16:00", active: 840 },
  { time: "20:00", active: 620 },
  { time: "23:59", active: 240 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your store's sales, traffic, and behavior data.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Conversion Rate"
          value="3.24%"
          change="+0.8%"
          trend="up"
          icon={<MousePointer2 className="h-5 w-5 text-blue-600" />}
        />
        <MetricCard
          title="Avg. Order Value"
          value="₹2,450"
          change="+₹120"
          trend="up"
          icon={<ShoppingBag className="h-5 w-5 text-purple-600" />}
        />
        <MetricCard
          title="Bounce Rate"
          value="42.1%"
          change="-4.5%"
          trend="down"
          icon={<Clock className="h-5 w-5 text-orange-600" />}
        />
        <MetricCard
          title="Global Reach"
          value="12 Countries"
          change="+2"
          trend="up"
          icon={<Globe className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Growth */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Sales Growth</CardTitle>
            <CardDescription>Monthly revenue growth over the last 6 months.</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#2563eb" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue share across different product segments.</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-medium text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Traffic Analysis */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>User Traffic (24h)</CardTitle>
          <CardDescription>Active users on the platform throughout the day.</CardDescription>
        </CardHeader>
        <div className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userBehaviorData}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="active" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: React.ReactNode }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-none bg-white dark:bg-zinc-900 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className={cn(
          "text-xs flex items-center mt-1 font-bold",
          trend === 'up' ? "text-emerald-600" : "text-amber-600"
        )}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">{change}</span>
          <span className="ml-1 text-muted-foreground font-normal">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
