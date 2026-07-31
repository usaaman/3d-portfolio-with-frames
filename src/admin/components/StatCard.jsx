import React from 'react';
import GlassCard from '../shared/GlassCard';
import './StatCard.css';

export default function StatCard({
  icon: Icon,
  title,
  value,
  comparisonLabel,
  comparisonType = 'success', // 'success' | 'warning' | 'default'
  comparisonBadgeText,
  onClick,
  className = '',
}) {
  return (
    <GlassCard className={`admin-stat-card ${onClick ? 'is-clickable' : ''} ${className}`} onClick={onClick}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-container" aria-hidden="true">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {(comparisonBadgeText || comparisonLabel) && (
          <div className="stat-card-comparison">
            {comparisonBadgeText && (
              <span className={`comparison-badge badge-${comparisonType}`}>
                {comparisonBadgeText}
              </span>
            )}
            {comparisonLabel && (
              <span className="comparison-label">{comparisonLabel}</span>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
