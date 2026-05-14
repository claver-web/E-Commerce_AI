"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { ShoppingCart, Moon, Sun, Monitor, Menu, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useCartStore } from "@/store/use-cart-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";

const NavLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { userId } = useAuth();
  const { items, fetchCartFromDb } = useCartStore();
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    if (userId && items.length === 0) {
      fetchCartFromDb();
    }
  }, [userId]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);


  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Commerce
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {NavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {link.name}
            </Link>
          ))}

          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
                "transition-colors hover:text-foreground/80 outline-none",
                pathname === "/categories" ? "text-foreground" : "text-foreground/60"
            )}>
              Categories
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl">
              <DropdownMenuItem className="p-0">
                <Link href="/categories" className="w-full px-2 py-1.5 font-bold text-blue-600 block">
                  All Categories
                </Link>
              </DropdownMenuItem>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.name} className="p-0">
                  <Link href={`/products?category=${cat.name}`} className="w-full px-2 py-1.5 block capitalize">
                    {cat.name.replace(/_/g, ' ').replace(/-/g, ' ')}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {userId && (
            <Link
              href="/orders"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/orders" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Orders
            </Link>
          )}
        </nav>

        {/* Desktop Controls */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <Link href="/cart" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 p-0 text-[10px] text-white">
                {cartItemCount}
              </Badge>
            )}
          </Link>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth */}
          <div className="ml-4 flex items-center space-x-2">
            {userId ? (
              <UserButton />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <SignInButton mode="modal">
                  <div className={cn(buttonVariants({ variant: "ghost" }), "cursor-pointer")}>Log In</div>
                </SignInButton>
                <SignUpButton mode="modal">
                  <div className={cn(buttonVariants({ variant: "default" }), "cursor-pointer")}>Sign Up</div>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
                <Menu className="h-5 w-5" />
            </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>AI-Commerce</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col space-y-4">
                  {NavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-lg font-medium",
                        pathname === link.href ? "text-foreground" : "text-foreground/60"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pt-4">Categories</p>
                    <Link 
                      href="/categories" 
                      className={cn("block text-lg font-medium", pathname === "/categories" ? "text-foreground" : "text-foreground/60")}
                    >
                      All Categories
                    </Link>
                    {categories.slice(0, 5).map((cat) => (
                      <Link
                        key={cat.name}
                        href={`/products?category=${cat.name}`}
                        className="block text-lg font-medium text-foreground/60 capitalize"
                      >
                        {cat.name.replace(/_/g, ' ').replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                  {userId && (
                    <Link
                      href="/orders"
                      className={cn(
                        "text-lg font-medium",
                        pathname === "/orders" ? "text-foreground" : "text-foreground/60"
                      )}
                    >
                      Orders
                    </Link>
                  )}
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    {!userId && (
                      <>
                        <SignInButton mode="modal">
                          <div className={cn(buttonVariants({ variant: "outline" }), "w-full cursor-pointer")}>
                            Log In
                          </div>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <div className={cn(buttonVariants({ variant: "default" }), "w-full cursor-pointer")}>Sign Up</div>
                        </SignUpButton>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
