import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import GlobalSearch from '../components/GlobalSearch';
import './AdminLayout.css';

export default function AdminLayout({ auth }) {
  const { isAuthenticated, logout } = auth;
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check session loading
  if (auth.loading) {
    return (
      <div className="admin-layout-loading-screen">
        <div className="loading-spinner-box">
          <div className="spinner" />
          <span>Restoring Admin Session...</span>
        </div>
      </div>
    );
  }

  // Check guard
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout-container">
      {/* Sidebar Desktop */}
      <div className="sidebar-desktop-wrapper hidden-md">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onLogout={handleLogout}
        />
      </div>

      {/* Sidebar Mobile Drawer */}
      <div className={`sidebar-mobile-overlay md-only ${mobileOpen ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="sidebar-mobile-drawer" onClick={(e) => e.stopPropagation()}>
          <Sidebar
            isCollapsed={false}
            setIsCollapsed={() => {}}
            onLogout={handleLogout}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-panel">
        <Topbar
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          onSearchTrigger={() => setSearchOpen(true)}
        />

        <main className="admin-content-viewport">
          <Outlet />
        </main>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
