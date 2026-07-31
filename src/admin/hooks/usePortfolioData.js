import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

const FALLBACK_HERO = {
  greetText: "Hi, I'm",
  name: 'Muhammad Usman',
  heading: 'Muhammad Usman',
  role: 'Full-Stack Developer | AI Integration Specialist | Video Editor',
  description: 'I build intelligent web applications and craft engaging visual stories — turning ideas into functional, beautiful digital products.',
  backgroundText: 'USMAN',
  resumeBtnText: 'Download Resume',
  resumeFileUrl: '/resume.pdf',
  cta1Text: 'View My Work',
  cta1Link: '#projects',
  cta2Text: 'Download Resume',
  cta2Link: '/resume.pdf',
  githubUrl: 'https://github.com/usaaman/',
  linkedinUrl: 'https://www.linkedin.com/in/muhammad-usman-a76984378/',
  twitterUrl: 'https://twitter.com/',
  emailAddress: 'musmannazir97@gmail.com',
  avatarUrl: '/frames/frame-138.webp',
};

const FALLBACK_ABOUT = {
  title: 'Curious mind, creative hands',
  paragraph1: "I'm Muhammad Usman, a Software Engineering student at Capital University of Science & Technology, Islamabad, currently in my 6th semester.",
  paragraph2: 'My journey started with a passion for video editing and visual storytelling, which naturally evolved into web development and AI integration. Today, I build full-stack applications with React and Firebase, experiment with AI-powered chat systems, and still keep my creative side alive through video editing and graphic design.',
  quoteText: 'I love solving real-world problems — whether that\'s through clean code or a well-cut video.',
  glanceItems: [
    { label: 'Name', value: 'M. Usman' },
    { label: 'Studies', value: 'Software Eng.' },
    { label: 'Location', value: 'Islamabad, PK' },
    { label: 'Semesters', value: '6th Semester' },
  ],
  timelineItems: [
    { id: 1, type: 'education', date: '2023 - Present', title: 'BS Software Engineering', institution: 'CUST University' },
    { id: 2, type: 'experience', date: '2025 - Present', title: 'Full Stack Web Freelancer', institution: 'Remote / Client Services' },
    { id: 3, type: 'experience', date: '2022 - 2024', title: 'Lead CapCut Video Editor', institution: 'Creative Studio' }
  ],
  imageUrl: '/frames/frame-081.webp',
};

const FALLBACK_SOCIALS = {
  socials: {
    github: 'https://github.com/usaaman/',
    linkedin: 'https://www.linkedin.com/in/muhammad-usman-a76984378/',
    email: 'musmannazir97@gmail.com',
    whatsapp: 'https://wa.me/923045160142',
    portfolio: 'https://usman.dev',
    youtube: '',
    instagram: '',
    x: '',
  },
  customLinks: []
};

const FALLBACK_RESUME = {
  filename: 'Usman_Resume.pdf',
  version: 'v2.4',
  size: '1.24 MB',
  updatedAt: 'July 28, 2026',
  downloadCount: 142,
  status: 'Active',
};

const FALLBACK_AI_CONFIG = {
  enabled: true,
  systemPrompt: '',
  greetingMessage: "Hi there! I'm Usman's AI assistant. Ask me anything about his technical skills, software projects, video editing background, or university timeline!",
  suggestedQuestions: [
    "Tell me about FitSphere",
    "What technologies do you use?",
    "Show your best projects",
    "What creative services do you offer?"
  ],
  temperature: 0.6,
  conversationLimit: 20,
  modelSelection: 'llama-3.3-70b-versatile'
};

