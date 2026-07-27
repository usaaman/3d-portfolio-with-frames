import { ExternalLink, BookOpen } from 'lucide-react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.61-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.51-1.11-1.51-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
);

export default function ProjectCard({ project }) {
  const { title, subtitle, description, tags, liveUrl, githubUrl, caseStudyUrl } = project;

  // Split title into letters and stagger reveals (maximum reveal delay is 250ms, completing within 500ms)
  const titleChars = title.split('').map((char, index) => {
    const delay = Math.min(250, index * 20);
    return (
      <span
        key={index}
        className="title-char"
        style={{
          display: 'inline-block',
          opacity: 0,
          transform: 'translate3d(0, 8px, 0)',
          transition: 'opacity 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transitionDelay: `${delay}ms`
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  });

  return (
    <div className="glass project-card">
      {/* SCREENSHOT PLACEHOLDER MOCKUP */}
      <div className="project-screenshot-mockup">
        <div className="mockup-header">
          <div className="mockup-dot red" />
          <div className="mockup-dot yellow" />
          <div className="mockup-dot green" />
        </div>
        <div className="mockup-body">
          <div className="mockup-placeholder-art">
            <span className="mockup-art-title">{title}</span>
          </div>
        </div>
      </div>

      {/* CONTENT LAYER */}
      <div className="project-details">
        <span className="project-subtitle">{subtitle}</span>
        <h3 className="project-title">{titleChars}</h3>
        <p className="project-description">{description}</p>
        
        {/* TECH STACK CHIPS */}
        <div className="project-tags">
          {tags.map((tag, index) => {
            const delay = 380 + index * 70;
            return (
              <span
                key={tag}
                className="project-tag"
                style={{
                  opacity: 0,
                  transform: 'scale(0.85)',
                  transition: 'opacity 300ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: `${delay}ms`
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>

        {/* BUTTONS COLUMN/ROW */}
        <div className="project-actions">
          <a href={liveUrl} className="btn-primary project-btn">
            <ExternalLink size={14} />
            Live Demo
          </a>
          <a href={githubUrl} className="btn-ghost project-btn">
            <GithubIcon size={14} />
            GitHub
          </a>
          <a href={caseStudyUrl} className="btn-ghost project-btn">
            <BookOpen size={14} />
            Case Study
          </a>
        </div>
      </div>
    </div>
  );
}
