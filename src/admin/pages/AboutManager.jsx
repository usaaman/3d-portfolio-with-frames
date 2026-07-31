import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, BookOpen, Briefcase, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './AboutManager.css';

const DEFAULT_ABOUT_DATA = {
  title: 'Curious mind, creative hands',
  paragraph1: "I'm Muhammad Usman, a Software Engineering student at Capital University of Science & Technology, Islamabad, currently in my 6th semester.",
  paragraph2: 'My journey started with a passion for video editing and visual storytelling, which naturally evolved into web development and AI integration. Today, I build full-stack applications with React and Firebase, experiment with AI-powered chat systems, and still keep my creative side alive through video editing and graphic design.',
  quoteText: 'I love solving real-world problems — whether that\'s through clean code or a well-cut video.',
  glanceItems: [
    { label: 'Name', value: 'M. Usman' },
    { label: 'Studies', value: 'Software Eng.' },
    { label: 'Location', value: 'Islamabad, PK' },
    { label: 'Semesters', value: '6th Semester' },
  ],
  timelineItems: [
    { id: 1, type: 'education', date: '2023 - Present', title: 'BS Software Engineering', institution: 'CUST University' },
    { id: 2, type: 'experience', date: '2025 - Present', title: 'Full Stack Web Freelancer', institution: 'Remote / Client Services' },
    { id: 3, type: 'experience', date: '2022 - 2024', title: 'Lead CapCut Video Editor', institution: 'Creative Studio' }
  ],
  imageUrl: '/frames/frame-081.webp',
};

export default function AboutManager() {
  const [formData, setFormData] = useState({ ...DEFAULT_ABOUT_DATA });
  const [initialData, setInitialData] = useState({ ...DEFAULT_ABOUT_DATA });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'about', 'singleton'));
          if (snap.exists()) {
            const data = snap.data();
            setFormData(data);
            setInitialData(data);
          }
        }
      } catch (e) {
        console.warn('Failed fetching About from Firestore:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(dirty);
  }, [formData, initialData]);

  // Unsaved changes unload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleTextChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGlanceChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.glanceItems];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, glanceItems: updated };
    });
  };

  const handleTimelineChange = (id, field, value) => {
    setFormData((prev) => {
      const updated = prev.timelineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      );
      return { ...prev, timelineItems: updated };
    });
  };

  const addTimelineItem = (type) => {
    setFormData((prev) => {
      const newItem = {
        id: Date.now(),
        type,
        date: 'Year - Year',
        title: 'New Position / Degree',
        institution: 'Company / School',
      };
      return { ...prev, timelineItems: [...prev.timelineItems, newItem] };
    });
  };

  const deleteTimelineItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.filter((item) => item.id !== id),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        await setDoc(doc(db, 'about', 'singleton'), formData);
      }
      setInitialData(formData);
      setIsDirty(false);
      setSaveStatus('success');
    } catch (e) {
      console.error('Error writing About info:', e);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields in this section to defaults? (Requires save to commit)')) {
      setFormData({ ...DEFAULT_ABOUT_DATA });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard all unsaved changes?')) {
        setFormData({ ...initialData });
      }
    }
  };

  return (
    <div className="about-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="About Section Manager"
          description="Maintain your professional biography paragraphs, custom at-a-glance stats chips, and academic/work history items."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
                <RotateCcw size={16} /> Reset
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save size={16} /> Save Changes
              </Button>
            </>
          }
        />

        {saveStatus === 'success' && (
          <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✓ About details saved successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving about details.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save Changes to update.</span>
          </div>
        )}

        <div className="about-manager-grid">
          {/* Main profile content */}
          <div className="about-manager-main">
            <SectionCard title="Copywriting & Biography Profile" description="Edit titles and paragraph scripts.">
              <Input
                id="title"
                label="Biography Section Title"
                value={formData.title}
                onChange={handleTextChange}
              />

              <Textarea
                id="paragraph1"
                label="Biography Opening Paragraph"
                value={formData.paragraph1}
                onChange={handleTextChange}
              />

              <Textarea
                id="paragraph2"
                label="Biography Supporting Paragraph"
                value={formData.paragraph2}
                onChange={handleTextChange}
              />

              <Input
                id="quoteText"
                label="Personal Quote / Highlights Banner"
                value={formData.quoteText}
                onChange={handleTextChange}
              />
            </SectionCard>

            <SectionCard title="Biography Timeline & Milestones" description="Configure education degrees and professional work milestones.">
              <div className="timeline-section-controls">
                <Button type="button" variant="ghost" size="sm" onClick={() => addTimelineItem('education')}>
                  <Plus size={14} /> Add Education
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => addTimelineItem('experience')}>
                  <Plus size={14} /> Add Experience
                </Button>
              </div>

              <div className="timeline-items-list">
                {formData.timelineItems.map((item) => (
                  <div key={item.id} className="timeline-editor-card">
                    <div className="timeline-editor-header">
                      <span className={`timeline-type-badge type-${item.type}`}>
                        {item.type === 'education' ? <BookOpen size={12} /> : <Briefcase size={12} />}
                        {item.type}
                      </span>
                      <button
                        type="button"
                        className="timeline-delete-btn"
                        onClick={() => deleteTimelineItem(item.id)}
                        aria-label={`Delete timeline item`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="timeline-editor-fields">
                      <Input
                        id={`date-${item.id}`}
                        label="Date/Period"
                        value={item.date}
                        onChange={(e) => handleTimelineChange(item.id, 'date', e.target.value)}
                      />
                      <Input
                        id={`title-${item.id}`}
                        label="Title / Position"
                        value={item.title}
                        onChange={(e) => handleTimelineChange(item.id, 'title', e.target.value)}
                      />
                      <Input
                        id={`institution-${item.id}`}
                        label="Institution / Company"
                        value={item.institution}
                        onChange={(e) => handleTimelineChange(item.id, 'institution', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Side stats & preview column */}
          <div className="about-manager-side">
            <SectionCard title="At a Glance Cards" description="Quick summary credentials shown on desktop sidebar.">
              {formData.glanceItems.map((item, idx) => (
                <div key={item.label} className="glance-editor-row">
                  <Input
                    id={`glance-label-${idx}`}
                    label={`Label ${idx + 1}`}
                    value={item.label}
                    onChange={(e) => handleGlanceChange(idx, 'label', e.target.value)}
                  />
                  <Input
                    id={`glance-value-${idx}`}
                    label={`Value ${idx + 1}`}
                    value={item.value}
                    onChange={(e) => handleGlanceChange(idx, 'value', e.target.value)}
                  />
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Section Illustration" description="Biography graphic placeholder rendering.">
              <div className="about-illustration-box">
                <img
                  src={formData.imageUrl}
                  alt="Profile section render preview"
                  className="about-preview-img"
                />
                <div className="about-image-info">
                  <span>About Illustration sequence preview</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </form>
    </div>
  );
}
