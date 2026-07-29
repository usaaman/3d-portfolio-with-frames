import React, { useState, useRef } from 'react';
import './Contact.css';
import Globe from './Globe';

export default function Contact() {
  const hudRotRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState(null); // 'submitting' | 'success' | 'error' | null
  const [statusMsg, setStatusMsg] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setStatusMsg('');

    try {
      // Simulate form submission API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setStatus('success');
      setStatusMsg("Thank you! Your message has been sent. I'll get back to you shortly.");
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setStatus('error');
      setStatusMsg('Something went wrong. Please try again or contact me directly via email.');
    }
  };

  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <div className="contact-eyebrow">
        <span className="dot"></span>
        Get in touch
      </div>
      
      <h2 id="contact-heading" className="contact-heading">
        Let's build something <span className="accent">great together</span>
      </h2>
      
      <p className="contact-sub">
        Great products start with great conversations. Tell me a bit about what you're working on —
        I read every message myself.
      </p>

      <div className="contact-layout">
        {/* LEFT COLUMN: Form & Methods (60% / Balanced) */}
        <div className="contact-left">
          <form className="contact-glass form-card" onSubmit={handleSubmit}>
            <div className="form-title">Send a message</div>
            <p className="form-note">Fill in the details below and I'll get back to you within a day or two.</p>

            <div className="form-row">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  disabled={status === 'submitting'}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={status === 'submitting'}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field full">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                  disabled={status === 'submitting'}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field full">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or idea..."
                  required
                  disabled={status === 'submitting'}
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Send message'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>

            {statusMsg && (
              <div className={`form-status ${status}`}>
                {statusMsg}
              </div>
            )}
          </form>

          <div className="contact-methods">
            {/* Email */}
            <a className="method-card contact-glass" href="mailto:musmannazir97@gmail.com">
              <div className="method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M22 7 12 13 2 7"></path>
                </svg>
              </div>
              <div className="method-text">
                <div className="method-label">Email</div>
                <div className="method-value">musmannazir97@gmail.com</div>
              </div>
            </a>

            {/* GitHub */}
            <a
              className="method-card contact-glass"
              href="https://github.com/usaaman/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </div>
              <div className="method-text">
                <div className="method-label">GitHub</div>
                <div className="method-value">@usaaman</div>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              className="method-card contact-glass"
              href="https://www.linkedin.com/in/muhammad-usman-a76984378/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </div>
              <div className="method-text">
                <div className="method-label">LinkedIn</div>
                <div className="method-value">/in/muhammad-usman-a76984378</div>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              className="method-card contact-glass"
              href="https://wa.me/923045160142"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <div className="method-text">
                <div className="method-label">WhatsApp</div>
                <div className="method-value">+92 304 5160142</div>
              </div>
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Holographic Globe Projection terminal (40% / Balanced) */}
        <div className="contact-right">
          <div id="scanlines"></div>
          <div id="vignette"></div>

          <div className="bracket" id="bl-tl"></div>
          <div className="bracket" id="bl-tr"></div>
          <div className="bracket" id="bl-bl"></div>
          <div className="bracket" id="bl-br"></div>

          <div className="hud" id="hud-top-left">
            <div className="title">ORIGINKIT // GLOBE</div>
            <div className="sub"><span className="status-dot"></span>HOLOGRAPHIC PROJECTION ACTIVE</div>
          </div>

          <div className="hud" id="hud-top-right">
            <div className="label">RENDER MODE</div>
            <div className="value">DOT MATRIX / STAND-MOUNTED</div>
          </div>

          <div className="hud" id="hud-bottom-left">
            <div className="label">ROTATION</div>
            <div className="value" ref={hudRotRef}>Y 000.0°</div>
          </div>

          <div className="hud" id="hud-bottom-right">
            <div className="label">NODES LINKED</div>
            <div className="value">05 / 05</div>
          </div>

          <Globe hudRotRef={hudRotRef} />
        </div>
      </div>
    </section>
  );
}
