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
  ArrowLeft,
  Truck,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Track Orders", href: "/admin/track-orders", icon: Truck },
  { name: "Cart Users", href: "/admin/carts", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "User Activity", href: "/admin/activity", icon: Activity },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];



export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex flex-col border-r bg-zinc-50 dark:bg-zinc-950 min-h-screen sticky top-0",
      onClose ? "w-full border-none" : "w-64 hidden md:flex"
    )}>

      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
          <Activity className="h-6 w-6" />
          <span>Admin Panel</span>
        </Link>
      </div>

      <nav className={cn(
        "flex-grow px-4 space-y-2",
        onClose && "flex flex-col justify-center items-center space-y-4"
      )}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all border border-transparent w-full",
                onClose && "justify-center text-lg py-4 max-w-xs",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className={cn("h-4 w-4", onClose && "h-6 w-6")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>


      <div className={cn(
        "p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2",
        onClose && "flex flex-col items-center justify-center p-8 space-y-4"
      )}>
        <Link 
          href="/admin/settings" 
          onClick={onClose}
          className={cn(
            buttonVariants({ variant: "ghost" }), 
            "w-full justify-start text-zinc-600 dark:text-zinc-400",
            onClose && "justify-center text-lg h-14 max-w-xs"
          )}
        >
          <Settings className={cn("mr-2 h-4 w-4", onClose && "h-6 w-6")} />
          Settings
        </Link>
        <Link 
          href="/" 
          onClick={onClose}
          className={cn(
            buttonVariants({ variant: "ghost" }), 
            "w-full justify-start text-zinc-600 dark:text-zinc-400",
            onClose && "justify-center text-lg h-14 max-w-xs"
          )}
        >
          <ArrowLeft className={cn("mr-2 h-4 w-4", onClose && "h-6 w-6")} />
          Back to Shop
        </Link>
      </div>

    </div>
  );
}
