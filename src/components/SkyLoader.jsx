import React, { useState, useEffect, useCallback } from 'react';
import './SkyLoader.css';

export default function SkyLoader({ progress = 0, onComplete }) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Systems...');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const updateProgress = useCallback((percent) => {
    const p = Math.min(100, Math.max(0, percent));
    setCurrentProgress(p);

    if (p < 30) {
      setStatusText('Loading Core Modules...');
    } else if (p < 70) {
      setStatusText('Connecting Neural Nodes...');
    } else if (p < 100) {
      setStatusText('Optimizing 3D Canvas...');
    } else {
      setStatusText('System Ready! 🚀');
      setIsCompleted(true);
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }, 600);
    }
  }, [onComplete]);

  // Bind global window.setLoaderProgress as requested
  useEffect(() => {
    window.setLoaderProgress = (percent) => {
      updateProgress(percent);
    };

    return () => {
      delete window.setLoaderProgress;
    };
  }, [updateProgress]);

  // Sync prop progress updates
  useEffect(() => {
    if (progress !== undefined && progress !== null) {
      updateProgress(progress);
    }
  }, [progress, updateProgress]);

  // Calculate liquid fill clip height (SVG y position: 420 down to 50)
  const liquidY = 420 - (currentProgress / 100) * 370;

  return (
    <div
      id="app-loading-screen"
      className="sky-loader-overlay"
      style={{
        opacity: isFadingOut ? 0 : 1,
        visibility: isFadingOut ? 'hidden' : 'visible',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <div className="sky-loader-card">
        <div className="sky-stage">
          {/* Cyber Hexagon MU Logo SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="mu-logo-svg">
            <defs>
              <filter id="muShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#022c22" floodOpacity="0.65" />
              </filter>

              {/* Emerald Green to Golden Amber Gradient */}
              <linearGradient id="greenGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* ClipPath for Dynamic Liquid Level Animation */}
              <clipPath id="liquidClip">
                <rect className="liquid-clip-rect" x="0" y={liquidY} width="500" height="500" />
              </clipPath>
            </defs>

            {/* Background Floating Sparks */}
            <g className="bg-spark">
              <circle cx="90" cy="80" r="2.5" fill="#fbbf24" opacity="0.8" className="spark spark-1" />
              <circle cx="410" cy="80" r="3" fill="#10b981" opacity="0.8" className="spark spark-2" />
              <circle cx="70" cy="380" r="2" fill="#34d399" opacity="0.6" className="spark spark-3" />
              <circle cx="430" cy="360" r="2.5" fill="#f59e0b" opacity="0.8" className="spark spark-4" />
            </g>

            <g filter="url(#muShadow)">
              {/* Outer Base Hexagon */}
              <polygon points="250,50 410,142 410,328 250,420 90,328 90,142" className="hex-outer-base" />

              {/* Outer Glow Overlay Hexagon with Liquid Clip */}
              <polygon points="250,50 410,142 410,328 250,420 90,328 90,142" className="hex-outer-glow" clipPath="url(#liquidClip)" />

              {/* Circuit Track Background */}
              <path d="M 210,75 L 115,130 L 115,315 L 210,370" className="circuit-track-base" />
              <path d="M 290,75 L 385,130 L 385,315 L 290,370" className="circuit-track-base" />

              {/* Circuit Energy Overlay */}
              <path d="M 210,75 L 115,130 L 115,315 L 210,370" className="circuit-energy-line" clipPath="url(#liquidClip)" />
              <path d="M 290,75 L 385,130 L 385,315 L 290,370" className="circuit-energy-line" clipPath="url(#liquidClip)" />

              {/* Inner Thin Hexagon */}
              <polygon points="250,92 365,158 365,302 250,368 135,302 135,158" className="hex-inner-base" />

              {/* Circuit Nodes */}
              <g className="nodes-group">
                <circle cx="210" cy="75" r="5" fill="#f59e0b" className="node-dot" />
                <circle cx="290" cy="75" r="5" fill="#f59e0b" className="node-dot" />
                <circle cx="102" cy="230" r="5" fill="#f59e0b" className="node-dot" />
                <circle cx="398" cy="230" r="5" fill="#f59e0b" className="node-dot" />
                <circle cx="210" cy="370" r="5" fill="#f59e0b" className="node-dot" />
                <circle cx="290" cy="370" r="5" fill="#f59e0b" className="node-dot" />
              </g>

              {/* Dimmed Base MU Letters */}
              <g className="mu-letters-base-group" opacity="0.2">
                <polygon points="155,170 178,162 205,252 232,158 252,158 252,310 230,312 230,222 210,295 198,295 178,222 178,300 155,296" fill="#10b981" />
                <polygon points="268,160 290,163 290,265 315,268 315,172 338,178 338,295 268,318" fill="#10b981" />
              </g>

              {/* Dynamic Liquid Filled 3D MU Letters */}
              <g className="mu-letters-group" clipPath="url(#liquidClip)">
                {/* Letter M */}
                <polygon points="155,170 178,162 205,252 232,158 252,158 252,310 230,312 230,222 210,295 198,295 178,222 178,300 155,296" className="mu-green-front" />
                <polygon points="230,312 252,310 252,158 238,158 238,298" className="mu-green-side" />

                {/* Letter U */}
                <polygon points="268,160 290,163 290,265 315,268 315,172 338,178 338,295 268,318" className="mu-green-front" />
                <polygon points="268,318 338,295 338,305 268,328" className="mu-green-side" />
                <polygon points="290,265 315,268 315,276 290,273" className="mu-green-side" />
              </g>
            </g>
          </svg>
        </div>

        {/* Progress Text & Track */}
        <div className="loader-meta">
          <span id="loader-status" className="status-txt">{statusText}</span>
          <span id="loader-percent" className="percent-txt">{Math.round(currentProgress)}%</span>
        </div>

        <div className="progress-track">
          <div
            id="loader-fill"
            className="progress-bar"
            style={{ width: `${Math.max(2, currentProgress)}%` }}
          >
            <span className="progress-bar-head" />
          </div>
        </div>
      </div>
    </div>
  );
}
