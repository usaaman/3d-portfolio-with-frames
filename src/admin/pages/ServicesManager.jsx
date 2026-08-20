import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Cpu,
  Layers,
  Sparkles,
  Award,
  Video,
  Monitor,
  Flame,
  Globe,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Select from '../shared/Select';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import Badge from '../shared/Badge';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import './ServicesManager.css';

const DEFAULT_SERVICES = [
  { id: 'svc-1', title: 'AI Agents', description: 'Autonomous AI agents that execute complex workflows, search live data, make decisions, and automate repetitive tasks independently.', icon: 'Sparkles', order: 1, visible: true, featured: true },
  { id: 'svc-2', title: 'AI Integration', description: 'Embedding state-of-the-art LLMs, fine-tuned models, and RAG pipelines directly into your existing web, mobile, or backend apps.', icon: 'Cpu', order: 2, visible: true, featured: true },
  { id: 'svc-3', title: 'Chat Bots', description: 'Intelligent, context-aware conversational bots trained on your business documents for instant customer support and lead capture.', icon: 'Sparkles', order: 3, visible: true, featured: true },
  { id: 'svc-4', title: 'Full Stack Development', description: 'Scalable end-to-end web applications built with high performance, robust backend architecture, secure user auth, and sleek modern UI.', icon: 'Layers', order: 4, visible: true, featured: true },
  { id: 'svc-5', title: 'Landing Pages / Front End', description: 'Ultra-fast, high-converting landing pages with pixel-perfect responsive design, striking modern typography, and fluid micro-animations.', icon: 'Monitor', order: 5, visible: true, featured: true },
  { id: 'svc-6', title: 'Admin Panels', description: 'Custom management dashboards, real-time data analytics portals, and CMS solutions tailored specifically for business operations.', icon: 'Layers', order: 6, visible: true, featured: true },
  { id: 'svc-7', title: 'Video Editing & Graphic Design', description: 'Professional video editing for promotional ads, high-engagement reels, visual branding, UI/UX wireframes, and creative marketing assets.', icon: 'Video', order: 7, visible: true, featured: true },
];

const ICON_MAP = {
  Cpu: Cpu,
  Layers: Layers,
  Sparkles: Sparkles,
  Award: Award,
  Video: Video,
  Monitor: Monitor,
};

