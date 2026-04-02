"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Trash2, 
  Loader2, 
  Save,
  Plus
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string(),
  category: z.string().min(1, "Category is required"),
  stock: z.string(),
  images: z.array(z.string().url("Must be a valid URL")).min(1, "At least one image is required"),
  specifications: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
  })),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images" as any,
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications" as any,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        const data = await res.json();
        
        if (res.ok) {
          reset({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            category: data.category,
            stock: data.stock.toString(),
            images: JSON.parse(data.images),
            specifications: JSON.parse(data.specifications),
          });
        } else {
          toast.error("Failed to fetch product");
          router.push("/admin/products");
        }
      } catch (e) {
        toast.error("An error occurred");
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [params.id, reset, router]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update product");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center space-x-4">
        <Link href="/admin/products" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
           <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    {...register("description")} 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Specifications</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: "", value: "" })}>
                    <Plus className="h-4 w-4 mr-1" /> Add Spec
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {specFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input {...register(`specifications.${index}.key` as const)} placeholder="Key" className="flex-1" />
                    <Input {...register(`specifications.${index}.value` as const)} placeholder="Value" className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" {...register("price")} />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" {...register("stock")} />
                  {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" {...register("category")} />
                  {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Images</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendImage("")}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input {...register(`images.${index}` as const)} className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
