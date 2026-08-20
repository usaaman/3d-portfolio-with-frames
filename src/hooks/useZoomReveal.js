import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Whole-element zoom/stretch reveal — safe for headings with inner
// markup (accent spans, colored words) since it doesn't split text.
export function useZoomReveal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { 
      opacity: 0, 
      scaleX: 1.6, 
      scaleY: 0.7, 
      filter: 'blur(5px)',
      willChange: 'transform, opacity, filter' 
    });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power4.out',
        });
      },
    });
    return () => trigger.kill();
  }, [ref]);
}
