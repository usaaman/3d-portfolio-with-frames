import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Briefcase,
  Award,
  Grid,
  Mail,
  BrainCircuit,
  CornerDownRight
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './GlobalSearch.css';

export default function GlobalSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [data, setData] = useState({
    projects: [],
    skills: [],
    services: [],
    messages: [],
    conversations: [],
    loading: false
  });

  const [filters, setFilters] = useState({
    projects: true,
    skills: true,
    services: true,
    messages: true,
    conversations: true
  });

  const loadAllCollections = useCallback(async () => {
    if (!db || data.projects.length > 0) return; // already loaded or offline
    setData(prev => ({ ...prev, loading: true }));
    try {
      // 1. Projects
      const projSnap = await getDocs(collection(db, 'projects'));
      const projects = projSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'project' }));

      // 2. Skills
      const skillsList = [];
      const skillsDocSnap = await getDoc(doc(db, 'skills', 'skills-doc'));
      if (skillsDocSnap.exists()) {
        const entries = skillsDocSnap.data().entries || [];
        entries.forEach(e => {
          skillsList.push({ id: `skill-${e.id}`, name: e.name, categoryId: e.categoryId, type: 'skill' });
        });
      }

      // 3. Services
      const svcSnap = await getDocs(collection(db, 'services'));
      const services = svcSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'service' }));

      // 4. Messages
      const msgSnap = await getDocs(collection(db, 'contactMessages'));
      const messages = msgSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'message' }));

      // 5. AI Conversations
      const convSnap = await getDocs(collection(db, 'chatConversations'));
      const conversations = convSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'conversation' }));

      setData({
        projects,
        skills: skillsList,
        services,
        messages,
        conversations,
        loading: false
      });
    } catch (e) {
      console.warn('Failed preloading search corpus:', e);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [data.projects.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
      loadAllCollections();
    }
  }, [isOpen, loadAllCollections]);

  const handleToggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter and group search results
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchStr = query.toLowerCase();
    const matches = [];

    // Projects
    if (filters.projects) {
      data.projects.forEach(p => {
        if (p.title?.toLowerCase().includes(searchStr) || p.subtitle?.toLowerCase().includes(searchStr) || p.techStack?.toLowerCase().includes(searchStr)) {
          matches.push({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle || p.type,
            category: 'Projects',
            path: '/admin/projects',
            icon: Briefcase
          });
        }
      });
    }

    // Skills
    if (filters.skills) {
      data.skills.forEach(s => {
        if (s.name?.toLowerCase().includes(searchStr)) {
          matches.push({
            id: s.id,
            title: s.name,
            subtitle: `Skill Category: ${s.categoryId}`,
            category: 'Skills',
            path: '/admin/skills',
            icon: Award
          });
        }
      });
    }

    // Services
    if (filters.services) {
      data.services.forEach(s => {
        if (s.title?.toLowerCase().includes(searchStr) || s.description?.toLowerCase().includes(searchStr)) {
          matches.push({
            id: s.id,
            title: s.title,
            subtitle: s.description?.substring(0, 60) + '...',
            category: 'Services',
            path: '/admin/services',
            icon: Grid
          });
        }
      });
    }

    // Media


    // Messages
    if (filters.messages) {
      data.messages.forEach(m => {
        if (m.name?.toLowerCase().includes(searchStr) || m.subject?.toLowerCase().includes(searchStr) || m.message?.toLowerCase().includes(searchStr)) {
          matches.push({
            id: m.id,
            title: `From: ${m.name}`,
            subtitle: `Subject: ${m.subject}`,
            category: 'Messages',
            path: '/admin/messages',
            icon: Mail
          });
        }
      });
    }

    // Conversations
    if (filters.conversations) {
      data.conversations.forEach(c => {
        if (c.visitorId?.toLowerCase().includes(searchStr) || c.summary?.toLowerCase().includes(searchStr)) {
          matches.push({
            id: c.id,
            title: `Session: ${c.visitorId}`,
            subtitle: c.summary,
            category: 'AI Conversations',
            path: '/admin/ai-conversations',
            icon: BrainCircuit
          });
        }
      });
    }

    return matches;
  }, [query, data, filters]);

  const handleNavigateResult = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Global Search Console">
      <div className="search-modal-container ds-glass" onClick={(e) => e.stopPropagation()}>
        
        {/* Input Bar */}
        <div className="search-modal-header">
          <Search className="search-bar-icon" size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search projects, skills, logs, messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Global Search Input"
          />
          <button type="button" className="close-search-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Filter Checkboxes */}
        <div className="search-modal-filters">
          {Object.keys(filters).map((key) => (
            <button
              key={key}
              type="button"
              className={`filter-checkbox-pill ${filters[key] ? 'is-active' : ''}`}
              onClick={() => handleToggleFilter(key)}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Results Scroll Area */}
        <div className="search-modal-body">
          {data.loading && (
            <div className="search-status-message">
              <span className="spinner" />
              <span>Indexing database schema...</span>
            </div>
          )}

          {!data.loading && query && results.length === 0 && (
            <div className="search-status-message">
              <span>No results found matching "{query}"</span>
            </div>
          )}

          {!query && (
            <div className="search-instruction-pane">
              <p>Search indexing active. Type a keyword to query.</p>
              <div className="search-shortcuts-helper">
                <span>Tip: Use <strong>Ctrl + K</strong> to toggle search anywhere.</span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="search-results-list">
              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="search-result-item"
                    onClick={() => handleNavigateResult(item.path)}
                  >
                    <div className="item-icon-box">
                      <Icon size={16} />
                    </div>
                    <div className="item-text-info">
                      <h4>{item.title}</h4>
                      <span className="item-subtitle">{item.subtitle}</span>
                      <span className="item-category-tag">{item.category}</span>
                    </div>
                    <CornerDownRight className="item-action-arrow" size={14} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
