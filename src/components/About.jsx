import React from 'react';
import { Grid2x2, Quote } from 'lucide-react';

const AboutInner = React.memo(function AboutInner({ glanceItems, exploreItems }) {
  return (
    <div className="about-wrap">
      <div className="glass about-main">
        <div className="about-left">
          <span className="pill-badge" aria-hidden="true">
            <Grid2x2 size={13} strokeWidth={2} />
            ABOUT ME
          </span>
          <h2 className="about-title">
            Curious mind,<br />
            <span className="about-title-accent">creative hands</span>
          </h2>
          <p className="about-text">
            I'm Muhammad Usman, a Software Engineering student at Capital University
            of Science &amp; Technology, Islamabad, currently in my{' '}
            <span className="highlight">5th semester</span>.
          </p>
          <p className="about-text">
            My journey started with a passion for video editing and visual
            storytelling, which naturally evolved into web development and AI
            integration. Today, I build full-stack applications with React and
            Firebase, experiment with AI-powered chat systems, and still keep my
            creative side alive through video editing and graphic design.
          </p>
          <div className="quote-box">
            <Quote size={16} strokeWidth={2} className="quote-icon" aria-hidden="true" />
            <p>
              I love solving real-world problems — whether that's through clean
              code or a well-cut video.
            </p>
          </div>
        </div>

        <div className="about-right">
          <div className="glass glance-container">
            <span className="glance-title">At a Glance</span>
            <div className="glance-divider" aria-hidden="true" />
            <div className="glance-list">
              {glanceItems.map(({ icon: Icon, label, value, subValue }) => (
                <div className="glance-mini-card" key={label}>
                  <span className="glance-mini-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div className="glance-mini-info">
                    <span className="glance-mini-label">{label}</span>
                    <span className="glance-mini-val">{value}</span>
                    {subValue && <span className="glance-mini-val-sub">{subValue}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass explore-strip">
        <div className="explore-grid">
          {exploreItems.map(({ icon: Icon, title, desc }) => (
            <div className="explore-card" key={title}>
              <div className="explore-icon-wrapper" aria-hidden="true">
                <Icon size={16} strokeWidth={2.2} />
              </div>
              <div className="explore-content">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default function About({ style, glanceItems, exploreItems }) {
  return (
    <section
      className="stage-content about-content"
      id="about"
      aria-label="About Me"
      style={style}
    >
      <AboutInner glanceItems={glanceItems} exploreItems={exploreItems} />
    </section>
  );
}
