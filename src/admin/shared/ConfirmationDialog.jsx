import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isConfirming = false,
  variant = 'danger', // 'danger' | 'warning' | 'primary'
}) {
  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={onConfirm} isLoading={isConfirming}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <p className="text-sm text-gray-300" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 'var(--ds-line-height-body)' }}>
        {message}
      </p>
    </Modal>
  );
}
