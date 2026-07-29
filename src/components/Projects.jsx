import { useEffect, useRef, useState } from 'react';
import { PROJECTS_DATA } from './projectsData';
import SectionHeading from './SectionHeading';
import SectionLabel from './SectionLabel';
import './Projects.css';

function ProjectCard({ project, cardRef }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImgUrl = project.galleryImages[activeImageIndex] || project.featuredImage;

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveImageIndex(index);
    }
  };

  return (
    <article
      className="project-card"
      ref={cardRef}
      data-project-id={project.id}
      aria-labelledby={`project-title-${project.id}`}
    >
      {/* Eyebrow Label inside Card */}
      <div className="eyebrow">
        <span className="dot"></span>
        Featured projects / {project.title}
      </div>

      {/* Gallery Structure */}
      <div className="gallery">
        {/* Main Preview Container */}
        <div className="frame main-preview">
          <span className="frame-label">Preview 0{activeImageIndex + 1}</span>
          <span className="counter">0{activeImageIndex + 1} / 04</span>
          {activeImgUrl ? (
            <img
              src={activeImgUrl}
              alt={`Preview 0${activeImageIndex + 1}`}
              className="project-preview-img"
              loading="lazy"
            />
          ) : (
            <span className="frame-status">Preview coming soon</span>
          )}
        </div>

        {/* Vertical Thumbnails Stack Column — always the 3 images NOT shown in main preview */}
        <div className="thumb-stack">
          {project.galleryImages
            .map((imgUrl, index) => ({ imgUrl, index }))
            .filter(({ index }) => index !== activeImageIndex)
            .map(({ imgUrl, index }) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                className="frame thumb"
                onClick={() => handleThumbnailClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`View gallery image ${index + 1} of ${project.title}`}
              >
                <span className="thumb-num">0{index + 1}</span>
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={`Thumbnail 0${index + 1}`}
                    className="project-thumbnail-img"
                    loading="lazy"
                  />
                ) : (
                  <span className="frame-status">Coming soon</span>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Title & Metadata Row */}
      <div className="title-row">
        <div>
          <h1 id={`project-title-${project.id}`}>{project.title}</h1>
          <div className="subtitle">{project.subtitle}</div>
        </div>
        <div className="actions">
          <a
            className="btn"
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="btn primary"
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Live demo
          </a>
        </div>
      </div>

      {/* Description Paragraph */}
      <p className="description">
        {project.description}
      </p>

      {/* Tech Stack Chip Grid */}
      <div className="stack-label">Tech stack</div>
      <div className="stack">
        {project.technologies.map((tech) => (
          <span key={tech} className="chip">{tech}</span>
        ))}
      </div>
    </article>
  );
}

