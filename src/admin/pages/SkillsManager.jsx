import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  X,
  Check,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../shared/Button';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './SkillsManager.css';

const DEFAULT_CATEGORIES = [
  { id: 'cat-frontend', label: 'Frontend', hidden: false },
  { id: 'cat-backend', label: 'Backend', hidden: false },
  { id: 'cat-db-cloud', label: 'Database & Cloud', hidden: false },
  { id: 'cat-ai-auto', label: 'AI & Automation', hidden: false },
  { id: 'cat-programming', label: 'Programming', hidden: false },
  { id: 'cat-tools-devops', label: 'Tools & DevOps', hidden: false }
];

const DEFAULT_SKILLS = [
  // Frontend (cat-frontend)
  { id: 1, categoryId: 'cat-frontend', name: 'HTML5', color: '#E34F26', icon: 'Globe', hidden: false },
  { id: 2, categoryId: 'cat-frontend', name: 'CSS3', color: '#1572B6', icon: 'Globe', hidden: false },
  { id: 3, categoryId: 'cat-frontend', name: 'JavaScript (ES6+)', color: '#F7DF1E', icon: 'Code', hidden: false },
  { id: 4, categoryId: 'cat-frontend', name: 'TypeScript', color: '#3178C6', icon: 'Code', hidden: false },
  { id: 5, categoryId: 'cat-frontend', name: 'React.js', color: '#61DAFB', icon: 'Cpu', hidden: false },
  { id: 6, categoryId: 'cat-frontend', name: 'Vite', color: '#646CFF', icon: 'Cpu', hidden: false },
  { id: 7, categoryId: 'cat-frontend', name: 'Tailwind CSS', color: '#06B6D4', icon: 'Globe', hidden: false },
  { id: 8, categoryId: 'cat-frontend', name: 'Framer Motion', color: '#F024B3', icon: 'LayoutDashboard', hidden: false },
  { id: 9, categoryId: 'cat-frontend', name: 'GSAP', color: '#88CE02', icon: 'LayoutDashboard', hidden: false },
  { id: 10, categoryId: 'cat-frontend', name: 'Responsive Web Design', color: '#FFFFFF', icon: 'Globe', hidden: false },

  // Backend (cat-backend)
  { id: 11, categoryId: 'cat-backend', name: 'Node.js', color: '#339933', icon: 'Server', hidden: false },
  { id: 12, categoryId: 'cat-backend', name: 'Express.js', color: '#FFFFFF', icon: 'Server', hidden: false },
  { id: 13, categoryId: 'cat-backend', name: 'REST API Development', color: '#009688', icon: 'Terminal', hidden: false },
  { id: 14, categoryId: 'cat-backend', name: 'API Integration', color: '#008080', icon: 'Terminal', hidden: false },
  { id: 15, categoryId: 'cat-backend', name: 'Authentication (JWT)', color: '#000000', icon: 'Terminal', hidden: false },
  { id: 16, categoryId: 'cat-backend', name: 'Firebase Authentication', color: '#FFCA28', icon: 'Flame', hidden: false },
  { id: 17, categoryId: 'cat-backend', name: 'Middleware Development', color: '#D3D3D3', icon: 'Server', hidden: false },
  { id: 18, categoryId: 'cat-backend', name: 'CRUD Operations', color: '#FFFFFF', icon: 'Database', hidden: false },

  // Database & Cloud (cat-db-cloud)
  { id: 19, categoryId: 'cat-db-cloud', name: 'Firebase Firestore', color: '#FFA000', icon: 'Database', hidden: false },
  { id: 20, categoryId: 'cat-db-cloud', name: 'Firebase Storage', color: '#FFCA28', icon: 'Box', hidden: false },
  { id: 21, categoryId: 'cat-db-cloud', name: 'Cloudinary', color: '#3448C5', icon: 'Box', hidden: false },
  { id: 22, categoryId: 'cat-db-cloud', name: 'IndexedDB', color: '#FFFFFF', icon: 'Database', hidden: false },
  { id: 23, categoryId: 'cat-db-cloud', name: 'MySQL', color: '#4479A1', icon: 'Database', hidden: false },
  { id: 24, categoryId: 'cat-db-cloud', name: 'Database Design', color: '#D394FF', icon: 'Database', hidden: false },
  { id: 25, categoryId: 'cat-db-cloud', name: 'Real-time Data Sync', color: '#34D399', icon: 'Cpu', hidden: false },

  // AI & Automation (cat-ai-auto)
  { id: 26, categoryId: 'cat-ai-auto', name: 'AI Agent Development', color: '#A78BFA', icon: 'Cpu', hidden: false },
  { id: 27, categoryId: 'cat-ai-auto', name: 'Prompt Engineering', color: '#FFFFFF', icon: 'Terminal', hidden: false },
  { id: 28, categoryId: 'cat-ai-auto', name: 'Groq API', color: '#F25C54', icon: 'Terminal', hidden: false },
  { id: 29, categoryId: 'cat-ai-auto', name: 'OpenAI API', color: '#00A67E', icon: 'Cpu', hidden: false },
  { id: 30, categoryId: 'cat-ai-auto', name: 'RAG (Retrieval-Augmented Generation)', color: '#FFFFFF', icon: 'Code', hidden: false },
  { id: 31, categoryId: 'cat-ai-auto', name: 'Tool Calling', color: '#FFFFFF', icon: 'Terminal', hidden: false },
  { id: 32, categoryId: 'cat-ai-auto', name: 'AI Chatbot Development', color: '#38BDF8', icon: 'Cpu', hidden: false },
  { id: 33, categoryId: 'cat-ai-auto', name: 'Workflow Automation', color: '#F59E0B', icon: 'LayoutDashboard', hidden: false },

  // Programming (cat-programming)
  { id: 34, categoryId: 'cat-programming', name: 'Python', color: '#3776AB', icon: 'Code', hidden: false },
  { id: 35, categoryId: 'cat-programming', name: 'C++', color: '#00599C', icon: 'Code', hidden: false },
  { id: 36, categoryId: 'cat-programming', name: 'C#', color: '#178600', icon: 'Code', hidden: false },
  { id: 37, categoryId: 'cat-programming', name: 'Java', color: '#007396', icon: 'Code', hidden: false },
  { id: 38, categoryId: 'cat-programming', name: 'Assembly Language', color: '#FFFFFF', icon: 'Code', hidden: false },
  { id: 39, categoryId: 'cat-programming', name: 'Object-Oriented Programming', color: '#FFFFFF', icon: 'Code', hidden: false },
  { id: 40, categoryId: 'cat-programming', name: 'Data Structures & Algorithms', color: '#FFFFFF', icon: 'Code', hidden: false },

  // Tools & DevOps (cat-tools-devops)
  { id: 41, categoryId: 'cat-tools-devops', name: 'Git', color: '#F05032', icon: 'Code', hidden: false },
  { id: 42, categoryId: 'cat-tools-devops', name: 'GitHub', color: '#FFFFFF', icon: 'Code', hidden: false },
  { id: 43, categoryId: 'cat-tools-devops', name: 'VS Code', color: '#007ACC', icon: 'Code', hidden: false },
  { id: 44, categoryId: 'cat-tools-devops', name: 'Postman', color: '#FF6C37', icon: 'Terminal', hidden: false },
  { id: 45, categoryId: 'cat-tools-devops', name: 'npm', color: '#CB3837', icon: 'Terminal', hidden: false },
  { id: 46, categoryId: 'cat-tools-devops', name: 'Cisco Packet Tracer', color: '#1C3C5A', icon: 'Server', hidden: false },
  { id: 47, categoryId: 'cat-tools-devops', name: 'Enterprise Architect', color: '#FFFFFF', icon: 'LayoutDashboard', hidden: false },
  { id: 48, categoryId: 'cat-tools-devops', name: 'Figma', color: '#F24E1E', icon: 'LayoutDashboard', hidden: false },
  { id: 49, categoryId: 'cat-tools-devops', name: 'Canva', color: '#00C4CC', icon: 'LayoutDashboard', hidden: false },
  { id: 50, categoryId: 'cat-tools-devops', name: 'CapCut', color: '#10B981', icon: 'Video', hidden: false }
];

