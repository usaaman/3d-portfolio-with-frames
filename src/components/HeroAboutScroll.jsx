import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Briefcase,
  Download,
  Mail,
} from 'lucide-react';
import About from './About';
import Skills from './Skills';
import './HeroAboutScroll.css';
import GlowLayer from './GlowLayer';
import ReflectionOverlay from './ReflectionOverlay';
import DepthTypography from './DepthTypography';
import { trackResumeDownload } from '../utils/analytics';
import RevealHeading from './RevealHeading';
import TypewriterText from './TypewriterText';

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

// Scroll animation progress thresholds (normalized 0.0 - 1.0):
const HERO_CARD_ENTRANCE_START_PROGRESS = 0.14;
const HERO_CARD_ENTRANCE_END_PROGRESS = 0.20;
const HERO_CARD_ROTATION_START_PROGRESS = 0.28;
const HERO_CARD_ROTATION_END_PROGRESS = 0.48;
const HERO_TRANSITION_OUT_START_PROGRESS = 0.48;
const HERO_TRANSITION_OUT_END_PROGRESS = 0.60;

const MAX_ROTATION_X = 3.5;  // noticeable tilt degrees
const MAX_ROTATION_Y = 12.0; // noticeable right-side tilt degrees
const MOUSE_TILT_MAX_DEGREES = 5; // max mouse-driven card rotation tilt

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function HeroAboutScroll({ hero, about, resume, skills }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const heroCardRef = useRef(null);

  // High-performance DOM refs for direct style animation on scroll
  const heroContentRef = useRef(null);
  const heroGlowRef = useRef(null);
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const scrollCueRef = useRef(null);

  const [unfoldProgress, setUnfoldProgress] = useState(0);

  // Cloud layer DOM refs
  const cloudLeftRef = useRef(null);
  const cloudRightRef = useRef(null);
  const cloudTopRef = useRef(null);

  // Welcome To My Space Intro Text DOM refs
  const welcomeTextRef = useRef(null);
  const welcomeLine1Ref = useRef(null);
  const welcomeLine2Ref = useRef(null);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const applyProgress = useCallback((progress) => {
    // Video background stays 100% visible on its last frame (holding 0.08s before end to prevent HTML5 black end-frame)
    if (videoRef.current && Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
      videoRef.current.style.opacity = '1';
      const videoProg = Math.min(1.0, progress / 0.70);
      const maxTime = Math.max(0, videoRef.current.duration - 0.08);
      const targetTime = Math.min(maxTime, videoProg * videoRef.current.duration);
      if (Number.isFinite(targetTime) && Math.abs(videoRef.current.currentTime - targetTime) > 0.01) {
        try {
          videoRef.current.currentTime = targetTime;
        } catch (e) {
          // ignore seek error while buffer loading
        }
      }
    }

    if (reducedMotion) {
      if (cloudLeftRef.current) cloudLeftRef.current.style.opacity = '0';
      if (cloudRightRef.current) cloudRightRef.current.style.opacity = '0';
      if (cloudTopRef.current) cloudTopRef.current.style.opacity = '0';
      if (welcomeTextRef.current) welcomeTextRef.current.style.opacity = '0';
      if (heroContentRef.current) {
        heroContentRef.current.style.transform = 'translate3d(0, 0%, 0)';
        heroContentRef.current.style.pointerEvents = 'auto';
      }
      if (heroGlowRef.current) {
        heroGlowRef.current.style.transform = 'translate3d(-5vw, 0vh, 0) scale(1.0)';
        heroGlowRef.current.style.opacity = '1';
      }
      if (heroCardRef.current) {
        heroCardRef.current.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translate3d(-5vw, 0vh, 0) scale(1.0)';
        heroCardRef.current.style.opacity = '1';
      }
      if (aboutRef.current) {
        aboutRef.current.style.transform = 'translate3d(0, 0%, 0)';
        aboutRef.current.style.opacity = '1';
        aboutRef.current.style.pointerEvents = 'auto';
      }
      if (skillsRef.current) {
        skillsRef.current.style.transform = 'translate3d(0, 0%, 0)';
        skillsRef.current.style.opacity = '1';
        skillsRef.current.style.pointerEvents = 'auto';
      }
      if (scrollCueRef.current) {
        scrollCueRef.current.style.opacity = '0';
      }
      setUnfoldProgress(1.0);
      return;
    }

    // Cloud and Intro overlays hidden to ensure clean immediate hero visibility
    if (cloudLeftRef.current) cloudLeftRef.current.style.opacity = '0';
    if (cloudRightRef.current) cloudRightRef.current.style.opacity = '0';
    if (cloudTopRef.current) cloudTopRef.current.style.opacity = '0';
    if (welcomeTextRef.current) welcomeTextRef.current.style.opacity = '0';

    // Hero section vertical position (scrolls UP off-screen at end of hero phase: 0.48 -> 0.60)
    let heroY = 0;
    if (progress < HERO_TRANSITION_OUT_START_PROGRESS) {
      heroY = 0;
    } else if (progress < HERO_TRANSITION_OUT_END_PROGRESS) {
      heroY = -100 * smoothstep(HERO_TRANSITION_OUT_START_PROGRESS, HERO_TRANSITION_OUT_END_PROGRESS, progress);
    } else {
      heroY = -100;
    }

    // About section vertical position (Enters from +100%, stays at 0%)
    let aboutY = 100;
    let aboutOpacity = 0.0;

    if (progress < HERO_TRANSITION_OUT_START_PROGRESS) {
      aboutY = 100;
      aboutOpacity = 0.0;
    } else if (progress < HERO_TRANSITION_OUT_END_PROGRESS) {
      aboutY = 100 * (1 - smoothstep(HERO_TRANSITION_OUT_START_PROGRESS, HERO_TRANSITION_OUT_END_PROGRESS, progress));
      aboutOpacity = smoothstep(HERO_TRANSITION_OUT_START_PROGRESS, HERO_TRANSITION_OUT_END_PROGRESS, progress);
    } else {
      aboutY = 0;
      aboutOpacity = 1.0;
    }

    // Skills section vertical position (Enters from +100vh -> 0vh as video last frame completes: progress 0.70 -> 0.85)
    let skillsY = 100;
    let skillsOpacity = 0.0;
    let currentSkillsUnfold = 0.0;

    if (progress < 0.70) {
      skillsY = 100;
      skillsOpacity = 0.0;
      currentSkillsUnfold = 0.0;
    } else if (progress < 0.85) {
      const t = smoothstep(0.70, 0.85, progress);
      skillsY = 100 * (1 - t);
      skillsOpacity = smoothstep(0.70, 0.78, progress);
      currentSkillsUnfold = smoothstep(0.72, 0.88, progress);
    } else {
      skillsY = 0;
      skillsOpacity = 1.0;
      currentSkillsUnfold = 1.0;
    }

    // Scroll-driven Hero Card Entrance (0.14 - 0.20 from right 35vw/25vh scale 0.15 to left -5vw scale 1.0)
    let cardScale = 1.0;
    let cardTranslateX = '-5vw';
    let cardTranslateY = '0vh';
    let cardOpacity = 1.0;
    let cardRotateX = 0.0;
    let cardRotateY = 0.0;

    if (progress < HERO_CARD_ENTRANCE_START_PROGRESS) {
      cardScale = 0.15;
      cardTranslateX = '35vw';
      cardTranslateY = '25vh';
      cardOpacity = 0.0;
      cardRotateX = 0.0;
      cardRotateY = 0.0;
    } else if (progress < HERO_CARD_ENTRANCE_END_PROGRESS) {
      const t = smoothstep(HERO_CARD_ENTRANCE_START_PROGRESS, HERO_CARD_ENTRANCE_END_PROGRESS, progress);
      cardScale = 0.15 + 0.85 * t;
      cardTranslateX = `${35 - (35 - (-5)) * t}vw`;
      cardTranslateY = `${25 * (1 - t)}vh`;
      cardOpacity = smoothstep(HERO_CARD_ENTRANCE_START_PROGRESS, HERO_CARD_ENTRANCE_START_PROGRESS + 0.03, progress);
      cardRotateX = 0.0;
      cardRotateY = 0.0;
    } else if (progress < HERO_CARD_ROTATION_END_PROGRESS) {
      const t = smoothstep(HERO_CARD_ROTATION_START_PROGRESS, HERO_CARD_ROTATION_END_PROGRESS, progress);
      cardScale = 1.0;
      cardTranslateX = '-5vw';
      cardTranslateY = '0vh';
      cardOpacity = 1.0;
      cardRotateX = MAX_ROTATION_X * t;
      cardRotateY = MAX_ROTATION_Y * t;
    } else {
      cardScale = 1.0;
      cardTranslateX = '-5vw';
      cardTranslateY = '0vh';
      cardOpacity = 1.0;
      cardRotateX = MAX_ROTATION_X;
      cardRotateY = MAX_ROTATION_Y;
    }

    // Direct DOM updates
    if (heroContentRef.current) {
      heroContentRef.current.style.transform = `translate3d(0, ${heroY}%, 0)`;
      heroContentRef.current.style.pointerEvents = (Math.abs(heroY) < 10 && cardOpacity > 0.4) ? 'auto' : 'none';
    }
    if (heroGlowRef.current) {
      heroGlowRef.current.style.transform = `translate3d(${cardTranslateX}, ${cardTranslateY}, 0) scale(${cardScale})`;
      heroGlowRef.current.style.opacity = `${cardOpacity}`;
    }
    if (heroCardRef.current) {
      heroCardRef.current.style.transform = `perspective(1100px) rotateX(var(--tilt-x, 0deg)) rotateX(${cardRotateX}deg) rotateY(var(--tilt-y, 0deg)) rotateY(${cardRotateY}deg) translate3d(${cardTranslateX}, ${cardTranslateY}, 0) scale(${cardScale})`;
      heroCardRef.current.style.opacity = `${cardOpacity}`;
    }
    if (aboutRef.current) {
      aboutRef.current.style.transform = `translate3d(0, ${aboutY}%, 0)`;
      aboutRef.current.style.opacity = `${aboutOpacity}`;
      aboutRef.current.style.pointerEvents = (Math.abs(aboutY) < 10 && aboutOpacity > 0.3) ? 'auto' : 'none';

      if (progress >= 0.55) {
        aboutRef.current.classList.add('is-in-view');
      } else {
        aboutRef.current.classList.remove('is-in-view');
      }
    }

    if (skillsRef.current) {
      skillsRef.current.style.transform = `translate3d(0, ${skillsY}vh, 0)`;
      skillsRef.current.style.opacity = `${skillsOpacity}`;
      skillsRef.current.style.pointerEvents = (skillsY < 25 && skillsOpacity > 0.3) ? 'auto' : 'none';
    }

    setUnfoldProgress(currentSkillsUnfold);

    if (scrollCueRef.current) {
      const showCue = progress < HERO_TRANSITION_OUT_START_PROGRESS;
      scrollCueRef.current.style.opacity = showCue ? '1' : '0';
    }
  }, [reducedMotion]);

  useEffect(() => {
    const updateScrollProgress = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      applyProgress(progress);
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateScrollProgress();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollProgress);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [applyProgress]);

  const [isVideoReady, setIsVideoReady] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let startTime = performance.now();
    const duration = 1200;
    let animationFrameId = null;

    const animateProgress = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const currentPercent = Math.min(100, Math.floor(100 * (1 - Math.pow(1 - progress, 2))));
      setLoadPercent(currentPercent);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateProgress);
      } else {
        const wrapper = wrapperRef.current;
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          const total = wrapper.offsetHeight - window.innerHeight;
          const scrolled = -rect.top;
          const prog = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
          applyProgress(prog);
        }
        setTimeout(() => {
          setIsVideoReady(true);
        }, 220);
      }
    };

    video.pause();
    animationFrameId = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [applyProgress]);

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

  return (
    <section className={`scroll-wrapper ${reducedMotion ? 'prefers-reduced-motion' : ''} ${isVideoReady ? 'is-ready' : ''}`} ref={wrapperRef} id="home" aria-label="Hero Biography and Skills">
      {!isVideoReady && (
        <div className="scene-preloader" aria-hidden="true">
          <div className="preloader-content">
            <div className="preloader-spinner" />
            <div className="preloader-text">INITIALIZING EXPERIENCE</div>
            <div className="preloader-track">
              <div className="preloader-bar" style={{ width: `${loadPercent}%` }} />
            </div>
          </div>
        </div>
      )}
      <div className="sticky-stage">
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          className="scene-video"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <DepthTypography text={hero?.backgroundText || "USMAN"} className="depth-bg-text" aria-hidden="true" />
        <img
          ref={cloudTopRef}
          src="/cloud.png"
          alt=""
          className="hero-cloud hero-cloud-top"
          aria-hidden="true"
        />

        <div
          ref={welcomeTextRef}
          className="welcome-space-intro"
          aria-hidden="true"
        >
          <div ref={welcomeLine1Ref} className="welcome-line welcome-line-1">WELCOM TO</div>
          <div ref={welcomeLine2Ref} className="welcome-line welcome-line-2">MY SPACE</div>
        </div>

        <img
          ref={cloudLeftRef}
          src="/cloud.png"
          alt=""
          className="hero-cloud hero-cloud-left"
          aria-hidden="true"
        />
        <img
          ref={cloudRightRef}
          src="/cloud.png"
          alt=""
          className="hero-cloud hero-cloud-right"
          aria-hidden="true"
        />

        <div
          role="region"
          aria-label="Hero Introduction"
          className="stage-content hero-content"
          ref={heroContentRef}
          style={{
            transform: 'translate3d(0, 0%, 0)',
            pointerEvents: 'auto',
          }}
        >
          <div
            className="hero-glow-container"
            ref={heroGlowRef}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0,
            }}
            aria-hidden="true"
          >
            <GlowLayer className="hero-card-glow" />
          </div>

          <div
            className="glass hero-card"
            ref={heroCardRef}
            style={{ opacity: 1 }}
            onMouseMove={handleHeroMove}
            onMouseLeave={handleHeroLeave}
          >
            <ReflectionOverlay delay={1.5} aria-hidden="true" />
            <div className="hero-glow" aria-hidden="true" />
            <p className="hero-greet">{hero?.greetText || "Hi, I'm"}</p>
            <RevealHeading text={hero?.name || "Muhammad Usman"} as="h1" className="hero-name" />
            <p className="hero-role">
              {hero?.role || "Full-Stack Developer | AI Integration Specialist | Video Editor"}
            </p>
            <div className="hero-divider" aria-hidden="true" />
            <p className="hero-desc">
              {hero?.description || "I build intelligent web applications and craft engaging visual stories — turning ideas into functional, beautiful digital products."}
            </p>
            <div className="hero-actions">
              <a href={hero?.cta1Link || "#projects"} className="btn-primary" aria-label="View Muhammad Usman's portfolio work">
                <Briefcase size={16} strokeWidth={2} aria-hidden="true" />
                {hero?.cta1Text || "View My Work"}
              </a>
              {resume?.status !== 'Inactive' && (
                <a
                  href={resume?.resumeFileUrl || "/resume.pdf"}
                  onClick={trackResumeDownload}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="btn-ghost"
                  aria-label="Download Muhammad Usman's PDF resume"
                >
                  <Download size={16} strokeWidth={2} aria-hidden="true" />
                  {hero?.cta2Text || "Download Resume"}
                </a>
              )}
            </div>
            <div className="hero-socials">
              <a href={hero?.githubUrl || "https://github.com/usaaman/"} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="social-btn"><GithubIcon size={17} /></a>
              <a href={hero?.linkedinUrl || "https://www.linkedin.com/in/muhammad-usman-a76984378/"} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="social-btn"><LinkedinIcon size={17} /></a>
              <a href={hero?.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile" className="social-btn"><TwitterIcon size={17} /></a>
              <a href={`mailto:${hero?.emailAddress || "musmannazir97@gmail.com"}`} aria-label="Send Email" className="social-btn"><Mail size={17} strokeWidth={1.8} aria-hidden="true" /></a>
            </div>
          </div>
        </div>

        <About
          ref={aboutRef}
          style={{
            transform: 'translate3d(0, 100%, 0)',
            pointerEvents: 'none',
          }}
          aboutData={about}
        />

        {/* SKILLS CONTENT */}
        <Skills
          ref={skillsRef}
          skillsData={skills}
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translate3d(0, 100vh, 0)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 20,
          }}
          unfoldProgress={unfoldProgress}
        />

        <div className="scroll-cue" ref={scrollCueRef} style={{ opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
          <span>scroll</span>
          <div className="scroll-cue-line" />
        </div>
      </div>
    </section>
  );
}
