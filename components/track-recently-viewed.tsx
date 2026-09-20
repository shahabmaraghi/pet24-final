"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

export function TrackRecentlyViewed({ productId }: { productId: string }) {
  const { status } = useSession();

  React.useEffect(() => {
    if (status !== "authenticated" || !productId) return;
    fetch("/api/recently-viewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => {});
  }, [status, productId]);

  return null;
}
