import { useEffect, useRef, useState, useMemo } from 'react';
import { X, Expand, Film } from 'lucide-react';
import { trackProjectClick } from '../utils/analytics';
import ProjectsNeuralMatrix from './ProjectsNeuralMatrix';
import './Projects.css';

const isVideoMedia = (url) => {
  if (typeof url !== 'string') return false;
  return (
    url.startsWith('data:video') ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.includes('/video/')
  );
};

const GithubSvg = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '15px', height: '15px' }}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
  </svg>
);

const ExternalLinkSvg = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '15px', height: '15px' }}>
    <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72ZM3.5 4A1.5 1.5 0 0 0 2 5.5v7A1.5 1.5 0 0 0 3.5 14h7a1.5 1.5 0 0 0 1.5-1.5V9a.75.75 0 0 0-1.5 0v3.5h-7v-7H7A.75.75 0 0 0 7 4H3.5Z"/>
  </svg>
);

const DEFAULT_PROJECTS = [
  {
    id: 'medcore-pos',
    title: 'MedCore POS',
    subtitle: 'Flagship Medical Point of Sale System',
    shortDesc: 'A premium, high-performance point-of-sale system tailored for modern medical clinics and pharmacies.',
    longDesc: 'A premium, high-performance point-of-sale system tailored for modern medical clinics and pharmacies. Integrates real-time patient billing, prescription insurance clearance pipelines, and secure drug inventory tracking under strict healthcare regulations.',
    techStack: 'React.js, Node.js, Express.js, REST APIs, MySQL, Tailwind CSS',
    githubUrl: 'https://github.com/usaaman/medcore-pos',
    liveUrl: '',
    coverImage: '/projects/medcore.png',
    gallery: ['/projects/medcore.png'],
    displayOrder: 1,
    status: 'Published',
    featured: true,
    type: 'Web App'
  },
  {
    id: 'ai-chat-app',
    title: 'AI Chat App',
    subtitle: 'Conversational Artificial Intelligence Client',
    shortDesc: 'An advanced chat assistant with real-time streaming answers, code highlight syntaxes, chat history management, and multi-model toggle selectors.',
    longDesc: 'An advanced chat assistant with real-time streaming answers, code highlight syntaxes, chat history management, and multi-model toggle selectors. Connects with state-of-the-art LLMs via a secure serverless backend.',
    techStack: 'Next.js, TypeScript, OpenAI API, Claude API, Framer Motion, Tailwind CSS',
    githubUrl: 'https://github.com/usaaman/ai-chat-app',
    liveUrl: '',
    coverImage: '/projects/ai-chat.png',
    gallery: ['/projects/ai-chat.png'],
    displayOrder: 2,
    status: 'Published',
    featured: true,
    type: 'Web App'
  },
  {
    id: 'personal-portfolio',
    title: 'Personal Portfolio + AI CMS',
    subtitle: 'Developer Portfolio and Intelligent Content Manager',
    shortDesc: 'A high-end developer portfolio utilizing a custom serverless CMS powered by natural language commands.',
    longDesc: 'A high-end developer portfolio utilizing a custom serverless CMS powered by natural language commands. Allows writing, deleting, or reordering case study cards using simple English text commands.',
    techStack: 'React.js, Vite, Firebase, Firestore, Generative AI, Tailwind CSS',
    githubUrl: 'https://github.com/usaaman/portfolio-cms',
    liveUrl: '',
    coverImage: '/projects/portfolio.png',
    gallery: ['/projects/portfolio.png'],
    displayOrder: 3,
    status: 'Published',
    featured: true,
    type: 'Web App'
  },
  {
    id: 'movie-recommender',
    title: 'Movie Suggestion System',
    subtitle: 'AI-Based Movie Recommendation Engine',
    shortDesc: 'A recommendation platform analyzing user taste preferences, movie genres, and visual themes to curate tailored watchlist suggestions.',
    longDesc: 'A recommendation platform analyzing user taste preferences, movie genres, and visual themes to curate tailored watchlist suggestions. Employs vector search matching logic and real-time movie rating statistics.',
    techStack: 'React.js, Python, FastAPI, REST APIs, PostgreSQL, Tailwind CSS',
    githubUrl: 'https://github.com/usaaman/movie-recommender',
    liveUrl: '',
    coverImage: '/projects/movie.png',
    gallery: ['/projects/movie.png'],
    displayOrder: 4,
    status: 'Published',
    featured: true,
    type: 'AI System'
  },
  {
    id: 'chat-application',
    title: 'Chat Application',
    subtitle: 'Real-Time Shared Channels Messaging App',
    shortDesc: 'A collaborative real-time messaging client featuring persistent text channels, live typing indicators, online status tags, active thread replies, and structured image/file share capabilities.',
    longDesc: 'A collaborative real-time messaging client featuring persistent text channels, live typing indicators, online status tags, active thread replies, and structured image/file share capabilities.',
    techStack: 'React.js, Node.js, Express.js, Firebase, REST APIs, Tailwind CSS',
    githubUrl: 'https://github.com/usaaman/chat-app',
    liveUrl: '',
    coverImage: '/projects/chat.png',
    gallery: ['/projects/chat.png'],
    displayOrder: 5,
    status: 'Published',
    featured: true,
    type: 'Web App'
  },
  {
    id: 'design-showcase',
    title: 'UI Ideas / Design Showcase',
    subtitle: 'Premium User Interfaces and Design Playground',
    shortDesc: 'A playground showcasing premium interface design tokens, glassmorphic layout experiments, rich interactive micro-animations, and cutting-edge dark mode theme styling systems.',
    longDesc: 'A playground showcasing premium interface design tokens, glassmorphic layout experiments, rich interactive micro-animations, and cutting-edge dark mode theme styling systems.',
    techStack: 'HTML, CSS, JavaScript, Responsive Design, Figma, UI Design',
    githubUrl: 'https://github.com/usaaman/design-showcase',
    liveUrl: '',
    coverImage: '/projects/design.png',
    gallery: ['/projects/design.png'],
    displayOrder: 6,
    status: 'Published',
    featured: true,
    type: 'Design UI'
  }
];

