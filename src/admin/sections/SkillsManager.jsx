import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Cpu,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Image,
  Tag,
  Layers,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_CATEGORIES = [
  {
    id: 'programming',
    title: 'Programming & Development',
    tag: 'CORE // LOGIC',
    direction: 'left',
    speed: '34s',
    skills: ['JavaScript', 'TypeScript', 'Python', 'C++', 'C#', 'PHP', 'Assembly / NASM', 'HTML5', 'CSS3', 'SQL / MySQL']
  },
  {
    id: 'webdev',
    title: 'Web Development',
    tag: 'FULL-STACK // UI',
    direction: 'right',
    speed: '28s',
    skills: ['React.js', 'Node.js', 'Express.js', 'Vite', 'Tailwind CSS', 'REST APIs', 'Full-Stack Web Development', 'Responsive Web Design', 'Firebase', 'Firestore']
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    tag: 'NEURAL // LLM',
    direction: 'left',
    speed: '38s',
    skills: ['AI Agent Development', 'Generative AI', 'LLM Integration', 'RAG', 'Prompt Engineering', 'OpenAI API', 'Google Gemini API', 'Groq API', 'AI Workflow Automation', 'AI-Powered Email Automation']
  },
  {
    id: 'database',
    title: 'Database & Storage',
    tag: 'SCHEMA // STORAGE',
    direction: 'right',
    speed: '30s',
    skills: ['MySQL', 'Firebase Database', 'IndexedDB', 'Data Caching', 'Database Integration']
  },
  {
    id: 'security',
    title: 'Cybersecurity & Networking',
    tag: 'SECURITY // DEFENSE',
    direction: 'left',
    speed: '36s',
    skills: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Cisco Packet Tracer', 'Linux']
  },
  {
    id: 'creative',
    title: 'Creative & Video Editing',
    tag: 'VISUAL // MEDIA',
    direction: 'right',
    speed: '26s',
    skills: ['CapCut Video Editing', 'Adobe Premiere Pro', 'Photoshop', 'Figma', 'Visual Storytelling', 'Color Grading', 'Sound Design']
  }
];

