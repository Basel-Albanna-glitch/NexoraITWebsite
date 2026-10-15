"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// The referrer only means something for the page the visitor landed on, not later in-site navigations.
let landed = false;

/** Sends one anonymous page view per navigation to /api/track (see lib/stats-store.ts). */
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    const body = JSON.stringify({ path: pathname, ref: landed ? "" : document.referrer });
    landed = true;
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [pathname]);
  return null;
}
