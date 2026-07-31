import React from 'react';
import './PageHeader.css';

export default function PageHeader({
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`admin-page-header ${className}`}>
      <div className="header-text-group">
        <h1 className="header-title">{title}</h1>
        {description && <p className="header-description">{description}</p>}
      </div>

      {actions && (
        <div className="header-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
