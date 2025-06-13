"use client";

import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, getReducedMotionVariants } from "@/lib/animations";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  withPresence?: boolean;
}

export const AnimatedContainer = ({
  children,
  className,
  withPresence = false,
}: AnimatedContainerProps) => {
  const variants = getReducedMotionVariants(staggerContainer);

  const content = (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );

  if (withPresence) {
    return <AnimatePresence>{content}</AnimatePresence>;
  }

  return content;
};
