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

export default function SkillsMarquee() {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  const trackRefs = useRef([]);
  const itemRefs = useRef(SKILL_ROWS.map(() => []));
  const offsetRef = useRef(SKILL_ROWS.map(() => 0));
  const currentSpeedRef = useRef(NORMAL_SPEED);
  const hoverRef = useRef(false);
  const rafRef = useRef(null);

  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animStatesRef = useRef(
    SKILL_ROWS.map(() =>
      Array.from({ length: 30 }, () => ({
        scale: 1,
        lift: 0,
        tiltX: 0,
        tiltY: 0,
        influence: 0,
      }))
    )
  );

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

        const rowEl = rowRefs.current[rowIndex];
        let rowCenterY = 0;
        let rowLeft = 0;
        if (rowEl) {
          const rect = rowEl.getBoundingClientRect();
          rowCenterY = rect.top + rect.height / 2;
          rowLeft = rect.left;
        }

        // per-item curve/scale effect based on live position relative to
        // the row's horizontal center + cursor attraction proximity
        const items = itemRefs.current[rowIndex];
        items.forEach((el, i) => {
          if (!el) return;
          const copyIndex = Math.floor(i / 10);
          const subIndex = i % 10;

          const relativeX = m + copyIndex * STRIP_STEP + STRIP_PADDING + subIndex * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
          const itemCenterX = rowLeft + relativeX;
          const itemCenterY = rowCenterY;

          // Scroll center effect calculation
          const centerDistance = Math.abs(relativeX - center);
          const centerT = Math.max(0, 1 - centerDistance / CURVE_RADIUS);
          const centerInfluence = centerT * centerT * (3 - 2 * centerT);

          // Cursor proximity calculation
          let influence = 0;
          let dx = 0;
          let dy = 0;
          let dist = 0;
          if (mouseRef.current.active) {
            dx = mouseRef.current.x - itemCenterX;
            dy = mouseRef.current.y - itemCenterY;
            dist = Math.sqrt(dx * dx + dy * dy);
            const attractionRadius = 220;
            if (dist < attractionRadius) {
              const progress = 1 - dist / attractionRadius;
              influence = progress * progress * (3 - 2 * progress); // smoothstep
            }
          }

          // Target values
          const targetScale = (1.0 + centerInfluence * 0.08) * (1.0 + influence * 0.22);
          const targetLift = (centerInfluence * 2) + (influence * 12);

          let targetTiltX = 0;
          let targetTiltY = 0;
          if (influence > 0 && dist > 0) {
            targetTiltX = (dy / dist) * 12 * influence;
            targetTiltY = (dx / dist) * -12 * influence;
          }

          // LERP dynamics
          if (!animStatesRef.current[rowIndex][i]) {
            animStatesRef.current[rowIndex][i] = { scale: 1, lift: 0, tiltX: 0, tiltY: 0, influence: 0 };
          }
          const animState = animStatesRef.current[rowIndex][i];
          animState.scale += (targetScale - animState.scale) * 0.12;
          animState.lift += (targetLift - animState.lift) * 0.12;
          animState.tiltX += (targetTiltX - animState.tiltX) * 0.12;
          animState.tiltY += (targetTiltY - animState.tiltY) * 0.12;
          animState.influence += (influence - animState.influence) * 0.12;

          // Apply styles
          el.style.transform = `translate3d(0, ${-animState.lift}px, 0) scale(${animState.scale}) rotateX(${animState.tiltX}deg) rotateY(${animState.tiltY}deg)`;
          el.style.borderColor = `rgba(37, 99, 235, ${0.05 + animState.influence * 0.4})`;
          el.style.boxShadow = `0 ${3 + animState.influence * 8}px ${12 + animState.influence * 16}px rgba(37, 99, 235, ${0.02 + animState.influence * 0.12})`;
          el.style.zIndex = String(Math.round(10 + animState.influence * 20));
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
        onMouseEnter={() => {
          hoverRef.current = true;
          mouseRef.current.active = true;
        }}
        onMouseMove={(e) => {
          mouseRef.current.x = e.clientX;
          mouseRef.current.y = e.clientY;
          mouseRef.current.active = true;
        }}
        onMouseLeave={() => {
          hoverRef.current = false;
          mouseRef.current.active = false;
          mouseRef.current.x = -1000;
          mouseRef.current.y = -1000;
        }}
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
