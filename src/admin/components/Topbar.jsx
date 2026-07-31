import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User as UserIcon, Bell, Search, Check, Trash2, Mail, Brain, Download, AlertTriangle } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import './Topbar.css';

export default function Topbar({
  onMenuToggle, // Mobile hamburger toggle
  onSearchTrigger, // Search modal trigger
  user = { email: 'admin@example.com' },
}) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);

  // Sync real-time notifications
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setNotifications(list);
    }, (err) => {
      console.warn('Real-time notifications sync failed:', err);
    });

    return () => unsub();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      if (db) {
        await updateDoc(doc(db, 'adminNotifications', id), {
          read: true
        });
      }
    } catch (err) {
      console.warn('Failed marking notification read:', err);
    }
  };

  const handleClearNotif = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      if (db) {
        await deleteDoc(doc(db, 'adminNotifications', id));
      }
    } catch (err) {
      console.warn('Failed deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      if (db) {
        // Delete all notifications locally and remotely
        const promises = notifications.map(n => deleteDoc(doc(db, 'adminNotifications', n.id)));
        await Promise.all(promises);
        setBellOpen(false);
      }
    } catch (err) {
      console.warn('Failed clearing notifications:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      await handleMarkRead(notif.id);
    }
    setBellOpen(false);

    // Route navigation based on type
    if (notif.type === 'contact') {
      navigate('/admin/messages');
    } else if (notif.type === 'ai') {
      navigate('/admin/ai-conversations');
    } else if (notif.type === 'resume') {
      navigate('/admin/resume');
    } else if (notif.type === 'firestore_error' || notif.type === 'upload_failure') {
      navigate('/admin/dashboard');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'contact': return <Mail size={14} style={{ color: 'var(--ds-color-accent-primary)' }} />;
      case 'ai': return <Brain size={14} style={{ color: 'var(--ds-color-accent-secondary)' }} />;
      case 'resume': return <Download size={14} style={{ color: '#34d399' }} />;
      default: return <AlertTriangle size={14} style={{ color: '#ef4444' }} />;
    }
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button
          className="topbar-hamburger md-only"
          onClick={onMenuToggle}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        <Breadcrumb />
      </div>

      <div className="topbar-right">
        {/* Global Search Icon Trigger */}
        <button
          type="button"
          className="topbar-icon-trigger"
          onClick={onSearchTrigger}
          title="Global Search (Ctrl + K)"
          aria-label="Open global search drawer"
        >
          <Search size={17} />
        </button>

        {/* Real-time Notifications Bell Trigger */}
        <div className="topbar-bell-wrapper">
          <button
            type="button"
            className={`topbar-icon-trigger ${bellOpen ? 'is-active' : ''}`}
            onClick={() => setBellOpen(!bellOpen)}
            title="System Alarms"
            aria-label="Open notifications dropdown"
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="topbar-bell-badge">{unreadCount}</span>}
          </button>

          {bellOpen && (
            <div className="topbar-bell-dropdown ds-glass">
              <div className="bell-dropdown-header">
                <h3>Notifications ({unreadCount} unread)</h3>
                {notifications.length > 0 && (
                  <button type="button" className="clear-all-btn" onClick={handleClearAll}>
                    Clear All
                  </button>
                )}
              </div>

              <div className="bell-dropdown-body">
                {notifications.length === 0 ? (
                  <div className="bell-dropdown-empty">
                    <Bell size={24} style={{ opacity: 0.3 }} />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="bell-notifications-list">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`bell-notif-item ${notif.read ? 'is-read' : 'is-unread'}`}
                      >
                        <div className="notif-item-icon-box">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="notif-item-text">
                          <h4>{notif.title}</h4>
                          <p>{notif.message}</p>
                          <span className="notif-item-time">{notif.timestamp}</span>
                        </div>
                        <div className="notif-item-actions" onClick={(e) => e.stopPropagation()}>
                          {!notif.read && (
                            <button
                              type="button"
                              className="notif-action-btn check-btn"
                              onClick={(e) => handleMarkRead(notif.id, e)}
                              title="Mark read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="notif-action-btn delete-btn"
                            onClick={(e) => handleClearNotif(notif.id, e)}
                            title="Delete alert"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown indicator */}
        <div className="topbar-user-badge">
          <div className="user-avatar" aria-hidden="true">
            <UserIcon size={14} />
          </div>
          <span className="user-email hidden-sm">{user.email}</span>
        </div>
      </div>
    </header>
  );
}
