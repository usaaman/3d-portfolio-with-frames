import React, { useEffect, useState, useRef } from 'react';
import './LogoLoader.css';

export default function LogoLoader({ onComplete }) {
  const [percent, setPercent] = useState(1);
  const [status, setStatus] = useState('INITIALIZING SYSTEMS...');
  const [isExiting, setIsExiting] = useState(false);

  // Single-source, ultra-fluid 60fps counter starting on frame 0 (0ms delay)
  useEffect(() => {
    let startTime = null;
    const duration = 1400; // 1.4s: fast, snappy, buttery smooth
    let rafId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth ease-out curve
      const eased = 1 - Math.pow(1 - progress, 2.5);
      const val = Math.max(1, Math.min(100, Math.round(eased * 100)));
      setPercent(val);

      if (val < 30) {
        setStatus('INITIALIZING CORE...');
      } else if (val < 65) {
        setStatus('LOADING PORTFOLIO ASSETS...');
      } else if (val < 92) {
        setStatus('PREPARING INTERFACE...');
      } else {
        setStatus('SYSTEM READY // WELCOME');
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Quick, silky-smooth exit
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 400);
        }, 250);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  // Liquid energy fill height (SVG y position: 420 down to 50)
  const liquidY = 420 - (percent / 100) * 370;

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
              <filter id="loaderMuShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#022c22" floodOpacity="0.8" />
              </filter>

              {/* Emerald Green to Warm Amber/Gold Gradient */}
              <linearGradient id="loaderGreenGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Dynamic Rising Energy Clip Path */}
              <clipPath id="loaderEnergyClip">
                <rect x="0" y={liquidY} width="500" height="500" />
              </clipPath>
            </defs>

            <g filter="url(#loaderMuShadow)">
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
                <circle cx="210" cy="75" r="7.5" fill="#f5a623" className="loader-node node-1" />
                <circle cx="290" cy="75" r="7.5" fill="#f5a623" className="loader-node node-2" />
                <circle cx="102" cy="230" r="7.5" fill="#f5a623" className="loader-node node-3" />
                <circle cx="398" cy="230" r="7.5" fill="#f5a623" className="loader-node node-4" />
                <circle cx="210" cy="370" r="7.5" fill="#f5a623" className="loader-node node-5" />
                <circle cx="290" cy="370" r="7.5" fill="#f5a623" className="loader-node node-6" />
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
                  x1="80"
                  y1={liquidY}
                  x2="420"
                  y2={liquidY}
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
            <span className="logo-number">{percent}</span>
            <span className="logo-percent-sym">%</span>
          </div>

          {/* Thin Glowing Progress Bar */}
          <div className="logo-progress-bar">
            <div className="logo-progress-fill" style={{ width: `${percent}%` }} />
            <div className="logo-progress-dot" style={{ left: `${percent}%` }} />
          </div>

          <span className="logo-status-text">{status}</span>
        </div>
      </div>

      {/* Subtle Bottom Brand Watermark */}
      <div className="logo-loader-footer">
        <span className="footer-code">MUHAMMAD USMAN // CREATIVE ENGINEER</span>
      </div>
    </div>
  );
}
