"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const { setTheme, theme } = useTheme();
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
      <div className="container flex h-16 items-center justify-between mx-auto px-2 sm:px-4">
        {/* Logo */}
        <Link href="/" className="mr-2 sm:mr-6 flex items-center space-x-2 shrink-0">
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pehn-AI
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

        {/* Controls & Auth Area */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <Link href="/products" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden h-9 w-9")}>
            <Search className="h-[1.2rem] w-[1.2rem]" />
          </Link>

          <Link href="/cart" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative h-9 w-9")}>
            <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
            {cartItemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 p-0 text-[9px] text-white">
                {cartItemCount}
              </Badge>
            )}
          </Link>

          {/* Theme Toggle (Desktop Only in Header) */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:inline-flex h-9 w-9")}>
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

          {/* Auth (Desktop Only) */}
          <div className="hidden md:flex ml-4 items-center space-x-1.5">
            {userId ? (
              <UserButton />
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <div className={cn(buttonVariants({ variant: "ghost" }), "cursor-pointer")}>Log In</div>
                </SignInButton>
                <SignUpButton mode="modal">
                  <div className={cn(buttonVariants({ variant: "default" }), "cursor-pointer")}>Sign Up</div>
                </SignUpButton>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden h-9 w-9")}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col h-full justify-between">
              <div>
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pehn-AI</SheetTitle>
                </SheetHeader>

                {/* Mobile User Profile Section */}
                {userId && (
                  <div className="flex items-center justify-center space-x-3 mb-6 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <UserButton />
                    <div className="flex flex-col text-left">
                      <span className="text-base font-bold text-foreground">My Account</span>
                      <span className="text-xs text-muted-foreground">Manage profile & orders</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col space-y-5 text-center items-center">
                  {NavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-2xl font-bold transition-all hover:text-blue-600 w-full text-center hover:scale-105",
                        pathname === link.href ? "text-blue-600" : "text-foreground/60"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="flex flex-col space-y-4 w-full pt-6 border-t items-center text-center">
                    <p className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] w-full text-center">Collections</p>
                    <Link 
                      href="/categories" 
                      className={cn("text-xl font-bold w-full text-center hover:scale-105 transition-all", pathname === "/categories" ? "text-blue-600" : "text-foreground/60")}
                    >
                      All Categories
                    </Link>
                    {categories.slice(0, 5).map((cat) => (
                      <Link
                        key={cat.name}
                        href={`/products?category=${cat.name}`}
                        className="text-xl font-bold text-foreground/60 capitalize hover:text-blue-600 transition-colors w-full text-center hover:scale-105"
                      >
                        {cat.name.replace(/_/g, ' ').replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>

                  {userId && (
                    <Link
                      href="/orders"
                      className={cn(
                        "text-2xl font-bold pt-4 border-t w-full text-center hover:scale-105 transition-all",
                        pathname === "/orders" ? "text-blue-600" : "text-foreground/60"
                      )}
                    >
                      Orders
                    </Link>
                  )}
                </div>
              </div>


                <div className="flex flex-col space-y-6 pt-6 border-t w-full items-center">
                  {!userId && (
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[240px]">
                      <SignInButton mode="modal">
                        <div className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-xl h-10 font-bold cursor-pointer text-sm")}>
                          Log In
                        </div>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <div className={cn(buttonVariants({ variant: "default" }), "w-full rounded-xl h-10 font-bold cursor-pointer text-sm")}>
                          Sign Up
                        </div>
                      </SignUpButton>
                    </div>
                  )}

                  {/* Mobile Theme Toggle Section */}
                  <div className="w-full text-center flex flex-col items-center">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 w-full text-center">Appearance</p>
                    <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
                      <Button 
                        variant={theme === "light" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setTheme("light")} 
                        className="rounded-xl flex flex-col h-14 items-center justify-center p-1 text-[11px]"
                      >
                        <Sun className="h-4 w-4 mb-1" /> Light
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setTheme("dark")} 
                        className="rounded-xl flex flex-col h-14 items-center justify-center p-1 text-[11px]"
                      >
                        <Moon className="h-4 w-4 mb-1" /> Dark
                      </Button>
                      <Button 
                        variant={theme === "system" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setTheme("system")} 
                        className="rounded-xl flex flex-col h-14 items-center justify-center p-1 text-[11px]"
                      >
                        <Monitor className="h-4 w-4 mb-1" /> System
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  );
}

