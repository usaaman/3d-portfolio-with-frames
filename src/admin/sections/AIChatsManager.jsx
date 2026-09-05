import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  Bot,
  User,
  CheckCheck,
  AlertCircle,
  ChevronRight,
  Filter,
  ArrowRight
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
import { getGroqChatCompletion } from '../../services/groq';
import ConfirmModal from '../components/ConfirmModal';

export default function AIChatsManager() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [toast, setToast] = useState('');
  const [deleteChatTarget, setDeleteChatTarget] = useState(null);
  const [deletingChat, setDeletingChat] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Real-time stream for chat conversations
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'chatConversations'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() });
          });

          // Sort newest first by updatedAt or createdAt
          list.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
            const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
            return timeB - timeA;
          });

          setChats(list);

          // Update selectedChat reference if it is updated in Firestore
          setSelectedChat((prev) => {
            if (!prev) {
              // Default to first chat if available
              return list.length > 0 ? list[0] : null;
            }
            const updated = list.find((c) => c.id === prev.id);
            return updated || (list.length > 0 ? list[0] : null);
          });

          setLoading(false);
        },
        (err) => {
          console.warn('AI chats listener notice:', err);
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

  // Scroll to bottom of message dialogue when chat opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);

    // Automatically mark as read when admin clicks if unread
    if (!chat.read && db) {
      try {
        await updateDoc(doc(db, 'chatConversations', chat.id), { read: true });
      } catch (err) {
        console.warn('Auto-mark read error:', err);
      }
    }
  };

  const handleToggleRead = async (chatId, currentStatus, e) => {
    e?.stopPropagation();
    if (!db) return;
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, 'chatConversations', chatId), {
        read: newStatus
      });
      if (selectedChat?.id === chatId) {
        setSelectedChat((prev) => (prev ? { ...prev, read: newStatus } : null));
      }
      showToast(newStatus ? 'Conversation marked as Read' : 'Conversation marked as Unread');
    } catch (err) {
      console.error('Error updating read status:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!db || chats.length === 0) return;
    const unreadChats = chats.filter((c) => !c.read);
    if (unreadChats.length === 0) {
      showToast('All conversations are already marked as read.');
      return;
    }

    try {
      const batch = writeBatch(db);
      unreadChats.forEach((c) => {
        batch.update(doc(db, 'chatConversations', c.id), { read: true });
      });
      await batch.commit();
      showToast(`Marked ${unreadChats.length} conversations as read!`);
    } catch (err) {
      console.error('Batch mark read failed:', err);
    }
  };

  const executeDeleteChat = async () => {
    if (!deleteChatTarget || !db) return;
    setDeletingChat(true);
    try {
      await deleteDoc(doc(db, 'chatConversations', deleteChatTarget));
      if (selectedChat?.id === deleteChatTarget) {
        const remaining = chats.filter((c) => c.id !== deleteChatTarget);
        setSelectedChat(remaining.length > 0 ? remaining[0] : null);
      }
      showToast('Conversation record deleted permanently.');
      setDeleteChatTarget(null);
    } catch (err) {
      console.error('Failed to delete chat:', err);
      showToast('Failed to delete conversation: ' + err.message);
    } finally {
      setDeletingChat(false);
    }
  };

  // Generate or Regenerate AI Summary using Groq / Rule Heuristic
  const handleGenerateSummary = async (chat) => {
    if (!chat) return;
    setGeneratingSummary(true);
    try {
      const msgs = chat.messages || [];
      if (msgs.length === 0) {
        showToast('No messages available to summarize.');
        return;
      }

      const transcriptText = msgs
        .map((m) => `${m.role === 'user' ? 'Visitor' : 'AI Assistant'}: ${m.content}`)
        .join('\n');

      const prompt = `Please provide a thorough, comprehensive executive summary for an administrator reviewing this visitor conversation on Muhammad Usman's developer portfolio website. Do NOT make it short or 1-sentence. Provide a 3 to 5 sentence detailed briefing highlighting:
1. The visitor's core intent and specific projects or technical stacks inquired about.
2. Exact technical questions or requirements discussed.
3. Potential lead quality, hiring/contract interest, timeline, or contact details mentioned.
4. Final outcome and next steps suggested by the AI representative.

Conversation Transcript:
${transcriptText}`;

      let summaryResult = '';
      try {
        summaryResult = await getGroqChatCompletion(
          [{ role: 'user', content: prompt }],
          'You are a senior executive intelligence assistant analyzing client inquiries on an engineer portfolio. Provide a detailed, thorough, actionable briefing.'
        );
      } catch (e) {
        const userQueries = msgs.filter((m) => m.role === 'user').map((m) => m.content);
        summaryResult = `• Visitor Inquiries: ${userQueries.join('; ')}\n• Conversation Volume: ${msgs.length} messages exchanged with AI assistant.\n• Topics Discussed: Engineering background, portfolio project scope, and technical skill inquiry.`;
      }

      if (summaryResult) {
        const cleanSummary = summaryResult.replace(/^"|"$/g, '').trim();
        if (db && chat.id) {
          await updateDoc(doc(db, 'chatConversations', chat.id), {
            summary: cleanSummary
          });
        }
        setSelectedChat((prev) => (prev ? { ...prev, summary: cleanSummary } : null));
        showToast('AI Executive Summary generated & saved live!');
      }
    } catch (err) {
      console.error('Summary generation error:', err);
      showToast('Summary error: ' + err.message);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Helper to extract summary if missing
  const getDisplaySummary = (chat) => {
    if (chat.summary && chat.summary.trim()) {
      return chat.summary;
    }
    const userMsgs = (chat.messages || []).filter((m) => m.role === 'user');
    if (userMsgs.length > 0) {
      const firstQ = userMsgs[0].content;
      return `Visitor asked: "${firstQ.length > 70 ? firstQ.substring(0, 70) + '...' : firstQ}"`;
    }
    return 'General portfolio exploration dialogue.';
  };

  // Filter and search
  const filteredChats = chats.filter((chat) => {
    if (filter === 'unread' && chat.read) return false;
    if (filter === 'read' && !chat.read) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const summaryMatch = (chat.summary || '').toLowerCase().includes(q);
    const visitorMatch = (chat.visitorId || chat.conversationId || '').toLowerCase().includes(q);
    const messagesMatch = (chat.messages || []).some((m) =>
      (m.content || '').toLowerCase().includes(q)
    );
    return summaryMatch || visitorMatch || messagesMatch;
  });

  const unreadCount = chats.filter((c) => !c.read).length;
  const readCount = chats.filter((c) => c.read).length;

  return (
    <div>
      <div className="adm-card" style={{ padding: '26px 30px' }}>
        {/* Card Header */}
        <div className="adm-card-header" style={{ marginBottom: '18px' }}>
          <div className="adm-card-title-group">
            <MessageSquare className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">AI Conversations &amp; Inquiries</h3>
              <p className="adm-card-subtitle">
                Live visitor chat sessions captured from your portfolio's autonomous AI representative.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="adm-btn-secondary-sm"
                title="Mark all conversations as read"
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
          className="adm-chats-split-grid"
        >
          {/* =========================================================
              CARD 1 (LEFT): CHATS LIST CARDS
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
                placeholder="Search transcripts, topics, keywords..."
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
                All ({chats.length})
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

            {/* Scrollable Conversation Cards List */}
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
                  <p style={{ marginTop: '10px', fontSize: '13px' }}>Loading conversations...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 16px',
                    color: 'var(--adm-text-muted)',
                    fontSize: '13px'
                  }}
                >
                  <MessageSquare size={28} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No conversations found</p>
                  <span style={{ fontSize: '11.5px', opacity: 0.8 }}>
                    {searchQuery ? 'Try changing your search terms' : 'New chats will appear here automatically'}
                  </span>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isUnread = !chat.read;
                  const isSelected = selectedChat?.id === chat.id;
                  const msgCount = (chat.messages || []).length;
                  const summarySnippet = getDisplaySummary(chat);

                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        transition: 'all 0.18s ease',
                        /* BRIGHT FOR UNREAD VS LIGHT FOR READ */
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
                      {/* Top Header of the Card */}
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
                          {chat.updatedAt?.split(',')[0] || chat.createdAt?.split(',')[0] || 'Recent'}
                        </span>
                      </div>

                      {/* Visitor Name */}
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: isUnread ? 800 : 600,
                          color: isUnread ? '#051c18' : 'var(--adm-green-deep)',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {chat.visitorId || chat.conversationId || 'Visitor'}
                        </span>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 600,
                            color: 'var(--adm-text-muted)',
                            flexShrink: 0
                          }}
                        >
                          {msgCount} msgs
                        </span>
                      </div>

                      {/* Summary Snippet */}
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
                        {summarySnippet}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* =========================================================
              CARD 2 (RIGHT): CHATS DETAIL & AI SUMMARY CARD
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
            {selectedChat ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Detail Pane Header */}
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
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 700,
                          color: 'var(--adm-green-deep)'
                        }}
                      >
                        {selectedChat.visitorId || selectedChat.conversationId}
                      </h4>
                      <span
                        style={{
                          background: selectedChat.read ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 166, 35, 0.2)',
                          color: selectedChat.read ? '#065f46' : '#b45309',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {selectedChat.read ? 'READ' : 'UNREAD'}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginTop: '3px' }}>
                      Recorded: {selectedChat.createdAt || 'Recent'} • {(selectedChat.messages || []).length} messages exchanged
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(selectedChat.id, selectedChat.read, e)}
                      className="adm-btn-secondary-sm"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      {selectedChat.read ? <Eye size={13} /> : <CheckCircle2 size={13} />}
                      <span>{selectedChat.read ? 'Mark Unread' : 'Mark Read'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteChatTarget(selectedChat.id)}
                      className="adm-btn-danger-sm"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* AI Executive Summary Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.09) 0%, rgba(5, 28, 24, 0.04) 100%)',
                    border: '1.5px solid rgba(245, 166, 35, 0.35)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    marginBottom: '18px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} color="#f5a623" />
                      <strong style={{ fontSize: '13px', color: 'var(--adm-green-deep)', letterSpacing: '0.3px' }}>
                        AI Executive Summary
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateSummary(selectedChat)}
                      disabled={generatingSummary}
                      style={{
                        background: '#ffffff',
                        border: '1px solid rgba(245, 166, 35, 0.5)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#b45309',
                        cursor: generatingSummary ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RefreshCw size={11} className={generatingSummary ? 'admin-spin-loader' : ''} />
                      <span>{generatingSummary ? 'Synthesizing...' : 'Regenerate Summary'}</span>
                    </button>
                  </div>

                  <div
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      lineHeight: '1.65',
                      color: '#07221e',
                      fontWeight: 500,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {getDisplaySummary(selectedChat)}
                  </div>
                </div>

                {/* Full Transcript Messages Dialogue Stream */}
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} color="var(--adm-green-deep)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--adm-green-deep)' }}>
                    Complete Conversation Dialogue
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'var(--adm-surface-alt)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--adm-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxHeight: '380px'
                  }}
                >
                  {(selectedChat.messages || []).length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--adm-text-muted)', fontSize: '13px', padding: '20px' }}>
                      No messages recorded in this conversation.
                    </div>
                  ) : (
                    (selectedChat.messages || []).map((msg, mIdx) => {
                      const isUser = msg.role === 'user';

                      return (
                        <div
                          key={mIdx}
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start',
                            justifyContent: isUser ? 'flex-end' : 'flex-start'
                          }}
                        >
                          {!isUser && (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#051c18',
                                color: '#f5a623',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Bot size={18} />
                            </div>
                          )}

                          <div
                            style={{
                              maxWidth: '80%',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              background: isUser ? '#051c18' : '#ffffff',
                              color: isUser ? '#ffffff' : '#051c18',
                              border: isUser ? 'none' : '1px solid var(--adm-border)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                marginBottom: '3px',
                                color: isUser ? '#a7f3d0' : '#f5a623',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px'
                              }}
                            >
                              <span>{isUser ? 'Visitor' : 'AI Assistant'}</span>
                              {msg.timestamp && <span style={{ opacity: 0.75 }}>{msg.timestamp}</span>}
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                lineHeight: 1.5,
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {msg.content}
                            </div>
                          </div>

                          {isUser && (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(5, 28, 24, 0.1)',
                                color: 'var(--adm-green-deep)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <User size={18} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: 'var(--adm-text-muted)',
                  padding: '40px 20px'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'var(--adm-surface-alt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: 'var(--adm-green-deep)'
                  }}
                >
                  <MessageSquare size={32} />
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--adm-green-deep)' }}>
                  No Conversation Selected
                </h4>
                <p style={{ margin: 0, fontSize: '13px', maxWidth: '320px', lineHeight: 1.5 }}>
                  Click on any conversation card from the left list to view its complete dialogue exchange and AI executive summary.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteChatTarget)}
        title="Delete AI Conversation"
        message="Are you sure you want to delete this chat transcript record permanently? This action cannot be undone."
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        confirmVariant="danger"
        iconType="delete"
        loading={deletingChat}
        onCancel={() => setDeleteChatTarget(null)}
        onConfirm={executeDeleteChat}
      />
    </div>
  );
}
