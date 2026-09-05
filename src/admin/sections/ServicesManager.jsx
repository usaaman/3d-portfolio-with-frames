import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Edit2,
  Layers,
  Image as ImageIcon,
  X,
  RotateCcw
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_SERVICES = [
  {
    id: 'svc-1',
    order: 1,
    title: 'AI Agents',
    shortName: 'AI Agents',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    iconName: 'robot',
    timeline: 'Est. 1 - 2 Weeks',
    desc: 'Autonomous AI agents that execute complex workflows, search live data, make decisions, and automate repetitive tasks independently.',
    description: 'Autonomous AI agents that execute complex workflows, search live data, make decisions, and automate repetitive tasks independently.',
    features: ['Multi-Agent Workflow Systems', 'Custom Tool & API Calling', 'Automated Memory & Context', 'Web Scraping & Task Actions'],
    tech: ['LangChain', 'CrewAI', 'Python', 'OpenAI API', 'AutoGPT', 'Pinecone'],
    visible: true,
    featured: true
  },
  {
    id: 'svc-2',
    order: 2,
    title: 'AI Integration',
    shortName: 'AI Integration',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
    iconName: 'brain',
    timeline: 'Est. 1 Week',
    desc: 'Embedding state-of-the-art LLMs, fine-tuned models, and RAG pipelines directly into your existing web, mobile, or backend apps.',
    description: 'Embedding state-of-the-art LLMs, fine-tuned models, and RAG pipelines directly into your existing web, mobile, or backend apps.',
    features: ['RAG (Retrieval Augmented Generation)', 'Custom Vector Search Embeddings', 'LLM Fine-Tuned Pipelines', 'Seamless API & Middleware Integration'],
    tech: ['Pinecone', 'OpenAI', 'Claude API', 'FastAPI', 'LlamaIndex', 'Node.js'],
    visible: true,
    featured: true
  },
  {
    id: 'svc-3',
    order: 3,
    title: 'Chat Bots',
    shortName: 'Chat Bots',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    iconName: 'comments',
    timeline: 'Est. 3 - 5 Days',
    desc: 'Intelligent, context-aware conversational bots trained on your business documents for instant customer support and lead capture.',
    description: 'Intelligent, context-aware conversational bots trained on your business documents for instant customer support and lead capture.',
    features: ['Knowledge Base Document Bots', 'Omnichannel (Web, WhatsApp, Telegram)', 'Human Agent Handoff Routing', 'Real-time Lead Capture & Analytics'],
    tech: ['Voiceflow', 'Botpress', 'Dialogflow', 'WebSockets', 'Tailwind', 'Express'],
    visible: true,
    featured: true
  },
  {
    id: 'svc-4',
    order: 4,
    title: 'Full Stack Development',
    shortName: 'Full Stack',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    iconName: 'code',
    timeline: 'Est. 2 - 3 Weeks',
    desc: 'Scalable end-to-end web applications built with high performance, robust backend architecture, secure user auth, and sleek modern UI.',
    description: 'Scalable end-to-end web applications built with high performance, robust backend architecture, secure user auth, and sleek modern UI.',
    features: ['Responsive React / Next.js Frontend', 'RESTful & GraphQL API Engines', 'Relational & NoSQL Database Design', 'Role-Based Access Control & Auth'],
    tech: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB'],
    visible: true,
    featured: true
  },
  {
    id: 'svc-5',
    order: 5,
    title: 'Landing Pages / Front End',
    shortName: 'Front End',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    iconName: 'laptop-code',
    timeline: 'Est. 3 - 5 Days',
    desc: 'Ultra-fast, high-converting landing pages with pixel-perfect responsive design, striking modern typography, and fluid micro-animations.',
    description: 'Ultra-fast, high-converting landing pages with pixel-perfect responsive design, striking modern typography, and fluid micro-animations.',
    features: ['Pixel-Perfect Mobile & Web Layouts', 'High Conversion Rate UI Architecture', '95+ Lighthouse Speed & SEO Score', 'Interactive Scroll & Hover Animations'],
    tech: ['Tailwind CSS', 'HTML5/CSS3', 'JavaScript', 'Framer Motion', 'GSAP', 'Vite'],
    visible: true,
    featured: true
  },
  {
    id: 'svc-6',
    order: 6,
    title: 'Admin Panels',
    shortName: 'Admin Panels',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
    iconName: 'chart-line',
    timeline: 'Est. 1 - 2 Weeks',
    desc: 'Custom management dashboards, real-time data analytics portals, and CMS solutions tailored specifically for business operations.',
    description: 'Custom management dashboards, real-time data analytics portals, and CMS solutions tailored specifically for business operations.',
    features: ['Interactive Real-Time Data Charts', 'Role-Based User Permissions', 'Data Filtering, Sorting & CSV Export', 'Custom Content & Database Management'],
    tech: ['React', 'Recharts', 'TailwindCSS', 'Node.js', 'Prisma', 'Supabase'],
    visible: true,
    featured: true
  },
  {
    id: 'svc-7',
    order: 7,
    title: 'Video Editing & Graphic Design',
    shortName: 'Video & Design',
    iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg',
    iconName: 'film',
    timeline: 'Est. 2 - 4 Days',
    desc: 'Professional video editing for promotional ads, high-engagement social media reels, visual branding, UI/UX wireframes, and creative marketing assets.',
    description: 'Professional video editing for promotional ads, high-engagement social media reels, visual branding, UI/UX wireframes, and creative marketing assets.',
    features: ['Viral Short Reels & Ad Campaigns', 'Brand Identity & Custom Logo Design', 'UI/UX Mobile & Web Wireframing', 'Cinematic Color Grading & Motion Titles'],
    tech: ['Premiere Pro', 'After Effects', 'Figma', 'Photoshop', 'Illustrator', 'CapCut Pro'],
    visible: true,
    featured: true
  }
];

