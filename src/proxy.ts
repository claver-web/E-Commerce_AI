import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/api/auth/webhook",
  "/api/products(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/cart",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. Protect all non-public routes (Force sign-in)
  if (!userId && !isPublicRoute(req)) {
    return (await auth()).redirectToSignIn();
  }

  return NextResponse.next();
});



export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
