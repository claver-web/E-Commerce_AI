"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AdminSidebar from "./admin-sidebar";

export default function AdminHeader() {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        <Sheet>
          <SheetTrigger className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground size-8 md:hidden">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">

            <SheetHeader className="sr-only">
              <SheetTitle>Admin Menu</SheetTitle>
            </SheetHeader>
            <AdminSidebar onClose={() => {}} />
          </SheetContent>
        </Sheet>

        <h2 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider truncate">
          Admin Console
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <UserButton />
      </div>
    </header>
  );
}
