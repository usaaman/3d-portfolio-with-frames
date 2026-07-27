import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Briefcase,
  Download,
  Mail,
  GraduationCap,
  Code2,
  Sparkles,
  BrainCircuit,
  Quote,
  Grid2x2,
  Shield,
  Globe,
  Gamepad2,
} from 'lucide-react';
import './HeroAboutScroll.css';
import SkillsMarquee from './SkillsMarquee';

// lucide-react dropped brand/logo icons — small inline SVGs instead
const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.61-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.51-1.11-1.51-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor" {...props}>
    <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.2 8.75h3.5V21H3.2V8.75zM9.6 8.75h3.36v1.68h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.35V21h-3.5v-6.35c0-1.52-.03-3.47-2.11-3.47-2.12 0-2.44 1.66-2.44 3.36V21H9.6V8.75z" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor" {...props}>
    <path d="M18.9 3h3.06l-6.69 7.65L23.2 21h-6.16l-4.83-6.32L6.66 21H3.6l7.15-8.18L2.8 3h6.32l4.37 5.78L18.9 3zm-1.08 16.2h1.7L7.9 4.7H6.08l11.74 14.5z" />
  </svg>
);

const FRAME_COUNT = 261;
const FRAME_PATH = (i) => `/frames/frame-${String(i).padStart(3, '0')}.webp`;

// Scroll animation frame thresholds:
// - Frame 70-81: Hero enters
// - Frame 81-92: Hero expands from squeezed state (startW/startH -> endW/endH)
// - Frame 92-100: Momentum Right (Translate X -> 18px, Rotate -> 3deg)
// - Frame 100-112: Curved Return to center with a 6px vertical dip arc
// - Frame 112-124: Left Overshoot (Translate X -> -5px, Rotate -> -1deg)
// - Frame 124-138: Settle back to center
// - Frame 138-164: Pause (stable Cover)
// - Frame 164-197: Continuous page transition (Hero slides out top, About enters bottom)

const GLANCE_ITEMS = [
  { icon: GraduationCap, tone: 'purple', title: '5th', subtitleTop: 'Semester', subtitleBottom: 'Software Engineering' },
  { icon: Code2, tone: 'cyan', title: '2+', subtitleTop: 'Full-Stack Projects', subtitleBottom: 'Built & Deployed' },
  { icon: Sparkles, tone: 'purple', title: 'Creative', subtitleTop: 'Video Editing', subtitleBottom: 'Graphic Design' },
  { icon: BrainCircuit, tone: 'cyan', title: 'AI Explorer', subtitleTop: 'AI Chat Systems', subtitleBottom: '& Integrations' },
];

