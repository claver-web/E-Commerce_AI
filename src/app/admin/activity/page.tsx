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
  Calendar
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
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/admin/activity");
      const data = await res.json();
      setActivities(data);
    } catch (e) {
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">User Activity</h1>
          <p className="text-muted-foreground">Monitor real-time user interactions and behavior.</p>
        </div>
        <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activities or users..." className="pl-10 border-none bg-zinc-50 dark:bg-zinc-950 focus-visible:ring-1 focus-visible:ring-blue-600" />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 dark:border-zinc-800">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-950">
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-16 animate-pulse bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl m-2" />
                </TableRow>
              ))
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No activity logs found.
                </TableCell>
              </TableRow>
            ) : (
              activities.map((act) => (
                <TableRow key={act.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{act.user.name || "Anonymous"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{act.user.email.slice(0, 20)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(act.action)}
                      <span className="text-sm capitalize font-medium">{act.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                      {act.details ? JSON.parse(act.details).info : "No extra details available"}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Trace Info
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
