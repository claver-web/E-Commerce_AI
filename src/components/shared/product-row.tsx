"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductRowProps {
  title: string;
  category: string;
  limit?: number;
}

export default function ProductRow({ title, category, limit = 4 }: ProductRowProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?category=${category}&limit=${limit}`);
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        console.error(`Failed to fetch products for ${category}`, e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, limit]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase leading-none">{title}</h2>
            <div className="h-1.5 w-20 bg-blue-600 mt-4 rounded-full" />
          </div>
          <Link 
            href={`/products?category=${category}`} 
            className={cn(buttonVariants({ variant: "link" }), "text-blue-600 group h-auto font-bold")}
          >
            Explore All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
