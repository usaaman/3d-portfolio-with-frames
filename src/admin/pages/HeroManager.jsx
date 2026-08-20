import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './HeroManager.css';

const DEFAULT_HERO_DATA = {
  greetText: "Hi, I'm",
  name: 'Muhammad Usman',
  heading: 'Muhammad Usman',
  role: 'Full-Stack Developer | AI Integration Specialist | Video Editor',
  description: 'I build intelligent web applications and craft engaging visual stories — turning ideas into functional, beautiful digital products.',
  backgroundText: 'USMAN',
  resumeBtnText: 'Download Resume',
  resumeFileUrl: '/resume.pdf',
  cta1Text: 'View My Work',
  cta1Link: '#projects',
  cta2Text: 'Download Resume',
  cta2Link: '/resume.pdf',
  githubUrl: 'https://github.com/usaaman/',
  linkedinUrl: 'https://www.linkedin.com/in/muhammad-usman-a76984378/',
  twitterUrl: 'https://twitter.com/',
  emailAddress: 'musmannazir97@gmail.com',
  avatarUrl: '/favicon.svg', // static preview placeholder
};

export default function HeroManager() {
  const [formData, setFormData] = useState({ ...DEFAULT_HERO_DATA });
  const [initialData, setInitialData] = useState({ ...DEFAULT_HERO_DATA });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'hero', 'singleton'));
          if (snap.exists()) {
            const data = snap.data();
            setFormData(data);
            setInitialData(data);
          }
        }
      } catch (e) {
        console.warn('Failed fetching Hero from Firestore:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(dirty);
  }, [formData, initialData]);

  // Unsaved changes warning
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
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        await setDoc(doc(db, 'hero', 'singleton'), formData);
      }
      setInitialData(formData);
      setIsDirty(false);
      setSaveStatus('success');
    } catch (error) {
      console.error('Error writing Hero to Firestore:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields in this section to default portfolio states? (Requires save to commit)')) {
      setFormData({ ...DEFAULT_HERO_DATA });
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
    <div className="hero-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="Hero Section Manager"
          description="Update your primary title greetings, professional taglines, calls to action, file links, and social anchors."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
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
            ✓ Hero details saved successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving hero details.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save Changes to update.</span>
          </div>
        )}

        <div className="hero-manager-grid">
          {/* Main Copy Details */}
          <div className="hero-manager-main">
            <SectionCard title="Text Copy Configuration" description="Edit the headers, greetings, and short pitches.">
              <div className="form-row-2">
                <Input
                  id="greetText"
                  label="Greeting Text"
                  value={formData.greetText}
                  onChange={handleChange}
                />
                <Input
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <Input
                id="role"
                label="Role Tagline / Title"
                value={formData.role}
                onChange={handleChange}
              />

              <Textarea
                id="description"
                label="Main Description Paragraph"
                value={formData.description}
                onChange={handleChange}
              />

              <div className="form-row-2">
                <Input
                  id="backgroundText"
                  label="Background Backdrop Typography"
                  value={formData.backgroundText}
                  onChange={handleChange}
                />
                <Input
                  id="avatarUrl"
                  label="Character Asset Preview Frame"
                  value={formData.avatarUrl}
                  disabled
                  helperText="Editable asset files are managed in Media Library in Phase 02."
                />
              </div>
            </SectionCard>

            <SectionCard title="Buttons & Navigation CTAs" description="Define label texts and anchor paths.">
              <div className="form-row-2">
                <Input
                  id="cta1Text"
                  label="Primary Button Label"
                  value={formData.cta1Text}
                  onChange={handleChange}
                />
                <Input
                  id="cta1Link"
                  label="Primary Button Anchor URL"
                  value={formData.cta1Link}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row-2">
                <Input
                  id="cta2Text"
                  label="Secondary Button Label"
                  value={formData.cta2Text}
                  onChange={handleChange}
                />
                <Input
                  id="cta2Link"
                  label="Secondary Button Anchor URL"
                  value={formData.cta2Link}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row-2">
                <Input
                  id="resumeBtnText"
                  label="Resume Button Text override"
                  value={formData.resumeBtnText}
                  onChange={handleChange}
                />
                <Input
                  id="resumeFileUrl"
                  label="Resume PDF Document Path"
                  value={formData.resumeFileUrl}
                  onChange={handleChange}
                />
              </div>
            </SectionCard>
          </div>

          {/* Socials & Assets Preview side column */}
          <div className="hero-manager-side">
            <SectionCard title="Social Accounts Connections" description="Link your profile URLs.">
              <Input
                id="githubUrl"
                label="GitHub URL"
                value={formData.githubUrl}
                onChange={handleChange}
              />
              <Input
                id="linkedinUrl"
                label="LinkedIn URL"
                value={formData.linkedinUrl}
                onChange={handleChange}
              />
              <Input
                id="twitterUrl"
                label="Twitter/X URL"
                value={formData.twitterUrl}
                onChange={handleChange}
              />
              <Input
                id="emailAddress"
                label="Contact Email Address"
                value={formData.emailAddress}
                onChange={handleChange}
              />
            </SectionCard>

            <SectionCard title="Preview Thumbnail" description="Visual landing render helper.">
              <div className="avatar-preview-box">
                <img
                  src={formData.avatarUrl}
                  alt="Character asset render preview"
                  className="avatar-preview-img"
                />
                <div className="avatar-info-overlay">
                  <span>Asset Frame #138 (Active)</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </form>
    </div>
  );
}
