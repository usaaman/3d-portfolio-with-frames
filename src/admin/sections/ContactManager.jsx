import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Mail, Save, Check, AlertCircle, Phone, Globe, Sparkles, ExternalLink } from 'lucide-react';

export default function ContactManager({ initialData, onSaved }) {
  const [socials, setSocials] = useState({
    email: 'musmannazir97@gmail.com',
    whatsapp: 'https://wa.me/923045160142',
    github: 'https://github.com/usaaman/',
    linkedin: 'https://www.linkedin.com/in/muhammad-usman-a76984378/',
    x: 'https://twitter.com/',
    portfolio: 'https://usman.dev',
    youtube: '',
    instagram: '',
    heading: "Let's build something great together",
    subheading: "Have a project in mind or want to explore an intelligent software collaboration? Drop a message below or connect directly.",
    ...(initialData?.socials || initialData)
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (initialData) {
      const data = initialData.socials || initialData;
      setSocials(prev => ({ ...prev, ...data }));
      return;
    }
    async function loadSocials() {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, 'socialLinks', 'singleton'));
        if (snap.exists()) {
          const d = snap.data();
          const data = d.socials || d;
          setSocials(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Could not load socials from firestore:', err);
      }
    }
    loadSocials();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocials(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      socials: { ...socials },
      updatedAt: new Date().toISOString()
    };

    try {
      if (db) {
        await setDoc(doc(db, 'socialLinks', 'singleton'), payload, { merge: true });
      }
      setFeedback({ type: 'success', message: 'Contact channels & social links updated live!' });
      if (onSaved) onSaved(payload);
    } catch (err) {
      console.error('Failed saving contact info:', err);
      setFeedback({ type: 'error', message: 'Failed to update contact info. ' + err.message });
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

      {/* Primary Communication Channels */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Mail className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Direct Contact Channels</h3>
              <p className="adm-card-subtitle">
                Keep your direct messaging channels updated. All links are live and interactive on the portfolio.
              </p>
            </div>
          </div>
          <button type="submit" className="adm-btn-save-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Contact Channels'}</span>
          </button>
        </div>

        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">Primary Contact Email</label>
            <input
              type="email"
              name="email"
              value={socials.email || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="musmannazir97@gmail.com"
              required
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">WhatsApp Direct Link / Number</label>
            <input
              type="text"
              name="whatsapp"
              value={socials.whatsapp || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://wa.me/923045160142"
            />
          </div>

          <div className="adm-field adm-form-grid-full">
            <label className="adm-label">Contact Section Main Heading</label>
            <input
              type="text"
              name="heading"
              value={socials.heading || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="Let's build something great together"
            />
          </div>

          <div className="adm-field adm-form-grid-full">
            <label className="adm-label">Contact Section Subtitle</label>
            <textarea
              name="subheading"
              value={socials.subheading || ''}
              onChange={handleChange}
              className="adm-textarea"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Social Media & Developer Profiles */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title-group">
            <Globe className="adm-card-icon" size={22} />
            <div>
              <h3 className="adm-card-title">Developer & Social Profiles</h3>
              <p className="adm-card-subtitle">Connected profiles linked in header, contact globe, and footer.</p>
            </div>
          </div>
        </div>

        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">GitHub Profile</label>
            <input
              type="url"
              name="github"
              value={socials.github || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://github.com/usaaman/"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              value={socials.linkedin || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://www.linkedin.com/in/muhammad-usman-a76984378/"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">X / Twitter Profile</label>
            <input
              type="url"
              name="x"
              value={socials.x || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Custom Portfolio Link</label>
            <input
              type="url"
              name="portfolio"
              value={socials.portfolio || ''}
              onChange={handleChange}
              className="adm-input"
              placeholder="https://usman.dev"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
