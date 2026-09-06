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
  Code2,
  Palette,
  Compass,
  Target,
  Terminal,
  Video,
  User,
  Award,
  Layers,
} from 'lucide-react';

function getIconByLabel(label = '') {
  const norm = label.toLowerCase();
  if (norm.includes('code') || norm.includes('dev') || norm.includes('full-stack') || norm.includes('web') || norm.includes('software') || norm.includes('prog')) return Code2;
  if (norm.includes('ai') || norm.includes('agent') || norm.includes('autom') || norm.includes('intel') || norm.includes('brain') || norm.includes('model')) return BrainCircuit;
  if (norm.includes('video') || norm.includes('edit') || norm.includes('film') || norm.includes('media')) return Video;
  if (norm.includes('creat') || norm.includes('design') || norm.includes('art') || norm.includes('ui') || norm.includes('ux')) return Palette;
  if (norm.includes('approach') || norm.includes('method') || norm.includes('strategy') || norm.includes('philosophy')) return Compass;
  if (norm.includes('learn') || norm.includes('target') || norm.includes('improve') || norm.includes('goal')) return Target;
  if (norm.includes('location') || norm.includes('place') || norm.includes('city') || norm.includes('country') || norm.includes('pk')) return MapPin;
  if (norm.includes('stud') || norm.includes('educ') || norm.includes('school') || norm.includes('degree') || norm.includes('cust') || norm.includes('uni')) return GraduationCap;
  if (norm.includes('semest') || norm.includes('course') || norm.includes('track')) return Layers;
  if (norm.includes('avail') || norm.includes('job') || norm.includes('work') || norm.includes('freelanc') || norm.includes('client')) return Briefcase;
  if (norm.includes('name') || norm.includes('who') || norm.includes('person') || norm.includes('bio')) return User;
  if (norm.includes('tech') || norm.includes('system') || norm.includes('stack')) return Terminal;
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
      const rawVal = item.value || '';
      const cleanVal = rawVal.startsWith('DetailVideo')
        ? rawVal.replace('DetailVideo', 'Video')
        : rawVal.startsWith('Detail') && rawVal.length > 6 && !rawVal.includes(' ')
          ? rawVal.replace(/^Detail/, '')
          : rawVal;

      return (
        <div
          className="glance-mini-card"
          key={idx}
          style={{ '--i': idx }}
        >
          <span className="glance-mini-icon" aria-hidden="true">
            <Icon size={15} strokeWidth={2.2} />
          </span>
          <div className="glance-mini-info">
            <span className="glance-mini-label">{item.label}</span>
            <div className="glance-mini-val-wrapper">
              <span className="glance-mini-val" title={cleanVal}>{cleanVal}</span>
              {item.subValue && (
                <span className="glance-mini-val-sub" title={item.subValue}>
                  {item.subValue}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });
  }, [data.glanceItems]);

  const renderedExploreItems = React.useMemo(() => {
    const list = data.timelineItems || [];

    return list.map((item, idx) => {
      const Icon = item.type === 'education' ? GraduationCap : Briefcase;
      return (
        <div
          className="explore-card"
          key={item.id || idx}
          style={{ '--i': idx }}
        >
          <div className="explore-icon-wrapper" aria-hidden="true">
            <Icon size={16} strokeWidth={2.2} />
          </div>
          <div className="explore-content">
            <div className="explore-date">
              <Calendar size={10} />
              <span>{item.date}</span>
            </div>
            <h3 className="explore-title" title={item.title}>{item.title}</h3>
            {item.institution && (
              <span className="explore-institution" title={item.institution}>
                {item.institution}
              </span>
            )}
          </div>
        </div>
      );
    });
  }, [data.timelineItems]);

  const glanceCount = (data.glanceItems || []).length;
  const countClass = glanceCount > 5 ? 'glance-count-more' : `glance-count-${Math.max(glanceCount, 1)}`;

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
            <Quote size={18} strokeWidth={2} className="quote-icon" aria-hidden="true" />
            <p>
              {data.quoteText || "I love solving real-world problems — whether that's through clean code or a well-cut video."}
            </p>
          </div>
        </div>

        <div className="about-right">
          <div className="glass glance-container">
            <div className="glance-header">
              <div className="glance-title-row">
                <Sparkles size={13} className="glance-sparkle-icon" aria-hidden="true" />
                <span className="glance-title">At a Glance</span>
              </div>
              <span className="glance-count-tag">
                {glanceCount} {glanceCount === 1 ? 'Metric' : 'Metrics'}
              </span>
            </div>
            <div className="glance-divider" aria-hidden="true" />
            <div
              className={`glance-list ${countClass}`}
              style={{ '--glance-count': glanceCount }}
            >
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
