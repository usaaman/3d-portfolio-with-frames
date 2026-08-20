import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  User,
  Award,
  Briefcase,
  Grid,
  Mail,
  BrainCircuit,
  FileText,
  Share2,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Folder,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  onLogout,
  onCloseMobile, // Mobile drawer close
}) {
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">MU</div>
        {!isCollapsed && <span className="brand-name">Admin CMS</span>}
        <button
          className="sidebar-collapse-btn hidden-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Group list */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {/* Dashboard */}
          <li>
            <NavLink
              to="/admin/dashboard"
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
            >
              <LayoutDashboard size={18} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Dashboard</span>}
            </NavLink>
          </li>

          {/* Portfolio Collapsible Group */}
          <li>
            <button
              type="button"
              className="nav-item nav-menu-header"
              onClick={() => !isCollapsed && setPortfolioOpen(!portfolioOpen)}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              <Folder size={18} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Portfolio</span>}
              {!isCollapsed && (
                portfolioOpen ? <ChevronDown size={14} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              )}
            </button>
            {portfolioOpen && !isCollapsed && (
              <ul className="nav-sub-list">
                <li>
                  <NavLink to="/admin/hero" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <Sparkles size={14} />
                    <span>Hero</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/about" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <User size={14} />
                    <span>About</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/admin/projects" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <Briefcase size={14} />
                    <span>Projects</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/services" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <Grid size={14} />
                    <span>Services</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/contact" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <Mail size={14} />
                    <span>Contact</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Media Library */}
          <li>
            <NavLink
              to="/admin/media"
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
            >
              <ImageIcon size={18} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Media Library</span>}
            </NavLink>
          </li>

          {/* Messages */}
          <li>
            <NavLink
              to="/admin/messages"
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
            >
              <Mail size={18} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Messages</span>}
            </NavLink>
          </li>

          {/* AI Conversations */}
          <li>
            <NavLink
              to="/admin/ai-conversations"
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
            >
              <BrainCircuit size={18} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">AI Conversations</span>}
            </NavLink>
          </li>

          {/* Settings Collapsible Group */}
          <li>
            <button
              type="button"
              className="nav-item nav-menu-header"
              onClick={() => !isCollapsed && setSettingsOpen(!settingsOpen)}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              <Settings size={18} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Settings</span>}
              {!isCollapsed && (
                settingsOpen ? <ChevronDown size={14} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              )}
            </button>
            {settingsOpen && !isCollapsed && (
              <ul className="nav-sub-list">
                <li>
                  <NavLink to="/admin/resume" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <FileText size={14} />
                    <span>Resume</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/socials" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <Share2 size={14} />
                    <span>Social Links</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/seo" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <Search size={14} />
                    <span>SEO</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/ai-settings" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <BrainCircuit size={14} />
                    <span>AI Settings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/settings" onClick={onCloseMobile} className={({ isActive }) => `nav-sub-item ${isActive ? 'is-active' : ''}`}>
                    <Sliders size={14} />
                    <span>General Settings</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Sidebar Footer Logout */}
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={onLogout} aria-label="Log out">
          <LogOut size={18} />
          {!isCollapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
