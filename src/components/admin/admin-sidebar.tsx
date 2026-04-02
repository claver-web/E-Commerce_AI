"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Activity,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "User Activity", href: "/admin/activity", icon: Activity },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r bg-zinc-50 dark:bg-zinc-950 min-h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
          <Activity className="h-6 w-6" />
          <span>Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-grow px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all border border-transparent",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <Link 
          href="/admin/settings" 
          className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start text-zinc-600 dark:text-zinc-400")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
        <Link 
          href="/" 
          className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start text-zinc-600 dark:text-zinc-400")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
