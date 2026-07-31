import React from 'react';
import './shared.css';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  phaseInfo = 'Available in Phase 02 / Phase 03',
  className = '',
}) {
  return (
    <div className={`admin-card flex flex-col items-center justify-center text-center py-20 px-8 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(101, 214, 255, 0.1)', border: '1px solid rgba(101, 214, 255, 0.25)', color: 'var(--ds-color-accent-secondary)' }}>
          <Icon size={28} />
        </div>
      )}
      <h2 className="text-xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--ds-font-display)' }}>
        {title}
      </h2>
      <p className="max-w-md text-sm text-gray-400 mb-6 leading-relaxed" style={{ color: 'var(--ds-color-text-secondary)' }}>
        {description}
      </p>
      <span className="text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--ds-color-text-muted)', border: '1px solid var(--ds-glass-border)' }}>
        {phaseInfo}
      </span>
    </div>
  );
}
