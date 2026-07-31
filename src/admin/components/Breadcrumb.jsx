import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './Breadcrumb.css';

const BREADCRUMB_MAP = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  hero: 'Hero Manager',
  about: 'About Manager',
  skills: 'Skills Manager',
  projects: 'Projects',
  services: 'Services',
  resume: 'Resume',
  socials: 'Social Links',
  messages: 'Contact Messages',
  'ai-conversations': 'AI Agent Chat',
  'knowledge-base': 'Knowledge Base',
  seo: 'SEO Config',
  settings: 'System Settings',
  logs: 'Activity Logs',
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="admin-breadcrumb">
      <ol className="breadcrumb-list">
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = BREADCRUMB_MAP[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to} className="breadcrumb-item">
              {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
              {last ? (
                <span className="breadcrumb-current" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={to} className="breadcrumb-link">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
