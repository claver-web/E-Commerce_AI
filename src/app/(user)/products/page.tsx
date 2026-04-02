"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  ArrowUpDown,
  SearchX
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ProductCard from "@/components/products/product-card";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        console.error("Failed to fetch products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const category = searchParams.get("category");
    if (category) {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [products, searchQuery, searchParams, sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Discover Products</h1>
              <p className="text-muted-foreground mt-1">Found {filteredProducts.length} premium items.</p>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 h-10 w-full rounded-xl border-none bg-white dark:bg-zinc-900 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-10 w-10 rounded-xl cursor-pointer")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl">
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest Arrivals</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-low")}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-high")}>Price: High to Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="hidden md:flex border rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="icon" 
                  onClick={() => setViewMode("grid")}
                  className="rounded-none h-10 w-10 border-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "secondary" : "ghost"} 
                  size="icon" 
                  onClick={() => setViewMode("list")}
                  className="rounded-none h-10 w-10 border-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="hidden md:block col-span-1 space-y-8">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                </h3>
                <Separator className="mb-6" />
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Categories</h4>
                    <div className="space-y-2">
                      {["All", "Electronics", "Fashion", "Home Decor", "Beauty"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            if (cat === "All") router.push("/products");
                            else router.push(`/products?category=${cat.toLowerCase()}`);
                          }}
                          className={cn(
                            "block text-sm w-full text-left py-2 px-3 rounded-xl transition-all",
                            (searchParams.get("category") === cat.toLowerCase()) || (cat === "All" && !searchParams.get("category"))
                            ? "bg-blue-50 text-blue-600 font-bold dark:bg-blue-900/20" : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Price Range</h4>
                    <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full relative">
                      <div className="absolute left-0 right-0 h-full bg-blue-600 rounded-full" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>₹0</span>
                      <span>₹5,00,000+</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid/List */}
            <div className={cn(
              viewMode === "grid" ? "md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "md:col-span-3 space-y-4"
            )}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-3xl" />
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-dashed">
                  <div className="h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <SearchX className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold">No products found</h3>
                  <p className="text-muted-foreground max-w-xs">We couldn't find any products matching your current search or filters.</p>
                  <Button onClick={() => { setSearchQuery(""); router.push("/products"); }} className="rounded-full">Clear All Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
