"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Trash2, 
  Star, 
  User as UserIcon,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function AdminModerationPage() {
  const [data, setData] = useState<{ reviews: any[], comments: any[] }>({ reviews: [], comments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      setData(data);
    } catch (e) {
      toast.error("Failed to fetch moderation data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "review" | "comment") => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/reviews`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      if (res.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted!`);
        fetchData();
      } else {
        toast.error("Deletion failed");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Moderation</h1>
          <p className="text-muted-foreground">Approve or remove user contributions to maintain quality.</p>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl h-14">
          <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Star className="mr-2 h-4 w-4" /> Reviews ({data.reviews.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageSquare className="mr-2 h-4 w-4" /> Comments ({data.comments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            ))
          ) : data.reviews.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-2xl border-2 border-dashed">No reviews to moderate.</div>
          ) : (
            data.reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden rounded-2xl hover:shadow-md border border-zinc-100 dark:border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:space-x-8 gap-6">
                    <div className="md:w-1/4 space-y-4 border-r pr-6">
                       <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 flex items-center justify-center font-bold text-blue-600 rounded-full">{(review.user?.name || review.amazonUserName || 'U')[0]}</div>
                          <div>
                            <p className="text-sm font-bold">{review.user?.name || review.amazonUserName || "Amazon Customer"}</p>
                            <p className="text-xs text-muted-foreground">{review.user?.email || "Imported Data"}</p>
                          </div>
                       </div>
                       <div className="space-y-2 pt-4">
                          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Rating</p>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-200 text-zinc-200"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{new Date(review.createdAt).toDateString()}</p>
                       </div>
                    </div>
                    <div className="md:flex-grow space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2 text-blue-600">
                            <ShoppingBag className="h-4 w-4" />
                            <Link href={`/products/${review.productId}`} className="text-sm font-bold hover:underline">{review.product.name}</Link>
                         </div>
                         <div className="flex space-x-2">
                           <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-blue-600">
                              <ThumbsUp className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500" onClick={() => handleDelete(review.id, "review")}>
                              <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                       <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                          "{review.content || "Awesome product! Recommending to everyone."}"
                       </p>
                       <div className="flex space-x-4 pt-4 border-t">
                          <Button variant="outline" size="sm" className="rounded-xl">Report Issue</Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">Reply to User</Button>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-zinc-100 animate-pulse rounded-2xl" />
            ))
          ) : data.comments.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-2xl border-2 border-dashed">No comments to moderate.</div>
          ) : (
            data.comments.map((comment) => (
              <Card key={comment.id} className="rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center border shrink-0">
                    <UserIcon className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold">{comment.user?.name || "Anonymous User"}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          On <Link href={`/products/${comment.productId}`} className="font-bold ml-1 hover:underline">{comment.product.name}</Link>
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(comment.id, "comment")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl text-zinc-700 dark:text-zinc-300">
                      {comment.content}
                    </p>
                    <div className="flex justify-end space-x-2 pt-2">
                       <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-blue-600">
                          <MessageCircle className="mr-1 h-3 w-3" /> Reply as Admin
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
