"use client";

import Link from "next/link";
import { ReactNode, MouseEvent } from "react";
import { useInstantNavigation } from "@/hooks/useInstantNavigation";

interface InstantLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
  prefetch?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * InstantLink - Navigate IMMEDIATELY like GitHub
 * No waiting for data, no blocking UI, bypasses RSC delays
 */
export function InstantLink({
  href,
  children,
  className,
  replace = false,
  prefetch = true,
  onClick,
  ...props
}: InstantLinkProps) {
  const { navigateInstant } = useInstantNavigation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Skip if default is prevented or it's a modified click
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    // Prevent default link behavior
    e.preventDefault();

    // Use instant navigation instead
    navigateInstant(href, { replace });
  };

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
