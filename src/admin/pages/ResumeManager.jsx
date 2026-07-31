import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileDown,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadFileToCloudinary } from '../services/cloudinary';
import './ResumeManager.css';

const DEFAULT_RESUME = {
  filename: 'Usman_Resume.pdf',
  version: 'v2.4',
  size: '1.24 MB',
  updatedAt: 'July 28, 2026',
  downloadCount: 142,
  status: 'Active',
  resumeFileUrl: '/resume.pdf',
};

export default function ResumeManager() {
  const [resumeData, setResumeData] = useState({ ...DEFAULT_RESUME });
  const [initialResumeData, setInitialResumeData] = useState({ ...DEFAULT_RESUME });
  const [hasFile, setHasFile] = useState(true);
  const [initialHasFile, setInitialHasFile] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  // Modal forms & upload binding
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newVersionInput, setNewVersionInput] = useState('v2.5');
  const [newFilenameInput, setNewFilenameInput] = useState('Usman_Resume_v2.5.pdf');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Deletion confirmations
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'resume', 'singleton'));
          if (snap.exists()) {
            const data = snap.data();
            setResumeData(data);
            setInitialResumeData(data);
            setHasFile(!!data.resumeFileUrl);
            setInitialHasFile(!!data.resumeFileUrl);
          }
        }
      } catch (e) {
        console.warn('Failed fetching Resume metadata:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty =
      JSON.stringify(resumeData) !== JSON.stringify(initialResumeData) ||
      hasFile !== initialHasFile;
    setIsDirty(dirty);
  }, [resumeData, initialResumeData, hasFile, initialHasFile]);

  // Prompt before unload
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

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        const payload = {
          ...resumeData,
          status: hasFile ? 'Active' : 'Archived',
          resumeFileUrl: hasFile ? resumeData.resumeFileUrl : '',
        };
        await setDoc(doc(db, 'resume', 'singleton'), payload);
      }
      setInitialResumeData({ ...resumeData });
      setInitialHasFile(hasFile);
      setIsDirty(false);
      setSaveStatus('success');
    } catch (e) {
      console.error('Error writing Resume config:', e);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset resume settings to template state? (Requires save to commit)')) {
      setResumeData({ ...DEFAULT_RESUME });
      setHasFile(true);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard all unsaved changes?')) {
        setResumeData({ ...initialResumeData });
        setHasFile(initialHasFile);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewFilenameInput(file.name);
    }
  };

  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      alert('Please select a PDF document file to upload first.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFileToCloudinary(selectedFile);
      
      const newSize = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';
      const updated = {
        filename: newFilenameInput.trim(),
        version: newVersionInput.trim(),
        size: newSize,
        updatedAt: new Date().toLocaleDateString(),
        downloadCount: resumeData.downloadCount,
        status: 'Active',
        resumeFileUrl: url,
      };

      setResumeData(updated);
      setHasFile(true);
      setUploadModalOpen(false);
      
      // Auto-save CV record
      if (db) {
        await setDoc(doc(db, 'resume', 'singleton'), updated);
      }
      setSelectedFile(null);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setHasFile(false);
    setDeleteDialogOpen(false);
    if (db) {
      await setDoc(doc(db, 'resume', 'singleton'), {
        ...resumeData,
        status: 'Archived',
        resumeFileUrl: '',
      });
    }
  };

  return (
    <div className="resume-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="Resume Manager"
          description="Configure your active CV PDF file path, track developer downloads, and upload updated versions."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
                <RotateCcw size={16} /> Reset
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} disabled={!hasFile}>
                <Save size={16} /> Save Settings
              </Button>
            </>
          }
        />

        {saveStatus === 'success' && (
          <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✓ Resume settings saved successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving resume settings.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save Settings to update.</span>
          </div>
        )}

        <div className="resume-layout-grid">
          {/* Main settings form */}
          <div className="resume-main-column">
            <SectionCard title="Active CV Details" description="Information regarding the compiled file.">
              {!hasFile ? (
                <div className="resume-empty-panel">
                  <AlertCircle size={32} className="empty-warn-icon" />
                  <h3>No Active Resume Found</h3>
                  <p>Upload a PDF resume to enable portfolio download options.</p>
                  <Button type="button" onClick={() => setUploadModalOpen(true)}>
                    <Upload size={16} /> Upload Resume
                  </Button>
                </div>
              ) : (
                <div className="resume-active-panel">
                  <div className="resume-file-icon-box">
                    <FileText size={36} />
                  </div>

                  <div className="resume-file-metadata">
                    <div className="file-name-row">
                      <span className="file-name-text">{resumeData.filename}</span>
                      <span className="file-version-tag">{resumeData.version}</span>
                    </div>

                    <div className="file-details-row">
                      <span>Size: {resumeData.size}</span>
                      <span className="bullet-divider">•</span>
                      <span>Uploaded: {resumeData.updatedAt}</span>
                    </div>
                  </div>

                  <div className="resume-panel-actions">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadModalOpen(true)}>
                      <Upload size={14} /> Replace
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              )}

              {hasFile && (
                <div className="resume-inputs-stack">
                  <div className="form-row-2">
                    <Input
                      id="filename"
                      label="Download Filename"
                      value={resumeData.filename}
                      onChange={(e) => setResumeData((p) => ({ ...p, filename: e.target.value }))}
                    />

                    <Select
                      id="status"
                      label="Availability Status"
                      value={resumeData.status}
                      onChange={(e) => setResumeData((p) => ({ ...p, status: e.target.value }))}
                      options={[
                        { value: 'Active', label: 'Active & Downloadable' },
                        { value: 'Inactive', label: 'Hidden / Disabled' },
                      ]}
                    />
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Download Analytics" description="Usage logs recorded from site visitors.">
              <div className="resume-stats-row">
                <div className="resume-stat-box">
                  <span className="stat-box-label">Total Downloads</span>
                  <div className="stat-box-val-row">
                    <FileDown size={20} className="stat-box-icon" />
                    <span className="stat-box-number">{resumeData.downloadCount}</span>
                  </div>
                </div>

                <div className="resume-stat-box">
                  <span className="stat-box-label">File Type</span>
                  <div className="stat-box-val-row">
                    <FileText size={20} className="stat-box-icon text-red-400" />
                    <span className="stat-box-number">PDF</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Interactive Preview simulation side column */}
          <div className="resume-side-column">
            <SectionCard title="Document Interactive Preview" description="Simulation of client PDF iframe viewport.">
              <div className="resume-preview-viewport">
                {!hasFile ? (
                  <div className="preview-blank">Preview Unavailable</div>
                ) : (
                  <div className="preview-document-mock">
                    <div className="mock-doc-header">
                      <div className="mock-doc-logo">MU</div>
                      <div className="mock-doc-meta">
                        <span className="mock-doc-name">Muhammad Usman</span>
                        <span className="mock-doc-title">Software Engineer CV</span>
                      </div>
                    </div>

                    <div className="mock-doc-body">
                      <div className="mock-doc-line title" />
                      <div className="mock-doc-line text" />
                      <div className="mock-doc-line text" />
                      <div className="mock-doc-line text half" />
                      <div className="mock-doc-line title mt-4" />
                      <div className="mock-doc-line text" />
                      <div className="mock-doc-line text half" />
                    </div>

                    <div className="mock-doc-watermark">
                      <CheckCircle size={12} /> Staged in Live Cache
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </form>

      {/* -------------------------------------------------------------
          MODALS & DIALOGS
          ------------------------------------------------------------- */}

      {/* Upload/Replace Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Resume Version"
        footer={
          <>
             <Button variant="ghost" onClick={() => setUploadModalOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUploadSubmit} isLoading={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="resume-upload-form">
          <input
            type="file"
            id="cvFileInput"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            className="upload-drag-area"
            onClick={() => document.getElementById('cvFileInput').click()}
            style={{ cursor: 'pointer' }}
          >
            <Upload size={32} className="upload-icon" />
            <span className="upload-text">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to choose file from disk'}
            </span>
            <span className="upload-subtext">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Only PDF documents supported'}
            </span>
          </div>

          <div className="form-row-2">
            <Input
              id="newVersion"
              label="Version Tag"
              placeholder="e.g. v2.5"
              value={newVersionInput}
              onChange={(e) => setNewVersionInput(e.target.value)}
            />

            <Input
              id="newFilename"
              label="Download Filename"
              placeholder="Usman_Resume_v2.5.pdf"
              value={newFilenameInput}
              onChange={(e) => setNewFilenameInput(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Resume Document?"
        message="This action will delete the active resume file. The site header 'Resume' download options will be disabled."
      />
    </div>
  );
}
