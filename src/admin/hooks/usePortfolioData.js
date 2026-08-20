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
  avatarUrl: '/favicon.svg',
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
  imageUrl: '/favicon.svg',
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
        coverImage: '/favicon.svg',
        gallery: ['/favicon.svg']
      });

      // Seed initial mock services
      const defaultServicesToSeed = [
        { id: 'svc-1', title: 'AI Agents', description: 'Autonomous AI agents that execute complex workflows, search live data, make decisions, and automate repetitive tasks independently.', icon: 'Sparkles', order: 1, visible: true, featured: true },
        { id: 'svc-2', title: 'AI Integration', description: 'Embedding state-of-the-art LLMs, fine-tuned models, and RAG pipelines directly into your existing web, mobile, or backend apps.', icon: 'Cpu', order: 2, visible: true, featured: true },
        { id: 'svc-3', title: 'Chat Bots', description: 'Intelligent, context-aware conversational bots trained on your business documents for instant customer support and lead capture.', icon: 'Sparkles', order: 3, visible: true, featured: true },
        { id: 'svc-4', title: 'Full Stack Development', description: 'Scalable end-to-end web applications built with high performance, robust backend architecture, secure user auth, and sleek modern UI.', icon: 'Layers', order: 4, visible: true, featured: true },
        { id: 'svc-5', title: 'Landing Pages / Front End', description: 'Ultra-fast, high-converting landing pages with pixel-perfect responsive design, striking modern typography, and fluid micro-animations.', icon: 'Monitor', order: 5, visible: true, featured: true },
        { id: 'svc-6', title: 'Admin Panels', description: 'Custom management dashboards, real-time data analytics portals, and CMS solutions tailored specifically for business operations.', icon: 'Layers', order: 6, visible: true, featured: true },
        { id: 'svc-7', title: 'Video Editing & Graphic Design', description: 'Professional video editing for promotional ads, high-engagement reels, visual branding, UI/UX wireframes, and creative marketing assets.', icon: 'Video', order: 7, visible: true, featured: true },
      ];
      for (const svc of defaultServicesToSeed) {
        await setDoc(doc(db, 'services', svc.id), svc);
      }



      // Seed initial media docs
      const mediaList = [
        { id: 'm-1', name: 'favicon.svg', folder: 'Character Assets', size: '9 KB', resolution: '—', path: '/favicon.svg', type: 'image' },
        { id: 'm-2', name: 'favicon.svg', folder: 'Character Assets', size: '9 KB', resolution: '—', path: '/favicon.svg', type: 'image' },
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

