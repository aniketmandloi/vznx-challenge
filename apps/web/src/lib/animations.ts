import type { Variants, Transition } from "framer-motion";

/**
 * Animation Utility Library
 * Reusable Framer Motion animation variants and transitions
 */

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  base: {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  slow: {
    duration: 0.35,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  snappy: {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1],
  } as Transition,

  bounce: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  } as Transition,

  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,

  elastic: {
    type: "spring",
    stiffness: 200,
    damping: 15,
  } as Transition,
};

// ============================================================================
// FADE VARIANTS
// ============================================================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ============================================================================
// SCALE VARIANTS
// ============================================================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.bounce,
  },
  exit: { opacity: 0, scale: 0.8 },
};

export const scaleUp: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const scaleUpLarge: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// ============================================================================
// SLIDE VARIANTS
// ============================================================================

export const slideInFromBottom: Variants = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
};

export const slideInFromTop: Variants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
};

export const slideInFromLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
};

export const slideInFromRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};

// ============================================================================
// HOVER & INTERACTION VARIANTS
// ============================================================================

export const liftOnHover: Variants = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: transitions.fast,
  },
};

export const liftOnHoverWithShadow: Variants = {
  initial: { y: 0, boxShadow: "var(--shadow-base)" },
  hover: {
    y: -6,
    boxShadow: "var(--shadow-lg)",
    transition: transitions.base,
  },
};

export const glowOnHover: Variants = {
  initial: {
    boxShadow: "var(--shadow-base)",
  },
  hover: {
    boxShadow: "var(--shadow-glow)",
    transition: transitions.base,
  },
};

export const borderGlowOnHover: Variants = {
  initial: {
    borderColor: "var(--color-border)",
  },
  hover: {
    borderColor: "var(--color-primary)",
    transition: transitions.fast,
  },
};

// ============================================================================
// STAGGER CONTAINER
// ============================================================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// MODAL/DIALOG VARIANTS
// ============================================================================

export const backdropVariants: Variants = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: {
    opacity: 1,
    backdropFilter: "blur(12px)",
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: transitions.fast,
  },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

// ============================================================================
// SPECIAL EFFECTS
// ============================================================================

export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const shimmerVariants: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

export const buttonWithGlow: Variants = {
  initial: {
    scale: 1,
    boxShadow: "var(--shadow-base)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "var(--shadow-colored)",
    transition: transitions.base,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

// ============================================================================
// INPUT/FORM VARIANTS
// ============================================================================

export const inputFocusVariants: Variants = {
  initial: {
    borderColor: "var(--color-border)",
    boxShadow: "none",
  },
  focus: {
    borderColor: "var(--color-primary)",
    boxShadow: "0 0 0 3px var(--color-primary / 0.1)",
    transition: transitions.fast,
  },
};

export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// ============================================================================
// CARD VARIANTS
// ============================================================================

export const cardVariants: Variants = {
  initial: {
    y: 0,
    boxShadow: "var(--shadow-base)",
  },
  hover: {
    y: -6,
    boxShadow: "var(--shadow-lg)",
    transition: transitions.base,
  },
};

export const cardWithBorderGlow: Variants = {
  initial: {
    y: 0,
    boxShadow: "var(--shadow-base)",
    borderColor: "var(--color-border)",
  },
  hover: {
    y: -6,
    boxShadow: "var(--shadow-lg)",
    borderColor: "var(--color-primary)",
    transition: transitions.base,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a stagger animation for children
 */
export function createStagger(delay: number = 0.05, delayChildren: number = 0) {
  return {
    animate: {
      transition: {
        staggerChildren: delay,
        delayChildren,
      },
    },
  };
}

/**
 * Create a custom fade in variant with custom duration
 */
export function createFadeIn(duration: number = 0.25): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration },
    },
    exit: { opacity: 0 },
  };
}

/**
 * Create a custom scale variant
 */
export function createScale(from: number = 0.95, to: number = 1): Variants {
  return {
    initial: { scale: from, opacity: 0 },
    animate: { scale: to, opacity: 1 },
    exit: { scale: from, opacity: 0 },
  };
}

/**
 * Respect reduced motion preferences
 */
export function getMotionProps(variants: Variants, transition?: Transition) {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return {
      initial: "animate",
      animate: "animate",
      variants: {},
    };
  }

  return {
    variants,
    initial: "initial",
    animate: "animate",
    exit: "exit",
    transition,
  };
}
