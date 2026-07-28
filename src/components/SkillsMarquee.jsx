import { useEffect, useRef, useState } from 'react';
import { SKILLS_BY_CATEGORY_REDESIGN } from './skillsData';
import SectionHeading from './SectionHeading';
import SectionLabel from './SectionLabel';
import './SkillsMarquee.css';

// Helper to repeat skills so that short rows (like databases) span enough width to loop seamlessly
function getRepeatedSkills(skills, minCount = 10) {
  let result = [...skills];
  while (result.length < minCount) {
    result = [...result, ...skills];
  }
  return result;
}

const NORMAL_SPEED = 0.8; // px per frame at 60fps
const SLOW_SPEED = 0.15; // px per frame at 60fps
const EASE = 0.05; // speed transition ease

export default function SkillsMarquee() {
  const trackRefs = useRef([]);
  const groupRefs = useRef([]);
  const groupWidthRefs = useRef([]);
  const offsetsRef = useRef([]);
  const currentSpeedRef = useRef(NORMAL_SPEED);
  const hoverRef = useRef(false);
  const lastTimeRef = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Accessibility prefers-reduced-motion listener
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // 2. High-Performance Frame Loop with Delta Time and Resize Listener
  useEffect(() => {
    let active = true;
    let rafHandle = null;

    const measure = () => {
      groupRefs.current.forEach((el, index) => {
        if (el) {
          const width = el.getBoundingClientRect().width;
          groupWidthRefs.current[index] = width;

          // Initialize offset if it is empty
          if (offsetsRef.current[index] === undefined) {
            const direction = index % 2 === 0 ? -1 : 1;
            offsetsRef.current[index] = direction === -1 ? 0 : -width;
          }
        }
      });
    };

    measure();
    window.addEventListener('resize', measure);

    const tick = (timestamp) => {
      if (!active) return;
      if (reducedMotion) return;

      // Initialize lastTime on first tick
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Clamp delta time to avoid large offsets during browser lag/tab switching
      const clampedDelta = Math.min(deltaTime, 100);
      const timeScale = clampedDelta / 16.67; // Normalize relative to 60fps frame duration

      const targetSpeed = hoverRef.current ? SLOW_SPEED : NORMAL_SPEED;
      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * EASE;
      const speed = currentSpeedRef.current;

      Object.keys(SKILLS_BY_CATEGORY_REDESIGN).forEach((_, rowIndex) => {
        const track = trackRefs.current[rowIndex];
        if (!track) return;

        const direction = rowIndex % 2 === 0 ? -1 : 1;
        const loopWidth = groupWidthRefs.current[rowIndex] || 500;

        let offset = offsetsRef.current[rowIndex] || (direction === -1 ? 0 : -loopWidth);
        offset += direction * speed * timeScale;

        if (direction === -1) {
          if (offset <= -loopWidth) {
            offset += loopWidth;
          }
        } else {
          if (offset >= 0) {
            offset -= loopWidth;
          }
        }

        offsetsRef.current[rowIndex] = offset;
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
      });

      rafHandle = requestAnimationFrame(tick);
    };

    rafHandle = requestAnimationFrame((timestamp) => {
      // Re-measure after initial mount paint to ensure accurate client dimensions
      measure();
      tick(timestamp);
    });

    return () => {
      active = false;
      cancelAnimationFrame(rafHandle);
      window.removeEventListener('resize', measure);
    };
  }, [reducedMotion]);

  return (
    <section className="skills-section" id="skills">
      {/* 1. Heading (Restored to design system, updated subtitle text) */}
      <div className="skills-header text-center flex flex-col items-center">
        <SectionLabel>SKILLS &amp; TOOLS</SectionLabel>
        <SectionHeading align="center" className="skills-title">
          What I <span className="skills-title-accent">work with</span>
        </SectionHeading>
        <p className="skills-sub">
          The technologies that continue to shape my journey as a developer.
        </p>
      </div>

      {/* 2. Premium Marquee Strips */}
      <div
        className="skills-categories-container"
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
      >
        {Object.entries(SKILLS_BY_CATEGORY_REDESIGN).map(([categoryName, skills], rowIndex) => {
          const repeatedList = getRepeatedSkills(skills, 10);

          return (
            <div className="skills-category-row" key={categoryName}>
              <h3 className="skills-category-row-title">{categoryName}</h3>
              <div className="skills-marquee-container">
                <div className="skills-marquee-track" ref={(el) => (trackRefs.current[rowIndex] = el)}>
                  <div className="skills-marquee-group" ref={(el) => (groupRefs.current[rowIndex] = el)}>
                    {repeatedList.map(({ name, icon: Icon, color }, i) => (
                      <div className="skills-glass-pill" key={`${name}-${i}`}>
                        <Icon className="skills-pill-icon" style={{ color }} />
                        <span className="skills-pill-name">{name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="skills-marquee-group" aria-hidden="true">
                    {repeatedList.map(({ name, icon: Icon, color }, i) => (
                      <div className="skills-glass-pill" key={`${name}-${i}-dup`}>
                        <Icon className="skills-pill-icon" style={{ color }} />
                        <span className="skills-pill-name">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
