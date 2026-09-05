import React, { useEffect } from 'react';
import { AlertTriangle, LogOut, Trash2, X } from 'lucide-react';
import './ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  title = 'Please Confirm',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  iconType = 'danger', // 'danger' | 'logout' | 'delete' | 'warning'
  onConfirm,
  onCancel,
  loading = false
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (iconType) {
      case 'logout':
        return <LogOut size={26} className="adm-confirm-icon adm-confirm-icon-logout" />;
      case 'delete':
        return <Trash2 size={26} className="adm-confirm-icon adm-confirm-icon-danger" />;
      case 'warning':
        return <AlertTriangle size={26} className="adm-confirm-icon adm-confirm-icon-warning" />;
      case 'danger':
      default:
        return <AlertTriangle size={26} className="adm-confirm-icon adm-confirm-icon-danger" />;
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={() => !loading && onCancel()}>
      <div
        className="adm-confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-confirm-title"
      >
        <button
          className="adm-confirm-close-btn"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="adm-confirm-body">
          <div className={`adm-confirm-icon-wrapper adm-confirm-icon-${iconType}`}>
            {renderIcon()}
          </div>

          <div className="adm-confirm-content">
            <h3 id="adm-confirm-title" className="adm-confirm-title">
              {title}
            </h3>
            <div className="adm-confirm-message">
              {message}
            </div>
          </div>
        </div>

        <div className="adm-confirm-actions">
          <button
            type="button"
            className="adm-confirm-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`adm-confirm-btn-confirm adm-confirm-btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
