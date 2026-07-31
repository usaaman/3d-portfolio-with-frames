import React, { useState, useEffect, useMemo } from 'react';
import {
  BrainCircuit,
  Search,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
  Clock,
  Archive,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Button from '../shared/Button';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import './AIConversations.css';

export default function AIConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [archiveFilter, setArchiveFilter] = useState('active'); // 'active' | 'archived' | 'all'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [selectedConv, setSelectedConv] = useState(null);

  // Deletion state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const loadConversations = async () => {
    setLoading(true);
    try {
      if (!db) {
        setLoading(false);
        return;
      }
      const q = query(collection(db, 'chatConversations'), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setConversations(list);
    } catch (e) {
      console.warn('Firestore fetch failed for chatConversations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Filter conversations
  const filteredConvs = useMemo(() => {
    return conversations.filter((c) => {
      // 1. Search Query filter
      const matchSearch =
        c.visitorId?.toLowerCase().includes(search.toLowerCase()) ||
        c.summary?.toLowerCase().includes(search.toLowerCase()) ||
        c.id?.toLowerCase().includes(search.toLowerCase());

      // 2. Archive status filter
      let matchArchive = true;
      if (archiveFilter === 'active') matchArchive = !c.archived;
      else if (archiveFilter === 'archived') matchArchive = !!c.archived;

      // 3. Date filter
      let matchDate = true;
      if (c.updatedAt && dateFilter !== 'all') {
        const updateDate = new Date(c.updatedAt);
        const diffTime = Math.abs(new Date() - updateDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today') {
          matchDate = diffDays <= 1 && new Date().toDateString() === updateDate.toDateString();
        } else if (dateFilter === 'week') {
          matchDate = diffDays <= 7;
        } else if (dateFilter === 'month') {
          matchDate = diffDays <= 30;
        }
      }

      return matchSearch && matchArchive && matchDate;
    });
  }, [conversations, search, archiveFilter, dateFilter]);

  const paginatedConvs = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredConvs.slice(start, start + itemsPerPage);
  }, [filteredConvs, page]);

  const totalPages = Math.ceil(filteredConvs.length / itemsPerPage) || 1;

  const triggerDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setConversations((prev) => prev.filter((c) => c.id !== deleteTargetId));
    if (selectedConv && selectedConv.id === deleteTargetId) {
      setSelectedConv(null);
    }

    try {
      if (db) {
        await deleteDoc(doc(db, 'chatConversations', deleteTargetId));
      }
    } catch (e) {
      console.error(e);
    }
    setDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const toggleArchive = async (conv) => {
    const nextArchived = !conv.archived;
    // Update local state
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, archived: nextArchived } : c));
    if (selectedConv && selectedConv.id === conv.id) {
      setSelectedConv(prev => ({ ...prev, archived: nextArchived }));
    }

    try {
      if (db) {
        await updateDoc(doc(db, 'chatConversations', conv.id), {
          archived: nextArchived
        });
      }
    } catch (e) {
      console.error('Failed toggling archive status:', e);
    }
  };

  const handleExport = (conv) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conv, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `AI_Conversation_${conv.id}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="ai-convs-container">
      <PageHeader
        title="AI Conversational Audits"
        description="Audit chat summaries, archive threads, and inspect AI assistant response streams."
      />

      {/* Toolbar filters */}
      <div className="ai-convs-toolbar">
        <div className="toolbar-search-input">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search visitor ID, summary contents..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search conversation history"
          />
        </div>

        <div className="toolbar-filters-row">
          <div className="filter-select-wrapper">
            <Filter size={13} className="filter-icon" />
            <select
              value={archiveFilter}
              onChange={(e) => { setArchiveFilter(e.target.value); setPage(1); }}
              aria-label="Filter by archive state"
            >
              <option value="active">Active Sessions</option>
              <option value="archived">Archived Threads</option>
              <option value="all">All Conversions</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <Calendar size={13} className="filter-icon" />
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              aria-label="Filter by date range"
            >
              <option value="all">All Time</option>
              <option value="today">Today Only</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ai-convs-split-grid">
        {/* Left Column: List of conversations */}
        <div className="ai-convs-list-column">
          <SectionCard title="Conversation Ledgers" description={`Showing ${filteredConvs.length} matching logs.`}>
            {loading ? (
              <div className="convs-loading-placeholder">
                <span className="spinner" />
                <span>Syncing conversations database...</span>
              </div>
            ) : paginatedConvs.length === 0 ? (
              <div className="convs-empty-state">
                <BrainCircuit size={32} style={{ color: 'var(--ds-color-text-muted)' }} />
                <p>No conversation audit logs found.</p>
              </div>
            ) : (
              <div className="convs-thread-list">
                {paginatedConvs.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConv(c)}
                    className={`conv-thread-card ${selectedConv && selectedConv.id === c.id ? 'is-selected' : ''} ${c.archived ? 'is-archived-card' : ''}`}
                  >
                    <div className="conv-card-header">
                      <span className="conv-visitor-id">{c.visitorId || 'Anonymous'}</span>
                      <span className="conv-message-count">{c.messages?.length || 0} msgs</span>
                    </div>

                    <p className="conv-summary-text">"{c.summary || 'Visitor requested general information.'}"</p>

                    <div className="conv-card-footer" onClick={(e) => e.stopPropagation()}>
                      <span className="conv-date-badge">
                        <Clock size={11} />
                        {c.updatedAt ? c.updatedAt.split(' ')[0] : 'Unknown'}
                      </span>
                      <div className="conv-action-buttons">
                        <button
                          type="button"
                          className="conv-icon-btn"
                          onClick={() => toggleArchive(c)}
                          title={c.archived ? "Restore to Active" : "Archive Session"}
                        >
                          {c.archived ? <Eye size={13} /> : <Archive size={13} />}
                        </button>
                        <button
                          type="button"
                          className="conv-trash-btn"
                          onClick={() => triggerDelete(c.id)}
                          title="Delete Chat Log"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination controls */}
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

        {/* Right Column: Detailed timeline transcript audit */}
        <div className="ai-convs-viewer-column">
          <SectionCard title="Conversation Auditing Timeline" description="Detailed review of dialogue flow.">
            {!selectedConv ? (
              <div className="viewer-empty-pane">
                <BrainCircuit size={32} style={{ color: 'var(--ds-color-text-muted)' }} />
                <p>Select a conversation session to review details and inspect response accuracy.</p>
              </div>
            ) : (
              <div className="viewer-full-pane">
                {/* Meta details Header */}
                <div className="viewer-meta-header">
                  <div className="meta-info-block">
                    <h3>Session: {selectedConv.id.substring(0, 16)}...</h3>
                    <div className="meta-time-row">
                      <Clock size={12} />
                      <span>Last Updated: {selectedConv.updatedAt}</span>
                    </div>
                  </div>

                  <div className="viewer-header-controls">
                    <Button variant="ghost" size="sm" onClick={() => handleExport(selectedConv)} style={{ padding: '6px 10px', fontSize: '11.5px', gap: '4px' }}>
                      <Download size={13} /> Export JSON
                    </Button>
                    <Button
                      variant={selectedConv.archived ? "success" : "ghost"}
                      size="sm"
                      onClick={() => toggleArchive(selectedConv)}
                      style={{ padding: '6px 10px', fontSize: '11.5px', gap: '4px' }}
                    >
                      <Archive size={13} />
                      {selectedConv.archived ? "Restore" : "Archive"}
                    </Button>
                    <button
                      type="button"
                      className="action-btn-circle btn-trash"
                      onClick={() => triggerDelete(selectedConv.id)}
                      title="Delete Permanently"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="viewer-summary-box">
                  <span className="summary-label">Automated AI Summary:</span>
                  <p className="summary-quote">"{selectedConv.summary || 'No summary available.'}"</p>
                </div>

                {/* Visual Chat Timeline */}
                <div className="viewer-transcript-flow">
                  {(selectedConv.messages || []).map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={index} className={`viewer-bubble-row ${isUser ? 'is-user' : 'is-bot'}`}>
                        <div className="viewer-avatar-circle">
                          {isUser ? <User size={12} /> : <Bot size={12} />}
                        </div>
                        <div className="viewer-bubble-container">
                          <div className="viewer-bubble">
                            <span className="bubble-role-label">{isUser ? 'Visitor Query' : 'AI Assistant response'}</span>
                            <p className="bubble-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                          </div>
                          <span className="bubble-timestamp">{msg.timestamp || 'Just now'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation Log?"
        message="This action will delete this transcript record from the Firestore database."
      />
    </div>
  );
}
