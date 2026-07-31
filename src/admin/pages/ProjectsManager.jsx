import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Copy,
  FolderKanban,
  FileImage,
  Flame,
  LayoutGrid,
  Upload,
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
import { uploadFileToCloudinary } from '../services/cloudinary';
import './ProjectsManager.css';

const DEFAULT_PROJECTS = [
  { id: 'proj-1', title: 'FitSphere Core', subtitle: 'Fitness Mobile Application', shortDesc: 'A fitness mobile app providing automated workout scheduling.', longDesc: 'FitSphere Core utilizes React Native on the client side coupled with Firebase Authentication and Firestore DB. It implements automatic workout scaling algorithms based on individual metrics.', techStack: 'React Native, Firebase, Expo, Redux', type: 'Mobile App', status: 'Published', featured: true, displayOrder: 1, githubUrl: 'https://github.com/usaaman/fitsphere', liveUrl: 'https://fitsphere.example.com', docUrl: '', videoUrl: '', caseStudyUrl: '', coverImage: '/frames/frame-138.webp', gallery: ['/frames/frame-138.webp', '/frames/frame-081.webp'] },
  { id: 'proj-2', title: 'DevConnect Portal', subtitle: 'Developer Networking Platform', shortDesc: 'Social connection platform for software engineering students.', longDesc: 'DevConnect allows peer portfolio sharing and project team building. Features realtime messaging and skill matchmaking matrix filters.', techStack: 'React, Node.js, Socket.io, MongoDB', type: 'Web Application', status: 'Published', featured: false, displayOrder: 2, githubUrl: 'https://github.com/usaaman/devconnect', liveUrl: '', docUrl: '', videoUrl: '', caseStudyUrl: '', coverImage: '/frames/frame-081.webp', gallery: ['/frames/frame-081.webp'] }
];

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('displayOrder');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 3;

  // Form Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'gallery' | 'settings'

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    shortDesc: '',
    longDesc: '',
    techStack: '',
    type: 'Web Application',
    status: 'Published',
    featured: false,
    displayOrder: 1,
    githubUrl: '',
    liveUrl: '',
    docUrl: '',
    videoUrl: '',
    caseStudyUrl: '',
    coverImage: '',
    gallery: [],
  });

  const [initialFormData, setInitialFormData] = useState({
    title: '',
    subtitle: '',
    shortDesc: '',
    longDesc: '',
    techStack: '',
    type: 'Web Application',
    status: 'Published',
    featured: false,
    displayOrder: 1,
    githubUrl: '',
    liveUrl: '',
    docUrl: '',
    videoUrl: '',
    caseStudyUrl: '',
    coverImage: '',
    gallery: [],
  });

  useEffect(() => {
    const dirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setIsDirty(dirty);
  }, [formData, initialFormData]);

  // Prompt before window unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && formOpen) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in the project form. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, formOpen]);

  // Screen gallery field helper
  const [newImageInput, setNewImageInput] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  // Delete states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      if (db) {
        const q = query(collection(db, 'projects'), orderBy('displayOrder', 'asc'));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        if (list.length === 0) {
          setProjects([...DEFAULT_PROJECTS]);
        } else {
          setProjects(list);
        }
      } else {
        setProjects([...DEFAULT_PROJECTS]);
      }
    } catch (e) {
      console.warn('Failed loading projects:', e);
      setProjects([...DEFAULT_PROJECTS]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // -------------------------------------------------------------
  // LIST OPERATIONS
  // -------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    let result = projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, search, statusFilter, sortField, sortOrder]);

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, page]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;

  // -------------------------------------------------------------
  // FORM / CREATE / EDIT / DUPLICATE
  // -------------------------------------------------------------
  const openAdd = () => {
    setEditMode(false);
    setActiveTab('basic');
    const initial = {
      title: '',
      subtitle: '',
      shortDesc: '',
      longDesc: '',
      techStack: '',
      type: 'Web Application',
      status: 'Published',
      featured: false,
      displayOrder: projects.length + 1,
      githubUrl: '',
      liveUrl: '',
      docUrl: '',
      videoUrl: '',
      caseStudyUrl: '',
      coverImage: '/frames/frame-138.webp',
      gallery: [],
    };
    setFormData(initial);
    setInitialFormData(initial);
    setNewImageInput('');
    setFormOpen(true);
  };

  const openEdit = (project) => {
    setEditMode(true);
    setActiveProjectId(project.id);
    setActiveTab('basic');
    const initial = {
      title: project.title || '',
      subtitle: project.subtitle || '',
      shortDesc: project.shortDesc || '',
      longDesc: project.longDesc || '',
      techStack: project.techStack || '',
      type: project.type || 'Web Application',
      status: project.status || 'Published',
      featured: !!project.featured,
      displayOrder: project.displayOrder || 1,
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      docUrl: project.docUrl || '',
      videoUrl: project.videoUrl || '',
      caseStudyUrl: project.caseStudyUrl || '',
      coverImage: project.coverImage || '/frames/frame-138.webp',
      gallery: project.gallery || [],
    };
    setFormData(initial);
    setInitialFormData(initial);
    setNewImageInput('');
    setFormOpen(true);
  };

  const handleDuplicate = async (project) => {
    const docId = `proj-${Date.now()}`;
    const duplicated = {
      ...project,
      title: `${project.title || 'Untitled'} (Copy)`,
      displayOrder: Number(project.displayOrder || 0) + 1,
      featured: false,
      status: 'Draft',
    };
    try {
      if (db) {
        await setDoc(doc(db, 'projects', docId), duplicated);
      }
      setProjects((prev) => [...prev, { id: docId, ...duplicated }]);
    } catch (e) {
      console.error(e);
    }
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
    const docId = editMode ? activeProjectId : `proj-${Date.now()}`;
    const payload = {
      ...formData,
      displayOrder: Number(formData.displayOrder),
    };

    try {
      if (db) {
        await setDoc(doc(db, 'projects', docId), payload);
      }

      if (editMode) {
        setProjects((prev) =>
          prev.map((p) => (p.id === activeProjectId ? { ...p, ...payload } : p))
        );
      } else {
        setProjects((prev) => [...prev, { id: docId, ...payload }]);
      }
      setInitialFormData({ ...formData });
      setIsDirty(false);
      setSaveStatus('success');
      setFormOpen(false);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const addGalleryImage = () => {
    if (!newImageInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, newImageInput.trim()],
    }));
    setNewImageInput('');
  };

  const removeGalleryImage = (idx) => {
    setFormData((prev) => {
      const updated = prev.gallery.filter((_, i) => i !== idx);
      let newCover = prev.coverImage;
      if (prev.coverImage === prev.gallery[idx]) {
        newCover = updated[0] || '';
      }
      return { ...prev, gallery: updated, coverImage: newCover };
    });
  };

  const moveGalleryImage = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= formData.gallery.length) return;
    setFormData((prev) => {
      const updated = [...prev.gallery];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, gallery: updated };
    });
  };

  const setAsCover = (img) => {
    setFormData((prev) => ({ ...prev, coverImage: img }));
  };

  const triggerDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (db) {
        await deleteDoc(doc(db, 'projects', deleteTargetId));
      }
      setProjects((prev) => prev.filter((p) => p.id !== deleteTargetId));
    } catch (e) {
      console.error(e);
    }
    setDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const togglePublish = async (project) => {
    const nextStatus = project.status === 'Published' ? 'Draft' : 'Published';
    try {
      if (db) {
        await setDoc(doc(db, 'projects', project.id), { ...project, status: nextStatus }, { merge: true });
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status: nextStatus } : p))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="projects-manager-container">
      <PageHeader
        title="Projects CMS"
        description="Manage the featured works directory, link code repositories, and configure media screenshot cards."
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add New Project
          </Button>
        }
      />

      {saveStatus === 'success' && (
        <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
          ✓ Project list updated successfully.
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
          ✕ Error updating project.
        </div>
      )}

      {/* Filter and Search Bar Row */}
      <div className="projects-toolbar-card">
        <div className="toolbar-search-input">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="toolbar-filters">
          <div className="filter-group">
            <SlidersHorizontal size={14} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field);
                setSortOrder(order);
              }}
            >
              <option value="displayOrder-asc">Sort: Display Order</option>
              <option value="title-asc">Sort: Title A-Z</option>
              <option value="id-desc">Sort: Date Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table Card */}
      <SectionCard title="Active Listings Inventory" description="Click actions to modify project states.">
        {loading ? (
          <div className="projects-table-empty">
            <FolderKanban size={32} />
            <p>Loading projects database...</p>
          </div>
        ) : paginatedProjects.length === 0 ? (
          <div className="projects-table-empty">
            <FolderKanban size={32} />
            <p>No projects match your current filters.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Order</th>
                  <th style={{ width: '90px' }}>Thumbnail</th>
                  <th>Project Name</th>
                  <th>Stack</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProjects.map((proj) => (
                  <tr key={proj.id}>
                    <td>
                      <span className="order-number-badge">#{proj.displayOrder}</span>
                    </td>
                    <td>
                      <div className="project-table-thumb">
                        <img src={proj.coverImage} alt="" onError={(e) => { e.target.src = '/frames/frame-138.webp'; }} />
                      </div>
                    </td>
                    <td>
                      <div className="project-title-meta">
                        <span className="project-meta-title">{proj.title}</span>
                        <span className="project-meta-subtitle">{proj.subtitle}</span>
                      </div>
                    </td>
                    <td>
                      <div className="project-stack-row">
                        {proj.techStack.split(',').slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="default" className="tag-badge">
                            {tag.trim()}
                          </Badge>
                        ))}
                        {proj.techStack.split(',').length > 3 && (
                          <span className="stack-overflow-badge">+{proj.techStack.split(',').length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge
                        variant={
                          proj.status === 'Published'
                            ? 'success'
                            : proj.status === 'Draft'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {proj.status}
                      </Badge>
                    </td>
                    <td>
                      {proj.featured ? (
                        <Badge variant="primary" className="featured-badge">
                          <Flame size={10} className="mr-1" /> Featured
                        </Badge>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => togglePublish(proj)}
                          title={proj.status === 'Published' ? 'Change to Draft' : 'Publish'}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleDuplicate(proj)}
                          title="Duplicate Listing"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => openEdit(proj)}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn btn-trash"
                          onClick={() => triggerDelete(proj.id)}
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="projects-pagination-row">
            <span className="pagination-info">
              Showing page {page} of {totalPages} ({filteredProjects.length} total)
            </span>
            <div className="pagination-buttons">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
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
        title={editMode ? 'Edit Project Listing' : 'Create New Project'}
        className="project-editor-modal"
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
              {editMode ? 'Save Changes' : 'Create Project'}
            </Button>
          </>
        }
      >
        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '8px 12px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
            ⚠️ Unsaved changes detected. Click Save Changes to update.
          </div>
        )}
        <div className="project-editor-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'basic' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'gallery' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Media Gallery
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Links & Settings
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="project-editor-form-viewport">
          {activeTab === 'basic' && (
            <div className="tab-viewport-stack">
              <div className="form-row-2">
                <Input
                  id="title"
                  label="Project Title"
                  value={formData.title}
                  onChange={handleFormChange}
                />
                <Input
                  id="subtitle"
                  label="Category Subtitle"
                  value={formData.subtitle}
                  onChange={handleFormChange}
                />
              </div>

              <Input
                id="techStack"
                label="Tech Stack (comma-separated)"
                placeholder="React, Node.js, MongoDB"
                value={formData.techStack}
                onChange={handleFormChange}
              />

              <Textarea
                id="shortDesc"
                label="Short Card Pitch"
                value={formData.shortDesc}
                onChange={handleFormChange}
              />

              <Textarea
                id="longDesc"
                label="Deep Dive Case Study Info"
                value={formData.longDesc}
                onChange={handleFormChange}
              />
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="tab-viewport-stack">
              <div className="gallery-input-block" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <Input
                    id="newImage"
                    label="Add Image URL Path"
                    placeholder="/frames/frame-138.webp"
                    value={newImageInput}
                    onChange={(e) => setNewImageInput(e.target.value)}
                  />
                </div>
                <Button type="button" variant="ghost" onClick={addGalleryImage} className="gallery-add-btn" style={{ height: '42px' }}>
                  Add Path
                </Button>
                
                <input
                  type="file"
                  id="projectScreenshotInput"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setIsUploadingScreenshot(true);
                      try {
                        const url = await uploadFileToCloudinary(file);
                        setFormData((prev) => {
                          const updatedGallery = [...prev.gallery, url];
                          const updatedCover = prev.coverImage || url;
                          return { ...prev, gallery: updatedGallery, coverImage: updatedCover };
                        });
                      } catch (err) {
                        alert(`Cloudinary Upload Failed: ${err.message}`);
                      } finally {
                        setIsUploadingScreenshot(false);
                      }
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('projectScreenshotInput').click()} 
                  isLoading={isUploadingScreenshot}
                  style={{ height: '42px' }}
                >
                  <Upload size={14} /> Upload File
                </Button>
              </div>

              <div className="gallery-grid-preview">
                {formData.gallery.length === 0 ? (
                  <div className="gallery-empty-grid">
                    <FileImage size={24} />
                    <span>No Screenshots uploaded to listings.</span>
                  </div>
                ) : (
                  formData.gallery.map((img, index) => {
                    const isCover = formData.coverImage === img;
                    return (
                      <div key={img + index} className={`gallery-editor-tile ${isCover ? 'is-cover' : ''}`}>
                        <img src={img} alt="" onError={(e) => { e.target.src = '/frames/frame-138.webp'; }} />
                        <div className="tile-hover-overlay">
                          <button
                            type="button"
                            className={`action-dot-btn cover-btn ${isCover ? 'is-active' : ''}`}
                            onClick={() => setAsCover(img)}
                            title={isCover ? 'Active Cover' : 'Set as Cover'}
                          >
                            <LayoutGrid size={12} />
                          </button>
                          <button
                            type="button"
                            className="action-dot-btn remove-btn"
                            onClick={() => removeGalleryImage(index)}
                            title="Delete Image"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="reorder-dots-row">
                            <button
                              type="button"
                              onClick={() => moveGalleryImage(index, -1)}
                              disabled={index === 0}
                              title="Move Left"
                            >
                              <ChevronLeft size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGalleryImage(index, 1)}
                              disabled={index === formData.gallery.length - 1}
                              title="Move Right"
                            >
                              <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                        {isCover && <span className="cover-ribbon">Cover</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-viewport-stack">
              <div className="form-row-2">
                <Select
                  id="type"
                  label="Project Layout Category"
                  value={formData.type}
                  onChange={handleFormChange}
                  options={[
                    { value: 'Web Application', label: 'Web Application' },
                    { value: 'Mobile App', label: 'Mobile Application' },
                    { value: 'AI & Bot integrations', label: 'AI & Bot Integration' },
                    { value: 'Other Support', label: 'Other Support' },
                  ]}
                />

                <Select
                  id="status"
                  label="Display Status"
                  value={formData.status}
                  onChange={handleFormChange}
                  options={[
                    { value: 'Published', label: 'Published' },
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Hidden', label: 'Hidden' },
                  ]}
                />
              </div>

              <div className="form-row-2">
                <Input
                  id="displayOrder"
                  label="Display Sort Order"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleFormChange}
                />

                <div className="admin-field" style={{ justifyContent: 'center', paddingTop: '28px' }}>
                  <label className="flex items-center gap-2 cursor-pointer user-select-none">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={handleFormChange}
                      className="remember-me-checkbox"
                    />
                    <span className="text-sm font-medium text-white">Promote to Featured Hero</span>
                  </label>
                </div>
              </div>

              <div className="form-row-2">
                <Input
                  id="githubUrl"
                  label="GitHub Repo URL"
                  value={formData.githubUrl}
                  onChange={handleFormChange}
                />
                <Input
                  id="liveUrl"
                  label="Live Web Address"
                  value={formData.liveUrl}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-row-3">
                <Input
                  id="docUrl"
                  label="Docs Link"
                  value={formData.docUrl}
                  onChange={handleFormChange}
                />
                <Input
                  id="videoUrl"
                  label="Video Preview Link"
                  value={formData.videoUrl}
                  onChange={handleFormChange}
                />
                <Input
                  id="caseStudyUrl"
                  label="Case Study URL"
                  value={formData.caseStudyUrl}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Confirmation Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Project Listing?"
        message="This action will permanently delete this project listing from your CMS inventory."
      />
    </div>
  );
}
