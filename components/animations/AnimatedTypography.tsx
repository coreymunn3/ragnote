"use client";

import { motion, useAnimationControls } from "framer-motion";
import { ReactNode, ElementType, HTMLAttributes, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ANIMATION_DURATION,
  ANIMATION_EASING,
  getReducedMotionVariants,
} from "@/lib/animations";

// Typography variants matching the typography.tsx component styles
type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "lead"
  | "large"
  | "small"
  | "muted";

interface AnimatedTypographyProps extends HTMLAttributes<HTMLElement> {
  variant: TypographyVariant;
  as?: ElementType;
  children: string;
  className?: string;
  delay?: number;
  characterDelay?: number;
}

// Map of variant to appropriate HTML element and className
const variantMap: Record<
  TypographyVariant,
  { element: ElementType; className: string }
> = {
  h1: {
    element: "h1",
    className:
      "scroll-m-20 text-4xl font-bold tracking-tight text-balance pb-6",
  },
  h2: {
    element: "h2",
    className:
      "scroll-m-20 pb-4 text-3xl font-semibold tracking-tight first:mt-0",
  },
  h3: {
    element: "h3",
    className: "scroll-m-20 pb-4 text-2xl font-semibold tracking-tight",
  },
  h4: {
    element: "h4",
    className: "scroll-m-20 pb-2 text-xl font-semibold tracking-tight",
  },
  p: {
    element: "p",
    className: "leading-7 [&:not(:first-child)]:mt-6",
  },
  blockquote: {
    element: "blockquote",
    className: "mt-6 border-l-2 pl-6 italic",
  },
  lead: {
    element: "p",
    className: "text-xl text-muted-foreground",
  },
  large: {
    element: "div",
    className: "text-lg font-semibold",
  },
  small: {
    element: "small",
    className: "text-sm font-medium leading-none",
  },
  muted: {
    element: "p",
    className: "text-sm text-muted-foreground",
  },
};

export const AnimatedTypography = ({
  variant,
  as,
  children,
  className,
  delay = 0,
  characterDelay = 0.05,
  ...props
}: AnimatedTypographyProps) => {
  // Get the appropriate element and base className for the selected variant
  const { element, className: variantClassName } = variantMap[variant];
  const Element = as || element;
  // Split the text into individual characters
  const characters = String(children).split("");

  // Create animation variants for the container
  const containerVariants = getReducedMotionVariants({
    hidden: {},
    visible: {
      transition: {
        staggerChildren: characterDelay,
        delayChildren: delay,
      },
    },
  });

  // Create animation variants for each character - only fade in, no motion
  const characterVariants = getReducedMotionVariants({
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: ANIMATION_DURATION.normal,
        ease: ANIMATION_EASING.easeOut,
      },
    },
  });

  // Use animation controls to prevent hydration mismatch
  const controls = useAnimationControls();

  // Only animate after component mounts to prevent hydration mismatch
  useEffect(() => {
    // Small timeout to ensure hydration is complete
    const timer = setTimeout(() => {
      controls.start("visible");
    }, 10);

    return () => clearTimeout(timer);
  }, [controls]);

  // Wrap the animated content in the appropriate element with typography styles
  return (
    <Element className={cn(variantClassName, className)} {...props}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        style={{ display: "inline-block" }}
      >
        {characters.map((char, index) => (
          <motion.span
            key={index}
            variants={characterVariants}
            style={{ display: "inline-block" }}
            aria-hidden={true}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
        {/* Hidden original text for accessibility */}
        <span className="sr-only">{children}</span>
      </motion.span>
    </Element>
  );
};
