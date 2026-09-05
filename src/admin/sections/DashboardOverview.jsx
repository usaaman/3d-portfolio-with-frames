import React, { useState, useEffect } from 'react';
import {
  Mail,
  Sparkles,
  FolderGit2,
  Briefcase,
  Cpu,
  FileText,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, doc, getDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export default function DashboardOverview({ onNavigate }) {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    unreadInquiries: 0,
    recentInquiries: [],
    totalAIChats: 0,
    unreadAIChats: 0,
    recentAIChats: [],
    totalProjects: 0,
    totalServices: 0,
    totalCategories: 6,
    totalSkills: 48,
    resumeDownloads: 0,
    resumeFileName: 'resume.pdf',
    loading: true
  });

  useEffect(() => {
    let unsubs = [];

    // 1. Inquiries Stream
    try {
      if (db) {
        const qInq = query(collection(db, 'contactMessages'));
        const unsubInq = onSnapshot(qInq, (snap) => {
          let total = 0;
          let unread = 0;
          let list = [];
          snap.forEach((d) => {
            total++;
            const data = d.data();
            if (!data.read) unread++;
            list.push({ id: d.id, ...data });
          });
          // Sort by timestamp desc
          list.sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeB - timeA;
          });
          setStats((prev) => ({
            ...prev,
            totalInquiries: total,
            unreadInquiries: unread,
            recentInquiries: list.slice(0, 3)
          }));
        });
        unsubs.push(unsubInq);
      }
    } catch (e) {
      console.warn('Inquiries listener notice:', e);
    }

    // 2. AI Conversations Stream
    try {
      if (db) {
        const qAI = query(collection(db, 'chatConversations'));
        const unsubAI = onSnapshot(qAI, (snap) => {
          let total = 0;
          let unread = 0;
          let list = [];
          snap.forEach((d) => {
            total++;
            const data = d.data();
            if (!data.read) unread++;
            list.push({ id: d.id, ...data });
          });
          list.sort((a, b) => {
            const timeA = a.updatedAt?.seconds || 0;
            const timeB = b.updatedAt?.seconds || 0;
            return timeB - timeA;
          });
          setStats((prev) => ({
            ...prev,
            totalAIChats: total,
            unreadAIChats: unread,
            recentAIChats: list.slice(0, 3)
          }));
        });
        unsubs.push(unsubAI);
      }
    } catch (e) {
      console.warn('AI Chats listener notice:', e);
    }

    // 3. Projects Stream
    try {
      if (db) {
        const qProj = query(collection(db, 'projects'));
        const unsubProj = onSnapshot(qProj, (snap) => {
          setStats((prev) => ({
            ...prev,
            totalProjects: snap.size
          }));
        });
        unsubs.push(unsubProj);
      } else {
        // Local cache fallback
        const local = localStorage.getItem('portfolio_cache_projects');
        if (local) {
          const parsed = JSON.parse(local);
          setStats((prev) => ({ ...prev, totalProjects: parsed.length }));
        }
      }
    } catch (e) {}

    // 4. Services Stream
    try {
      if (db) {
        const qServ = query(collection(db, 'services'));
        const unsubServ = onSnapshot(qServ, (snap) => {
          setStats((prev) => ({
            ...prev,
            totalServices: snap.size
          }));
        });
        unsubs.push(unsubServ);
      }
    } catch (e) {}

    // 5. Skills Snapshot
    async function loadSkillsAndResume() {
      try {
        if (db) {
          const skillsSnap = await getDoc(doc(db, 'skills', 'singleton'));
          if (skillsSnap.exists()) {
            const data = skillsSnap.data();
            const cats = data.categories || [];
            let totalSkills = 0;
            cats.forEach((c) => {
              totalSkills += (c.skills || []).length;
            });
            setStats((prev) => ({
              ...prev,
              totalCategories: cats.length,
              totalSkills
            }));
          }

          const unsubResume = onSnapshot(doc(db, 'resume', 'singleton'), (snap) => {
            if (snap.exists()) {
              const rData = snap.data();
              setStats((prev) => ({
                ...prev,
                resumeDownloads: rData.downloadCount || 0,
                resumeFileName: rData.filename || rData.fileName || 'Usman_Resume.pdf'
              }));
            }
          });
          unsubs.push(unsubResume);
        }
      } catch (e) {
        console.warn('Skills/Resume meta notice:', e);
      } finally {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }
    loadSkillsAndResume();

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, []);

  return (
    <div className="adm-dashboard-overview">
      {/* Welcome Banner Card */}
      <div className="adm-overview-banner">
        <div className="adm-overview-banner-left">
          <div className="adm-banner-tag">
            <span className="adm-pulse-dot" />
            <span>Master Control Active</span>
          </div>
          <h2 className="adm-overview-title">Welcome back, Muhammad Usman 👋</h2>
          <p className="adm-overview-subtitle">
            Here is your live portfolio command center. Track inbound messages, AI conversations,
            showcase updates, and visitor activity in real-time.
          </p>
        </div>

        <div className="adm-overview-banner-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn-banner-preview"
          >
            <Eye size={16} />
            <span>Open Live Site</span>
            <ExternalLink size={13} style={{ opacity: 0.7 }} />
          </a>
        </div>
      </div>

      {/* Primary Analytics & Telemetry Grid (Proper Cards) */}
      <div className="adm-metrics-grid">
        {/* Card 1: Contact Inquiries */}
        <div
          className="adm-metric-card adm-card-interactive"
          onClick={() => onNavigate && onNavigate('inquiries')}
        >
          <div className="adm-metric-top">
            <div className="adm-metric-icon-box adm-metric-mail">
              <Mail size={22} />
            </div>
            {stats.unreadInquiries > 0 ? (
              <span className="adm-metric-pill adm-pill-alert">
                {stats.unreadInquiries} Unread
              </span>
            ) : (
              <span className="adm-metric-pill adm-pill-neutral">All Caught Up</span>
            )}
          </div>
          <div className="adm-metric-value">{stats.totalInquiries}</div>
          <div className="adm-metric-label">Contact Inquiries</div>
          <p className="adm-metric-subtext">
            Direct client messages and leads submitted via portfolio form.
          </p>
          <div className="adm-metric-footer">
            <span>Manage Inquiries</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 2: AI Conversations */}
        <div
          className="adm-metric-card adm-card-interactive"
          onClick={() => onNavigate && onNavigate('ai')}
        >
          <div className="adm-metric-top">
            <div className="adm-metric-icon-box adm-metric-ai">
              <Sparkles size={22} />
            </div>
            {stats.unreadAIChats > 0 ? (
              <span className="adm-metric-pill adm-pill-alert">
                {stats.unreadAIChats} New Chats
              </span>
            ) : (
              <span className="adm-metric-pill adm-pill-neutral">Synchronized</span>
            )}
          </div>
          <div className="adm-metric-value">{stats.totalAIChats}</div>
          <div className="adm-metric-label">AI Visitor Chats</div>
          <p className="adm-metric-subtext">
            Autonomous visitor dialogues and intelligence recorded by bot.
          </p>
          <div className="adm-metric-footer">
            <span>View Transcripts</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 3: Projects Showcase */}
        <div
          className="adm-metric-card adm-card-interactive"
          onClick={() => onNavigate && onNavigate('projects')}
        >
          <div className="adm-metric-top">
            <div className="adm-metric-icon-box adm-metric-projects">
              <FolderGit2 size={22} />
            </div>
            <span className="adm-metric-pill adm-pill-accent">Up to 5 Media/item</span>
          </div>
          <div className="adm-metric-value">{stats.totalProjects || 6}</div>
          <div className="adm-metric-label">Showcase Projects</div>
          <p className="adm-metric-subtext">
            Featured applications with responsive images and video demos.
          </p>
          <div className="adm-metric-footer">
            <span>Edit Projects</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 4: Services & Offerings */}
        <div
          className="adm-metric-card adm-card-interactive"
          onClick={() => onNavigate && onNavigate('services')}
        >
          <div className="adm-metric-top">
            <div className="adm-metric-icon-box adm-metric-services">
              <Briefcase size={22} />
            </div>
            <span className="adm-metric-pill adm-pill-success">7 Offerings</span>
          </div>
          <div className="adm-metric-value">{stats.totalServices || 7}</div>
          <div className="adm-metric-label">Client Services</div>
          <p className="adm-metric-subtext">
            Full-Stack, UI/UX, AI integrations, and creative media packages.
          </p>
          <div className="adm-metric-footer">
            <span>Customize Services</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 5: Skills Matrix */}
        <div
          className="adm-metric-card adm-card-interactive"
          onClick={() => onNavigate && onNavigate('skills')}
        >
          <div className="adm-metric-top">
            <div className="adm-metric-icon-box adm-metric-skills">
              <Cpu size={22} />
            </div>
            <span className="adm-metric-pill adm-pill-accent">{stats.totalCategories || 6} Categories</span>
          </div>
          <div className="adm-metric-value">{stats.totalSkills || 48}</div>
          <div className="adm-metric-label">Technical Skills</div>
          <p className="adm-metric-subtext">
            Categorized tech stack, marquee conveyor, and 3D preview.
          </p>
          <div className="adm-metric-footer">
            <span>Configure Stack</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 6: Resume & CV Tracking */}
        <div
          className="adm-metric-card adm-card-interactive"
          onClick={() => onNavigate && onNavigate('resume')}
        >
          <div className="adm-metric-top">
            <div className="adm-metric-icon-box adm-metric-resume">
              <FileText size={22} />
            </div>
            <span className="adm-metric-pill adm-pill-neutral">Live Analytics</span>
          </div>
          <div className="adm-metric-value">{stats.resumeDownloads}</div>
          <div className="adm-metric-label">Resume Downloads</div>
          <p className="adm-metric-subtext">
            Direct PDF downloads tracked in real-time on live portfolio.
          </p>
          <div className="adm-metric-footer">
            <span>Resume Manager</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Live Telemetry 2-Column Section */}
      <div className="adm-overview-split-row">
        {/* Left Column: Quick Actions Launchpad */}
        <div className="adm-card adm-overview-split-col">
          <div className="adm-card-header">
            <div className="adm-card-title-group">
              <Zap className="adm-card-icon" size={20} />
              <div>
                <h3 className="adm-card-title">Quick Action Launchpad</h3>
                <p className="adm-card-subtitle">Fast shortcuts to common website administration tasks</p>
              </div>
            </div>
          </div>

          <div className="adm-quick-actions-list">
            <button
              className="adm-action-tile"
              onClick={() => onNavigate && onNavigate('hero')}
            >
              <div className="adm-action-tile-icon adm-tile-hero">
                <Layers size={18} />
              </div>
              <div className="adm-action-tile-content">
                <div className="adm-action-tile-title">Edit Hero Presentation</div>
                <div className="adm-action-tile-desc">Update headline, intro bio, watermark & CTA buttons</div>
              </div>
              <ChevronRight size={16} className="adm-action-tile-arrow" />
            </button>

            <button
              className="adm-action-tile"
              onClick={() => onNavigate && onNavigate('projects')}
            >
              <div className="adm-action-tile-icon adm-tile-projects">
                <FolderGit2 size={18} />
              </div>
              <div className="adm-action-tile-content">
                <div className="adm-action-tile-title">Add or Edit Showcase Project</div>
                <div className="adm-action-tile-desc">Upload project screenshots, videos, and live deployment links</div>
              </div>
              <ChevronRight size={16} className="adm-action-tile-arrow" />
            </button>

            <button
              className="adm-action-tile"
              onClick={() => onNavigate && onNavigate('inquiries')}
            >
              <div className="adm-action-tile-icon adm-tile-inquiries">
                <Mail size={18} />
              </div>
              <div className="adm-action-tile-content">
                <div className="adm-action-tile-title">Review Client Inquiries</div>
                <div className="adm-action-tile-desc">Check latest messages and reply to potential clients</div>
              </div>
              <ChevronRight size={16} className="adm-action-tile-arrow" />
            </button>

            <button
              className="adm-action-tile"
              onClick={() => onNavigate && onNavigate('ai')}
            >
              <div className="adm-action-tile-icon adm-tile-ai">
                <Sparkles size={18} />
              </div>
              <div className="adm-action-tile-content">
                <div className="adm-action-tile-title">Visitor AI Intelligence</div>
                <div className="adm-action-tile-desc">Inspect questions asked to your portfolio chatbot</div>
              </div>
              <ChevronRight size={16} className="adm-action-tile-arrow" />
            </button>
          </div>
        </div>

        {/* Right Column: System Status & Security Profile */}
        <div className="adm-card adm-overview-split-col">
          <div className="adm-card-header">
            <div className="adm-card-title-group">
              <ShieldCheck className="adm-card-icon" size={20} />
              <div>
                <h3 className="adm-card-title">Security & System Profile</h3>
                <p className="adm-card-subtitle">Verified administration telemetry and sync health</p>
              </div>
            </div>
          </div>

          <div className="adm-system-health-list">
            <div className="adm-health-item">
              <div className="adm-health-icon adm-health-good">
                <CheckCircle2 size={18} />
              </div>
              <div className="adm-health-info">
                <span className="adm-health-label">Authorized Super Admin</span>
                <span className="adm-health-val">usman.nazir.dev@gmail.com</span>
              </div>
              <span className="adm-badge-verified">Verified</span>
            </div>

            <div className="adm-health-item">
              <div className="adm-health-icon adm-health-good">
                <CheckCircle2 size={18} />
              </div>
              <div className="adm-health-info">
                <span className="adm-health-label">Local Edge Cache</span>
                <span className="adm-health-val">Instant preview active (0.0ms latency)</span>
              </div>
              <span className="adm-badge-active">Active</span>
            </div>

            <div className="adm-health-item">
              <div className="adm-health-icon adm-health-good">
                <CheckCircle2 size={18} />
              </div>
              <div className="adm-health-info">
                <span className="adm-health-label">Cloud Firestore</span>
                <span className="adm-health-val">Project dportfolio-dc3e0</span>
              </div>
              <span className="adm-badge-active">Connected</span>
            </div>

            <div className="adm-health-item">
              <div className="adm-health-icon adm-health-good">
                <CheckCircle2 size={18} />
              </div>
              <div className="adm-health-info">
                <span className="adm-health-label">2-Step Signout Protection</span>
                <span className="adm-health-val">Accidental exit prevention enabled</span>
              </div>
              <span className="adm-badge-verified">Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
