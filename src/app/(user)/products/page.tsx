"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  ArrowUpDown,
  SearchX,
  Star
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

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 12;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const fetchProducts = async (currentOffset: number, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const category = searchParams.get("category") || "";
      const url = `/api/products?limit=${LIMIT}&offset=${currentOffset}${category ? `&category=${category}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (isInitial) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchProducts(0, true);
  }, [searchParams]);

  useEffect(() => {
    if (offset === 0) return;
    fetchProducts(offset);
  }, [offset]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setOffset(prev => prev + LIMIT);
        }
      },
      { threshold: 1.0 }
    );

    const target = document.getElementById("scroll-trigger");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  const dynamicCategories = useMemo(() => {

    const caps = new Set<string>();
    products.forEach(p => {
      const mainCat = p.category.split('|')[0];
      if (mainCat) caps.add(mainCat);
    });
    return ["All", ...Array.from(caps).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const category = searchParams.get("category");
    if (category) {
      result = result.filter(p => p.category.toLowerCase().startsWith(category.toLowerCase()));
    }

    if (minRating) {
      result = result.filter(p => (p.avgRating || 0) >= minRating);
    }

    if (priceMax) {
      result = result.filter(p => p.price <= priceMax);
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [products, searchQuery, searchParams, sortBy, minRating, priceMax]);

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
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {dynamicCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            if (cat === "All") router.push("/products");
                            else router.push(`/products?category=${cat}`);
                          }}
                          className={cn(
                            "block text-xs w-full text-left py-2 px-3 rounded-xl transition-all truncate",
                            (searchParams.get("category") === cat) || (cat === "All" && !searchParams.get("category"))
                            ? "bg-blue-50 text-blue-600 font-bold dark:bg-blue-900/20" : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Customer Ratings</h4>
                    <div className="space-y-2">
                       {[4, 3, 2, 1].map((rating) => (
                         <button
                           key={rating}
                           onClick={() => setMinRating(minRating === rating ? null : rating)}
                           className={cn(
                             "flex items-center text-xs w-full py-1 px-2 rounded-lg transition-all",
                             minRating === rating ? "bg-zinc-100 dark:bg-zinc-800 font-bold" : "text-muted-foreground hover:bg-zinc-50"
                           )}
                         >
                           <div className="flex text-yellow-500 mr-2">
                             {Array.from({ length: 5 }).map((_, i) => (
                               <Star key={i} className={cn("h-3 w-3", i < rating ? "fill-current" : "text-zinc-300")} />
                             ))}
                           </div>
                           <span>& Up</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Price Range</h4>
                    <div className="space-y-2">
                       {[
                         { label: "All Prices", value: null },
                         { label: "Under ₹1,000", value: 1000 },
                         { label: "Under ₹5,000", value: 5000 },
                         { label: "Under ₹20,000", value: 20000 },
                         { label: "Under ₹50,000", value: 50000 },
                       ].map((range) => (
                         <button
                           key={range.label}
                           onClick={() => setPriceMax(range.value)}
                           className={cn(
                             "block text-xs w-full text-left py-1.5 px-3 rounded-xl transition-all",
                             priceMax === range.value ? "bg-zinc-100 dark:bg-zinc-800 font-bold" : "text-muted-foreground hover:bg-zinc-50"
                           )}
                         >
                           {range.label}
                         </button>
                       ))}
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
                <>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  <div id="scroll-trigger" className="col-span-full h-20 flex items-center justify-center">
                    {loadingMore && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-zinc-500 font-medium">Loading more products...</p>
                      </div>
                    )}
                    {!hasMore && products.length > 0 && (
                      <p className="text-sm text-zinc-400 font-medium">You've reached the end of the collection.</p>
                    )}
                  </div>
                </>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
