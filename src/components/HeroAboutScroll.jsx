import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Briefcase,
  Download,
  Mail,
} from 'lucide-react';
import About from './About';
import { GLANCE_ITEMS, EXPLORE_ITEMS } from './aboutData';
import './HeroAboutScroll.css';
import SkillsMarquee from './SkillsMarquee';
import KineticGrid from './KineticGrid';
import GlowLayer from './GlowLayer';
import ReflectionOverlay from './ReflectionOverlay';
import DepthTypography from './DepthTypography';

// lucide-react dropped brand/logo icons — small inline SVGs instead
const GithubIcon = (props) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.61-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.51-1.11-1.51-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor" {...props}>
    <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.2 8.75h3.5V21H3.2V8.75zM9.6 8.75h3.36v1.68h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.35V21h-3.5v-6.35c0-1.52-.03-3.47-2.11-3.47-2.12 0-2.44 1.66-2.44 3.36V21H9.6V8.75z" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor" {...props}>
    <path d="M18.9 3h3.06l-6.69 7.65L23.2 21h-6.16l-4.83-6.32L6.66 21H3.6l7.15-8.18L2.8 3h6.32l4.37 5.78L18.9 3zm-1.08 16.2h1.7L7.9 4.7H6.08l11.74 14.5z" />
  </svg>
);

// Scroll animation frame thresholds:
// - Frame 70-81: Hero enters
// - Frame 81-92: Hero expands from squeezed state (startW/startH -> endW/endH)
// - Frame 92-100: Momentum Right (Translate X -> 18px, Rotate -> 3deg)
// - Frame 100-112: Curved Return to center with a 6px vertical dip arc
// - Frame 112-124: Left Overshoot (Translate X -> -5px, Rotate -> -1deg)
// - Frame 124-138: Settle back to center
// - Frame 138-164: Pause (stable Cover)
// - Frame 164-197: Continuous page transition (Hero slides out top, About enters bottom)





// ==========================================
// ARCHITECTURE CONSTANTS & CONFIGURATION
// ==========================================
const FRAME_COUNT = 261;
const STATIC_REDUCED_MOTION_FRAME = 138;

// Scroll Cue frame thresholds
const SCROLL_CUE_START_FRAME = 81;
const SCROLL_CUE_END_FRAME = 130;

// Character composition constants
const COMPOSITION_BREAKPOINT_TABLET = 768; // CSS pixels
const COMPOSITION_TARGET_DESKTOP = 0.75; // Align character center to 75% width
const COMPOSITION_TARGET_MOBILE = 0.70;  // Align character center to 70% width
const CHARACTER_SOURCE_CENTER_RATIO = 0.75; // Character visual center in source assets

// Entrance and Perspective Rotation ranges
const HERO_ENTRANCE_START_FRAME = 70;
const HERO_CARD_ENTRANCE_START = 77;
const HERO_CARD_ENTRANCE_END = 99;
const HERO_CARD_ROTATION_START = 99;
const HERO_CARD_ROTATION_END = 155;

const MAX_ROTATION_X = 1.3; // max card rotation degrees
const MAX_ROTATION_Y = 4.0; // max card rotation degrees
const MOUSE_TILT_MAX_DEGREES = 5; // max mouse-driven card rotation tilt

// Transition frame and progress ranges
const HERO_TRANSITION_OUT_START = 164;
const HERO_TRANSITION_OUT_END = 197;
const SKILLS_TRANSITION_IN_PROGRESS = 0.82;
const SKILLS_TRANSITION_END_PROGRESS = 0.96;

const FRAME_PATH = (i) => `/frames/frame-${String(i).padStart(3, '0')}.webp`;

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Calculates character composition coordinates and dimensions to center the character
 * nicely relative to viewport parameters, keeping visual balance on mobile, tablet, and desktop
 * while ensuring complete canvas coverage (no letterbox gaps).
 *
 * @param {number} cw - Canvas width in physical pixels
 * @param {number} ch - Canvas height in physical pixels
 * @param {number} iw - Image natural width
 * @param {number} ih - Image natural height
 * @param {number} dpr - Device Pixel Ratio
 * @returns {{dx: number, dy: number, dw: number, dh: number}}
 */
