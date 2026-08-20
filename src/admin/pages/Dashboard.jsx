import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  BrainCircuit,
  Award,
  Briefcase,
  Grid,
  Plus,
  Image,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import SectionCard from '../components/SectionCard';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    projectsCount: 0,
    servicesCount: 0,
    unreadMessages: 0,
    totalMessages: 0,
    aiConversationsCount: 0,
    loading: true,
  });

  const [dbStatus, setDbStatus] = useState('OFFLINE');
  const [storageStatus, setStorageStatus] = useState('LOCAL ONLY');

  useEffect(() => {
    async function loadDashboardData() {
      if (!db) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      setDbStatus('LIVE FIRESTORE');
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      if (cloudName && cloudName !== 'undefined') {
        setStorageStatus('CLOUDINARY');
      }

      try {
        // Fetch projects count
        const projSnap = await getDocs(collection(db, 'projects'));
        const projectsCount = projSnap.size;



        // Fetch services count
        const svcsSnap = await getDocs(collection(db, 'services'));
        const servicesCount = svcsSnap.size;

        // Fetch contact messages count & unread messages
        const msgSnap = await getDocs(collection(db, 'contactMessages'));
        const totalMessages = msgSnap.size;
        let unreadMessages = 0;
        msgSnap.forEach(d => {
          if (d.data().read === false) unreadMessages++;
        });

        // Fetch AI conversations count
        const aiSnap = await getDocs(collection(db, 'chatConversations'));
        const aiConversationsCount = aiSnap.size;

        setStats({
          projectsCount,
          servicesCount,
          unreadMessages,
          totalMessages,
          aiConversationsCount,
          loading: false,
        });
      } catch (err) {
        console.warn("Error loading dashboard metrics:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <PageHeader
        title="Admin Dashboard"
        description="Manage your professional developer catalog, resume configs, media assets, and AI services."
      />

      {/* Stats Cards */}
      <div className="dashboard-stats-grid">
        <StatCard
          icon={Briefcase}
          title="Projects"
          value={stats.loading ? "..." : String(stats.projectsCount)}
          comparisonBadgeText="Portfolio"
          comparisonType="default"
          comparisonLabel="published listings"
          onClick={() => navigate('/admin/projects')}
        />

        <StatCard
          icon={Grid}
          title="Services"
          value={stats.loading ? "..." : String(stats.servicesCount)}
          comparisonBadgeText="Offerings"
          comparisonType="default"
          comparisonLabel="services provided"
          onClick={() => navigate('/admin/services')}
        />
        <StatCard
          icon={Mail}
          title="Inbox Messages"
          value={stats.loading ? "..." : String(stats.totalMessages)}
          comparisonBadgeText={stats.unreadMessages > 0 ? `${stats.unreadMessages} New` : "Clean"}
          comparisonType={stats.unreadMessages > 0 ? "warning" : "success"}
          comparisonLabel="contact submissions"
          onClick={() => navigate('/admin/messages')}
        />
        <StatCard
          icon={BrainCircuit}
          title="AI Assistant Chats"
          value={stats.loading ? "..." : String(stats.aiConversationsCount)}
          comparisonBadgeText="AI Hub"
          comparisonType="success"
          comparisonLabel="visitor sessions"
          onClick={() => navigate('/admin/ai-conversations')}
        />
      </div>

      <div className="dashboard-details-grid" style={{ marginTop: '24px' }}>
        {/* Quick Operations panel */}
        <SectionCard title="Quick Operations" description="Immediate shortcuts for daily updates.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            <Button onClick={() => navigate('/admin/projects')}>
              <Plus size={16} /> Add Project
            </Button>

            <Button variant="ghost" onClick={() => navigate('/admin/media')}>
              <Image size={16} /> Media Library
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/ai-settings')}>
              <Sliders size={16} /> AI Settings
            </Button>
          </div>
        </SectionCard>

        {/* Diagnostic Panel */}
        <SectionCard
          title="System Diagnostics"
          description="Operational statuses of database, storage, and platform layers."
        >
          <div className="diagnostics-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="diagnostic-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--ds-glass-border)', paddingBottom: '8px' }}>
              <span className="diagnostic-label" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)' }}>Public Portfolio Build</span>
              <span className="diagnostic-val badge-diagnostic success" style={{ fontSize: '11px', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--ds-font-mono)' }}>PROD OK</span>
            </div>
            <div className="diagnostic-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--ds-glass-border)', paddingBottom: '8px' }}>
              <span className="diagnostic-label" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)' }}>Database Connection</span>
              <span className="diagnostic-val text-white" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'var(--ds-font-mono)' }}>{dbStatus}</span>
            </div>
            <div className="diagnostic-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--ds-glass-border)', paddingBottom: '8px' }}>
              <span className="diagnostic-label" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)' }}>Cloud Asset Storage</span>
              <span className="diagnostic-val text-white" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'var(--ds-font-mono)' }}>{storageStatus}</span>
            </div>
            <div className="diagnostic-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="diagnostic-label" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)' }}>Platform Health Status</span>
              <span className="diagnostic-val text-white" style={{ fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} color="#34d399" /> Operational
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
