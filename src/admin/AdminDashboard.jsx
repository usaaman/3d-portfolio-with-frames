import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  LogOut,
  ExternalLink,
  LayoutDashboard,
  Layers,
  User,
  Cpu,
  FolderGit2,
  Briefcase,
  Share2,
  FileText,
  MessageSquare,
  Mail,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

// Component & Section Managers
import ConfirmModal from './components/ConfirmModal';
import DashboardOverview from './sections/DashboardOverview';
import HeroManager from './sections/HeroManager';
import AboutManager from './sections/AboutManager';
import SkillsManager from './sections/SkillsManager';
import ProjectsManager from './sections/ProjectsManager';
import ServicesManager from './sections/ServicesManager';
import ContactManager from './sections/ContactManager';
import ResumeManager from './sections/ResumeManager';
import AIChatsManager from './sections/AIChatsManager';
import InquiriesManager from './sections/InquiriesManager';

import './AdminDashboard.css';

const SECTIONS = [
  { id: 'dashboard', name: 'Dashboard Overview', icon: LayoutDashboard, desc: 'Live command center, telemetry metrics, and quick shortcuts' },
  { id: 'hero', name: 'Hero Section', icon: Layers, desc: 'Headings, title, watermark, CTA buttons, and avatar' },
  { id: 'about', name: 'About Section', icon: User, desc: 'Biography, quick glance cards, milestones, and photo' },
  { id: 'skills', name: 'Skills Matrix', icon: Cpu, desc: 'Dynamic categories (rows), icons, and 3D character PNG' },
  { id: 'projects', name: 'Projects Showcase', icon: FolderGit2, desc: 'Portfolio projects with up to 5 images/videos per item' },
  { id: 'services', name: 'Services & Offerings', icon: Briefcase, desc: 'Professional service cards with required center logo' },
  { id: 'contact', name: 'Contact & Socials', icon: Share2, desc: 'WhatsApp, email, Twitter/X, GitHub, and LinkedIn links' },
  { id: 'resume', name: 'Resume Settings', icon: FileText, desc: 'PDF file upload, direct URL, and 3-button synchronization' },
  { id: 'ai', name: 'AI Conversations', icon: Sparkles, desc: 'Visitor chats, autonomous summaries, read/unread status' },
  { id: 'inquiries', name: 'Contact Inquiries', icon: Mail, desc: 'Direct messages submitted from the portfolio contact form' },
];

