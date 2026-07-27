import { useMemo } from 'react';
import { prefersReducedMotion } from '../animations/variants';

/**
 * Custom React hook to generate floating animation configurations for Framer Motion.
 * Features automatic prefers-reduced-motion bypass and dynamic duration/delay
 * randomization to break synchronicity of ambient screen components.
 *
 * @param {Object} options - Animation settings
 * @param {number} options.yDistance - Vertical oscillation offset range in pixels (default: 6)
 * @param {number} options.xDistance - Horizontal oscillation offset range in pixels (default: 0)
 * @param {number} options.rotation - Rotational oscillation offset range in degrees (default: 0)
 * @param {number} options.duration - Duration in seconds for a full loop cycle (default: 6)
 * @param {number} options.delay - Delay offset in seconds before starting (default: 0)
 * @param {boolean} options.randomize - Dynamically shifts parameters to avoid repetitive timing (default: true)
 * @returns {Object} Configuration object suitable for spreading onto a `<motion.div />` (e.g., `<motion.div {...floatConfig} />`)
 */
export default function useFloatingAnimation({
  yDistance = 6,
  xDistance = 0,
  rotation = 0,
  duration = 6,
  delay = 0,
  randomize = true,
} = {}) {
  const isReduced = prefersReducedMotion();

  return useMemo(() => {
    if (isReduced) {
      return {
        animate: { x: 0, y: 0, rotate: 0 },
        transition: { duration: 0.1 },
      };
    }

    // Dynamic parameter variation to mimic organic floating behavior
    const finalDuration = randomize
      ? Math.max(3.0, duration + (Math.random() - 0.5) * 2.0)
      : duration;
      
    const finalDelay = randomize
      ? delay + Math.random() * 2.0
      : delay;

    // Standard loop keyframes
    const animate = {};
    if (yDistance !== 0) animate.y = [0, yDistance, 0];
    if (xDistance !== 0) animate.x = [0, xDistance, 0];
    if (rotation !== 0) animate.rotate = [0, rotation, 0];

    return {
      animate,
      transition: {
        duration: finalDuration,
        delay: finalDelay,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'mirror',
      },
    };
  }, [yDistance, xDistance, rotation, duration, delay, randomize, isReduced]);
}