const EXPLORE_ITEMS = [
  { icon: Shield, title: 'Cybersecurity', desc: 'Exploring security principles and building safer digital systems.' },
  { icon: Code2, title: 'Software Engineering', desc: 'Designing scalable solutions with clean and efficient code.' },
  { icon: Globe, title: 'Web Development', desc: 'Building responsive web apps with modern technologies.' },
  { icon: Gamepad2, title: 'Game Development', desc: 'Creating interactive experiences and immersive worlds.' },
  { icon: BrainCircuit, title: 'AI Applications', desc: 'Experimenting with AI-powered tools and intelligent applications.' },
];

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
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
  const [heroState, setHeroState] = useState({
    scrollY: 100, // off-screen bottom initially
    scale: 0.1,
    translateX: '50vw',
    translateY: '25vh',
    rotateX: 0,
    rotateY: 0,
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
    // (and therefore the character) must never be cut off, on any
    // viewport aspect ratio, and the canvas must always be fully covered
    // (no letterbox gaps).
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = cw - dw; // right-anchored
    const dy = 0; // top-anchored (crop from bottom instead of top)

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  const applyProgress = useCallback((progress) => {
    // 1. Map progress to frame (runs from 0.0 to 0.82)
    // Frame count should reach 261 at progress = 0.82
    const frameProgressLimit = 0.82;
    const frameProgress = Math.min(1.0, progress / frameProgressLimit);
    const frame = Math.min(
      FRAME_COUNT,
      Math.max(1, Math.round(frameProgress * (FRAME_COUNT - 1)) + 1)
    );
    if (frame !== currentFrameRef.current) {
      currentFrameRef.current = frame;
      drawFrame(frame);
    }

    // Hero Section Scroll Position (%)
    let heroY = 0;
    if (frame < 70) {
      heroY = 100;
    } else if (frame < 81) {
      heroY = 100 * (1 - smoothstep(70, 81, frame));
    } else if (frame < 164) {
      heroY = 0;
    } else if (frame < 197) {
      heroY = -100 * smoothstep(164, 197, frame);
    } else {
      heroY = -100;
    }

    // Hero Card entrance animations
    let cardScale = 1.0;
    let cardTranslateX = '0vw';
    let cardTranslateY = '0vh';
    let cardRotateX = 0.0;
    let cardRotateY = 0.0;

    if (frame < 77) {
      cardScale = 0.1;
      cardTranslateX = '50vw';
      cardTranslateY = '25vh';
      cardRotateX = 0.0;
      cardRotateY = 0.0;
    } else if (frame < 99) {
      // 77 -> 99: slide from bottom-right, scale from 10% to exactly 100%
      const t = (frame - 77) / (99 - 77);
      const eased = easeOutQuart(t);
      cardScale = 0.1 + 0.9 * eased;
      cardTranslateX = `${50 * (1 - eased)}vw`;
      cardTranslateY = `${25 * (1 - eased)}vh`;
      cardRotateX = 0.0;
      cardRotateY = 0.0;
    } else if (frame < 155) {
      // 99 -> 155: progressive 3D perspective Y-tilt (0deg to 4.0deg) and X-tilt (0deg to 1.3deg)
      const t = smoothstep(99, 155, frame);
      cardScale = 1.0;
      cardTranslateX = '0vw';
      cardTranslateY = '0vh';
      cardRotateX = 1.3 * t;
      cardRotateY = 4.0 * t;
    } else {
      cardScale = 1.0;
      cardTranslateX = '0vw';
      cardTranslateY = '0vh';
      cardRotateX = 1.3;
      cardRotateY = 4.0;
    }

    // About Section Scroll Position (%)
    let aboutY = 0;
    if (frame < 164) {
      aboutY = 100;
    } else if (frame < 197) {
      aboutY = 100 * (1 - smoothstep(164, 197, frame));
    } else {
      aboutY = 0;
    }

    // Skills Section Scroll Position (%) - only starts after all frames end (reaches 261)
    let skillsY = 100;
    if (progress > frameProgressLimit) {
      // Scale slide-in to run from progress 0.82 to 0.96
      const slideStart = 0.82;
      const slideEnd = 0.96;
      const t = Math.min(1.0, Math.max(0.0, (progress - slideStart) / (slideEnd - slideStart)));
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
    });

    setAboutState({
      scrollY: aboutY,
    });

    setSkillsState({
      scrollY: skillsY,
    });
  }, [drawFrame]);

  // scroll handling
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

  // canvas sizing & responsive animation recalculation
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

      // Trigger recalculation of dimensions on resize
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

  // draw first frame once ready
  useEffect(() => {
    if (ready) drawFrame(1);
  }, [ready, drawFrame]);

  // subtle 3D pointer tilt on hero card (relative to 0deg base)
  const handleHeroMove = (e) => {
    const card = heroCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-x', `${py * -5}deg`);
    card.style.setProperty('--tilt-y', `${px * 5}deg`);
  };
  const handleHeroLeave = () => {
    const card = heroCardRef.current;
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };

  const loadPct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <div className="scroll-wrapper" ref={wrapperRef} id="home">
      {!ready && (
        <div className="frame-loader">
          <div className="loader-mark">MU</div>
          <div className="loader-bar">
            <div className="loader-fill" style={{ width: `${loadPct}%` }} />
          </div>
          <div className="loader-pct eyebrow">Loading scene — {loadPct}%</div>
        </div>
      )}

      <div className="sticky-stage">
        <canvas ref={canvasRef} className="scene-canvas" />
        <div className="scene-vignette" />

        {/* HERO CONTENT */}
        <div
          className="stage-content hero-content"
          style={{
            transform: `translate3d(0, ${heroState.scrollY}%, 0)`,
            pointerEvents: (Math.abs(heroState.scrollY) < 10) ? 'auto' : 'none',
          }}
        >
          <div
            className="glass hero-card"
            ref={heroCardRef}
            style={{
              transform: `perspective(1100px) rotateX(var(--tilt-x, 0deg)) rotateX(${heroState.rotateX}deg) rotateY(var(--tilt-y, 0deg)) rotateY(${heroState.rotateY}deg) translate3d(${heroState.translateX}, ${heroState.translateY}, 0) scale(${heroState.scale})`,
            }}
            onMouseMove={handleHeroMove}
            onMouseLeave={handleHeroLeave}
          >
            <div className="hero-glow" />
            <p className="hero-greet">Hi, I'm</p>
            <h1 className="hero-name">Muhammad Usman</h1>
            <p className="hero-role">
              Full-Stack Developer | AI Integration Specialist | Video Editor
            </p>
            <div className="hero-divider" />
            <p className="hero-desc">
              I build intelligent web applications and craft engaging visual stories —
              turning ideas into functional, beautiful digital products.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn-primary">
                <Briefcase size={16} strokeWidth={2} />
                View My Work
              </a>
              <a href="/resume.pdf" download className="btn-ghost">
                <Download size={16} strokeWidth={2} />
                Download Resume
              </a>
            </div>
            <div className="hero-socials">
              <a href="#" aria-label="GitHub" className="social-btn"><GithubIcon size={17} /></a>
              <a href="#" aria-label="LinkedIn" className="social-btn"><LinkedinIcon size={17} /></a>
              <a href="#" aria-label="Twitter" className="social-btn"><TwitterIcon size={17} /></a>
              <a href="#" aria-label="Email" className="social-btn"><Mail size={17} strokeWidth={1.8} /></a>
            </div>
          </div>
        </div>

        {/* ABOUT CONTENT */}
        <div
          className="stage-content about-content"
          id="about"
          style={{
            transform: `translate3d(0, ${aboutState.scrollY}%, 0)`,
            pointerEvents: (Math.abs(aboutState.scrollY) < 10) ? 'auto' : 'none',
          }}
        >
          <div className="about-wrap">
            <div className="glass about-main">
              <div className="about-left">
                <span className="pill-badge">
                  <Grid2x2 size={13} strokeWidth={2} />
                  ABOUT ME
                </span>
                <h2 className="about-title">
                  Curious mind,<br />
                  <span className="about-title-accent">creative hands</span>
                </h2>
                <p className="about-text">
                  I'm Muhammad Usman, a Software Engineering student at Capital University
                  of Science &amp; Technology, Islamabad, currently in my{' '}
                  <span className="highlight">5th semester</span>.
                </p>
                <p className="about-text">
                  My journey started with a passion for video editing and visual
                  storytelling, which naturally evolved into web development and AI
                  integration. Today, I build full-stack applications with React and
                  Firebase, experiment with AI-powered chat systems, and still keep my
                  creative side alive through video editing and graphic design.
                </p>
                <div className="quote-box">
                  <Quote size={16} strokeWidth={2} className="quote-icon" />
                  <p>
                    I love solving real-world problems — whether that's through clean
                    code or a well-cut video.
                  </p>
                </div>
              </div>

              <div className="about-right">
                <span className="glance-title">At a Glance</span>
                <div className="glass glance-card-container">
                  {GLANCE_ITEMS.map(({ icon: Icon, tone, title, subtitleTop, subtitleBottom }) => (
                    <div className="glance-card" key={title}>
                      <span className={`glance-icon tone-${tone}`}>
                        <Icon size={16} strokeWidth={2} />
                      </span>
                      <div className="glance-copy">
                        <span className="glance-num">{title}</span>
                        <span className="glance-sub">{subtitleTop}</span>
                        <span className="glance-sub muted">{subtitleBottom}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass explore-strip">
              <div className="explore-grid">
                {EXPLORE_ITEMS.map(({ icon: Icon, title }) => (
                  <div className="explore-card" key={title}>
                    <span className="explore-icon">
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <h3>{title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS CONTENT */}
        <div
          className="stage-content skills-stage-content"
          style={{
            transform: `translate3d(0, ${skillsState.scrollY}%, 0)`,
            pointerEvents: (Math.abs(skillsState.scrollY) < 10) ? 'auto' : 'none',
          }}
        >
          <SkillsMarquee />
        </div>

        <div className="scroll-cue" style={{ opacity: heroState.scrollY === 0 ? 1 : 0, pointerEvents: 'none' }}>
          <span>scroll</span>
          <div className="scroll-cue-line" />
        </div>
      </div>
    </div>
  );
}
