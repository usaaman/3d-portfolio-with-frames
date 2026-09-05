import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Sparkles,
  Link2,
  RotateCcw,
  Clock,
  Check
} from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ConfirmModal from '../components/ConfirmModal';

export default function ResumeManager() {
  const [resumeData, setResumeData] = useState({
    filename: '',
    resumeFileUrl: '',
    size: '',
    updatedAt: '',
    downloadCount: 0,
    status: 'Inactive'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingCount, setResettingCount] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetCountModal, setShowResetCountModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [directUrlInput, setDirectUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // 1. Real-time stream from Firestore `resume/singleton`
  useEffect(() => {
    if (!db) {
      // Local storage fallback
      try {
        const cached = localStorage.getItem('portfolio_cache_resume');
        if (cached) {
          const parsed = JSON.parse(cached);
          setResumeData(parsed);
          setDirectUrlInput(parsed.resumeFileUrl || '');
        }
      } catch {}
      setLoading(false);
      return;
    }

    try {
      const unsub = onSnapshot(doc(db, 'resume', 'singleton'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setResumeData({
            filename: data.filename || 'Muhammad_Usman_Resume.pdf',
            resumeFileUrl: data.resumeFileUrl || '',
            size: data.size || '—',
            updatedAt: data.updatedAt || 'Recent',
            downloadCount: typeof data.downloadCount === 'number' ? data.downloadCount : 0,
            status: data.resumeFileUrl ? 'Active' : 'Inactive'
          });
          setDirectUrlInput(data.resumeFileUrl || '');
        } else {
          setResumeData({
            filename: '',
            resumeFileUrl: '',
            size: '',
            updatedAt: '',
            downloadCount: 0,
            status: 'Inactive'
          });
        }
        setLoading(false);
      }, (err) => {
        console.warn('Resume Firestore stream notice:', err);
        setLoading(false);
      });

      return () => unsub();
    } catch (err) {
      console.warn('Error setting up resume stream:', err);
      setLoading(false);
    }
  }, []);

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // 2. Handle PDF File Upload directly from Device
  const handleDevicePdfUpload = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showNotification('error', 'Please select a valid PDF document (.pdf).');
      return;
    }

    // Firestore has a 1MB limit for individual documents. Base64 adds ~33% overhead.
    // 750KB binary file translates to ~1MB base64 data URL.
    if (file.size > 750 * 1024) {
      const mbSize = (file.size / (1024 * 1024)).toFixed(2);
      showNotification(
        'error',
        `File is ${mbSize} MB. Direct device embed requires a PDF under 750 KB. Please compress your PDF or paste a hosted URL below.`
      );
      return;
    }

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setSaving(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      const todayDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const updatedDoc = {
        filename: file.name,
        resumeFileUrl: dataUrl,
        size: formattedSize,
        updatedAt: todayDate,
        downloadCount: resumeData.downloadCount || 0,
        status: 'Active'
      };

      try {
        if (db) {
          await setDoc(doc(db, 'resume', 'singleton'), updatedDoc, { merge: true });
        }
        try {
          localStorage.setItem('portfolio_cache_resume', JSON.stringify(updatedDoc));
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'portfolio_cache_resume',
            newValue: JSON.stringify(updatedDoc)
          }));
        } catch {}

        setResumeData(updatedDoc);
        setDirectUrlInput(dataUrl);
        showNotification('success', `PDF "${file.name}" uploaded live! Visitors can now download this resume.`);
      } catch (err) {
        console.error('Error saving PDF:', err);
        showNotification('error', 'Failed to save PDF to database: ' + err.message);
      } finally {
        setSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      showNotification('error', 'Error reading PDF file from your device.');
      setSaving(false);
    };
    reader.readAsDataURL(file);
  };

  // 3. Handle External / Public URL Save
  const handleSaveUrl = async (e) => {
    e.preventDefault();
    const cleanUrl = directUrlInput.trim();
    if (!cleanUrl) {
      showNotification('error', 'Please enter a valid PDF URL or upload a file from your device.');
      return;
    }

    setSaving(true);
    const todayDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const parsedFilename = cleanUrl.split('/').pop()?.split('?')[0] || 'Resume.pdf';

    const updatedDoc = {
      ...resumeData,
      filename: resumeData.filename || parsedFilename,
      resumeFileUrl: cleanUrl,
      updatedAt: todayDate,
      status: 'Active'
    };

    try {
      if (db) {
        await setDoc(doc(db, 'resume', 'singleton'), updatedDoc, { merge: true });
      }
      try {
        localStorage.setItem('portfolio_cache_resume', JSON.stringify(updatedDoc));
      } catch {}

      setResumeData(updatedDoc);
      showNotification('success', `Resume URL published live! Portfolio download buttons are synced.`);
    } catch (err) {
      console.error('Error updating resume URL:', err);
      showNotification('error', 'Failed to save URL: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 4. Delete Resume with Confirmation
  const executeDeleteResume = async () => {
    setDeleting(true);
    try {
      const clearedDoc = {
        filename: '',
        resumeFileUrl: '',
        size: '',
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        downloadCount: resumeData.downloadCount || 0,
        status: 'Inactive'
      };

      if (db) {
        await setDoc(doc(db, 'resume', 'singleton'), clearedDoc);
      }
      try {
        localStorage.setItem('portfolio_cache_resume', JSON.stringify(clearedDoc));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'portfolio_cache_resume',
          newValue: JSON.stringify(clearedDoc)
        }));
      } catch {}

      setResumeData(clearedDoc);
      setDirectUrlInput('');
      setShowDeleteModal(false);
      showNotification('success', 'Resume removed successfully! You can now upload a new PDF below.');
    } catch (err) {
      console.error('Failed to delete resume:', err);
      showNotification('error', 'Failed to delete resume: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // 5. Reset Real-Time Download Count
  const executeResetCount = async () => {
    setResettingCount(true);
    try {
      if (db) {
        await updateDoc(doc(db, 'resume', 'singleton'), {
          downloadCount: 0
        });
      }
      setResumeData((prev) => ({ ...prev, downloadCount: 0 }));
      setShowResetCountModal(false);
      showNotification('success', 'Real-time download counter reset to 0.');
    } catch (err) {
      console.error('Failed to reset count:', err);
      showNotification('error', 'Failed to reset count: ' + err.message);
    } finally {
      setResettingCount(false);
    }
  };

  const handlePreviewPdf = () => {
    if (!resumeData.resumeFileUrl) return;
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${resumeData.resumeFileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    } else {
      window.open(resumeData.resumeFileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="adm-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <RefreshCw size={24} className="admin-spin-loader" style={{ margin: '0 auto', color: 'var(--adm-green-deep)' }} />
        <p style={{ marginTop: '14px', color: 'var(--adm-text-sub)', fontSize: '14px' }}>
          Loading live resume telemetry...
        </p>
      </div>
    );
  }

  const hasActiveResume = Boolean(resumeData.resumeFileUrl);

  return (
    <div>
      <div className="adm-card">
        {/* Card Header */}
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <FileText className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Resume &amp; CV Manager</h3>
              <p className="adm-card-subtitle">
                Upload your PDF resume from your device. Synchronized live with all portfolio download buttons.
              </p>
            </div>
          </div>

          <div>
            {hasActiveResume ? (
              <span className="adm-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span>Live on Portfolio</span>
              </span>
            ) : (
              <span
                className="adm-badge-verified"
                style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
              >
                No Resume Active
              </span>
            )}
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`adm-toast-banner ${feedback.type === 'success' ? 'adm-toast-success' : 'adm-toast-error'}`}
            style={{ marginBottom: '20px' }}
          >
            {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* =========================================================
            ACTIVE RESUME & REAL-TIME TELEMETRY CARD
            ========================================================= */}
        {hasActiveResume ? (
          <div
            className="adm-item-card"
            style={{
              background: '#ffffff',
              border: '2px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 4px 16px rgba(5, 28, 24, 0.04)',
              padding: '22px 24px',
              marginBottom: '28px',
              borderRadius: '14px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid var(--adm-border)',
                paddingBottom: '16px'
              }}
            >
              {/* Document Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(5, 28, 24, 0.06)',
                    color: 'var(--adm-green-deep)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <FileText size={26} color="#051c18" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: 'var(--adm-green-deep)' }}>
                    {resumeData.filename || 'Usman_Resume.pdf'}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {resumeData.size && <span>Size: <strong>{resumeData.size}</strong></span>}
                    {resumeData.updatedAt && <span>• Updated: {resumeData.updatedAt}</span>}
                  </div>
                </div>
              </div>

              {/* Real-time Download Telemetry Box */}
              <div
                style={{
                  background: 'var(--adm-surface-alt)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Real-Time Downloads
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--adm-green-deep)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{resumeData.downloadCount || 0}</span>
                    <span
                      title="Real-Time Telemetry Stream Connected"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        display: 'inline-block'
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetCountModal(true)}
                  title="Reset download count to 0"
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px'
                  }}
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePreviewPdf}
                  className="adm-btn-secondary-sm"
                  style={{ padding: '7px 14px', fontSize: '13px' }}
                >
                  <Eye size={15} />
                  <span>Preview PDF</span>
                </button>

                <a
                  href={resumeData.resumeFileUrl}
                  download={resumeData.filename || 'Muhammad_Usman_Resume.pdf'}
                  className="adm-btn-secondary-sm"
                  style={{ padding: '7px 14px', fontSize: '13px', textDecoration: 'none' }}
                >
                  <Download size={15} />
                  <span>Test Download</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="adm-btn-danger-sm"
                style={{ padding: '7px 14px', fontSize: '13px' }}
              >
                <Trash2 size={15} />
                <span>Delete Active Resume</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              background: '#fef3c7',
              border: '1.5px solid #fde68a',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              color: '#92400e'
            }}
          >
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>
              <strong>No Resume Active:</strong> Download buttons on your portfolio are currently hidden. Upload a new PDF below to re-enable instant downloads for visitors and recruiters.
            </div>
          </div>
        )}

        {/* =========================================================
            UPLOAD NEW PDF SECTION (Device Drag & Drop + URL)
            ========================================================= */}
        <div
          style={{
            background: 'var(--adm-surface-alt)',
            padding: '24px',
            borderRadius: '14px',
            border: '1.5px solid var(--adm-border)'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--adm-green-deep)', fontWeight: 700 }}>
              {hasActiveResume ? 'Replace with New PDF Document' : 'Upload Resume PDF'}
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--adm-text-muted)' }}>
              Select a PDF document from your computer or phone (max 750 KB for direct embed), or paste a hosted URL.
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleDevicePdfUpload(file);
            }}
            style={{ display: 'none' }}
          />

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => !saving && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleDevicePdfUpload(file);
            }}
            style={{
              border: isDragging ? '2px dashed var(--adm-amber)' : '2px dashed #8ed2ad',
              backgroundColor: isDragging ? 'rgba(245, 166, 35, 0.08)' : '#ffffff',
              borderRadius: '12px',
              padding: '28px 20px',
              textAlign: 'center',
              cursor: saving ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(45, 138, 120, 0.15)',
                color: '#0e443a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {saving ? (
                <RefreshCw size={24} className="admin-spin-loader" />
              ) : (
                <Upload size={24} />
              )}
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--adm-green-deep)' }}>
                {saving ? 'Processing and Publishing PDF...' : 'Click to Browse or Drag & Drop PDF Resume'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginTop: '3px' }}>
                Select a .pdf document from your computer or phone
              </div>
            </div>
          </div>

          {/* Secondary Direct Public URL Option */}
          <form onSubmit={handleSaveUrl} style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--adm-green-deep)', marginBottom: '6px' }}>
              Or Enter Direct Hosted PDF Link:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={directUrlInput}
                onChange={(e) => setDirectUrlInput(e.target.value)}
                placeholder="https://example.com/my-resume.pdf or Google Drive / Cloudinary direct link"
                className="adm-input"
                style={{ height: '40px', fontSize: '13px' }}
              />
              <button
                type="submit"
                disabled={saving || !directUrlInput.trim()}
                className="adm-btn-save-primary"
                style={{ flexShrink: 0, height: '40px' }}
              >
                <CheckCircle size={15} />
                <span>Publish URL</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Resume Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Active Resume PDF"
        message={
          <span>
            Are you sure you want to delete the active resume <strong>"{resumeData.filename || 'Resume'}"</strong>? The resume download buttons on your portfolio will be hidden until you upload a new PDF.
          </span>
        }
        confirmText="Yes, Delete Resume"
        cancelText="Cancel"
        confirmVariant="danger"
        iconType="delete"
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={executeDeleteResume}
      />

      {/* Reset Download Count Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetCountModal}
        title="Reset Real-Time Download Counter"
        message="Are you sure you want to reset the live resume download counter back to 0? New visitor downloads will be tracked fresh from 0."
        confirmText="Yes, Reset Counter"
        cancelText="Cancel"
        confirmVariant="warning"
        iconType="warning"
        loading={resettingCount}
        onCancel={() => setShowResetCountModal(false)}
        onConfirm={executeResetCount}
      />
    </div>
  );
}
