"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  fadeClassName?: string;
  showFade?: boolean;
}

export function ScrollableContainer({
  children,
  className,
  containerClassName,
  fadeClassName,
  showFade = true,
}: ScrollableContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  // Check scroll position and update state
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Calculate if there's content overflow and current scroll position
    const hasOverflow = container.scrollWidth > container.clientWidth;
    const isAtStart = container.scrollLeft <= 10; // Small buffer for rounding errors
    const isAtEnd =
      container.scrollLeft + container.clientWidth >=
      container.scrollWidth - 10;

    setCanScrollLeft(hasOverflow && !isAtStart);
    setCanScrollRight(hasOverflow && !isAtEnd);
  }, []);

  // Set up scroll event listeners and initial check
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check initial scroll position
    checkScrollPosition();

    // Debounced scroll handler
    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        checkScrollPosition();
      }, 50);
    };

    // Add event listeners
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkScrollPosition);

    // Set up ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();
    });

    resizeObserver.observe(container);

    // Clean up
    return () => {
      clearTimeout(scrollTimer);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollContainerRef}
        className={cn("flex overflow-x-auto scroll-smooth", containerClassName)}
      >
        {children}
      </div>

      {/* Left fade - only visible when scrolled right */}
      {showFade && canScrollLeft && (
        <div
          className={cn(
            "absolute top-0 left-[-4px] bottom-0 w-16 pointer-events-none bg-gradient-to-r from-background to-transparent",
            fadeClassName
          )}
        />
      )}

      {/* Right fade - only visible when more content to scroll */}
      {showFade && canScrollRight && (
        <div
          className={cn(
            "absolute top-0 right-[-4px] bottom-0 w-16 pointer-events-none bg-gradient-to-l from-background to-transparent",
            fadeClassName
          )}
        />
      )}
    </div>
  );
}
