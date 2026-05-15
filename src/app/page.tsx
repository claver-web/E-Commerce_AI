"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Truck, Sparkles, Star, Quote, CheckCircle2, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ProductCard from "@/components/products/product-card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import CategoryCard from "@/components/shared/category-card";

import ProductRow from "@/components/shared/product-row";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products/featured"),
          fetch("/api/categories")
        ]);
        const [prodData, catData] = await Promise.all([
          prodRes.json(),
          catRes.json()
        ]);
        setFeaturedProducts(prodData);
        console.log("🔥 HOME FETCHED PRODUCTS:", prodData);
        setCategories(catData);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[600px] h-[85vh] flex items-center overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ duration: 2 }}
              className="relative h-full w-full"
            >
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070"
                alt="Hero Background"
                fill
                priority
                className="object-cover"
              />
            </motion.div>
          </div>

          <div className="container mx-auto px-4 relative z-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl space-y-6 md:space-y-10"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-500/30 text-blue-400 text-xs md:text-sm font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                <span>New Arrival: Urbanic Collection 2026</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                ELEVATE YOUR <br />
                <span className="text-blue-600">LIFESTYLE.</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 max-w-lg leading-relaxed">
                Discover the intersection of high-fashion and AI-driven curation. Experience shopping redefined.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "bg-blue-600 hover:bg-blue-700 h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-bold rounded-full transition-all hover:scale-105")}>
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/categories" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-bold rounded-full bg-white/5 text-white border-white/20 hover:bg-white/10 transition-all backdrop-blur-md")}>
                  Categories
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats / Trust Banner */}
        <section className="py-10 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-between items-center gap-8">
              {[
                { icon: <Users className="h-6 w-6" />, val: "10K+", label: "Happy Customers" },
                { icon: <Trophy className="h-6 w-6" />, val: "500+", label: "Premium Brands" },
                { icon: <Star className="h-6 w-6" />, val: "4.9/5", label: "Average Rating" },
                { icon: <CheckCircle2 className="h-6 w-6" />, val: "100%", label: "Secure Checkout" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-3 bg-blue-600/10 text-blue-600 rounded-xl md:rounded-2xl shrink-0">{stat.icon}</div>
                  <div>
                    <p className="text-xl md:text-2xl font-black leading-none">{stat.val}</p>
                    <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Featured Products */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tight">Weekly Featured</h2>
                <div className="h-1.5 w-24 bg-blue-600 mt-4 rounded-full" />
              </div>
              <Link href="/products" className={cn(buttonVariants({ variant: "link" }), "text-blue-600 group h-auto font-bold")}>
                 View Gallery <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500">Wait for the latest arrivals...</p>
              </div>
            )}
          </div>
        </section>

        {/* Category Rows */}
        <div className="bg-zinc-50/50 dark:bg-zinc-950">
          <ProductRow title="Premium Handbags" category="bags_1400" />
          <ProductRow title="Summer Essentials" category="summer_guide_11725" />
          <ProductRow title="Modern Tops" category="tops_1411" />
        </div>
        {/* Category Collections */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16 uppercase tracking-tight">Explore Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.slice(0, 4).map((category) => (
                <CategoryCard 
                  key={category.name} 
                  name={category.name} 
                  count={category.count} 
                />
              ))}
            </div>
            {categories.length > 4 && (
              <div className="text-center mt-12">
                <Link href="/categories" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-10 font-bold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
                  Discover All Departments
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-600 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-600 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-black uppercase tracking-tight">Trusted by Shoppers</h2>
              <p className="text-zinc-500 mt-4">Join thousands of satisfied customers who have redefined their shopping experience with us.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Ananya Sharma", role: "Fashion Blogger", text: "The Urbanic collection is absolutely stunning. The quality is even better in person!", rating: 5 },
                { name: "Vikram Mehta", role: "Tech Enthusiast", text: "Incredible user experience. The AI recommendations actually get my style right every time.", rating: 5 },
                { name: "Sneha Kapur", role: "Loyal Customer", text: "Fast delivery and premium packaging. This has become my go-to store for all my needs.", rating: 5 },
              ].map((test, i) => (
                <div key={i} className="p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none relative border border-zinc-100 dark:border-zinc-800 transition-all hover:-translate-y-2">
                  <Quote className="absolute top-6 right-8 h-12 w-12 text-blue-600/10" />
                  <div className="flex space-x-1 mb-6">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg font-medium italic mb-8 leading-relaxed">"{test.text}"</p>
                  <div>
                    <h4 className="font-bold text-lg">{test.name}</h4>
                    <p className="text-sm text-zinc-500">{test.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-zinc-900 dark:bg-blue-600 rounded-[3rem] md:rounded-[4rem] p-8 sm:p-12 md:p-32 text-center text-white relative overflow-hidden shadow-3xl shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-5xl md:text-8xl font-black leading-none uppercase tracking-tighter">Stay Ahead</h2>
                  <p className="text-zinc-400 dark:text-blue-100 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                    Join our inner circle for early access to drops, exclusive AI-curated style guides, and secret sales.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="flex-grow h-14 md:h-16 rounded-full px-8 bg-white/5 dark:bg-white/10 border border-white/10 dark:border-white/20 backdrop-blur-xl outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-zinc-500 dark:placeholder:text-blue-200"
                  />
                  <Button className="h-14 md:h-16 px-10 rounded-full bg-white text-zinc-900 dark:text-blue-600 font-black text-lg hover:scale-105 transition-transform shadow-2xl">
                    Join Now
                  </Button>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-blue-200 uppercase font-bold tracking-widest">
                  No spam. Just pure inspiration. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="flex items-center space-x-4 p-6 bg-background rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800"
    >
      {icon}
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}
