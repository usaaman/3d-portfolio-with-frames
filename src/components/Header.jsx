import { useEffect, useState } from 'react';
import { db } from '../admin/services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { trackResumeDownload } from '../utils/analytics';
import { scrollToSection } from '../utils/scrollTargets';
import './Header.css';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export default function Header({ resume }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDownload = async () => {
    try {
      trackResumeDownload();
      if (db && resume) {
        const count = Number(resume.downloadCount || 0) + 1;
        await setDoc(doc(db, 'resume', 'singleton'), {
          ...resume,
          downloadCount: count,
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Telemetry error tracking CV download:', e);
    }
  };

  const resumeUrl = resume?.resumeFileUrl || '/resume.pdf';

  return (
    <header className={`site-header glass ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#home" className="logo">
        <span className="logo-mark">MU</span>
        <span className="logo-text">
          Muhammad<span className="logo-accent">.</span>Usman
        </span>
      </a>

      <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => {
              const id = link.href.replace('#', '');
              if (['home', 'about'].includes(id)) {
                e.preventDefault();
                scrollToSection(id);
              }
              setMenuOpen(false);
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {resume?.status !== 'Inactive' && (
        <a
          className="resume-btn"
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={handleDownload}
        >
          <span>Resume</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}

      <button
        className="menu-toggle"
        aria-label="Toggle navigation menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
