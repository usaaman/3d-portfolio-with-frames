import React, { useEffect, useRef, useState } from 'react';
import './Skills.css';

const CATEGORIES = [
  {
    id: 'soft-skills',
    name: 'Soft Skills & Mindset',
    bgTint: 'rgba(255, 255, 255, 0.06)',
    borderTint: 'rgba(255, 255, 255, 0.35)',
    radius: 160,
    duration: 34,
    direction: -1,
    skills: [
      { name: 'Design Thinking', icon: '\uf0eb', isBrand: false },
      { name: 'Content Creation', icon: '\uf5ad', isBrand: false },
      { name: 'Problem Solving', icon: '\uf12e', isBrand: false },
      { name: 'Teamwork', icon: '\uf0c0', isBrand: false },
      { name: 'Communication', icon: '\uf0e6', isBrand: false }
    ]
  },
  {
    id: 'ai-cloud',
    name: 'AI, CS Core & Infrastructure',
    bgTint: 'rgba(255, 255, 255, 0.06)',
    borderTint: 'rgba(255, 255, 255, 0.35)',
    radius: 230,
    duration: 46,
    direction: 1,
    skills: [
      { name: 'AI Chatbot', icon: '\uf544', isBrand: false },
      { name: 'AI Integration', icon: '\uf5dc', isBrand: false },
      { name: 'Firebase', icon: '\uf06d', isBrand: false },
      { name: 'Cloudinary', icon: '\uf0ee', isBrand: false },
      { name: 'Algorithms', icon: '\uf0e8', isBrand: false },
      { name: 'Data Structures', icon: '\uf1c0', isBrand: false },
      { name: 'Docker', icon: '\uf308', isBrand: true }
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & CS Core',
    bgTint: 'rgba(255, 255, 255, 0.06)',
    borderTint: 'rgba(255, 255, 255, 0.35)',
    radius: 300,
    duration: 58,
    direction: -1,
    skills: [
      { name: 'Network Security', icon: '\uf6ff', isBrand: false },
      { name: 'Information Security', icon: '\uf505', isBrand: false },
      { name: 'Cybersecurity', icon: '\uf3ed', isBrand: false },
      { name: 'Security Analysis', icon: '\uf080', isBrand: false },
      { name: 'Vulnerability Assessment', icon: '\uf188', isBrand: false },
      { name: 'Pentesting', icon: '\uf120', isBrand: false },
      { name: 'Cryptography', icon: '\uf084', isBrand: false },
      { name: 'Networking', icon: '\uf233', isBrand: false },
      { name: 'Linux', icon: '\uf17c', isBrand: true }
    ]
  },
  {
    id: 'programming-web',
    name: 'Programming & Web Engineering',
    bgTint: 'rgba(255, 255, 255, 0.06)',
    borderTint: 'rgba(255, 255, 255, 0.35)',
    radius: 370,
    duration: 72,
    direction: 1,
    skills: [
      { name: 'Full-Stack Dev', icon: '\uf5fd', isBrand: false },
      { name: 'Backend Dev', icon: '\uf085', isBrand: false },
      { name: 'Web Dev', icon: '\uf0ac', isBrand: false },
      { name: 'Front-End Dev', icon: '\uf108', isBrand: false },
      { name: 'Python', icon: '\uf3e2', isBrand: true },
      { name: 'C++', icon: '\uf121', isBrand: false },
      { name: 'Node.js', icon: '\uf3d3', isBrand: true },
      { name: 'Express', icon: '\uf233', isBrand: false },
      { name: 'React.js', icon: '\uf41b', isBrand: true },
      { name: 'JavaScript', icon: '\uf3b8', isBrand: true },
      { name: 'TypeScript', icon: '\uf126', isBrand: false },
      { name: 'MySQL', icon: '\uf1c0', isBrand: false },
      { name: 'MongoDB', icon: '\uf06c', isBrand: false },
      { name: 'Git', icon: '\uf841', isBrand: true }
    ]
  },
  {
    id: 'design',
    name: 'Design, 3D & Visual Arts',
    bgTint: 'rgba(255, 255, 255, 0.06)',
    borderTint: 'rgba(255, 255, 255, 0.35)',
    radius: 440,
    duration: 86,
    direction: -1,
    skills: [
      { name: 'UI Design', icon: '\uf55b', isBrand: false },
      { name: 'Graphic Design', icon: '\uf53f', isBrand: false },
      { name: 'Adobe Photoshop', icon: '\uf03e', isBrand: false },
      { name: 'Illustrator', icon: '\uf5ac', isBrand: false },
      { name: 'Figma', icon: '\uf8e0', isBrand: true },
      { name: 'Canva', icon: '\uf0d0', isBrand: false },
      { name: 'Blender', icon: '\uf1b2', isBrand: false },
      { name: '3D Modeling', icon: '\uf1b3', isBrand: false },
      { name: 'Unity', icon: '\uf0e8', isBrand: false },
      { name: 'Video Editing', icon: '\uf008', isBrand: false },
      { name: 'CapCut', icon: '\uf03d', isBrand: false },
      { name: 'Visual Arts', icon: '\uf1fc', isBrand: false },
      { name: 'HTML', icon: '\uf13b', isBrand: true },
      { name: 'CSS', icon: '\uf13c', isBrand: true },
      { name: 'PHP', icon: '\uf457', isBrand: true }
    ]
  }
];

const CENTER_X = 500;
const CENTER_Y = 500;
const CENTER_BADGE_RADIUS = 78;

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians))
  };
}

function describeArcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

const Skills = React.forwardRef(({ style, unfoldProgress }, ref) => {
  const ringsContainerRef = useRef(null);
  const centerElementRef = useRef(null);
  const centerSubRef = useRef(null);
  const targetProgressRef = useRef(unfoldProgress !== undefined ? unfoldProgress : 0);

  const [isOrbitPaused, setIsOrbitPaused] = useState(false);

  useEffect(() => {
    if (unfoldProgress !== undefined) {
      targetProgressRef.current = unfoldProgress;
    }
  }, [unfoldProgress]);

  useEffect(() => {
    let scaleGroupElements = [];
    let ringGroupElements = [];
    let currentProgress = 0;
    let animFrameId = null;

    const getResponsiveDimensions = () => {
      const isMobile = window.innerWidth < 768;
      return {
        pillHeight: isMobile ? 36 : 44,
        fontSize: isMobile ? 14 : 17.5
      };
    };

    const initializeRings = () => {
      const ringsContainer = ringsContainerRef.current;
      if (!ringsContainer) return;
      ringsContainer.innerHTML = '';
      scaleGroupElements = [];
      ringGroupElements = [];

      const { pillHeight, fontSize } = getResponsiveDimensions();

      CATEGORIES.forEach((cat, categoryIndex) => {
        const ringRadius = cat.radius;
        const numSkills = cat.skills.length;

        const charWidth = fontSize * 0.78;
        const iconAndPaddingPx = 54;
        const capRadiusPx = pillHeight / 2;
        const totalCapAngleDeg = ((capRadiusPx * 2) / ringRadius) * (180 / Math.PI);

        let skillContentAngles = cat.skills.map(skill => {
          const textPx = skill.name.length * charWidth;
          const contentPx = textPx + iconAndPaddingPx;
          return (contentPx / ringRadius) * (180 / Math.PI);
        });

        const totalPillVisualAngles = skillContentAngles.reduce((acc, val) => acc + val + totalCapAngleDeg, 0);
        const remainingFreeAngle = 360 - totalPillVisualAngles;

        let clearGapAngle = remainingFreeAngle / numSkills;

        if (clearGapAngle < 5) {
          let scaleFactor = (360 - (5 * numSkills) - (totalCapAngleDeg * numSkills)) / skillContentAngles.reduce((a, b) => a + b, 0);
          scaleFactor = Math.max(0.6, scaleFactor);
          skillContentAngles = skillContentAngles.map(a => a * scaleFactor);
          
          const newTotalPills = skillContentAngles.reduce((acc, val) => acc + val + totalCapAngleDeg, 0);
          clearGapAngle = Math.max(3.5, (360 - newTotalPills) / numSkills);
        }

        const scaleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        scaleGroup.setAttribute('id', `scaleGroup-${categoryIndex}`);
        scaleGroup.classList.add('ring-scale-group');

        const initialScale = CENTER_BADGE_RADIUS / ringRadius;
        scaleGroup.setAttribute('transform', `translate(${CENTER_X}, ${CENTER_Y}) scale(${initialScale}) translate(-${CENTER_X}, -${CENTER_Y})`);
        scaleGroup.style.opacity = '0';

        const ringGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        ringGroup.classList.add('skills-orbit-ring');
        
        const animName = cat.direction === 1 ? 'skills-spin-cw' : 'skills-spin-ccw';
        ringGroup.style.animation = `${animName} ${cat.duration}s linear infinite`;

        let currentAngle = 0;

        cat.skills.forEach((skill, skillIndex) => {
          const contentAngle = skillContentAngles[skillIndex];
          const capAngle = (capRadiusPx / ringRadius) * (180 / Math.PI);

          const startAngle = currentAngle + capAngle;
          const endAngle = startAngle + contentAngle;
          const pathId = `path-${categoryIndex}-${skillIndex}`;

          const pillGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          pillGroup.classList.add('skills-pill-group');

          const arcPath = describeArcPath(CENTER_X, CENTER_Y, ringRadius, startAngle, endAngle);

          const textBufferDeg = 8;
          const textArcPath = describeArcPath(CENTER_X, CENTER_Y, ringRadius, startAngle - textBufferDeg, endAngle + textBufferDeg);

          const textPathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          textPathElem.setAttribute('id', pathId);
          textPathElem.setAttribute('d', textArcPath);
          textPathElem.setAttribute('fill', 'none');
          pillGroup.appendChild(textPathElem);

          const pillBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pillBg.setAttribute('d', arcPath);
          pillBg.setAttribute('fill', 'none');
          pillBg.setAttribute('stroke', 'rgba(255, 255, 255, 0.05)');
          pillBg.setAttribute('stroke-width', pillHeight);
          pillBg.setAttribute('stroke-linecap', 'round');
          pillGroup.appendChild(pillBg);

          const pillTint = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pillTint.setAttribute('d', arcPath);
          pillTint.setAttribute('fill', 'none');
          pillTint.setAttribute('stroke', cat.bgTint);
          pillTint.setAttribute('stroke-width', pillHeight - 2);
          pillTint.setAttribute('stroke-linecap', 'round');
          pillGroup.appendChild(pillTint);

          const pillBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pillBorder.setAttribute('d', arcPath);
          pillBorder.setAttribute('fill', 'none');
          pillBorder.setAttribute('stroke', 'rgba(255, 255, 255, 0.28)');
          pillBorder.setAttribute('stroke-width', pillHeight);
          pillBorder.setAttribute('stroke-linecap', 'round');
          pillGroup.appendChild(pillBorder);

          const pillAccentBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pillAccentBorder.setAttribute('d', arcPath);
          pillAccentBorder.setAttribute('fill', 'none');
          pillAccentBorder.setAttribute('stroke', cat.borderTint);
          pillAccentBorder.setAttribute('stroke-width', pillHeight + 2);
          pillAccentBorder.setAttribute('stroke-linecap', 'round');
          pillAccentBorder.setAttribute('stroke-opacity', '0.5');
          pillGroup.appendChild(pillAccentBorder);

          const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textElem.setAttribute('class', 'skills-pill-text');
          textElem.setAttribute('font-size', fontSize.toString());
          textElem.setAttribute('text-rendering', 'geometricPrecision');

          const textPathRef = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
          textPathRef.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${pathId}`);
          textPathRef.setAttribute('startOffset', '50%');
          textPathRef.setAttribute('text-anchor', 'middle');

          const iconSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          iconSpan.setAttribute('class', skill.isBrand ? 'skills-fa-brand' : 'skills-fa-solid');
          iconSpan.setAttribute('fill', '#00f5ff');
          iconSpan.setAttribute('font-size', (fontSize + 4).toString());
          iconSpan.textContent = skill.icon + '\u00A0\u00A0';
          textPathRef.appendChild(iconSpan);

          const nameSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          nameSpan.setAttribute('fill', '#ffffff');
          nameSpan.setAttribute('font-weight', '700');
          nameSpan.textContent = skill.name;
          textPathRef.appendChild(nameSpan);

          textElem.appendChild(textPathRef);
          pillGroup.appendChild(textElem);

          ringGroup.appendChild(pillGroup);

          currentAngle = endAngle + capAngle + clearGapAngle;
        });

        scaleGroup.appendChild(ringGroup);
        ringsContainer.appendChild(scaleGroup);
        scaleGroupElements.push(scaleGroup);
        ringGroupElements.push(ringGroup);
      });
    };

    const updateUnfoldProgress = (progress) => {
      const numRings = CATEGORIES.length;
      const slotWidth = 1 / numRings;

      CATEGORIES.forEach((cat, idx) => {
        const ringRadius = cat.radius;
        const collapsedScale = (CENTER_BADGE_RADIUS - 10) / ringRadius;

        const slotStart = idx * slotWidth;
        const slotEnd = (idx + 1) * slotWidth;

        let ringProgress = 0;
        if (progress >= slotEnd) {
          ringProgress = 1;
        } else if (progress <= slotStart) {
          ringProgress = 0;
        } else {
          ringProgress = (progress - slotStart) / slotWidth;
        }

        const eased = easeOutCubic(ringProgress);
        const currentScale = collapsedScale + (1 - collapsedScale) * eased;
        const currentOpacity = Math.min(1, ringProgress * 1.5);

        const scaleGroup = scaleGroupElements[idx];
        if (scaleGroup) {
          scaleGroup.setAttribute('transform', `translate(${CENTER_X}, ${CENTER_Y}) scale(${currentScale.toFixed(4)}) translate(-${CENTER_X}, -${CENTER_Y})`);
          scaleGroup.style.opacity = currentOpacity.toFixed(3);
        }
      });
    };

    const renderLoop = () => {
      currentProgress += (targetProgressRef.current - currentProgress) * 0.12;
      
      if (Math.abs(targetProgressRef.current - currentProgress) > 0.0001) {
        updateUnfoldProgress(currentProgress);
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    initializeRings();
    
    let lastIsMobile = window.innerWidth < 768;
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      if (currentIsMobile !== lastIsMobile) {
        lastIsMobile = currentIsMobile;
        initializeRings();
      }
    };
    window.addEventListener('resize', handleResize);

    updateUnfoldProgress(0);
    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  const handleCenterClick = () => {
    setIsOrbitPaused(prev => {
      const next = !prev;
      const ringElements = document.querySelectorAll('.skills-orbit-ring');

      ringElements.forEach(ring => {
        if (next) {
          ring.classList.add('paused');
        } else {
          ring.classList.remove('paused');
        }
      });

      return next;
    });
  };

  return (
    <div
      id="skills"
      ref={ref}
      style={style}
      className="stage-content skills-stage-content text-slate-100 font-sans overflow-hidden select-none bg-[#060a12] flex flex-col items-center justify-center"
    >
      {/* Ambient Glowing Background Lights */}
      <div className="skills-ambient-glow-1"></div>
      <div className="skills-ambient-glow-2"></div>
      <div className="skills-ambient-glow-3"></div>

      {/* Header */}
      <header className="relative z-10 pt-2 pb-4 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>TECHNICAL SKILLS & EXPERTISE</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-1 font-sans">
          Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Orbit Skills System</span>
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto font-light">
          Scroll to unfold 50+ specialized skills across 5 concentric rings. Click center badge to pause or resume rotation.
        </p>
      </header>

      {/* Main Glassmorphism Orbit Container */}
      <main className="relative z-10 w-[88vw] h-[88vw] max-w-[620px] max-h-[620px] aspect-square rounded-[36px] md:rounded-[44px] skills-glass-card p-2 md:p-3 flex items-center justify-center overflow-hidden mx-auto my-2">
        {/* Corner Glass Accents */}
        <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-sm pointer-events-none"></div>
        <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-sm pointer-events-none"></div>
        <div className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-sm pointer-events-none"></div>
        <div className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-sm pointer-events-none"></div>

        {/* SVG Orbit System Canvas */}
        <svg id="orbitSvg" viewBox="0 0 1000 1000" textRendering="geometricPrecision" shapeRendering="geometricPrecision" className="w-full h-full select-none">
          <defs>
            <filter id="skillsNeumorphicShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="-8" dy="-8" stdDeviation="10" floodColor="rgba(255, 255, 255, 0.12)" />
              <feDropShadow dx="12" dy="12" stdDeviation="14" floodColor="rgba(0, 0, 0, 0.85)" />
            </filter>

            <linearGradient id="skillsNeumorphicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Dynamic Skill Rings Container */}
          <g id="ringsContainer" ref={ringsContainerRef}></g>

          {/* Neumorphic Center Emblem */}
          <g
            id="centerElement"
            ref={centerElementRef}
            transform="translate(500, 500)"
            className="skills-neumorphic-center"
            onClick={handleCenterClick}
          >
            <circle id="pingCircle" r="82" fill="none" stroke="rgba(0, 245, 255, 0.4)" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '3s' }}></circle>
            <circle r="78" fill="url(#skillsNeumorphicGrad)" filter="url(#skillsNeumorphicShadow)" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="2"></circle>
            <circle r="68" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5"></circle>
            
            <text id="centerTitle" y="-4" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="800" letterSpacing="1.5">MY SKILLS</text>
            <text
              id="centerSub"
              ref={centerSubRef}
              y="18"
              textAnchor="middle"
              fill={isOrbitPaused ? '#38bdf8' : '#00f5ff'}
              fontSize="11"
              fontWeight="600"
              letterSpacing="0.5"
            >
              {isOrbitPaused ? 'click to play' : 'click to pause'}
            </text>
          </g>
        </svg>
      </main>
    </div>
  );
});

export default Skills;
