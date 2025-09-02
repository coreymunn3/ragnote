"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * ScrollableContainer - A reusable component that provides scrolling with fade effects
 *
 * HIGH-LEVEL OVERVIEW:
 * This component wraps content in a scrollable container and conditionally renders gradient fade overlays
 * to indicate when there's more content to scroll in different directions.
 *
 * HOW IT WORKS:
 * 1. SCROLL DETECTION: Uses scroll event listeners and ResizeObserver to detect:
 *    - Whether content overflows the container bounds
 *    - Current scroll position relative to start/end positions
 *    - Updates state variables (canScrollUp/Down/Left/Right) based on scroll state
 *
 * 2. DIRECTION SUPPORT: Supports both horizontal and vertical scrolling:
 *    - Horizontal: flex layout with overflow-x-auto (default, for backward compatibility)
 *    - Vertical: block layout with overflow-y-auto and h-full
 *
 * 3. FADE OVERLAYS: Conditionally renders gradient fade effects:
 *    - Top/Bottom fades: Use bg-gradient-to-b/t from-background to-transparent
 *    - Left/Right fades: Use bg-gradient-to-r/l from-background to-transparent
 *    - Positioned absolutely over the scrollable content with pointer-events-none
 *    - Only visible when there's actually content to scroll in that direction
 *
 * 4. PERFORMANCE: Uses debounced scroll handlers and ResizeObserver for efficient updates
 *
 * USAGE EXAMPLES:
 * - Horizontal scrolling widget lists with left/right fade indicators
 * - Vertical scrolling chat messages with top fade when scrolled down
 * - Any scrollable content that needs visual indication of overflow
 */

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  fadeClassName?: string;
  direction?: "horizontal" | "vertical";
  showTopFade?: boolean;
  showBottomFade?: boolean;
  showLeftFade?: boolean;
  showRightFade?: boolean;
}

export function ScrollableContainer({
  children,
  className,
  containerClassName,
  fadeClassName,
  direction = "horizontal",
  showTopFade = false,
  showBottomFade = false,
  showLeftFade = true,
  showRightFade = true,
}: ScrollableContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Check scroll position and update state
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Horizontal scroll detection
    if (direction === "horizontal") {
      const hasHorizontalOverflow =
        container.scrollWidth > container.clientWidth;
      const isAtStart = container.scrollLeft <= 10; // Small buffer for rounding errors
      const isAtEnd =
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - 10;

      setCanScrollLeft(hasHorizontalOverflow && !isAtStart);
      setCanScrollRight(hasHorizontalOverflow && !isAtEnd);
    }

    // Vertical scroll detection
    if (direction === "vertical") {
      const hasVerticalOverflow =
        container.scrollHeight > container.clientHeight;
      const isAtTop = container.scrollTop <= 10; // Small buffer for rounding errors
      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10;

      setCanScrollUp(hasVerticalOverflow && !isAtTop);
      setCanScrollDown(hasVerticalOverflow && !isAtBottom);
    }
  }, [direction]);

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

  const getContainerClasses = () => {
    const baseClasses = "scroll-smooth";
    if (direction === "horizontal") {
      return cn("flex overflow-x-auto", baseClasses, containerClassName);
    } else if (direction === "vertical") {
      return cn("overflow-y-auto h-full", baseClasses, containerClassName);
    }
    return cn("flex overflow-x-auto", baseClasses, containerClassName);
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={scrollContainerRef} className={getContainerClasses()}>
        {children}
      </div>

      {/* Top fade - only visible when scrolled down and there's content above */}
      {showTopFade && canScrollUp && (
        <div
          className={cn(
            "absolute top-[-4px] left-0 right-0 h-16 pointer-events-none bg-gradient-to-b from-background to-transparent",
            fadeClassName
          )}
        />
      )}

      {/* Bottom fade - only visible when there's more content below */}
      {showBottomFade && canScrollDown && (
        <div
          className={cn(
            "absolute bottom-[-4px] left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background to-transparent",
            fadeClassName
          )}
        />
      )}

      {/* Left fade - only visible when scrolled right */}
      {showLeftFade && canScrollLeft && (
        <div
          className={cn(
            "absolute top-0 left-[-4px] bottom-0 w-16 pointer-events-none bg-gradient-to-r from-background to-transparent",
            fadeClassName
          )}
        />
      )}

      {/* Right fade - only visible when more content to scroll */}
      {showRightFade && canScrollRight && (
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
