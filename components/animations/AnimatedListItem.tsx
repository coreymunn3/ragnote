"use client";

import { motion } from "framer-motion";
import {
  createStaggerAnimation,
  getReducedMotionVariants,
} from "@/lib/animations";

// Define animation types available in the system
// Add new types here as they're added to createStaggerAnimation
type AnimationVariant = "fadeInRight" | "fadeInUp" | "fadeIn";

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  animation: AnimationVariant; // Required with no default
  delay?: number; // Optional additional delay
}

export const AnimatedListItem = ({
  children,
  index,
  className,
  animation,
  delay = 0, // Default to no additional delay
}: AnimatedListItemProps) => {
  // Use the generic stagger animation creator with additional delay
  const variants = getReducedMotionVariants(
    createStaggerAnimation(index, animation, delay)
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
