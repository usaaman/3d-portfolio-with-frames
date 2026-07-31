import React, { useState, useEffect } from 'react';
import { Save, Database, RotateCcw, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import usePortfolioData from '../hooks/usePortfolioData';

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  notificationEmail: 'musmannazir97@gmail.com',
  siteUrl: 'https://usman.dev',
};

export default function SettingsManager() {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [initialSettings, setInitialSettings] = useState({ ...DEFAULT_SETTINGS });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  // Hook seeder function
  const { seedDatabase } = usePortfolioData();

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'settings', 'singleton'));
          if (snap.exists()) {
            const data = snap.data();
            setSettings(data);
            setInitialSettings(data);
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setIsDirty(dirty);
  }, [settings, initialSettings]);

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
    setSettings((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        await setDoc(doc(db, 'settings', 'singleton'), settings);
      }
      setInitialSettings({ ...settings });
      setIsDirty(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields in this section to default states? (Requires save to commit)')) {
      setSettings({ ...DEFAULT_SETTINGS });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard all unsaved changes?')) {
        setSettings({ ...initialSettings });
      }
    }
  };

  return (
    <div className="settings-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="System Settings"
          description="Manage general dashboard rules, site notifications, and cloud databases seeding."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
                <RotateCcw size={16} /> Reset
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save size={16} /> Save Settings
              </Button>
            </>
          }
        />

        {saveStatus === 'success' && (
          <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✓ System settings updated successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving system settings.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save Settings to update.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SectionCard title="General Options" description="Operational details.">
            <div className="form-row-2">
              <Input
                id="notificationEmail"
                label="Notification Alert Email"
                value={settings.notificationEmail}
                onChange={handleChange}
              />
              <Input
                id="siteUrl"
                label="Public Website Canonical URL"
                value={settings.siteUrl}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="maintenanceMode" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)', cursor: 'pointer' }}>
                Activate Maintenance Mode (public landing redirect)
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Database Utilities &amp; Seeding" description="Initialize Firestore with template structures.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '12px', color: 'var(--ds-color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                Click below to seed default template listings for Hero, About, Skills, Projects, and Services directly to your live Firestore database.
                This is recommended on initial runs to populate structural schemas.
              </p>
              <Button type="button" variant="ghost" onClick={seedDatabase} style={{ gap: '8px' }}>
                <Database size={16} /> Seed Default Firestore Templates
              </Button>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
