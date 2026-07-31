import React, { useState, useMemo } from 'react';
import {
  Globe,
  Monitor,
  Video,
  Grid2x2,
  Cpu,
  Layers,
  Award,
  Sparkles,
} from 'lucide-react';
import SectionHeading from './SectionHeading';
import { trackServiceClick } from '../utils/analytics';
import './Services.css';

const ICON_MAP = {
  Cpu: Cpu,
  Layers: Layers,
  Sparkles: Sparkles,
  Award: Award,
  Video: Video,
  Monitor: Monitor,
};



const ACCENTS = ['accent-blue', 'accent-indigo', 'accent-cyan', 'accent-emerald', 'accent-amber', 'accent-purple'];

export default function Services({ services }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const activeServices = useMemo(() => {
    if (services && services.length > 0) {
      return services
        .filter((s) => s.visible !== false)
        .map((s, idx) => ({
          ...s,
          category: s.featured ? 'FEATURED SERVICE' : 'CAPABILITY',
          accent: ACCENTS[idx % ACCENTS.length],
          iconName: s.icon,
        }));
    }
    return [];
  }, [services]);

  return (
    <section id="services" className="services-section" aria-labelledby="services-heading">
      <div className="ds-container services-header-container">
        <span className="pill-badge" aria-hidden="true">
          <Grid2x2 size={13} strokeWidth={2} />
          SERVICES
        </span>
        <SectionHeading align="left" id="services-heading" className="services-main-title">
          My Capabilities
        </SectionHeading>
        <p className="services-subtitle-text">
          A continuous look into what I can build for your next project, weaving functional engineering with creative edge.
        </p>
      </div>

      <div className="services-orbit-container">
        <div className="orbit-system-wrapper">
          {/* Central Glass Sphere */}
          <div 
            className={`orbit-center-sphere ${hoveredIndex !== null ? 'is-reactive' : ''}`}
            aria-hidden="true"
          >
            <div className="sphere-inner">
              <span className="sphere-logo">MU</span>
              <div className="sphere-reflection" />
              <div className="sphere-glow-ring" />
            </div>
            <div className="sphere-shadow" />
          </div>

          {/* Orbit Line Ring */}
          <div className="orbit-ring-circle" aria-hidden="true" />

          {/* Floating Service Orbit Cards */}
          {activeServices.map((service, idx) => {
            const IconComponent = ICON_MAP[service.iconName] || Globe;
            const isHovered = hoveredIndex === idx;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <div
                key={service.title + idx}
                className={`orbit-node-wrapper orbit-node-${idx % 6} ${isHovered ? 'is-focused' : ''} ${
                  isAnyHovered && !isHovered ? 'is-dimmed' : ''
                }`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(idx)}
              >
                <div
                  className={`ds-glass service-orbit-card ${service.accent}`}
                  tabIndex="0"
                  aria-label={`${service.title} Capability: ${service.description}`}
                  onClick={() => trackServiceClick(service.title)}
                >
                  <div className="card-glass-reflection" />
                  <div className="orbit-card-inner">
                    <div className="orbit-card-icon-container">
                      <IconComponent className="orbit-card-icon" size={20} strokeWidth={2} />
                    </div>
                    <div className="orbit-card-content">
                      <span className="orbit-card-category">{service.category}</span>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ds-container services-footer-container">
        <p className="services-footer-text">
          Want to discuss a tailored solution? Let's talk about how we can build it.
        </p>
      </div>
    </section>
  );
}
