import { useScroll, useTransform, useSpring } from 'framer-motion';
import { prefersReducedMotion } from '../animations/variants';
import { SPRINGS } from '../constants/motion';

/**
 * Custom React hook to create scroll-driven parallax translation effects.
 * Automatically respects user preferences for reduced motion.
 *
 * @param {Object} ref - React RefObject pointing to target container
 * @param {Object} options - Parallax configurations
 * @param {number} options.distance - Translation offset range in pixels (default: 50)
 * @param {string} options.direction - Offset direction ('up' | 'down' | 'left' | 'right') (default: 'up')
 * @param {boolean} options.useSpringEffect - If true, applies a smoothing spring filter (default: true)
 * @param {Object} options.springConfig - Config for the spring physics (default: SPRINGS.slow)
 * @returns {MotionValue<number>} A Framer MotionValue representing current offset position
 */
export default function useParallax(ref, {
  distance = 50,
  direction = 'up',
  useSpringEffect = true,
  springConfig = SPRINGS.slow
} = {}) {
  // Respect prefers-reduced-motion
  const isReduced = prefersReducedMotion();
  
  // Track scroll position of target element relative to viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Calculate base translation range
  const outputRange = isReduced
    ? [0, 0]
    : {
        up: [distance, -distance],
        down: [-distance, distance],
        left: [distance, -distance],
        right: [-distance, distance],
      }[direction] || [distance, -distance];

  // Map progress (0 to 1) to position coordinates
  const transformValue = useTransform(scrollYProgress, [0, 1], outputRange);

  // Optionally smooth the output with spring physics
  const springValue = useSpring(transformValue, springConfig);

  return useSpringEffect && !isReduced ? springValue : transformValue;
}
