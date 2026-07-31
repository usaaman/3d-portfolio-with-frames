import React from 'react';
import './shared.css';

export default function Input({
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
      <input
        id={id}
        className={`admin-input ${error ? 'is-invalid' : ''}`}
        {...props}
      />
      {error && <span className="admin-field-error">{error}</span>}
      {helperText && !error && <span className="admin-field-helper">{helperText}</span>}
    </div>
  );
}
