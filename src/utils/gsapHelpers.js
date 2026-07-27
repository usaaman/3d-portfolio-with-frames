import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../animations/variants';

/**
 * Ensures that GSAP ScrollTrigger plugin is registered safely.
 */
export function registerScrollTrigger() {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
}

/**
 * Standard GSAP easing functions mapped to the Design System presets.
 */
export const GSAP_EASINGS = {
  // ease-out-natural: cubic-bezier(0.16, 1, 0.3, 1)
  naturalOut: 'custom(0.16, 1, 0.3, 1)',
  // ease-in-out-natural: cubic-bezier(0.76, 0, 0.24, 1)
  naturalInOut: 'custom(0.76, 0, 0.24, 1)',
  // ease-soft-spring: cubic-bezier(0.25, 1, 0.5, 1)
  softSpring: 'custom(0.25, 1, 0.5, 1)',
  // standard smooth ease
  power2Out: 'power2.out',
  power2InOut: 'power2.inOut',
};

/**
 * Safely creates a GSAP context scope for React components.
 * This automatically tracks all GSAP timelines, tweens, and ScrollTriggers
 * initialized within the scope and reverts them on cleanup.
 * Prevents memory leaks and duplicate triggers caused by StrictMode.
 *
 * @param {Object} scopeRef - React ref pointing to wrapper container element
 * @param {Function} animationCallback - Callback containing timeline creation logic (receives context as argument)
 * @returns {Function} Cleanup function to call on unmount (e.g., inside useEffect cleanup)
 */
export function createGSAPContext(scopeRef, animationCallback) {
  registerScrollTrigger();

  const ctx = gsap.context((self) => {
    // If client prefers reduced motion, we can skip scroll timelines
    if (prefersReducedMotion()) {
      return;
    }
    animationCallback(self);
  }, scopeRef);

  return () => ctx.revert();
}

/**
 * Helper to build standard ScrollTrigger configuration options.
 *
 * @param {Object} triggerRef - React ref of the trigger element
 * @param {Object} options - ScrollTrigger configurations
 * @param {string} options.start - Trigger start point (default: 'top bottom')
 * @param {string} options.end - Trigger end point (default: 'bottom top')
 * @param {boolean|number} options.scrub - Smooth scroll mapping speed (default: 1)
 * @param {boolean|string} options.pin - Pins the trigger element (default: false)
 * @param {boolean} options.markers - Show developer debug markers (default: false)
 * @returns {Object} Config object ready to pass to ScrollTrigger.create() or timeline constructor
 */
export function getScrollTriggerConfig(triggerRef, {
  start = 'top bottom',
  end = 'bottom top',
  scrub = 1,
  pin = false,
  markers = false,
  ...rest
} = {}) {
  return {
    trigger: triggerRef.current,
    start,
    end,
    scrub: prefersReducedMotion() ? false : scrub,
    pin: prefersReducedMotion() ? false : pin,
    markers: __DEV__ ? markers : false, // Disable markers in production automatically
    ...rest,
  };
}

// Fallback configuration check for production/development
const __DEV__ = typeof import.meta !== 'undefined' && !!import.meta.env && import.meta.env.DEV;