function getCharacterComposition(cw, ch, iw, ih, dpr) {
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;

  // targetRatio is 75% on tablet/desktop, 70% on mobile to optimize eye-flow.
  const targetRatio = cw > COMPOSITION_BREAKPOINT_TABLET * dpr ? COMPOSITION_TARGET_DESKTOP : COMPOSITION_TARGET_MOBILE;
  const targetX = targetRatio * cw;

  // Base alignment is right-anchored
  let dx = cw - dw;
  if (cw / iw < ch / ih) {
    // On narrow/portrait viewports, align character visual center with targetX
    // while clamping dx inside [cw - dw, 0] to ensure canvas remains fully covered.
    const preferredDx = targetX - CHARACTER_SOURCE_CENTER_RATIO * dw;
    dx = Math.min(0, Math.max(cw - dw, preferredDx));
  }

  const dy = 0; // top-anchored (crop bottom)

  return { dx, dy, dw, dh };
}

export default function HeroAboutScroll() {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(1);
  const rafRef = useRef(null);
  const heroCardRef = useRef(null);

  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const [heroState, setHeroState] = useState({
    scrollY: 100, // off-screen bottom initially
    scale: 0.1,
    translateX: '50vw',
    translateY: '25vh',
    rotateX: 0,
    rotateY: 0,
    showCue: false,
  });
  const [aboutState, setAboutState] = useState({
    scrollY: 100, // off-screen bottom initially
  });
  const [skillsState, setSkillsState] = useState({
    scrollY: 100, // off-screen bottom initially
  });

  // preload all frames
  useEffect(() => {
    let cancelled = false;
    let count = 0;
    const imgs = new Array(FRAME_COUNT + 1);

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = img.onerror = () => {
        count += 1;
        if (!cancelled) setLoaded(count);
        if (count === FRAME_COUNT && !cancelled) setReady(true);
      };
      imgs[i] = img;
    }
    imagesRef.current = imgs;

    return () => {
      cancelled = true;
    };
  }, []);

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[frameIndex];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover-fit, but anchored to the RIGHT edge instead of centered.
    // The character always sits on the right side of every source frame,
    // so any horizontal crop must eat from the left — the right edge
    const dpr = window.devicePixelRatio || 1;

    const { dx, dy, dw, dh } = getCharacterComposition(cw, ch, iw, ih, dpr);

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  const applyProgress = useCallback((progress) => {
    if (reducedMotion) {
      if (currentFrameRef.current !== STATIC_REDUCED_MOTION_FRAME) {
        currentFrameRef.current = STATIC_REDUCED_MOTION_FRAME;
        drawFrame(STATIC_REDUCED_MOTION_FRAME);
      }
      setHeroState({
        scrollY: 0,
        scale: 1.0,
        translateX: '0vw',
        translateY: '0vh',
        rotateX: 0.0,
        rotateY: 0.0,
        showCue: false,
      });
      setAboutState({
        scrollY: 0,
      });
      setSkillsState({
        scrollY: 0,
      });
      return;
    }

    const frameProgress = Math.min(1.0, progress / SKILLS_TRANSITION_IN_PROGRESS);
    const frame = Math.min(
      FRAME_COUNT,
      Math.max(1, Math.round(frameProgress * (FRAME_COUNT - 1)) + 1)
    );
    if (frame !== currentFrameRef.current) {
      currentFrameRef.current = frame;
      drawFrame(frame);
    }

    let heroY = 0;
    if (frame < HERO_ENTRANCE_START_FRAME) {
      heroY = 100;
    } else if (frame < SCROLL_CUE_START_FRAME) {
      heroY = 100 * (1 - smoothstep(HERO_ENTRANCE_START_FRAME, SCROLL_CUE_START_FRAME, frame));
    } else if (frame < HERO_TRANSITION_OUT_START) {
      heroY = 0;
    } else if (frame < HERO_TRANSITION_OUT_END) {
      heroY = -100 * smoothstep(HERO_TRANSITION_OUT_START, HERO_TRANSITION_OUT_END, frame);
    } else {
      heroY = -100;
    }

    let cardScale = 1.0;
    let cardTranslateX = '0vw';
    let cardTranslateY = '0vh';
    let cardRotateX = 0.0;
    let cardRotateY = 0.0;

    if (frame < HERO_CARD_ENTRANCE_START) {
      cardScale = 0.1;
      cardTranslateX = '50vw';
      cardTranslateY = '25vh';
      cardRotateX = 0.0;
      cardRotateY = 0.0;
    } else if (frame < HERO_CARD_ENTRANCE_END) {
      const t = (frame - HERO_CARD_ENTRANCE_START) / (HERO_CARD_ENTRANCE_END - HERO_CARD_ENTRANCE_START);
      const eased = easeOutQuart(t);
      cardScale = 0.1 + 0.9 * eased;
      cardTranslateX = `${50 * (1 - eased)}vw`;
      cardTranslateY = `${25 * (1 - eased)}vh`;
      cardRotateX = 0.0;
      cardRotateY = 0.0;
    } else if (frame < HERO_CARD_ROTATION_END) {
      const t = smoothstep(HERO_CARD_ROTATION_START, HERO_CARD_ROTATION_END, frame);
      cardScale = 1.0;
      cardTranslateX = '0vw';
      cardTranslateY = '0vh';
      cardRotateX = MAX_ROTATION_X * t;
      cardRotateY = MAX_ROTATION_Y * t;
    } else {
      cardScale = 1.0;
      cardTranslateX = '0vw';
      cardTranslateY = '0vh';
      cardRotateX = MAX_ROTATION_X;
      cardRotateY = MAX_ROTATION_Y;
    }

    let aboutY = 0;
    if (frame < HERO_TRANSITION_OUT_START) {
      aboutY = 100;
    } else if (frame < HERO_TRANSITION_OUT_END) {
      aboutY = 100 * (1 - smoothstep(HERO_TRANSITION_OUT_START, HERO_TRANSITION_OUT_END, frame));
    } else {
      aboutY = 0;
    }

    let skillsY = 100;
    if (progress > SKILLS_TRANSITION_IN_PROGRESS) {
      const t = Math.min(1.0, Math.max(0.0, (progress - SKILLS_TRANSITION_IN_PROGRESS) / (SKILLS_TRANSITION_END_PROGRESS - SKILLS_TRANSITION_IN_PROGRESS)));
      const eased = smoothstep(0.0, 1.0, t);
      skillsY = 100 * (1 - eased);
    } else {
      skillsY = 100;
    }

    setHeroState({
      scrollY: heroY,
      scale: cardScale,
      translateX: cardTranslateX,
      translateY: cardTranslateY,
      rotateX: cardRotateX,
      rotateY: cardRotateY,
      showCue: frame >= SCROLL_CUE_START_FRAME && frame < SCROLL_CUE_END_FRAME,
    });

    setAboutState({
      scrollY: aboutY,
    });

    setSkillsState({
      scrollY: skillsY,
    });
  }, [drawFrame, reducedMotion]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const total = wrapper.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
        applyProgress(progress);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [applyProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      drawFrame(currentFrameRef.current);

      const wrapper = wrapperRef.current;
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        const total = wrapper.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
        applyProgress(progress);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawFrame, ready, applyProgress]);

  useEffect(() => {
    if (ready) drawFrame(1);
  }, [ready, drawFrame]);

  const handleHeroMove = (e) => {
    if (reducedMotion) return;
    const card = heroCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-x', `${py * -MOUSE_TILT_MAX_DEGREES}deg`);
    card.style.setProperty('--tilt-y', `${px * MOUSE_TILT_MAX_DEGREES}deg`);
  };
  const handleHeroLeave = () => {
    const card = heroCardRef.current;
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };

  const loadPct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <section className={`scroll-wrapper ${reducedMotion ? 'prefers-reduced-motion' : ''}`} ref={wrapperRef} id="home" aria-label="Hero and Biography">
      {!ready && (
        <div className="frame-loader" aria-live="polite" aria-busy="true">
          <div className="loader-mark">MU</div>
          <div className="loader-bar">
            <div className="loader-fill" style={{ width: `${loadPct}%` }} />
          </div>
          <div className="loader-pct eyebrow">Loading scene — {loadPct}%</div>
        </div>
      )}

      <div className="sticky-stage">
        <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" />
        <DepthTypography text="USMAN" className="depth-bg-text" aria-hidden="true" />
        <div className="scene-vignette" aria-hidden="true" />

        {/* HERO CONTENT */}
        <div
          role="region"
          aria-label="Hero Introduction"
          className="stage-content hero-content"
          style={{
            transform: `translate3d(0, ${heroState.scrollY}%, 0)`,
            pointerEvents: (Math.abs(heroState.scrollY) < 10) ? 'auto' : 'none',
          }}
        >
          {/* Reusable GlowLayer positioned behind the Hero card */}
          <div
            className="hero-glow-container"
            style={{
              transform: `translate3d(${heroState.translateX}, ${heroState.translateY}, 0) scale(${heroState.scale})`,
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            aria-hidden="true"
          >
            <GlowLayer className="hero-card-glow" />
          </div>

          <div
            className="glass hero-card"
            ref={heroCardRef}
            style={{
              transform: `perspective(1100px) rotateX(var(--tilt-x, 0deg)) rotateX(${heroState.rotateX}deg) rotateY(var(--tilt-y, 0deg)) rotateY(${heroState.rotateY}deg) translate3d(${heroState.translateX}, ${heroState.translateY}, 0) scale(${heroState.scale})`,
            }}
            onMouseMove={handleHeroMove}
            onMouseLeave={handleHeroLeave}
          >
            <ReflectionOverlay delay={1.5} aria-hidden="true" />
            <div className="hero-glow" aria-hidden="true" />
            <p className="hero-greet">Hi, I'm</p>
            <h1 className="hero-name">Muhammad Usman</h1>
            <p className="hero-role">
              Full-Stack Developer | AI Integration Specialist | Video Editor
            </p>
            <div className="hero-divider" aria-hidden="true" />
            <p className="hero-desc">
              I build intelligent web applications and craft engaging visual stories —
              turning ideas into functional, beautiful digital products.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn-primary" aria-label="View Muhammad Usman's portfolio work">
                <Briefcase size={16} strokeWidth={2} aria-hidden="true" />
                View My Work
              </a>
              <a href="/resume.pdf" download className="btn-ghost" aria-label="Download Muhammad Usman's PDF resume">
                <Download size={16} strokeWidth={2} aria-hidden="true" />
                Download Resume
              </a>
            </div>
            <div className="hero-socials">
              <a href="#" aria-label="GitHub Profile" className="social-btn"><GithubIcon size={17} /></a>
              <a href="#" aria-label="LinkedIn Profile" className="social-btn"><LinkedinIcon size={17} /></a>
              <a href="#" aria-label="Twitter Profile" className="social-btn"><TwitterIcon size={17} /></a>
              <a href="#" aria-label="Send Email" className="social-btn"><Mail size={17} strokeWidth={1.8} aria-hidden="true" /></a>
            </div>
          </div>
        </div>

        {/* ABOUT CONTENT */}
        <About
          style={{
            transform: `translate3d(0, ${aboutState.scrollY}%, 0)`,
            pointerEvents: (Math.abs(aboutState.scrollY) < 10) ? 'auto' : 'none',
          }}
          glanceItems={GLANCE_ITEMS}
          exploreItems={EXPLORE_ITEMS}
        />

        {/* SKILLS CONTENT */}
        <section
          className="stage-content skills-stage-content"
          aria-label="Skills Overview"
          style={{
            transform: `translate3d(0, ${skillsState.scrollY}%, 0)`,
            pointerEvents: (Math.abs(skillsState.scrollY) < 10) ? 'auto' : 'none',
          }}
        >
          <KineticGrid
            isStatic={reducedMotion}
            dotColor="rgba(255, 255, 255, 0.12)"
            lineColor="rgba(79, 140, 255, 0.08)"
            trailColor="rgba(101, 214, 255, 0.25)"
            spacing={40}
            radius={200}
            style={{ zIndex: 1 }}
          />
          <SkillsMarquee />
        </section>

        <div className="scroll-cue" style={{ opacity: (!reducedMotion && heroState.showCue) ? 1 : 0, pointerEvents: 'none' }} aria-hidden="true">
          <span>scroll</span>
          <div className="scroll-cue-line" />
        </div>
      </div>
    </section>
  );
}