export default function Projects({ projects }) {
  const scrollWrapperRef = useRef(null);
  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const currentIdxRef = useRef(0);
  const [activeImgIndices, setActiveImgIndices] = useState({});
  const [modalProject, setModalProject] = useState(null);

  const activeProjects = useMemo(() => {
    let list = projects;
    if (!list || list.length === 0) {
      list = DEFAULT_PROJECTS;
    }
    const filtered = list.filter((p) => !p.status || p.status.toLowerCase() !== 'draft');
    return filtered.length > 0 ? filtered : DEFAULT_PROJECTS;
  }, [projects]);

  // Accessibility listener for prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Keyboard accessibility for Live Preview Modal
  useEffect(() => {
    if (!modalProject) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalProject(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalProject]);

  // Apple-Level 3D Card Stacking Engine - 120 FPS Zero-Lag Architecture
  useEffect(() => {
    if (reducedMotion || activeProjects.length === 0) {
      activeProjects.forEach((_, index) => {
        const card = cardRefs.current[index];
        const overlay = overlayRefs.current[index];
        if (card) {
          card.style.transform = '';
          card.style.opacity = '';
          card.style.zIndex = '';
          card.style.pointerEvents = '';
          card.style.visibility = '';
        }
        if (overlay) {
          overlay.style.opacity = '0';
        }
      });
      return;
    }

    const wrapper = scrollWrapperRef.current;
    if (!wrapper) return;

    let targetProgress = 0;
    let currentProgress = 0;
    let isRunning = false;
    let rafId = null;

    const calcTargetProgress = () => {
      const rect = wrapper.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return 0;
      const scrolled = -rect.top;
      return Math.max(0, Math.min(1, scrolled / totalScrollable));
    };

    const updateCards = (progress) => {
      const N = activeProjects.length;
      const sectionProgress = progress * (N - 1);
      const activeIdx = Math.min(N - 1, Math.max(0, Math.round(sectionProgress)));

      // Only notify React when index actually changes to eliminate re-render hitching
      if (activeIdx !== currentIdxRef.current) {
        currentIdxRef.current = activeIdx;
        setCurrentStageIndex(activeIdx);
      }

      for (let index = 0; index < N; index++) {
        const card = cardRefs.current[index];
        const overlay = overlayRefs.current[index];
        if (!card) continue;

        const delta = sectionProgress - index;

        let translateY = 0;
        let scale = 1.0;
        let rotateX = 0;
        let opacity = 1.0;
        let overlayOpacity = 0;
        let zIndex = 10 + index;
        let pointerEvents = 'auto';
        let visibility = 'visible';
        let isVh = false;

        if (delta <= -1.0) {
          // In queue deep below viewport
          translateY = 100;
          scale = 0.90;
          rotateX = 10;
          opacity = 0;
          visibility = 'hidden';
          pointerEvents = 'none';
          isVh = true;
          overlayOpacity = 0;
        } else if (delta < 0.0) {
          // Incoming card sliding up over the stack
          const t = delta + 1.0; // 0.0 -> 1.0
          const easeArrival = 1 - Math.pow(1 - t, 3); // Cubic ease out
          translateY = (1 - easeArrival) * 100;
          isVh = true;

          // 3D perspective tilt: tilts slightly backward as it rises, flattening on arrival
          rotateX = 10 * (1 - easeArrival);

          // Full-size expansion: expands slightly (1.02) then settles to 1.000
          if (t < 0.85) {
            const k = t / 0.85;
            scale = 0.92 + 0.10 * (1 - Math.pow(1 - k, 2));
          } else {
            const k = (t - 0.85) / 0.15;
            scale = 1.02 - 0.02 * (1 - Math.pow(1 - k, 2));
          }

          opacity = Math.min(1, t / 0.22);
          zIndex = 30 + index * 2;
          pointerEvents = t > 0.85 ? 'auto' : 'none';
          overlayOpacity = 0;
        } else if (delta === 0.0) {
          // Active card at center stage
          translateY = 0;
          scale = 1.000;
          rotateX = 0;
          opacity = 1.0;
          zIndex = 30 + index * 2;
          pointerEvents = 'auto';
          overlayOpacity = 0;
        } else {
          // Stacked cards underneath (delta > 0.0) - Deck Stacking Effect
          translateY = -18 * Math.min(delta, 3);
          scale = Math.max(0.88, 1 - 0.045 * Math.min(delta, 3));
          rotateX = -1.2 * Math.min(delta, 2);
          zIndex = 10 + index;
          pointerEvents = delta > 0.2 ? 'none' : 'auto';

          // Ambient occlusion darkening handled via GPU compositor overlay (NO filter re-rasterization)
          overlayOpacity = Math.min(0.70, delta * 0.28);

          // Deep stack fade-out after 2.4 layers
          if (delta > 2.4) {
            opacity = Math.max(0, 1 - (delta - 2.4) / 0.7);
            if (opacity <= 0.01) {
              visibility = 'hidden';
            }
          } else {
            opacity = 1.0;
          }
        }

        const transformStr = isVh
          ? `translate3d(0, ${translateY.toFixed(2)}vh, 0) scale(${scale.toFixed(4)}) rotateX(${rotateX.toFixed(2)}deg)`
          : `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotateX(${rotateX.toFixed(2)}deg)`;

        card.style.transform = transformStr;
        card.style.opacity = `${opacity.toFixed(3)}`;
        card.style.zIndex = `${zIndex}`;
        card.style.pointerEvents = pointerEvents;
        card.style.visibility = visibility;

        if (overlay) {
          overlay.style.opacity = overlayOpacity.toFixed(3);
        }
      }
    };

    // Smooth spring physics interpolation loop (glides smoothly on stepped mouse wheels)
    const animationTick = () => {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) < 0.0008) {
        currentProgress = targetProgress;
        updateCards(currentProgress);
        isRunning = false;
        rafId = null;
        return; // Auto-idles: 0% CPU & GPU when stationary!
      }

      currentProgress += diff * 0.24;
      updateCards(currentProgress);
      rafId = requestAnimationFrame(animationTick);
    };

    const onScroll = () => {
      targetProgress = calcTargetProgress();
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(animationTick);
      }
    };

    // Immediate initial alignment
    targetProgress = calcTargetProgress();
    currentProgress = targetProgress;
    updateCards(currentProgress);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, activeProjects]);

  const scrollToCard = (index) => {
    const wrapper = scrollWrapperRef.current;
    if (!wrapper) return;
    const totalScrollableHeight = wrapper.offsetHeight - window.innerHeight;
    const step = totalScrollableHeight / (activeProjects.length - 1);
    const targetY = wrapper.offsetTop + (index * step);

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  };

  const totalScrollHeightVh = Math.max(1, activeProjects.length) * 115;

  return (
    <div
      id="projects"
      ref={scrollWrapperRef}
      className="projects-scroll-wrapper relative w-full"
      style={{ height: `${totalScrollHeightVh}vh` }}
    >
      {/* Sticky Stage Viewport Container */}
      <div className="projects-sticky-viewport">
        {/* Dynamic Ambient Backlight */}
        <div className="projects-ambient-backlight" aria-hidden="true"></div>

        {/* Idea 1: Neural Matrix Architecture (Grows with scroll, apex reveal on final card) */}
        <ProjectsNeuralMatrix wrapperRef={scrollWrapperRef} />

        {/* Top Section Header Bar */}
        <div className="projects-top-header">
          {/* Left: Section Badge & Title */}
          <div className="projects-header-left">
            <div className="projects-badge">
              <span className="projects-badge-dot" />
              <span className="projects-badge-text">FEATURED WORK // ARCHIVE</span>
            </div>
            <h2 className="projects-main-heading">
              Selected <span className="projects-heading-accent">Case Studies</span>
            </h2>
          </div>

          {/* Right: Apple Keynote Project Status Pill with Balanced Padding */}
          <div className="projects-header-right">
            <div className="projects-counter-pill">
              <span className="projects-counter-tag">PROJECT</span>
              <div className="projects-counter-numbers">
                <span className="projects-counter-current">
                  {String(currentStageIndex + 1).padStart(2, '0')}
                </span>
                <span className="projects-counter-divider">/</span>
                <span className="projects-counter-total">
                  {String(activeProjects.length).padStart(2, '0')}
                </span>
              </div>

              {/* Integrated Interactive Stage Dots */}
              <div className="projects-counter-dots" title="Jump to project">
                {activeProjects.map((_, i) => (
                  <button
                    key={i}
                    className={`projects-dot-btn ${i === currentStageIndex ? 'active' : ''} ${i < currentStageIndex ? 'passed' : ''}`}
                    onClick={() => scrollToCard(i)}
                    title={`Jump to Project ${i + 1}`}
                    aria-label={`Project ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Apple 3D Cards Stacking Deck Stage */}
        <div className="projects-cards-stage">
          {activeProjects.map((project, idx) => {
            const gallery = project.gallery || [];
            const cover = project.coverImage || '';
            
            // Build unique images list
            const imagesList = [];
            if (cover) imagesList.push(cover);
            gallery.forEach(img => {
              if (img && !imagesList.includes(img)) imagesList.push(img);
            });
            if (imagesList.length === 0) {
              imagesList.push('/favicon.svg');
            }
            
            const activeImgIdx = activeImgIndices[idx] || 0;
            const currentImg = imagesList[activeImgIdx % imagesList.length];

            const techList = Array.isArray(project.technologies)
              ? project.technologies
              : typeof project.techStack === 'string'
              ? project.techStack.split(',').map((t) => t.trim()).filter(Boolean)
              : [];

            const githubUrl = project.githubUrl || project.github || '';
            const liveUrl = (project.liveUrl || project.liveDemo || '').trim();
            const hasValidLiveUrl = Boolean(
              liveUrl &&
              liveUrl !== 'https://demo.com' &&
              !liveUrl.endsWith('.demo.com') &&
              (liveUrl.startsWith('http://') || liveUrl.startsWith('https://'))
            );
            const projectYear = project.year || (project.createdAt ? new Date(project.createdAt).getFullYear() : '2026');
            const isFeatured = project.featured || false;

            return (
              <div
                key={project.id}
                className="stage-card-new project-card-container"
                ref={(el) => (cardRefs.current[idx] = el)}
                style={{
                  width: '90vw',
                  maxWidth: '820px' // Strictly preserved
                }}
              >
                {/* GPU-Composited Darkening Overlay for Apple Stacking */}
                <div
                  className="card-stack-overlay"
                  ref={(el) => (overlayRefs.current[idx] = el)}
                />

                {/* 1. Card Header */}
                <div className="card-header-el">
                  <div className="header-text-el">
                    <h2>
                      {project.title}{' '}
                      {isFeatured && (
                        <span className="badge-featured-el">FEATURED</span>
                      )}
                    </h2>
                    <p>{project.subtitle || 'Custom Build'}</p>
                  </div>
                  <span className="header-year-el">{projectYear}</span>
                </div>

                {/* 2. Card Media: main image + thumbnail rail (Mockup Grid) */}
                <div 
                  className="card-media-el"
                  style={imagesList.length <= 1 ? { gridTemplateColumns: '1fr' } : {}}
                >
                  <div
                    className="media-main-el"
                    onClick={() => {
                      trackProjectClick(project.title);
                      setModalProject({
                        ...project,
                        image: currentImg
                      });
                    }}
                    role="button"
                    tabIndex={0}
                    title="Click for Interactive Preview"
                  >
                    {isVideoMedia(currentImg) ? (
                      <video
                        src={currentImg}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={currentImg}
                        alt={project.title}
                        onError={(e) => { e.target.src = '/favicon.svg'; }}
                      />
                    )}
                    <div className="media-hover-overlay">
                      <span className="text-xs font-mono text-white/90 bg-[#07221E]/90 px-3 py-1.5 rounded-full backdrop-blur-sm border border-[#1A5247] flex items-center gap-1.5">
                        <Expand className="w-3.5 h-3.5 text-[#F5A623]" />
                        Interactive Preview Active
                      </span>
                    </div>
                  </div>

                  {imagesList.length > 1 && (
                    <div className="media-thumbs-el">
                      {imagesList.slice(0, 3).map((imgUrl, thumbIdx) => {
                        const isActive = (activeImgIdx % imagesList.length) === thumbIdx;
                        const isFirst = thumbIdx === 0;
                        const thumbClass = isFirst ? "thumb-screenshot-el" : "thumb-cert-el";
                        const isVideo = isVideoMedia(imgUrl);

                        if (isVideo) {
                          return (
                            <div
                              key={imgUrl + thumbIdx}
                              className={`${thumbClass} ${isActive ? 'active' : ''}`}
                              onClick={() => {
                                setActiveImgIndices(prev => ({
                                  ...prev,
                                  [idx]: thumbIdx
                                }));
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#051c18',
                                color: '#f5a623',
                                cursor: 'pointer'
                              }}
                              title="Video Clip"
                            >
                              <Film size={18} />
                            </div>
                          );
                        }

                        return (
                          <img
                            key={imgUrl + thumbIdx}
                            className={`${thumbClass} ${isActive ? 'active' : ''}`}
                            src={imgUrl}
                            alt={`Thumb ${thumbIdx + 1}`}
                            onClick={() => {
                              setActiveImgIndices(prev => ({
                                  ...prev,
                                  [idx]: thumbIdx
                              }));
                            }}
                            onError={(e) => { e.target.src = '/favicon.svg'; }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Card Body */}
                <div className="card-body-el">
                  <p className="card-caption-el">
                    {project.longDesc || project.description || project.shortDesc}
                  </p>

                  <div className="tag-row-el">
                    {techList.slice(0, 5).map((tech) => (
                      <span key={tech} className="tag-el">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Card Footer */}
                <div className="card-footer-el">
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackProjectClick(project.title)}
                      className="btn-el btn-secondary-el"
                    >
                      <GithubSvg />
                      Repository
                    </a>
                  )}
                  {hasValidLiveUrl && (
                    <button
                      onClick={() => {
                        trackProjectClick(project.title);
                        setModalProject({
                          ...project,
                          image: currentImg
                        });
                      }}
                      className="btn-el btn-primary-el"
                    >
                      <ExternalLinkSvg />
                      Live Preview
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Summit Theme Live Preview Modal */}
      {modalProject && (
        <div
          className="projects-modal-backdrop"
          onClick={() => setModalProject(null)}
        >
          <div
            className="projects-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Top Close Button */}
            <button
              onClick={() => setModalProject(null)}
              className="projects-modal-close"
              aria-label="Close Preview"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="projects-modal-header">
              <div className="projects-modal-badge">
                <span className="projects-modal-badge-dot" />
                <span className="projects-modal-badge-text">
                  {modalProject.type || 'WEB APP'} // LIVE PREVIEW ENVIRONMENT
                </span>
              </div>
              <h3 className="projects-modal-title">{modalProject.title}</h3>
              <p className="projects-modal-subtitle">
                {modalProject.subtitle || 'Production Application Deployment'}
              </p>
            </div>

            {/* Interactive Browser Frame */}
            <div className="projects-modal-browser-frame">
              <div className="projects-modal-browser-bar">
                <div className="projects-modal-browser-dots">
                  <span className="p-dot dot-red" />
                  <span className="p-dot dot-amber" />
                  <span className="p-dot dot-green" />
                </div>
                <div className="projects-modal-browser-url">
                  <span className="url-lock-icon">🔒</span>
                  <span className="url-address-text">
                    {(() => {
                      const mUrl = (modalProject.liveUrl || modalProject.liveDemo || '').trim();
                      const isValid = Boolean(mUrl && mUrl !== 'https://demo.com' && !mUrl.endsWith('.demo.com'));
                      return isValid ? mUrl : 'Archive Showcase Preview';
                    })()}
                  </span>
                </div>
                <div className="projects-modal-browser-tag">
                  <span className="browser-live-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              <div className="projects-modal-media-wrap">
                {(() => {
                  const modalMedia = modalProject.image || modalProject.coverImage || '/favicon.svg';
                  const isModalVideo = isVideoMedia(modalMedia);

                  return isModalVideo ? (
                    <video
                      src={modalMedia}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="projects-modal-image"
                      style={{ maxHeight: '460px', width: '100%', background: '#051c18' }}
                    />
                  ) : (
                    <img
                      src={modalMedia}
                      alt={modalProject.title}
                      className="projects-modal-image"
                      onError={(e) => { e.target.src = '/favicon.svg'; }}
                    />
                  );
                })()}
                <div className="projects-modal-hud">
                  <div className="projects-modal-hud-item">
                    <span className="hud-dot-pulse emerald" />
                    <span>Live Production Node Connected</span>
                  </div>
                  <div className="projects-modal-hud-item">
                    <span className="hud-dot-pulse amber" />
                    <span>Edge SSL Active • 14ms Response</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Description & Technologies */}
            <div className="projects-modal-body">
              <p className="projects-modal-desc">
                {modalProject.longDesc || modalProject.description || modalProject.shortDesc}
              </p>

              <div className="projects-modal-tags">
                {(Array.isArray(modalProject.technologies)
                  ? modalProject.technologies
                  : typeof modalProject.techStack === 'string'
                  ? modalProject.techStack.split(',').map((t) => t.trim()).filter(Boolean)
                  : []
                ).map((tech) => (
                  <span key={tech} className="projects-modal-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer Controls with Generous Theme Spacing */}
            <div className="projects-modal-footer">
              <span className="projects-modal-esc-hint">
                Press <kbd>ESC</kbd> or click outside to return to keynote
              </span>
              <div className="projects-modal-actions">
                {modalProject.githubUrl && (
                  <a
                    href={modalProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="projects-modal-btn btn-modal-secondary"
                  >
                    <GithubSvg />
                    Repository
                  </a>
                )}
                {(() => {
                  const mUrl = (modalProject.liveUrl || modalProject.liveDemo || '').trim();
                  const isValid = Boolean(
                    mUrl &&
                    mUrl !== 'https://demo.com' &&
                    !mUrl.endsWith('.demo.com') &&
                    (mUrl.startsWith('http://') || mUrl.startsWith('https://'))
                  );
                  return isValid ? (
                    <a
                      href={mUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="projects-modal-btn btn-modal-primary"
                    >
                      Launch Live Project <ExternalLinkSvg />
                    </a>
                  ) : null;
                })()}
                <button
                  onClick={() => setModalProject(null)}
                  className="projects-modal-btn btn-modal-ghost"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
