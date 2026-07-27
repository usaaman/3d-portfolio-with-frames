import { DURATIONS, EASINGS, SPRINGS } from '../constants/motion';

/**
 * Helper to check if the client prefers reduced motion.
 * Bypasses intensive movement, blurs, and long timings.
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * FADE ANIMATIONS
 * Standard opacity reveal.
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => {
    const isReduced = prefersReducedMotion();
    const duration = isReduced ? DURATIONS.fast : (custom.duration ?? DURATIONS.medium);
    const delay = custom.delay ?? 0;
    return {
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: EASINGS.naturalOut,
      },
    };
  },
};

/**
 * Configurable Fade Variant Generator
 */
export const getFadeIn = ({ duration = DURATIONS.medium, delay = 0 } = {}) => {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion() ? DURATIONS.fast : duration,
        delay,
        ease: EASINGS.naturalOut,
      },
    },
  };
};

/**
 * SLIDE ANIMATIONS
 * Combines offset translation and fade.
 */
export const slideIn = {
  hidden: (custom = {}) => {
    const isReduced = prefersReducedMotion();
    if (isReduced) return { opacity: 0 };

    const direction = custom.direction ?? 'up';
    const distance = custom.distance ?? 24;
    
    const offsets = {
      up: { y: distance, x: 0 },
      down: { y: -distance, x: 0 },
      left: { x: distance, y: 0 },
      right: { x: -distance, y: 0 },
    };
    
    return {
      opacity: 0,
      ...(offsets[direction] || offsets.up),
    };
  },
  visible: (custom = {}) => {
    const isReduced = prefersReducedMotion();
    const duration = isReduced ? DURATIONS.fast : (custom.duration ?? DURATIONS.medium);
    const delay = custom.delay ?? 0;
    const type = custom.type ?? 'tween';
    const springConfig = custom.springConfig ?? SPRINGS.default;

    return {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay,
        ...(type === 'spring' && !isReduced
          ? springConfig
          : {
              type: 'tween',
              duration,
              ease: custom.ease ?? EASINGS.naturalOut,
            }),
      },
    };
  },
};

/**
 * Configurable Slide Variant Generator
 */
export const getSlideIn = ({
  direction = 'up',
  distance = 24,
  duration = DURATIONS.medium,
  delay = 0,
  type = 'tween',
  springConfig = SPRINGS.default,
} = {}) => {
  const isReduced = prefersReducedMotion();
  const offsets = isReduced ? { x: 0, y: 0 } : {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }[direction];

  return {
    hidden: {
      opacity: 0,
      ...offsets,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay,
        ...(type === 'spring' && !isReduced
          ? springConfig
          : {
              type: 'tween',
              duration: isReduced ? DURATIONS.fast : duration,
              ease: EASINGS.naturalOut,
            }),
      },
    },
  };
};

/**
 * SCALE ANIMATIONS
 * Scale down/up and fade.
 */
export const scaleIn = {
  hidden: (custom = {}) => {
    const isReduced = prefersReducedMotion();
    return {
      opacity: 0,
      scale: isReduced ? 1 : (custom.scaleStart ?? 0.95),
    };
  },
  visible: (custom = {}) => {
    const isReduced = prefersReducedMotion();
    const duration = isReduced ? DURATIONS.fast : (custom.duration ?? DURATIONS.medium);
    const delay = custom.delay ?? 0;
    const type = custom.type ?? 'tween';
    const springConfig = custom.springConfig ?? SPRINGS.default;

    return {
      opacity: 1,
      scale: 1,
      transition: {
        delay,
        ...(type === 'spring' && !isReduced
          ? springConfig
          : {
              type: 'tween',
              duration,
              ease: custom.ease ?? EASINGS.naturalOut,
            }),
      },
    };
  },
};

/**
 * BLUR REVEAL ANIMATIONS
 * Progressive blur-to-clear with soft y translation.
 */
export const blurReveal = {
  hidden: (custom = {}) => {
    const isReduced = prefersReducedMotion();
    return {
      opacity: 0,
      y: isReduced ? 0 : (custom.yOffset ?? 16),
      filter: isReduced ? 'blur(0px)' : `blur(${custom.blurStart ?? 8}px)`,
    };
  },
  visible: (custom = {}) => {
    const isReduced = prefersReducedMotion();
    const duration = isReduced ? DURATIONS.fast : (custom.duration ?? DURATIONS.slow);
    const delay = custom.delay ?? 0;

    return {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration,
        delay,
        ease: EASINGS.naturalOut,
      },
    };
  },
};

/**
 * Configurable Blur Reveal Generator
 */
export const getBlurReveal = ({
  blurStart = 8,
  yOffset = 16,
  duration = DURATIONS.slow,
  delay = 0,
} = {}) => {
  const isReduced = prefersReducedMotion();
  return {
    hidden: {
      opacity: 0,
      y: isReduced ? 0 : yOffset,
      filter: isReduced ? 'blur(0px)' : `blur(${blurStart}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: isReduced ? DURATIONS.fast : duration,
        delay,
        ease: EASINGS.naturalOut,
      },
    },
  };
};

/**
 * STAGGER HELPERS
 * Orchestrates child component lists.
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerChildren ?? 0.08,
      delayChildren: custom.delayChildren ?? 0,
    },
  }),
};

/**
 * Configurable Stagger Container Generator
 */
export const getStaggerContainer = ({ staggerChildren = 0.08, delayChildren = 0 } = {}) => {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
};

/**
 * FLOATING AMBIENT ANIMATION
 * Infinite loop vertical oscillation.
 */
export const floating = {
  animate: (custom = {}) => {
    if (prefersReducedMotion()) return {};
    
    const yOffset = custom.yOffset ?? 6;
    const duration = custom.duration ?? 6;
    const ease = custom.ease ?? 'easeInOut';
    const delay = custom.delay ?? 0;
    
    return {
      y: [0, yOffset, 0],
      transition: {
        duration,
        delay,
        ease,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    };
  },
};
