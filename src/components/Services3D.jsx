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
  Sparkles
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

  switch(id) {
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
    let result = DEFAULT_SERVICES_DATA.map((def, idx) => ({ ...def, id: idx }));

    if (services && services.length > 0) {
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

    let animationFrameId;
    const animate = () => {
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
    <section id="services" className="relative z-10 py-12 text-slate-100 font-sans overflow-x-hidden select-none bg-[#051C18]">
      {/* Header */}
      <header className="relative z-10 pt-4 pb-3 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 text-[#F5A623] text-xs font-semibold tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse"></span>
          <span>CAPABILITIES & SERVICES SHOWCASE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2 font-sans">
          High-Impact Tech Solutions <br className="hidden sm:inline" />
          <span className="font-script text-[#F5A623] text-4xl md:text-6xl inline-block -rotate-1">Tailored For Your Business</span>
        </h2>
        <p className="text-[#94B3A8] text-xs md:text-sm max-w-xl mx-auto font-light">
          Drag horizontally or click any 3D service card to inspect features, tech stacks, and request a instant quote.
        </p>
      </header>

      {/* 3D CAROUSEL CANVAS */}
      <main className="relative z-10 w-full h-[480px] md:h-[540px] my-2">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing services3d-canvas-container flex items-center justify-center mx-auto" />
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
                      ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623] shadow-lg'
                      : 'text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <ServIcon className="w-3.5 h-3.5" style={{ color: isActive ? '#F5A623' : '#94B3A8' }} />
                  <span>{serv.shortName || serv.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* DETAILED SERVICE MODAL & QUOTE SYSTEM */}
      {isModalOpen && currentService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl bg-[#07221E] border border-[#1A5247] rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden text-left transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 rounded-full p-2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-[#1A5247]"
                style={{ backgroundColor: 'rgba(245, 166, 35, 0.15)' }}
              >
                <IconComp className="w-7 h-7 text-[#F5A623]" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#F5A623] font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentService.timeline || "Est. 1 - 2 Weeks"}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">
                  {currentService.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center border-b border-[#1A5247] mb-5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === 'overview'
                    ? 'text-[#F5A623] border-[#F5A623]'
                    : 'text-[#94B3A8] hover:text-slate-200 border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview & Tech Stack</span>
              </button>
              <button
                onClick={() => setActiveTab('quote')}
                className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === 'quote'
                    ? 'text-[#F5A623] border-[#F5A623]'
                    : 'text-[#94B3A8] hover:text-slate-200 border-transparent'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request This Service</span>
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-5">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentService.desc}
                </p>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5A623] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Key Deliverables & Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {currentService.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 bg-[#0F3830]/60 border border-[#1A5247] rounded-xl p-3">
                        <CheckCircle className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94B3A8] mb-2.5">
                    Technologies & Frameworks
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentService.tech?.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-[#1A5247] text-xs font-mono text-[#F5A623]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('quote')}
                    className="w-full py-3.5 rounded-2xl bg-[#F5A623] text-[#051C18] font-extrabold text-sm hover:bg-[#FFB74D] transition-colors shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Get Instant Service Quote</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'quote' && (
              <div>
                {isFormSubmitted ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-16 h-16 bg-[#F5A623]/20 border border-[#F5A623] text-[#F5A623] rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Quote Request Received!</h4>
                    <p className="text-sm text-[#94B3A8] max-w-md mx-auto">
                      Thank you <span className="text-white font-semibold">{inquiryName}</span>. I have received your request for <span className="text-[#F5A623] font-semibold">{currentService.title}</span> and will respond within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsFormSubmitted(false)}
                      className="mt-4 px-6 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
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
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B26] border border-[#1A5247] text-white text-xs focus:outline-none focus:border-[#F5A623]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Your Email Address *</label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="e.g. john@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B26] border border-[#1A5247] text-white text-xs focus:outline-none focus:border-[#F5A623]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Project Budget</label>
                      <select
                        value={inquiryBudget}
                        onChange={(e) => setInquiryBudget(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B26] border border-[#1A5247] text-white text-xs focus:outline-none focus:border-[#F5A623]"
                      >
                        <option value="<$1,000">&lt; $1,000 (Basic Setup)</option>
                        <option value="$1,500 - $3,500">$1,500 - $3,500 (Standard System)</option>
                        <option value="$3,500 - $7,500">$3,500 - $7,500 (Full Platform / Enterprise AI)</option>
                        <option value=">$7,500">&gt; $7,500 (Long-Term / Retainer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Project Details / Goals *</label>
                      <textarea
                        required
                        rows={3}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder={`Describe what you want to build with ${currentService.title}...`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B26] border border-[#1A5247] text-white text-xs focus:outline-none focus:border-[#F5A623]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-[#F5A623] text-[#051C18] font-extrabold text-sm hover:bg-[#FFB74D] transition-colors shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
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
      )}
    </section>
  );
}
