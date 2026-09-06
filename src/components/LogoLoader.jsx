import React, { useEffect, useState, useRef } from 'react';
import './LogoLoader.css';

export default function LogoLoader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  // Direct DOM references for 60fps/120fps hardware-accelerated animations
  const numberRef = useRef(null);
  const fillRef = useRef(null);
  const dotRef = useRef(null);
  const clipRectRef = useRef(null);
  const waveLineRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const duration = 1600; // 1.6s: silky-smooth, fast and snappy
    let rafId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Silky cubic ease-out curve (fast initial rise, ultra-smooth landing at 100%)
      const eased = 1 - Math.pow(1 - progress, 2.6);
      const val = Math.max(1, Math.min(100, Math.round(eased * 100)));

      // Fast direct DOM mutations (bypasses React reconciler for butter-smooth 60fps)
      if (numberRef.current) {
        numberRef.current.textContent = val;
      }
      if (fillRef.current) {
        fillRef.current.style.width = `${val}%`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${val}%`;
      }

      // Dynamic liquid energy fill height: 420 down to 50
      const liquidY = 420 - (val / 100) * 370;
      if (clipRectRef.current) {
        clipRectRef.current.setAttribute('y', liquidY);
      }
      if (waveLineRef.current) {
        waveLineRef.current.setAttribute('y1', liquidY);
        waveLineRef.current.setAttribute('y2', liquidY);
      }

      // Status messages
      if (statusRef.current) {
        if (val < 25) {
          statusRef.current.textContent = 'INITIALIZING CORE...';
        } else if (val < 60) {
          statusRef.current.textContent = 'LOADING PORTFOLIO ASSETS...';
        } else if (val < 90) {
          statusRef.current.textContent = 'OPTIMIZING GRAPHICS ENGINE...';
        } else if (val < 100) {
          statusRef.current.textContent = 'FINALIZING INTERFACE...';
        } else {
          statusRef.current.textContent = 'SYSTEM ONLINE // WELCOME';
        }
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Silky smooth exit transition
        const exitTimer = setTimeout(() => {
          setIsExiting(true);
          const completeTimer = setTimeout(() => {
            if (onComplete) onComplete();
          }, 420);
          return () => clearTimeout(completeTimer);
        }, 200);

        return () => clearTimeout(exitTimer);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  return (
    <div
      className={`logo-loader-root ${isExiting ? 'exiting' : ''}`}
      aria-label="Loading Muhammad Usman Portfolio"
    >
      {/* Ambient Cyber Backlight */}
      <div className="logo-loader-ambient" />

      <div className="logo-loader-center">
        {/* Animated Brand Logo Container */}
        <div className="logo-stage">
          {/* Subtle Outer Neon Aura Ring */}
          <div className="logo-aura-ring" />

          {/* EXACT MU HEXAGON BRAND LOGO FROM HEADER */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 500"
            className="logo-loader-svg"
          >
            <defs>
              {/* Emerald Green to Warm Amber/Gold Gradient */}
              <linearGradient id="loaderGreenGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Dynamic Rising Energy Clip Path */}
              <clipPath id="loaderEnergyClip">
                <rect ref={clipRectRef} x="0" y="420" width="500" height="500" />
              </clipPath>
            </defs>

            <g className="loader-hex-group">
              {/* 1. Base Dark Hexagon Plate */}
              <polygon
                points="250,50 410,142 410,328 250,420 90,328 90,142"
                fill="rgba(5, 28, 24, 0.95)"
                stroke="#0e4438"
                strokeWidth="6"
              />

              {/* 2. Outer Glowing Hexagon Contour (Dynamic Stroke Trace) */}
              <polygon
                points="250,50 410,142 410,328 250,420 90,328 90,142"
                fill="none"
                stroke="#10b981"
                strokeWidth="5"
                className="loader-hex-trace"
              />

              {/* 3. Golden Amber Accent Hexagon */}
              <polygon
                points="250,50 410,142 410,328 250,420 90,328 90,142"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                opacity="0.85"
                strokeDasharray="14 8"
                className="loader-hex-dashed"
              />

              {/* 4. Left and Right Circuit Tracks */}
              <path
                d="M 210,75 L 115,130 L 115,315 L 210,370"
                fill="none"
                stroke="url(#loaderGreenGoldGrad)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 290,75 L 385,130 L 385,315 L 290,370"
                fill="none"
                stroke="url(#loaderGreenGoldGrad)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* 5. Inner Cyber Hexagon Guide */}
              <polygon
                points="250,92 365,158 365,302 250,368 135,302 135,158"
                fill="none"
                stroke="rgba(245, 166, 35, 0.45)"
                strokeWidth="2.5"
                strokeDasharray="8 5"
              />

              {/* 6. Glowing Golden Circuit Nodes */}
              <g className="loader-nodes">
                <circle cx="210" cy="75" r="7" fill="#f5a623" className="loader-node node-1" />
                <circle cx="290" cy="75" r="7" fill="#f5a623" className="loader-node node-2" />
                <circle cx="102" cy="230" r="7" fill="#f5a623" className="loader-node node-3" />
                <circle cx="398" cy="230" r="7" fill="#f5a623" className="loader-node node-4" />
                <circle cx="210" cy="370" r="7" fill="#f5a623" className="loader-node node-5" />
                <circle cx="290" cy="370" r="7" fill="#f5a623" className="loader-node node-6" />
              </g>

              {/* 7. Base Background MU Monogram Letters (Muted before energy fill) */}
              <g opacity="0.25">
                <polygon points="155,170 178,162 205,252 232,158 252,158 252,310 230,312 230,222 210,295 198,295 178,222 178,300 155,296" fill="#10b981" />
                <polygon points="268,160 290,163 290,265 315,268 315,172 338,178 338,295 268,318" fill="#10b981" />
              </g>

              {/* 8. DYNAMIC RISING LIQUID / ENERGY FILLED MU LETTERS */}
              <g clipPath="url(#loaderEnergyClip)">
                {/* Glowing Core Background Wash */}
                <polygon
                  points="250,50 410,142 410,328 250,420 90,328 90,142"
                  fill="rgba(16, 185, 129, 0.18)"
                />

                {/* Vivid Emerald-Gold MU Monogram */}
                <polygon
                  points="155,170 178,162 205,252 232,158 252,158 252,310 230,312 230,222 210,295 198,295 178,222 178,300 155,296"
                  fill="url(#loaderGreenGoldGrad)"
                />
                <polygon
                  points="230,312 252,310 252,158 238,158 238,298"
                  fill="#059669"
                  opacity="0.95"
                />
                <polygon
                  points="268,160 290,163 290,265 315,268 315,172 338,178 338,295 268,318"
                  fill="url(#loaderGreenGoldGrad)"
                />
                <polygon
                  points="268,318 338,295 338,305 268,328"
                  fill="#059669"
                  opacity="0.95"
                />
                <polygon
                  points="290,265 315,268 315,276 290,273"
                  fill="#059669"
                  opacity="0.95"
                />

                {/* Wave / Liquid Shimmer Line */}
                <line
                  ref={waveLineRef}
                  x1="80"
                  y1="420"
                  x2="420"
                  y2="420"
                  stroke="#fbbf24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </g>
            </g>
          </svg>
        </div>

        {/* Minimalist Milky-Smooth HUD */}
        <div className="logo-hud">
          <div className="logo-number-row">
            <span ref={numberRef} className="logo-number">1</span>
            <span className="logo-percent-sym">%</span>
          </div>

          {/* Thin Glowing Progress Bar */}
          <div className="logo-progress-bar">
            <div ref={fillRef} className="logo-progress-fill" style={{ width: '1%' }} />
            <div ref={dotRef} className="logo-progress-dot" style={{ left: '1%' }} />
          </div>

          <span ref={statusRef} className="logo-status-text">INITIALIZING CORE...</span>
        </div>
      </div>

      {/* Subtle Bottom Brand Watermark */}
      <div className="logo-loader-footer">
        <span className="footer-code">MUHAMMAD USMAN // CREATIVE ENGINEER</span>
      </div>
    </div>
  );
}
