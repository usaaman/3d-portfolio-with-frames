import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import './Skills.css';

/* ──────────────────────────────────────────────────────────────────
   DEVICON CDN helper — fetches colorful SVG logos
   ────────────────────────────────────────────────────────────────── */
const DI = (name, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-${variant}.svg`;

/* ──────────────────────────────────────────────────────────────────
   DEVICON NAME MAPPER — Resolves any skill name to its colored logo
   ────────────────────────────────────────────────────────────────── */
const DEVICON_MAP = {
  'react': DI('react', 'original'),
  'react.js': DI('react', 'original'),
  'javascript': DI('javascript', 'original'),
  'js': DI('javascript', 'original'),
  'typescript': DI('typescript', 'original'),
  'ts': DI('typescript', 'original'),
  'python': DI('python', 'original'),
  'c++': DI('cplusplus', 'original'),
  'cpp': DI('cplusplus', 'original'),
  'node.js': DI('nodejs', 'original'),
  'node': DI('nodejs', 'original'),
  'express': DI('express', 'original'),
  'express.js': DI('express', 'original'),
  'php': DI('php', 'original'),
  'html5': DI('html5', 'original'),
  'html': DI('html5', 'original'),
  'css3': DI('css3', 'original'),
  'css': DI('css3', 'original'),
  'git': DI('git', 'original'),
  'docker': DI('docker', 'original'),
  'mongodb': DI('mongodb', 'original'),
  'mongo': DI('mongodb', 'original'),
  'mysql': DI('mysql', 'original'),
  'firebase': DI('firebase', 'plain'),
  'cloudinary': DI('cloudinary', 'original'),
  'kubernetes': DI('kubernetes', 'original'),
  'linux': DI('linux', 'original'),
  'bash': DI('bash', 'original'),
  'nginx': DI('nginx', 'original'),
  'figma': DI('figma', 'original'),
  'photoshop': DI('photoshop', 'plain'),
  'illustrator': DI('illustrator', 'plain'),
  'blender': DI('blender', 'original'),
  'canva': DI('canva', 'original'),
  'unity': DI('unity', 'original'),
  'adobe xd': DI('xd', 'plain'),
  'xd': DI('xd', 'plain'),
  'premiere pro': DI('premierepro', 'plain'),
  'premiere': DI('premierepro', 'plain'),
  'full-stack dev': DI('angular', 'original'),
  'full-stack': DI('angular', 'original'),
  'full stack': DI('angular', 'original'),
  'backend dev': DI('django', 'plain'),
  'backend': DI('django', 'plain'),
  'front-end dev': DI('vuejs', 'original'),
  'frontend': DI('vuejs', 'original'),
  'web dev': DI('nextjs', 'original'),
  'next.js': DI('nextjs', 'original'),
  'ai integration': DI('tensorflow', 'original'),
  'tensorflow': DI('tensorflow', 'original'),
  'ai chatbot': DI('pytorch', 'original'),
  'pytorch': DI('pytorch', 'original'),
  'graphql': DI('graphql', 'plain'),
  'redux': DI('redux', 'original'),
  'cybersecurity': DI('ubuntu', 'plain'),
  'network security': DI('ssh', 'original'),
  'info security': DI('kalilinux', 'original'),
  'vuln. assessment': DI('rust', 'original'),
  'pentesting': DI('haskell', 'original'),
  'cryptography': DI('go', 'original-wordmark'),
  'algorithms': DI('java', 'original'),
  'data structures': DI('postgresql', 'original'),
  'after effects': DI('aftereffects', 'plain'),
  'unreal engine': DI('unrealengine', 'original'),
  'dart / flutter': DI('dart', 'original'),
  'dart': DI('dart', 'original'),
  'flutter': DI('dart', 'original'),
  'project tools': DI('trello', 'plain'),
};

function resolveSkillIconUrl(skill) {
  if (skill.icon && typeof skill.icon === 'string' && (skill.icon.startsWith('http') || skill.icon.startsWith('/'))) {
    return skill.icon;
  }
  if (skill.iconUrl && typeof skill.iconUrl === 'string' && (skill.iconUrl.startsWith('http') || skill.iconUrl.startsWith('/'))) {
    return skill.iconUrl;
  }
  const key = (skill.name || '').toLowerCase().trim();
  if (DEVICON_MAP[key]) {
    return DEVICON_MAP[key];
  }
  const matchedKey = Object.keys(DEVICON_MAP).find(k => key.includes(k));
  if (matchedKey) {
    return DEVICON_MAP[matchedKey];
  }
  return DI('javascript', 'original');
}

/* ──────────────────────────────────────────────────────────────────
   EXACTLY 48 SKILLS — Every single skill has a unique, colorful logo
   ────────────────────────────────────────────────────────────────── */
const DEFAULT_SKILLS = [
  // 1-12: Core Engineering & Languages
  { name: 'React',          icon: DI('react', 'original') },
  { name: 'JavaScript',     icon: DI('javascript', 'original') },
  { name: 'TypeScript',     icon: DI('typescript', 'original') },
  { name: 'Python',         icon: DI('python', 'original') },
  { name: 'C++',            icon: DI('cplusplus', 'original') },
  { name: 'Node.js',        icon: DI('nodejs', 'original') },
  { name: 'Express',        icon: DI('express', 'original') },
  { name: 'PHP',            icon: DI('php', 'original') },
  { name: 'HTML5',          icon: DI('html5', 'original') },
  { name: 'CSS3',           icon: DI('css3', 'original') },
  { name: 'Git',            icon: DI('git', 'original') },
  { name: 'Docker',         icon: DI('docker', 'original') },

  // 13-20: Databases, Cloud & DevOps
  { name: 'MongoDB',        icon: DI('mongodb', 'original') },
  { name: 'MySQL',          icon: DI('mysql', 'original') },
  { name: 'Firebase',       icon: DI('firebase', 'plain') },
  { name: 'Cloudinary',     icon: DI('cloudinary', 'original') },
  { name: 'Kubernetes',     icon: DI('kubernetes', 'original') },
  { name: 'Linux',          icon: DI('linux', 'original') },
  { name: 'Bash',           icon: DI('bash', 'original') },
  { name: 'Nginx',          icon: DI('nginx', 'original') },

  // 21-28: Design, 3D & Creative
  { name: 'Figma',          icon: DI('figma', 'original') },
  { name: 'Photoshop',      icon: DI('photoshop', 'plain') },
  { name: 'Illustrator',    icon: DI('illustrator', 'plain') },
  { name: 'Blender',        icon: DI('blender', 'original') },
  { name: 'Canva',          icon: DI('canva', 'original') },
  { name: 'Unity',          icon: DI('unity', 'original') },
  { name: 'Adobe XD',       icon: DI('xd', 'plain') },
  { name: 'Premiere Pro',   icon: DI('premierepro', 'plain') },

  // 29-36: Web Engineering & Frameworks
  { name: 'Full-Stack Dev', icon: DI('angular', 'original') },
  { name: 'Backend Dev',    icon: DI('django', 'plain') },
  { name: 'Front-End Dev',  icon: DI('vuejs', 'original') },
  { name: 'Web Dev',        icon: DI('nextjs', 'original') },
  { name: 'AI Integration', icon: DI('tensorflow', 'original') },
  { name: 'AI Chatbot',     icon: DI('pytorch', 'original') },
  { name: 'GraphQL',        icon: DI('graphql', 'plain') },
  { name: 'Redux',          icon: DI('redux', 'original') },

  // 37-44: Cybersecurity & CS Core
  { name: 'Cybersecurity',        icon: DI('ubuntu', 'plain') },
  { name: 'Network Security',     icon: DI('ssh', 'original') },
  { name: 'Info Security',        icon: DI('kalilinux', 'original') },
  { name: 'Vuln. Assessment',     icon: DI('rust', 'original') },
  { name: 'Pentesting',           icon: DI('haskell', 'original') },
  { name: 'Cryptography',         icon: DI('go', 'original-wordmark') },
  { name: 'Algorithms',           icon: DI('java', 'original') },
  { name: 'Data Structures',      icon: DI('postgresql', 'original') },

  // 45-48: Creative & Workflow Systems
  { name: 'After Effects',  icon: DI('aftereffects', 'plain') },
  { name: 'Unreal Engine',  icon: DI('unrealengine', 'original') },
  { name: 'Dart / Flutter', icon: DI('dart', 'original') },
  { name: 'Project Tools',  icon: DI('trello', 'plain') },
];

/* ──────────────────────────────────────────────────────────────────
   3D CARD ITEM — rAF Optimized High-FPS Smooth Tracking
   ────────────────────────────────────────────────────────────────── */
function SkillCard3D({ skill, index }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      cardRef.current.style.setProperty('--tilt-x', `${y * -6}deg`);
      cardRef.current.style.setProperty('--tilt-y', `${x * 6}deg`);
      cardRef.current.style.setProperty('--shift-x', `${x * 5}px`);
      cardRef.current.style.setProperty('--shift-y', `${y * 5}px`);
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsHovered(false);
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--shift-x', '0px');
    card.style.setProperty('--shift-y', '0px');
  };

  const iconUrl = resolveSkillIconUrl(skill);

  return (
    <div
      ref={cardRef}
      className={`sw-cell-3d${isHovered ? ' is-hovered' : ''}`}
      style={{ '--i': index }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sw-cell-inner-3d">
        <div className="sw-icon-wrap-3d">
          <img
            src={iconUrl}
            alt={skill.name}
            className="sw-devicon-3d"
            loading="lazy"
            width="32"
            height="32"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DI('javascript', 'original');
            }}
          />
        </div>
        <span className="sw-label-3d">{skill.name}</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SKILLS COMPONENT (rAF Batched 60FPS Ambient + Local Tracking)
   ────────────────────────────────────────────────────────────────── */
const Skills = React.forwardRef(({ style, unfoldProgress, skillsData }, outerRef) => {
  const sectionRef = useRef(null);
  const secRafRef = useRef(null);
  useImperativeHandle(outerRef, () => sectionRef.current);
  const [isVisible, setIsVisible] = useState(false);

  /* Dynamic skills list from props/CMS or fallback to 48 skills */
  const skillsList = (skillsData && skillsData.length > 0) ? skillsData : DEFAULT_SKILLS;

  /* Global section-wide mouse position tracking (rAF throttled for 60/120Hz smooth rendering) */
  const handleSectionMouseMove = (e) => {
    const el = sectionRef.current;
    if (!el) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (secRafRef.current) cancelAnimationFrame(secRafRef.current);
    secRafRef.current = requestAnimationFrame(() => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      sectionRef.current.style.setProperty('--sec-mouse-x', x.toFixed(3));
      sectionRef.current.style.setProperty('--sec-mouse-y', y.toFixed(3));
    });
  };

  const handleSectionMouseLeave = () => {
    if (secRafRef.current) cancelAnimationFrame(secRafRef.current);
    const el = sectionRef.current;
    if (!el) return;
    el.style.setProperty('--sec-mouse-x', '0');
    el.style.setProperty('--sec-mouse-y', '0');
  };

  /* Intersection Observer */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Respond to unfoldProgress from HeroAboutScroll */
  useEffect(() => {
    if (unfoldProgress !== undefined && unfoldProgress > 0.1) setIsVisible(true);
  }, [unfoldProgress]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className={`skills-wall-section${isVisible ? ' is-revealed' : ''}`}
      style={style}
      aria-labelledby="skills-heading"
      onMouseMove={handleSectionMouseMove}
      onMouseLeave={handleSectionMouseLeave}
    >
      {/* Ambient glows */}
      <div className="sw-glow sw-glow-1" />
      <div className="sw-glow sw-glow-2" />

      {/* Header */}
      <div className="sw-header">
        <div className="sw-eyebrow">
          <span className="sw-dot" />
          <span>Skills &amp; Technologies</span>
        </div>
        <h2 id="skills-heading" className="sw-title">
          My <span className="font-script" style={{ color: '#F5A623', display: 'inline-block', transform: 'rotate(-1.5deg)' }}>Tech Stack</span>
        </h2>
        <p className="sw-subtitle">
          {skillsList.length} tools, languages &amp; frameworks I build with every day.
        </p>
      </div>

      {/* Dynamic 3D Grid (8 Columns Desktop = 6 rows × 8 = 48 skills) */}
      <div className="sw-grid-3d">
        {skillsList.map((skill, i) => (
          <SkillCard3D key={skill.id || skill.name || i} skill={skill} index={i} />
        ))}
      </div>
    </section>
  );
});

Skills.displayName = 'Skills';
export default Skills;
