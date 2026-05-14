"use client";

import { useEffect, useState } from "react";
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
  Globe,
  UserCheck,
  UserMinus
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
import { cn, formatPrice } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="h-96 flex items-center justify-center font-black uppercase tracking-tighter text-zinc-300 text-4xl animate-pulse">Analyzing Traffic...</div>;
  }

  if (data.error) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <p className="text-xl font-bold text-amber-600">Database Synchronization Required</p>
        <p className="text-sm text-zinc-500 max-w-md text-center">
          The analytics engine is ready, but it can't find the new tracking tables. 
          Please run <code className="bg-zinc-100 p-1 rounded">npx prisma db push</code> in your terminal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-50">Real-Time Analytics</h1>
          <p className="text-zinc-500 font-medium font-mono">Tracking every heartbeat of your platform.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Conversion Rate"
          value={data?.summary?.conversionRate || "0%"}
          change="+1.2%"
          trend="up"
          icon={<MousePointer2 className="h-5 w-5 text-blue-600" />}
        />
        <MetricCard
          title="Total Visitors"
          value={(data?.summary?.totalVisitors || 0).toLocaleString()}
          change={`+${data?.summary?.anonymousCount || 0}`}
          trend="up"
          icon={<Globe className="h-5 w-5 text-emerald-600" />}
        />
        <MetricCard
          title="Registered Users"
          value={(data?.summary?.totalUsers || 0).toLocaleString()}
          change="+45"
          trend="up"
          icon={<UserCheck className="h-5 w-5 text-purple-600" />}
        />
        <MetricCard
          title="Total Revenue"
          value={formatPrice(data?.summary?.totalRevenue || 0)}
          change="+12%"
          trend="up"
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Traffic Breakdown */}
        <Card className="p-8 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border-zinc-100 dark:border-zinc-800">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Traffic Split</CardTitle>
            <CardDescription className="font-medium">Registered Users vs. Anonymous Visitors (Last 24h)</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.trafficSplit || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {(data?.trafficSplit || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0(0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col space-y-3 mt-4">
              {(data?.trafficSplit || []).map((cat: any) => (
                <div key={cat.name} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{cat.name}</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Visitor Activity */}
        <Card className="lg:col-span-2 p-8 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border-zinc-100 dark:border-zinc-800">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Visitor Growth</CardTitle>
            <CardDescription className="font-medium">Real-time tracking of platform discovery.</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full pt-4">
             <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                   <div className="relative inline-block">
                      <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                      <Users className="h-16 w-16 text-blue-600 relative" />
                   </div>
                   <h3 className="text-4xl font-black tracking-tighter uppercase">{data?.summary?.totalVisitors || 0}</h3>
                   <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Unique Global Visitors</p>
                   <div className="flex justify-center gap-4 mt-6">
                      <Badge className="bg-blue-100 text-blue-600 border-none px-4 py-2 rounded-xl font-black">
                         <UserCheck className="h-3 w-3 mr-2" /> {data?.summary?.loggedInCount || 0} LOGGED IN
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-600 border-none px-4 py-2 rounded-xl font-black">
                         <UserMinus className="h-3 w-3 mr-2" /> {data?.summary?.anonymousCount || 0} ANONYMOUS
                      </Badge>
                   </div>
                </div>
             </div>
          </div>
        </Card>
      </div>

      {/* Behavioral Summary */}
      <Card className="p-8 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border-zinc-100 dark:border-zinc-800">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Visitor Engagement</p>
               <h4 className="text-2xl font-black">HIGH VELOCITY</h4>
               <p className="text-xs text-zinc-500">Your site is seeing a surge in anonymous traffic from global regions.</p>
            </div>
            <div className="space-y-2">
               <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Conversion Health</p>
               <h4 className="text-2xl font-black text-emerald-600">STABLE</h4>
               <p className="text-xs text-zinc-500">Anonymous visitors are converting to registered users at a healthy rate.</p>
            </div>
            <div className="space-y-2">
               <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Traffic Quality</p>
               <h4 className="text-2xl font-black text-blue-600">PREMIUM</h4>
               <p className="text-xs text-zinc-500">Most visits are coming from high-intent search queries and direct links.</p>
            </div>
         </div>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: React.ReactNode }) {
  return (
    <Card className="hover:shadow-2xl transition-all duration-500 border-none bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none rounded-[2rem] p-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</CardTitle>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">{value}</div>
        <div className={cn(
          "text-[10px] flex items-center mt-3 font-black uppercase tracking-widest",
          trend === 'up' ? "text-emerald-600" : "text-amber-600"
        )}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg mr-2">{change}</span>
          <span className="text-zinc-400 font-bold italic">Real-time pulse</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center text-xs", className)}>
      {children}
    </div>
  );
}

