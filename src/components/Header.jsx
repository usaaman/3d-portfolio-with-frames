import { useEffect, useState, useRef } from 'react';
import { 
  Home, 
  User, 
  Cpu, 
  Briefcase, 
  Layers, 
  Mail, 
  Download, 
  Menu, 
  X 
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { recordResumeDownload } from '../utils/analytics';
import { scrollToSection } from '../utils/scrollTargets';
import './Header.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', number: '01', icon: Home },
  { id: 'about', label: 'About', number: '02', icon: User },
  { id: 'skills', label: 'Skills', number: '03', icon: Cpu },
  { id: 'projects', label: 'Projects', number: '04', icon: Briefcase },
  { id: 'services', label: 'Services', number: '05', icon: Layers },
  { id: 'contact', label: 'Contact', number: '06', icon: Mail },
];

export default function Header({ resume }) {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate continuous page scroll progress (0% to 100%)
      const progress = totalDocHeight > 0 
        ? Math.min(100, Math.max(0, (scrollY / totalDocHeight) * 100)) 
        : 0;
      setScrollProgress(progress);

      // Section detection
      const wrapper = document.querySelector('.scroll-wrapper');
      if (wrapper) {
        const wrapperTop = window.scrollY + wrapper.getBoundingClientRect().top;
        const maxScrollable = wrapper.offsetHeight - window.innerHeight;
        const relativeScroll = scrollY - wrapperTop;

        if (relativeScroll >= 0 && relativeScroll < maxScrollable) {
          const heroProgress = relativeScroll / maxScrollable;
          if (heroProgress < 0.42) {
            setActiveSection('home');
            return;
          } else if (heroProgress < 0.72) {
            setActiveSection('about');
            return;
          } else {
            setActiveSection('skills');
            return;
          }
        }
      }

      // Past Hero/About/Skills stage: check projects, services, contact
      const sections = ['projects', 'services', 'contact'];
      const scrollPosition = scrollY + 240;
      let current = 'skills';

      for (let i = sections.length - 1; i >= 0; i--) {
        const secId = sections[i];
        const el = document.getElementById(secId);
        if (el && el.offsetTop <= scrollPosition) {
          current = secId;
          break;
        }
      }
      setActiveSection(current);
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleDownload = () => {
    recordResumeDownload();
  };

  const resumeUrl = resume?.resumeFileUrl || '/resume.pdf';

  // 3D Hexagon MU Brand Monogram SVG
  const renderMuLogo = (prefix = 'desk') => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="sidebar-logo-svg">
      <defs>
        <filter id={`${prefix}MuShadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#022c22" floodOpacity="0.65" />
        </filter>
        <linearGradient id={`${prefix}GreenGoldGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <g filter={`url(#${prefix}MuShadow)`}>
        <polygon points="250,50 410,142 410,328 250,420 90,328 90,142" fill="rgba(11, 43, 38, 0.85)" stroke="#10b981" strokeWidth="6" />
        <polygon points="250,50 410,142 410,328 250,420 90,328 90,142" fill="none" stroke="#fbbf24" strokeWidth="4" opacity="0.8" />
        <path d="M 210,75 L 115,130 L 115,315 L 210,370" fill="none" stroke={`url(#${prefix}GreenGoldGrad)`} strokeWidth="6" strokeLinecap="round" />
        <path d="M 290,75 L 385,130 L 385,315 L 290,370" fill="none" stroke={`url(#${prefix}GreenGoldGrad)`} strokeWidth="6" strokeLinecap="round" />
        <polygon points="250,92 365,158 365,302 250,368 135,302 135,158" fill="none" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="3" strokeDasharray="10 6" />
        <g className="nodes-group">
          <circle cx="210" cy="75" r="7" fill="#f59e0b" />
          <circle cx="290" cy="75" r="7" fill="#f59e0b" />
          <circle cx="102" cy="230" r="7" fill="#f59e0b" />
          <circle cx="398" cy="230" r="7" fill="#f59e0b" />
          <circle cx="210" cy="370" r="7" fill="#f59e0b" />
          <circle cx="290" cy="370" r="7" fill="#f59e0b" />
        </g>
        <g className="mu-letters-group">
          <polygon points="155,170 178,162 205,252 232,158 252,158 252,310 230,312 230,222 210,295 198,295 178,222 178,300 155,296" fill={`url(#${prefix}GreenGoldGrad)`} />
          <polygon points="230,312 252,310 252,158 238,158 238,298" fill="#059669" opacity="0.9" />
          <polygon points="268,160 290,163 290,265 315,268 315,172 338,178 338,295 268,318" fill={`url(#${prefix}GreenGoldGrad)`} />
          <polygon points="268,318 338,295 338,305 268,328" fill="#059669" opacity="0.9" />
          <polygon points="290,265 315,268 315,276 290,273" fill="#059669" opacity="0.9" />
        </g>
      </g>
    </svg>
  );

  return (
    <>
      {/* =========================================================================
          0. FLOATING TOP-RIGHT QUICK ACTION (Resume Download)
          ========================================================================= */}
      {resume?.status !== 'Inactive' && resume?.resumeFileUrl && (
        <aside className="floating-top-resume-wrap" aria-label="Resume Quick Action">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={handleDownload}
            className="floating-top-resume-btn"
            aria-label="Download Muhammad Usman's Resume (PDF)"
            title="Download Resume (PDF)"
          >
            <span className="floating-resume-glow" />
            <div className="floating-resume-icon-box">
              <Download size={15} strokeWidth={2.2} className="floating-resume-icon" />
            </div>
            <div className="floating-resume-text-group">
              <span className="floating-resume-title">Resume</span>
              <span className="floating-resume-badge">PDF</span>
            </div>
            <span className="floating-resume-shimmer" />
          </a>
        </aside>
      )}

      {/* =========================================================================
          1. DESKTOP FLOATING CARD SIDEBAR (With Continuous Scroll Progress Line)
          ========================================================================= */}
      <aside className="desktop-floating-sidebar" aria-label="Main Navigation Sidebar">
        <div className="sidebar-ambient-glow" />

        {/* Top: Brand Monogram Logo */}
        <a
          href="#home"
          className="sidebar-logo-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}
          title="Return to Top // Muhammad Usman"
          aria-label="Home"
        >
          <div className="sidebar-logo-wrap">
            {renderMuLogo('deskSidebar')}
          </div>
          <span className="sidebar-tooltip">00 // TOP</span>
        </a>

        {/* Middle: Navigation Nodes Connected by Continuous Progress Track */}
        <div className="sidebar-nav-container">
          {/* Background Track Line */}
          <div className="sidebar-progress-track" aria-hidden="true">
            {/* Dynamic Glowing Progress Fill Line (0% to 100%) */}
            <div 
              className="sidebar-progress-fill" 
              style={{ height: `${scrollProgress}%` }} 
            />
          </div>

          {/* Nav Items along the track */}
          <nav className="sidebar-nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => scrollToSection(item.id)}
                  aria-label={`Scroll to ${item.label}`}
                  title={item.label}
                >
                  <div className="sidebar-nav-node">
                    <Icon className="sidebar-nav-icon" size={17} />
                    {isActive && <span className="sidebar-active-ping" />}
                  </div>

                  {/* High-Tech Hover Tooltip Tag */}
                  <span className="sidebar-tooltip">
                    <span className="tooltip-num">{item.number} //</span> {item.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Resume Download Action Button */}
        {resume?.status !== 'Inactive' && resume?.resumeFileUrl && (
          <a
            className="sidebar-resume-btn"
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={handleDownload}
            aria-label="Download Resume / CV"
          >
            <span className="sidebar-resume-shimmer" />
            <Download size={16} className="sidebar-resume-icon" />
            <span className="sidebar-tooltip">CV // RESUME</span>
          </a>
        )}

        {/* Mini Percentage Metric */}
        <div className="sidebar-percent-badge" title="Page Scroll Progress">
          <span>{Math.round(scrollProgress)}%</span>
        </div>
      </aside>


      {/* =========================================================================
          2. MOBILE TOP HEADER (Compact Floating Bar with 3-Line Menu Toggle)
          ========================================================================= */}
      <header className="mobile-top-header">
        <a
          href="#home"
          className="mobile-logo-group"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}
        >
          <div className="mobile-logo-wrap">
            {renderMuLogo('mobileTop')}
          </div>
          <div className="mobile-logo-text">
            <span className="mobile-name">Muhammad<span className="logo-accent">.</span>Usman</span>
            <span className="mobile-title">Full-Stack & AI</span>
          </div>
        </a>

        <div className="mobile-header-actions">
          {resume?.status !== 'Inactive' && resume?.resumeFileUrl && (
            <a
              className="mobile-resume-chip"
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={handleDownload}
            >
              <span>CV</span>
              <Download size={12} />
            </a>
          )}

          {/* 3-Line Hamburger Menu Toggle */}
          <button
            className={`mobile-menu-toggle ${menuOpen ? 'is-active' : ''}`}
            aria-label="Toggle navigation drawer"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="bar line-1" />
            <span className="bar line-2" />
            <span className="bar line-3" />
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        <nav className={`mobile-nav-drawer ${menuOpen ? 'is-open' : ''}`}>
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-tag">// NAVIGATION MENU</span>
            <button 
              className="mobile-drawer-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mobile-drawer-links">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`mobile-drawer-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    scrollToSection(item.id);
                    setMenuOpen(false);
                  }}
                >
                  <div className="mobile-drawer-item-left">
                    <Icon size={18} className="drawer-icon" />
                    <span>{item.label}</span>
                  </div>
                  <span className="drawer-num">{item.number}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>


      {/* =========================================================================
          3. MOBILE BOTTOM NAVIGATION DOCK (Floating Bottom Card with Icons)
          ========================================================================= */}
      <nav className="mobile-bottom-dock" aria-label="Mobile Navigation Dock">
        {/* Micro Scroll Progress Line along the top edge */}
        <div className="bottom-dock-progress-track">
          <div 
            className="bottom-dock-progress-fill" 
            style={{ width: `${scrollProgress}%` }} 
          />
        </div>

        {/* 6 Section Quick Access Icons */}
        <div className="bottom-dock-items">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`bottom-dock-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => scrollToSection(item.id)}
                aria-label={item.label}
              >
                <div className="dock-icon-wrapper">
                  <Icon size={18} className="dock-icon" />
                  {isActive && <span className="dock-active-dot" />}
                </div>
                <span className="dock-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