export default function AdminDashboard({ auth }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && SECTIONS.some((s) => s.id === tab)) return tab;
    } catch (e) {}
    return 'dashboard';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync active tab to URL search parameter
  useEffect(() => {
    try {
      const url = new URL(window.location);
      if (activeSection === 'dashboard') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', activeSection);
      }
      window.history.replaceState({}, '', url);
    } catch (e) {}
  }, [activeSection]);

  // 2-Step Logout Confirmation State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Unread counters for badge display in sidebar
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [unreadAIChats, setUnreadAIChats] = useState(0);

  // Route protection
  useEffect(() => {
    if (!auth?.loading && !auth?.isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [auth?.isAuthenticated, auth?.loading, navigate]);

  // Real-time listener for unread inquiries
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'contactMessages'));
      const unsub = onSnapshot(q, (snapshot) => {
        let count = 0;
        snapshot.forEach((doc) => {
          if (!doc.data().read) count++;
        });
        setUnreadInquiries(count);
      });
      return () => unsub();
    } catch (e) {}
  }, []);

  // Real-time listener for unread AI chats
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'chatConversations'));
      const unsub = onSnapshot(q, (snapshot) => {
        let count = 0;
        snapshot.forEach((doc) => {
          if (!doc.data().read) count++;
        });
        setUnreadAIChats(count);
      });
      return () => unsub();
    } catch (e) {}
  }, []);

  const handleRequestSignOut = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmSignOut = async () => {
    setLoggingOut(true);
    try {
      await auth?.logout();
      navigate('/admin/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const currentSectionMeta = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="adm-root-layout">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="adm-mobile-toggle"
        aria-label="Toggle navigation"
      >
        {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* SIDEBAR (30% Forest Green Anchoring) */}
      <aside className={`adm-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="adm-sidebar-header">
          <div className="adm-brand-box">
            <div className="adm-brand-icon">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="adm-brand-title">Usman // Admin</h1>
              <p className="adm-brand-subtitle">Master Site Control</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="adm-nav-list">
          <div className="adm-nav-category-title">Command Center</div>
          {/* Dashboard Item */}
          <button
            onClick={() => {
              setActiveSection('dashboard');
              setMobileSidebarOpen(false);
            }}
            className={`adm-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard Overview</span>
          </button>

          <div className="adm-nav-category-title" style={{ marginTop: '14px' }}>
            Site Content Sections
          </div>
          {SECTIONS.slice(1, 8).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`adm-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.name}</span>
              </button>
            );
          })}

          <div className="adm-nav-category-title" style={{ marginTop: '14px' }}>
            Intelligence & Inquiries
          </div>

          {/* AI Conversations Item */}
          <button
            onClick={() => {
              setActiveSection('ai');
              setMobileSidebarOpen(false);
            }}
            className={`adm-nav-item ${activeSection === 'ai' ? 'active' : ''}`}
          >
            <Sparkles size={17} />
            <span>AI Conversations</span>
            {unreadAIChats > 0 && (
              <span className="adm-nav-badge adm-nav-badge-alert">{unreadAIChats} new</span>
            )}
          </button>

          {/* Contact Inquiries Item */}
          <button
            onClick={() => {
              setActiveSection('inquiries');
              setMobileSidebarOpen(false);
            }}
            className={`adm-nav-item ${activeSection === 'inquiries' ? 'active' : ''}`}
          >
            <Mail size={17} />
            <span>Contact Inquiries</span>
            {unreadInquiries > 0 && (
              <span className="adm-nav-badge adm-nav-badge-alert">{unreadInquiries} new</span>
            )}
          </button>
        </nav>

        {/* Sidebar Footer / Admin Identity */}
        <div className="adm-sidebar-footer">
          <div className="adm-admin-user-pill">
            <div className="adm-admin-avatar">U</div>
            <div className="adm-admin-meta">
              <span className="adm-admin-name">Muhammad Usman</span>
              <span className="adm-admin-role">Super Administrator</span>
            </div>
          </div>
          <button onClick={handleRequestSignOut} title="Sign Out" className="adm-logout-btn">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT (60% Mint Canvas & Content) */}
      <div className="adm-main-viewport">
        {/* Top Sticky Header */}
        <header className="adm-top-header">
          <div className="adm-top-header-left">
            <h2 className="adm-top-section-title">{currentSectionMeta.name}</h2>
            <p className="adm-top-section-desc">{currentSectionMeta.desc}</p>
          </div>

          <div className="adm-top-header-actions">
            <Link to="/" target="_blank" rel="noopener noreferrer" className="adm-btn-portal-link">
              <ExternalLink size={15} />
              <span>Preview Live Portfolio</span>
            </Link>

            <button
              onClick={handleRequestSignOut}
              className="adm-nav-btn-danger"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* Section View Container */}
        <main className="adm-content-container">
          {activeSection === 'dashboard' && (
            <DashboardOverview onNavigate={(secId) => setActiveSection(secId)} />
          )}
          {activeSection === 'hero' && <HeroManager />}
          {activeSection === 'about' && <AboutManager />}
          {activeSection === 'skills' && <SkillsManager />}
          {activeSection === 'projects' && <ProjectsManager />}
          {activeSection === 'services' && <ServicesManager />}
          {activeSection === 'contact' && <ContactManager />}
          {activeSection === 'resume' && <ResumeManager />}
          {activeSection === 'ai' && <AIChatsManager />}
          {activeSection === 'inquiries' && <InquiriesManager />}
        </main>
      </div>

      {/* 2-Step Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Sign Out Confirmation"
        message={
          <span>
            Are you sure you want to sign out of the <strong>Admin Control Panel</strong>? You will need your master credentials (<code>usman.nazir.dev@gmail.com</code>) to access the panel again.
          </span>
        }
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        confirmVariant="warning"
        iconType="logout"
        loading={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
}
