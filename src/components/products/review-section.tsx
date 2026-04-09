"use client";

import { useEffect, useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { User, ShieldCheck, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export function ReviewSection({ productId }: { productId: string }) {
  const { isLoaded, userId } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (e: unknown) {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return toast.error("Please add a comment");

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, comment }),
      });

      if (res.ok) {
        toast.success("Review submitted!");
        setShowForm(false);
        setRating(5);
        setTitle("");
        setComment("");
        fetchReviews();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to submit review");
      }
    } catch (e: unknown) {
      toast.error("Internal server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: reviews.filter(r => r.rating === s).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === s).length / reviews.length) * 100 
      : 0
  }));

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left: Summary */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tightest">Customer Reviews</h2>
            <div className="flex items-center space-x-3">
              <StarRating rating={avgRating} size="lg" />
              <span className="text-xl font-bold">{avgRating.toFixed(1)} out of 5</span>
            </div>
            <p className="text-zinc-500">{reviews.length} global ratings</p>
          </div>

          <div className="space-y-3">
            {starCounts.map((s) => (
              <div key={s.stars} className="flex items-center space-x-4">
                <span className="text-sm font-medium w-12">{s.stars} star</span>
                <div className="flex-grow h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 transition-all duration-500" 
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-zinc-500 w-8">{Math.round(s.percentage)}%</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Separator className="mb-6" />
            <h3 className="text-xl font-bold mb-2">Review this product</h3>
            <p className="text-sm text-zinc-500 mb-6">Share your thoughts with other customers</p>
            {!userId ? (
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full h-12 rounded-xl">Sign in to write a review</Button>
              </SignInButton>
            ) : (
              <Button 
                onClick={() => setShowForm(!showForm)} 
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
              >
                {showForm ? "Cancel Review" : "Write a customer review"}
              </Button>
            )}
          </div>
        </div>

        {/* Right: List & Form */}
        <div className="md:col-span-2 space-y-8">
          {showForm && (
            <Card className="rounded-[2rem] border-blue-100 dark:border-blue-900 shadow-xl">
              <CardHeader>
                <CardTitle>Write your review</CardTitle>
                <CardDescription>Your feedback helps other customers make better choices</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Overall Rating</label>
                    <StarRating 
                      rating={rating} 
                      interactive 
                      onRatingChange={setRating} 
                      size="lg" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Add a Headline</label>
                    <Input 
                      placeholder="What's most important to know?" 
                      className="rounded-xl h-12"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Add a Written Review</label>
                    <Textarea 
                      placeholder="What did you like or dislike?" 
                      className="rounded-[1.5rem] min-h-[120px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-2xl"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <h3 className="text-2xl font-black">Top reviews from India</h3>
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border-dashed border-2">
                <MessageSquare className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="divide-y">
                {reviews.map((review) => (
                  <div key={review.id} className="py-8 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-bold">{review.user.name || "Anonymous Customer"}</p>
                        <p className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="font-bold">{review.title}</span>
                    </div>
                    {review.isVerified && (
                      <div className="flex items-center space-x-1 text-orange-600 text-xs font-bold">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified Purchase</span>
                      </div>
                    )}
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
