import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import { PROJECTS_DATA } from './projectsData';
import SectionHeading from './SectionHeading';
import SectionLabel from './SectionLabel';
import './Projects.css';

const GithubIcon = (props) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.61-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.51-1.11-1.51-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
);

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
      /* PLACEHOLDERS FOR PHASE 03:
         - Mouse 3D Tilt properties
         - Scroll Reveal selectors
      */
    >
      <div className="project-card-inner">
        {/* Project Header Info */}
        <div className="project-info">
          <div className="project-header-top">
            <h3 id={`project-title-${project.id}`} className="project-card-title">
              {project.title}
            </h3>
            <span className="project-card-subtitle">{project.subtitle}</span>
          </div>

          <p className="project-card-description">{project.description}</p>

          {/* Tech stack pills */}
          <div className="project-tech-list" aria-label="Technologies used">
            {project.technologies.map((tech) => (
              <span className="project-tech-pill" key={tech}>
                {tech}
              </span>
            ))}
          </div>

          {/* GitHub / Live Demo buttons */}
          <div className="project-actions">
            <a 
              href={project.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-btn project-btn-secondary"
              aria-label={`View GitHub repository for ${project.title}`}
            >
              <GithubIcon size={16} />
              <span>GitHub</span>
            </a>
            <a 
              href={project.liveDemo} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-btn project-btn-primary"
              aria-label={`View live demo for ${project.title}`}
            >
              <ExternalLink size={16} />
              <span>Live Demo</span>
            </a>
          </div>
        </div>

        {/* Project Gallery & Preview Area */}
        <div className="project-gallery-layout">
          {/* Main Preview Area (Supports empty image gracefully with premium placeholder) */}
          <div className="project-preview-wrapper">
            {activeImgUrl ? (
              <img 
                src={activeImgUrl} 
                alt={`Preview of ${project.title}`} 
                className="project-preview-img"
                loading="lazy"
              />
            ) : (
              <div className="project-preview-placeholder">
                <ImageIcon className="project-placeholder-icon" size={32} />
                <span className="project-placeholder-text">Preview will be available</span>
                <span className="project-placeholder-index">Image {activeImageIndex + 1} of 4</span>
              </div>
            )}
          </div>

          {/* Thumbnail sidebar column (Centered on the right side) */}
          <div 
            className="project-thumbnails-column" 
            role="group" 
            aria-label={`Image gallery for ${project.title}`}
          >
            {project.galleryImages.map((imgUrl, index) => {
              const isActive = activeImageIndex === index;
              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  className={`project-thumbnail-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-label={`View gallery image ${index + 1} of ${project.title}`}
                  aria-pressed={isActive}
                >
                  {imgUrl ? (
                    <img 
                      src={imgUrl} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="project-thumbnail-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="project-thumbnail-placeholder">
                      <ImageIcon size={14} className="project-thumb-placeholder-icon" />
                      <span>0{index + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const scrollWrapperRef = useRef(null);
  const cardRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Listen for accessibility reduced-motion query
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // 2. High-Performance Scroll Transition Easing using requestAnimationFrame (Part B)
  useEffect(() => {
    let active = true;
    let rafId = null;

    const handleScroll = () => {
      if (!active) return;
      if (reducedMotion) {
        // Reset card stack styles for static layout fallback
        PROJECTS_DATA.forEach((_, index) => {
          const card = cardRefs.current[index];
          if (card) {
            card.style.transform = '';
            card.style.opacity = '';
            card.style.filter = '';
            card.style.pointerEvents = '';
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

      // Calculate translation for each card based on relative index offset
      const progressPerCard = 1 / (PROJECTS_DATA.length - 1); // 0.2 for 6 projects

      PROJECTS_DATA.forEach((_, index) => {
        const card = cardRefs.current[index];
        if (!card) return;

        const targetP = index * progressPerCard;
        const x = (P - targetP) / progressPerCard;

        let translateY = 0;
        let scale = 1;
        let opacity = 1;
        let blur = 0;
        let pointerEvents = 'none';

        if (x > 0) {
          // A) Previous project card - moves back, scales down, blurs, and fades out
          const t = Math.min(1, x);
          scale = 1 - 0.08 * t; // scales down to 0.92
          opacity = 1 - 0.75 * t; // fades to 0.25
          blur = 6 * t; // blurs up to 6px
          translateY = -50 * t; // moves up slightly
          pointerEvents = 'none';
        } else if (x < 0) {
          // B) Next project card - rises from bottom, peeks by ~15%
          const t = Math.min(1, -x);
          translateY = t * 65; // translates down by 65vh (peeking visual)
          scale = 1 - 0.04 * t; // starts slightly smaller
          opacity = 1 - 0.15 * t; // slightly faded when peeking
          pointerEvents = 'none';
        } else {
          // C) Active project card - fully centered and interactive
          pointerEvents = 'auto';
        }

        // Apply styles directly to DOM elements to bypass React rendering cycles
        card.style.transform = `translate3d(0, ${x < 0 ? translateY + 'vh' : translateY + 'px'}, 0) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        card.style.pointerEvents = pointerEvents;
        card.style.zIndex = 10 + index; // next card overlays previous card during scroll up
      });
    };

    const updateFrame = () => {
      handleScroll();
      if (active) {
        rafId = requestAnimationFrame(updateFrame);
      }
    };

    // Run frame updates
    rafId = requestAnimationFrame(updateFrame);

    window.addEventListener('resize', handleScroll);

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScroll);
    };
  }, [reducedMotion]);

  return (
    <div className="projects-scroll-wrapper" ref={scrollWrapperRef}>
      <section className="projects-section" id="projects" aria-label="Portfolio Projects">
        {/* PLACEHOLDER FOR PHASE 03: dynamic backdrop lighting transitions */}
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
              <ProjectCard 
                key={project.id} 
                project={project} 
                cardRef={(el) => (cardRefs.current[index] = el)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
