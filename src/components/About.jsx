import React, { useRef } from 'react';
import { useZoomReveal } from '../hooks/useZoomReveal';
import TypewriterText from './TypewriterText';
import {
  Grid2x2,
  Quote,
  MapPin,
  GraduationCap,
  BrainCircuit,
  Briefcase,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';

function getIconByLabel(label = '') {
  const norm = label.toLowerCase();
  if (norm.includes('location') || norm.includes('place')) return MapPin;
  if (norm.includes('stud') || norm.includes('educ') || norm.includes('school')) return GraduationCap;
  if (norm.includes('focus') || norm.includes('special') || norm.includes('semester')) return BrainCircuit;
  if (norm.includes('avail') || norm.includes('job') || norm.includes('work')) return Briefcase;
  return Sparkles;
}

const AboutInner = React.memo(function AboutInner({ aboutData }) {
  const data = aboutData || {};
  const aboutTitleRef = useRef(null);
  useZoomReveal(aboutTitleRef);

  const renderedGlanceItems = React.useMemo(() => {
    const list = data.glanceItems || [];

    return list.map((item, idx) => {
      const Icon = getIconByLabel(item.label);
      return (
        <div className="glance-mini-card" key={idx}>
          <span className="glance-mini-icon" aria-hidden="true">
            <Icon size={16} strokeWidth={2} />
          </span>
          <div className="glance-mini-info">
            <span className="glance-mini-label">{item.label}</span>
            <span className="glance-mini-val">{item.value}</span>
            {item.subValue && <span className="glance-mini-val-sub">{item.subValue}</span>}
          </div>
        </div>
      );
    });
  }, [data.glanceItems]);

  const renderedExploreItems = React.useMemo(() => {
    const list = data.timelineItems || [];

    return list.map((item) => {
      const Icon = item.type === 'education' ? BookOpen : Briefcase;
      return (
        <div className="explore-card" key={item.id}>
          <div className="explore-icon-wrapper" aria-hidden="true">
            <Icon size={16} strokeWidth={2.2} />
          </div>
          <div className="explore-content">
            <div className="explore-date" style={{ fontSize: '10px', color: 'var(--ds-color-accent-secondary)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={10} />
              {item.date}
            </div>
            <h3 style={{ fontSize: '13px', margin: 0 }}>{item.title}</h3>
            {item.institution && <span style={{ fontSize: '11px', color: 'var(--ds-color-text-muted)' }}>{item.institution}</span>}
          </div>
        </div>
      );
    });
  }, [data.timelineItems]);

  return (
    <div className="about-wrap">
      <div className="glass about-main">
        <div className="about-left">
          <span className="pill-badge" aria-hidden="true">
            <Grid2x2 size={13} strokeWidth={2} />
            ABOUT ME
          </span>
          <h2 className="about-title" ref={aboutTitleRef}>
            {data.title || "Curious mind,"}
            {(!data.title) && <><br /><span className="about-title-accent">creative hands</span></>}
          </h2>
          <p className="about-text">
            {data.paragraph1 || "I'm Muhammad Usman, a Software Engineering student at Capital University of Science & Technology, Islamabad, currently in my 6th semester."}
          </p>
          <p className="about-text">
            {data.paragraph2 || "My journey started with a passion for video editing and visual storytelling, which naturally evolved into web development and AI integration. Today, I build full-stack applications with React and Firebase, experiment with AI-powered chat systems, and still keep my creative side alive through video editing and graphic design."}
          </p>
          <div className="quote-box">
            <Quote size={16} strokeWidth={2} className="quote-icon" aria-hidden="true" />
            <p>
              {data.quoteText || "I love solving real-world problems — whether that's through clean code or a well-cut video."}
            </p>
          </div>
        </div>

        <div className="about-right">
          <div className="glass glance-container">
            <span className="glance-title">At a Glance</span>
            <div className="glance-divider" aria-hidden="true" />
            <div className="glance-list">
              {renderedGlanceItems}
            </div>
          </div>
        </div>
      </div>

      <div className="glass explore-strip">
        <div className="explore-grid">
          {renderedExploreItems}
        </div>
      </div>
    </div>
  );
});

const About = React.forwardRef(function About({ style, aboutData }, ref) {
  return (
    <section
      ref={ref}
      className="stage-content about-content"
      id="about"
      aria-label="About Me"
      style={style}
    >
      <AboutInner aboutData={aboutData} />
    </section>
  );
});

export default About;