export default function Projects() {
  const scrollWrapperRef = useRef(null);
  const cardRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Accessibility listener for prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // 2. High-Performance requestAnimationFrame Scroll engine loop (No React re-renders)
  useEffect(() => {
    let active = true;
    let rafId = null;

    const handleScroll = () => {
      if (!active) return;
      if (reducedMotion) {
        // Reset card wrapper styling to default standard relative flow
        PROJECTS_DATA.forEach((_, index) => {
          const card = cardRefs.current[index];
          if (card) {
            card.style.transform = '';
            card.style.opacity = '';
            card.style.visibility = '';
            card.style.filter = '';
            card.style.pointerEvents = '';
            card.style.zIndex = '';
          }
        });
        return;
      }

      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) return;

      // Scroll progress P [0, 1] relative to wrapper
      const scrolled = -rect.top;
      const P = Math.max(0, Math.min(1, scrolled / totalScrollable));

      // Dynamic derivation based on project count (Future CMS Compatibility)
      const N = PROJECTS_DATA.length;
      const progressPerCard = N > 1 ? 1 / (N - 1) : 1;

      // Determine active index based on closest progress
      const activeIndex = Math.max(0, Math.min(N - 1, Math.round(P / progressPerCard)));

      // Next project card slides up from below in sync with the old card fading/blurring
      // away — both happen simultaneously across the whole transition, no delay/wait.
      // An ease-in curve keeps the very start of the motion slow and gentle so the
      // scroll flow never feels like it snaps or jumps.
      const translateYOffset = 180; // 180vh fully-parked starting offset

      PROJECTS_DATA.forEach((_, index) => {
        const card = cardRefs.current[index];
        if (!card) return;

        const targetP = index * progressPerCard;
        const x = (P - targetP) / progressPerCard;

        let translateY = 0;
        let scale = 1;
        let opacity = 1;
        let blur = 0;

        if (x > 0) {
          // A) Previous project card - behind current, scale 0.96, opacity 0.15, blur max 8px
          const t = Math.min(1, x);
          scale = 1 - 0.04 * t;
          opacity = 1 - 0.85 * t;
          blur = 8 * t;
          translateY = -40 * t;
        } else if (x < 0) {
          // B) Next project card - slides up the ENTIRE time the previous card is
          // fading/blurring (no delay, fully simultaneous). An ease-in curve
          // (g*g) makes the motion very slow right at the start and gradually
          // speed up, so it never feels like a sudden jump.
          const t = Math.min(1, -x); // 1 = just started (far away), 0 = arriving/active
          const g = 1 - t; // 0 = just started, 1 = fully arrived
          const eased = g * g; // ease-in curve: slow start, faster finish
          translateY = translateYOffset * (1 - eased);
          opacity = eased;
          scale = 1 - 0.04 * (1 - eased);
        }
        // x === 0 -> C) Active project card - centered, fully sharp (defaults above apply)

        // A card is clickable exactly when, and only when, it is visibly on screen.
        const isVisible = opacity > 0.05;

        // Stacking z-index order based on active index state (Active: 30, Previous: 20, Next: 10)
        let zIndex = 10;
        if (index === activeIndex) {
          zIndex = 30;
        } else if (index < activeIndex) {
          zIndex = 20;
        } else {
          zIndex = 10;
        }

        card.style.transform = `translate3d(0, ${x < 0 ? translateY + 'vh' : translateY + 'px'}, 0) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.visibility = isVisible ? 'visible' : 'hidden';
        card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        card.style.pointerEvents = isVisible ? 'auto' : 'none';
        card.style.zIndex = zIndex;
      });
    };

    const updateLoop = () => {
      handleScroll();
      if (active) {
        rafId = requestAnimationFrame(updateLoop);
      }
    };

    // Run animation frames
    rafId = requestAnimationFrame(updateLoop);

    window.addEventListener('resize', handleScroll);

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScroll);
    };
  }, [reducedMotion]);

  // Dynamically calculate scroll wrapper height based on projects array length
  const totalScrollHeightVh = PROJECTS_DATA.length * 100;

  return (
    <div
      className="projects-scroll-wrapper"
      ref={scrollWrapperRef}
      style={{ height: `${totalScrollHeightVh}vh` }}
    >
      <section className="projects-section" id="projects" aria-label="Portfolio Projects">
        {/* Backdrop lighting transitions */}
        <div className="projects-bg-glow-layer" aria-hidden="true" />

        <div className="projects-container">
          <div className="projects-section-header">
            <SectionLabel>PORTFOLIO WORK</SectionLabel>
            <SectionHeading align="center" className="projects-section-title">
              Featured <span className="projects-title-accent">Projects</span>
            </SectionHeading>
            <p className="projects-section-sub">
              A curated selection of applications bridging technical complexity, modern architecture, and refined design.
            </p>
          </div>

          <div className="projects-grid">
            {PROJECTS_DATA.map((project, index) => (
              <div
                key={project.id}
                className="project-card-wrapper"
                ref={(el) => (cardRefs.current[index] = el)}
              >
                <ProjectCard
                  project={project}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
