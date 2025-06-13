"use client";

import { motion, AnimatePresence } from "framer-motion";
import { expandHeight, getReducedMotionVariants } from "@/lib/animations";

interface AnimatedExpandableProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export const AnimatedExpandable = ({
  children,
  isOpen,
  className = "overflow-hidden",
}: AnimatedExpandableProps) => {
  const variants = getReducedMotionVariants(expandHeight);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
