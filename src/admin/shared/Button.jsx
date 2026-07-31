import React from 'react';
import './shared.css';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`admin-btn admin-btn-${variant} admin-btn-${size} ${isLoading ? 'is-loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="admin-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
        </svg>
      )}
      <span className="btn-content">{children}</span>
    </button>
  );
}
