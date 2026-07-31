import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Code2,
  Globe,
  Database,
  Server,
  Box,
  Terminal,
  Film,
  Layout,
  Sparkles,
  Award,
  Cpu,
} from 'lucide-react';
import SectionHeading from './SectionHeading';
import SectionLabel from './SectionLabel';
import './SkillsMarquee.css';

function getIconByName(name) {
  if (!name || typeof name !== 'string') return Sparkles;
  const norm = name.toLowerCase();
  if (norm.includes('code')) return Code2;
  if (norm.includes('cpu') || norm.includes('chip')) return Cpu;
  if (norm.includes('globe') || norm.includes('web')) return Globe;
  if (norm.includes('database') || norm.includes('db') || norm.includes('store')) return Database;
  if (norm.includes('server') || norm.includes('cloud')) return Server;
  if (norm.includes('box') || norm.includes('layers')) return Box;
  if (norm.includes('terminal') || norm.includes('cli')) return Terminal;
  if (norm.includes('film') || norm.includes('video') || norm.includes('scissors')) return Film;
  if (norm.includes('layout')) return Layout;
  if (norm.includes('award')) return Award;
  return Sparkles;
}

// Helper to repeat skills
function getRepeatedSkills(skillsList, minCount = 10) {
  if (!skillsList || skillsList.length === 0) return [];
  let result = [...skillsList];
  while (result.length < minCount) {
    result = [...result, ...skillsList];
  }
  return result;
}

const NORMAL_SPEED = 0.8;
const SLOW_SPEED = 0.15;
const EASE = 0.05;

export default function SkillsMarquee({ skills }) {
  const trackRefs = useRef([]);
  const groupRefs = useRef([]);
  const groupWidthRefs = useRef([]);
  const offsetsRef = useRef([]);
  const currentSpeedRef = useRef(NORMAL_SPEED);
  const hoverRef = useRef(false);
  const lastTimeRef = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);

  // Group dynamic skills
  const activeMarquees = useMemo(() => {
    if (skills && skills.length > 0) {
      const catsDoc = skills.find(d => d.id === 'categories-doc');
      const skillsDoc = skills.find(d => d.id === 'skills-doc');
      if (catsDoc && skillsDoc) {
        const groups = {};
        const cats = catsDoc.entries || [];
        const sks = skillsDoc.entries || [];

        cats.forEach(c => {
          if (c.hidden) return; // Skip hidden categories from marquee
          groups[c.label] = [];
        });

        sks.forEach(s => {
          if (s.hidden) return; // Skip hidden skills from being listed in marquees
          const cat = cats.find(c => c.id === s.categoryId);
          if (cat && !cat.hidden) {
            groups[cat.label] = groups[cat.label] || [];
            groups[cat.label].push({
              name: s.name,
              icon: getIconByName(s.icon),
              color: s.color || '#ffffff'
            });
          }
        });

        // Remove empty rows
        return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0));
      }
    }
    return {};
  }, [skills]);

  // 1. Accessibility prefers-reduced-motion listener
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // 2. High-Performance Frame Loop
  useEffect(() => {
    let active = true;
    let rafHandle = null;

    const measure = () => {
      groupRefs.current.forEach((el, index) => {
        if (el) {
          const width = el.getBoundingClientRect().width;
          groupWidthRefs.current[index] = width;

          if (offsetsRef.current[index] === undefined) {
            const direction = index % 2 === 0 ? -1 : 1;
            offsetsRef.current[index] = direction === -1 ? 0 : -width;
          }
        }
      });
    };

    measure();

    const tick = (timestamp) => {
      if (!active) return;
      if (reducedMotion) return;

      const delta = lastTimeRef.current ? Math.min(100, timestamp - lastTimeRef.current) / 16.666 : 1;
      lastTimeRef.current = timestamp;

      const targetSpeed = hoverRef.current ? SLOW_SPEED : NORMAL_SPEED;
      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * EASE;

      const rowKeys = Object.keys(activeMarquees);
      rowKeys.forEach((_, rowIndex) => {
        const track = trackRefs.current[rowIndex];
        const groupWidth = groupWidthRefs.current[rowIndex];

        if (!track || !groupWidth) return;

        const direction = rowIndex % 2 === 0 ? -1 : 1;
        let offset = offsetsRef.current[rowIndex] + direction * currentSpeedRef.current * delta;

        if (direction === -1) {
          if (offset <= -groupWidth) {
            offset += groupWidth;
          }
        } else {
          if (offset >= 0) {
            offset -= groupWidth;
          }
        }

        offsetsRef.current[rowIndex] = offset;
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
      });

      rafHandle = requestAnimationFrame(tick);
    };

    rafHandle = requestAnimationFrame((timestamp) => {
      measure();
      tick(timestamp);
    });

    window.addEventListener('resize', measure);

    return () => {
      active = false;
      cancelAnimationFrame(rafHandle);
      window.removeEventListener('resize', measure);
    };
  }, [reducedMotion, activeMarquees]);

  return (
    <section className="skills-section" id="skills">
      <div className="skills-header text-center flex flex-col items-center">
        <SectionLabel>SKILLS &amp; TOOLS</SectionLabel>
        <SectionHeading align="center" className="skills-title">
          What I <span className="skills-title-accent">work with</span>
        </SectionHeading>
        <p className="skills-sub">
          The technologies that continue to shape my journey as a developer.
        </p>
      </div>

      <div
        className="skills-categories-container"
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
      >
        {Object.entries(activeMarquees).map(([categoryName, rowSkills], rowIndex) => {
          const repeatedList = getRepeatedSkills(rowSkills, 10);
          if (repeatedList.length === 0) return null;

          return (
            <div className="skills-category-row" key={categoryName}>
              <h3 className="skills-category-row-title">{categoryName}</h3>
              <div className="skills-marquee-container">
                <div className="skills-marquee-track" style={{ display: 'flex', width: 'max-content' }} ref={(el) => (trackRefs.current[rowIndex] = el)}>
                  <div className="skills-marquee-group" style={{ display: 'flex', gap: '12px', paddingRight: '12px' }} ref={(el) => (groupRefs.current[rowIndex] = el)}>
                    {repeatedList.map(({ name, icon: Icon, color }, i) => (
                      <div className="skills-glass-pill" key={`${name}-${i}`}>
                        <Icon className="skills-pill-icon" style={{ color }} />
                        <span className="skills-pill-name">{name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="skills-marquee-group" style={{ display: 'flex', gap: '12px', paddingRight: '12px' }} aria-hidden="true">
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
