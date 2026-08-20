import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DIRECTIONS = [
  { x: -260, y: 0, rotate: -18 },
  { x: 260, y: 0, rotate: 18 },
  { x: 0, y: -220, rotate: 12 },
  { x: 0, y: 220, rotate: -12 },
  { x: 0, y: 0, rotate: 8, scale: 0.4 },
];

export function useSingleAssemble(ref, directionIndex = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dir = DIRECTIONS[directionIndex % DIRECTIONS.length];

    gsap.set(el, {
      x: dir.x,
      y: dir.y,
      rotate: dir.rotate,
      scale: dir.scale ?? 0.85,
      opacity: 0,
      filter: 'blur(4px)',
      willChange: 'transform, opacity, filter',
    });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        tl.to(el, {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1.04,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
        }).to(el, {
          scale: 1,
          duration: 0.25,
          ease: 'back.out(3)',
          onComplete: () => el.classList.add('assemble-flash'),
        });
      },
    });
    return () => trigger.kill();
  }, [ref, directionIndex]);
}
