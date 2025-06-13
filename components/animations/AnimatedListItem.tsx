"use client";

import { motion } from "framer-motion";
import { createStaggerItem, getReducedMotionVariants } from "@/lib/animations";

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

export const AnimatedListItem = ({
  children,
  index,
  className,
}: AnimatedListItemProps) => {
  const variants = getReducedMotionVariants(createStaggerItem(index));

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
