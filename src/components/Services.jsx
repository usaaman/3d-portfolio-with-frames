import React, { useState } from 'react';
import { Globe, LayoutDashboard, BrainCircuit, Flame, Monitor, Video, Grid2x2 } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Services.css';

const SERVICES_DATA = [
  {
    title: 'Full-Stack Web Apps',
    category: 'CORE DEVELOPMENT',
    accent: 'accent-blue',
    description: 'Custom web applications built with modern frontend architecture and practical backend workflows.',
    icon: Globe,
  },
  {
    title: 'Admin Dashboards',
    category: 'ENTERPRISE SYSTEMS',
    accent: 'accent-indigo',
    description: 'Data-driven dashboards, CRUD systems, and CMS-style interfaces designed for real business usage.',
    icon: LayoutDashboard,
  },
  {
    title: 'AI Agent Integration',
    category: 'INTELLIGENT SOLUTIONS',
    accent: 'accent-cyan',
    description: 'AI-powered chat systems, workflow automation, and assistant features embedded into web products.',
    icon: BrainCircuit,
  },
  {
    title: 'Firebase Solutions',
    category: 'CLOUD SERVICES',
    accent: 'accent-emerald',
    description: 'Authentication, Firestore structures, hosting, and scalable cloud features for fast-moving projects.',
    icon: Flame,
  },
  {
    title: 'Landing Pages & Frontends',
    category: 'MARKETING & DESIGN',
    accent: 'accent-amber',
    description: 'High-converting, animation-rich portfolio, product, and startup interfaces with premium polish.',
    icon: Monitor,
  },
  {
    title: 'Creative Edge',
    category: 'CREATIVE SUPPORT',
    accent: 'accent-purple',
    description: 'CapCut-powered video editing, social visuals, thumbnails, and motion-led creative support.',
    icon: Video,
  },
];

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

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

          {/* 6 Floating Service Orbit Cards */}
          {SERVICES_DATA.map((service, idx) => {
            const IconComponent = service.icon;
            const isHovered = hoveredIndex === idx;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <div
                key={service.title}
                className={`orbit-node-wrapper orbit-node-${idx} ${isHovered ? 'is-focused' : ''} ${
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
