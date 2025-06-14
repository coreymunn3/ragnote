"use client";

import { motion } from "framer-motion";
import {
  createStaggerAnimation,
  getReducedMotionVariants,
} from "@/lib/animations";

// Define animation types available in the system
// Add new types here as they're added to createStaggerAnimation
type AnimationVariant = "fadeInRight" | "fadeInUp";

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  animation: AnimationVariant; // Required with no default
}

export const AnimatedListItem = ({
  children,
  index,
  className,
  animation,
}: AnimatedListItemProps) => {
  // Use the generic stagger animation creator
  const variants = getReducedMotionVariants(
    createStaggerAnimation(index, animation)
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
