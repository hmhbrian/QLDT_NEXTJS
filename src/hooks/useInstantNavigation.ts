"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Simplified hook for instant navigation
 */
export function useInstantNavigation() {
  const router = useRouter();

  const navigateInstant = useCallback(
    (
      href: string,
      options: {
        replace?: boolean;
        scroll?: boolean;
      } = {}
    ) => {
      const { replace = false, scroll = true } = options;

      // Clean URL to remove RSC query params that cause delays
      const url = new URL(href, window.location.origin);
      url.searchParams.delete("_rsc"); // Remove RSC cache param
      url.searchParams.delete("_next"); // Remove Next.js internal params
      const cleanHref = url.pathname + url.search + url.hash;

      // Navigate immediately - don't wait for anything
      if (replace) {
        router.replace(cleanHref, { scroll });
      } else {
        router.push(cleanHref, { scroll });
      }
    },
    [router]
  );

  const prefetchRoute = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router]
  );

  return {
    navigateInstant,
    prefetchRoute,
    router,
  };
}
