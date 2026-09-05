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
  X,
  Layers,
  Send,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import './Services3D.css';

const DEFAULT_SERVICES_DATA = [
  {
    id: 0,
    title: "AI Agents",
    shortName: "AI Agents",
    iconName: "robot",
    IconComponent: Bot,
    color: "#F5A623",
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
    color: "#F5A623",
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
    color: "#F5A623",
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
    color: "#F5A623",
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
    color: "#F5A623",
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
    color: "#F5A623",
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
    color: "#F5A623",
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

  const logoIdx = (typeof id === 'number' ? Math.abs(id) : 0) % 7;
  switch(logoIdx) {
    case 0:
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

    case 1:
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

    case 2:
      ctx.beginPath();
      ctx.roundRect(-45, -35, 90, 65, 18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-15, 30); ctx.lineTo(-30, 50); ctx.lineTo(5, 30);
      ctx.fill();
      ctx.fillStyle = "#07221E";
      ctx.beginPath();
      ctx.arc(-20, -2, 8, 0, Math.PI * 2);
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.arc(20, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 3:
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-25, -30); ctx.lineTo(-50, 0); ctx.lineTo(-25, 30);
      ctx.moveTo(25, -30); ctx.lineTo(50, 0); ctx.lineTo(25, 30);
      ctx.moveTo(12, -35); ctx.lineTo(-12, 35);
      ctx.stroke();
      break;

    case 4:
      ctx.beginPath();
      ctx.roundRect(-55, -40, 110, 80, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-55, -20); ctx.lineTo(55, -20);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-40, -30, 5, 0, Math.PI * 2);
      ctx.arc(-25, -30, 5, 0, Math.PI * 2);
      ctx.arc(-10, -30, 5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 5:
      ctx.fillRect(-45, 10, 20, 35);
      ctx.fillRect(-10, -15, 20, 60);
      ctx.fillRect(25, -40, 20, 85);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-45, 0); ctx.lineTo(-10, -25); ctx.lineTo(25, -50);
      ctx.stroke();
      break;

    case 6:
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

  const accentColor = '#F5A623';

  // 1. Outer Card Rounded Dark Emerald Glass Container
  ctx.fillStyle = "#07221E";
  ctx.beginPath();
  ctx.roundRect(24, 24, 976, 1312, 54);
  ctx.fill();

  // 2. Card Glowing Emerald Border & Amber Highlight
  ctx.strokeStyle = "#1A5247";
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.strokeStyle = "rgba(245, 166, 35, 0.35)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // 3. Inner Rich Forest Green Gradient Fill
  const cardGrad = ctx.createLinearGradient(0, 0, 0, 1360);
  cardGrad.addColorStop(0, '#0F3830');
  cardGrad.addColorStop(0.5, '#0B2B26');
  cardGrad.addColorStop(1, '#051C18');
  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(48, 48, 928, 1264, 42);
  ctx.fill();

  // 4. Background Ambient Radial Light Glow Behind Icon
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(48, 48, 928, 1264, 42);
  ctx.clip();

  const radialGlow = ctx.createRadialGradient(512, 360, 10, 512, 360, 240);
  radialGlow.addColorStop(0, "rgba(245, 166, 35, 0.16)");
  radialGlow.addColorStop(0.7, "rgba(26, 82, 71, 0.08)");
  radialGlow.addColorStop(1, "transparent");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(48, 48, 928, 1264);
  ctx.restore();

  // 5. Top Badge (Service Index Number)
  ctx.fillStyle = "rgba(245, 166, 35, 0.16)";
  ctx.beginPath();
  ctx.roundRect(88, 88, 240, 70, 20);
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.font = "900 32px JetBrains Mono, monospace";
  ctx.textAlign = "center";
  ctx.fillText(`SERVICE 0${data.id + 1}`, 208, 134);

  // 6. Central Glowing Graphic Ring Container
  ctx.save();
  ctx.translate(512, 360);

  ctx.fillStyle = "#07221E";
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 8;
  ctx.stroke();

  drawCustomServiceLogo(ctx, data.id, accentColor);

  ctx.restore();

  // 7. Service Title Header
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "800 58px Inter, sans-serif";
  ctx.textAlign = "center";

  const words = data.title.split(' ');
  if (words.length > 2) {
    ctx.fillText(words.slice(0, 2).join(' '), 512, 600);
    ctx.fillText(words.slice(2).join(' '), 512, 670);
  } else {
    ctx.fillText(data.title, 512, 630);
  }

  // 8. Sub-bullet deliverables preview
  if (data.features) {
    ctx.font = "500 30px Inter, sans-serif";
    data.features.slice(0, 2).forEach((feat, idx) => {
      ctx.fillStyle = accentColor;
      ctx.textAlign = "center";
      ctx.fillText("✦", 200, 780 + (idx * 56));
      ctx.fillStyle = "#94B3A8";
      ctx.textAlign = "left";
      ctx.fillText(feat, 235, 780 + (idx * 56));
    });
  }

  // 9. Action Button Badge "Inspect Details"
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(180, 980, 664, 110, 30);
  ctx.fill();

  ctx.fillStyle = "#051C18";
  ctx.font = "900 36px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("INSPECT SERVICE →", 512, 1050);

  // 10. Bottom Tech Stack Tag Line
  if (data.tech) {
    ctx.fillStyle = "#94B3A8";
    ctx.font = "600 24px JetBrains Mono, monospace";
    ctx.fillText(data.tech.slice(0, 4).join("  •  "), 512, 1180);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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
    // If live services are supplied from Firestore, map them directly
    if (services && services.length > 0) {
      return services.map((svc, idx) => {
        // Find matching default template if available for fallbacks
        const matchedDefault = DEFAULT_SERVICES_DATA.find(
          (def) =>
            def.title?.toLowerCase().trim() === svc.title?.toLowerCase().trim() ||
            def.shortName?.toLowerCase().trim() === svc.shortName?.toLowerCase().trim()
        ) || DEFAULT_SERVICES_DATA[idx % DEFAULT_SERVICES_DATA.length];

        return {
          id: idx,
          docId: svc.id,
          title: svc.title || matchedDefault.title,
          shortName: svc.shortName || svc.title || matchedDefault.shortName,
          iconName: svc.iconName || svc.icon || matchedDefault.iconName,
          iconUrl: svc.iconUrl || (typeof svc.icon === 'string' && (svc.icon.startsWith('http') || svc.icon.startsWith('data:')) ? svc.icon : null) || matchedDefault.iconUrl,
          IconComponent: matchedDefault.IconComponent || Bot,
          color: svc.color || matchedDefault.color || '#F5A623',
          timeline: svc.timeline || matchedDefault.timeline || 'Est. 1 - 2 Weeks',
          desc: svc.description || svc.desc || matchedDefault.desc,
          features: Array.isArray(svc.features) && svc.features.length > 0
            ? svc.features
            : (typeof svc.features === 'string' && svc.features.trim()
                ? svc.features.split('\n').map(f => f.trim()).filter(Boolean)
                : matchedDefault.features),
          tech: Array.isArray(svc.tech) && svc.tech.length > 0
            ? svc.tech
            : (typeof svc.tech === 'string' && svc.tech.trim()
                ? svc.tech.split(',').map(t => t.trim()).filter(Boolean)
                : matchedDefault.tech),
        };
      });
    }

    // Fallback if services has not loaded yet
    return DEFAULT_SERVICES_DATA.map((def, idx) => ({ ...def, id: idx }));
  }, [services]);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  useEffect(() => {
    const handleWinResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleWinResize);
    return () => window.removeEventListener('resize', handleWinResize);
  }, []);

  const handleToggleExpand = (id) => {
    setExpandedServiceId((prev) => (prev === id ? null : id));
  };

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
    if (isMobile) return;

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;

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

    let animationFrameId = null;
    let inView = true;

    const animate = () => {
      if (!inView) {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDraggingRef.current) {
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

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !animationFrameId) {
        animate();
      }
    }, { threshold: 0.05 });

    intersectionObserver.observe(container);

    animate();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      intersectionObserver.disconnect();
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
  }, [servicesData, isMobile]);

  const currentService = servicesData[selectedIndex] || servicesData[0];
  const IconComp = currentService.IconComponent || Bot;

  return (
    <section id="services" className="relative z-10 py-12 text-slate-100 font-sans overflow-x-hidden select-none bg-[#051C18]">
      {/* Header */}
      <header className="services-section-header">
        <div className="services-badge">
          <span className="services-badge-dot" />
          <span className="services-badge-text">CAPABILITIES &amp; SERVICES SHOWCASE</span>
        </div>
        <h2 className="services-main-title">
          High-Impact Tech Solutions <br className="hidden sm:inline" />
          <span className="services-title-accent">Tailored For Your Vision</span>
        </h2>
        <p className="services-subtitle">
          {isMobile
            ? 'Tap any service card to reveal deliverables, tech stacks, and request an instant quote.'
            : 'Drag horizontally or click any 3D service card to inspect features, tech stacks, and request an instant quote.'}
        </p>
      </header>

      {/* 3D CAROUSEL CANVAS (Desktop & Laptop screens) */}
      <main className="services3d-desktop-wrapper relative z-10 w-full h-[480px] md:h-[540px] my-2">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing services3d-canvas-container flex items-center justify-center mx-auto" />
      </main>

      {/* MOBILE INTERACTIVE ACCORDION (Mobile screens <= 768px) */}
      <div className="services-mobile-container">
        <div className="services-mobile-accordion">
          {servicesData.map((service, idx) => {
            const isExpanded = expandedServiceId === (service.id ?? idx);
            const ServiceIcon = service.IconComponent || Bot;

            return (
              <div
                key={service.id ?? idx}
                className={`services-mobile-card ${isExpanded ? 'expanded' : ''}`}
              >
                {/* Header Row: Badge, Title, Icon, and Expand Indicator */}
                <button
                  type="button"
                  className="services-mobile-card-header"
                  onClick={() => handleToggleExpand(service.id ?? idx)}
                  aria-expanded={isExpanded}
                >
                  <div className="services-mobile-header-left">
                    <div className="services-mobile-icon-box">
                      {service.iconUrl ? (
                        <img
                          src={service.iconUrl}
                          alt={service.title}
                          className="services-mobile-icon-img"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <ServiceIcon className="services-mobile-icon-svg" size={22} />
                      )}
                    </div>

                    <div className="services-mobile-title-wrap">
                      <span className="services-mobile-badge">
                        <Clock size={11} />
                        <span>{service.timeline || 'Est. 1 - 2 Weeks'}</span>
                      </span>
                      <h3 className="services-mobile-title">{service.title}</h3>
                    </div>
                  </div>

                  <div className={`services-mobile-chevron ${isExpanded ? 'rotated' : ''}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Collapsible Content */}
                <div className="services-mobile-collapsible-wrapper">
                  <div className="services-mobile-card-body">
                    {/* Description */}
                    <p className="services-mobile-desc">{service.desc}</p>

                    {/* Features / Deliverables */}
                    {service.features && service.features.length > 0 && (
                      <div className="services-mobile-features">
                        <h4 className="services-mobile-subhead">
                          <Sparkles size={13} />
                          <span>Key Deliverables</span>
                        </h4>
                        <div className="services-mobile-features-list">
                          {service.features.map((feat, fIdx) => (
                            <div key={fIdx} className="services-mobile-feature-item">
                              <CheckCircle size={14} className="services-mobile-check" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tech Tags */}
                    {service.tech && service.tech.length > 0 && (
                      <div className="services-mobile-tech">
                        <h4 className="services-mobile-subhead">Technologies</h4>
                        <div className="services-mobile-tech-tags">
                          {service.tech.map((t, tIdx) => (
                            <span key={tIdx} className="services-mobile-tech-pill">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="services-mobile-cta">
                      <button
                        type="button"
                        onClick={() => openServiceModal(idx)}
                        className="services-mobile-btn-request"
                      >
                        <Send size={14} />
                        <span>Request Instant Quote</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED SERVICE MODAL & QUOTE SYSTEM */}
      {isModalOpen && currentService && (
        <div
          className="services-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="services-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="services-modal-close"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="services-modal-header">
              <div className="services-modal-icon-box">
                <IconComp className="services-modal-icon" />
              </div>
              <div className="services-modal-header-info">
                <div className="services-modal-timeline-badge">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentService.timeline || "Est. 1 - 2 Weeks"}</span>
                </div>
                <h3 className="services-modal-title">
                  {currentService.title}
                </h3>
              </div>
            </div>

            {/* Modern Segmented Tab Bar */}
            <div className="services-modal-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`services-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview &amp; Tech Stack</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quote')}
                className={`services-tab-btn ${activeTab === 'quote' ? 'active' : ''}`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request This Service</span>
              </button>
            </div>

            {/* Modal Body / Scrollable Area */}
            <div className="services-modal-body">
              {activeTab === 'overview' && (
                <div className="services-overview-content">
                  <p className="services-overview-desc">
                    {currentService.desc}
                  </p>

                  <div className="services-features-section">
                    <h4 className="services-subhead">
                      <Sparkles className="w-3.5 h-3.5" /> Key Deliverables &amp; Features
                    </h4>
                    <div className="services-features-grid">
                      {currentService.features?.map((feat, idx) => (
                        <div key={idx} className="services-feature-card">
                          <CheckCircle className="services-feature-check" />
                          <span className="services-feature-text">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="services-tech-section">
                    <h4 className="services-subhead text-muted">
                      Technologies &amp; Frameworks
                    </h4>
                    <div className="services-tech-tags">
                      {currentService.tech?.map((t, idx) => (
                        <span key={idx} className="services-tech-pill">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="services-cta-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveTab('quote')}
                      className="services-submit-btn"
                    >
                      <Send className="w-4 h-4" />
                      <span>Get Instant Service Quote</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'quote' && (
                <div className="services-quote-content">
                  {isFormSubmitted ? (
                    <div className="services-form-success">
                      <div className="services-success-icon-wrap">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="services-success-title">Quote Request Received!</h4>
                      <p className="services-success-desc">
                        Thank you <span className="highlight">{inquiryName}</span>. I have received your request for <span className="accent">{currentService.title}</span> and will respond within 24 hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsFormSubmitted(false)}
                        className="services-reset-btn"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setIsFormSubmitted(true);
                      }}
                      className="services-quote-form"
                    >
                      <div className="services-form-row">
                        <div className="services-form-group">
                          <label className="services-form-label">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="services-form-input"
                          />
                        </div>

                        <div className="services-form-group">
                          <label className="services-form-label">Your Email Address *</label>
                          <input
                            type="email"
                            required
                            value={inquiryEmail}
                            onChange={(e) => setInquiryEmail(e.target.value)}
                            placeholder="e.g. john@company.com"
                            className="services-form-input"
                          />
                        </div>
                      </div>

                      <div className="services-form-group">
                        <label className="services-form-label">Estimated Project Budget</label>
                        <select
                          value={inquiryBudget}
                          onChange={(e) => setInquiryBudget(e.target.value)}
                          className="services-form-select"
                        >
                          <option value="<$1,000">&lt; $1,000 (Basic Setup)</option>
                          <option value="$1,500 - $3,500">$1,500 - $3,500 (Standard System)</option>
                          <option value="$3,500 - $7,500">$3,500 - $7,500 (Full Platform / Enterprise AI)</option>
                          <option value=">$7,500">&gt; $7,500 (Long-Term / Retainer)</option>
                        </select>
                      </div>

                      <div className="services-form-group">
                        <label className="services-form-label">Project Details / Goals *</label>
                        <textarea
                          required
                          rows={3}
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          placeholder={`Describe what you want to build with ${currentService.title}...`}
                          className="services-form-textarea"
                        />
                      </div>

                      <button
                        type="submit"
                        className="services-submit-btn"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Service Inquiry</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
