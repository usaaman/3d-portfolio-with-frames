import React from 'react';
import GlassCard from '../shared/GlassCard';
import './SectionCard.css';

export default function SectionCard({
  title,
  description,
  children,
  className = '',
  ...props
}) {
  return (
    <GlassCard className={`admin-section-card ${className}`} {...props}>
      {(title || description) && (
        <div className="section-card-header">
          {title && <h2 className="section-card-title">{title}</h2>}
          {description && <p className="section-card-description">{description}</p>}
        </div>
      )}

      <div className="section-card-body">
        {children}
      </div>
    </GlassCard>
  );
}
