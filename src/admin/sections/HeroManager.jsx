import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, User, Image, Link, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function HeroManager({ initialData, onSaved }) {
  const [formData, setFormData] = useState({
    greetText: "Hi, I'm",
    name: 'Muhammad Usman',
    heading: 'Muhammad Usman',
    role: 'Full-Stack Developer | AI Integration Specialist | Video Editor',
    description: 'I build intelligent web applications and craft engaging visual stories — turning ideas into functional, beautiful digital products.',
    backgroundText: 'USMAN',
    cta1Text: 'View My Work',
    cta1Link: '#projects',
    cta2Text: 'Download Resume',
    cta2Link: '/resume.pdf',
    githubUrl: 'https://github.com/usaaman/',
    linkedinUrl: 'https://www.linkedin.com/in/muhammad-usman-a76984378/',
    twitterUrl: 'https://twitter.com/',
    emailAddress: 'musmannazir97@gmail.com',
    avatarUrl: '/favicon.svg',
    ...initialData
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      return;
    }
    async function loadHero() {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, 'hero', 'singleton'));
        if (snap.exists()) {
          setFormData(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.warn('Could not fetch hero from firestore:', err);
      }
    }
    loadHero();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // 1. Immediately cache locally so UI/UX updates without waiting
    try {
      localStorage.setItem('portfolio_cache_hero', JSON.stringify(formData));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'portfolio_cache_hero',
        newValue: JSON.stringify(formData)
      }));
    } catch {}

    // 2. Sync to Cloud Firestore
    try {
      if (db) {
        await setDoc(doc(db, 'hero', 'singleton'), formData, { merge: true });
      }
      setFeedback({ type: 'success', message: 'Hero Section updated live on Cloud Firestore & Portfolio!' });
      if (onSaved) onSaved(formData);
    } catch (err) {
      console.warn('Firebase error saving hero:', err);
      if (err.code === 'permission-denied' || err.message?.includes('insufficient permissions')) {
        setFeedback({
          type: 'error',
          message: 'Saved to your portfolio view! Note: Cloud Firestore write was blocked by Firebase Rules (Permission Denied). Please update Firestore Database Rules in Firebase Console to allow write.'
        });
      } else {
        setFeedback({ type: 'error', message: 'Failed to sync with Firebase: ' + err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      {feedback && (
        <div className={`adm-toast-banner ${feedback.type === 'success' ? 'adm-toast-success' : 'adm-toast-error'}`}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Copy Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <User className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Hero Typography & Roles</h3>
              <p className="adm-card-subtitle">Control the first impression visitors see on your portfolio landing page.</p>
            </div>
          </div>
          <button type="submit" className="adm-btn-save-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Hero Changes'}</span>
          </button>
        </div>

        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">Greeting Prefix</label>
            <input
              type="text"
              name="greetText"
              value={formData.greetText || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="Hi, I'm"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Display Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="Muhammad Usman"
            />
          </div>

          <div className="adm-field adm-form-grid-full">
            <label className="adm-label">Primary Role / Subheading</label>
            <input
              type="text"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="Full-Stack Developer | AI Integration Specialist | Video Editor"
            />
          </div>

          <div className="adm-field adm-form-grid-full">
            <label className="adm-label">Hero Introduction Paragraph</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="adm-textarea"
              rows={3}
              placeholder="I build intelligent web applications..."
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Background Watermark Text</label>
            <input
              type="text"
              name="backgroundText"
              value={formData.backgroundText || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="USMAN"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Hero Avatar / Logo URL</label>
            <input
              type="text"
              name="avatarUrl"
              value={formData.avatarUrl || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="/favicon.svg"
            />
          </div>
        </div>
      </div>

      {/* Call to Action Buttons Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Link className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Call to Action (CTA) Buttons</h3>
              <p className="adm-card-subtitle">Manage button texts and destination anchor links.</p>
            </div>
          </div>
        </div>

        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">CTA Button 1 Label</label>
            <input
              type="text"
              name="cta1Text"
              value={formData.cta1Text || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="View My Work"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">CTA Button 1 Target URL / Anchor</label>
            <input
              type="text"
              name="cta1Link"
              value={formData.cta1Link || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="#projects"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">CTA Button 2 Label</label>
            <input
              type="text"
              name="cta2Text"
              value={formData.cta2Text || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="Download Resume"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">CTA Button 2 Target URL</label>
            <input
              type="text"
              name="cta2Link"
              value={formData.cta2Link || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="/resume.pdf"
            />
          </div>
        </div>
      </div>

      {/* Hero Social Links */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Sparkles className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Hero Social Icons</h3>
              <p className="adm-card-subtitle">Direct clickable links in the Hero card bottom row.</p>
            </div>
          </div>
        </div>

        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">GitHub URL</label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://github.com/usaaman/"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">LinkedIn URL</label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://www.linkedin.com/in/..."
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Twitter / X URL</label>
            <input
              type="url"
              name="twitterUrl"
              value={formData.twitterUrl || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Direct Email Address</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="musmannazir97@gmail.com"
            />
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--adm-surface-alt)', paddingTop: '16px' }}>
          <button type="submit" className="adm-btn-save-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save All Hero Changes'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

