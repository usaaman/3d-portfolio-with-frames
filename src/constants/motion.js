/**
 * ==========================================
 * DESIGN SYSTEM MOTION CONSTANTS & TOKENS
 * Aligned with CSS Design Tokens in tokens.css
 * ==========================================
 */

/**
 * Durations in seconds (for Framer Motion)
 */
export const DURATIONS = {
  fast: 0.15,       // Hover states, micro-interactions (150ms)
  button: 0.20,     // Button state changes (200ms)
  medium: 0.30,     // Card transitions, fades, expand states (300ms)
  slow: 0.60,       // Section reveals, overlays (600ms)
  cinematic: 1.50,  // Scene transitions, Hero intro (1500ms)
};

/**
 * Durations in milliseconds (for GSAP/CSS)
 */
export const DURATIONS_MS = {
  fast: 150,
  button: 200,
  medium: 300,
  slow: 600,
  cinematic: 1500,
};

/**
 * Easing cubic-bezier presets
 */
export const EASINGS = {
  // ease-out-natural: cubic-bezier(0.16, 1, 0.3, 1)
  naturalOut: [0.16, 1, 0.3, 1],
  // ease-in-out-natural: cubic-bezier(0.76, 0, 0.24, 1)
  naturalInOut: [0.76, 0, 0.24, 1],
  // ease-soft-spring: cubic-bezier(0.25, 1, 0.5, 1)
  softSpring: [0.25, 1, 0.5, 1],
};

/**
 * Framer Motion Spring Presets for physics-based animations
 */
export const SPRINGS = {
  default: {
    type: 'spring',
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  gentle: {
    type: 'spring',
    stiffness: 80,
    damping: 15,
    mass: 1,
  },
  bouncy: {
    type: 'spring',
    stiffness: 150,
    damping: 12,
    mass: 1,
  },
  slow: {
    type: 'spring',
    stiffness: 50,
    damping: 25,
    mass: 1.5,
  },
};
