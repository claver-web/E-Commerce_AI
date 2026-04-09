import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/api/auth/webhook",
  "/api/products(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/cart",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Protect non-public routes
  if (!isPublicRoute(req) && !userId) {
    return (await auth()).redirectToSignIn();
  }

  // Protect admin routes
  if (isAdminRoute(req)) {
    const role = sessionClaims?.metadata?.role as string | undefined;
    
    // During local development, we'll bypass the strict role check for convenience
    // In production, it will strictly enforce the ADMIN role
    if (role !== "ADMIN" && process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