const ICON_OPTIONS = Object.keys(ICON_MAP).map((k) => ({
  value: k,
  label: `${k} Icon`,
}));

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Cpu',
    order: 1,
    visible: true,
    featured: false,
  });

  const [initialFormData, setInitialFormData] = useState({
    title: '',
    description: '',
    icon: 'Cpu',
    order: 1,
    visible: true,
    featured: false,
  });

  useEffect(() => {
    const dirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setIsDirty(dirty);
  }, [formData, initialFormData]);

  // Prompt before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && formOpen) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in the service form. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, formOpen]);

  // Delete Dialog states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadServices = async () => {
    setLoading(true);
    try {
      if (db) {
        const q = query(collection(db, 'services'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        if (list.length === 0) {
          setServices([...DEFAULT_SERVICES]);
        } else {
          setServices(list);
        }
      } else {
        setServices([...DEFAULT_SERVICES]);
      }
    } catch (e) {
      console.warn('Failed loading services from Firestore:', e);
      setServices([...DEFAULT_SERVICES]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    let result = services.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => a.order - b.order);
    return result;
  }, [services, search]);

  const openAdd = () => {
    setEditMode(false);
    const initial = {
      title: '',
      description: '',
      icon: 'Cpu',
      order: services.length + 1,
      visible: true,
      featured: false,
    };
    setFormData(initial);
    setInitialFormData(initial);
    setFormOpen(true);
  };

  const openEdit = (service) => {
    setEditMode(true);
    setActiveServiceId(service.id);
    const initial = {
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || 'Cpu',
      order: service.order || 1,
      visible: service.visible !== undefined ? service.visible : true,
      featured: !!service.featured,
    };
    setFormData(initial);
    setInitialFormData(initial);
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    const docId = editMode ? activeServiceId : `svc-${Date.now()}`;
    const payload = {
      ...formData,
      order: Number(formData.order),
    };

    try {
      if (db) {
        await setDoc(doc(db, 'services', docId), payload);
      }
      
      // Update local state list
      if (editMode) {
        setServices((prev) =>
          prev.map((s) => (s.id === activeServiceId ? { ...s, ...payload } : s))
        );
      } else {
        setServices((prev) => [
          ...prev,
          {
            id: docId,
            ...payload,
          },
        ]);
      }
      setInitialFormData({ ...formData });
      setIsDirty(false);
      setSaveStatus('success');
      setFormOpen(false);
    } catch (err) {
      console.error('Error writing service:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const triggerDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (db) {
        await deleteDoc(doc(db, 'services', deleteTargetId));
      }
      setServices((prev) => prev.filter((s) => s.id !== deleteTargetId));
    } catch (err) {
      console.error('Error deleting service:', err);
    }
    setDeleteOpen(false);
    setDeleteTargetId(null);
  };

  return (
    <div className="services-manager-container">
      <PageHeader
        title="Services Manager"
        description="Deploy and modify your specialized service offerings. These populate the interactive core capability orbits."
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add New Service
          </Button>
        }
      />

      {saveStatus === 'success' && (
        <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
          ✓ Services updated successfully.
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
          ✕ Error updating service.
        </div>
      )}

      {/* Search Header toolbar */}
      <div className="services-toolbar-card">
        <div className="toolbar-search-input">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search service title/description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid listing */}
      <SectionCard title="Active Offerings" description="Service modules configured in current layout.">
        {loading ? (
          <div className="services-empty-grid">
            <Globe size={24} />
            <span>Loading services cache...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="services-empty-grid">
            <Globe size={24} />
            <span>No service cards found matching current criteria.</span>
          </div>
        ) : (
          <div className="services-grid-list">
            {filteredServices.map((service) => {
              const IconComp = ICON_MAP[service.icon] || Cpu;
              return (
                <div key={service.id} className="service-admin-card">
                  <div className="service-card-top">
                    <div className="service-icon-box">
                      <IconComp size={20} />
                    </div>

                    <div className="card-top-badges">
                      {service.featured && (
                        <Badge variant="primary" className="featured-dot-badge">
                          <Flame size={10} className="mr-1" /> Featured
                        </Badge>
                      )}
                      <Badge variant={service.visible ? 'success' : 'default'}>
                        {service.visible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                  </div>

                  <div className="service-card-mid">
                    <h3 className="service-card-title">{service.title}</h3>
                    <p className="service-card-desc">{service.description}</p>
                  </div>

                  <div className="service-card-footer">
                    <span className="service-order-indicator">Order: {service.order}</span>
                    <div className="service-card-actions">
                      <button
                        type="button"
                        className="service-action-btn"
                        onClick={() => openEdit(service)}
                        title="Edit Details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        className="service-action-btn btn-trash"
                        onClick={() => triggerDelete(service.id)}
                        title="Delete Service"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* -------------------------------------------------------------
          ADD / EDIT MODAL
          ------------------------------------------------------------- */}
      <Modal
        isOpen={formOpen}
        onClose={() => {
          if (isDirty) {
            if (window.confirm('You have unsaved changes. Discard them?')) {
              setFormOpen(false);
            }
          } else {
            setFormOpen(false);
          }
        }}
        title={editMode ? 'Edit Service Capability' : 'Create New Service'}
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              if (window.confirm('Reset all form fields to last saved state?')) {
                setFormData({ ...initialFormData });
              }
            }} disabled={!isDirty || isSaving}>
              Reset
            </Button>
            <Button variant="ghost" onClick={() => {
              if (isDirty) {
                if (window.confirm('Discard unsaved changes?')) {
                  setFormOpen(false);
                }
              } else {
                setFormOpen(false);
              }
            }} disabled={isSaving} style={{ color: '#f87171' }}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} isLoading={isSaving}>
              {editMode ? 'Save Changes' : 'Create Service'}
            </Button>
          </>
        }
      >
        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '8px 12px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
            ⚠️ Unsaved changes detected. Click Save Changes to update.
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="services-modal-form">
          <Input
            id="title"
            label="Service Title"
            value={formData.title}
            onChange={handleFormChange}
            autoFocus
          />

          <Textarea
            id="description"
            label="Service Description Paragraph"
            value={formData.description}
            onChange={handleFormChange}
          />

          <div className="form-row-2">
            <Select
              id="icon"
              label="Interactive Display Icon"
              value={formData.icon}
              onChange={handleFormChange}
              options={ICON_OPTIONS}
            />

            <Input
              id="order"
              label="Sort Position (Order)"
              type="number"
              value={formData.order}
              onChange={handleFormChange}
            />
          </div>

          <div className="services-toggles-row">
            <label className={`toggle-card-option ${formData.visible ? 'is-active' : ''}`}>
              <Globe size={18} className={formData.visible ? 'toggle-icon-active' : 'toggle-icon-inactive'} />
              <div className="toggle-card-info">
                <span className="toggle-card-title">Publish to Live Site</span>
                <span className="toggle-card-sub">Show this capability on 3D portfolio ring</span>
              </div>
              <input
                id="visible"
                type="checkbox"
                checked={formData.visible}
                onChange={handleFormChange}
                className="toggle-card-checkbox"
              />
            </label>

            <label className={`toggle-card-option ${formData.featured ? 'is-active' : ''}`}>
              <Sparkles size={18} className={formData.featured ? 'toggle-icon-active-amber' : 'toggle-icon-inactive'} />
              <div className="toggle-card-info">
                <span className="toggle-card-title">Featured Capability</span>
                <span className="toggle-card-sub">Highlight with featured badge</span>
              </div>
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleFormChange}
                className="toggle-card-checkbox"
              />
            </label>
          </div>
        </form>
      </Modal>

      {/* Confirmation Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Service Capability?"
        message="This action will permanently delete this service capability listing from the orbit rendering grids."
      />
    </div>
  );
}