export default function SkillsManager({ initialData, onSaved }) {
  const [categories, setCategories] = useState(() => {
    if (initialData?.categories && Array.isArray(initialData.categories) && initialData.categories.length > 0) {
      return initialData.categories;
    }
    return DEFAULT_CATEGORIES;
  });

  const [characterImg, setCharacterImg] = useState(() => {
    return initialData?.characterImg || '/character-transparent.png';
  });

  const [newSkillInputs, setNewSkillInputs] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { catIndex, title }

  useEffect(() => {
    if (initialData?.categories && Array.isArray(initialData.categories) && initialData.categories.length > 0) {
      setCategories(initialData.categories);
      if (initialData.characterImg) setCharacterImg(initialData.characterImg);
      return;
    }
    async function loadSkillsConfig() {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, 'skills', 'config'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.categories && Array.isArray(d.categories) && d.categories.length > 0) {
            setCategories(d.categories);
          }
          if (d.characterImg) {
            setCharacterImg(d.characterImg);
          }
        }
      } catch (err) {
        console.warn('Could not load skills config from firestore:', err);
      }
    }
    loadSkillsConfig();
  }, [initialData]);

  // Category mutations
  const handleCategoryFieldChange = (catIndex, field, value) => {
    const updated = [...categories];
    updated[catIndex] = { ...updated[catIndex], [field]: value };
    setCategories(updated);
  };

  const addCategory = () => {
    const newId = `cat_${Date.now()}`;
    const newRow = {
      id: newId,
      title: 'New Skill Discipline',
      tag: 'TECH // STACK',
      direction: categories.length % 2 === 0 ? 'left' : 'right',
      speed: '32s',
      skills: ['New Skill 1', 'New Skill 2']
    };
    setCategories(prev => [...prev, newRow]);
  };

  const removeCategory = (catIndex) => {
    const rowTitle = categories[catIndex]?.title || `Row ${catIndex + 1}`;
    setDeleteTarget({ catIndex, title: rowTitle });
  };

  const executeRemoveCategory = () => {
    if (!deleteTarget) return;
    setCategories(prev => prev.filter((_, idx) => idx !== deleteTarget.catIndex));
    setDeleteTarget(null);
  };

  // Skill mutations within category
  const addSkillToCategory = (catIndex) => {
    const text = (newSkillInputs[catIndex] || '').trim();
    if (!text) return;

    const updated = [...categories];
    const catSkills = [...(updated[catIndex].skills || [])];
    if (!catSkills.includes(text)) {
      catSkills.push(text);
      updated[catIndex].skills = catSkills;
      setCategories(updated);
    }

    setNewSkillInputs(prev => ({ ...prev, [catIndex]: '' }));
  };

  const removeSkillFromCategory = (catIndex, skillIndex) => {
    const updated = [...categories];
    updated[catIndex].skills = updated[catIndex].skills.filter((_, idx) => idx !== skillIndex);
    setCategories(updated);
  };

  // Save all to Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      categories,
      characterImg: characterImg.trim(),
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately cache locally
    try {
      localStorage.setItem('portfolio_cache_skills', JSON.stringify(payload));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'portfolio_cache_skills',
        newValue: JSON.stringify(payload)
      }));
    } catch {}

    // 2. Sync to Cloud Firestore
    try {
      if (db) {
        await setDoc(doc(db, 'skills', 'config'), payload, { merge: true });
      }
      setFeedback({
        type: 'success',
        message: `Skills configuration saved! ${categories.length} category rows active on live portfolio & Firestore.`
      });
      if (onSaved) onSaved(payload);
    } catch (err) {
      console.warn('Failed to save skills config:', err);
      if (err.code === 'permission-denied' || err.message?.includes('insufficient permissions')) {
        setFeedback({
          type: 'error',
          message: `Active on your live portfolio view! Note: Cloud Firestore write was blocked by Firebase Rules (Permission Denied). Please update Firestore Database Rules in Firebase Console to allow write.`
        });
      } else {
        setFeedback({ type: 'error', message: 'Failed to update skills: ' + err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      {feedback && (
        <div className={`adm-toast-banner ${feedback.type === 'success' ? 'adm-toast-success' : 'adm-toast-error'}`}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 3D Character Image Manager */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Image className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Skills 3D Character Avatar</h3>
              <p className="adm-card-subtitle">Change the 3D character displayed alongside the skills section. (Must be a transparent PNG).</p>
            </div>
          </div>
          <button type="submit" className="adm-btn-save-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save All Skills & Rows'}</span>
          </button>
        </div>

        <div className="adm-form-grid" style={{ alignItems: 'center' }}>
          <div className="adm-field">
            <label className="adm-label">Character PNG Image Path / URL</label>
            <input
              type="text"
              value={characterImg}
              onChange={(e) => setCharacterImg(e.target.value)}
              className="adm-input"
              placeholder="/character-transparent.png or Cloudinary/CDN PNG URL"
            />
            <span className="adm-label-hint">Ensure the image has a transparent background for optimal visual fusion.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--adm-surface-alt)', padding: '12px 16px', borderRadius: '10px' }}>
            <img
              src={characterImg || '/character-transparent.png'}
              alt="Character Preview"
              style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#051c18', borderRadius: '8px', padding: '4px' }}
              onError={(e) => { e.target.src = '/character-transparent.png'; }}
            />
            <div>
              <strong style={{ fontSize: '13px', display: 'block', color: 'var(--adm-green-deep)' }}>Live Character Preview</strong>
              <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>Transparent PNG anchored to the bottom left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Stream Rows */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Layers className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Skills Categories & Dynamic Marquee Rows</h3>
              <p className="adm-card-subtitle">
                Each category represents an independent scrolling stream on the portfolio. Adding a category dynamically adds a row.
              </p>
            </div>
          </div>
          <button type="button" onClick={addCategory} className="adm-btn-secondary-sm" style={{ border: '2px dashed var(--adm-amber)', color: '#b45309' }}>
            <Plus size={16} />
            <span>Add New Category Row</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {categories.map((cat, catIdx) => (
            <div key={cat.id || catIdx} className="adm-item-card" style={{ borderLeft: '4px solid var(--adm-green-deep)' }}>
              <div className="adm-item-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: 'var(--adm-green-deep)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    ROW #{catIdx + 1}
                  </span>
                  <strong style={{ fontSize: '16px', color: 'var(--adm-green-deep)' }}>{cat.title}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', background: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                    {cat.skills?.length || 0} skills
                  </span>
                </div>

                <button type="button" onClick={() => removeCategory(catIdx)} className="adm-btn-danger-sm">
                  <Trash2 size={13} />
                  <span>Delete Row</span>
                </button>
              </div>

              {/* Row Settings */}
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label className="adm-label">Category Title</label>
                  <input
                    type="text"
                    value={cat.title || ''}
                    onChange={(e) => handleCategoryFieldChange(catIdx, 'title', e.target.value)}
                    className="adm-input"
                    placeholder="e.g. Mobile & Flutter Development"
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label">Badge Tag</label>
                  <input
                    type="text"
                    value={cat.tag || ''}
                    onChange={(e) => handleCategoryFieldChange(catIdx, 'tag', e.target.value)}
                    className="adm-input"
                    placeholder="e.g. MOBILE // CROSS-PLATFORM"
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label">Scroll Direction</label>
                  <select
                    value={cat.direction || 'left'}
                    onChange={(e) => handleCategoryFieldChange(catIdx, 'direction', e.target.value)}
                    className="adm-select"
                  >
                    <option value="left">Left ← (Smooth)</option>
                    <option value="right">Right → (Smooth)</option>
                  </select>
                </div>

                <div className="adm-field">
                  <label className="adm-label">Scroll Speed</label>
                  <input
                    type="text"
                    value={cat.speed || '30s'}
                    onChange={(e) => handleCategoryFieldChange(catIdx, 'speed', e.target.value)}
                    className="adm-input"
                    placeholder="e.g. 28s or 34s"
                  />
                </div>
              </div>

              {/* Skills in this category */}
              <div style={{ marginTop: '10px' }}>
                <label className="adm-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Skills Included in this Marquee Stream:
                </label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {(cat.skills || []).map((skillName, sIdx) => (
                    <span key={sIdx} className="adm-skill-pill">
                      <span>{skillName}</span>
                      <button
                        type="button"
                        className="adm-skill-pill-remove"
                        onClick={() => removeSkillFromCategory(catIdx, sIdx)}
                        title="Remove skill"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill input */}
                <div style={{ display: 'flex', gap: '8px', maxWidth: '420px' }}>
                  <input
                    type="text"
                    value={newSkillInputs[catIdx] || ''}
                    onChange={(e) => setNewSkillInputs({ ...newSkillInputs, [catIdx]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillToCategory(catIdx); } }}
                    placeholder="Type skill name & press Add..."
                    className="adm-input"
                    style={{ height: '36px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => addSkillToCategory(catIdx)}
                    className="adm-btn-secondary-sm"
                    style={{ flexShrink: 0 }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Skill Category Row"
        message={
          <span>
            Are you sure you want to delete the entire skill row <strong>"{deleteTarget?.title}"</strong> and all its associated skill tags?
          </span>
        }
        confirmText="Yes, Delete Row"
        cancelText="Cancel"
        confirmVariant="danger"
        iconType="delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={executeRemoveCategory}
      />
    </form>
  );
}

