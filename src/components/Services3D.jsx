import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Bot,
  Brain,
  MessageSquare,
  Code,
  Laptop,
  LineChart,
  Film,
  Palette,
  ArrowLeftRight,
  X,
  Layers,
  Send,
  CheckCircle2,
  Check,
  Wrench,
  Zap,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  DollarSign,
  FileText,
  Sparkles,
} from 'lucide-react';
import './Services3D.css';

const DEFAULT_SERVICES_DATA = [
  {
    id: 0,
    title: "AI Agents",
    shortName: "AI Agents",
    iconName: "robot",
    IconComponent: Bot,
    color: "#38bdf8", // Sky Blue
    timeline: "Est. 1 - 2 Weeks",
    desc: "Autonomous AI agents that execute complex workflows, search live data, make decisions, and automate repetitive tasks independently.",
    features: [
      "Multi-Agent Workflow Systems",
      "Custom Tool & API Calling",
      "Automated Memory & Context",
      "Web Scraping & Task Actions"
    ],
    tech: ["LangChain", "AutoGPT", "CrewAI", "Python", "OpenAI API", "Pinecone"]
  },
  {
    id: 1,
    title: "AI Integration",
    shortName: "AI Integration",
    iconName: "brain",
    IconComponent: Brain,
    color: "#c084fc", // Purple
    timeline: "Est. 1 Week",
    desc: "Embedding state-of-the-art LLMs, fine-tuned models, and RAG pipelines directly into your existing web, mobile, or backend apps.",
    features: [
      "RAG (Retrieval Augmented Generation)",
      "Custom Vector Search Embeddings",
      "LLM Fine-Tuned Pipelines",
      "Seamless API & Middleware Integration"
    ],
    tech: ["Pinecone", "OpenAI", "Anthropic Claude", "LlamaIndex", "FastAPI", "Node.js"]
  },
  {
    id: 2,
    title: "Chat Bots",
    shortName: "Chat Bots",
    iconName: "comments",
    IconComponent: MessageSquare,
    color: "#34d399", // Emerald
    timeline: "Est. 3 - 5 Days",
    desc: "Intelligent, context-aware conversational bots trained on your business documents for instant customer support and lead capture.",
    features: [
      "Knowledge Base Document Bots",
      "Omnichannel (Web, WhatsApp, Telegram)",
      "Human Agent Handoff Routing",
      "Real-time Lead Capture & Analytics"
    ],
    tech: ["Voiceflow", "Botpress", "Dialogflow", "Tailwind", "WebSockets", "Express"]
  },
  {
    id: 3,
    title: "Full Stack Development",
    shortName: "Full Stack",
    iconName: "code",
    IconComponent: Code,
    color: "#f43f5e", // Rose
    timeline: "Est. 2 - 3 Weeks",
    desc: "Scalable end-to-end web applications built with high performance, robust backend architecture, secure user auth, and sleek modern UI.",
    features: [
      "Responsive React / Next.js Frontend",
      "RESTful & GraphQL API Engines",
      "Relational & NoSQL Database Design",
      "Role-Based Access Control & Auth"
    ],
    tech: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "MongoDB"]
  },
  {
    id: 4,
    title: "Landing Pages / Front End",
    shortName: "Front End",
    iconName: "laptop-code",
    IconComponent: Laptop,
    color: "#fbbf24", // Amber
    timeline: "Est. 3 - 5 Days",
    desc: "Ultra-fast, high-converting landing pages with pixel-perfect responsive design, striking modern typography, and fluid micro-animations.",
    features: [
      "Pixel-Perfect Mobile & Web Layouts",
      "High Conversion Rate UI Architecture",
      "95+ Lighthouse Speed & SEO Score",
      "Interactive Scroll & Hover Animations"
    ],
    tech: ["Tailwind CSS", "HTML5/CSS3", "JavaScript", "Framer Motion", "GSAP", "Vite"]
  },
  {
    id: 5,
    title: "Admin Panels",
    shortName: "Admin Panels",
    iconName: "chart-line",
    IconComponent: LineChart,
    color: "#818cf8", // Indigo
    timeline: "Est. 1 - 2 Weeks",
    desc: "Custom management dashboards, real-time data analytics portals, and CMS solutions tailored specifically for business operations.",
    features: [
      "Interactive Real-Time Data Charts",
      "Role-Based User Permissions",
      "Data Filtering, Sorting & CSV Export",
      "Custom Content & Database Management"
    ],
    tech: ["React", "Recharts", "TailwindCSS", "Node.js", "Prisma", "Supabase"]
  },
  {
    id: 6,
    title: "Video Editing & Graphic Design",
    shortName: "Video & Design",
    iconName: "film",
    IconComponent: Film,
    color: "#f472b6", // Pink
    timeline: "Est. 2 - 4 Days",
    desc: "Professional video editing for promotional ads, high-engagement social media reels, visual branding, UI/UX wireframes, and creative marketing assets.",
    features: [
      "Viral Short Reels & Ad Campaigns",
      "Brand Identity & Custom Logo Design",
      "UI/UX Mobile & Web Wireframing",
      "Cinematic Color Grading & Motion Titles"
    ],
    tech: ["Premiere Pro", "After Effects", "Figma", "Photoshop", "Illustrator", "CapCut Pro"]
  }
];

