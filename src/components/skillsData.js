import {
  SiJavascript, SiTypescript, SiPython, SiPhp, SiCplusplus, SiHtml5, SiCss,
  SiJson, SiReact, SiNextdotjs, SiTailwindcss, SiVite, SiFigma, SiFramer,
  SiGreensock, SiThreedotjs, SiNodedotjs, SiExpress, SiFirebase, SiMysql,
  SiCloudinary, SiAnthropic, SiClaude, SiBlender, SiUnity, SiGit, SiGithub,
  SiUml, SiGoogleanalytics, SiCisco,
} from 'react-icons/si';
import {
  MonitorSmartphone, LayoutTemplate, Database, Webhook, Sparkles,
  BrainCircuit, TerminalSquare, Wand2, MessageCircle, Palette, ImagePlus,
  PenTool, Clapperboard, Scissors, Box, Building2, ClipboardList, Network,
  Code2, Puzzle,
} from 'lucide-react';

// 50 skills, in the order given — split into 5 rows of 10 downstream
export const SKILLS = [
  { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'PHP', icon: SiPhp, color: '#777BB4' },
  { name: 'C++', icon: SiCplusplus, color: '#00599C' },
  { name: 'HTML', icon: SiHtml5, color: '#E34F26' },
  { name: 'CSS', icon: SiCss, color: '#663399' },
  { name: 'JSON', icon: SiJson, color: '#8BC34A' },
  { name: 'React.js', icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#FFFFFF' },

  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#38BDF8' },
  { name: 'Vite', icon: SiVite, color: '#A78BFA' },
  { name: 'Responsive Design', icon: MonitorSmartphone, color: '#22D3EE' },
  { name: 'UI Design', icon: LayoutTemplate, color: '#A78BFA' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { name: 'Framer Motion', icon: SiFramer, color: '#FFFFFF' },
  { name: 'GSAP', icon: SiGreensock, color: '#88CE02' },
  { name: 'Three.js', icon: SiThreedotjs, color: '#FFFFFF' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#5FA04E' },
  { name: 'Express.js', icon: SiExpress, color: '#FFFFFF' },

  { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
  { name: 'Firestore', icon: Database, color: '#22D3EE' },
  { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
  { name: 'Cloudinary', icon: SiCloudinary, color: '#3448C5' },
  { name: 'REST APIs', icon: Webhook, color: '#A78BFA' },
  { name: 'OpenAI', icon: Sparkles, color: '#FFFFFF' },
  { name: 'Anthropic', icon: SiAnthropic, color: '#D4A27F' },
  { name: 'Claude', icon: SiClaude, color: '#DA7756' },
  { name: 'AI Integration', icon: BrainCircuit, color: '#22D3EE' },
  { name: 'Prompt Engineering', icon: TerminalSquare, color: '#A78BFA' },

  { name: 'Generative AI', icon: Wand2, color: '#22D3EE' },
  { name: 'Chatbots', icon: MessageCircle, color: '#A78BFA' },
  { name: 'Blender', icon: SiBlender, color: '#F5792A' },
  { name: 'Unity', icon: SiUnity, color: '#FFFFFF' },
  { name: 'Canva', icon: Palette, color: '#00C4CC' },
  { name: 'Adobe Photoshop', icon: ImagePlus, color: '#31A8FF' },
  { name: 'Graphic Design', icon: PenTool, color: '#A78BFA' },
  { name: 'Video Editing', icon: Clapperboard, color: '#22D3EE' },
  { name: 'CapCut', icon: Scissors, color: '#A78BFA' },
  { name: '3D Modeling', icon: Box, color: '#22D3EE' },

  { name: 'Git', icon: SiGit, color: '#F05032' },
  { name: 'GitHub', icon: SiGithub, color: '#FFFFFF' },
  { name: 'Enterprise Architect', icon: Building2, color: '#A78BFA' },
  { name: 'UML', icon: SiUml, color: '#22D3EE' },
  { name: 'Requirements Engineering', icon: ClipboardList, color: '#A78BFA' },
  { name: 'Google Analytics', icon: SiGoogleanalytics, color: '#E37400' },
  { name: 'Cisco Packet Tracer', icon: SiCisco, color: '#1BA0D7' },
  { name: 'Networking', icon: Network, color: '#22D3EE' },
  { name: 'Software Engineering', icon: Code2, color: '#A78BFA' },
  { name: 'Problem Solving', icon: Puzzle, color: '#22D3EE' },
];

// split into 5 rows of 10, in order
export const SKILL_ROWS = Array.from({ length: 5 }, (_, i) =>
  SKILLS.slice(i * 10, i * 10 + 10)
);

// Map technologies to their respective design spec categories
export const SKILLS_BY_CATEGORY = {
  'Programming Languages': SKILLS.filter(s =>
    ['JavaScript', 'TypeScript', 'Python', 'PHP', 'C++'].includes(s.name)
  ),
  'Frontend': SKILLS.filter(s =>
    ['HTML', 'CSS', 'React.js', 'Next.js', 'Tailwind CSS', 'Vite', 'Responsive Design', 'Framer Motion', 'GSAP', 'Three.js'].includes(s.name)
  ),
  'Backend': SKILLS.filter(s =>
    ['Node.js', 'Express.js', 'REST APIs', 'JSON'].includes(s.name)
  ),
  'Databases': SKILLS.filter(s =>
    ['Firestore', 'MySQL'].includes(s.name)
  ),
  'Cloud': SKILLS.filter(s =>
    ['Firebase', 'Cloudinary'].includes(s.name)
  ),
  'AI & Intelligent Systems': SKILLS.filter(s =>
    ['OpenAI', 'Anthropic', 'Claude', 'AI Integration', 'Prompt Engineering', 'Generative AI', 'Chatbots'].includes(s.name)
  ),
  'Design & Creative': SKILLS.filter(s =>
    ['UI Design', 'Figma', 'Blender', 'Unity', 'Canva', 'Adobe Photoshop', 'Graphic Design', 'Video Editing', 'CapCut', '3D Modeling'].includes(s.name)
  ),
  'Version Control': SKILLS.filter(s =>
    ['Git', 'GitHub'].includes(s.name)
  ),
  'Tools & Engineering': SKILLS.filter(s =>
    ['Enterprise Architect', 'UML', 'Requirements Engineering', 'Google Analytics', 'Cisco Packet Tracer', 'Networking', 'Software Engineering', 'Problem Solving'].includes(s.name)
  )
};

// Regroup skills into the 6 redesign categories
export const SKILLS_BY_CATEGORY_REDESIGN = {
  'Frontend': SKILLS.filter(s =>
    ['HTML', 'CSS', 'React.js', 'Next.js', 'Tailwind CSS', 'Vite', 'Responsive Design', 'UI Design', 'Framer Motion', 'GSAP', 'Three.js'].includes(s.name)
  ),
  'Backend': SKILLS.filter(s =>
    ['Node.js', 'Express.js', 'REST APIs', 'JSON', 'PHP', 'C++'].includes(s.name)
  ),
  'AI & LLM': SKILLS.filter(s =>
    ['OpenAI', 'Anthropic', 'Claude', 'AI Integration', 'Prompt Engineering', 'Generative AI', 'Chatbots'].includes(s.name)
  ),
  'Database': SKILLS.filter(s =>
    ['Firestore', 'MySQL'].includes(s.name)
  ),
  'DevOps & Cloud': SKILLS.filter(s =>
    ['Firebase', 'Cloudinary', 'Git', 'GitHub'].includes(s.name)
  ),
  'Tools & Design': SKILLS.filter(s =>
    ['JavaScript', 'TypeScript', 'Python', 'Figma', 'Blender', 'Unity', 'Canva', 'Adobe Photoshop', 'Graphic Design', 'Video Editing', 'CapCut', '3D Modeling', 'Enterprise Architect', 'UML', 'Requirements Engineering', 'Google Analytics', 'Cisco Packet Tracer', 'Networking', 'Software Engineering', 'Problem Solving'].includes(s.name)
  )
};


