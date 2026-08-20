import { useEffect, useState, useRef } from 'react';

export default function TypewriterText({ text, className = '', as: Component = 'p', speed = 8, delay = 100 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setStarted(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!started || !text) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => text.substring(0, currentIndex + 1));
      currentIndex++;
      if (currentIndex >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed]);

  if (!text) return null;

  return (
    <Component ref={containerRef} className={className}>
      {displayedText}
    </Component>
  );
}
