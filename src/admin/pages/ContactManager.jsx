import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_CONTACT_DATA = {
  heading: "Let's build something great together",
  description: "Great products start with great conversations. Tell me a bit about what you're working on — I read every message myself.",
  email: "musmannazir97@gmail.com",
  whatsapp: "https://wa.me/923045160142",
  github: "https://github.com/usaaman/",
  linkedin: "https://www.linkedin.com/in/muhammad-usman-a76984378/",
};

export default function ContactManager() {
  const [formData, setFormData] = useState({ ...DEFAULT_CONTACT_DATA });
  const [initialData, setInitialData] = useState({ ...DEFAULT_CONTACT_DATA });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'socialLinks', 'singleton'));
          if (snap.exists()) {
            const data = snap.data();
            const loaded = {
              heading: data.heading || DEFAULT_CONTACT_DATA.heading,
              description: data.description || DEFAULT_CONTACT_DATA.description,
              email: data.socials?.email || '',
              whatsapp: data.socials?.whatsapp || '',
              github: data.socials?.github || '',
              linkedin: data.socials?.linkedin || '',
            };
            setFormData(loaded);
            setInitialData(loaded);
          }
        }
      } catch (e) {
        console.warn('Failed to load contact settings:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(dirty);
  }, [formData, initialData]);

  // Unsaved changes prompt before navigation/close
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
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        // Read full socials to merge to avoid overwriting customLinks
        const snap = await getDoc(doc(db, 'socialLinks', 'singleton'));
        const existingData = snap.exists() ? snap.data() : { socials: {}, customLinks: [] };
        
        const payload = {
          ...existingData,
          heading: formData.heading,
          description: formData.description,
          socials: {
            ...existingData.socials,
            email: formData.email,
            whatsapp: formData.whatsapp,
            github: formData.github,
            linkedin: formData.linkedin,
          }
        };

        await setDoc(doc(db, 'socialLinks', 'singleton'), payload);
        setInitialData({ ...formData });
        setIsDirty(false);
        setSaveStatus('success');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Discard all unsaved changes and reset form to last saved state?')) {
      setFormData({ ...initialData });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard all unsaved changes?')) {
        setFormData({ ...initialData });
      }
    }
  };

  return (
    <div className="contact-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="Contact Section Manager"
          description="Edit the header texts, physical methods, email, and social handles displayed in the portfolio footer."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving || !isDirty}>
                <RotateCcw size={16} /> Reset
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save size={16} /> Save Changes
              </Button>
            </>
          }
        />

        {saveStatus === 'success' && (
          <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✓ Contact section settings saved successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving contact settings.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save Changes to update.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SectionCard title="Contact Page Copy" description="Configure headings and paragraph pitches.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                id="heading"
                label="Contact Heading"
                value={formData.heading}
                onChange={handleChange}
              />
              <Textarea
                id="description"
                label="Contact Section Subtitle Pitch"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          <SectionCard title="Direct Contact Methods" description="Emails, phones, and message links.">
            <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                id="email"
                label="Contact Email Address"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                id="whatsapp"
                label="WhatsApp API Url"
                placeholder="https://wa.me/923000000000"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          <SectionCard title="Primary Social Anchors" description="GitHub and LinkedIn links.">
            <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                id="github"
                label="GitHub Link"
                placeholder="https://github.com/..."
                value={formData.github}
                onChange={handleChange}
              />
              <Input
                id="linkedin"
                label="LinkedIn Link"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
