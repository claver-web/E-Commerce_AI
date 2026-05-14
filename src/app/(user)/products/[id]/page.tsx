"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Star, 
  ShoppingCart, 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  Replace,
  MessageSquare,
  Package,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { toast } from "react-hot-toast";
import { ReviewSection } from "@/components/products/review-section";
import { CommentSection } from "@/components/products/comment-section";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        
        if (data.error || !data) {
          throw new Error(data.error || "Product not found");
        }
        
        setProduct(data);
        
        if (data.images) {
          const parsedImages = JSON.parse(data.images);
          setMainImage(parsedImages[0] || "");
        }
      } catch (e) {
        console.error("Failed to fetch product:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-zinc-500 font-medium">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Product Not Found</h1>
            <Button onClick={() => router.push("/products")}>Return to Shop</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images ? JSON.parse(product.images) : [];
  const parsedSpecs = product.specifications ? JSON.parse(product.specifications) : [];
  const specs = Array.isArray(parsedSpecs) 
    ? parsedSpecs 
    : Object.entries(parsedSpecs).map(([key, value]) => ({ key: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), value: String(value) }));

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success("Added to cart!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 items-center space-x-1">
          <ChevronLeft className="h-4 w-4" /> <span>Back to Shop</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                className="object-contain p-8 transition-all hover:scale-110"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    mainImage === img ? "border-blue-600 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx}`} fill sizes="(max-width: 768px) 25vw, 15vw" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                  ))}
                  <span className="text-sm font-medium ml-2">4.8 (120 reviews)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-green-600 font-semibold flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Verified Brand
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                {product.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 bg-white dark:bg-zinc-900 font-semibold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex-grow">
                  <Button 
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                </div>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                  <Heart className="h-5 w-5 text-zinc-400" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center text-center space-y-2">
                  <Truck className="h-6 w-6 text-zinc-600" />
                  <p className="text-[10px] font-medium uppercase tracking-wider">Fast Delivery</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center text-center space-y-2">
                  <Replace className="h-6 w-6 text-zinc-600" />
                  <p className="text-[10px] font-medium uppercase tracking-wider">7 Days Return</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center text-center space-y-2">
                  <Package className="h-6 w-6 text-zinc-600" />
                  <p className="text-[10px] font-medium uppercase tracking-wider">Original Item</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Specifications & Reviews Tabs */}
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:w-1/2 mb-8">
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">User Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="space-y-4">
                <div className="rounded-2xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {specs.map((spec: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800"}>
                          <td className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 w-1/3">{spec.key}</td>
                          <td className="px-6 py-4">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="space-y-6 pt-12">
                <ReviewSection productId={params.id as string} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Separator className="my-24" />

        <div className="max-w-4xl mx-auto pb-24">
          <CommentSection productId={params.id as string} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
