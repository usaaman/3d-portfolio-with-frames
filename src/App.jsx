import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HeroAboutScroll from './components/HeroAboutScroll';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Services from './components/Services';
import Contact from './components/Contact';
import LogoLoader from './components/LogoLoader';
import usePortfolioData from './hooks/usePortfolioData';
import useAdminAuth from './admin/useAdminAuth';
import { initAnalytics, trackSectionView } from './utils/analytics';
import './App.css';

const AIChatbot = React.lazy(() => import('./components/AIChatbot'));
const AdminLogin = React.lazy(() => import('./admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./admin/AdminDashboard'));

// Portfolio landing view
function PortfolioView() {
  const portfolio = usePortfolioData();
  const [showSplash, setShowSplash] = React.useState(true);

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
        <LogoLoader
          onComplete={() => setShowSplash(false)}
        />
      )}
      <Header resume={portfolio.resume} />
      <main>
        <HeroAboutScroll hero={portfolio.hero} about={portfolio.about} resume={portfolio.resume} skills={portfolio.skills} skillsConfig={portfolio.skillsConfig} />
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
  const auth = useAdminAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Portfolio Landing Flow */}
        <Route path="/" element={<PortfolioView />} />

        {/* Brand-New Exclusive Admin Login */}
        <Route 
          path="/admin/login" 
          element={
            <React.Suspense fallback={null}>
              <AdminLogin auth={auth} />
            </React.Suspense>
          } 
        />

        {/* Brand-New Modern Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <React.Suspense fallback={null}>
              <AdminDashboard auth={auth} />
            </React.Suspense>
          } 
        />

        {/* Global Fallback to Portfolio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
