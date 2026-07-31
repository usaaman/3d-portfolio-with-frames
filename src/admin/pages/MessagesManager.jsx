import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Search,
  Star,
  Trash2,
  Check,
  Archive,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquareOff,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import './MessagesManager.css';

// Local mock data removed for production database flow

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active'); // 'active' | 'unread' | 'starred' | 'archived'
  const [selectedMsg, setSelectedMsg] = useState(null);

  // Deletion state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Load from firestore
  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      try {
        if (!db) {
          setMessages([]);
          setLoading(false);
          return;
        }
        const q = query(collection(db, 'contactMessages'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });

        setMessages(list);
      } catch (e) {
        console.warn('Firestore messages fetch failure:', e);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  const filteredMsgs = useMemo(() => {
    return messages.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filter === 'active') matchesFilter = !m.archived;
      else if (filter === 'unread') matchesFilter = !m.read && !m.archived;
      else if (filter === 'starred') matchesFilter = m.starred;
      else if (filter === 'archived') matchesFilter = m.archived;

      return matchesSearch && matchesFilter;
    });
  }, [messages, search, filter]);

  const paginatedMsgs = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredMsgs.slice(start, start + itemsPerPage);
  }, [filteredMsgs, page]);

  const totalPages = Math.ceil(filteredMsgs.length / itemsPerPage) || 1;

  // -------------------------------------------------------------
  // FIRESTORE ACTIONS
  // -------------------------------------------------------------
  const toggleRead = async (msg) => {
    const nextRead = !msg.read;
    // Local state
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: nextRead } : m))
    );
    if (selectedMsg && selectedMsg.id === msg.id) {
      setSelectedMsg((prev) => ({ ...prev, read: nextRead }));
    }

    try {
      if (db) {
        await updateDoc(doc(db, 'contactMessages', msg.id), { read: nextRead });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStar = async (msg) => {
    const nextStar = !msg.starred;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, starred: nextStar } : m))
    );
    if (selectedMsg && selectedMsg.id === msg.id) {
      setSelectedMsg((prev) => ({ ...prev, starred: nextStar }));
    }

    try {
      if (db) {
        await updateDoc(doc(db, 'contactMessages', msg.id), { starred: nextStar });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleArchive = async (msg) => {
    const nextArchived = !msg.archived;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, archived: nextArchived } : m))
    );
    if (selectedMsg && selectedMsg.id === msg.id) {
      setSelectedMsg(null); // Deselect on archive transition
    }

    try {
      if (db) {
        await updateDoc(doc(db, 'contactMessages', msg.id), { archived: nextArchived });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleReplyStatus = async (msg) => {
    const nextReplied = !msg.replied;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, replied: nextReplied } : m))
    );
    if (selectedMsg && selectedMsg.id === msg.id) {
      setSelectedMsg((prev) => ({ ...prev, replied: nextReplied }));
    }

    try {
      if (db) {
        await updateDoc(doc(db, 'contactMessages', msg.id), { replied: nextReplied });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setMessages((prev) => prev.filter((m) => m.id !== deleteTargetId));
    if (selectedMsg && selectedMsg.id === deleteTargetId) {
      setSelectedMsg(null);
    }

    try {
      if (db) {
        await deleteDoc(doc(db, 'contactMessages', deleteTargetId));
      }
    } catch (e) {
      console.error(e);
    }
    setDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const handleOpenMsg = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      toggleRead(msg); // Automatically mark as read when opened
    }
  };

  return (
    <div className="messages-manager-container">
      <PageHeader
        title="Messages Inbox"
        description="Review, categorize, and archive messages sent by visitors through the contact form."
      />

      {/* Toolbar filters */}
      <div className="messages-toolbar-card">
        <div className="messages-filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${filter === 'active' ? 'is-active' : ''}`}
            onClick={() => { setFilter('active'); setPage(1); }}
          >
            Active
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filter === 'unread' ? 'is-active' : ''}`}
            onClick={() => { setFilter('unread'); setPage(1); }}
          >
            Unread
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filter === 'starred' ? 'is-active' : ''}`}
            onClick={() => { setFilter('starred'); setPage(1); }}
          >
            Starred
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filter === 'archived' ? 'is-active' : ''}`}
            onClick={() => { setFilter('archived'); setPage(1); }}
          >
            Archived
          </button>
        </div>

        <div className="toolbar-search-input">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search sender, subject..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Grid splits: list vs preview */}
      <div className="messages-split-grid">
        <div className="messages-list-column">
          <SectionCard title="Messages List" description="Inbox thread selector.">
            {loading ? (
              <div className="messages-loading-placeholder">
                <span className="spinner" />
                <span>Synchronizing inbox messages...</span>
              </div>
            ) : paginatedMsgs.length === 0 ? (
              <div className="messages-empty-state">
                <MessageSquareOff size={32} />
                <p>No messages match your selected tab.</p>
              </div>
            ) : (
              <div className="messages-thread-list">
                {paginatedMsgs.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenMsg(msg)}
                    className={`message-thread-card ${!msg.read ? 'is-unread' : ''} ${selectedMsg && selectedMsg.id === msg.id ? 'is-selected' : ''}`}
                  >
                    <div className="thread-card-header">
                      <span className="thread-sender-name">{msg.name}</span>
                      <span className="thread-time-text">{msg.timestamp.split(' at ')[0]}</span>
                    </div>

                    <div className="thread-card-sub">
                      <span className="thread-subject-text">{msg.subject}</span>
                    </div>

                    <p className="thread-body-snippet">{msg.message.substring(0, 80)}...</p>

                    <div className="thread-card-footer" onClick={(e) => e.stopPropagation()}>
                      <div className="footer-badges">
                        {msg.replied && <Badge variant="success">Replied</Badge>}
                        {!msg.read && <Badge variant="primary">New</Badge>}
                      </div>

                      <div className="footer-quick-actions">
                        <button
                          type="button"
                          className={`action-btn-mini ${msg.starred ? 'is-active' : ''}`}
                          onClick={() => toggleStar(msg)}
                          title={msg.starred ? 'Unstar' : 'Star'}
                        >
                          <Star size={13} fill={msg.starred ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          className="action-btn-mini"
                          onClick={() => toggleArchive(msg)}
                          title={msg.archived ? 'Move to Active' : 'Archive'}
                        >
                          <Archive size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="projects-pagination-row" style={{ marginTop: '16px' }}>
                <span className="pagination-info">
                  {page} / {totalPages}
                </span>
                <div className="pagination-buttons">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Selected Message Inspector Column */}
        <div className="messages-inspector-column">
          <SectionCard title="Message Details" description="Inspect visitor inquiry details.">
            {!selectedMsg ? (
              <div className="inspector-empty-pane">
                <Mail size={32} />
                <p>Select a message thread on the left to read full details.</p>
              </div>
            ) : (
              <div className="inspector-full-pane">
                {/* Meta details card */}
                <div className="inspector-meta-row">
                  <div className="sender-avatar-circle">
                    {selectedMsg.name.charAt(0)}
                  </div>
                  <div className="sender-meta-block">
                    <h3>{selectedMsg.name}</h3>
                    <a href={`mailto:${selectedMsg.email}`} className="sender-email-link">
                      {selectedMsg.email} <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="inspector-header-controls">
                    <button
                      type="button"
                      className={`action-btn-circle ${selectedMsg.starred ? 'is-active' : ''}`}
                      onClick={() => toggleStar(selectedMsg)}
                      title="Star Message"
                    >
                      <Star size={14} fill={selectedMsg.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      className="action-btn-circle"
                      onClick={() => toggleArchive(selectedMsg)}
                      title={selectedMsg.archived ? 'Move to Active' : 'Archive'}
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-btn-circle btn-trash"
                      onClick={() => triggerDelete(selectedMsg.id)}
                      title="Delete Permanently"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="inspector-subject-block">
                  <span className="subject-label">Subject:</span>
                  <span className="subject-content">{selectedMsg.subject}</span>
                  <span className="subject-time">{selectedMsg.timestamp}</span>
                </div>

                <div className="inspector-message-body">
                  <p>{selectedMsg.message}</p>
                </div>

                <div className="inspector-footer-bar">
                  <Button
                    variant={selectedMsg.replied ? 'ghost' : 'primary'}
                    onClick={() => toggleReplyStatus(selectedMsg)}
                  >
                    <Check size={16} />
                    {selectedMsg.replied ? 'Mark Unreplied' : 'Mark as Replied'}
                  </Button>
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                    className="admin-btn admin-btn-ghost admin-btn-md text-decoration-none"
                    onClick={() => {
                      if (!selectedMsg.replied) toggleReplyStatus(selectedMsg);
                    }}
                  >
                    Compose Email Reply
                  </a>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Message Permanently?"
        message="This action will delete this message history from the Firestore database."
      />
    </div>
  );
}
