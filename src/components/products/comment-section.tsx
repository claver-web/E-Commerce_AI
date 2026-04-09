"use client";

import { useEffect, useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { User, MessageCircle, Reply, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    clerkId: string;
  };
  replies?: Comment[];
}

export function CommentSection({ productId }: { productId: string }) {
  const { isLoaded, userId } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (e: unknown) {
      console.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const handlePostComment = async (parentId: string | null = null) => {
    const content = parentId ? replyMessage : message;
    if (!content.trim()) return toast.error("Comment cannot be empty");

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      if (res.ok) {
        toast.success(parentId ? "Reply posted!" : "Comment posted!");
        setMessage("");
        setReplyMessage("");
        setReplyTo(null);
        fetchComments();
      } else {
        toast.error("Failed to post comment");
      }
    } catch (e: unknown) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h2 className="text-3xl font-black tracking-tightest flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <span>Product Discussion</span>
        </h2>
        <p className="text-zinc-500">Ask a question or share your thoughts with the community.</p>
      </header>

      {/* Main Form */}
      <div className="space-y-4">
        {!userId ? (
          <SignInButton mode="modal">
            <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2">
              Sign in to join the discussion
            </Button>
          </SignInButton>
        ) : (
          <div className="space-y-4">
            <Textarea 
              placeholder="What's on your mind? Type here..." 
              className="rounded-[2.5rem] p-8 min-h-[120px] shadow-sm bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-blue-600"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                onClick={() => handlePostComment(null)}
                disabled={isSubmitting}
                className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
              >
                Post Comment
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-10">
        {comments.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border-dashed border-2">
            <MessageCircle className="h-16 w-16 text-zinc-200 mx-auto mb-6" />
            <p className="text-zinc-400 font-medium">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {comments.map((comment) => (
              <div key={comment.id} className="group">
                {/* Parent Comment */}
                <div className="flex space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-2">
                    <User className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg">{comment.user.name || "User"}</span>
                      <span className="text-xs text-zinc-400 font-mono tracking-tighter">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium bg-white dark:bg-zinc-900 p-6 rounded-[2rem] rounded-tl-none shadow-sm inline-block">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 ml-2 pt-2">
                      <button 
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center space-x-1"
                      >
                        <Reply className="h-3 w-3" />
                        <span>{replyTo === comment.id ? "Cancel" : "Reply"}</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyTo === comment.id && (
                      <div className="mt-4 ml-10 space-y-3">
                        <Textarea 
                          placeholder={`Replying to ${comment.user.name}...`}
                          className="rounded-2xl h-24"
                          autoFocus
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            disabled={isSubmitting}
                            onClick={() => handlePostComment(comment.id)}
                            className="bg-zinc-900 dark:bg-zinc-800 rounded-full h-10 px-6"
                          >
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-6 ml-10 space-y-6 border-l-2 border-zinc-100 dark:border-zinc-800 pl-8">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-4">
                            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center p-2">
                              <CornerDownRight className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="space-y-1 flex-grow">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-sm">{reply.user.name || "User"}</span>
                                <span className="text-[10px] text-zinc-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-[1.5rem] rounded-tl-none">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
