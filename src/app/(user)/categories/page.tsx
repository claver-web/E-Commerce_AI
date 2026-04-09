"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Laptop, 
  Shirt, 
  Home, 
  Car, 
  Smartphone, 
  Wrench, 
  Gift, 
  ArrowRight,
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const categoryIconMap: Record<string, any> = {
  electronics: Laptop,
  fashion: Shirt,
  "home decor": Home,
  automotive: Car,
  tech: Smartphone,
  tools: Wrench,
  accessories: Gift,
  default: LayoutGrid
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading categories...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <header className="space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-sm font-bold mb-4 uppercase tracking-widest">
              <TrendingUp className="h-4 w-4" />
              <span>Explore Departments</span>
            </div>
            <h1 className="text-6xl font-black tracking-tightest">Browse by Category</h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Find exactly what you're looking for by browsing our curated collection of high-quality products across all industries.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const Icon = categoryIconMap[category.name.toLowerCase()] || categoryIconMap.default;
              return (
                <Link key={category.name} href={`/products?category=${category.name}`}>
                  <Card className="relative overflow-hidden group border-none shadow-2xl rounded-[3rem] bg-white dark:bg-zinc-900 transition-all hover:-translate-y-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                    
                    <CardContent className="p-12 relative z-10 flex flex-col items-center text-center space-y-6">
                      <div className="h-24 w-24 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Icon className="h-10 w-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black capitalize tracking-tightest leading-tight">{category.name}</h3>
                        <p className="text-zinc-500 font-medium">Over {category.count} items available</p>
                      </div>

                      <div className="flex items-center space-x-2 text-blue-600 font-bold group-hover:translate-x-2 transition-transform pt-4">
                        <span>View All Products</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
