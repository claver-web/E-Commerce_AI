"use client";

import Link from "next/link";
import { 
  Laptop, 
  Shirt, 
  Home, 
  Car, 
  Smartphone, 
  Wrench, 
  Gift, 
  LayoutGrid,
  ArrowRight,
  ShoppingBag,
  Layers,
  Sparkles,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categoryIconMap: Record<string, any> = {
  electronics: Laptop,
  fashion: Shirt,
  "home decor": Home,
  automotive: Car,
  tech: Smartphone,
  tools: Wrench,
  accessories: Gift,
  bags_1400: ShoppingBag,
  bottoms_1408: Layers,
  summer_guide_11725: Sparkles,
  tops_1411: Zap,
  default: LayoutGrid
};

interface CategoryCardProps {
  name: string;
  count: number;
  className?: string;
}

export default function CategoryCard({ name, count, className }: CategoryCardProps) {
  const Icon = categoryIconMap[name.toLowerCase()] || categoryIconMap.default;
  
  return (
    <Link href={`/products?category=${name}`}>
      <Card className={cn(
        "relative overflow-hidden group border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-zinc-900 transition-all hover:-translate-y-2 hover:shadow-2xl duration-500",
        className
      )}>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        
        <CardContent className="p-10 relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="h-20 w-24 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <Icon className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black capitalize tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
              {name.replace(/_/g, ' ').replace(/-/g, ' ')}
            </h3>
            <p className="text-zinc-500 font-medium text-sm">{count} Items</p>
          </div>

          <div className="flex items-center space-x-2 text-blue-600 font-bold group-hover:translate-x-2 transition-transform text-sm">
            <span>Explore</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
