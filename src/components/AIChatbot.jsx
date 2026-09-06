import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  RefreshCw,
  Brain,
  Copy,
  Check,
} from 'lucide-react';
import { getGeminiChatCompletion, getGeminiChatCompletionStream } from '../services/gemini';
import { buildUsmanSystemPrompt } from '../services/usmanKnowledgeBase';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { trackAIOpen, trackAIMessage, logNotification } from '../utils/analytics';
import CyberRobotButton from './CyberRobotButton';
import './AIChatbot.css';

// Local helper to parse simple markdown formatting (Bold, Code, Lists, Links)
function parseMarkdown(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const elements = [];
  let isCodeBlock = false;
  let codeContent = [];
  let codeLang = '';

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (isCodeBlock) {
        isCodeBlock = false;
        const rawCode = codeContent.join('\n');
        elements.push(<CodeBlock key={`code-${idx}`} code={rawCode} lang={codeLang} />);
        codeContent = [];
      } else {
        isCodeBlock = true;
        codeLang = trimmed.replace('```', '').trim();
      }
      return;
    }

    if (isCodeBlock) {
      codeContent.push(line);
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = line.replace(/^[-*]\s+/, '');
      elements.push(
        <li key={`li-${idx}`} className="chatbot-list-item">
          {parseInlineMarkdown(content)}
        </li>
      );
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const content = line.replace(/^\d+\.\s+/, '');
      elements.push(
        <li key={`li-${idx}`} className="chatbot-list-item decimal-list">
          {parseInlineMarkdown(content)}
        </li>
      );
      return;
    }

    if (trimmed === '') {
      elements.push(<div key={`space-${idx}`} className="chatbot-line-spacing" />);
    } else {
      elements.push(
        <p key={`text-${idx}`} className="chatbot-line-text">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  return elements;
}

function parseInlineMarkdown(text) {
  let parts = [{ type: 'text', content: text }];

  // Bold
  let nextParts = [];
  parts.forEach(p => {
    if (p.type !== 'text') {
      nextParts.push(p);
      return;
    }
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(p.content)) !== null) {
      if (match.index > lastIndex) {
        nextParts.push({ type: 'text', content: p.content.substring(lastIndex, match.index) });
      }
      nextParts.push({ type: 'bold', content: match[1] });
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < p.content.length) {
      nextParts.push({ type: 'text', content: p.content.substring(lastIndex) });
    }
  });
  parts = nextParts;

  // Links
  nextParts = [];
  parts.forEach(p => {
    if (p.type !== 'text') {
      nextParts.push(p);
      return;
    }
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(p.content)) !== null) {
      if (match.index > lastIndex) {
        nextParts.push({ type: 'text', content: p.content.substring(lastIndex, match.index) });
      }
      nextParts.push({ type: 'link', text: match[1], href: match[2] });
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < p.content.length) {
      nextParts.push({ type: 'text', content: p.content.substring(lastIndex) });
    }
  });
  parts = nextParts;

  // Inline Code
  nextParts = [];
  parts.forEach(p => {
    if (p.type !== 'text') {
      nextParts.push(p);
      return;
    }
    const codeRegex = /`(.*?)`/g;
    let lastIndex = 0;
    let match;
    while ((match = codeRegex.exec(p.content)) !== null) {
      if (match.index > lastIndex) {
        nextParts.push({ type: 'text', content: p.content.substring(lastIndex, match.index) });
      }
      nextParts.push({ type: 'inlineCode', content: match[1] });
      lastIndex = codeRegex.lastIndex;
    }
    if (lastIndex < p.content.length) {
      nextParts.push({ type: 'text', content: p.content.substring(lastIndex) });
    }
  });
  parts = nextParts;

  return parts.map((p, i) => {
    if (p.type === 'bold') return <strong key={i} style={{ color: '#ffffff', fontWeight: '600' }}>{p.content}</strong>;
    if (p.type === 'link') return <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className="chatbot-link">{p.text}</a>;
    if (p.type === 'inlineCode') return <code key={i} className="chatbot-inline-code">{p.content}</code>;
    return p.content;
  });
}

