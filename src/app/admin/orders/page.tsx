"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Truck, 
  CheckCircle,
  RefreshCcw,
  Calendar,
  User as UserIcon,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Order status updated to ${status}`);
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const processRefund = async (id: string) => {
    if (!confirm("Are you sure you want to process a refund for this order?")) return;
    
    try {
      const res = await fetch(`/api/admin/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      if (res.ok) {
        toast.success("Refund processed successfully!");
        fetchOrders();
      } else {
        const err = await res.json();
        toast.error(err.error || "Refund failed");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage order status and customer fulfillments.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-background p-4 rounded-xl border">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders by ID or customer..." className="pl-10" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-16 animate-pulse" />
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{order.user.name || "Unknown User"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{formatPrice(order.amount)}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "px-3 py-1",
                      order.status === "COMPLETED" ? "bg-green-100 text-green-600 border-none" : 
                      order.status === "PENDING" ? "bg-yellow-100 text-yellow-600 border-none" :
                      order.status === "REFUNDED" ? "bg-blue-100 text-blue-600 border-none" :
                      "bg-red-100 text-red-600 border-none"
                    )}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => updateStatus(order.id, "COMPLETED")}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(order.id, "CANCELLED")}>
                          <XCircle className="mr-2 h-4 w-4 text-red-600" /> Cancel Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => processRefund(order.id)}>
                          <RefreshCcw className="mr-2 h-4 w-4 text-blue-600" /> Refund Order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
