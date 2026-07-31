import React, { useState, useEffect } from 'react';
import { Save, FileCode, RotateCcw, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import Input from '../shared/Input';
import Textarea from '../shared/Textarea';
import Button from '../shared/Button';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_SEO = {
  titleTag: 'Muhammad Usman | Full-Stack Developer & Video Editor Portfolio',
  metaDescription: 'Portfolio of Muhammad Usman, student developer at CUST. Specialist in full-stack web products, Firestore databases, and CapCut video editing.',
  keywords: 'Muhammad Usman, Usman portfolio, CUST software engineering, React developer Islamabad',
  ogTitle: 'Muhammad Usman | Developer Portfolio',
  ogDescription: 'Explore the full-stack web development projects, UI designs, and creative video edits of Muhammad Usman.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Muhammad Usman | Developer Portfolio',
  twitterDescription: 'Explore the projects and creative skills of Muhammad Usman.',
  twitterImage: '/og-image.png',
  favicon: '/favicon.svg',
  robots: 'index, follow',
};

export default function SEOManager() {
  const [seo, setSeo] = useState({ ...DEFAULT_SEO });
  const [initialSeo, setInitialSeo] = useState({ ...DEFAULT_SEO });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (db) {
          const snap = await getDoc(doc(db, 'seo', 'singleton'));
          if (snap.exists()) {
            const data = snap.data();
            const loaded = {
              ...DEFAULT_SEO,
              ...data
            };
            setSeo(loaded);
            setInitialSeo(loaded);
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const dirty = JSON.stringify(seo) !== JSON.stringify(initialSeo);
    setIsDirty(dirty);
  }, [seo, initialSeo]);

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
    const { id, value } = e.target;
    setSeo((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (db) {
        await setDoc(doc(db, 'seo', 'singleton'), seo);
      }
      setInitialSeo({ ...seo });
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
    if (window.confirm('Reset SEO tags to template defaults? (Requires save to commit)')) {
      setSeo({ ...DEFAULT_SEO });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Discard all unsaved changes?')) {
        setSeo({ ...initialSeo });
      }
    }
  };

  // Mock sitemap.xml for placeholder preview
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://usman.dev/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://usman.dev/admin</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.1</priority>
  </url>
</urlset>`;

  if (loading) {
    return (
      <div className="admin-layout-loading-screen" style={{ height: '50vh' }}>
        <div className="loading-spinner-box">
          <div className="spinner" />
          <span>Syncing SEO headers from Firestore...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="seo-manager-container">
      <form onSubmit={handleSave}>
        <PageHeader
          title="SEO & Indexer Configurations"
          description="Configure search engine optimization tags, robots directives, social OpenGraph sharing, and sitemaps."
          actions={
            <>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
                <RotateCcw size={16} /> Reset
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving || !isDirty} style={{ color: '#f87171' }}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} style={{ gap: '6px' }}>
                <Save size={16} /> Save SEO Settings
              </Button>
            </>
          }
        />

        {saveStatus === 'success' && (
          <div className="save-success-toast" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✓ SEO tags and indexes saved successfully.
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="save-success-toast" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }} role="status">
            ✕ Error saving SEO settings.
          </div>
        )}

        {isDirty && (
          <div className="unsaved-changes-banner" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️ You have unsaved changes in this form. Click Save SEO Settings to update.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Primary Crawler Section */}
          <SectionCard title="HTML Meta Headers" description="Specify primary indices and keywords.">
            <div className="form-row-2">
              <Input
                id="titleTag"
                label="Primary Title Tag (<title>)"
                value={seo.titleTag}
                onChange={handleChange}
                placeholder="e.g. Muhammad Usman | Full-Stack Developer"
              />
              <Input
                id="favicon"
                label="Favicon Link Href"
                value={seo.favicon}
                onChange={handleChange}
                placeholder="e.g. /favicon.svg"
              />
            </div>

            <Textarea
              id="metaDescription"
              label="Primary Meta Description"
              value={seo.metaDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Provide a search result snippet description..."
            />

            <div className="form-row-2" style={{ marginTop: '16px' }}>
              <Input
                id="keywords"
                label="Meta Keywords (comma-separated)"
                value={seo.keywords}
                onChange={handleChange}
                placeholder="React developer, CUST student..."
              />
              <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="robots" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)', fontWeight: '500' }}>Robots Directive</label>
                <select
                  id="robots"
                  value={seo.robots}
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
                  <option value="index, follow">index, follow (Standard indexer allowed)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Do not index website)</option>
                  <option value="noindex, follow">noindex, follow (Do not index but crawl links)</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* OpenGraph Section */}
          <SectionCard title="OpenGraph Social Cards (Facebook / LinkedIn)" description="Define presentation on Facebook, LinkedIn, etc.">
            <div className="form-row-2">
              <Input
                id="ogTitle"
                label="OG:Title"
                value={seo.ogTitle}
                onChange={handleChange}
                placeholder="Social title..."
              />
              <Input
                id="ogImage"
                label="OG:Image (Absolute Asset URL)"
                value={seo.ogImage}
                onChange={handleChange}
                placeholder="e.g. /og-image.png"
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              <Textarea
                id="ogDescription"
                label="OG:Description"
                value={seo.ogDescription}
                onChange={handleChange}
                rows={2}
                placeholder="Social description snippet..."
              />
            </div>
          </SectionCard>

          {/* Twitter Card Section */}
          <SectionCard title="Twitter Cards Metadata" description="Define presentation on X / Twitter timelines.">
            <div className="form-row-2">
              <Input
                id="twitterTitle"
                label="Twitter:Title"
                value={seo.twitterTitle}
                onChange={handleChange}
                placeholder="Twitter card title..."
              />
              <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="twitterCard" style={{ fontSize: '13px', color: 'var(--ds-color-text-secondary)', fontWeight: '500' }}>Twitter Card Type</label>
                <select
                  id="twitterCard"
                  value={seo.twitterCard}
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
                  <option value="summary_large_image">summary_large_image (Large media preview)</option>
                  <option value="summary">summary (Small thumbnail preview)</option>
                </select>
              </div>
            </div>

            <div className="form-row-2" style={{ marginTop: '16px' }}>
              <Input
                id="twitterImage"
                label="Twitter:Image (Absolute URL)"
                value={seo.twitterImage}
                onChange={handleChange}
                placeholder="e.g. /og-image.png"
              />
              <Textarea
                id="twitterDescription"
                label="Twitter:Description"
                value={seo.twitterDescription}
                onChange={handleChange}
                rows={2}
                placeholder="Twitter description snippet..."
              />
            </div>
          </SectionCard>

          {/* Sitemap XML Placeholder */}
          <SectionCard title="Sitemap XML Index (Placeholder)" description="XML Index helper file for search engine index console.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '10px 14px', borderRadius: '8px', color: '#6ee7b7', fontSize: '12px' }}>
                <FileCode size={15} />
                <span>Dynamic XML Sitemap code structure matches standard search criteria. Copy the template block below into your public folder under sitemap.xml.</span>
              </div>
              <pre style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--ds-glass-border)',
                padding: '12px',
                borderRadius: '6px',
                fontFamily: 'var(--ds-font-mono)',
                fontSize: '11px',
                color: '#a5d6ff',
                overflowX: 'auto',
                margin: 0
              }}>
                {sitemapXml}
              </pre>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
