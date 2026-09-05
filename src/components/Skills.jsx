import React, { forwardRef, useState, useRef, useEffect } from 'react';
import {
  Code2,
  Globe,
  Cpu,
  Database,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import SectionHeading from './SectionHeading';
import SectionLabel from './SectionLabel';
import './Skills.css';

/* ──────────────────────────────────────────────────────────────────
   CDN Helpers & Dual Fallback Icon Mapper
   ────────────────────────────────────────────────────────────────── */
const DI = (name, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-${variant}.svg`;

const SI = (name, color = '') =>
  color ? `https://cdn.simpleicons.org/${name}/${color}` : `https://cdn.simpleicons.org/${name}`;

const SKILL_ICON_MAP = {
  // Programming & Development
  'javascript': { primary: DI('javascript'), fallback: SI('javascript', 'F7DF1E') },
  'typescript': { primary: DI('typescript'), fallback: SI('typescript', '3178C6') },
  'python': { primary: DI('python'), fallback: SI('python', '3776AB') },
  'c++': { primary: DI('cplusplus'), fallback: SI('cplusplus', '00599C') },
  'c#': { primary: DI('csharp'), fallback: SI('csharp', '512BD4') },
  'php': { primary: DI('php'), fallback: SI('php', '777BB4') },
  'assembly / nasm': { primary: DI('gcc'), fallback: SI('gnu', 'A42E2B') },
  'assembly': { primary: DI('gcc'), fallback: SI('gnu', 'A42E2B') },
  'nasm': { primary: DI('gcc'), fallback: SI('gnu', 'A42E2B') },
  'html5': { primary: DI('html5'), fallback: SI('html5', 'E34F26') },
  'css3': { primary: DI('css3'), fallback: SI('css3', '1572B6') },
  'sql / mysql': { primary: DI('mysql'), fallback: SI('mysql', '4479A1') },

  // Web Development
  'react.js': { primary: DI('react'), fallback: SI('react', '61DAFB') },
  'react': { primary: DI('react'), fallback: SI('react', '61DAFB') },
  'node.js': { primary: DI('nodejs'), fallback: SI('nodedotjs', '5FA04E') },
  'node': { primary: DI('nodejs'), fallback: SI('nodedotjs', '5FA04E') },
  'express.js': { primary: DI('express'), fallback: SI('express', 'ffffff') },
  'vite': { primary: DI('vite'), fallback: SI('vite', '646CFF') },
  'tailwind css': { primary: DI('tailwindcss'), fallback: SI('tailwindcss', '06B6D4') },
  'tailwind': { primary: DI('tailwindcss'), fallback: SI('tailwindcss', '06B6D4') },
  'rest apis': { primary: DI('postman'), fallback: SI('postman', 'FF6C37') },
  'rest api': { primary: DI('postman'), fallback: SI('postman', 'FF6C37') },
  'full-stack web development': { primary: DI('nextjs'), fallback: SI('nextdotjs', 'ffffff') },
  'responsive web design': { primary: DI('bootstrap'), fallback: SI('bootstrap', '7952B3') },
  'firebase': { primary: DI('firebase', 'plain'), fallback: SI('firebase', 'FFCA28') },
  'firestore': { primary: DI('firebase', 'plain'), fallback: SI('firebase', 'FFCA28') },

  // AI & Automation
  'ai agent development': { primary: DI('tensorflow'), fallback: SI('tensorflow', 'FF6F00') },
  'generative ai': { primary: DI('pytorch'), fallback: SI('pytorch', 'EE4C2C') },
  'llm integration': { primary: DI('openai'), fallback: SI('openai', '412991') },
  'rag (retrieval-augmented generation)': { primary: DI('python'), fallback: SI('python', '3776AB') },
  'prompt engineering': { primary: DI('jupyter'), fallback: SI('jupyter', 'F37626') },
  'openai api': { primary: DI('openai'), fallback: SI('openai', '412991') },
  'google gemini api': { primary: DI('google'), fallback: SI('google', '4285F4') },
  'groq api': { primary: DI('diffusers'), fallback: SI('nvidia', '76B900') },
  'ai workflow automation': { primary: DI('n8n'), fallback: SI('n8n', 'FF6584') },
  'ai-powered email automation': { primary: DI('googlecloud'), fallback: SI('gmail', 'EA4335') },

  // Database & Storage
  'mysql': { primary: DI('mysql'), fallback: SI('mysql', '4479A1') },
  'firebase database': { primary: DI('firebase', 'plain'), fallback: SI('firebase', 'FFCA28') },
  'indexeddb': { primary: DI('postgresql'), fallback: SI('postgresql', '4169E1') },
  'data caching': { primary: DI('redis'), fallback: SI('redis', 'DC382D') },
  'database integration': { primary: DI('mongodb'), fallback: SI('mongodb', '47A248') },

  // Cybersecurity & Networking
  'cybersecurity': { primary: DI('kalilinux'), fallback: SI('kalilinux', '557C94') },
  'ethical hacking': { primary: DI('ubuntu'), fallback: SI('ubuntu', 'E95420') },
  'network security': { primary: DI('ssh'), fallback: SI('wireshark', '1679A7') },
  'cisco packet tracer': { primary: DI('cisco'), fallback: SI('cisco', '1BA0D7') },
  'cisco': { primary: DI('cisco'), fallback: SI('cisco', '1BA0D7') },
  'linux': { primary: DI('linux'), fallback: SI('linux', 'FCC624') },

  // Tools & Engineering
  'git': { primary: DI('git'), fallback: SI('git', 'F05032') },
  'github': { primary: DI('github'), fallback: SI('github', 'ffffff') },
  'github actions / version control workflows': { primary: DI('githubactions'), fallback: SI('githubactions', '2088FF') },
  'github actions': { primary: DI('githubactions'), fallback: SI('githubactions', '2088FF') },
  'cloudinary': { primary: DI('cloudinary'), fallback: SI('cloudinary', '3448C5') },
  'qz tray / thermal printing integration': { primary: DI('electron'), fallback: SI('electron', '47848F') },
  'qz tray': { primary: DI('electron'), fallback: SI('electron', '47848F') },
  'unity': { primary: DI('unity'), fallback: SI('unity', 'ffffff') },
  'blender': { primary: DI('blender'), fallback: SI('blender', 'E87D0D') },
  'figma': { primary: DI('figma'), fallback: SI('figma', 'F24E1E') },
  'canva': { primary: DI('canva'), fallback: SI('canva', '00C4CC') },
  'software engineering & system design': { primary: DI('jira'), fallback: SI('jira', '0052CC') },
  'system design': { primary: DI('jira'), fallback: SI('jira', '0052CC') }
};

function getSkillIconData(name) {
  const key = name.toLowerCase().trim();
  if (SKILL_ICON_MAP[key]) return SKILL_ICON_MAP[key];
  const matchedKey = Object.keys(SKILL_ICON_MAP).find(k => key.includes(k) || k.includes(key));
  if (matchedKey) return SKILL_ICON_MAP[matchedKey];
  return null;
}

function SkillIcon({ skillName }) {
  const iconData = getSkillIconData(skillName);
  const [src, setSrc] = useState(iconData?.primary || null);
  const [failed, setFailed] = useState(false);

  if (failed || !src) return null;

  return (
    <img
      src={src}
      alt=""
      className="marquee-item-icon"
      loading="eager"
      decoding="async"
      onError={() => {
        if (iconData?.fallback && src !== iconData.fallback) {
          setSrc(iconData.fallback);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────
   Skills Categories Data (Bespoke Icons & Tech Tags)
   ────────────────────────────────────────────────────────────────── */
const SKILL_CATEGORIES = [
  {
    id: 'programming',
    title: 'Programming & Development',
    tag: 'CORE // LOGIC',
    Icon: Code2,
    themeClass: 'cat-programming',
    direction: 'left',
    speed: '34s',
    skills: [
      'JavaScript',
      'TypeScript',
      'Python',
      'C++',
      'C#',
      'PHP',
      'Assembly / NASM',
      'HTML5',
      'CSS3',
      'SQL / MySQL'
    ]
  },
  {
    id: 'webdev',
    title: 'Web Development',
    tag: 'FULL-STACK // UI',
    Icon: Globe,
    themeClass: 'cat-webdev',
    direction: 'right',
    speed: '28s',
    skills: [
      'React.js',
      'Node.js',
      'Express.js',
      'Vite',
      'Tailwind CSS',
      'REST APIs',
      'Full-Stack Web Development',
      'Responsive Web Design',
      'Firebase',
      'Firestore'
    ]
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    tag: 'NEURAL // LLM',
    Icon: Cpu,
    themeClass: 'cat-ai',
    direction: 'left',
    speed: '38s',
    skills: [
      'AI Agent Development',
      'Generative AI',
      'LLM Integration',
      'RAG (Retrieval-Augmented Generation)',
      'Prompt Engineering',
      'OpenAI API',
      'Google Gemini API',
      'Groq API',
      'AI Workflow Automation',
      'AI-Powered Email Automation'
    ]
  },
  {
    id: 'database',
    title: 'Database & Storage',
    tag: 'SCHEMA // STORAGE',
    Icon: Database,
    themeClass: 'cat-database',
    direction: 'right',
    speed: '30s',
    skills: [
      'MySQL',
      'Firebase Database',
      'IndexedDB',
      'Data Caching',
      'Database Integration'
    ]
  },
  {
    id: 'security',
    title: 'Cybersecurity & Networking',
    tag: 'SECURITY // DEFENSE',
    Icon: ShieldCheck,
    themeClass: 'cat-security',
    direction: 'left',
    speed: '36s',
    skills: [
      'Cybersecurity',
      'Ethical Hacking',
      'Network Security',
      'Cisco Packet Tracer',
      'Linux'
    ]
  },
  {
    id: 'tools',
    title: 'Tools & Engineering',
    tag: 'DEVOPS // PIPELINE',
    Icon: Wrench,
    themeClass: 'cat-tools',
    direction: 'right',
    speed: '32s',
    skills: [
      'Git',
      'GitHub',
      'GitHub Actions / Version Control Workflows',
      'Cloudinary',
      'QZ Tray / Thermal Printing Integration',
      'Unity',
      'Blender',
      'Figma',
      'Canva',
      'Software Engineering & System Design'
    ]
  }
];

const THEME_CLASSES = ['cat-programming', 'cat-webdev', 'cat-ai', 'cat-database', 'cat-security', 'cat-tools'];

const CATEGORY_ICON_MAP = {
  programming: Code2,
  code: Code2,
  web: Globe,
  webdev: Globe,
  frontend: Globe,
  ai: Cpu,
  automation: Cpu,
  neural: Cpu,
  database: Database,
  storage: Database,
  security: ShieldCheck,
  cybersecurity: ShieldCheck,
  tools: Wrench,
  engineering: Wrench,
  creative: Wrench,
  design: Wrench,
};

function getCategoryIcon(cat, idx) {
  if (cat.Icon) return cat.Icon;
  const key = (cat.id || cat.title || '').toLowerCase();
  for (const [k, iconComp] of Object.entries(CATEGORY_ICON_MAP)) {
    if (key.includes(k)) return iconComp;
  }
  const fallbackIcons = [Code2, Globe, Cpu, Database, ShieldCheck, Wrench];
  return fallbackIcons[idx % fallbackIcons.length];
}

const Skills = forwardRef(({ style, className, skillsData, skillsConfig, unfoldProgress, ...props }, ref) => {
  const characterColRef = useRef(null);
  const characterImgRef = useRef(null);
  const characterGlowRef = useRef(null);

  const physicsRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isDirectHover: false,
  });

  useEffect(() => {
    let rafId = null;
    let isRunning = false;

    // Optimized auto-idle RAF loop for zero main-thread lag
    const tick = () => {
      const p = physicsRef.current;
      const factor = p.isDirectHover ? 0.14 : 0.08;

      p.currentX += (p.targetX - p.currentX) * factor;
      p.currentY += (p.targetY - p.currentY) * factor;

      // Pure positional translation towards cursor (NO tilt/rotation)
      if (characterImgRef.current) {
        characterImgRef.current.style.transform = `translate3d(${p.currentX.toFixed(2)}px, ${p.currentY.toFixed(2)}px, 0)`;
      }

      if (characterGlowRef.current) {
        characterGlowRef.current.style.transform = `translateX(calc(-50% + ${(p.currentX * 0.6).toFixed(2)}px))`;
      }

      // Check if settled (auto-stop RAF when idle)
      const diff = Math.abs(p.targetX - p.currentX) + Math.abs(p.targetY - p.currentY);

      if (diff > 0.02) {
        rafId = requestAnimationFrame(tick);
      } else {
        isRunning = false;
        rafId = null;
      }
    };

    const wakeUp = () => {
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    // Ambient mouse attraction across window (gentle cursor attraction without tilt)
    const handleGlobalMouseMove = (e) => {
      if (!characterColRef.current || physicsRef.current.isDirectHover) return;

      const rect = characterColRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (e.clientX - centerX) / window.innerWidth;
      const normY = (e.clientY - centerY) / window.innerHeight;

      // Cursor positional interaction (smooth floating attraction)
      physicsRef.current.targetX = normX * 14;
      physicsRef.current.targetY = normY * 8;

      wakeUp();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    wakeUp();

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleCharacterHover = (e) => {
    physicsRef.current.isDirectHover = true;
    if (!characterColRef.current) return;
    const rect = characterColRef.current.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    // Direct cursor attraction (moves gently towards cursor, zero tilt)
    physicsRef.current.targetX = relX * 12;
    physicsRef.current.targetY = relY * 6;

    // Smoothly interpolate via RAF tick loop
    wakeUp();
  };

  const handleCharacterLeave = () => {
    physicsRef.current.isDirectHover = false;
    physicsRef.current.targetX = 0;
    physicsRef.current.targetY = 0;
    wakeUp();
  };

  const categoriesToRender = (skillsConfig?.categories && Array.isArray(skillsConfig.categories) && skillsConfig.categories.length > 0)
    ? skillsConfig.categories
    : SKILL_CATEGORIES;

  return (
    <section
      ref={ref}
      style={style}
      className={`skills-marquee-section ${className || ''}`}
      id="skills"
      {...props}
    >
      <div className="skills-main-layout">
        <div className="skills-content-wrapper">
          {/* Left Column: Character (Anchored to Bottom with Mouse Attraction & 3D Tilt) */}
          <div
            ref={characterColRef}
            className="skills-character-col"
            onMouseMove={handleCharacterHover}
            onMouseLeave={handleCharacterLeave}
          >
            <div ref={characterGlowRef} className="skills-character-glow" />
            <img
              ref={characterImgRef}
              src={skillsConfig?.characterImg || "/character-transparent.png"}
              alt="Muhammad Usman 3D Character"
              className="skills-character-img"
              loading="eager"
            />
          </div>

          {/* Right Column: Heading & Frameless Fading Marquee Streams */}
          <div className="skills-streams-col">
            <div className="skills-header-block">
              <div className="skills-badge">
                <span className="skills-badge-dot" />
                <span className="skills-badge-text">SKILLS & EXPERTISE</span>
              </div>
              <h2 className="skills-main-title">
                Tech Stack <span className="skills-title-accent">& Masteries</span>
              </h2>
              <p className="skills-subtitle">
                A continuous flow of technologies, frameworks, and engineering disciplines.
              </p>
            </div>

            <div className="skills-rows-wrapper">
              {categoriesToRender.map((cat, idx) => {
                const CatIcon = getCategoryIcon(cat, idx);
                const themeClass = cat.themeClass || THEME_CLASSES[idx % THEME_CLASSES.length];
                const direction = cat.direction || (idx % 2 === 0 ? 'left' : 'right');
                const speed = cat.speed || '30s';
                const skillsList = Array.isArray(cat.skills) ? cat.skills : [];

                return (
                  <div key={cat.id || idx} className={`skills-marquee-group ${themeClass}`}>
                    {/* Futuristic Category Header with Icon Badge & Tag */}
                    <div className="skills-category-header">
                      <div className="cat-badge-container">
                        <span className="cat-icon-badge" aria-hidden="true">
                          <CatIcon size={14} strokeWidth={2.4} />
                        </span>
                        <span className="cat-status-dot" aria-hidden="true" />
                        <span className="skills-category-title">{cat.title}</span>
                        <span className="cat-tag-badge">{cat.tag || 'TECH // SPEC'}</span>
                      </div>
                      <div className="cat-line-accent" aria-hidden="true" />
                    </div>

                    <div className="marquee-row-wrapper">
                      <div
                        className={`marquee-track ${
                          direction === 'left' ? 'marquee-scroll-left' : 'marquee-scroll-right'
                        } ${themeClass}`}
                        style={{ '--marquee-speed': speed }}
                      >
                        {/* Primary List */}
                        <div className="marquee-content">
                          {skillsList.map((skill, sIdx) => (
                            <React.Fragment key={sIdx}>
                              <span className="marquee-item">
                                <SkillIcon skillName={skill} />
                                <span className="marquee-item-text">{skill}</span>
                              </span>
                              <span className="marquee-separator">•</span>
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Duplicated List for Seamless Loop */}
                        <div className="marquee-content" aria-hidden="true">
                          {skillsList.map((skill, sIdx) => (
                            <React.Fragment key={`dup-${sIdx}`}>
                              <span className="marquee-item">
                                <SkillIcon skillName={skill} />
                                <span className="marquee-item-text">{skill}</span>
                              </span>
                              <span className="marquee-separator">•</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Skills.displayName = 'Skills';

export default Skills;
