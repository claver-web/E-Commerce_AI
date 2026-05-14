"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const { userId } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Get or Generate Visitor ID
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = `vis_${crypto.randomUUID()}`;
      localStorage.setItem("visitor_id", visitorId);
    }

    // 2. Track the visit/pageview
    const trackActivity = async () => {
      try {
        await fetch("/api/track/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            action: "visit",
            details: { path: pathname }
          }),
        });
      } catch (e) {
        // Silently fail to not interrupt UX
      }
    };

    trackActivity();
  }, [pathname, userId]); // Re-track on path change or login

  return null;
}
