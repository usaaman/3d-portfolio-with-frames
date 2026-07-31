import React from 'react';
import './shared.css';

export default function Select({
  label,
  id,
  options = [], // [{value: '', label: ''}]
  error,
  helperText,
  className = '',
  ...props
}) {
  return (
    <div className={`admin-field ${className}`}>
      {label && <label htmlFor={id} className="admin-label">{label}</label>}
      <select
        id={id}
        className={`admin-select ${error ? 'is-invalid' : ''}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="admin-field-error">{error}</span>}
      {helperText && !error && <span className="admin-field-helper">{helperText}</span>}
    </div>
  );
}
