import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HeroAboutScroll from './components/HeroAboutScroll';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Services from './components/Services';
import Contact from './components/Contact';
import SkyLoader from './components/SkyLoader';
import './App.css';

// Admin Core
import useAuth from './admin/hooks/useAuth';
import AdminLayout from './admin/layouts/AdminLayout';
import Login from './admin/pages/Login';
import usePortfolioData from './admin/hooks/usePortfolioData';
import { initAnalytics, trackSectionView } from './utils/analytics';

const AIChatbot = React.lazy(() => import('./components/AIChatbot'));

// Lazy Loaded CMS Pages
const Dashboard = React.lazy(() => import('./admin/pages/Dashboard'));
const HeroManager = React.lazy(() => import('./admin/pages/HeroManager'));
const AboutManager = React.lazy(() => import('./admin/pages/AboutManager'));
const ProjectsManager = React.lazy(() => import('./admin/pages/ProjectsManager'));
const ServicesManager = React.lazy(() => import('./admin/pages/ServicesManager'));
const ResumeManager = React.lazy(() => import('./admin/pages/ResumeManager'));
const SocialsManager = React.lazy(() => import('./admin/pages/SocialsManager'));
const ContactManager = React.lazy(() => import('./admin/pages/ContactManager'));
const MediaLibrary = React.lazy(() => import('./admin/pages/MediaLibrary'));
const MessagesManager = React.lazy(() => import('./admin/pages/MessagesManager'));
const AIConversations = React.lazy(() => import('./admin/pages/AIConversations'));
const SEOManager = React.lazy(() => import('./admin/pages/SEOManager'));
const AIManager = React.lazy(() => import('./admin/pages/AIManager'));
const SettingsManager = React.lazy(() => import('./admin/pages/SettingsManager'));

// Premium dynamic spinner for chunk loading
function LazyLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      color: 'var(--ds-color-text-secondary)',
      fontFamily: 'var(--ds-font-body)',
      fontSize: '13px'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '2px solid var(--ds-glass-border)',
        borderTopColor: 'var(--ds-color-accent-secondary)',
        animation: 'admin-spin 0.8s linear infinite',
        marginRight: '12px'
      }} />
      <span>Loading Panel Component...</span>
    </div>
  );
}

// Portfolio landing wrapper view
function PortfolioView() {
  const portfolio = usePortfolioData();
  const [splashProgress, setSplashProgress] = React.useState(0);
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    let startTime = null;
    const duration = 3800; // 3.8 seconds smooth & majestic balloon ascent
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth ease-in-out curve for natural balloon acceleration & deceleration
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentPercent = Math.min(100, easedProgress * 100);

      setSplashProgress(currentPercent);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  React.useEffect(() => {
    const cleanup = initAnalytics();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  React.useEffect(() => {
    if (portfolio.loading) return;
    const sections = ['home', 'about', 'skills', 'projects', 'services', 'contact'];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackSectionView(entry.target.id);
        }
      });
    }, { threshold: 0.2 });

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [portfolio.loading]);

  return (
    <>
      {showSplash && (
        <SkyLoader
          progress={splashProgress}
          onComplete={() => setShowSplash(false)}
        />
      )}
      <Header resume={portfolio.resume} />
      <main>
        <HeroAboutScroll hero={portfolio.hero} about={portfolio.about} resume={portfolio.resume} skills={portfolio.skills} />
        <Projects projects={portfolio.projects} />
        <Services services={portfolio.services} />
        <Contact socials={portfolio.socialLinks} />
      </main>
      <React.Suspense fallback={null}>
        <AIChatbot portfolioData={portfolio} />
      </React.Suspense>
    </>
  );
}

export default function App() {
  const auth = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Portfolio landing flow */}
        <Route path="/" element={<PortfolioView />} />

        {/* Admin Authentication UI */}
        <Route path="/admin/login" element={<Login auth={auth} />} />

        {/* Protected Dashboard CMS and Managers */}
        <Route path="/admin" element={<AdminLayout auth={auth} />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="dashboard" element={
            <React.Suspense fallback={<LazyLoader />}><Dashboard /></React.Suspense>
          } />
          <Route path="hero" element={
            <React.Suspense fallback={<LazyLoader />}><HeroManager /></React.Suspense>
          } />
          <Route path="about" element={
            <React.Suspense fallback={<LazyLoader />}><AboutManager /></React.Suspense>
          } />
          <Route path="projects" element={
            <React.Suspense fallback={<LazyLoader />}><ProjectsManager /></React.Suspense>
          } />
          <Route path="services" element={
            <React.Suspense fallback={<LazyLoader />}><ServicesManager /></React.Suspense>
          } />
          <Route path="resume" element={
            <React.Suspense fallback={<LazyLoader />}><ResumeManager /></React.Suspense>
          } />
          <Route path="socials" element={
            <React.Suspense fallback={<LazyLoader />}><SocialsManager /></React.Suspense>
          } />
          <Route path="contact" element={
            <React.Suspense fallback={<LazyLoader />}><ContactManager /></React.Suspense>
          } />
          <Route path="media" element={
            <React.Suspense fallback={<LazyLoader />}><MediaLibrary /></React.Suspense>
          } />
          <Route path="messages" element={
            <React.Suspense fallback={<LazyLoader />}><MessagesManager /></React.Suspense>
          } />
          <Route path="ai-conversations" element={
            <React.Suspense fallback={<LazyLoader />}><AIConversations /></React.Suspense>
          } />
          <Route path="seo" element={
            <React.Suspense fallback={<LazyLoader />}><SEOManager /></React.Suspense>
          } />
          <Route path="settings" element={
            <React.Suspense fallback={<LazyLoader />}><SettingsManager /></React.Suspense>
          } />
          <Route path="ai-settings" element={
            <React.Suspense fallback={<LazyLoader />}><AIManager /></React.Suspense>
          } />
        </Route>

        {/* Global Fallback redirect to Portfolio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
