import React from 'react';
import './shared.css';

export default function GlassCard({
  children,
  className = '',
  ...props
}) {
  return (
    <div className={`admin-card ${className}`} {...props}>
      {children}
    </div>
  );
}
