// Animation variants and constants for consistent animations across the app
export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
} as const;

export const ANIMATION_EASING = {
  easeInOut: "easeInOut",
  easeOut: "easeOut",
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const;

export const STAGGER_DELAY = 0.1;

// Common animation variants
export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const fadeInRight = {
  hidden: {
    opacity: 0,
    x: 10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const expandHeight = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: ANIMATION_DURATION.slow,
        ease: ANIMATION_EASING.easeInOut,
      },
      opacity: {
        duration: ANIMATION_DURATION.normal,
        ease: ANIMATION_EASING.easeOut,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: ANIMATION_DURATION.slow,
        ease: ANIMATION_EASING.easeInOut,
      },
      opacity: {
        duration: ANIMATION_DURATION.fast,
        ease: ANIMATION_EASING.easeOut,
      },
    },
  },
};

// Container variants for staggered animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: 0.1,
    },
  },
};

// Generic stagger animation creator that supports multiple animation types
export const createStaggerAnimation = (
  index: number,
  animationType: string,
  additionalDelay: number = 0,
  distance: number = 10, // Default distance for subtle UI animations
  duration: number = ANIMATION_DURATION.normal // Default duration for animations
) => {
  // Base transition with staggering plus any additional delay
  const transition = {
    delay: index * STAGGER_DELAY + additionalDelay,
    duration: duration,
    ease: ANIMATION_EASING.easeOut,
  };

  // Animation properties based on type
  switch (animationType) {
    case "fadeIn": // New type - just opacity, no movement
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition },
      };
    case "fadeInUp":
      return {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0, transition },
      };
    case "fadeInLeft":
      return {
        hidden: { opacity: 0, x: -distance },
        visible: { opacity: 1, x: 0, transition },
      };
    case "fadeInRight":
    default:
      return {
        hidden: { opacity: 0, x: distance },
        visible: { opacity: 1, x: 0, transition },
      };
  }
};

// Reduced motion variants (respects user preferences)
export const getReducedMotionVariants = (variants: any) => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    };
  }
  return variants;
};
