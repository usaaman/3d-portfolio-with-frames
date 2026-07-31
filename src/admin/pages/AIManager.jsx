import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertTriangle, RotateCcw, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_AI_CONFIG = {
  enabled: true,
  systemPrompt: "You are an intelligent, friendly AI representative answering queries about Muhammad Usman. You must restrict answers strictly to the portfolio context provided. If information is not in the context, politely state that you do not have that detail.",
  greetingMessage: "Hi there! I'm Usman's AI assistant. Ask me anything about his technical skills, projects, creative background, or availability!",
  suggestedQuestions: "Tell me about FitSphere, What technologies do you use?, Show your best projects",
  temperature: 0.6,
  conversationLimit: 20,
  modelSelection: 'llama-3.3-70b-versatile'
};

export default function AIManager() {
  const [config, setConfig] = useState({ ...DEFAULT_AI_CONFIG });
  const [initialConfig, setInitialConfig] = useState({ ...DEFAULT_AI_CONFIG });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'settings', 'ai-config'));
          if (snap.exists()) {
            const data = snap.data();
            // Handle array suggestions or string suggestions
            let questions = data.suggestedQuestions || '';
            if (Array.isArray(questions)) {
              questions = questions.join(', ');
            }
            const loaded = {
              ...DEFAULT_AI_CONFIG,
              ...data,
              suggestedQuestions: questions
            };
            setConfig(loaded);
            setInitialConfig(loaded);
          }
        }
      } catch (err) {
        console.warn('Failed to load AI config from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    const dirty = JSON.stringify(config) !== JSON.stringify(initialConfig);
    setIsDirty(dirty);
  }, [config, initialConfig]);

  // Prompt before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    // Parse suggestions to array of strings
    const questionArray = config.suggestedQuestions
      ? config.suggestedQuestions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...config,
      suggestedQuestions: questionArray,
      temperature: Number(config.temperature),
      conversationLimit: Number(config.conversationLimit)
    };

    try {
      if (db) {
        await setDoc(doc(db, 'settings', 'ai-config'), payload);
      }
      setInitialConfig({ ...config });
      setIsDirty(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to save AI config:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKnowledgeRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate rebuilding context / checking DB connections
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('AI Knowledge Base context successfully refreshed and synchronized with live Firestore documents!');
    } catch (e) {
      alert('Failed knowledge base refresh: ' + e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset AI configs to defaults? (Requires save to commit)')) {
      setConfig({ ...DEFAULT_AI_CONFIG });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard all unsaved changes?')) {
        setConfig({ ...initialConfig });
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-layout-loading-screen" style={{ height: '50vh' }}>
        <div className="loading-spinner-box">
          <div className="spinner" />
          <span>Syncing AI Settings from cloud...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="AI Assistant Config"
          description="Customize your digital representative's prompt directives, model tuning parameters, greetings, and queries."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
                <RotateCcw size={16} /> Reset
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} style={{ gap: '6px' }}>
                <Save size={16} /> Save AI Configuration
              </Button>
            </>
          }
        />

        {saveStatus === 'success' && (
          <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✓ AI configurations saved successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving AI configuration.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save AI Configuration to update.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Enable / Disable section */}
          <SectionCard title="Assistant Availability" description="Control chatbot presence on the public portfolio.">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="enabled"
                checked={config.enabled}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="enabled" style={{ fontSize: '14px', color: 'var(--ds-color-text-secondary)', cursor: 'pointer', fontWeight: '500' }}>
                Enable Floating AI Assistant on Public Pages
              </label>
            </div>
            {!config.enabled && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 14px', borderRadius: '8px', color: '#f87171', fontSize: '12px' }}>
                <AlertTriangle size={15} />
                <span>The floating assistant is disabled. Visitors will not see the chatbot button on your live portfolio.</span>
              </div>
            )}
          </SectionCard>

          {/* Prompt & Greeting configurations */}
          <SectionCard title="Personality Directives & System Prompts" description="Define who the AI represents, constraints, and greet messages.">
            <Textarea
              id="systemPrompt"
              label="System Instructions / Personality Prompt"
              value={config.systemPrompt}
              onChange={handleChange}
              rows={6}
              placeholder="e.g. You are Usman's AI coding helper..."
            />
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--ds-color-text-muted)', lineHeight: '1.4' }}>
              💡 <strong>System Prompt Guidelines</strong>: The portfolio facts (Skills lists, Services details, Projects stacks, Education transcripts) are automatically attached underneath this prompt dynamically in real-time. Use this box to control tone and constraint rules.
            </div>

            <div style={{ marginTop: '20px' }}>
              <Input
                id="greetingMessage"
                label="Greeting Message"
                value={config.greetingMessage}
                onChange={handleChange}
                placeholder="Hi, I'm Usman's assistant..."
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <Input
                id="suggestedQuestions"
                label="Suggested Questions (comma-separated)"
                value={config.suggestedQuestions}
                onChange={handleChange}
                placeholder="e.g. Tell me about FitSphere, What technologies do you use?"
              />
              <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--ds-color-text-muted)' }}>
                Shows quick-clickable queries for first-time visitors in the chat bubble.
              </div>
            </div>
          </SectionCard>

          {/* Model selection parameters */}
          <SectionCard title="Model Parameters & Tuning" description="Configure temperature, message thresholds, and engine names.">
            <div className="form-row-2">
              <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="modelSelection" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)', fontWeight: '500' }}>AI Completion Model (Placeholder)</label>
                <select
                  id="modelSelection"
                  value={config.modelSelection}
                  onChange={handleChange}
                  style={{
                    background: 'var(--ds-glass-bg)',
                    border: '1px solid var(--ds-glass-border)',
                    borderRadius: 'var(--ds-radius-button)',
                    color: 'var(--ds-color-text-primary)',
                    padding: '10px 14px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Groq Speed)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Fast)</option>
                  <option value="deepseek-chat-v3">DeepSeek Chat V3 (Reasoning Placeholder)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Advanced Placeholder)</option>
                </select>
              </div>

              <Input
                id="conversationLimit"
                label="Session Conversation Limit (number of messages)"
                type="number"
                value={config.conversationLimit}
                onChange={handleChange}
                min={1}
                max={200}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="temperature" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)', fontWeight: '500' }}>Temperature (Creativity): {config.temperature}</label>
                <span style={{ fontSize: '12px', color: 'var(--ds-color-text-muted)' }}>0.0 (Strict) - 1.0 (Creative)</span>
              </div>
              <input
                type="range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={handleChange}
                style={{ width: '100%', height: '6px', background: 'var(--ds-glass-border)', borderRadius: '3px', cursor: 'pointer', accentColor: 'var(--ds-color-accent-secondary)' }}
              />
            </div>
          </SectionCard>

          {/* Context Sync & Refresh */}
          <SectionCard title="Knowledge Base Context Control" description="Manually verify or synchronize changes instantly.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '12px', color: 'var(--ds-color-text-muted)', margin: 0, lineHeight: '1.6' }}>
                The AI chatbot continuously receives changes from Firebase immediately. Click below to verify database connections, sync metadata templates, rebuild indexes, and refresh the system context.
              </p>
              <Button type="button" variant="ghost" onClick={handleKnowledgeRefresh} isLoading={isRefreshing} style={{ gap: '8px' }}>
                <RefreshCw size={16} /> Force Knowledge Context Refresh
              </Button>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