// Copy Code Block component
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chatbot-code-block-wrapper">
      <div className="code-block-header">
        <span>{lang || 'code'}</span>
        <button type="button" className="code-copy-btn" onClick={handleCopy}>
          {copied ? <Check size={12} style={{ color: '#34d399' }} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="chatbot-code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AIChatbot({ portfolioData }) {
  // Grab configuration from portfolioData
  const aiConfig = useMemo(() => {
    return portfolioData?.aiConfig || {
      enabled: true,
      greetingMessage: "Hi there! I'm Usman's AI assistant. Ask me anything about his technical skills, projects, creative background, or availability!",
      suggestedQuestions: [
        "Tell me about Muhammad Usman",
        "What projects has he built?",
        "What are his core technical skills?",
        "Is he available for work or internships?"
      ],
      temperature: 0.6,
      conversationLimit: 20,
      modelSelection: 'gemini-flash-lite-latest'
    };
  }, [portfolioData]);

  // Clean up any stale legacy localStorage items so client data is never permanently retained
  useEffect(() => {
    try {
      localStorage.removeItem('chatbot_history');
      localStorage.removeItem('chatbot_conv_id');
      localStorage.removeItem('chatbot_created_at');
      localStorage.removeItem('chatbot_visitor_id');
    } catch (err) {}
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  // Strictly in-memory conversation state - resets whenever visitor leaves, reloads or crosses site
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: aiConfig.greetingMessage, timestamp: getCurrentTime() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fresh unique conversation ID for this visit/session
  const [convId, setConvId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

  const scrollRef = useRef(null);
  const streamAbortControllerRef = useRef(null);
  const sessionCreatedAtRef = useRef(new Date().toLocaleString());

  // Anonymous Visitor ID for this session
  const [visitorId] = useState(() => `visitor_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`);

  // Keep greeting updated if config changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].content !== aiConfig.greetingMessage) {
        return [{ role: 'assistant', content: aiConfig.greetingMessage, timestamp: getCurrentTime() }];
      }
      return prev;
    });
  }, [aiConfig.greetingMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Construct context-enriched system prompt grounded in Usman's 30-section knowledge base and live CMS data
  const systemPrompt = useMemo(() => {
    return buildUsmanSystemPrompt(portfolioData, aiConfig.systemPrompt);
  }, [portfolioData, aiConfig]);

  // Suggested questions parser
  const suggestions = useMemo(() => {
    const q = aiConfig.suggestedQuestions;
    if (Array.isArray(q)) return q;
    if (typeof q === 'string') return q.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }, [aiConfig.suggestedQuestions]);

  const handleOpenToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      trackAIOpen();
    }
  };

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input.trim();
    if (!queryText || isLoading) return;

    // Check conversation limit
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    if (userMsgCount >= (aiConfig.conversationLimit || 20)) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "⚠️ Conversation limit reached for this session. Please clear the chat to start a new session.",
          timestamp: getCurrentTime()
        }
      ]);
      return;
    }

    const userMessage = { role: 'user', content: queryText, timestamp: getCurrentTime() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    trackAIMessage();

    // Set up stream placeholder message
    const botPlaceholderIndex = updatedMessages.length;
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', timestamp: getCurrentTime() }
    ]);

    const controller = new AbortController();
    streamAbortControllerRef.current = controller;

    let accumulatedText = '';
    try {
      await getGeminiChatCompletionStream(
        updatedMessages.filter(m => m.role !== 'system'),
        systemPrompt,
        (chunk, done) => {
          if (done) {
            setIsLoading(false);
            const finalMessages = [...updatedMessages, { role: 'assistant', content: accumulatedText, timestamp: getCurrentTime() }];
            setMessages(finalMessages);
            generateSummaryAndSave(finalMessages);
            return;
          }
          accumulatedText += chunk;
          setMessages(prev => {
            const copy = [...prev];
            if (copy[botPlaceholderIndex]) {
              copy[botPlaceholderIndex].content = accumulatedText;
            }
            return copy;
          });
        },
        (error) => {
          setIsLoading(false);
          setMessages(prev => [
            ...prev.slice(0, botPlaceholderIndex),
            { role: 'assistant', content: `AI completion error: ${error.message || 'Something went wrong.'}`, timestamp: getCurrentTime() }
          ]);
          logNotification('AI Chat Failure', `Gemini response failure: ${error.message}`, 'firestore_error');
        },
        controller.signal,
        {
          model: aiConfig.modelSelection || 'gemini-flash-lite-latest',
          temperature: aiConfig.temperature || 0.6
        }
      );
    } catch (err) {
      console.warn('Gemini stream fetch error:', err);
      setIsLoading(false);
    }
  };

  // Generate automated AI summary of conversation and save
  const generateSummaryAndSave = async (history) => {
    try {
      if (!db) return;
      
      let summaryText = "Visitor explored Muhammad Usman's portfolio.";
      // Generate detailed, comprehensive executive summary
      const userMsgs = history.filter(m => m.role === 'user');
      if (userMsgs.length > 0) {
        const transcriptText = history
          .map(m => `${m.role === 'user' ? 'Visitor' : 'AI Assistant'}: ${m.content}`)
          .join('\n');

        const summaryPrompt = `You are a professional executive briefing AI analyzing an incoming visitor conversation on Muhammad Usman's portfolio website.

Provide a thorough, comprehensive executive summary (3 to 5 sentences or structured bullet points). Do NOT make it short or 1-line.

Cover these specific points:
1. Core Intent & Topics: What projects (e.g. MedCore POS, AI Chat App, Portfolio CMS), tech stacks, or services the visitor inquired about.
2. Questions & Dialogue Details: Key questions asked and technical aspects explored.
3. Client Lead Potential & Engagement: Any mention of hiring, contracts, budget, timeline, or contact info.
4. Outcome & Guidance: How the AI assisted them (e.g. directed to email/WhatsApp, resume, or contact form).

Conversation Transcript:
${transcriptText}`;

        try {
          const summaryResponse = await getGeminiChatCompletion(
            [{ role: 'user', content: 'Provide a comprehensive executive summary of this conversation transcript.' }],
            summaryPrompt,
            { model: aiConfig.modelSelection || 'gemini-flash-lite-latest', temperature: 0.3 }
          );
          if (summaryResponse) {
            summaryText = summaryResponse.replace(/^"|"$/g, '').trim();
          }
        } catch (e) {
          const userQueries = userMsgs.map(m => m.content);
          summaryText = `• Visitor Inquiries: ${userQueries.join('; ')}\n• Conversation Volume: ${history.length} messages exchanged with AI assistant.\n• Topics Discussed: Engineering background, portfolio project scope, and technical capabilities.`;
        }
      }

      const isNewChat = history.filter(m => m.role === 'user').length === 1;

      // Save to chatConversations collection
      const ref = doc(db, 'chatConversations', convId);
      await setDoc(ref, {
        conversationId: convId,
        visitorId,
        messages: history.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
        summary: summaryText,
        createdAt: sessionCreatedAtRef.current,
        updatedAt: new Date().toLocaleString(),
        archived: false,
        read: false
      }, { merge: true });

      if (isNewChat) {
        logNotification('New AI Chat Conversation', `Visitor started session (${convId}): "${summaryText.substring(0, 100)}..."`, 'ai');
      }
    } catch (err) {
      console.warn('Telemetry error generating chat summary:', err);
      logNotification('Firestore Error', `AI Conversation storage error: ${err.message}`, 'firestore_error');
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2 || isLoading) return;
    const history = [...messages];
    let lastUserIdx = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;

    // Prune back to last user query
    const trimmed = history.slice(0, lastUserIdx + 1);
    setMessages(trimmed);
    setIsLoading(true);

    const botPlaceholderIndex = trimmed.length;
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', timestamp: getCurrentTime() }
    ]);

    const controller = new AbortController();
    streamAbortControllerRef.current = controller;

    let accumulatedText = '';
    try {
      await getGeminiChatCompletionStream(
        trimmed.filter(m => m.role !== 'system'),
        systemPrompt,
        (chunk, done) => {
          if (done) {
            setIsLoading(false);
            const finalMessages = [...trimmed, { role: 'assistant', content: accumulatedText, timestamp: getCurrentTime() }];
            setMessages(finalMessages);
            generateSummaryAndSave(finalMessages);
            return;
          }
          accumulatedText += chunk;
          setMessages(prev => {
            const copy = [...prev];
            if (copy[botPlaceholderIndex]) {
              copy[botPlaceholderIndex].content = accumulatedText;
            }
            return copy;
          });
        },
        (error) => {
          setIsLoading(false);
          setMessages(prev => [
            ...prev.slice(0, botPlaceholderIndex),
            { role: 'assistant', content: `AI completion error: ${error.message || 'Something went wrong.'}`, timestamp: getCurrentTime() }
          ]);
        },
        controller.signal,
        {
          model: aiConfig.modelSelection || 'gemini-flash-lite-latest',
          temperature: aiConfig.temperature || 0.6
        }
      );
    } catch (err) {
      console.warn('Regeneration error:', err);
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear conversation and start a fresh session?')) {
      if (streamAbortControllerRef.current) {
        streamAbortControllerRef.current.abort();
      }
      const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setConvId(newId);
      sessionCreatedAtRef.current = new Date().toLocaleString();
      setMessages([{ role: 'assistant', content: aiConfig.greetingMessage, timestamp: getCurrentTime() }]);
    }
  };

  // If AI is disabled in Admin Config, do not render at all
  if (aiConfig.enabled === false) {
    return null;
  }

  return (
    <div className="chatbot-wrapper">
      {/* 3D Floating Action Button */}
      <div className="chatbot-float-container">
        {!isOpen && (
          <div className="chatbot-float-tooltip">
            <span className="tooltip-sparkle">✨</span>
            <span>Ask Usman's AI</span>
          </div>
        )}
        <CyberRobotButton
          isOpen={isOpen}
          onClick={handleOpenToggle}
          ariaLabel={isOpen ? 'Close AI assistant panel' : 'Open AI assistant panel'}
        />
      </div>

      {/* 3D Glassmorphic Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-window viewport-3d-box" role="dialog" aria-label="AI Assistant Dialog">
          {/* Ambient 3D Animated Background Blobs */}
          <div className="chatbot-3d-bg" aria-hidden="true">
            <div className="blob-3d blob-1" />
            <div className="blob-3d blob-2" />
            <div className="glass-specular-highlight" />
          </div>

          {/* 3D Header */}
          <div className="chatbot-header header-3d-bar">
            <div className="header-info">
              <div className="bot-avatar avatar-3d-box" aria-hidden="true">
                <Brain size={18} />
                <div className="avatar-3d-ring" />
              </div>
              <div className="bot-meta">
                <div className="meta-title-row">
                  <h4>Usman's AI</h4>
                  <span className="meta-badge-3d">Google Gemini</span>
                </div>
                <div className="meta-status-row">
                  <span className="bot-online-tag">Online</span>
                  <span className="status-divider">•</span>
                  <div className="audio-wave-visualizer" title="AI Voice Active">
                    <span className="bar bar-1" />
                    <span className="bar bar-2" />
                    <span className="bar bar-3" />
                  </div>
                  <span className="status-label">Active Neural Link</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="chatbot-header-btn action-3d-btn"
                onClick={handleClear}
                title="Start New Chat"
                aria-label="Start New Chat"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                className="chatbot-header-btn action-3d-btn"
                onClick={handleOpenToggle}
                title="Close Chat Panel"
                aria-label="Close Chat Panel"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Thread Body */}
          <div className="chatbot-body body-3d-thread" ref={scrollRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble-row ${msg.role === 'user' ? 'is-user' : 'is-bot'}`}>
                <div className="chat-bubble-wrapper">
                  <div className="chat-bubble bubble-3d-style">
                    {msg.role === 'assistant' ? parseMarkdown(msg.content) : <p className="chatbot-line-text">{msg.content}</p>}
                  </div>
                  <span className="msg-timestamp">{msg.timestamp || 'Just now'}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble-row is-bot">
                <div className="chat-bubble bubble-3d-style typing-3d-dots">
                  <div className="typing-dot dot-1" />
                  <div className="typing-dot dot-2" />
                  <div className="typing-dot dot-3" />
                  <span className="typing-text">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions Block */}
          {messages.length === 1 && suggestions.length > 0 && !isLoading && (
            <div className="chatbot-suggestions-container suggestions-3d-box">
              <span className="suggestions-label">Suggested Questions:</span>
              <div className="suggestions-grid">
                {suggestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chatbot-suggestion-pill pill-3d-chip"
                    onClick={() => handleSend(q)}
                  >
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input Form */}
          <div className="chatbot-footer-wrapper footer-3d-box">
            {messages.length > 1 && !isLoading && (
              <button
                type="button"
                className="chatbot-regen-btn regen-3d-btn"
                onClick={handleRegenerate}
                title="Regenerate Last Reply"
              >
                <RefreshCw size={11} className="spin-icon" />
                <span>Regenerate Response</span>
              </button>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="chatbot-footer"
            >
              <div className="footer-input-row input-3d-capsule">
                <input
                  type="text"
                  placeholder="Ask about Usman's skills, projects..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  aria-label="Ask a question about Muhammad Usman"
                />
                <button
                  type="submit"
                  className="chatbot-send-btn send-3d-btn"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
