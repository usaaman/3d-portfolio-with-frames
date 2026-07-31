import React from 'react';
import './shared.css';

export default function Textarea({
  label,
  id,
  error,
  helperText,
  className = '',
  ...props
}) {
  return (
    <div className={`admin-field ${className}`}>
      {label && <label htmlFor={id} className="admin-label">{label}</label>}
      <textarea
        id={id}
        className={`admin-textarea ${error ? 'is-invalid' : ''}`}
        {...props}
      />
      {error && <span className="admin-field-error">{error}</span>}
      {helperText && !error && <span className="admin-field-helper">{helperText}</span>}
    </div>
  );
}
