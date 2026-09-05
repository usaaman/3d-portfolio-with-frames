import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Eye,
  CheckCheck,
  User,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  FileText,
  X
} from 'lucide-react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import ConfirmModal from '../components/ConfirmModal';

export default function InquiriesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [toast, setToast] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedType, setCopiedType] = useState(null); // 'email' | 'message' | null

  // 1. Real-time Firestore stream for contact inquiries
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'contactMessages'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() });
          });

          // Sort newest inquiries first
          list.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime() || 0;
            const timeB = new Date(b.timestamp || 0).getTime() || 0;
            return timeB - timeA;
          });

          setMessages(list);

          // Maintain or initialize selected inquiry
          setSelectedInquiry((prev) => {
            if (!prev) {
              return list.length > 0 ? list[0] : null;
            }
            const updated = list.find((m) => m.id === prev.id);
            return updated || (list.length > 0 ? list[0] : null);
          });

          setLoading(false);
        },
        (err) => {
          console.warn('Inquiries stream notice:', err);
          setLoading(false);
        }
      );

      return () => unsub();
    } catch (e) {
      console.warn('Firestore subscription error:', e);
      setLoading(false);
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Select inquiry & automatically mark it as read in Firestore
  const handleSelectInquiry = async (inquiry) => {
    setSelectedInquiry(inquiry);

    if (!inquiry.read && db) {
      try {
        await updateDoc(doc(db, 'contactMessages', inquiry.id), {
          read: true
        });
      } catch (err) {
        console.warn('Auto-mark read error:', err);
      }
    }
  };

  // Manual toggle read/unread status
  const handleToggleRead = async (id, currentRead, e) => {
    e?.stopPropagation();
    if (!db) return;
    try {
      const nextStatus = !currentRead;
      await updateDoc(doc(db, 'contactMessages', id), {
        read: nextStatus
      });
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, read: nextStatus } : null));
      }
      showToast(nextStatus ? 'Marked inquiry as Read' : 'Marked inquiry as Unread');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Mark all unread messages as read
  const handleMarkAllRead = async () => {
    if (!db || messages.length === 0) return;
    const unread = messages.filter((m) => !m.read);
    if (unread.length === 0) {
      showToast('All contact inquiries are already marked as read.');
      return;
    }

    try {
      const batch = writeBatch(db);
      unread.forEach((m) => {
        batch.update(doc(db, 'contactMessages', m.id), { read: true });
      });
      await batch.commit();
      showToast(`Marked ${unread.length} inquiries as read!`);
    } catch (err) {
      console.error('Batch mark all read error:', err);
    }
  };

  // Trigger delete confirmation modal
  const handleDelete = (id, name, e) => {
    e?.stopPropagation();
    setDeleteTarget({ id, name: name || 'this inquiry' });
  };

  // Execute deletion from Firestore
  const executeDelete = async () => {
    if (!deleteTarget || !db) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'contactMessages', deleteTarget.id));
      showToast('Inquiry deleted permanently.');
      if (selectedInquiry?.id === deleteTarget.id) {
        const remaining = messages.filter((m) => m.id !== deleteTarget.id);
        setSelectedInquiry(remaining.length > 0 ? remaining[0] : null);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete inquiry error:', err);
      showToast('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast(`Copied ${type} to clipboard!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Filtering & search logic
  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread' && m.read) return false;
    if (filter === 'read' && !m.read) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.subject || '').toLowerCase().includes(q) ||
      (m.message || '').toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter((m) => !m.read).length;
  const readCount = messages.filter((m) => m.read).length;

  return (
    <div>
      {/* Main Admin Card Container */}
      <div className="adm-card" style={{ padding: '26px 30px' }}>
        {/* Card Header */}
        <div className="adm-card-header" style={{ marginBottom: '18px' }}>
          <div className="adm-card-title-group">
            <Mail className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Contact Inquiries &amp; Client Leads</h3>
              <p className="adm-card-subtitle">
                Direct messages submitted by prospective clients and recruiters through your portfolio.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="adm-btn-secondary-sm"
                title="Mark all inquiries as read"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
            )}
            <span
              className="adm-badge-verified"
              style={{
                background: unreadCount > 0 ? 'rgba(245, 166, 35, 0.15)' : '#ffffff',
                color: unreadCount > 0 ? '#b45309' : '#065f46',
                border: '1px solid var(--adm-border)'
              }}
            >
              {unreadCount > 0 ? `${unreadCount} Unread` : 'All Reviewed'}
            </span>
          </div>
        </div>

        {toast && (
          <div className="adm-toast-banner adm-toast-success" style={{ marginBottom: '18px' }}>
            <CheckCircle2 size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* =========================================================
            2-CARD OVERALL SPLIT LAYOUT (Master-Detail View)
            ========================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(310px, 370px) 1fr',
            gap: '22px',
            minHeight: '660px'
          }}
          className="adm-inquiries-split-grid"
        >
          {/* =========================================================
              CARD 1 (LEFT): INQUIRIES LIST CARDS
              ========================================================= */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid var(--adm-border)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(5, 28, 24, 0.03)'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Search sender, email, subject, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="adm-input"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '12.5px' }}
              />
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '11px',
                  color: 'var(--adm-text-muted)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--adm-text-muted)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '14px',
                borderBottom: '1px solid var(--adm-border)',
                paddingBottom: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => setFilter('all')}
                style={{
                  background: filter === 'all' ? 'var(--adm-green-deep)' : 'var(--adm-surface-alt)',
                  color: filter === 'all' ? '#ffffff' : 'var(--adm-text-sub)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All ({messages.length})
              </button>

              <button
                type="button"
                onClick={() => setFilter('unread')}
                style={{
                  background: filter === 'unread' ? 'var(--adm-amber)' : 'var(--adm-surface-alt)',
                  color: filter === 'unread' ? '#051c18' : 'var(--adm-text-sub)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Unread ({unreadCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter('read')}
                style={{
                  background: filter === 'read' ? 'var(--adm-green-deep)' : 'var(--adm-surface-alt)',
                  color: filter === 'read' ? '#ffffff' : 'var(--adm-text-sub)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Read ({readCount})
              </button>
            </div>

            {/* Scrollable Inquiries Cards List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '560px',
                paddingRight: '4px'
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--adm-text-muted)' }}>
                  <RefreshCw size={20} className="admin-spin-loader" style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: '10px', fontSize: '13px' }}>Loading inquiries...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 16px',
                    color: 'var(--adm-text-muted)',
                    fontSize: '13px'
                  }}
                >
                  <Mail size={28} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {searchQuery ? 'No inquiries match search' : filter === 'unread' ? 'All inquiries reviewed!' : 'No contact inquiries yet'}
                  </p>
                  <span style={{ fontSize: '11.5px', opacity: 0.8 }}>
                    {searchQuery ? 'Try changing your search keywords' : 'Client messages from your portfolio will appear here'}
                  </span>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isUnread = !msg.read;
                  const isSelected = selectedInquiry?.id === msg.id;

                  return (
                    <div
                      key={msg.id}
                      data-inquiry-id={msg.id}
                      onClick={() => handleSelectInquiry(msg)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        transition: 'all 0.18s ease',
                        /* BRIGHT FOR UNREAD VS LIGHT/SOFT MINT FOR READ */
                        backgroundColor: isUnread
                          ? '#ffffff'
                          : isSelected
                          ? 'rgba(235, 252, 239, 0.9)'
                          : 'rgba(240, 253, 248, 0.65)',
                        border: isSelected
                          ? '2px solid var(--adm-green-deep)'
                          : isUnread
                          ? '2px solid var(--adm-amber)'
                          : '1px solid rgba(184, 229, 203, 0.7)',
                        boxShadow: isUnread
                          ? '0 4px 14px rgba(245, 166, 35, 0.22)'
                          : isSelected
                          ? '0 2px 10px rgba(5, 28, 24, 0.08)'
                          : 'none',
                        position: 'relative'
                      }}
                    >
                      {/* Top Header of Inquiry Card */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px'
                        }}
                      >
                        {/* Status Badge */}
                        {isUnread ? (
                          <span
                            style={{
                              background: 'rgba(245, 166, 35, 0.22)',
                              color: '#b45309',
                              border: '1px solid var(--adm-amber)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 800,
                              letterSpacing: '0.4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--adm-amber)'
                              }}
                            />
                            UNREAD
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#065f46',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <CheckCircle2 size={10} />
                            Read
                          </span>
                        )}

                        <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                          {msg.timestamp?.split(' at ')[0] || msg.timestamp || 'Recent'}
                        </span>
                      </div>

                      {/* Sender Name & Email preview */}
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: isUnread ? 800 : 600,
                          color: isUnread ? '#051c18' : 'var(--adm-green-deep)',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {msg.name || 'Anonymous Visitor'}
                      </div>

                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--adm-text-muted)',
                          marginBottom: '6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {msg.email}
                      </div>

                      {/* Subject badge or snippet */}
                      {msg.subject && (
                        <div
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: isUnread ? '#92400e' : 'var(--adm-green-deep)',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Subject: {msg.subject}
                        </div>
                      )}

                      {/* Message Snippet */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          lineHeight: 1.45,
                          color: isUnread ? '#1e3a34' : 'var(--adm-text-muted)',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {msg.message || 'No message content provided.'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* =========================================================
              CARD 2 (RIGHT): INQUIRY DETAIL & MESSAGE READER CARD
              ========================================================= */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid var(--adm-border)',
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(5, 28, 24, 0.03)'
            }}
          >
            {selectedInquiry ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Detail Pane Header: Sender Info & Quick Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--adm-border)',
                    paddingBottom: '14px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Sender Initial Avatar */}
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: selectedInquiry.read ? 'var(--adm-green-sidebar)' : 'var(--adm-amber)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                        boxShadow: '0 2px 8px rgba(5, 28, 24, 0.1)',
                        flexShrink: 0
                      }}
                    >
                      {(selectedInquiry.name || 'V').charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: '17px',
                            fontWeight: 700,
                            color: 'var(--adm-green-deep)'
                          }}
                        >
                          {selectedInquiry.name || 'Anonymous Visitor'}
                        </h4>
                        <span
                          style={{
                            background: selectedInquiry.read ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 166, 35, 0.2)',
                            color: selectedInquiry.read ? '#065f46' : '#b45309',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          {selectedInquiry.read ? 'READ' : 'UNREAD'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <a
                          href={`mailto:${selectedInquiry.email}`}
                          style={{
                            fontSize: '13px',
                            color: 'var(--adm-text-sub)',
                            textDecoration: 'none',
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {selectedInquiry.email}
                          <ExternalLink size={12} style={{ opacity: 0.7 }} />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopy(selectedInquiry.email, 'email')}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--adm-text-muted)',
                            padding: '2px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Copy email address"
                        >
                          {copiedType === 'email' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        </button>

                        <span style={{ color: 'var(--adm-border)' }}>•</span>

                        <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          {selectedInquiry.timestamp || 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(selectedInquiry.id, selectedInquiry.read, e)}
                      className="adm-btn-secondary-sm"
                      title={selectedInquiry.read ? 'Mark as Unread' : 'Mark as Read'}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        borderColor: selectedInquiry.read ? 'var(--adm-border)' : 'var(--adm-amber)'
                      }}
                    >
                      <CheckCircle2 size={14} color={selectedInquiry.read ? '#10b981' : '#f5a623'} />
                      <span>{selectedInquiry.read ? 'Mark Unread' : 'Mark Read'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(selectedInquiry.id, selectedInquiry.name, e)}
                      className="adm-btn-danger-sm"
                      title="Delete Inquiry"
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subject Ribbon */}
                <div
                  style={{
                    backgroundColor: 'rgba(235, 252, 239, 0.75)',
                    border: '1px solid rgba(184, 229, 203, 0.9)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="var(--adm-green-sidebar)" />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--adm-text-muted)' }}>
                      Subject:
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--adm-green-deep)' }}>
                      {selectedInquiry.subject || 'General Inquiry / Direct Message'}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'var(--adm-text-muted)',
                      background: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid var(--adm-border)',
                      flexShrink: 0
                    }}
                  >
                    {(selectedInquiry.message || '').split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                {/* Message Content Container (Easy, Comfortable Reader) */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '16px',
                    minHeight: '260px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--adm-text-muted)',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Inquiry Message Content
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(selectedInquiry.message, 'message')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--adm-green-deep)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Copy message body"
                    >
                      {copiedType === 'message' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedType === 'message' ? 'Copied' : 'Copy Message'}</span>
                    </button>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(240, 253, 248, 0.45)',
                      border: '1.5px solid rgba(184, 229, 203, 0.75)',
                      borderRadius: '12px',
                      padding: '20px 22px',
                      fontSize: '14.5px',
                      lineHeight: '1.7',
                      color: '#051c18',
                      overflowY: 'auto',
                      maxHeight: '380px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'inherit'
                    }}
                  >
                    {selectedInquiry.message || (
                      <span style={{ color: 'var(--adm-text-muted)', fontStyle: 'italic' }}>
                        No message text was provided with this inquiry.
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Toolbar: Reply via Email & Quick Links */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderTop: '1px solid var(--adm-border)',
                    paddingTop: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                        selectedInquiry.subject || 'Portfolio Inquiry'
                      )}&body=Hi ${encodeURIComponent(selectedInquiry.name || 'there')},\n\nThank you for reaching out through my portfolio...`}
                      className="adm-btn-primary"
                      style={{
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 700
                      }}
                    >
                      <Send size={14} />
                      <span>Reply via Email</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(selectedInquiry.email, 'email')}
                      className="adm-btn-secondary-sm"
                      style={{ padding: '9px 14px', fontSize: '12.5px' }}
                    >
                      <Copy size={13} />
                      <span>Copy Email</span>
                    </button>
                  </div>

                  <span style={{ fontSize: '11.5px', color: 'var(--adm-text-muted)' }}>
                    Inquiry ID: <code style={{ fontSize: '11px', color: 'var(--adm-green-deep)' }}>{selectedInquiry.id}</code>
                  </span>
                </div>
              </div>
            ) : (
              /* Empty State when no inquiry selected */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--adm-text-muted)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(235, 252, 239, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--adm-green-sidebar)',
                    marginBottom: '16px'
                  }}
                >
                  <Mail size={32} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--adm-green-deep)', fontWeight: 700 }}>
                  Select an Inquiry to Read
                </h4>
                <p style={{ margin: 0, fontSize: '13.5px', maxWidth: '380px', lineHeight: 1.55 }}>
                  Choose a contact inquiry from the left panel to inspect the client's message, contact details, and reply directly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Inquiry Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Contact Inquiry"
        message={
          <span>
            Are you sure you want to delete the message from <strong>"{deleteTarget?.name}"</strong>? This will permanently erase the inquiry from your database.
          </span>
        }
        confirmText="Yes, Delete Inquiry"
        cancelText="Cancel"
        confirmVariant="danger"
        iconType="delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