function ensureRoundRect(ctx) {
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      if (typeof r === 'number') r = [r, r, r, r];
      const [tl, tr, br, bl] = r;
      this.beginPath();
      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + tr);
      this.lineTo(x + w, y + h - br);
      this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      this.lineTo(x + bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - bl);
      this.lineTo(x, y + tl);
      this.quadraticCurveTo(x, y, x + tl, y);
      this.closePath();
      return this;
    };
  }
}

function drawCustomServiceLogo(ctx, id, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  switch(id) {
    case 0: // AI AGENTS (Neural Network & Robot Core)
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      for(let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const x = Math.cos(ang) * 75;
        const y = Math.sin(ang) * 75;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 1: // AI INTEGRATION (Brain Synapse Network)
      ctx.beginPath();
      ctx.arc(-25, -20, 22, 0, Math.PI * 2);
      ctx.arc(30, -20, 22, 0, Math.PI * 2);
      ctx.arc(0, 35, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-25, -20); ctx.lineTo(30, -20);
      ctx.moveTo(30, -20); ctx.lineTo(0, 35);
      ctx.moveTo(0, 35); ctx.lineTo(-25, -20);
      ctx.lineWidth = 8;
      ctx.stroke();
      break;

    case 2: // CHATBOTS (Speech Bubble + AI Sparks)
      ctx.beginPath();
      ctx.roundRect(-45, -35, 90, 65, 18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-15, 30); ctx.lineTo(-30, 50); ctx.lineTo(5, 30);
      ctx.fill();
      ctx.fillStyle = "#0a101d";
      ctx.beginPath();
      ctx.arc(-20, -2, 8, 0, Math.PI * 2);
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.arc(20, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 3: // FULL STACK (Code Tags & Stack Layers)
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-25, -30); ctx.lineTo(-50, 0); ctx.lineTo(-25, 30);
      ctx.moveTo(25, -30); ctx.lineTo(50, 0); ctx.lineTo(25, 30);
      ctx.moveTo(12, -35); ctx.lineTo(-12, 35);
      ctx.stroke();
      break;

    case 4: // LANDING PAGES (Browser Window Framework)
      ctx.beginPath();
      ctx.roundRect(-55, -40, 110, 80, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-55, -15); ctx.lineTo(55, -15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-40, -28, 5, 0, Math.PI * 2);
      ctx.arc(-25, -28, 5, 0, Math.PI * 2);
      ctx.arc(-10, -28, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-40, 0, 80, 25);
      break;

    case 5: // ADMIN PANELS (Analytics Chart & Dashboard)
      ctx.fillRect(-45, 10, 20, 35);
      ctx.fillRect(-10, -15, 20, 60);
      ctx.fillRect(25, -40, 20, 85);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-45, 0); ctx.lineTo(-10, -25); ctx.lineTo(25, -50);
      ctx.stroke();
      break;

    case 6: // VIDEO EDITING & GRAPHIC DESIGN (Cinematic Frame & Color Palette)
      ctx.beginPath();
      ctx.roundRect(-52, -42, 75, 55, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-24, -28); ctx.lineTo(2, -15); ctx.lineTo(-24, -2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(22, 18, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(10, 8, 5, 0, Math.PI * 2);
      ctx.arc(28, 8, 5, 0, Math.PI * 2);
      ctx.arc(18, 28, 5, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      break;
  }
}

function createCardTextureHD(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1360;
  const ctx = canvas.getContext('2d');
  ensureRoundRect(ctx);

  // Outer Card Rounded Glass Container
  ctx.fillStyle = "#0d1527";
  ctx.beginPath();
  ctx.roundRect(24, 24, 976, 1312, 54);
  ctx.fill();

  // Card Neon Glowing Border
  ctx.strokeStyle = data.color;
  ctx.lineWidth = 12;
  ctx.stroke();

  // Inner Metallic Dark Card Fill
  const cardGrad = ctx.createLinearGradient(0, 0, 0, 1360);
  cardGrad.addColorStop(0, '#131e32');
  cardGrad.addColorStop(1, '#090e1a');
  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(48, 48, 928, 1264, 42);
  ctx.fill();

  // Background Ambient Radial Light Glow Behind Icon
  const radialGlow = ctx.createRadialGradient(512, 360, 20, 512, 360, 320);
  radialGlow.addColorStop(0, data.color + "55");
  radialGlow.addColorStop(1, "transparent");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(48, 48, 928, 600);

  // Top Badge (Service Index Number)
  ctx.fillStyle = data.color + "28";
  ctx.beginPath();
  ctx.roundRect(88, 88, 220, 70, 20);
  ctx.fill();
  ctx.strokeStyle = data.color + "60";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = data.color;
  ctx.font = "900 32px Orbitron, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`SERVICE 0${data.id + 1}`, 198, 134);

  // Central Glowing Graphic Ring Container
  ctx.save();
  ctx.translate(512, 360);

  ctx.fillStyle = "#0a101d";
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = data.color;
  ctx.lineWidth = 8;
  ctx.stroke();

  // UNIQUE CUSTOM GRAPHIC LOGO BASED ON SERVICE TYPE
  drawCustomServiceLogo(ctx, data.id, data.color);

  ctx.restore();

  // Service Title Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 58px Outfit, sans-serif";
  ctx.textAlign = "center";

  const words = data.title.split(' ');
  if (words.length > 2) {
    ctx.fillText(words.slice(0, 2).join(' '), 512, 600);
    ctx.fillText(words.slice(2).join(' '), 512, 670);
  } else {
    ctx.fillText(data.title, 512, 630);
  }

  // Sub-bullet deliverables preview
  if (data.features) {
    ctx.font = "500 30px Inter, sans-serif";
    data.features.slice(0, 2).forEach((feat, idx) => {
      ctx.fillStyle = data.color;
      ctx.textAlign = "center";
      ctx.fillText("✦", 200, 780 + (idx * 56));
      ctx.fillStyle = "#cbd5e1";
      ctx.textAlign = "left";
      ctx.fillText(feat, 235, 780 + (idx * 56));
    });
  }

  // Action Button Badge "Inspect Details"
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.roundRect(180, 980, 664, 110, 30);
  ctx.fill();

  ctx.fillStyle = "#060a12";
  ctx.font = "900 36px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("INSPECT SERVICE →", 512, 1050);

  // Bottom Tech Stack Tag Line
  if (data.tech) {
    ctx.fillStyle = "#64748b";
    ctx.font = "600 24px Inter, sans-serif";
    ctx.fillText(data.tech.slice(0, 4).join("  •  "), 512, 1180);
  }

  return new THREE.CanvasTexture(canvas);
}

export default function Services3D({ services }) {
  const containerRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryBudget, setInquiryBudget] = useState('$1,500 - $3,500');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const autoRotateRef = useRef(true);
  const targetRotationYRef = useRef(0);
  const currentRotationYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const previousMouseXRef = useRef(0);
  const hoveredMeshRef = useRef(null);
  const isMouseOverCanvasRef = useRef(false);

  const servicesData = useMemo(() => {
    // 1. Start with all 7 core default services
    let result = DEFAULT_SERVICES_DATA.map((def, idx) => ({ ...def, id: idx }));

    if (services && services.length > 0) {
      // 2. Override default items with matching Firestore services data if available
      result = DEFAULT_SERVICES_DATA.map((def, idx) => {
        const found = services.find(
          (s) =>
            s.title?.toLowerCase().trim() === def.title?.toLowerCase().trim() ||
            s.shortName?.toLowerCase().trim() === def.shortName?.toLowerCase().trim()
        );

        if (found) {
          return {
            ...def,
            id: idx,
            title: found.title || def.title,
            shortName: found.shortName || found.title || def.shortName,
            iconName: found.icon || def.iconName,
            color: found.color || def.color,
            timeline: found.timeline || def.timeline,
            desc: found.description || found.desc || def.desc,
            features: found.features && found.features.length > 0 ? found.features : def.features,
            tech: found.tech && found.tech.length > 0 ? found.tech : def.tech,
          };
        }
        return { ...def, id: idx };
      });

      // 3. Append any additional custom services from Firestore that don't match any default title
      const extraServices = services.filter(
        (s) =>
          !DEFAULT_SERVICES_DATA.some(
            (def) =>
              def.title?.toLowerCase().trim() === s.title?.toLowerCase().trim() ||
              def.shortName?.toLowerCase().trim() === s.shortName?.toLowerCase().trim()
          )
      );

      extraServices.forEach((extra) => {
        const idx = result.length;
        const fallback = DEFAULT_SERVICES_DATA[idx % DEFAULT_SERVICES_DATA.length];
        result.push({
          id: idx,
          title: extra.title || `Service ${idx + 1}`,
          shortName: extra.shortName || extra.title || `Service ${idx + 1}`,
          iconName: extra.icon || fallback.iconName,
          IconComponent: fallback.IconComponent,
          color: extra.color || fallback.color,
          timeline: extra.timeline || fallback.timeline,
          desc: extra.description || extra.desc || fallback.desc,
          features: extra.features || fallback.features,
          tech: extra.tech || fallback.tech,
        });
      });
    }

    return result;
  }, [services]);

  const rotateToService = (index) => {
    setSelectedIndex(index);
    autoRotateRef.current = false;

    const TOTAL = servicesData.length;
    const targetAngle = -(index / TOTAL) * Math.PI * 2;
    const twoPi = Math.PI * 2;
    let currentNorm = currentRotationYRef.current % twoPi;

    targetRotationYRef.current = currentRotationYRef.current + (targetAngle - currentNorm);
  };

  const openServiceModal = (serviceIndex) => {
    setSelectedIndex(serviceIndex);
    setActiveTab('overview');
    setIsFormSubmitted(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    autoRotateRef.current = true;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0, 15.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const cardsGroup = new THREE.Group();
    scene.add(cardsGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 25);
    pointLight.position.set(0, 6, 10);
    scene.add(pointLight);

    const RADIUS = 7.6;
    const TOTAL = servicesData.length;
    const cardGeo = new THREE.PlaneGeometry(2.7, 3.6);
    const cardMeshes = [];

    servicesData.forEach((service, index) => {
      const angle = (index / TOTAL) * Math.PI * 2;
      const texture = createCardTextureHD(service);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(cardGeo, material);
      mesh.position.x = Math.sin(angle) * RADIUS;
      mesh.position.z = Math.cos(angle) * RADIUS;
      mesh.rotation.y = angle;
      mesh.userData = { id: index, service: service };

      cardsGroup.add(mesh);
      cardMeshes.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let dragStartX = 0;
    let hasDragged = false;

    const handleMouseEnter = () => {
      isMouseOverCanvasRef.current = true;
    };

    const handleMouseLeave = () => {
      isMouseOverCanvasRef.current = false;
      hoveredMeshRef.current = null;
      if (container) container.style.cursor = 'grab';
    };

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      hasDragged = false;
      previousMouseXRef.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      dragStartX = previousMouseXRef.current;
    };

    const onPointerMove = (e) => {
      const currentX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const currentY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      if (isDraggingRef.current) {
        const deltaX = currentX - previousMouseXRef.current;
        if (Math.abs(currentX - dragStartX) > 6) {
          hasDragged = true;
        }
        targetRotationYRef.current += deltaX * 0.0075;
        previousMouseXRef.current = currentX;
      } else {
        if (currentX && currentY && renderer.domElement) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((currentX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((currentY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(cardMeshes);

          if (intersects.length > 0) {
            hoveredMeshRef.current = intersects[0].object;
            if (container) container.style.cursor = 'pointer';
          } else {
            hoveredMeshRef.current = null;
            if (container) container.style.cursor = 'grab';
          }
        }
      }
    };

    const onPointerUp = (e) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      autoRotateRef.current = true;

      if (!hasDragged && renderer.domElement) {
        const rect = renderer.domElement.getBoundingClientRect();
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0]?.clientY) || 0;

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cardMeshes);

        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object;
          const serviceIdx = clickedMesh.userData.id;
          rotateToService(serviceIdx);
          openServiceModal(serviceIdx);
        }
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDraggingRef.current) {
        // Only slow down rotation when the cursor is directly hovering over a card mesh
        const isHoveringCard = Boolean(hoveredMeshRef.current);
        const rotSpeed = isHoveringCard ? 0.0004 : 0.0025;
        targetRotationYRef.current += rotSpeed;
      }

      currentRotationYRef.current += (targetRotationYRef.current - currentRotationYRef.current) * 0.08;
      cardsGroup.rotation.y = currentRotationYRef.current;

      cardMeshes.forEach((mesh) => {
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);

        const isFront = worldPos.z > 3.2;
        let scale = isFront ? 1.18 : 0.85;
        let targetY = 0;

        if (mesh === hoveredMeshRef.current) {
          scale *= 1.12;
          targetY = 0.45;
        }

        mesh.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        mesh.position.y += (targetY - mesh.position.y) * 0.1;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      cardMeshes.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (mesh.material.map) mesh.material.map.dispose();
          mesh.material.dispose();
        }
      });

      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [servicesData]);

  const currentService = servicesData[selectedIndex] || servicesData[0];
  const IconComp = currentService.IconComponent || Bot;

  return (
    <section id="services" className="relative z-10 py-12 text-slate-100 font-sans overflow-x-hidden select-none bg-[#060a12]">
      {/* Header */}
      <header className="relative z-10 pt-4 pb-3 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          <span>CAPABILITIES & SERVICES SHOWCASE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2 font-sans">
          High-Impact Tech Solutions <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400">Tailored For Your Business</span>
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto font-light">
          Drag to rotate the 3D capability ring. Click any service card to view specialized features, stack, and request custom quotes.
        </p>
      </header>

      {/* Main Viewport */}
      <main className="relative w-full max-w-6xl mx-auto h-[460px] md:h-[520px] my-1 flex items-center justify-center text-center">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing services3d-canvas-container flex items-center justify-center mx-auto" />

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-slate-400 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 flex items-center space-x-2 shadow-lg backdrop-blur-md">
          <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Drag horizontally to rotate 3D ring • Click card to inspect details</span>
        </div>
      </main>

      {/* Pill Buttons */}
      <section className="relative z-10 px-4 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {servicesData.map((serv, i) => {
              const ServIcon = serv.IconComponent || Bot;
              const isActive = i === selectedIndex;
              return (
                <button
                  key={serv.id + '-' + i}
                  onClick={() => {
                    rotateToService(i);
                    openServiceModal(i);
                  }}
                  className={`pill-btn px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all glass-pill ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-lg'
                      : 'text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <ServIcon className="w-3.5 h-3.5" style={{ color: serv.color }} />
                  <span>{serv.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300 ${
          isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div
          className={`glass-card w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/60 transform transition-all duration-300 relative overflow-hidden max-h-[92vh] flex flex-col justify-between ${
            isModalOpen ? 'scale-100' : 'scale-95'
          }`}
        >
          {/* Top Accent Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: `linear-gradient(to right, ${currentService.color}, #38bdf8)` }}
          />

          {/* Close Button */}
          <button
            onClick={closeModal}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-slate-700/80 z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto pr-1 my-2">
            {/* Modal Header */}
            <div className="flex items-center space-x-4 mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border"
                style={{
                  color: currentService.color,
                  borderColor: `${currentService.color}50`,
                  backgroundColor: `${currentService.color}15`,
                }}
              >
                <IconComp className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold"
                    style={{
                      color: currentService.color,
                      borderColor: `${currentService.color}40`,
                      backgroundColor: `${currentService.color}10`,
                    }}
                  >
                    SERVICE 0{currentService.id + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                    {currentService.timeline}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {currentService.title}
                </h3>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center border-b border-slate-800 mb-5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === 'overview'
                    ? 'text-sky-400 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview & Tech Stack</span>
              </button>
              <button
                onClick={() => setActiveTab('quote')}
                className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === 'quote'
                    ? 'text-sky-400 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request This Service</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentService.desc}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Key Deliverables & Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentService.features?.map((f, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: currentService.color }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-sky-400" /> Core Tech & Tools
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentService.tech?.map((t, idx) => (
                      <span key={idx} className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900/90 text-sky-300 border border-sky-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INQUIRY FORM */}
            {activeTab === 'quote' && (
              <div className="space-y-5 py-1">
                <div className="bg-slate-900/80 p-4 md:p-5 rounded-2xl border border-slate-700/60 backdrop-blur-md shadow-md">
                  <h4 className="text-sm md:text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Get an Estimate & Project Proposal
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Fill in details below regarding your <span className="text-sky-400 font-semibold">{currentService.title}</span> requirement.
                  </p>
                </div>

                {!isFormSubmitted ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsFormSubmitted(true);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-sky-400" />
                          Your Name <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sky-400" />
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={inquiryEmail}
                            onChange={(e) => setInquiryEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                        Estimated Budget Range
                      </label>
                      <select
                        value={inquiryBudget}
                        onChange={(e) => setInquiryBudget(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 transition-all cursor-pointer shadow-inner"
                      >
                        <option value="$500 - $1,500" className="bg-slate-900 text-slate-100">$500 - $1,500 (Basic Scope)</option>
                        <option value="$1,500 - $3,500" className="bg-slate-900 text-slate-100">$1,500 - $3,500 (Standard Business)</option>
                        <option value="$3,500 - $7,500" className="bg-slate-900 text-slate-100">$3,500 - $7,500 (Advanced System)</option>
                        <option value="$7,500+" className="bg-slate-900 text-slate-100">$7,500+ (Enterprise Level)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        Project Details / Requirements <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Describe what you want to build or automate..."
                        className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 transition-all resize-none min-h-[110px] shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-500 hover:from-sky-300 hover:to-cyan-400 text-slate-950 font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2.5 cursor-pointer mt-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </button>
                  </form>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3 shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" style={{ animationDuration: '2s' }} />
                    <h4 className="text-base font-bold text-emerald-300">Inquiry Sent Successfully!</h4>
                    <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you! Your request for <span className="text-white font-semibold">{currentService.title}</span> has been received. I will respond within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setInquiryName('');
                        setInquiryEmail('');
                        setInquiryMessage('');
                        setIsFormSubmitted(false);
                      }}
                      className="mt-3 inline-block px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-semibold text-emerald-400 border border-emerald-500/30 transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 shrink-0">
            <button
              onClick={() => {
                const prevIdx = (selectedIndex - 1 + servicesData.length) % servicesData.length;
                rotateToService(prevIdx);
                setSelectedIndex(prevIdx);
                setActiveTab('overview');
                setIsFormSubmitted(false);
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab(activeTab === 'overview' ? 'quote' : 'overview')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{activeTab === 'overview' ? 'Request Service' : 'View Details'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                const nextIdx = (selectedIndex + 1) % servicesData.length;
                rotateToService(nextIdx);
                setSelectedIndex(nextIdx);
                setActiveTab('overview');
                setIsFormSubmitted(false);
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
