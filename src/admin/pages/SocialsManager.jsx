import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Share2,
  X,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './SocialsManager.css';

const DEFAULT_SOCIALS = {
  github: 'https://github.com/usaaman/',
  linkedin: 'https://www.linkedin.com/in/muhammad-usman-a76984378/',
  email: 'musmannazir97@gmail.com',
  whatsapp: 'https://wa.me/923000000000',
  portfolio: 'https://usman.dev',
  youtube: '',
  instagram: '',
  x: '',
};

export default function SocialsManager() {
  const [socials, setSocials] = useState({ ...DEFAULT_SOCIALS });
  const [customLinks, setCustomLinks] = useState([
    { id: 1, label: 'Dribbble', url: 'https://dribbble.com/usman' }
  ]);

  const [initialSocials, setInitialSocials] = useState({ ...DEFAULT_SOCIALS });
  const [initialCustomLinks, setInitialCustomLinks] = useState([
    { id: 1, label: 'Dribbble', url: 'https://dribbble.com/usman' }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'socialLinks', 'singleton'));
          if (snap.exists()) {
            const data = snap.data();
            const loadedSocs = data.socials || { ...DEFAULT_SOCIALS };
            const loadedCust = data.customLinks || [];
            setSocials(loadedSocs);
            setCustomLinks(loadedCust);
            setInitialSocials(loadedSocs);
            setInitialCustomLinks(loadedCust);
          }
        }
      } catch (e) {
        console.warn('Failed fetching Socials from Firestore:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty =
      JSON.stringify(socials) !== JSON.stringify(initialSocials) ||
      JSON.stringify(customLinks) !== JSON.stringify(initialCustomLinks);
    setIsDirty(dirty);
  }, [socials, customLinks, initialSocials, initialCustomLinks]);

  // Unsaved changes unload handler
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

  const validateUrl = (id, val) => {
    if (!val) return true;
    if (id === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val);
    }
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  };

  const handleSocialChange = (e) => {
    const { id, value } = e.target;
    setSocials((prev) => ({ ...prev, [id]: value }));

    const isValid = validateUrl(id, value);
    setErrors((prev) => ({
      ...prev,
      [id]: isValid ? null : id === 'email' ? 'Invalid email format' : 'Must be a valid URL',
    }));
  };

  const handleCustomChange = (id, field, value) => {
    setCustomLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const addCustomLink = () => {
    setCustomLinks((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: 'New Link',
        url: 'https://',
      }
    ]);
  };

  const deleteCustomLink = (id) => {
    setCustomLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        const snap = await getDoc(doc(db, 'socialLinks', 'singleton'));
        const existingData = snap.exists() ? snap.data() : {};
        const payload = {
          ...existingData,
          socials,
          customLinks,
        };
        await setDoc(doc(db, 'socialLinks', 'singleton'), payload);
        setInitialSocials(socials);
        setInitialCustomLinks(customLinks);
        setIsDirty(false);
        setSaveStatus('success');
      }
    } catch (error) {
      console.error('Error writing Socials to Firestore:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all social links to template defaults? (Requires save to commit)')) {
      setSocials({ ...DEFAULT_SOCIALS });
      setCustomLinks([{ id: 1, label: 'Dribbble', url: 'https://dribbble.com/usman' }]);
      setErrors({});
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard unsaved changes?')) {
        setSocials({ ...initialSocials });
        setCustomLinks([...initialCustomLinks]);
        setErrors({});
      }
    }
  };

  return (
    <div className="socials-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="Social Links Config"
          description="Maintain and update connection anchors to external developer profiles."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
                <RotateCcw size={16} /> Reset
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save size={16} /> Save Links
              </Button>
            </>
          }
        />

        {saveStatus === 'success' && (
          <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✓ Social links saved successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving social links.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save Links to update.</span>
          </div>
        )}

        <div className="socials-layout-grid">
          {/* Main profile connections */}
          <div className="socials-main-panel">
            <SectionCard title="Core Profiles" description="Core connection accounts displayed in header & footer blocks.">
              <div className="form-row-2">
                <Input
                  id="github"
                  label="GitHub Profile URL"
                  value={socials.github}
                  onChange={handleSocialChange}
                  error={errors.github}
                />

                <Input
                  id="linkedin"
                  label="LinkedIn Profile URL"
                  value={socials.linkedin}
                  onChange={handleSocialChange}
                  error={errors.linkedin}
                />
              </div>

              <div className="form-row-2">
                <Input
                  id="email"
                  label="Contact Email Address"
                  value={socials.email}
                  onChange={handleSocialChange}
                  error={errors.email}
                />

                <Input
                  id="whatsapp"
                  label="WhatsApp Web Link"
                  placeholder="https://wa.me/92300..."
                  value={socials.whatsapp}
                  onChange={handleSocialChange}
                  error={errors.whatsapp}
                />
              </div>

              <div className="form-row-2">
                <Input
                  id="portfolio"
                  label="Personal Web Domain"
                  value={socials.portfolio}
                  onChange={handleSocialChange}
                  error={errors.portfolio}
                />

                <Input
                  id="x"
                  label="Twitter / X profile URL"
                  placeholder="https://x.com/username"
                  value={socials.x}
                  onChange={handleSocialChange}
                  error={errors.x}
                />
              </div>
            </SectionCard>

            <SectionCard title="Secondary Profiles" description="Optional social media accounts.">
              <div className="form-row-2">
                <Input
                  id="youtube"
                  label="YouTube Channel URL"
                  placeholder="https://youtube.com/@channel"
                  value={socials.youtube}
                  onChange={handleSocialChange}
                  error={errors.youtube}
                />

                <Input
                  id="instagram"
                  label="Instagram Page"
                  placeholder="https://instagram.com/username"
                  value={socials.instagram}
                  onChange={handleSocialChange}
                  error={errors.instagram}
                />
              </div>
            </SectionCard>
          </div>

          {/* Custom Link integrations column */}
          <div className="socials-side-panel">
            <SectionCard
              title="Custom Profiles"
              description="Deploy additional anchors dynamically."
              actions={
                <Button type="button" variant="ghost" size="sm" onClick={addCustomLink}>
                  <Plus size={14} /> Add Custom Link
                </Button>
              }
            >
              {customLinks.length === 0 ? (
                <div className="custom-socials-empty">
                  <Share2 size={24} />
                  <span>No custom profile links configured.</span>
                </div>
              ) : (
                <div className="custom-socials-list">
                  {customLinks.map((link) => (
                    <div key={link.id} className="custom-social-row">
                      <div className="custom-row-inputs">
                        <Input
                          id={`custom-label-${link.id}`}
                          label="Platform Label"
                          value={link.label}
                          onChange={(e) => handleCustomChange(link.id, 'label', e.target.value)}
                        />
                        <Input
                          id={`custom-url-${link.id}`}
                          label="Target URL"
                          value={link.url}
                          onChange={(e) => handleCustomChange(link.id, 'url', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="custom-row-delete-btn"
                        onClick={() => deleteCustomLink(link.id)}
                        aria-label="Delete custom link"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </form>
    </div>
  );
}
