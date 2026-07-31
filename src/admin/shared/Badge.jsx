import React from 'react';
import './shared.css';

export default function Badge({
  children,
  variant = 'default', // 'default' | 'primary' | 'success' | 'warning'
  className = '',
}) {
  return (
    <span className={`admin-badge admin-badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
