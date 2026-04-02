"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/store/use-cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string; // JSON string
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const images = JSON.parse(product.images);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success("Added to cart!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden rounded-3xl border-none bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={images[0] || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            
            {/* Action Buttons */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
               <button 
                 onClick={handleAddToCart}
                 className="p-3 bg-white text-black rounded-full shadow-xl hover:bg-blue-600 hover:text-white transition-colors"
               >
                 <ShoppingCart className="h-5 w-5" />
               </button>
               <div className={cn(buttonVariants({ variant: "default", size: "icon" }), "rounded-full bg-white text-black hover:bg-blue-600 hover:text-white")}>
                 <Eye className="h-5 w-5" />
               </div>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-blue-600 text-white border-none px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                {product.category}
              </Badge>
            </div>
            <button className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <CardContent className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg line-clamp-1 flex-grow pr-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" /> 4.5
              </div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-1">
               Premium quality item for modern living.
            </p>
          </CardContent>

          <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {formatPrice(product.price)}
            </span>
            <div className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50")}>
              Details
            </div>
          </CardFooter>
        </Link>
      </Card>
    </motion.div>
  );
}