export default function ServicesManager({ initialServices }) {
  const [services, setServices] = useState(initialServices?.length > 0 ? initialServices : DEFAULT_SERVICES);
  const [activeService, setActiveService] = useState(null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Sync with Firestore services collection
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'services'), orderBy('order', 'asc'));
      const unsub = onSnapshot(q, (snap) => {
        const list = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        if (list.length > 0) {
          setServices(list);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore services listener note:', e);
    }
  }, []);

  const openNewService = () => {
    const newId = `srv_${Date.now()}`;
    const newTemplate = {
      id: newId,
      order: services.length + 1,
      title: 'New Service Discipline',
      shortName: 'New Service',
      iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      iconName: 'sparkles',
      timeline: 'Est. 1 - 2 Weeks',
      desc: 'Clear explanation of the outcomes and client value delivered by this service.',
      features: ['Core Feature 1', 'Core Feature 2', 'Core Feature 3'],
      tech: ['React', 'Node.js', 'API']
    };
    setActiveService(newTemplate);
    setIsEditingNew(true);
  };

  const openEditService = (srv) => {
    setActiveService({
      ...srv,
      desc: srv.desc || srv.description || '',
      features: Array.isArray(srv.features) ? srv.features : (typeof srv.features === 'string' ? srv.features.split('\n') : []),
      tech: Array.isArray(srv.tech) ? srv.tech : (typeof srv.tech === 'string' ? srv.tech.split(',').map(s => s.trim()) : [])
    });
    setIsEditingNew(false);
  };

  const closeForm = () => {
    setActiveService(null);
    setIsEditingNew(false);
    setFeedback(null);
  };

  const handleFieldChange = (field, value) => {
    setActiveService(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!activeService) return;

    if (!activeService.iconUrl || !activeService.iconUrl.trim()) {
      setFeedback({ type: 'error', message: 'Required: A Center Logo / Icon URL must be provided for the service card.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const docId = activeService.id || `srv_${Date.now()}`;
    const descriptionText = activeService.desc || activeService.description || '';
    const payload = {
      ...activeService,
      id: docId,
      desc: descriptionText,
      description: descriptionText,
      features: Array.isArray(activeService.features) ? activeService.features : (activeService.features || '').split('\n').filter(Boolean),
      tech: Array.isArray(activeService.tech) ? activeService.tech : (activeService.tech || '').split(',').map(s => s.trim()).filter(Boolean),
      updatedAt: new Date().toISOString()
    };

    try {
      if (db) {
        await setDoc(doc(db, 'services', docId), payload, { merge: true });
      }
      setFeedback({ type: 'success', message: `Service "${payload.title}" saved live!` });
      setTimeout(() => closeForm(), 1200);
    } catch (err) {
      console.error('Error saving service:', err);
      setFeedback({ type: 'error', message: 'Failed to save service. ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setResetting(true);
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'services'));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'services', d.id));
        }
        for (const s of DEFAULT_SERVICES) {
          await setDoc(doc(db, 'services', s.id), s);
        }
      }
      setFeedback({ type: 'success', message: 'Restored all 7 standard service disciplines to Firestore!' });
      setIsResetConfirmOpen(false);
    } catch (err) {
      console.error('Error restoring services:', err);
      setFeedback({ type: 'error', message: 'Failed to restore default services: ' + err.message });
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteService = (id, title) => {
    setDeleteTarget({ id, title });
  };

  const executeDeleteService = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (db) {
        await deleteDoc(doc(db, 'services', deleteTarget.id));
      }
      setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
      if (activeService?.id === deleteTarget.id) closeForm();
      setFeedback({ type: 'success', message: `Service "${deleteTarget.title}" deleted successfully.` });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete service:', err);
      setFeedback({ type: 'error', message: 'Failed to delete service: ' + err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Sparkles className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Services & Offerings Manager</h3>
              <p className="adm-card-subtitle">
                Manage your 3D interactive service cards. Each card requires a center logo/icon SVG or image.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="adm-btn-secondary-sm"
              title="Reset to 7 standard services"
            >
              <RotateCcw size={14} />
              <span>Restore 7 Defaults</span>
            </button>
            <button type="button" onClick={openNewService} className="adm-btn-save-primary">
              <Plus size={16} />
              <span>Add New Service</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {activeService && (
          <div className="adm-item-card" style={{ background: '#ffffff', border: '2px solid var(--adm-amber)', padding: '24px', marginBottom: '28px' }}>
            <div className="adm-item-top">
              <strong style={{ fontSize: '18px', color: 'var(--adm-green-deep)' }}>
                {isEditingNew ? 'Add New Service Card' : `Edit: ${activeService.title}`}
              </strong>
              <button type="button" onClick={closeForm} className="adm-btn-secondary-sm">
                <X size={15} />
                <span>Cancel</span>
              </button>
            </div>

            {feedback && (
              <div className={`adm-toast-banner ${feedback.type === 'success' ? 'adm-toast-success' : 'adm-toast-error'}`}>
                {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveService} className="adm-form-grid" style={{ marginTop: '16px' }}>
              <div className="adm-field">
                <label className="adm-label">Service Title</label>
                <input
                  type="text"
                  value={activeService.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="adm-input"
                  required
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Short Name / Card Label</label>
                <input
                  type="text"
                  value={activeService.shortName || ''}
                  onChange={(e) => handleFieldChange('shortName', e.target.value)}
                  className="adm-input"
                  placeholder="e.g. AI Agents"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Display Order</label>
                <input
                  type="number"
                  value={activeService.order || 1}
                  onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 1)}
                  className="adm-input"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Estimated Timeline</label>
                <input
                  type="text"
                  value={activeService.timeline || ''}
                  onChange={(e) => handleFieldChange('timeline', e.target.value)}
                  className="adm-input"
                  placeholder="Est. 1 - 2 Weeks"
                />
              </div>

              {/* Center Logo / Icon URL (Required) */}
              <div className="adm-field adm-form-grid-full" style={{ background: 'var(--adm-surface-alt)', padding: '16px', borderRadius: '10px' }}>
                <label className="adm-label" style={{ color: 'var(--adm-green-deep)' }}>
                  Card Center Logo / Icon URL (Required)
                </label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '6px' }}>
                  <input
                    type="url"
                    value={activeService.iconUrl || ''}
                    onChange={(e) => handleFieldChange('iconUrl', e.target.value)}
                    className="adm-input"
                    placeholder="https://cdn.jsdelivr.net/... or /favicon.svg"
                    required
                  />
                  {activeService.iconUrl && (
                    <img
                      src={activeService.iconUrl}
                      alt="Logo Preview"
                      style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#051c18', padding: '6px', borderRadius: '8px', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <span className="adm-label-hint" style={{ marginTop: '6px', display: 'block' }}>
                  This logo is rendered in the center of the 3D Service card.
                </span>
              </div>

              <div className="adm-field adm-form-grid-full">
                <label className="adm-label">Service Description</label>
                <textarea
                  value={activeService.desc || ''}
                  onChange={(e) => handleFieldChange('desc', e.target.value)}
                  className="adm-textarea"
                  rows={3}
                  required
                />
              </div>

              <div className="adm-field adm-form-grid-full">
                <label className="adm-label">Key Features / Deliverables (One per line)</label>
                <textarea
                  value={Array.isArray(activeService.features) ? activeService.features.join('\n') : activeService.features || ''}
                  onChange={(e) => handleFieldChange('features', e.target.value.split('\n'))}
                  className="adm-textarea"
                  rows={3}
                />
              </div>

              <div className="adm-field adm-form-grid-full">
                <label className="adm-label">Tech Stack Tags (Comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(activeService.tech) ? activeService.tech.join(', ') : activeService.tech || ''}
                  onChange={(e) => handleFieldChange('tech', e.target.value.split(',').map(s => s.trim()))}
                  className="adm-input"
                  placeholder="Python, LangChain, OpenAI API"
                />
              </div>

              <div className="adm-form-grid-full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={closeForm} className="adm-btn-secondary-sm">Cancel</button>
                <button type="submit" className="adm-btn-save-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Service Card'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {services.map((srv, idx) => (
            <div key={srv.id || idx} className="adm-item-card">
              <div className="adm-item-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {srv.iconUrl ? (
                    <img
                      src={srv.iconUrl}
                      alt={srv.title}
                      style={{ width: '36px', height: '36px', objectFit: 'contain', background: '#051c18', padding: '6px', borderRadius: '8px' }}
                      onError={(e) => { e.target.src = '/favicon.svg'; }}
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#051c18', color: '#ffb74d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={18} />
                    </div>
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--adm-green-deep)', fontWeight: 700 }}>
                      {srv.title}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                      #{srv.order || idx + 1} &bull; {srv.timeline || 'Flexible'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => openEditService(srv)} className="adm-btn-secondary-sm" style={{ padding: '4px 8px' }}>
                    <Edit2 size={13} />
                  </button>
                  <button type="button" onClick={() => handleDeleteService(srv.id, srv.title)} className="adm-btn-danger-sm" style={{ padding: '4px 8px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--adm-text-sub)', lineHeight: 1.45 }}>
                {srv.desc || srv.description}
              </p>

              {srv.features && (
                <div style={{ fontSize: '11.5px', color: 'var(--adm-text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {(Array.isArray(srv.features) ? srv.features : (srv.features || '').split('\n')).slice(0, 2).map((feat, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: 'var(--adm-amber)' }}>✦</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '11px', color: '#1e4a40', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--adm-border)' }}>
                {Array.isArray(srv.tech) ? srv.tech.join(', ') : srv.tech || 'All frameworks'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Service Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Service Offering"
        message={
          <span>
            Are you sure you want to delete the service <strong>"{deleteTarget?.title}"</strong>? It will no longer appear in your portfolio offerings.
          </span>
        }
        confirmText="Yes, Delete Service"
        cancelText="Cancel"
        confirmVariant="danger"
        iconType="delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={executeDeleteService}
      />

      {/* Restore 7 Default Services Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Restore 7 Standard Services"
        message="Are you sure you want to restore all 7 canonical service offerings (AI Agents, AI Integration, Chat Bots, Full Stack, Landing Pages, Admin Panels, Video & Design)? This will synchronize your portfolio database with the 3D rotating showcase."
        confirmText="Yes, Restore 7 Defaults"
        cancelText="Cancel"
        confirmVariant="primary"
        iconType="warning"
        loading={resetting}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={handleRestoreDefaults}
      />
    </div>
  );
}

