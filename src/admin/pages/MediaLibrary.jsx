import React, { useState, useMemo, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  Grid,
  List,
  Copy,
  Check,
  Eye,
  FileText,
  FolderOpen,
  Info,
  Trash2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Button from '../shared/Button';
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
} from 'firebase/firestore';
import { uploadFileToCloudinary } from '../services/cloudinary';
import './MediaLibrary.css';

// Default media templates are seeded via Database settings

const FOLDERS = ['All', 'Project Images', 'Character Assets', 'Icons', 'Documents'];

export default function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState([]);
  const [activeFolder, setActiveFolder] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Clipboard copies
  const [copiedId, setCopiedId] = useState(null);

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const triggerDelete = (item) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'media', deleteTarget.id));
      }
      setMediaItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    } catch (e) {
      alert(`Deletion failed: ${e.message}`);
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'media'));
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMediaItems(list);
      }
    } catch (e) {
      console.warn('Failed fetching media list:', e);
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFileToCloudinary(file);
      
      const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('video') ? 'video' : 'image';
      const folderName = activeFolder === 'All' ? (fileType === 'pdf' ? 'Documents' : 'Project Images') : activeFolder;
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      
      const docId = `m-${Date.now()}`;
      const payload = {
        name: file.name,
        folder: folderName,
        size: sizeStr,
        resolution: fileType === 'image' ? '1280x720' : '—', // simulated native dimensions
        path: url,
        type: fileType,
      };

      if (db) {
        await setDoc(doc(db, 'media', docId), payload);
      }

      setMediaItems((prev) => [...prev, { id: docId, ...payload }]);
      alert('Asset uploaded successfully!');
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesFolder = activeFolder === 'All' || item.folder === activeFolder;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesFolder && matchesSearch;
    });
  }, [mediaItems, activeFolder, search]);

  const copyPath = (item) => {
    navigator.clipboard.writeText(item.path);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openLightbox = (item) => {
    setActiveAsset(item);
    setLightboxOpen(true);
  };

  return (
    <div className="media-library-container">
      <PageHeader
        title="Media Library"
        description="Browse project screenshots, vector icons, avatar models, and resume documents."
        actions={
          <>
            <input
              type="file"
              id="libraryFileInput"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              onClick={() => document.getElementById('libraryFileInput').click()}
              isLoading={isUploading}
            >
              <ImageIcon size={16} /> {isUploading ? 'Uploading...' : 'Upload New File'}
            </Button>
          </>
        }
      />

      {/* Media Toolbar controls */}
      <div className="media-toolbar-card">
        {/* Navigation folder selector */}
        <div className="media-folders-list">
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              type="button"
              className={`folder-tab-btn ${activeFolder === folder ? 'is-active' : ''}`}
              onClick={() => setActiveFolder(folder)}
            >
              {folder}
            </button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="media-toolbar-actions">
          <div className="toolbar-search-input">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="view-mode-buttons">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Assets display card */}
      <SectionCard title="Assets Inventory" description="Explore assets currently hosted in live storage.">
        {loading ? (
          <div className="media-empty-panel">
            <FolderOpen size={36} />
            <p>Loading media cache...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="media-empty-panel">
            <FolderOpen size={36} />
            <p>No media files match your query.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View layout */
          <div className="media-grid-viewport">
            {filteredMedia.map((item) => (
              <div key={item.id} className="media-asset-card">
                <div className="asset-card-preview" onClick={() => openLightbox(item)}>
                  {item.type === 'pdf' ? (
                    <div className="asset-doc-mock-preview">
                      <FileText size={32} />
                    </div>
                  ) : (
                    <img src={item.path} alt={item.name} onError={(e) => { e.target.src = '/frames/frame-138.webp'; }} />
                  )}
                  <div className="asset-card-overlay">
                    <button
                      type="button"
                      className="asset-overlay-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(item);
                      }}
                      title="Inspect Asset"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </div>

                <div className="asset-card-meta">
                  <span className="asset-meta-name" title={item.name}>{item.name}</span>
                  <span className="asset-meta-details">{item.resolution !== '—' ? `${item.resolution} • ` : ''}{item.size}</span>
                </div>

                <div className="asset-card-actions" style={{ display: 'flex', gap: '4px', width: '100%' }}>
                  <Badge variant="default" className="asset-folder-badge" style={{ flexShrink: 0 }}>{item.folder}</Badge>
                  <Button type="button" variant="ghost" size="sm" onClick={() => copyPath(item)} className="asset-copy-btn" style={{ flexGrow: 1 }}>
                    {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === item.id ? 'Copied' : 'Copy Path'}
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => triggerDelete(item)} style={{ padding: '0 8px', minWidth: '32px' }} title="Delete Asset">
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View layout */
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Preview</th>
                  <th>Filename</th>
                  <th>Folder</th>
                  <th>Size</th>
                  <th>Resolution</th>
                  <th>Asset Path</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="media-list-preview-box" onClick={() => openLightbox(item)}>
                        {item.type === 'pdf' ? (
                          <FileText size={18} />
                        ) : (
                          <img src={item.path} alt="" onError={(e) => { e.target.src = '/frames/frame-138.webp'; }} />
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="asset-list-name-text">{item.name}</span>
                    </td>
                    <td>
                      <Badge variant="default">{item.folder}</Badge>
                    </td>
                    <td>{item.size}</td>
                    <td>{item.resolution}</td>
                    <td>
                      <code className="asset-list-path-code">{item.path}</code>
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => openLightbox(item)}
                          title="Inspect Details"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => copyPath(item)}
                          title="Copy Link Path"
                        >
                          {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => triggerDelete(item)}
                          title="Delete Asset"
                          style={{ color: 'var(--ds-color-danger, #ef4444)' }}
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
      </SectionCard>

      {/* -------------------------------------------------------------
          LIGHTBOX MODAL
          ------------------------------------------------------------- */}
      <Modal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title="Inspect Asset Details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLightboxOpen(false)}>
              Close Panel
            </Button>
            <Button onClick={() => copyPath(activeAsset)}>
              {activeAsset && copiedId === activeAsset.id ? <Check size={14} /> : <Copy size={14} />}
              {activeAsset && copiedId === activeAsset.id ? 'Copied path' : 'Copy Asset Link'}
            </Button>
          </>
        }
      >
        {activeAsset && (
          <div className="lightbox-asset-grid">
            <div className="lightbox-preview-column">
              {activeAsset.type === 'pdf' ? (
                <div className="lightbox-pdf-preview">
                  <FileText size={64} />
                  <span>PDF Document</span>
                </div>
              ) : (
                <div className="lightbox-img-preview">
                  <img src={activeAsset.path} alt="" onError={(e) => { e.target.src = '/frames/frame-138.webp'; }} />
                </div>
              )}
            </div>

            <div className="lightbox-details-column">
              <div className="detail-item">
                <span className="detail-item-label">Filename</span>
                <span className="detail-item-value">{activeAsset.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Directory Folder</span>
                <span className="detail-item-value">{activeAsset.folder}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">File Size</span>
                <span className="detail-item-value">{activeAsset.size}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Canvas Dimensions</span>
                <span className="detail-item-value">{activeAsset.resolution}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Virtual Link Path</span>
                <code className="detail-item-code-path">{activeAsset.path}</code>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Media Asset?"
        message={`Are you sure you want to permanently delete the asset "${deleteTarget?.name}"? This action will remove it from the index and cannot be undone.`}
        confirmText="Delete Asset"
        type="danger"
      />
    </div>
  );
}
