import { useEffect, useRef } from 'react';
import { SKILL_ROWS } from './skillsData';
import './SkillsMarquee.css';

const ITEM_WIDTH = 112;
const ITEM_GAP = 16;
const STRIP_PADDING = 20;
const STRIP_GAP = 32;
const STRIP_WIDTH = 10 * ITEM_WIDTH + 9 * ITEM_GAP + 2 * STRIP_PADDING; // 1304px
const STRIP_STEP = STRIP_WIDTH + STRIP_GAP; // 1336px
const SET_WIDTH = STRIP_STEP;
const COPIES = 3; // rendered copies per row, for seamless looping

const NORMAL_SPEED = 1.95; // px per frame, loop completes in ~11 seconds
const SLOW_SPEED = 0.20; // px per frame when hovering the section
const EASE = 0.06; // speed easing toward target (smooth accel/decel)

const CURVE_RADIUS = 300; // range of scaling effect relative to center
const MAX_SCALE_BOOST = 0.18; // center item gets up to +18% scale
const MAX_LIFT = 3; // px, center item lifts up slightly

export default function SkillsMarquee() {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  const trackRefs = useRef([]);
  const itemRefs = useRef(SKILL_ROWS.map(() => []));
  const offsetRef = useRef(SKILL_ROWS.map(() => 0));
  const currentSpeedRef = useRef(NORMAL_SPEED);
  const hoverRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const target = hoverRef.current ? SLOW_SPEED : NORMAL_SPEED;
      currentSpeedRef.current += (target - currentSpeedRef.current) * EASE;
      const speed = currentSpeedRef.current;
      const containerWidth = window.innerWidth;
      const center = containerWidth / 2;

      SKILL_ROWS.forEach((_, rowIndex) => {
        const dir = rowIndex % 2 === 0 ? -1 : 1; // even rows: left, odd rows: right
        offsetRef.current[rowIndex] += dir * speed;

        // normalize into (-SET_WIDTH, 0] so the loop is seamless regardless
        // of which direction this row moves, and so the float never grows
        // unbounded over a long session
        let m = offsetRef.current[rowIndex] % SET_WIDTH;
        if (m > 0) m -= SET_WIDTH;
        offsetRef.current[rowIndex] = m;

        const track = trackRefs.current[rowIndex];
        if (track) track.style.transform = `translate3d(${m}px,0,0)`;

        // per-item curve/scale effect based on live position relative to
        // the row's horizontal center
        const items = itemRefs.current[rowIndex];
        items.forEach((el, i) => {
          if (!el) return;
          const copyIndex = Math.floor(i / 10);
          const subIndex = i % 10;
          const itemCenter = m + copyIndex * STRIP_STEP + STRIP_PADDING + subIndex * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
          const distance = Math.abs(itemCenter - center);
          const t = Math.max(0, 1 - distance / CURVE_RADIUS);
          const eased = t * t * (3 - 2 * t); // smoothstep
          const scale = 1 + eased * MAX_SCALE_BOOST;
          const lift = eased * MAX_LIFT;
          el.style.transform = `translateY(${-lift}px) scale(${scale})`;
          el.style.zIndex = String(Math.round(eased * 10));
        });
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="skills-section" id="skills" ref={sectionRef}>
      <div className="skills-header">
        <span className="skills-eyebrow">SKILLS &amp; TOOLS</span>
        <h2 className="skills-title">
          What I <span className="skills-title-accent">work with</span>
        </h2>
        <p className="skills-sub">
          50 tools and technologies across full-stack development, AI integration,
          and creative work. Hover to slow down and take a closer look.
        </p>
      </div>

      <div
        className="marquee-rows"
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
      >
        {SKILL_ROWS.map((row, rowIndex) => (
          <div className="marquee-row" key={rowIndex} ref={(el) => (rowRefs.current[rowIndex] = el)}>
            <div className="marquee-track" ref={(el) => (trackRefs.current[rowIndex] = el)}>
              {Array.from({ length: COPIES }).map((_, copyIndex) => (
                <div className="skill-strip" key={copyIndex}>
                  {row.map(({ name, icon: Icon, color }, i) => {
                    const globalIndex = copyIndex * row.length + i;
                    return (
                      <div
                        className="skill-item"
                        key={name}
                        ref={(el) => (itemRefs.current[rowIndex][globalIndex] = el)}
                      >
                        <div className="skill-item-inner">
                          <span className="skill-icon" style={{ color }}>
                            <Icon size={20} />
                          </span>
                          <span className="skill-name">{name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
