"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CategoryCard from "@/components/shared/category-card";

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
            {categories.map((category) => (
              <CategoryCard 
                key={category.name} 
                name={category.name} 
                count={category.count} 
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
