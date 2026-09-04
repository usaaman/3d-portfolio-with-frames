import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './CyberRobotButton.css';

/**
 * CyberRobotButton - High-tech, theme-integrated 3D robot button
 * Features:
 * - Dynamic mouse tracking: Eyes follow the cursor across the entire viewport with high attraction
 * - Subtle 3D perspective head tracking
 * - Natural digital blinks & pulse effects
 * - Matches Developer Summit palette: Dark Forest Green, Emerald glow, Amber/Gold accents
 */
export default function CyberRobotButton({ isOpen, onClick, ariaLabel }) {
  const robotRef = useRef(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Target and current values for smooth LERP animation
  const animState = useRef({
    targetPupilX: 0,
    targetPupilY: 0,
    currentPupilX: 0,
    currentPupilY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
  });

  const rafId = useRef(null);

  // Global mouse move listener for continuous eye tracking across entire screen
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!robotRef.current) return;
      const rect = robotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // High attraction sensitivity: maximum offset 6.5px within eye socket
      const maxDistance = 6.5;
      // Reaches full displacement even from mid-screen
      const intensity = Math.min(1, Math.max(0.2, dist / 220));

      animState.current.targetPupilX = Math.cos(angle) * maxDistance * intensity;
      animState.current.targetPupilY = Math.sin(angle) * maxDistance * intensity;

      // Subtle 3D head tilt towards cursor
      const maxTilt = 9; // degrees
      const screenNormX = (e.clientX / window.innerWidth) - 0.5;
      const screenNormY = (e.clientY / window.innerHeight) - 0.5;
      animState.current.targetTiltY = screenNormX * maxTilt;
      animState.current.targetTiltX = -screenNormY * maxTilt;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth animation loop using LERP
    const animate = () => {
      const s = animState.current;
      const lerpFactor = 0.22; // snappy yet smooth tracking

      s.currentPupilX += (s.targetPupilX - s.currentPupilX) * lerpFactor;
      s.currentPupilY += (s.targetPupilY - s.currentPupilY) * lerpFactor;
      s.currentTiltX += (s.targetTiltX - s.currentTiltX) * 0.15;
      s.currentTiltY += (s.targetTiltY - s.currentTiltY) * 0.15;

      setPupilOffset({
        x: Math.round(s.currentPupilX * 100) / 100,
        y: Math.round(s.currentPupilY * 100) / 100,
      });

      setHeadTilt({
        x: Math.round(s.currentTiltX * 100) / 100,
        y: Math.round(s.currentTiltY * 100) / 100,
      });

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Periodic natural digital blinks
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      // 70% chance to blink every 4.5 seconds
      if (Math.random() > 0.3) {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
        }, 130);
      }
    }, 4500);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div
      ref={robotRef}
      className={`cyber-robot-wrapper ${isOpen ? 'is-open' : ''} ${isHovered ? 'is-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className="cyber-robot-btn"
        onClick={onClick}
        aria-label={ariaLabel || (isOpen ? 'Close AI Assistant' : 'Open AI Assistant')}
        style={{
          transform: isOpen
            ? 'scale(0.95)'
            : `perspective(600px) rotateX(${headTilt.x}deg) rotateY(${headTilt.y}deg) scale(${isHovered ? 1.08 : 1})`,
        }}
      >
        {/* Outer Tech Aura / Radar Rings */}
        <div className="robot-ambient-glow" />
        <div className="robot-orbital-ring" />
        <div className="robot-orbital-ring-reverse" />

        {/* Custom Theme Cyber-Robot SVG */}
        <svg
          viewBox="0 0 100 100"
          className="robot-chassis-svg"
          aria-hidden="true"
        >
          <defs>
            {/* Chassis Metallic Forest Gradient */}
            <linearGradient id="robotHelmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#12463b" />
              <stop offset="45%" stopColor="#0a2e26" />
              <stop offset="100%" stopColor="#041814" />
            </linearGradient>

            {/* Gold Trim Gradient */}
            <linearGradient id="goldAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2D6" />
              <stop offset="35%" stopColor="#FFB74D" />
              <stop offset="100%" stopColor="#F5A623" />
            </linearGradient>

            {/* Deep Glass Visor */}
            <radialGradient id="visorGlassGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#06221c" />
              <stop offset="60%" stopColor="#02120e" />
              <stop offset="100%" stopColor="#010a08" />
            </radialGradient>

            {/* Glowing Pupil Gradient */}
            <radialGradient id="pupilNeonGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#6EE7B7" />
              <stop offset="70%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>

            {/* Pupil Glow Filter */}
            <filter id="neonEyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Antenna LED Glow Filter */}
            <filter id="antennaGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* --- 1. Antenna & Signal Beacon --- */}
          <line x1="50" y1="18" x2="50" y2="8" stroke="url(#goldAccentGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="7" r="4.5" fill="#F5A623" filter="url(#antennaGlow)" />
          <circle cx="50" cy="7" r="2" fill="#FFFFFF" />

          {/* --- 2. Side Audio Pods (Ears) --- */}
          {/* Left Ear */}
          <rect x="13" y="40" width="8" height="24" rx="4" fill="#0b2b24" stroke="url(#goldAccentGrad)" strokeWidth="1.2" />
          <line x1="17" y1="46" x2="17" y2="58" stroke="#F5A623" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          {/* Right Ear */}
          <rect x="79" y="40" width="8" height="24" rx="4" fill="#0b2b24" stroke="url(#goldAccentGrad)" strokeWidth="1.2" />
          <line x1="83" y1="46" x2="83" y2="58" stroke="#F5A623" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

          {/* --- 3. Main Head Chassis --- */}
          <rect
            x="20"
            y="19"
            width="60"
            height="64"
            rx="20"
            fill="url(#robotHelmetGrad)"
            stroke="rgba(52, 211, 153, 0.5)"
            strokeWidth="1.5"
            className="robot-helmet-shell"
          />

          {/* Forehead Armor Plate / Bevel */}
          <path
            d="M 32 23 Q 50 20 68 23 L 64 28 Q 50 26 36 28 Z"
            fill="url(#goldAccentGrad)"
            opacity="0.85"
          />

          {/* --- 4. Glossy Visor Screen --- */}
          <rect
            x="25"
            y="33"
            width="50"
            height="36"
            rx="13"
            fill="url(#visorGlassGrad)"
            stroke="rgba(245, 166, 35, 0.4)"
            strokeWidth="1.2"
          />

          {/* Visor Specular Glass Reflection Curve */}
          <path
            d="M 27 41 Q 50 35 73 41 C 70 36 60 34 50 34 C 40 34 30 36 27 41 Z"
            fill="#FFFFFF"
            opacity="0.16"
          />

          {/* --- 5. The Responsive Eyes --- */}
          <g
            className={`robot-eyes-group ${isBlinking ? 'is-blinking' : ''}`}
            style={{
              transformOrigin: '50% 51px',
              transition: isBlinking ? 'none' : 'transform 0.08s ease',
            }}
          >
            {/* Left Eye Socket */}
            <circle cx="39" cy="51" r="7.5" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="0.8" />
            {/* Left Moving Pupil */}
            <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
              <circle cx="39" cy="51" r="5" fill="url(#pupilNeonGrad)" filter="url(#neonEyeGlow)" />
              <circle cx="39" cy="51" r="2.2" fill="#F5A623" />
              <circle cx="37.8" cy="49.8" r="1.1" fill="#FFFFFF" />
            </g>

            {/* Right Eye Socket */}
            <circle cx="61" cy="51" r="7.5" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="0.8" />
            {/* Right Moving Pupil */}
            <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
              <circle cx="61" cy="51" r="5" fill="url(#pupilNeonGrad)" filter="url(#neonEyeGlow)" />
              <circle cx="61" cy="51" r="2.2" fill="#F5A623" />
              <circle cx="59.8" cy="49.8" r="1.1" fill="#FFFFFF" />
            </g>
          </g>

          {/* Chin Audio Speaker / Tech Vent */}
          <g opacity="0.6">
            <line x1="42" y1="74" x2="58" y2="74" stroke="#F5A623" strokeWidth="1" strokeLinecap="round" />
            <line x1="45" y1="77" x2="55" y2="77" stroke="#34D399" strokeWidth="1" strokeLinecap="round" />
          </g>
        </svg>

        {/* Close Icon Overlay when Chat Window is Open */}
        {isOpen && (
          <div className="robot-close-badge" aria-hidden="true">
            <X size={20} strokeWidth={2.5} />
          </div>
        )}

        {/* Online Status Beacon */}
        {!isOpen && (
          <div className="robot-status-indicator">
            <span className="robot-status-pulse" />
            <span className="robot-status-core" />
          </div>
        )}
      </button>
    </div>
  );
}
