import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, UserCheck, Plus, Trash2, Check, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function AboutManager({ initialData, onSaved }) {
  const [formData, setFormData] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_cache_about');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      title: 'Curious mind, creative hands',
      paragraph1: "I'm Muhammad Usman, a Software Engineering student at Capital University of Science & Technology, Islamabad, currently in my 6th semester. I work across full-stack development, AI integration, cybersecurity, and video editing, with a focus on building things that solve real problems rather than just looking good in a demo.",
      paragraph2: 'My journey started with video editing and visual storytelling, which taught me how much small details can change the way people experience something. That creative side eventually led me into software development, where I found the same satisfaction in building interactive interfaces, backend systems, automation tools, and AI-powered applications. Today, I enjoy working at the intersection of technology and creativity, learning new tools through real projects and turning ideas into working products.',
      quoteText: 'I love solving real-world problems — whether that\'s through clean code or a well-cut video.',
      glanceItems: [
        { label: 'Development', value: 'Full-Stack Web Apps', subValue: '' },
        { label: 'AI Focus', value: 'AI Agents & Automation', subValue: '' },
        { label: 'Creative', value: 'Video Editing & Design', subValue: '' },
        { label: 'Approach', value: 'Build • Learn • Improve', subValue: '' },
      ],
      timelineItems: [
        { id: 1, type: 'education', date: '2023 - Present', title: 'BS Software Engineering', institution: 'Capital University of Science and Technology (CUST)' },
        { id: 2, type: 'experience', date: '2024 - Present', title: 'Full Stack Web Freelancer', institution: 'Remote / Client Services' },
        { id: 3, type: 'experience', date: '2022 - present', title: 'Lead CapCut Video Editor', institution: 'Creative Studio' },
        { id: 4, type: 'experience', date: '2026 – Present', title: 'Cybersecurity Intern', institution: 'AstraQuantum Tech' },
        { id: 5, type: 'education', date: '2026', title: 'Software Engineering & AI Development', institution: 'Organization' },
      ],
      imageUrl: '/frames/frame-081.webp',
      ...initialData
    };
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'glance' | 'timeline', index: number, title: string }

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      return;
    }
    async function loadAbout() {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, 'about', 'singleton'));
        if (snap.exists()) {
          const cloudData = snap.data();
          setFormData(prev => ({ ...prev, ...cloudData }));
          try {
            localStorage.setItem('portfolio_cache_about', JSON.stringify(cloudData));
          } catch {}
        }
      } catch (err) {
        console.warn('Could not fetch about from firestore:', err);
      }
    }
    loadAbout();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Glance items helpers
  const handleGlanceChange = (index, field, value) => {
    const updated = [...(formData.glanceItems || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, glanceItems: updated }));
  };

  const addGlanceItem = () => {
    setFormData(prev => ({
      ...prev,
      glanceItems: [...(prev.glanceItems || []), { label: 'New Metric', value: 'Specialization', subValue: '' }]
    }));
  };

  const confirmDeleteAction = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'glance') {
      setFormData(prev => ({
        ...prev,
        glanceItems: prev.glanceItems.filter((_, i) => i !== deleteTarget.index)
      }));
    } else if (deleteTarget.type === 'timeline') {
      setFormData(prev => ({
        ...prev,
        timelineItems: prev.timelineItems.filter((_, i) => i !== deleteTarget.index)
      }));
    }
    setDeleteTarget(null);
  };

  // Timeline items helpers
  const handleTimelineChange = (index, field, value) => {
    const updated = [...(formData.timelineItems || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, timelineItems: updated }));
  };

  const addTimelineItem = () => {
    setFormData(prev => ({
      ...prev,
      timelineItems: [
        ...(prev.timelineItems || []),
        { id: Date.now(), type: 'experience', date: '2026 - Present', title: 'New Role / Degree', institution: 'Organization' }
      ]
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // 1. Cache locally so changes reflect immediately across tabs & components
    try {
      localStorage.setItem('portfolio_cache_about', JSON.stringify(formData));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'portfolio_cache_about',
        newValue: JSON.stringify(formData)
      }));
    } catch {}

    // 2. Sync to Cloud Firestore
    try {
      if (db) {
        await setDoc(doc(db, 'about', 'singleton'), formData, { merge: true });
      }
      setFeedback({ type: 'success', message: 'About Section updated live on Cloud Firestore & Portfolio!' });
      if (onSaved) onSaved(formData);
    } catch (err) {
      console.warn('Firebase error saving about:', err);
      if (err.code === 'permission-denied' || err.message?.includes('insufficient permissions')) {
        setFeedback({
          type: 'error',
          message: 'Saved to your portfolio view! Note: Cloud Firestore write was blocked by Firebase Rules (Permission Denied).'
        });
      } else {
        setFeedback({ type: 'error', message: 'Failed to sync with Firebase: ' + err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSave}>
        {feedback && (
          <div className={`adm-toast-banner ${feedback.type === 'success' ? 'adm-toast-success' : 'adm-toast-error'}`}>
            {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Main Narrative Card */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title-group">
              <UserCheck className="adm-card-icon" size={22} />
              <div>
                <h3 className="adm-card-title">About Narrative & Story</h3>
                <p className="adm-card-subtitle">Manage the personal introduction paragraphs and philosophy quote.</p>
              </div>
            </div>
            <button type="submit" className="adm-btn-save-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save About Changes'}</span>
            </button>
          </div>

          <div className="adm-form-grid">
            <div className="adm-field adm-form-grid-full">
              <label className="adm-label">Section Heading / Headline</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="adm-input"
                placeholder="Curious mind, creative hands"
              />
            </div>

            <div className="adm-field adm-form-grid-full">
              <label className="adm-label">Paragraph 1 (Introduction)</label>
              <textarea
                name="paragraph1"
                value={formData.paragraph1 || ''}
                onChange={handleChange}
                className="adm-textarea"
                rows={3}
              />
            </div>

            <div className="adm-field adm-form-grid-full">
              <label className="adm-label">Paragraph 2 (Journey & Focus)</label>
              <textarea
                name="paragraph2"
                value={formData.paragraph2 || ''}
                onChange={handleChange}
                className="adm-textarea"
                rows={3}
              />
            </div>

            <div className="adm-field adm-form-grid-full">
              <label className="adm-label">Highlight Quote</label>
              <input
                type="text"
                name="quoteText"
                value={formData.quoteText || ''}
                onChange={handleChange}
                className="adm-input"
                placeholder="I love solving real-world problems..."
              />
            </div>
          </div>
        </div>

        {/* At A Glance Quick Cards */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title-group">
              <Sparkles className="adm-card-icon" size={22} />
              <div>
                <h3 className="adm-card-title">
                  At-A-Glance Metric Badges ({formData.glanceItems?.length || 0})
                </h3>
                <p className="adm-card-subtitle">
                  Dynamic stat cards displayed in the About right-hand panel. Add as many cards as needed!
                </p>
              </div>
            </div>
            <button type="button" onClick={addGlanceItem} className="adm-btn-secondary-sm">
              <Plus size={15} />
              <span>Add Badge</span>
            </button>
          </div>

          <div className="adm-form-grid">
            {(formData.glanceItems || []).map((item, idx) => (
              <div key={idx} className="adm-item-card" style={{ marginBottom: 0 }}>
                <div className="adm-item-top">
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--adm-green-deep)' }}>
                    BADGE #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({
                      type: 'glance',
                      index: idx,
                      title: item.label || `Badge #${idx + 1}`
                    })}
                    className="adm-btn-danger-sm"
                    style={{ padding: '3px 8px' }}
                    title="Delete badge"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="adm-field">
                  <label className="adm-label" style={{ fontSize: '11px' }}>Label / Category</label>
                  <input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => handleGlanceChange(idx, 'label', e.target.value)}
                    className="adm-input"
                    placeholder="e.g. Development, Creative, AI Focus"
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label" style={{ fontSize: '11px' }}>Primary Value</label>
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) => handleGlanceChange(idx, 'value', e.target.value)}
                    className="adm-input"
                    placeholder="e.g. Full-Stack Web Apps"
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label" style={{ fontSize: '11px' }}>Sub-Value / Detail (Optional)</label>
                  <input
                    type="text"
                    value={item.subValue || ''}
                    onChange={(e) => handleGlanceChange(idx, 'subValue', e.target.value)}
                    className="adm-input"
                    placeholder="e.g. React & Node.js"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title-group">
              <Calendar className="adm-card-icon" size={22} />
              <div>
                <h3 className="adm-card-title">
                  Education & Experience Timeline ({formData.timelineItems?.length || 0})
                </h3>
                <p className="adm-card-subtitle">
                  Compact milestone cards displayed in the bottom experience strip of the About section.
                </p>
              </div>
            </div>
            <button type="button" onClick={addTimelineItem} className="adm-btn-secondary-sm">
              <Plus size={15} />
              <span>Add Timeline Entry</span>
            </button>
          </div>

          <div>
            {(formData.timelineItems || []).map((item, idx) => (
              <div key={idx} className="adm-item-card">
                <div className="adm-item-top">
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--adm-green-deep)' }}>
                    ENTRY #{idx + 1} &bull; {item.type ? item.type.toUpperCase() : 'EXPERIENCE'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({
                      type: 'timeline',
                      index: idx,
                      title: item.title || `Entry #${idx + 1}`
                    })}
                    className="adm-btn-danger-sm"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label className="adm-label">Type</label>
                    <select
                      value={item.type || 'experience'}
                      onChange={(e) => handleTimelineChange(idx, 'type', e.target.value)}
                      className="adm-select"
                    >
                      <option value="education">Education</option>
                      <option value="experience">Experience / Freelance</option>
                    </select>
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Date Range / Duration</label>
                    <input
                      type="text"
                      value={item.date || ''}
                      onChange={(e) => handleTimelineChange(idx, 'date', e.target.value)}
                      className="adm-input"
                      placeholder="2023 - Present"
                    />
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Role / Degree Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleTimelineChange(idx, 'title', e.target.value)}
                      className="adm-input"
                      placeholder="BS Software Engineering"
                    />
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Institution / Organization</label>
                    <input
                      type="text"
                      value={item.institution || ''}
                      onChange={(e) => handleTimelineChange(idx, 'institution', e.target.value)}
                      className="adm-input"
                      placeholder="CUST University"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="adm-btn-save-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 2-Step Confirmation Modal for Destructive Deletions */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'glance' ? 'Delete At-A-Glance Badge' : 'Delete Timeline Entry'}
        message={
          <span>
            Are you sure you want to remove <strong>"{deleteTarget?.title}"</strong>? This will remove it from the About section upon saving.
          </span>
        }
        confirmText="Yes, Remove"
        cancelText="Keep It"
        confirmVariant="danger"
        iconType="delete"
        onConfirm={confirmDeleteAction}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
