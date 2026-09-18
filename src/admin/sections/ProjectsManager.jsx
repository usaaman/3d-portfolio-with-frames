import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  Briefcase,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Edit2,
  Film,
  Image as ImageIcon,
  X,
  Upload,
  Star,
  RefreshCw
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

// Helper: Compress images to high-quality lightweight WebP/JPEG data URLs
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/webp', 0.85);
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper: Read video clip as data URL
const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper: Upload media (especially videos up to 50MB) directly to Cloudinary CDN
const uploadToCloudinary = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return reject(new Error('Cloudinary environment variables are missing in .env'));
    }

    const resourceType = file.type.startsWith('video/') ? 'video' : 'auto';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url || res.url);
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes?.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error while uploading to Cloudinary CDN.'));
    xhr.send(formData);
  });
};

export default function ProjectsManager({ initialProjects }) {
  const [projects, setProjects] = useState(initialProjects || []);
  const [activeProject, setActiveProject] = useState(null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Sync with Firestore projects collection
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'projects'), orderBy('displayOrder', 'asc'));
      const unsub = onSnapshot(q, (snap) => {
        const list = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        if (list.length > 0) {
          setProjects(list);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore projects listener note:', e);
    }
  }, []);

  const openNewProjectForm = () => {
    const newId = `proj_${Date.now()}`;
    const newTemplate = {
      id: newId,
      title: 'New Project Showcase',
      subtitle: 'Modern Web Application',
      shortDesc: 'A brief description of this engineering achievement.',
      longDesc: 'Comprehensive details explaining problem architecture, system integration, and outcomes.',
      techStack: 'React.js, Node.js, Tailwind CSS',
      githubUrl: 'https://github.com/usaaman/',
      liveUrl: '',
      coverImage: '/projects/medcore.png',
      gallery: ['/projects/medcore.png'],
      displayOrder: projects.length + 1,
      status: 'Published',
      featured: true,
      type: 'Web App'
    };
    setActiveProject(newTemplate);
    setIsEditingNew(true);
  };

  const openEditProject = (proj) => {
    setActiveProject({
      ...proj,
      gallery: Array.isArray(proj.gallery) ? proj.gallery.slice(0, 5) : []
    });
    setIsEditingNew(false);
  };

  const closeForm = () => {
    setActiveProject(null);
    setIsEditingNew(false);
    setFeedback(null);
  };

  const handleFieldChange = (field, value) => {
    setActiveProject(prev => ({ ...prev, [field]: value }));
  };

  // Gallery (Max 5 images or videos)
  const addMediaToGallery = (url) => {
    const clean = url.trim();
    if (!clean) return;
    const current = [...(activeProject.gallery || [])];
    if (current.length >= 5) {
      setFeedback({ type: 'error', message: 'Maximum 5 media items (images/videos) allowed per project.' });
      return;
    }
    current.push(clean);
    setActiveProject(prev => ({
      ...prev,
      gallery: current,
      coverImage: prev.coverImage || clean
    }));
  };

  const removeMediaFromGallery = (index) => {
    const current = [...(activeProject.gallery || [])].filter((_, i) => i !== index);
    setActiveProject(prev => ({
      ...prev,
      gallery: current,
      coverImage: current[0] || ''
    }));
  };

  const setAsCoverImage = (index) => {
    const current = [...(activeProject.gallery || [])];
    if (!current[index]) return;
    const selected = current[index];
    const reordered = [selected, ...current.filter((_, i) => i !== index)];
    setActiveProject(prev => ({
      ...prev,
      gallery: reordered,
      coverImage: selected
    }));
    setFeedback({ type: 'success', message: `Set item #${index + 1} as primary cover image!` });
  };

  const handleDeviceFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentGallery = [...(activeProject.gallery || [])];
    const availableSlots = 5 - currentGallery.length;

    if (availableSlots <= 0) {
      setFeedback({ type: 'error', message: 'Maximum 5 media items already reached for this project.' });
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      setFeedback({ type: 'error', message: `Only ${availableSlots} more item(s) could be added (Max 5 limit).` });
    }

    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB limit as requested
    const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB

    setUploadingMedia(true);
    setUploadProgress('Preparing media...');
    try {
      const newMediaItems = [];
      for (const file of filesToProcess) {
        if (file.type.startsWith('image/')) {
          if (file.size > MAX_IMAGE_SIZE) {
            setFeedback({
              type: 'error',
              message: `Image "${file.name}" is over 15MB. Please choose a smaller image.`
            });
            continue;
          }
          const compressed = await compressImageFile(file);
          newMediaItems.push(compressed);
        } else if (file.type.startsWith('video/')) {
          if (file.size > MAX_VIDEO_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            setFeedback({
              type: 'error',
              message: `Video "${file.name}" is ${sizeMB}MB (Maximum limit is 50MB). Please select a video under 50MB.`
            });
            continue;
          }

          setUploadProgress(`Uploading ${file.name} to Cloud CDN (0%)...`);
          try {
            const cdnUrl = await uploadToCloudinary(file, (percent) => {
              setUploadProgress(`Uploading ${file.name}: ${percent}%...`);
            });
            newMediaItems.push(cdnUrl);
          } catch (cloudErr) {
            console.warn('Cloudinary upload notice:', cloudErr);
            if (file.size <= 1.2 * 1024 * 1024) {
              const videoData = await readFileAsDataUrl(file);
              newMediaItems.push(videoData);
            } else {
              setFeedback({
                type: 'error',
                message: `Failed to upload video "${file.name}" to CDN: ${cloudErr.message}. For large videos, check network connection or paste direct MP4 URL.`
              });
            }
          }
        } else {
          setFeedback({ type: 'error', message: `File "${file.name}" is not a supported image or video format.` });
        }
      }

      if (newMediaItems.length > 0) {
        const updatedGallery = [...currentGallery, ...newMediaItems].slice(0, 5);
        setActiveProject((prev) => ({
          ...prev,
          gallery: updatedGallery,
          coverImage: prev.coverImage || updatedGallery[0]
        }));
        setFeedback({ type: 'success', message: `Added ${newMediaItems.length} media item(s) successfully!` });
      }
    } catch (err) {
      console.error('File upload error:', err);
      setFeedback({ type: 'error', message: 'Failed to process media file: ' + err.message });
    } finally {
      setUploadingMedia(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!activeProject) return;

    setSaving(true);
    setFeedback(null);

    const docId = activeProject.id || `proj_${Date.now()}`;
    const payload = {
      ...activeProject,
      id: docId,
      gallery: (activeProject.gallery || []).slice(0, 5),
      updatedAt: new Date().toISOString()
    };

    try {
      if (db) {
        await setDoc(doc(db, 'projects', docId), payload, { merge: true });
      }

      setFeedback({ type: 'success', message: `Project "${payload.title}" saved live!` });
      setTimeout(() => {
        closeForm();
      }, 1200);
    } catch (err) {
      console.error('Error saving project:', err);
      setFeedback({ type: 'error', message: 'Failed to save project. ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = (id, title) => {
    setDeleteTarget({ id, title });
  };

  const executeDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (db) {
        await deleteDoc(doc(db, 'projects', deleteTarget.id));
      }
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
      if (activeProject?.id === deleteTarget.id) closeForm();
      setFeedback({ type: 'success', message: `Project "${deleteTarget.title}" deleted successfully.` });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
      setFeedback({ type: 'error', message: 'Failed to delete project: ' + err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Overview Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Briefcase className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Projects Portfolio Manager</h3>
              <p className="adm-card-subtitle">
                Add, edit, or delete projects. Each project can feature up to 5 images or videos.
              </p>
            </div>
          </div>
          <button type="button" onClick={openNewProjectForm} className="adm-btn-save-primary">
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        </div>

        {/* Project Edit Form Modal / Card */}
        {activeProject && (
          <div className="adm-item-card" style={{ background: '#ffffff', border: '2px solid var(--adm-amber)', padding: '24px', marginBottom: '28px' }}>
            <div className="adm-item-top">
              <strong style={{ fontSize: '18px', color: 'var(--adm-green-deep)' }}>
                {isEditingNew ? 'Create New Project' : `Edit: ${activeProject.title}`}
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

            <form onSubmit={handleSaveProject} className="adm-form-grid" style={{ marginTop: '16px' }}>
              <div className="adm-field">
                <label className="adm-label">Project Title</label>
                <input
                  type="text"
                  value={activeProject.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="adm-input"
                  required
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Subtitle / Focus</label>
                <input
                  type="text"
                  value={activeProject.subtitle || ''}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  className="adm-input"
                  placeholder="e.g. Flagship Medical Point of Sale System"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Category / Type</label>
                <select
                  value={activeProject.type || 'Web App'}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="adm-select"
                >
                  <option value="Web App">Web App</option>
                  <option value="AI System">AI System</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Design UI">Design UI</option>
                  <option value="Full-Stack">Full-Stack</option>
                </select>
              </div>

              <div className="adm-field">
                <label className="adm-label">Display Order Index</label>
                <input
                  type="number"
                  value={activeProject.displayOrder || 1}
                  onChange={(e) => handleFieldChange('displayOrder', parseInt(e.target.value) || 1)}
                  className="adm-input"
                />
              </div>

              <div className="adm-field adm-form-grid-full">
                <label className="adm-label">Tech Stack Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={activeProject.techStack || ''}
                  onChange={(e) => handleFieldChange('techStack', e.target.value)}
                  className="adm-input"
                  placeholder="React.js, Node.js, Express.js, Firebase, Tailwind CSS"
                />
              </div>

              <div className="adm-field adm-form-grid-full">
                <label className="adm-label">Short Description (Card Summary)</label>
                <textarea
                  value={activeProject.shortDesc || ''}
                  onChange={(e) => handleFieldChange('shortDesc', e.target.value)}
                  className="adm-textarea"
                  rows={2}
                />
              </div>

              <div className="adm-field adm-form-grid-full">
                <label className="adm-label">Full Case Study / Long Description</label>
                <textarea
                  value={activeProject.longDesc || ''}
                  onChange={(e) => handleFieldChange('longDesc', e.target.value)}
                  className="adm-textarea"
                  rows={4}
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">GitHub Repository URL</label>
                <input
                  type="url"
                  value={activeProject.githubUrl || ''}
                  onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                  className="adm-input"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Live Preview / Demo URL (Optional)</label>
                <input
                  type="url"
                  value={activeProject.liveUrl || ''}
                  onChange={(e) => handleFieldChange('liveUrl', e.target.value)}
                  className="adm-input"
                  placeholder="https://your-live-app.vercel.app"
                />
                <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block' }}>
                  Note: Website par "Live Preview" button sirf tabhi show hoga jab aap yahan valid URL paste karenge.
                </span>
              </div>

              {/* Media Gallery (Max 5 items) */}
              <div
                className="adm-field adm-form-grid-full"
                style={{
                  background: 'var(--adm-surface-alt)',
                  padding: '20px',
                  borderRadius: '14px',
                  border: '1.5px solid var(--adm-border)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div>
                    <label className="adm-label" style={{ fontSize: '13px' }}>
                      Project Media (Images &amp; Videos)
                    </label>
                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                      {activeProject.gallery?.length || 0} of 5 slots used • Item #1 is your primary showcase cover
                    </div>
                  </div>

                  <span
                    className="adm-badge-verified"
                    style={{
                      background: (activeProject.gallery?.length || 0) >= 5 ? '#fee2e2' : '#ffffff',
                      color: (activeProject.gallery?.length || 0) >= 5 ? '#b91c1c' : '#065f46',
                      border: '1px solid var(--adm-border)'
                    }}
                  >
                    {(activeProject.gallery?.length || 0) >= 5
                      ? 'Gallery Full (5/5)'
                      : `${5 - (activeProject.gallery?.length || 0)} slots remaining`}
                  </span>
                </div>

                {/* Existing Gallery Thumbnails Grid */}
                {(activeProject.gallery || []).length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '12px',
                      marginBottom: '18px'
                    }}
                  >
                    {(activeProject.gallery || []).map((mediaUrl, mIdx) => {
                      const isVideo =
                        mediaUrl.startsWith('data:video') ||
                        mediaUrl.endsWith('.mp4') ||
                        mediaUrl.includes('/video/');
                      const isCover = mIdx === 0;

                      return (
                        <div
                          key={mIdx}
                          style={{
                            position: 'relative',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: isCover
                              ? '2px solid var(--adm-amber)'
                              : '1.5px solid var(--adm-border)',
                            background: '#051c18',
                            height: '125px',
                            boxShadow: isCover ? '0 0 12px rgba(245, 166, 35, 0.35)' : 'none'
                          }}
                        >
                          {isVideo ? (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffb74d'
                              }}
                            >
                              <Film size={28} />
                              <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.85 }}>
                                Video Clip
                              </span>
                            </div>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={`Media #${mIdx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.src = '/projects/medcore.png';
                              }}
                            />
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeMediaFromGallery(mIdx)}
                            title="Remove media"
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              background: 'rgba(220, 38, 38, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              zIndex: 2
                            }}
                          >
                            <X size={14} />
                          </button>

                          {/* Set Cover Button (if not already cover) */}
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => setAsCoverImage(mIdx)}
                              title="Set as Main Cover Image"
                              style={{
                                position: 'absolute',
                                top: '6px',
                                left: '6px',
                                background: 'rgba(5, 28, 24, 0.85)',
                                color: '#f5a623',
                                border: '1px solid rgba(245, 166, 35, 0.5)',
                                borderRadius: '6px',
                                padding: '2px 7px',
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                cursor: 'pointer',
                                zIndex: 2
                              }}
                            >
                              <Star size={10} fill="#f5a623" />
                              <span>Set Cover</span>
                            </button>
                          )}

                          {/* Bottom Tag */}
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '6px',
                              left: '6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: isCover ? '#051c18' : '#fff',
                              background: isCover ? 'var(--adm-amber)' : 'rgba(0,0,0,0.68)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              letterSpacing: '0.3px',
                              zIndex: 2
                            }}
                          >
                            {isCover
                              ? '★ Primary Cover'
                              : `#${mIdx + 1} ${isVideo ? 'Video' : 'Image'}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload from Device + URL Fallback Controls (if slots available) */}
                {(activeProject.gallery || []).length < 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,video/mp4,video/webm"
                      multiple
                      onChange={handleDeviceFileUpload}
                      style={{ display: 'none' }}
                    />

                    {/* Device Upload Area */}
                    <div
                      onClick={() => !uploadingMedia && fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files?.length) {
                          handleDeviceFileUpload({ target: { files: e.dataTransfer.files } });
                        }
                      }}
                      style={{
                        border: isDragging ? '2px dashed var(--adm-amber)' : '2px dashed #8ed2ad',
                        backgroundColor: isDragging ? 'rgba(245, 166, 35, 0.08)' : '#ffffff',
                        borderRadius: '12px',
                        padding: '20px 18px',
                        textAlign: 'center',
                        cursor: uploadingMedia ? 'wait' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'rgba(45, 138, 120, 0.15)',
                          color: '#0e443a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {uploadingMedia ? (
                          <RefreshCw size={22} className="admin-spin-loader" />
                        ) : (
                          <Upload size={22} />
                        )}
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: 'var(--adm-green-deep)'
                          }}
                        >
                          {uploadingMedia
                            ? (uploadProgress || 'Processing & Uploading Selected Media...')
                            : 'Click to Browse & Upload from this Device'}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--adm-text-muted)',
                            marginTop: '2px'
                          }}
                        >
                          Select photos or videos from your computer / phone (PNG, JPG, WebP, MP4 — up to 50MB)
                        </div>
                      </div>
                    </div>

                    {/* Or Paste URL input */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        id="new-media-input"
                        placeholder="Or paste external Image / Video URL and press Add Media..."
                        className="adm-input"
                        style={{ height: '38px', fontSize: '13px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMediaToGallery(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('new-media-input');
                          if (el && el.value) {
                            addMediaToGallery(el.value);
                            el.value = '';
                          }
                        }}
                        className="adm-btn-secondary-sm"
                        style={{ flexShrink: 0 }}
                      >
                        <Plus size={14} />
                        <span>Add URL</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="adm-form-grid-full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeForm} className="adm-btn-secondary-sm">
                  Cancel
                </button>
                <button type="submit" className="adm-btn-save-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Project to Live Site'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Projects Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {projects.map((proj, idx) => (
            <div key={proj.id || idx} className="adm-item-card">
              <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#051c18', position: 'relative' }}>
                <img
                  src={proj.coverImage || (Array.isArray(proj.gallery) && proj.gallery[0]) || '/projects/medcore.png'}
                  alt={proj.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/projects/medcore.png'; }}
                />
                <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(5, 28, 24, 0.85)', color: '#ffb74d', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                  #{proj.displayOrder || idx + 1} &bull; {proj.type || 'Web App'}
                </span>
                <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0, 0, 0, 0.75)', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>
                  {Array.isArray(proj.gallery) ? proj.gallery.length : 1} media
                </span>
              </div>

              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', color: 'var(--adm-green-deep)', fontWeight: 700 }}>
                  {proj.title}
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: 'var(--adm-text-muted)', lineHeight: 1.4 }}>
                  {proj.subtitle}
                </p>
                <div style={{ fontSize: '11px', color: '#1e4a40', fontWeight: 600, background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--adm-border)' }}>
                  {proj.techStack || 'No tags'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--adm-border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="adm-btn-secondary-sm" style={{ padding: '4px 8px' }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => openEditProject(proj)} className="adm-btn-secondary-sm">
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button type="button" onClick={() => handleDeleteProject(proj.id, proj.title)} className="adm-btn-danger-sm">
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Project Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Project Showcase"
        message={
          <span>
            Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>? This will remove all associated media previews and links from your portfolio.
          </span>
        }
        confirmText="Yes, Delete Project"
        cancelText="Cancel"
        confirmVariant="danger"
        iconType="delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={executeDeleteProject}
      />
    </div>
  );
}

