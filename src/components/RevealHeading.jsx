import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RevealHeading({ text, as: Component = 'h2', className = '', ...props }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll('.reveal-word');
    if (words.length === 0) return;

    const animateIn = () => {
      gsap.to(words, {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        filter: 'blur(0px)',
        duration: 0.7,
        stagger: 0.08,
        ease: 'power4.out',
      });
    };

    gsap.set(words, { 
      opacity: 0, 
      scaleX: 1.4, 
      scaleY: 0.8, 
      filter: 'blur(4px)',
      willChange: 'transform, opacity, filter'
    });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      once: true,
      onEnter: animateIn,
    });

    // Fallback: If element is already in viewport on mount, animate immediately
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      animateIn();
    }

    return () => trigger.kill();
  }, [text]);

  const wordsArray = typeof text === 'string' ? text.split(/\s+/) : [];

  return (
    <Component ref={containerRef} className={`${className} reveal-heading`} style={{ perspective: '1000px' }} {...props}>
      {wordsArray.map((word, idx) => (
        <span key={idx} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em' }}>
          <span className="reveal-word" style={{ display: 'inline-block' }}>
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
}