export default function usePortfolioData() {
  const [data, setData] = useState({
    hero: { ...FALLBACK_HERO },
    about: { ...FALLBACK_ABOUT },
    skills: [],
    projects: [],
    services: [],
    socialLinks: { ...FALLBACK_SOCIALS },
    resume: { ...FALLBACK_RESUME },
    aiConfig: { ...FALLBACK_AI_CONFIG },
    loading: true,
  });

  useEffect(() => {
    if (!db) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const initialFires = {
      hero: false,
      about: false,
      socialLinks: false,
      resume: false,
      skills: false,
      projects: false,
      services: false,
      aiConfig: false,
    };

    const checkLoading = () => {
      if (Object.values(initialFires).every(Boolean)) {
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    const unsubHero = onSnapshot(doc(db, 'hero', 'singleton'), (snap) => {
      setData(prev => ({ ...prev, hero: snap.exists() ? snap.data() : { ...FALLBACK_HERO } }));
      initialFires.hero = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to hero:", error);
      initialFires.hero = true;
      checkLoading();
    });

    const unsubAbout = onSnapshot(doc(db, 'about', 'singleton'), (snap) => {
      setData(prev => ({ ...prev, about: snap.exists() ? snap.data() : { ...FALLBACK_ABOUT } }));
      initialFires.about = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to about:", error);
      initialFires.about = true;
      checkLoading();
    });

    const unsubSocials = onSnapshot(doc(db, 'socialLinks', 'singleton'), (snap) => {
      setData(prev => ({ ...prev, socialLinks: snap.exists() ? snap.data() : { ...FALLBACK_SOCIALS } }));
      initialFires.socialLinks = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to socialLinks:", error);
      initialFires.socialLinks = true;
      checkLoading();
    });

    const unsubResume = onSnapshot(doc(db, 'resume', 'singleton'), (snap) => {
      setData(prev => ({ ...prev, resume: snap.exists() ? snap.data() : { ...FALLBACK_RESUME } }));
      initialFires.resume = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to resume:", error);
      initialFires.resume = true;
      checkLoading();
    });

    const unsubAIConfig = onSnapshot(doc(db, 'settings', 'ai-config'), (snap) => {
      setData(prev => ({ ...prev, aiConfig: snap.exists() ? snap.data() : { ...FALLBACK_AI_CONFIG } }));
      initialFires.aiConfig = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to aiConfig:", error);
      initialFires.aiConfig = true;
      checkLoading();
    });

    let migratingSkills = false;
    const unsubSkills = onSnapshot(collection(db, 'skills'), (snap) => {
      const skills = [];
      snap.forEach((doc) => {
        skills.push({ id: doc.id, ...doc.data() });
      });

      const skillsDoc = skills.find(d => d.id === 'skills-doc');
      const catsDoc = skills.find(d => d.id === 'categories-doc');
      const hasFrontend = catsDoc && (catsDoc.entries || []).some(c => c.id === 'cat-frontend');

      if ((!skillsDoc || !skillsDoc.entries || skillsDoc.entries.length < 15 || !hasFrontend) && !migratingSkills) {
        migratingSkills = true;
        const initialCats = [
          { id: 'cat-frontend', label: 'Frontend', hidden: false },
          { id: 'cat-backend', label: 'Backend', hidden: false },
          { id: 'cat-db-cloud', label: 'Database & Cloud', hidden: false },
          { id: 'cat-ai-auto', label: 'AI & Automation', hidden: false },
          { id: 'cat-programming', label: 'Programming', hidden: false },
          { id: 'cat-tools-devops', label: 'Tools & DevOps', hidden: false }
        ];
        const initialSkills = [
          // Frontend (cat-frontend)
          { id: 1, categoryId: 'cat-frontend', name: 'HTML5', color: '#E34F26', icon: 'Globe', hidden: false },
          { id: 2, categoryId: 'cat-frontend', name: 'CSS3', color: '#1572B6', icon: 'Globe', hidden: false },
          { id: 3, categoryId: 'cat-frontend', name: 'JavaScript (ES6+)', color: '#F7DF1E', icon: 'Code', hidden: false },
          { id: 4, categoryId: 'cat-frontend', name: 'TypeScript', color: '#3178C6', icon: 'Code', hidden: false },
          { id: 5, categoryId: 'cat-frontend', name: 'React.js', color: '#61DAFB', icon: 'Cpu', hidden: false },
          { id: 6, categoryId: 'cat-frontend', name: 'Vite', color: '#646CFF', icon: 'Cpu', hidden: false },
          { id: 7, categoryId: 'cat-frontend', name: 'Tailwind CSS', color: '#06B6D4', icon: 'Globe', hidden: false },
          { id: 8, categoryId: 'cat-frontend', name: 'Framer Motion', color: '#F024B3', icon: 'LayoutDashboard', hidden: false },
          { id: 9, categoryId: 'cat-frontend', name: 'GSAP', color: '#88CE02', icon: 'LayoutDashboard', hidden: false },
          { id: 10, categoryId: 'cat-frontend', name: 'Responsive Web Design', color: '#FFFFFF', icon: 'Globe', hidden: false },

          // Backend (cat-backend)
          { id: 11, categoryId: 'cat-backend', name: 'Node.js', color: '#339933', icon: 'Server', hidden: false },
          { id: 12, categoryId: 'cat-backend', name: 'Express.js', color: '#FFFFFF', icon: 'Server', hidden: false },
          { id: 13, categoryId: 'cat-backend', name: 'REST API Development', color: '#009688', icon: 'Terminal', hidden: false },
          { id: 14, categoryId: 'cat-backend', name: 'API Integration', color: '#008080', icon: 'Terminal', hidden: false },
          { id: 15, categoryId: 'cat-backend', name: 'Authentication (JWT)', color: '#000000', icon: 'Terminal', hidden: false },
          { id: 16, categoryId: 'cat-backend', name: 'Firebase Authentication', color: '#FFCA28', icon: 'Flame', hidden: false },
          { id: 17, categoryId: 'cat-backend', name: 'Middleware Development', color: '#D3D3D3', icon: 'Server', hidden: false },
          { id: 18, categoryId: 'cat-backend', name: 'CRUD Operations', color: '#FFFFFF', icon: 'Database', hidden: false },

          // Database & Cloud (cat-db-cloud)
          { id: 19, categoryId: 'cat-db-cloud', name: 'Firebase Firestore', color: '#FFA000', icon: 'Database', hidden: false },
          { id: 20, categoryId: 'cat-db-cloud', name: 'Firebase Storage', color: '#FFCA28', icon: 'Box', hidden: false },
          { id: 21, categoryId: 'cat-db-cloud', name: 'Cloudinary', color: '#3448C5', icon: 'Box', hidden: false },
          { id: 22, categoryId: 'cat-db-cloud', name: 'IndexedDB', color: '#FFFFFF', icon: 'Database', hidden: false },
          { id: 23, categoryId: 'cat-db-cloud', name: 'MySQL', color: '#4479A1', icon: 'Database', hidden: false },
          { id: 24, categoryId: 'cat-db-cloud', name: 'Database Design', color: '#D394FF', icon: 'Database', hidden: false },
          { id: 25, categoryId: 'cat-db-cloud', name: 'Real-time Data Sync', color: '#34D399', icon: 'Cpu', hidden: false },

          // AI & Automation (cat-ai-auto)
          { id: 26, categoryId: 'cat-ai-auto', name: 'AI Agent Development', color: '#A78BFA', icon: 'Cpu', hidden: false },
          { id: 27, categoryId: 'cat-ai-auto', name: 'Prompt Engineering', color: '#FFFFFF', icon: 'Terminal', hidden: false },
          { id: 28, categoryId: 'cat-ai-auto', name: 'Groq API', color: '#F25C54', icon: 'Terminal', hidden: false },
          { id: 29, categoryId: 'cat-ai-auto', name: 'OpenAI API', color: '#00A67E', icon: 'Cpu', hidden: false },
          { id: 30, categoryId: 'cat-ai-auto', name: 'RAG (Retrieval-Augmented Generation)', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 31, categoryId: 'cat-ai-auto', name: 'Tool Calling', color: '#FFFFFF', icon: 'Terminal', hidden: false },
          { id: 32, categoryId: 'cat-ai-auto', name: 'AI Chatbot Development', color: '#38BDF8', icon: 'Cpu', hidden: false },
          { id: 33, categoryId: 'cat-ai-auto', name: 'Workflow Automation', color: '#F59E0B', icon: 'LayoutDashboard', hidden: false },

          // Programming (cat-programming)
          { id: 34, categoryId: 'cat-programming', name: 'Python', color: '#3776AB', icon: 'Code', hidden: false },
          { id: 35, categoryId: 'cat-programming', name: 'C++', color: '#00599C', icon: 'Code', hidden: false },
          { id: 36, categoryId: 'cat-programming', name: 'C#', color: '#178600', icon: 'Code', hidden: false },
          { id: 37, categoryId: 'cat-programming', name: 'Java', color: '#007396', icon: 'Code', hidden: false },
          { id: 38, categoryId: 'cat-programming', name: 'Assembly Language', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 39, categoryId: 'cat-programming', name: 'Object-Oriented Programming', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 40, categoryId: 'cat-programming', name: 'Data Structures & Algorithms', color: '#FFFFFF', icon: 'Code', hidden: false },

          // Tools & DevOps (cat-tools-devops)
          { id: 41, categoryId: 'cat-tools-devops', name: 'Git', color: '#F05032', icon: 'Code', hidden: false },
          { id: 42, categoryId: 'cat-tools-devops', name: 'GitHub', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 43, categoryId: 'cat-tools-devops', name: 'VS Code', color: '#007ACC', icon: 'Code', hidden: false },
          { id: 44, categoryId: 'cat-tools-devops', name: 'Postman', color: '#FF6C37', icon: 'Terminal', hidden: false },
          { id: 45, categoryId: 'cat-tools-devops', name: 'npm', color: '#CB3837', icon: 'Terminal', hidden: false },
          { id: 46, categoryId: 'cat-tools-devops', name: 'Cisco Packet Tracer', color: '#1C3C5A', icon: 'Server', hidden: false },
          { id: 47, categoryId: 'cat-tools-devops', name: 'Enterprise Architect', color: '#FFFFFF', icon: 'LayoutDashboard', hidden: false },
          { id: 48, categoryId: 'cat-tools-devops', name: 'Figma', color: '#F24E1E', icon: 'LayoutDashboard', hidden: false },
          { id: 49, categoryId: 'cat-tools-devops', name: 'Canva', color: '#00C4CC', icon: 'LayoutDashboard', hidden: false },
          { id: 50, categoryId: 'cat-tools-devops', name: 'CapCut', color: '#10B981', icon: 'Video', hidden: false }
        ];

        Promise.all([
          setDoc(doc(db, 'skills', 'categories-doc'), { entries: initialCats }),
          setDoc(doc(db, 'skills', 'skills-doc'), { entries: initialSkills })
        ])
        .then(() => {
          console.log('Seeded 50 production skills successfully.');
          migratingSkills = false;
        })
        .catch(err => {
          console.warn('Seeding 50 production skills failed:', err);
          migratingSkills = false;
        });
      }

      setData(prev => ({ ...prev, skills }));
      initialFires.skills = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to skills:", error);
      initialFires.skills = true;
      checkLoading();
    });

    let migrating = false;
    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('displayOrder', 'asc')), (snap) => {
      const projects = [];
      snap.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });

      if (snap.empty && !migrating) {
        migrating = true;
        const initialProjects = [
          {
            id: 'medcore-pos',
            title: 'MedCore POS',
            subtitle: 'Flagship Medical Point of Sale System',
            shortDesc: 'A premium, high-performance point-of-sale system tailored for modern medical clinics and pharmacies.',
            longDesc: 'A premium, high-performance point-of-sale system tailored for modern medical clinics and pharmacies. Integrates real-time patient billing, prescription insurance clearance pipelines, and secure drug inventory tracking under strict healthcare regulations.',
            techStack: 'React.js, Node.js, Express.js, REST APIs, MySQL, Tailwind CSS',
            githubUrl: 'https://github.com/usaaman/medcore-pos',
            liveUrl: 'https://medcore-pos.demo.com',
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
            liveUrl: 'https://ai-chat-app.demo.com',
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
            liveUrl: 'https://portfolio-cms.demo.com',
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
            liveUrl: 'https://movie-recommender.demo.com',
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
            liveUrl: 'https://chat-app.demo.com',
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
            liveUrl: 'https://design-showcase.demo.com',
            coverImage: '/projects/design.png',
            gallery: ['/projects/design.png'],
            displayOrder: 6,
            status: 'Published',
            featured: true,
            type: 'Design UI'
          }
        ];

        Promise.all(initialProjects.map(p => setDoc(doc(db, 'projects', p.id), p)))
          .then(() => {
            console.log('Production projects database migration completed successfully.');
            migrating = false;
          })
          .catch(err => {
            console.warn('Seeding production projects failed:', err);
            migrating = false;
          });
      }

      setData(prev => ({ ...prev, projects }));
      initialFires.projects = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to projects:", error);
      initialFires.projects = true;
      checkLoading();
    });

    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('order', 'asc')), (snap) => {
      const services = [];
      snap.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() });
      });
      setData(prev => ({ ...prev, services }));
      initialFires.services = true;
      checkLoading();
    }, (error) => {
      console.warn("Error listening to services:", error);
      initialFires.services = true;
      checkLoading();
    });

    const unsubSEO = onSnapshot(doc(db, 'seo', 'singleton'), (snap) => {
      if (snap.exists()) {
        const seoData = snap.data();
        document.title = seoData.titleTag || document.title;
        
        const updateMeta = (name, property, content) => {
          let el = null;
          if (name) el = document.querySelector(`meta[name="${name}"]`);
          else if (property) el = document.querySelector(`meta[property="${property}"]`);
          
          if (!el) {
            el = document.createElement('meta');
            if (name) el.setAttribute('name', name);
            if (property) el.setAttribute('property', property);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content || '');
        };

        updateMeta('description', null, seoData.metaDescription);
        updateMeta('keywords', null, seoData.keywords);
        updateMeta(null, 'og:title', seoData.titleTag);
        updateMeta(null, 'og:description', seoData.metaDescription);
        updateMeta(null, 'og:image', seoData.ogImage || '/og-image.png');
        updateMeta(null, 'og:type', 'website');
        updateMeta('twitter:card', null, seoData.twitterCard || 'summary_large_image');
        updateMeta('twitter:title', null, seoData.titleTag);
        updateMeta('twitter:description', null, seoData.metaDescription);
        updateMeta('twitter:image', null, seoData.ogImage || '/og-image.png');
        updateMeta('robots', null, seoData.robots || 'index, follow');

        if (seoData.favicon) {
          let favLink = document.querySelector('link[rel="icon"]');
          if (!favLink) {
            favLink = document.createElement('link');
            favLink.setAttribute('rel', 'icon');
            document.head.appendChild(favLink);
          }
          favLink.setAttribute('href', seoData.favicon);
        }
      }
    }, (error) => {
      console.warn("Error listening to SEO:", error);
    });

    return () => {
      unsubHero();
      unsubAbout();
      unsubSocials();
      unsubResume();
      unsubAIConfig();
      unsubSkills();
      unsubProjects();
      unsubServices();
      unsubSEO();
    };
  }, []);

  const seedDatabase = async () => {
    if (!db) {
      alert('Firebase connection is missing.');
      return;
    }
    try {
      await setDoc(doc(db, 'hero', 'singleton'), FALLBACK_HERO);
      await setDoc(doc(db, 'about', 'singleton'), FALLBACK_ABOUT);
      await setDoc(doc(db, 'socialLinks', 'singleton'), FALLBACK_SOCIALS);
      await setDoc(doc(db, 'resume', 'singleton'), FALLBACK_RESUME);
      
      // Seed initial mock project
      await setDoc(doc(db, 'projects', 'proj-1'), {
        displayOrder: 1,
        title: 'FitSphere Core',
        subtitle: 'Fitness Mobile Application',
        shortDesc: 'A fitness mobile app providing automated workout scheduling.',
        longDesc: 'FitSphere Core utilizes React Native on the client side coupled with Firebase Authentication and Firestore DB.',
        techStack: 'React Native, Firebase, Expo, Redux',
        type: 'Mobile App',
        status: 'Published',
        featured: true,
        coverImage: '/frames/frame-138.webp',
        gallery: ['/frames/frame-138.webp']
      });

      // Seed initial mock service
      await setDoc(doc(db, 'services', 'svc-1'), {
        title: 'Full Stack Development',
        description: 'Developing highly interactive web interfaces backed by scalable cloud architectures.',
        icon: 'Cpu',
        order: 1,
        visible: true,
        featured: true,
      });

      // Seed initial skills categories
      await setDoc(doc(db, 'skills', 'categories-doc'), {
        entries: [
          { id: 'cat-frontend', label: 'Frontend', hidden: false },
          { id: 'cat-backend', label: 'Backend', hidden: false },
          { id: 'cat-db-cloud', label: 'Database & Cloud', hidden: false },
          { id: 'cat-ai-auto', label: 'AI & Automation', hidden: false },
          { id: 'cat-programming', label: 'Programming', hidden: false },
          { id: 'cat-tools-devops', label: 'Tools & DevOps', hidden: false }
        ]
      });

      // Seed initial skills
      await setDoc(doc(db, 'skills', 'skills-doc'), {
        entries: [
          // Frontend (cat-frontend)
          { id: 1, categoryId: 'cat-frontend', name: 'HTML5', color: '#E34F26', icon: 'Globe', hidden: false },
          { id: 2, categoryId: 'cat-frontend', name: 'CSS3', color: '#1572B6', icon: 'Globe', hidden: false },
          { id: 3, categoryId: 'cat-frontend', name: 'JavaScript (ES6+)', color: '#F7DF1E', icon: 'Code', hidden: false },
          { id: 4, categoryId: 'cat-frontend', name: 'TypeScript', color: '#3178C6', icon: 'Code', hidden: false },
          { id: 5, categoryId: 'cat-frontend', name: 'React.js', color: '#61DAFB', icon: 'Cpu', hidden: false },
          { id: 6, categoryId: 'cat-frontend', name: 'Vite', color: '#646CFF', icon: 'Cpu', hidden: false },
          { id: 7, categoryId: 'cat-frontend', name: 'Tailwind CSS', color: '#06B6D4', icon: 'Globe', hidden: false },
          { id: 8, categoryId: 'cat-frontend', name: 'Framer Motion', color: '#F024B3', icon: 'LayoutDashboard', hidden: false },
          { id: 9, categoryId: 'cat-frontend', name: 'GSAP', color: '#88CE02', icon: 'LayoutDashboard', hidden: false },
          { id: 10, categoryId: 'cat-frontend', name: 'Responsive Web Design', color: '#FFFFFF', icon: 'Globe', hidden: false },

          // Backend (cat-backend)
          { id: 11, categoryId: 'cat-backend', name: 'Node.js', color: '#339933', icon: 'Server', hidden: false },
          { id: 12, categoryId: 'cat-backend', name: 'Express.js', color: '#FFFFFF', icon: 'Server', hidden: false },
          { id: 13, categoryId: 'cat-backend', name: 'REST API Development', color: '#009688', icon: 'Terminal', hidden: false },
          { id: 14, categoryId: 'cat-backend', name: 'API Integration', color: '#008080', icon: 'Terminal', hidden: false },
          { id: 15, categoryId: 'cat-backend', name: 'Authentication (JWT)', color: '#000000', icon: 'Terminal', hidden: false },
          { id: 16, categoryId: 'cat-backend', name: 'Firebase Authentication', color: '#FFCA28', icon: 'Flame', hidden: false },
          { id: 17, categoryId: 'cat-backend', name: 'Middleware Development', color: '#D3D3D3', icon: 'Server', hidden: false },
          { id: 18, categoryId: 'cat-backend', name: 'CRUD Operations', color: '#FFFFFF', icon: 'Database', hidden: false },

          // Database & Cloud (cat-db-cloud)
          { id: 19, categoryId: 'cat-db-cloud', name: 'Firebase Firestore', color: '#FFA000', icon: 'Database', hidden: false },
          { id: 20, categoryId: 'cat-db-cloud', name: 'Firebase Storage', color: '#FFCA28', icon: 'Box', hidden: false },
          { id: 21, categoryId: 'cat-db-cloud', name: 'Cloudinary', color: '#3448C5', icon: 'Box', hidden: false },
          { id: 22, categoryId: 'cat-db-cloud', name: 'IndexedDB', color: '#FFFFFF', icon: 'Database', hidden: false },
          { id: 23, categoryId: 'cat-db-cloud', name: 'MySQL', color: '#4479A1', icon: 'Database', hidden: false },
          { id: 24, categoryId: 'cat-db-cloud', name: 'Database Design', color: '#D394FF', icon: 'Database', hidden: false },
          { id: 25, categoryId: 'cat-db-cloud', name: 'Real-time Data Sync', color: '#34D399', icon: 'Cpu', hidden: false },

          // AI & Automation (cat-ai-auto)
          { id: 26, categoryId: 'cat-ai-auto', name: 'AI Agent Development', color: '#A78BFA', icon: 'Cpu', hidden: false },
          { id: 27, categoryId: 'cat-ai-auto', name: 'Prompt Engineering', color: '#FFFFFF', icon: 'Terminal', hidden: false },
          { id: 28, categoryId: 'cat-ai-auto', name: 'Groq API', color: '#F25C54', icon: 'Terminal', hidden: false },
          { id: 29, categoryId: 'cat-ai-auto', name: 'OpenAI API', color: '#00A67E', icon: 'Cpu', hidden: false },
          { id: 30, categoryId: 'cat-ai-auto', name: 'RAG (Retrieval-Augmented Generation)', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 31, categoryId: 'cat-ai-auto', name: 'Tool Calling', color: '#FFFFFF', icon: 'Terminal', hidden: false },
          { id: 32, categoryId: 'cat-ai-auto', name: 'AI Chatbot Development', color: '#38BDF8', icon: 'Cpu', hidden: false },
          { id: 33, categoryId: 'cat-ai-auto', name: 'Workflow Automation', color: '#F59E0B', icon: 'LayoutDashboard', hidden: false },

          // Programming (cat-programming)
          { id: 34, categoryId: 'cat-programming', name: 'Python', color: '#3776AB', icon: 'Code', hidden: false },
          { id: 35, categoryId: 'cat-programming', name: 'C++', color: '#00599C', icon: 'Code', hidden: false },
          { id: 36, categoryId: 'cat-programming', name: 'C#', color: '#178600', icon: 'Code', hidden: false },
          { id: 37, categoryId: 'cat-programming', name: 'Java', color: '#007396', icon: 'Code', hidden: false },
          { id: 38, categoryId: 'cat-programming', name: 'Assembly Language', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 39, categoryId: 'cat-programming', name: 'Object-Oriented Programming', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 40, categoryId: 'cat-programming', name: 'Data Structures & Algorithms', color: '#FFFFFF', icon: 'Code', hidden: false },

          // Tools & DevOps (cat-tools-devops)
          { id: 41, categoryId: 'cat-tools-devops', name: 'Git', color: '#F05032', icon: 'Code', hidden: false },
          { id: 42, categoryId: 'cat-tools-devops', name: 'GitHub', color: '#FFFFFF', icon: 'Code', hidden: false },
          { id: 43, categoryId: 'cat-tools-devops', name: 'VS Code', color: '#007ACC', icon: 'Code', hidden: false },
          { id: 44, categoryId: 'cat-tools-devops', name: 'Postman', color: '#FF6C37', icon: 'Terminal', hidden: false },
          { id: 45, categoryId: 'cat-tools-devops', name: 'npm', color: '#CB3837', icon: 'Terminal', hidden: false },
          { id: 46, categoryId: 'cat-tools-devops', name: 'Cisco Packet Tracer', color: '#1C3C5A', icon: 'Server', hidden: false },
          { id: 47, categoryId: 'cat-tools-devops', name: 'Enterprise Architect', color: '#FFFFFF', icon: 'LayoutDashboard', hidden: false },
          { id: 48, categoryId: 'cat-tools-devops', name: 'Figma', color: '#F24E1E', icon: 'LayoutDashboard', hidden: false },
          { id: 49, categoryId: 'cat-tools-devops', name: 'Canva', color: '#00C4CC', icon: 'LayoutDashboard', hidden: false },
          { id: 50, categoryId: 'cat-tools-devops', name: 'CapCut', color: '#10B981', icon: 'Video', hidden: false }
        ]
      });

      // Seed initial media docs
      const mediaList = [
        { id: 'm-1', name: 'frame-138.webp', folder: 'Character Assets', size: '24 KB', resolution: '400x400', path: '/frames/frame-138.webp', type: 'image' },
        { id: 'm-2', name: 'frame-081.webp', folder: 'Character Assets', size: '28 KB', resolution: '400x400', path: '/frames/frame-081.webp', type: 'image' },
        { id: 'm-3', name: 'cust-timetable-mock.png', folder: 'Project Images', size: '142 KB', resolution: '1280x720', path: '/projects/timetable.png', type: 'image' },
        { id: 'm-4', name: 'fitsphere-screenshot.png', folder: 'Project Images', size: '210 KB', resolution: '1280x720', path: '/projects/fitsphere.png', type: 'image' },
        { id: 'm-5', name: 'cv-document-eng.pdf', folder: 'Documents', size: '1.24 MB', resolution: '—', path: '/resume.pdf', type: 'pdf' },
        { id: 'm-6', name: 'devconnect-wireframe.png', folder: 'Project Images', size: '98 KB', resolution: '1024x768', path: '/projects/devconnect.png', type: 'image' },
        { id: 'm-7', name: 'react-icon.svg', folder: 'Icons', size: '2.4 KB', resolution: '—', path: '/icons/react.svg', type: 'image' }
      ];
      for (const media of mediaList) {
        await setDoc(doc(db, 'media', media.id), media);
      }

      alert('Database seeded successfully with default configs!');
    } catch (e) {
      console.error('Failed seeding Firebase:', e);
      alert(`Seed Error: ${e.message}`);
    }
  };

  return {
    ...data,
    seedDatabase,
  };
}

