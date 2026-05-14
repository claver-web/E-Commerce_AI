"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  User as UserIcon,
  ShoppingBag,
  Eye,
  MessageSquare,
  Star,
  Download,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  Package,
  ExternalLink,
  History,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { cn, formatPrice } from "@/lib/utils";

export default function AdminActivityPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchUserSummary();
  }, []);

  const fetchUserSummary = async () => {
    try {
      const res = await fetch("/api/admin/users/activity");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      toast.error("Failed to fetch user summary");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrace = async (userId: string) => {
    setLogsLoading(true);
    try {
      let url = `/api/admin/users/trace?userId=${userId}`;
      if (dateRange.start) url += `&startDate=${dateRange.start}`;
      if (dateRange.end) url += `&endDate=${dateRange.end}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setUserLogs(data);
    } catch (e) {
      toast.error("Failed to fetch user logs");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleTraceClick = (user: any) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
    fetchUserTrace(user.id);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "purchase": return <ShoppingBag className="h-4 w-4 text-green-600" />;
      case "view": return <Eye className="h-4 w-4 text-blue-600" />;
      case "comment": return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case "review": return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-zinc-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-50">User Intelligence</h1>
          <p className="text-zinc-500 font-medium">Monitor unique users, their behavior, and overall platform engagement.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800 h-12 px-6 font-bold">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white rounded-[2rem] p-8 shadow-xl shadow-blue-500/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2">Total Active Users</p>
              <h2 className="text-5xl font-black">{users.length}</h2>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <UserIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/20 dark:shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Platform Orders</p>
              <h2 className="text-5xl font-black text-zinc-900 dark:text-zinc-50">{users.reduce((acc, u) => acc + u.orderCount, 0)}</h2>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border">
              <Package className="h-6 w-6 text-zinc-600" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] p-8 shadow-xl shadow-black/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Total Revenue</p>
              <h2 className="text-5xl font-black leading-tight">
                {formatPrice(users.reduce((acc, u) => acc + u.totalSpend, 0)).split('.')[0]}
              </h2>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/10 dark:bg-black/5 flex items-center justify-center backdrop-blur-md">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xl shadow-zinc-200/30 dark:shadow-none">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-950/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
              <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
              <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-center">Orders</TableHead>
              <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Latest Activity</TableHead>
              <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-right px-8">Analysis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-zinc-50 dark:border-zinc-800/50">
                  <TableCell colSpan={5} className="py-8 px-8"><div className="h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all border-zinc-50 dark:border-zinc-800/50">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 border group-hover:scale-110 transition-transform">
                        {user.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-50">{user.name || "Anonymous"}</p>
                        <p className="text-xs text-zinc-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className={cn("h-2 w-2 rounded-full", user.isRecentlyActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-zinc-300")} />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {user.isRecentlyActive ? "Online" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black">
                      {user.orderCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        {getActionIcon(user.latestAction)}
                      </div>
                      <div>
                        <p className="text-xs font-bold capitalize text-zinc-700 dark:text-zinc-300">{user.latestAction.replace('_', ' ')}</p>
                        <p className="text-[10px] text-zinc-400">{new Date(user.lastActive).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Button 
                      onClick={() => handleTraceClick(user)}
                      className="rounded-xl h-10 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 hover:scale-105 transition-transform font-bold px-4"
                    >
                      Trace Info <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Trace Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl border-l-0 dark:bg-zinc-950 p-0 flex flex-col h-full overflow-hidden">
          <div className="p-8 border-b bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between mb-8">
               <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-blue-500/30">
                  {selectedUser?.name?.substring(0, 2).toUpperCase()}
               </div>
               <div className="flex flex-col items-end">
                  <Badge className={cn("rounded-full px-3 py-1 font-bold mb-2", selectedUser?.isRecentlyActive ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-500")}>
                    {selectedUser?.isRecentlyActive ? "Currently Active" : "Last seen recently"}
                  </Badge>
                  <p className="text-xs text-zinc-400 font-mono">{selectedUser?.id}</p>
               </div>
            </div>
            <h2 className="text-3xl font-black tracking-tight">{selectedUser?.name}</h2>
            <p className="text-zinc-500 font-medium mb-8">{selectedUser?.email}</p>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Orders</p>
                  <p className="text-2xl font-black">{selectedUser?.orderCount}</p>
               </div>
               <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Value</p>
                  <p className="text-2xl font-black text-blue-600">{formatPrice(selectedUser?.totalSpend || 0)}</p>
               </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col p-8 bg-zinc-50/30 dark:bg-zinc-900/10 min-h-0">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center text-zinc-900 dark:text-zinc-50">
                  <History className="mr-2 h-4 w-4 text-blue-600" /> Activity Timeline
                </h3>
                <div className="flex items-center space-x-2">
                   <Input 
                     type="date" 
                     className="h-9 rounded-lg text-xs" 
                     onChange={(e) => {
                       setDateRange(prev => ({ ...prev, start: e.target.value }));
                       fetchUserTrace(selectedUser.id);
                     }}
                   />
                </div>
             </div>

             <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {logsLoading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-24 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse border" />)
                ) : userLogs.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                     <Clock className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                     <p className="text-sm font-bold text-zinc-400">No logs found for this period</p>
                  </div>
                ) : (
                  userLogs.map((log, idx) => (
                    <div key={log.id} className="relative pl-8 pb-8 group last:pb-0">
                      {/* Timeline Line */}
                      {idx !== userLogs.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-zinc-100 dark:bg-zinc-800" />
                      )}
                      
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-blue-600 flex items-center justify-center z-10">
                        {getActionIcon(log.action)}
                      </div>

                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-zinc-100 dark:border-zinc-800">
                             {log.action.replace('_', ' ')}
                          </Badge>
                          <p className="text-[10px] text-zinc-400 font-medium">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                          {(() => {
                            if (!log.details) return "Performed an action on the platform";
                            try {
                              const parsed = JSON.parse(log.details);
                              return parsed.info || log.details;
                            } catch (e) {
                              return log.details;
                            }
                          })()}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-2 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" /> {new Date(log.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