const ICON_OPTIONS = [
  { value: 'Code', label: 'Code Icon' },
  { value: 'Cpu', label: 'CPU Icon' },
  { value: 'Globe', label: 'Globe / Web Icon' },
  { value: 'Flame', label: 'Flame Icon' },
  { value: 'Database', label: 'Database Icon' },
  { value: 'LayoutDashboard', label: 'Dashboard Icon' },
  { value: 'Video', label: 'Video / Film Icon' },
  { value: 'Server', label: 'Server / Cloud Icon' },
  { value: 'Box', label: 'Box / Container Icon' },
  { value: 'Terminal', label: 'Terminal Icon' }
];

export default function SkillsManager() {
  const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);
  const [skills, setSkills] = useState([...DEFAULT_SKILLS]);
  const [initialCategories, setInitialCategories] = useState([...DEFAULT_CATEGORIES]);
  const [initialSkills, setInitialSkills] = useState([...DEFAULT_SKILLS]);

  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  // Inline forms fields
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryLabel, setEditingCategoryLabel] = useState('');

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillIcon, setNewSkillIcon] = useState('Code');
  const [newSkillColor, setNewSkillColor] = useState('#4F8CFF');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category'|'skill', id: ... }

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const catsSnap = await getDoc(doc(db, 'skills', 'categories-doc'));
          const skillsSnap = await getDoc(doc(db, 'skills', 'skills-doc'));
          let loadedCats = [...DEFAULT_CATEGORIES];
          let loadedSkills = [...DEFAULT_SKILLS];

          if (catsSnap.exists()) {
            loadedCats = catsSnap.data().entries || [];
          }
          if (skillsSnap.exists()) {
            loadedSkills = skillsSnap.data().entries || [];
          }

          // Backfill default parameters
          loadedCats = loadedCats.map(c => ({
            ...c,
            hidden: c.hidden !== undefined ? c.hidden : false
          }));

          loadedSkills = loadedSkills.map(s => ({
            ...s,
            hidden: s.hidden !== undefined ? s.hidden : false
          }));

          setCategories(loadedCats);
          setSkills(loadedSkills);
          setInitialCategories(loadedCats);
          setInitialSkills(loadedSkills);

          if (loadedCats.length > 0) {
            setActiveCategoryId(loadedCats[0].id);
          }
        }
      } catch (e) {
        console.warn('Failed loading skills database:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty =
      JSON.stringify(categories) !== JSON.stringify(initialCategories) ||
      JSON.stringify(skills) !== JSON.stringify(initialSkills);
    setIsDirty(dirty);
  }, [categories, skills, initialCategories, initialSkills]);

  // Unsaved changes warning prompt
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

  // -------------------------------------------------------------
  // CATEGORIES CRUD
  // -------------------------------------------------------------
  const handleAddCategory = (e) => {
    e?.preventDefault();
    if (!newCategoryLabel.trim()) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      label: newCategoryLabel.trim().toUpperCase(),
      hidden: false,
    };
    setCategories((prev) => [...prev, newCat]);
    setActiveCategoryId(newCat.id);
    setNewCategoryLabel('');
  };

  const startRenameCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryLabel(cat.label);
  };

  const saveRenameCategory = (id) => {
    if (!editingCategoryLabel.trim()) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label: editingCategoryLabel.trim().toUpperCase() } : c))
    );
    setEditingCategoryId(null);
  };

  const cancelRenameCategory = () => {
    setEditingCategoryId(null);
  };

  const moveCategory = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= categories.length) return;
    setCategories((prev) => {
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  const toggleHideCategory = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hidden: !c.hidden } : c))
    );
  };

  // -------------------------------------------------------------
  // SKILLS CRUD
  // -------------------------------------------------------------
  const handleAddSkill = (e) => {
    e?.preventDefault();
    if (!newSkillName.trim() || !activeCategoryId) return;
    const newSkill = {
      id: Date.now(),
      categoryId: activeCategoryId,
      name: newSkillName.trim(),
      icon: newSkillIcon,
      color: newSkillColor,
      hidden: false,
    };
    setSkills((prev) => [...prev, newSkill]);
    setNewSkillName('');
    setNewSkillIcon('Code');
    setNewSkillColor('#4F8CFF');
  };

  const updateSkillProperty = (skillId, field, value) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, [field]: value } : s))
    );
  };

  const moveSkillWithinCategory = (skillId, direction) => {
    const catSkills = skills.filter((s) => s.categoryId === activeCategoryId);
    const idxInCat = catSkills.findIndex((s) => s.id === skillId);
    const targetIdxInCat = idxInCat + direction;
    if (targetIdxInCat < 0 || targetIdxInCat >= catSkills.length) return;

    const targetSkillId = catSkills[targetIdxInCat].id;

    setSkills((prev) => {
      const updated = [...prev];
      const idxA = updated.findIndex((s) => s.id === skillId);
      const idxB = updated.findIndex((s) => s.id === targetSkillId);
      if (idxA !== -1 && idxB !== -1) {
        const temp = updated[idxA];
        updated[idxA] = updated[idxB];
        updated[idxB] = temp;
      }
      return updated;
    });
  };

  const toggleHideSkill = (skillId) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, hidden: !s.hidden } : s))
    );
  };

  // -------------------------------------------------------------
  // DELETION OVERLAYS
  // -------------------------------------------------------------
  const triggerDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'category') {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSkills((prev) => prev.filter((s) => s.categoryId !== deleteTarget.id));
      if (activeCategoryId === deleteTarget.id) {
        const remaining = categories.filter((c) => c.id !== deleteTarget.id);
        setActiveCategoryId(remaining[0]?.id || null);
      }
    } else if (deleteTarget.type === 'skill') {
      setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    }

    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  // -------------------------------------------------------------
  // SAVE / CANCEL / RESET
  // -------------------------------------------------------------
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        await setDoc(doc(db, 'skills', 'categories-doc'), { entries: categories });
        await setDoc(doc(db, 'skills', 'skills-doc'), { entries: skills });
        setInitialCategories([...categories]);
        setInitialSkills([...skills]);
        setIsDirty(false);
        setSaveStatus('success');
      }
    } catch (err) {
      console.error('Error saving skills configuration:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard all unsaved changes?')) {
        setCategories([...initialCategories]);
        setSkills([...initialSkills]);
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all categories and skills list to default templates? (Requires Save to write changes)')) {
      setCategories([...DEFAULT_CATEGORIES]);
      setSkills([...DEFAULT_SKILLS]);
      setActiveCategoryId(DEFAULT_CATEGORIES[0]?.id || null);
    }
  };

  // Filter skills for active category
  const activeCategorySkills = skills.filter((s) => s.categoryId === activeCategoryId);
  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <div className="skills-manager-container">
      <PageHeader
        title="Skills Tree CMS"
        description="Organize, reorder, classify, and hide skill sets. Changes sync instantly to dual rolling marquee sections."
        actions={
          <>
            <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
              <RotateCcw size={16} /> Reset Template
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
              <X size={16} /> Cancel
            </Button>
            <Button type="button" onClick={handleSave} isLoading={isSaving}>
              <Save size={16} /> Save Changes
            </Button>
          </>
        }
      />

      {saveStatus === 'success' && (
        <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
          ✓ Skills configurations successfully updated.
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
          ✕ Error saving skills configurations.
        </div>
      )}

      {isDirty && (
        <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️ You have unsaved changes in this tree. Click Save Changes to commit configurations.</span>
        </div>
      )}

      <div className="skills-manager-layout">
        {/* Left Column: Categories Sidebar */}
        <div className="categories-sidebar-card">
          <div className="categories-sidebar-header">
            <span>MARQUEE CATEGORIES</span>
          </div>

          <form onSubmit={handleAddCategory} className="categories-inline-add">
            <input
              type="text"
              placeholder="+ Add Category..."
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
            />
            <Button size="sm" type="submit" style={{ padding: '4px 8px' }}>
              <Plus size={14} />
            </Button>
          </form>

          <div className="categories-sidebar-list">
            {categories.map((cat, idx) => {
              const isActive = cat.id === activeCategoryId;
              const isEditing = cat.id === editingCategoryId;

              return (
                <div
                  key={cat.id}
                  className={`category-sidebar-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => !isEditing && setActiveCategoryId(cat.id)}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      className="category-item-input"
                      value={editingCategoryLabel}
                      onChange={(e) => setEditingCategoryLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRenameCategory(cat.id);
                        if (e.key === 'Escape') cancelRenameCategory();
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="category-item-label" style={{ textDecoration: cat.hidden ? 'line-through' : 'none', opacity: cat.hidden ? 0.6 : 1 }}>
                      {cat.label}
                    </span>
                  )}

                  <div className="category-item-actions" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <>
                        <button type="button" className="category-row-btn" onClick={() => saveRenameCategory(cat.id)} title="Save name">
                          <Check size={12} color="#34d399" />
                        </button>
                        <button type="button" className="category-row-btn" onClick={cancelRenameCategory} title="Cancel">
                          <X size={12} color="#ef4444" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="category-row-btn" onClick={() => toggleHideCategory(cat.id)} title={cat.hidden ? 'Unhide category' : 'Hide category'} style={{ color: cat.hidden ? '#555' : 'var(--ds-color-accent-secondary)' }}>
                          {cat.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button type="button" className="category-row-btn" onClick={() => moveCategory(idx, -1)} disabled={idx === 0} title="Move Up">
                          <ArrowUp size={12} />
                        </button>
                        <button type="button" className="category-row-btn" onClick={() => moveCategory(idx, 1)} disabled={idx === categories.length - 1} title="Move Down">
                          <ArrowDown size={12} />
                        </button>
                        <button type="button" className="category-row-btn" onClick={() => startRenameCategory(cat)} title="Rename">
                          <Edit2 size={12} />
                        </button>
                        <button type="button" className="category-row-btn btn-trash" onClick={() => triggerDelete('category', cat.id)} title="Delete Category &amp; Skills">
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Skills Panel Editor */}
        {activeCategoryId ? (
          <div className="skills-pane-card">
            <div className="skills-pane-header">
              <span className="skills-pane-title">
                SKILLS IN {activeCategory?.label || 'UNNAMED CATEGORY'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--ds-color-text-muted)', fontWeight: '500' }}>
                {activeCategorySkills.length} Card{activeCategorySkills.length !== 1 ? 's' : ''} Listed
              </span>
            </div>

            <div className="skills-list-rows">
              {activeCategorySkills.map((skill) => (
                <div key={skill.id} className={`skill-row-item ${skill.hidden ? 'is-hidden' : ''}`}>
                  {/* Inline Color Picker */}
                  <div className="skill-color-input-wrapper">
                    <input
                      type="color"
                      className="skill-color-input"
                      value={skill.color || '#ffffff'}
                      onChange={(e) => updateSkillProperty(skill.id, 'color', e.target.value)}
                      title="Accent glow color"
                    />
                  </div>

                  {/* Inline Skill Name */}
                  <input
                    type="text"
                    className="skill-name-input"
                    value={skill.name}
                    onChange={(e) => updateSkillProperty(skill.id, 'name', e.target.value)}
                    placeholder="Skill Name"
                  />

                  {/* Inline Icon Selector */}
                  <select
                    className="skill-icon-select"
                    value={skill.icon || 'Code'}
                    onChange={(e) => updateSkillProperty(skill.id, 'icon', e.target.value)}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Row Controls */}
                  <div className="skill-row-actions">
                    <button type="button" className="skill-action-btn" onClick={() => toggleHideSkill(skill.id)} title={skill.hidden ? 'Unhide skill' : 'Hide skill'} style={{ color: skill.hidden ? '#555' : 'var(--ds-color-accent-secondary)' }}>
                      {skill.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button type="button" className="skill-action-btn" onClick={() => moveSkillWithinCategory(skill.id, -1)} title="Move Up">
                      <ArrowUp size={13} />
                    </button>
                    <button type="button" className="skill-action-btn" onClick={() => moveSkillWithinCategory(skill.id, 1)} title="Move Down">
                      <ArrowDown size={13} />
                    </button>
                    <button type="button" className="skill-action-btn btn-trash" onClick={() => triggerDelete('skill', skill.id)} title="Delete Skill">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Inline Add Skill Row Form */}
              <form onSubmit={handleAddSkill} className="skill-inline-add-row">
                <div className="skill-add-fields-wrap">
                  <input
                    type="color"
                    className="skill-color-input"
                    value={newSkillColor}
                    onChange={(e) => setNewSkillColor(e.target.value)}
                    title="Glow Color"
                  />
                  <input
                    type="text"
                    className="skill-name-input"
                    placeholder="+ Add Skill inline name..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />
                  <select
                    className="skill-icon-select"
                    value={newSkillIcon}
                    onChange={(e) => setNewSkillIcon(e.target.value)}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button size="sm" type="submit">
                  <Plus size={14} /> Add
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="skill-pane-placeholder">
            <AlertTriangle size={24} />
            <span>Create a category from the left pane to begin listing skills.</span>
          </div>
        )}
      </div>

      {/* Cascade Deletion Confirmation dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget?.type === 'category' ? 'Delete Category?' : 'Delete Skill?'}
        message={
          deleteTarget?.type === 'category'
            ? 'Deleting this category will cascade delete all associated skills listed under it. Are you sure you want to proceed?'
            : 'Are you sure you want to delete this skill card?'
        }
        confirmText="Confirm Delete"
      />
    </div>
  );
}
