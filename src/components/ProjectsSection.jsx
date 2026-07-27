import { useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard';
import { PROJECTS_DATA } from './projectsData';
import useScrollTimeline from '../hooks/useScrollTimeline';
import './ProjectsSection.css';

// Helper to calculate coordinates along a rounded rectangle perimeter
function getRoundedRectPoint(w, h, r, t) {
  const L_top = w - 2 * r;
  const L_right = h - 2 * r;
  const L_bottom = w - 2 * r;
  const L_left = h - 2 * r;
  const Arc = (Math.PI * r) / 2;
  
  const P = L_top + Arc + L_right + Arc + L_bottom + Arc + L_left + Arc;
  let s = t * P;
  
  // 1. Top edge
  if (s < L_top) {
    return { x: r + s, y: 0 };
  }
  s -= L_top;
  
  // 2. Top-Right Arc
  if (s < Arc) {
    const theta = (s / Arc) * (Math.PI / 2);
    return { x: w - r + r * Math.sin(theta), y: r - r * Math.cos(theta) };
  }
  s -= Arc;
  
  // 3. Right edge
  if (s < L_right) {
    return { x: w, y: r + s };
  }
  s -= L_right;
  
  // 4. Bottom-Right Arc
  if (s < Arc) {
    const theta = (s / Arc) * (Math.PI / 2);
    return { x: w - r + r * Math.cos(theta), y: h - r + r * Math.sin(theta) };
  }
  s -= Arc;
  
  // 5. Bottom edge
  if (s < L_bottom) {
    return { x: w - r - s, y: h };
  }
  s -= L_bottom;
  
  // 6. Bottom-Left Arc
  if (s < Arc) {
    const theta = (s / Arc) * (Math.PI / 2);
    return { x: r - r * Math.sin(theta), y: h - r + r * Math.cos(theta) };
  }
  s -= Arc;
  
  // 7. Left edge
  if (s < L_left) {
    return { x: 0, y: h - r - s };
  }
  s -= L_left;
  
  // 8. Top-Left Arc
  const theta = (s / Arc) * (Math.PI / 2);
  return { x: r - r * Math.cos(theta), y: r - r * Math.sin(theta) };
}

export default function ProjectsSection() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);

  const { currentProject, nextProject, localProgress, globalProgress } = useScrollTimeline(
    wrapperRef,
    PROJECTS_DATA.length
  );

  // Sync scroll progress to a ref to prevent effect re-running during scrolls
  const progressRef = useRef(globalProgress);
  const currentProjectRef = useRef(currentProject);
  const localProgressRef = useRef(localProgress);
  
  useEffect(() => {
    progressRef.current = globalProgress;
  }, [globalProgress]);

  useEffect(() => {
    currentProjectRef.current = currentProject;
  }, [currentProject]);

  useEffect(() => {
    localProgressRef.current = localProgress;
  }, [localProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let particles = [];
    const particleCount = 280;

    // Colors matching requirements: White, Cyan, Blue, Purple
    const colorKeys = ['white', 'cyan', 'blue', 'purple'];
    const colors = {
      white: 'rgba(255, 255, 255, 1)',
      cyan: 'rgba(34, 211, 238, 1)',
      blue: 'rgba(59, 130, 246, 1)',
      purple: 'rgba(168, 85, 247, 1)'
    };

    // Pre-render radial glow sprites on offscreen canvases
    const spriteSize = 16;
    const sprites = {};
    colorKeys.forEach((colorName) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = spriteSize;
      offscreen.height = spriteSize;
      const offCtx = offscreen.getContext('2d');
      const grad = offCtx.createRadialGradient(
        spriteSize / 2, spriteSize / 2, 0,
        spriteSize / 2, spriteSize / 2, spriteSize / 2
      );
      grad.addColorStop(0, colors[colorName]);
      grad.addColorStop(0.2, colors[colorName]);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, spriteSize, spriteSize);
      sprites[colorName] = offscreen;
    });

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const isBorder = i < 180;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: isBorder ? (1.5 + Math.random() * 1.5) : (1.0 + Math.random() * 1.5),
        color: colorKeys[Math.floor(Math.random() * colorKeys.length)],
        opacity: isBorder ? (0.3 + Math.random() * 0.5) : (0.15 + Math.random() * 0.45),
        speed: 0.05 + Math.random() * 0.12,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: 0.005 + Math.random() * 0.012,
        dx: Math.random() > 0.5 ? 1 : -1,
        dy: Math.random() > 0.5 ? -1 : 1,
        isBorder,
        // Relative spacing parameter along rounded rect perimeter (0 to 1)
        t: isBorder ? (i / 180) : 0,
        // Relative spacing parameters for inner sparse coordinates (0 to 1)
        relX: !isBorder ? (0.05 + Math.random() * 0.90) : 0,
        relY: !isBorder ? (0.05 + Math.random() * 0.90) : 0,
        // Stiffness differentials: border particles have higher stiffness to arrive sooner
        stiffness: isBorder ? (0.048 + Math.random() * 0.02) : (0.016 + Math.random() * 0.012),
        damping: isBorder ? 0.84 : 0.88,
        targetX: 0,
        targetY: 0,
      });
    }

    const tick = () => {
      // Clear with transparent alpha
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const globalP = progressRef.current;
      const localP = localProgressRef.current;
      const curProj = currentProjectRef.current;
      const N = PROJECTS_DATA.length;

      // Determine general target state: float, outline card, or merge into bottom Experience node
      let targetState = 'float';
      if (globalP >= 0.05) {
        if (curProj === N - 1 && localP >= 0.75) {
          targetState = 'merge';
        } else {
          targetState = 'target';
        }
      }

      // Calculate scroll-driven opacities and translations
      let glassOpacity = 0;
      let particleOpacityMultiplier = 1.0;
      let cardTranslateX = 0;

      if (targetState === 'float') {
        glassOpacity = 0;
        particleOpacityMultiplier = 1.0;
        cardTranslateX = 0;
      } else if (targetState === 'target') {
        if (localP < 0.25) {
          // Materialize phase: card slides in from right, glass fades in, particles fade out
          const t = localP / 0.25;
          glassOpacity = Math.max(0.0, Math.min(1.0, (t - 0.5) * 2.0));
          particleOpacityMultiplier = 1.0 - glassOpacity;
          cardTranslateX = curProj === 0 ? 0 : (1.0 - t) * 400;
        } else if (localP <= 0.75) {
          // Active phase
          glassOpacity = 1.0;
          particleOpacityMultiplier = 0.0;
          cardTranslateX = 0;
        } else {
          // Dissolve exit phase: card slides out to left, glass fades out, particles fade in
          const t = (localP - 0.75) / 0.25;
          glassOpacity = 1.0 - Math.min(1.0, t * 2.0);
          particleOpacityMultiplier = 1.0 - glassOpacity;
          cardTranslateX = -t * 400;
        }
      } else if (targetState === 'merge') {
        // Final project dissolve to bottom center merge node
        const t = (localP - 0.75) / 0.25;
        glassOpacity = 1.0 - Math.min(1.0, t * 2.0);
        particleOpacityMultiplier = 1.0; // Keep particles fully visible for merge
        cardTranslateX = -t * 400;
      }

      // Modulate wrapper styles directly on the DOM node to bypass React render cycles
      if (cardRef.current) {
        cardRef.current.style.opacity = glassOpacity.toFixed(3);
        cardRef.current.style.transform = `translate3d(${cardTranslateX.toFixed(1)}px, 0, 0)`;
        cardRef.current.style.pointerEvents = glassOpacity >= 0.8 ? 'auto' : 'none';

        if (glassOpacity >= 1.0) {
          cardRef.current.classList.add('content-active');
        } else {
          cardRef.current.classList.remove('content-active');
        }
      }

      // Capture card boundaries relative to the canvas quad
      const cardEl = cardRef.current;
      let cardX = 0, cardY = 0, cardW = 0, cardH = 0;
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        cardX = cardRect.left - canvasRect.left;
        cardY = cardRect.top - canvasRect.top;
        cardW = cardRect.width;
        cardH = cardRect.height;
      }

      particles.forEach((p) => {
        if (targetState === 'merge') {
          // Final merge point: converge to bottom center of Projects canvas (Experienced node alignment)
          p.targetX = canvas.width / 2;
          p.targetY = canvas.height - 20;

          // Pull in with slightly boosted spring stiffness for sharp point convergence
          const forceX = (p.targetX - p.x) * (p.stiffness * 1.6);
          const forceY = (p.targetY - p.y) * (p.stiffness * 1.6);
          p.vx = (p.vx + forceX) * p.damping;
          p.vy = (p.vy + forceY) * p.damping;
          p.x += p.vx;
          p.y += p.vy;
        } else if (targetState === 'target' && cardEl) {
          // Calculate dynamic coordinate targets based on card wrapper location
          if (p.isBorder) {
            const pt = getRoundedRectPoint(cardW, cardH, 20, p.t);
            p.targetX = cardX + pt.x;
            p.targetY = cardY + pt.y;
          } else {
            p.targetX = cardX + p.relX * cardW;
            p.targetY = cardY + p.relY * cardH;
          }

          // Execute spring physics velocity systems
          const forceX = (p.targetX - p.x) * p.stiffness;
          const forceY = (p.targetY - p.y) * p.stiffness;
          p.vx = (p.vx + forceX) * p.damping;
          p.vy = (p.vy + forceY) * p.damping;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Decay drag velocity factors to transition back to floating cleanly
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.x += p.vx;
          p.y += p.vy;

          // Sine-wave drifting horizontal
          p.angle += p.angleSpeed;
          p.x += Math.sin(p.angle) * 0.12 * p.dx;
          
          // Very slow vertical float
          p.y += p.dy * p.speed;

          // Wrap around margins
          if (p.x < -p.size * 2) p.x = canvas.width + p.size * 2;
          if (p.x > canvas.width + p.size * 2) p.x = -p.size * 2;
          if (p.y < -p.size * 2) p.y = canvas.height + p.size * 2;
          if (p.y > canvas.height + p.size * 2) p.y = -p.size * 2;
        }

        // Render using pre-rendered radial glow sprite modulated by handoff progress
        ctx.globalAlpha = p.opacity * particleOpacityMultiplier;
        ctx.drawImage(
          sprites[p.color],
          p.x - p.size,
          p.y - p.size,
          p.size * 2,
          p.size * 2
        );
      });

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="projects-scroll-wrapper" ref={wrapperRef}>
      <section
        className="projects-section"
        id="projects"
        data-current-project={currentProject}
        data-next-project={nextProject ?? ''}
        data-local-progress={localProgress.toFixed(4)}
        data-global-progress={globalProgress.toFixed(4)}
      >
        {/* PARTICLE CANVAS */}
        <canvas ref={canvasRef} className="projects-bg-canvas" />

        {/* GLASS CONTAINER */}
        <div className="glass projects-container">
          {/* CONTENT LAYER */}
          <div className="projects-content">
            <div className="projects-header">
              <span className="projects-eyebrow">PORTFOLIO</span>
              <h2 className="projects-title">
                Featured <span className="projects-title-accent">Projects</span>
              </h2>
              <p className="projects-sub">
                A curated selection of intelligent systems, blockchain nodes, and visual media applications.
              </p>
            </div>

            <div className="projects-card-wrapper" ref={cardRef}>
              <ProjectCard project={PROJECTS_DATA[currentProject]} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
