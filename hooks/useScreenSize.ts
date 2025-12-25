import { useState, useEffect } from "react";

export type ScreenSize = "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Hook to detect current screen size breakpoint
 * Based on Tailwind's default breakpoints:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */
export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>("lg"); // Default for SSR

  useEffect(() => {
    const getScreenSize = (): ScreenSize => {
      const width = window.innerWidth;

      if (width >= 1536) return "2xl";
      if (width >= 1280) return "xl";
      if (width >= 1024) return "lg";
      if (width >= 768) return "md";
      if (width >= 640) return "sm";
      return "sm";
    };

    const handleResize = () => {
      setScreenSize(getScreenSize());
    };

    // Set initial value
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
}
