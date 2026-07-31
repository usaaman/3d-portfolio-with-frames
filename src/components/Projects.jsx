import { useEffect, useRef, useState, useMemo } from 'react';
import { X, Expand } from 'lucide-react';
import { trackProjectClick } from '../utils/analytics';
import './Projects.css';

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

export default function Projects({ projects }) {
  const scrollWrapperRef = useRef(null);
  const cardRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [activeImgIndices, setActiveImgIndices] = useState({});
  const [modalProject, setModalProject] = useState(null);

  const activeProjects = useMemo(() => {
    if (projects && projects.length > 0) {
      return projects.filter((p) => p.status === 'Published');
    }
    return [];
  }, [projects]);

  // Accessibility listener for prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Stacking Scroll Animation Engine
  useEffect(() => {
    if (reducedMotion || activeProjects.length === 0) {
      activeProjects.forEach((_, index) => {
        const card = cardRefs.current[index];
        if (card) {
          card.style.transform = '';
          card.style.opacity = '';
          card.style.filter = '';
          card.style.zIndex = '';
          card.style.pointerEvents = '';
          card.style.visibility = '';
        }
      });
      return;
    }

    const wrapper = scrollWrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      let rawProgress = scrolled / totalScrollable;
      rawProgress = Math.max(0, Math.min(1, rawProgress));

      const N = activeProjects.length;
      const sectionProgress = rawProgress * (N - 1);
      const currentIndex = Math.floor(sectionProgress);
      const localProgress = sectionProgress - currentIndex;

      activeProjects.forEach((_, index) => {
        const card = cardRefs.current[index];
        if (!card) return;

        let scale = 1;
        let translateY = 0;
        let opacity = 1;
        let blur = 0;
        let zIndex = 10;
        let pointerEvents = 'auto';
        let isVh = false;

        if (index < currentIndex) {
          // Scrolled past
          scale = 0.92;
          translateY = -60;
          opacity = 0;
          blur = 15;
          zIndex = 0;
          pointerEvents = 'none';
        } else if (index === currentIndex) {
          // Active outgoing card
          scale = 1 - 0.08 * localProgress;
          translateY = -60 * localProgress;
          opacity = 1 - localProgress;
          blur = 15 * localProgress;
          zIndex = 10;
          pointerEvents = localProgress > 0.85 ? 'none' : 'auto';
        } else if (index === currentIndex + 1) {
          // Incoming card sliding up over top
          scale = 1;
          translateY = 100 * (1 - localProgress);
          opacity = 1;
          blur = 0;
          zIndex = 20;
          pointerEvents = 'auto';
          isVh = true;
        } else {
          // In queue below
          scale = 1;
          translateY = 100;
          opacity = 0;
          blur = 0;
          zIndex = 0;
          pointerEvents = 'none';
          isVh = true;
        }

        card.style.transform = isVh 
          ? `translate3d(0, ${translateY}vh, 0) scale(${scale})` 
          : `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        card.style.opacity = `${opacity}`;
        card.style.filter = blur > 0 ? `blur(${blur}px)` : '';
        card.style.zIndex = `${zIndex}`;
        card.style.pointerEvents = pointerEvents;
        card.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
      });

      setCurrentStageIndex(currentIndex);
    };

    let active = true;
    let rafId = null;
    const updateLoop = () => {
      handleScroll();
      if (active) {
        rafId = requestAnimationFrame(updateLoop);
      }
    };

    rafId = requestAnimationFrame(updateLoop);
    window.addEventListener('resize', handleScroll);

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScroll);
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

  const totalScrollHeightVh = activeProjects.length * 100;

  if (activeProjects.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollWrapperRef}
      className="projects-scroll-wrapper relative w-full"
      style={{ height: `${totalScrollHeightVh}vh` }}
    >
      {/* Sticky Stage Viewport Container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-black">
        {/* Ambient Backlight */}
        <div className="stage-glow-new" aria-hidden="true"></div>

        {/* Header Title Layer (Top Left) */}
        <div className="absolute top-6 left-6 md:left-8 z-40 hidden md:block">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Stage Catalog</span>
          <h1 className="text-sm font-semibold text-white tracking-tight">Keynote Showcase</h1>
        </div>

        {/* Stage Position Indicator (Left Edge) */}
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-4 text-xs font-mono">
          <span className="text-zinc-500 text-[10px] uppercase tracking-widest rotate-[-90deg] mb-6">Stage Index</span>
          <div className="flex flex-col gap-3">
            {activeProjects.map((_, i) => (
              <button
                key={i}
                className={`w-2.5 h-2.5 rounded-full border border-white/30 transition-all duration-300 hover:scale-125 cursor-pointer ${
                  i === currentStageIndex ? 'bg-blue-400 border-blue-400 w-3 h-3' : 'bg-transparent'
                }`}
                onClick={() => scrollToCard(i)}
                title={`Jump to Project ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Slide Counter Badge (Top Right) */}
        <div className="absolute top-6 right-6 md:right-8 z-40 flex items-center gap-3 bg-black/60 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-zinc-300 font-mono shadow-lg">
          <span className="text-blue-400 font-bold tracking-wider">PROJECT</span>
          <span className="text-white font-bold text-sm">
            {String(currentStageIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">
            {String(activeProjects.length).padStart(2, '0')}
          </span>
        </div>

        {/* Cards Wrapper Container */}
        <div className="relative w-full h-full flex items-center justify-center">
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
              imagesList.push('/frames/frame-138.webp');
            }
            
            const activeImgIdx = activeImgIndices[idx] || 0;
            const currentImg = imagesList[activeImgIdx % imagesList.length];

            const techList = Array.isArray(project.technologies)
              ? project.technologies
              : typeof project.techStack === 'string'
              ? project.techStack.split(',').map((t) => t.trim()).filter(Boolean)
              : [];

            const githubUrl = project.githubUrl || project.github || '';
            const liveUrl = project.liveUrl || project.liveDemo || '';
            const projectYear = project.year || (project.createdAt ? new Date(project.createdAt).getFullYear() : '2026');
            const isFeatured = project.featured || false;

            return (
              <div
                key={project.id}
                className="stage-card-new project-card-container absolute"
                ref={(el) => (cardRefs.current[idx] = el)}
                style={{
                  width: '90vw',
                  maxWidth: '820px' // Mockup updated to 820px
                }}
              >
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
                  <div className="media-main-el">
                    <img
                      src={currentImg}
                      alt={project.title}
                      onError={(e) => { e.target.src = '/frames/frame-138.webp'; }}
                    />
                    <div className="media-hover-overlay">
                      <span className="text-xs font-mono text-white/90 bg-black/70 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                        <Expand className="w-3.5 h-3.5 text-blue-400" />
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
                            onError={(e) => { e.target.src = '/frames/frame-138.webp'; }}
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
                  {liveUrl && (
                    <button
                      onClick={() => {
                        trackProjectClick(project.title);
                        setModalProject({
                          title: project.title,
                          image: currentImg,
                          liveUrl: liveUrl
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

      {/* Fullscreen Interactive Sandbox Preview Modal */}
      {modalProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-all duration-300"
          onClick={() => setModalProject(null)}
        >
          <div
            className="apple-glass rounded-2xl w-full max-w-4xl p-6 relative border border-white/20 shadow-2xl transform scale-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalProject(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">{modalProject.title}</h3>
            <p className="text-xs text-zinc-400 mb-4 font-mono">Interactive Sandbox Simulation Mode</p>

            <div className="relative aspect-16-9 rounded-xl overflow-hidden bg-black border border-white/10 mb-4">
              <img src={modalProject.image} alt={modalProject.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-xs text-zinc-300 font-mono space-y-1">
                  <p><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-2 animate-pulse"></span>Status: Live Production Environment Connected</p>
                  <p><span className="w-2 h-2 rounded-full bg-blue-400 inline-block mr-2"></span>Latency: 14ms | WebSockets Active</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-zinc-400">Click anywhere outside or hit close to return to keynote stage.</span>
              <div className="flex gap-3">
                <a
                  href={modalProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                >
                  Open Live Link <ExternalLinkSvg />
                </a>
                <button
                  onClick={() => setModalProject(null)}
                  className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
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
