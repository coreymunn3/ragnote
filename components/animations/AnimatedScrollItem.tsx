"use client";

import { motion } from "framer-motion";
import {
  createStaggerAnimation,
  getReducedMotionVariants,
} from "@/lib/animations";

// Define animation types available in the system
type AnimationVariant = "fadeInRight" | "fadeInLeft" | "fadeInUp" | "fadeIn";

interface AnimatedScrollItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
  animation: AnimationVariant;
  delay?: number;
  distance?: number; // Animation distance for landing pages (default: 10px)
  duration?: number; // Animation duration in seconds (default: 0.2s)
  viewport?: {
    once?: boolean;
    amount?: number | "some" | "all";
  };
}

export const AnimatedScrollItem = ({
  children,
  index = 0,
  className,
  animation,
  delay = 0,
  distance = 10, // Default to subtle animations
  duration,
  viewport = { once: true, amount: 0.3 },
}: AnimatedScrollItemProps) => {
  // Use the generic stagger animation creator with additional delay, distance, and duration
  const variants = getReducedMotionVariants(
    createStaggerAnimation(index, animation, delay, distance, duration)
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
