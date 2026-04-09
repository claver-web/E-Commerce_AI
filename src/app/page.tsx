"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ProductCard from "@/components/products/product-card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products/featured");
        const data = await res.json();
        setFeaturedProducts(data);
      } catch (e) {
        console.error("Failed to fetch featured products", e);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 1.5 }}
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
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="max-w-2xl space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                Shop the Future with <span className="text-blue-500">AI Intelligence</span>
              </h1>
              <p className="text-xl text-zinc-300 max-w-lg">
                Discover curated collections tailored just for you. Seamless, secure, and smart shopping experience.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg rounded-full")}>
                  Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-white/10 text-white border-zinc-700 hover:bg-white/20 transition-all backdrop-blur-md">
                  View Collections
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Row */}
        <section className="py-12 bg-zinc-100 dark:bg-zinc-900">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Truck className="h-10 w-10 text-blue-600" />}
              title="Fast Delivery"
              desc="Free shipping on orders over ₹10,000"
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-10 w-10 text-green-600" />}
              title="Secure Payment"
              desc="Protected by Razorpay encryption"
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-yellow-600" />}
              title="AI Support"
              desc="24/7 Smart chat assistance"
            />
            <FeatureCard 
              icon={<ShoppingBag className="h-10 w-10 text-purple-600" />}
              title="Quality First"
              desc="Certified premium materials"
            />
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-bold">Featured Products</h2>
                <p className="text-muted-foreground mt-2">The latest and greatest handpicked for you.</p>
              </div>
              <Link href="/products" className={cn(buttonVariants({ variant: "link" }), "text-blue-600 group h-auto")}>
                 View All Products <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
                <p className="text-muted-foreground">Check back soon for new arrivals!</p>
              </div>
            )}
          </div>
        </section>

        {/* Category Collections */}
        <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 underline decoration-blue-600 underline-offset-8 decoration-4">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1000", count: "120+" },
                { name: "Fashion", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1000", count: "350+" },
                { name: "Home Decor", img: "https://images.unsplash.com/photo-1616489953149-755174092b3a?auto=format&fit=crop&q=80&w=1000", count: "80+" },
              ].map((cat, idx) => (
                <Link key={idx} href={`/products?category=${cat.name.toLowerCase()}`} className="group relative h-96 overflow-hidden rounded-3xl">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
                  <div className="absolute bottom-10 left-10 text-white space-y-2">
                    <h3 className="text-3xl font-bold">{cat.name}</h3>
                    <p className="text-white/80">{cat.count} Products</p>
                  </div>
                </Link>
              ))}
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
