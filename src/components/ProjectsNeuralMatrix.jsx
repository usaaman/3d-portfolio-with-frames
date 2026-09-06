import React, { useEffect, useRef } from 'react';

/**
 * ProjectsNeuralMatrix
 * High-performance 120fps HTML5 Canvas background animation for the Projects section.
 * Renders a dense, multi-track holographic Neural Matrix Architecture on the left & right flanks.
 * 
 * Growth Behavior:
 * - Card 1 (0% - 20%): Foundation core nodes, micro-vias, and bus feeds awaken at the base.
 * - Cards 2-3 (20% - 50%): Synaptic conduits branch upward through mid-tier logic gates & data nodes.
 * - Card 4 (50% - 75%): High-altitude neural matrix clusters form along both flanks with flowing data packets.
 * - Final Card (75% - 100%): Full Reveal! Network reaches apex, connecting into a magnificent Cybernetic
 *   Neural Crown across the top with glowing ambient orbital pulses and radiant aura.
 * 
 * Scalability:
 * Works seamlessly whether admin configures 4, 6, 8, 12, or 20+ cards because scroll progress
 * is dynamically normalized (0.0 to 1.0) over the entire projects viewport scroll distance.
 */
export default function ProjectsNeuralMatrix({ wrapperRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let isRunning = false;
    let inView = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let targetProgress = 0;
    let smoothProgress = 0;
    let time = 0;

    // Responsive Canvas Sizing
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // =========================================================================
    // HIGH-DENSITY PROCEDURAL NODE GRAPH
    // Left Flank (32 nodes), Right Flank (32 nodes), Apex Crown (7 nodes) = 71 Nodes!
    // Types: 'apex' | 'core' | 'gate' | 'node' | 'sub'
    // Tiers: 1 (Foundation), 2 (Lower-Mid), 3 (Upper-Mid), 4 (Apex Wing & Crown)
    // =========================================================================

    const LEFT_NODES = [
      // ----------------- TIER 1: FOUNDATION (y: 0.76 to 0.94) -----------------
      { id: 'L1',  x: 0.04, y: 0.93, tier: 1, type: 'core', label: 'SYS.ROOT_01' },
      { id: 'L2',  x: 0.09, y: 0.91, tier: 1, type: 'node', label: 'PWR.BUS_A' },
      { id: 'L3',  x: 0.16, y: 0.94, tier: 1, type: 'sub',  label: null },
      { id: 'L4',  x: 0.03, y: 0.86, tier: 1, type: 'gate', label: 'LGC.GATE_01' },
      { id: 'L5',  x: 0.11, y: 0.85, tier: 1, type: 'core', label: 'HEX::0x7F1' },
      { id: 'L6',  x: 0.18, y: 0.87, tier: 1, type: 'node', label: 'BUS.FEED_01' },
      { id: 'L7',  x: 0.06, y: 0.80, tier: 1, type: 'sub',  label: null },
      { id: 'L8',  x: 0.14, y: 0.78, tier: 1, type: 'node', label: 'V-CORE: 1.1V' },

      // ----------------- TIER 2: LOWER-MID (y: 0.55 to 0.74) -----------------
      { id: 'L9',  x: 0.03, y: 0.73, tier: 2, type: 'gate', label: 'SYNAPSE.02' },
      { id: 'L10', x: 0.10, y: 0.70, tier: 2, type: 'core', label: 'NODE.AI_ALPHA' },
      { id: 'L11', x: 0.17, y: 0.72, tier: 2, type: 'sub',  label: null },
      { id: 'L12', x: 0.05, y: 0.65, tier: 2, type: 'node', label: 'LATENCY: 0.4ms' },
      { id: 'L13', x: 0.12, y: 0.63, tier: 2, type: 'core', label: 'BUS.MATRIX_L' },
      { id: 'L14', x: 0.19, y: 0.66, tier: 2, type: 'gate', label: 'ROUTER.04' },
      { id: 'L15', x: 0.04, y: 0.58, tier: 2, type: 'node', label: 'CLOCK: 120HZ' },
      { id: 'L16', x: 0.11, y: 0.56, tier: 2, type: 'sub',  label: null },
      { id: 'L17', x: 0.18, y: 0.58, tier: 2, type: 'node', label: 'CONDUIT.L2' },

      // ----------------- TIER 3: UPPER-MID (y: 0.33 to 0.53) -----------------
      { id: 'L18', x: 0.03, y: 0.51, tier: 3, type: 'sub',  label: null },
      { id: 'L19', x: 0.09, y: 0.49, tier: 3, type: 'core', label: 'NEURAL.CLUSTER_L' },
      { id: 'L20', x: 0.16, y: 0.48, tier: 3, type: 'gate', label: 'IO.BUS_ALPHA' },
      { id: 'L21', x: 0.05, y: 0.42, tier: 3, type: 'node', label: 'SYNAPSE.08' },
      { id: 'L22', x: 0.12, y: 0.40, tier: 3, type: 'core', label: 'TX/RX: 40Gbps' },
      { id: 'L23', x: 0.19, y: 0.43, tier: 3, type: 'sub',  label: null },
      { id: 'L24', x: 0.04, y: 0.35, tier: 3, type: 'gate', label: 'MEM.CACHE: L3' },
      { id: 'L25', x: 0.11, y: 0.33, tier: 3, type: 'node', label: 'UPPER.MATRIX_L' },
      { id: 'L26', x: 0.18, y: 0.35, tier: 3, type: 'sub',  label: null },

      // ----------------- TIER 4: APEX WING (y: 0.10 to 0.30) -----------------
      { id: 'L27', x: 0.06, y: 0.28, tier: 4, type: 'core', label: 'APEX.WING_L1' },
      { id: 'L28', x: 0.14, y: 0.26, tier: 4, type: 'node', label: 'CROWN.PREP_L' },
      { id: 'L29', x: 0.08, y: 0.20, tier: 4, type: 'gate', label: 'HEX::0xAPEX' },
      { id: 'L30', x: 0.16, y: 0.18, tier: 4, type: 'core', label: 'MATRIX.ELEVATE' },
      { id: 'L31', x: 0.10, y: 0.14, tier: 4, type: 'node', label: 'APEX.WING_L' },
      { id: 'L32', x: 0.16, y: 0.11, tier: 4, type: 'apex', label: '★ APEX.WEST' },
    ];

    const RIGHT_NODES = [
      // ----------------- TIER 1: FOUNDATION (y: 0.76 to 0.94) -----------------
      { id: 'R1',  x: 0.96, y: 0.93, tier: 1, type: 'core', label: 'SYS.ROOT_02' },
      { id: 'R2',  x: 0.91, y: 0.91, tier: 1, type: 'node', label: 'PWR.BUS_B' },
      { id: 'R3',  x: 0.84, y: 0.94, tier: 1, type: 'sub',  label: null },
      { id: 'R4',  x: 0.97, y: 0.86, tier: 1, type: 'gate', label: 'LGC.GATE_02' },
      { id: 'R5',  x: 0.89, y: 0.85, tier: 1, type: 'core', label: 'HEX::0x7F2' },
      { id: 'R6',  x: 0.82, y: 0.87, tier: 1, type: 'node', label: 'BUS.FEED_02' },
      { id: 'R7',  x: 0.94, y: 0.80, tier: 1, type: 'sub',  label: null },
      { id: 'R8',  x: 0.86, y: 0.78, tier: 1, type: 'node', label: 'V-CORE: 1.1V' },

      // ----------------- TIER 2: LOWER-MID (y: 0.55 to 0.74) -----------------
      { id: 'R9',  x: 0.97, y: 0.73, tier: 2, type: 'gate', label: 'SYNAPSE.03' },
      { id: 'R10', x: 0.90, y: 0.70, tier: 2, type: 'core', label: 'NODE.AI_BETA' },
      { id: 'R11', x: 0.83, y: 0.72, tier: 2, type: 'sub',  label: null },
      { id: 'R12', x: 0.95, y: 0.65, tier: 2, type: 'node', label: 'LATENCY: 0.5ms' },
      { id: 'R13', x: 0.88, y: 0.63, tier: 2, type: 'core', label: 'BUS.MATRIX_R' },
      { id: 'R14', x: 0.81, y: 0.66, tier: 2, type: 'gate', label: 'ROUTER.05' },
      { id: 'R15', x: 0.96, y: 0.58, tier: 2, type: 'node', label: 'CLOCK: 120HZ' },
      { id: 'R16', x: 0.89, y: 0.56, tier: 2, type: 'sub',  label: null },
      { id: 'R17', x: 0.82, y: 0.58, tier: 2, type: 'node', label: 'CONDUIT.R2' },

      // ----------------- TIER 3: UPPER-MID (y: 0.33 to 0.53) -----------------
      { id: 'R18', x: 0.97, y: 0.51, tier: 3, type: 'sub',  label: null },
      { id: 'R19', x: 0.91, y: 0.49, tier: 3, type: 'core', label: 'NEURAL.CLUSTER_R' },
      { id: 'R20', x: 0.84, y: 0.48, tier: 3, type: 'gate', label: 'IO.BUS_BETA' },
      { id: 'R21', x: 0.95, y: 0.42, tier: 3, type: 'node', label: 'SYNAPSE.09' },
      { id: 'R22', x: 0.88, y: 0.40, tier: 3, type: 'core', label: 'TX/RX: 40Gbps' },
      { id: 'R23', x: 0.81, y: 0.43, tier: 3, type: 'sub',  label: null },
      { id: 'R24', x: 0.96, y: 0.35, tier: 3, type: 'gate', label: 'MEM.CACHE: L3' },
      { id: 'R25', x: 0.89, y: 0.33, tier: 3, type: 'node', label: 'UPPER.MATRIX_R' },
      { id: 'R26', x: 0.82, y: 0.35, tier: 3, type: 'sub',  label: null },

      // ----------------- TIER 4: APEX WING (y: 0.10 to 0.30) -----------------
      { id: 'R27', x: 0.94, y: 0.28, tier: 4, type: 'core', label: 'APEX.WING_R1' },
      { id: 'R28', x: 0.86, y: 0.26, tier: 4, type: 'node', label: 'CROWN.PREP_R' },
      { id: 'R29', x: 0.92, y: 0.20, tier: 4, type: 'gate', label: 'HEX::0xAPEX' },
      { id: 'R30', x: 0.84, y: 0.18, tier: 4, type: 'core', label: 'MATRIX.ELEVATE' },
      { id: 'R31', x: 0.90, y: 0.14, tier: 4, type: 'node', label: 'APEX.WING_R' },
      { id: 'R32', x: 0.84, y: 0.11, tier: 4, type: 'apex', label: '★ APEX.EAST' },
    ];

    // =========================================================================
    // DENSE CYBER CONDUIT NETWORK (110+ INTERCONNECTING LINES)
    // Multi-track bus lines, cross-synapses, horizontal bridges & crown arch
    // =========================================================================
    const EDGES = [
      // ----- LEFT FLANK: TIER 1 (Foundation) -----
      { from: 'L1', to: 'L2', tier: 1 },
      { from: 'L2', to: 'L3', tier: 1 },
      { from: 'L1', to: 'L4', tier: 1 },
      { from: 'L2', to: 'L5', tier: 1 },
      { from: 'L3', to: 'L6', tier: 1 },
      { from: 'L4', to: 'L5', tier: 1 },
      { from: 'L5', to: 'L6', tier: 1 },
      { from: 'L4', to: 'L7', tier: 1 },
      { from: 'L5', to: 'L8', tier: 1 },
      { from: 'L6', to: 'L8', tier: 1 },
      { from: 'L7', to: 'L8', tier: 1 },

      // Inter-Tier Bridge (Tier 1 -> Tier 2)
      { from: 'L7', to: 'L9', tier: 2 },
      { from: 'L7', to: 'L10', tier: 2 },
      { from: 'L8', to: 'L10', tier: 2 },
      { from: 'L8', to: 'L11', tier: 2 },

      // ----- LEFT FLANK: TIER 2 (Lower-Mid) -----
      { from: 'L9', to: 'L10', tier: 2 },
      { from: 'L10', to: 'L11', tier: 2 },
      { from: 'L9', to: 'L12', tier: 2 },
      { from: 'L10', to: 'L13', tier: 2 },
      { from: 'L11', to: 'L14', tier: 2 },
      { from: 'L12', to: 'L13', tier: 2 },
      { from: 'L13', to: 'L14', tier: 2 },
      { from: 'L12', to: 'L15', tier: 2 },
      { from: 'L13', to: 'L16', tier: 2 },
      { from: 'L14', to: 'L17', tier: 2 },
      { from: 'L15', to: 'L16', tier: 2 },
      { from: 'L16', to: 'L17', tier: 2 },
      { from: 'L12', to: 'L16', tier: 2 },
      { from: 'L13', to: 'L17', tier: 2 },

      // Inter-Tier Bridge (Tier 2 -> Tier 3)
      { from: 'L15', to: 'L18', tier: 3 },
      { from: 'L15', to: 'L19', tier: 3 },
      { from: 'L16', to: 'L19', tier: 3 },
      { from: 'L17', to: 'L20', tier: 3 },

      // ----- LEFT FLANK: TIER 3 (Upper-Mid) -----
      { from: 'L18', to: 'L19', tier: 3 },
      { from: 'L19', to: 'L20', tier: 3 },
      { from: 'L18', to: 'L21', tier: 3 },
      { from: 'L19', to: 'L22', tier: 3 },
      { from: 'L20', to: 'L23', tier: 3 },
      { from: 'L21', to: 'L22', tier: 3 },
      { from: 'L22', to: 'L23', tier: 3 },
      { from: 'L21', to: 'L24', tier: 3 },
      { from: 'L22', to: 'L25', tier: 3 },
      { from: 'L23', to: 'L26', tier: 3 },
      { from: 'L24', to: 'L25', tier: 3 },
      { from: 'L25', to: 'L26', tier: 3 },
      { from: 'L21', to: 'L25', tier: 3 },
      { from: 'L22', to: 'L26', tier: 3 },

      // Inter-Tier Bridge (Tier 3 -> Tier 4)
      { from: 'L24', to: 'L27', tier: 4 },
      { from: 'L25', to: 'L27', tier: 4 },
      { from: 'L25', to: 'L28', tier: 4 },
      { from: 'L26', to: 'L28', tier: 4 },

      // ----- LEFT FLANK: TIER 4 (Apex Wing) -----
      { from: 'L27', to: 'L28', tier: 4 },
      { from: 'L27', to: 'L29', tier: 4 },
      { from: 'L28', to: 'L30', tier: 4 },
      { from: 'L29', to: 'L30', tier: 4 },
      { from: 'L29', to: 'L31', tier: 4 },
      { from: 'L30', to: 'L32', tier: 4 },
      { from: 'L31', to: 'L32', tier: 4 },
      { from: 'L27', to: 'L30', tier: 4 },

      // ----- RIGHT FLANK: TIER 1 (Foundation) -----
      { from: 'R1', to: 'R2', tier: 1 },
      { from: 'R2', to: 'R3', tier: 1 },
      { from: 'R1', to: 'R4', tier: 1 },
      { from: 'R2', to: 'R5', tier: 1 },
      { from: 'R3', to: 'R6', tier: 1 },
      { from: 'R4', to: 'R5', tier: 1 },
      { from: 'R5', to: 'R6', tier: 1 },
      { from: 'R4', to: 'R7', tier: 1 },
      { from: 'R5', to: 'R8', tier: 1 },
      { from: 'R6', to: 'R8', tier: 1 },
      { from: 'R7', to: 'R8', tier: 1 },

      // Inter-Tier Bridge (Tier 1 -> Tier 2)
      { from: 'R7', to: 'R9', tier: 2 },
      { from: 'R7', to: 'R10', tier: 2 },
      { from: 'R8', to: 'R10', tier: 2 },
      { from: 'R8', to: 'R11', tier: 2 },

      // ----- RIGHT FLANK: TIER 2 (Lower-Mid) -----
      { from: 'R9', to: 'R10', tier: 2 },
      { from: 'R10', to: 'R11', tier: 2 },
      { from: 'R9', to: 'R12', tier: 2 },
      { from: 'R10', to: 'R13', tier: 2 },
      { from: 'R11', to: 'R14', tier: 2 },
      { from: 'R12', to: 'R13', tier: 2 },
      { from: 'R13', to: 'R14', tier: 2 },
      { from: 'R12', to: 'R15', tier: 2 },
      { from: 'R13', to: 'R16', tier: 2 },
      { from: 'R14', to: 'R17', tier: 2 },
      { from: 'R15', to: 'R16', tier: 2 },
      { from: 'R16', to: 'R17', tier: 2 },
      { from: 'R12', to: 'R16', tier: 2 },
      { from: 'R13', to: 'R17', tier: 2 },

      // Inter-Tier Bridge (Tier 2 -> Tier 3)
      { from: 'R15', to: 'R18', tier: 3 },
      { from: 'R15', to: 'R19', tier: 3 },
      { from: 'R16', to: 'R19', tier: 3 },
      { from: 'R17', to: 'R20', tier: 3 },

      // ----- RIGHT FLANK: TIER 3 (Upper-Mid) -----
      { from: 'R18', to: 'R19', tier: 3 },
      { from: 'R19', to: 'R20', tier: 3 },
      { from: 'R18', to: 'R21', tier: 3 },
      { from: 'R19', to: 'R22', tier: 3 },
      { from: 'R20', to: 'R23', tier: 3 },
      { from: 'R21', to: 'R22', tier: 3 },
      { from: 'R22', to: 'R23', tier: 3 },
      { from: 'R21', to: 'R24', tier: 3 },
      { from: 'R22', to: 'R25', tier: 3 },
      { from: 'R23', to: 'R26', tier: 3 },
      { from: 'R24', to: 'R25', tier: 3 },
      { from: 'R25', to: 'R26', tier: 3 },
      { from: 'R21', to: 'R25', tier: 3 },
      { from: 'R22', to: 'R26', tier: 3 },

      // Inter-Tier Bridge (Tier 3 -> Tier 4)
      { from: 'R24', to: 'R27', tier: 4 },
      { from: 'R25', to: 'R27', tier: 4 },
      { from: 'R25', to: 'R28', tier: 4 },
      { from: 'R26', to: 'R28', tier: 4 },

      // ----- RIGHT FLANK: TIER 4 (Apex Wing) -----
      { from: 'R27', to: 'R28', tier: 4 },
      { from: 'R27', to: 'R29', tier: 4 },
      { from: 'R28', to: 'R30', tier: 4 },
      { from: 'R29', to: 'R30', tier: 4 },
      { from: 'R29', to: 'R31', tier: 4 },
      { from: 'R30', to: 'R32', tier: 4 },
      { from: 'R31', to: 'R32', tier: 4 },
    ];

    const ALL_NODES = [...LEFT_NODES, ...RIGHT_NODES];
    const nodeMap = new Map();
    ALL_NODES.forEach((n) => nodeMap.set(n.id, n));

    // Ambient floating stardust micro-particles
    const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.7 + Math.random() * 1.5,
      speedY: 0.0003 + Math.random() * 0.0007,
      speedX: (Math.random() - 0.5) * 0.0002,
      baseAlpha: 0.12 + Math.random() * 0.40,
      isGold: i % 3 === 0,
      phase: Math.random() * Math.PI * 2,
    }));

    // Dynamic scroll progress measurement directly from Projects wrapper
    const updateScrollProgress = () => {
      const wrapper = wrapperRef?.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        targetProgress = 0;
        return;
      }
      const scrolled = -rect.top;
      targetProgress = Math.max(0, Math.min(1, scrolled / total));
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // IntersectionObserver to pause rendering when completely offscreen (0% CPU/GPU)
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !isRunning) {
        isRunning = true;
        animId = requestAnimationFrame(tick);
      }
    }, { threshold: 0.01 });

    if (wrapperRef?.current) {
      observer.observe(wrapperRef.current);
    }

    // Helper: Map node normalized coords to canvas screen pixels
    const getNodePos = (node) => ({
      x: node.x * width * dpr,
      y: node.y * height * dpr,
    });

    // Tier Growth Calculation (Normalized 0.0 - 1.0 progress across whatever number of cards exist)
    const getTierGrowth = (tier, p) => {
      switch (tier) {
        case 1:
          // Foundation: Active from Card 1 (0.0 to 0.25)
          return Math.min(1, 0.40 + p * 1.9);
        case 2:
          // Lower-Mid: Grows from 0.15 to 0.50
          return Math.max(0, Math.min(1, (p - 0.15) / 0.32));
        case 3:
          // Upper-Mid: Grows from 0.42 to 0.75
          return Math.max(0, Math.min(1, (p - 0.42) / 0.32));
        case 4:
          // Apex & Crown (Final Card): Grows from 0.70 to 1.00
          return Math.max(0, Math.min(1, (p - 0.70) / 0.30));
        default:
          return 0;
      }
    };

    // =========================================================================
    // MAIN 60FPS / 120FPS RENDER LOOP
    // =========================================================================
    const tick = () => {
      if (!inView) {
        isRunning = false;
        animId = null;
        return;
      }

      time += 0.018;

      // Spring physics interpolation for scroll transitions
      const diff = targetProgress - smoothProgress;
      if (Math.abs(diff) > 0.0005) {
        smoothProgress += diff * 0.12;
      } else {
        smoothProgress = targetProgress;
      }

      const p = smoothProgress;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // -----------------------------------------------------------------------
      // 1. AMBIENT STARDUST PARTICLES
      // -----------------------------------------------------------------------
      PARTICLES.forEach((pt) => {
        pt.y -= pt.speedY;
        pt.x += pt.speedX;
        if (pt.y < 0) pt.y = 1;
        if (pt.x < 0) pt.x = 1;
        if (pt.x > 1) pt.x = 0;

        const pulse = Math.sin(time * 2 + pt.phase) * 0.25;
        const currentAlpha = Math.max(0, Math.min(1, pt.baseAlpha + pulse));

        ctx.beginPath();
        ctx.arc(pt.x * width * dpr, pt.y * height * dpr, pt.radius * dpr, 0, Math.PI * 2);
        ctx.fillStyle = pt.isGold
          ? `rgba(245, 166, 35, ${currentAlpha.toFixed(3)})`
          : `rgba(45, 212, 191, ${currentAlpha.toFixed(3)})`;
        ctx.fill();
      });

      // -----------------------------------------------------------------------
      // 2. CYBER CONDUIT EDGES & TRAVELING PACKETS
      // -----------------------------------------------------------------------
      EDGES.forEach((edge, idx) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return;

        const tierGrowth = getTierGrowth(edge.tier, p);
        if (tierGrowth <= 0.01) return;

        const p1 = getNodePos(fromNode);
        const p2 = getNodePos(toNode);

        const curX = p1.x + (p2.x - p1.x) * tierGrowth;
        const curY = p1.y + (p2.y - p1.y) * tierGrowth;

        const isApex = edge.tier === 4;
        const lineAlpha = (tierGrowth * (isApex ? 0.72 : 0.42)).toFixed(3);

        const grad = ctx.createLinearGradient(p1.x, p1.y, curX, curY);
        if (isApex) {
          grad.addColorStop(0, `rgba(45, 180, 150, ${lineAlpha})`);
          grad.addColorStop(0.5, `rgba(245, 166, 35, ${lineAlpha})`);
          grad.addColorStop(1, `rgba(45, 180, 150, ${lineAlpha})`);
        } else {
          grad.addColorStop(0, `rgba(20, 85, 74, ${lineAlpha})`);
          grad.addColorStop(1, `rgba(45, 180, 150, ${lineAlpha})`);
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (isApex ? 2.0 : 1.3) * dpr;
        ctx.stroke();

        // Traveling Energy Packets (Pulses moving along completed conduits)
        if (tierGrowth > 0.85 && idx % 2 === 0) {
          const packetSpeed = 0.35 + (idx % 4) * 0.12;
          const packetProgress = (time * packetSpeed + idx * 0.18) % 1.0;
          const px = p1.x + (p2.x - p1.x) * packetProgress;
          const py = p1.y + (p2.y - p1.y) * packetProgress;

          ctx.beginPath();
          ctx.arc(px, py, (isApex ? 2.6 : 1.9) * dpr, 0, Math.PI * 2);
          ctx.fillStyle = idx % 3 === 0
            ? 'rgba(245, 166, 35, 0.95)'
            : 'rgba(45, 212, 191, 0.95)';
          ctx.shadowColor = idx % 3 === 0 ? '#F5A623' : '#2DD4BF';
          ctx.shadowBlur = 8 * dpr;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // -----------------------------------------------------------------------
      // 3. HOLOGRAPHIC NODES, GATES & RETICLES
      // -----------------------------------------------------------------------
      ALL_NODES.forEach((node, i) => {
        const tierGrowth = getTierGrowth(node.tier, p);
        if (tierGrowth <= 0.01) return;

        const pos = getNodePos(node);
        const nodeAlpha = Math.min(1, tierGrowth * 1.25);
        const isApex = node.type === 'apex';
        const isCore = node.type === 'core';
        const isGate = node.type === 'gate';
        const isSub  = node.type === 'sub';

        // 1. Sub Micro-vias (Tiny cyber points)
        if (isSub) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 1.4 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(45, 212, 191, ${(0.55 * nodeAlpha).toFixed(3)})`;
          ctx.fill();
          return;
        }

        // 2. Animated Pulsating Halo
        const pulse = Math.sin(time * 3 + i * 0.5) * 0.25 + 0.75;
        const haloRadius = (isApex ? 18 : isCore ? 11 : isGate ? 8 : 6) * pulse * dpr;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = isApex
          ? `rgba(245, 166, 35, ${(0.22 * nodeAlpha).toFixed(3)})`
          : isCore
          ? `rgba(45, 180, 150, ${(0.18 * nodeAlpha).toFixed(3)})`
          : isGate
          ? `rgba(245, 166, 35, ${(0.12 * nodeAlpha).toFixed(3)})`
          : `rgba(16, 185, 129, ${(0.10 * nodeAlpha).toFixed(3)})`;
        ctx.fill();

        // 3. Shape Specific Renders:
        if (isApex) {
          // Central Apex Grand Summit Node: Dual rotating dashed orbital rings
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(time * 0.8);
          ctx.setLineDash([4 * dpr, 3 * dpr]);
          ctx.beginPath();
          ctx.arc(0, 0, 14 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 166, 35, ${(0.85 * nodeAlpha).toFixed(3)})`;
          ctx.lineWidth = 1.4 * dpr;
          ctx.stroke();
          ctx.restore();

          // Inner solid core
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 6.0 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = '#F5A623';
          ctx.shadowColor = '#F5A623';
          ctx.shadowBlur = 16 * dpr;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (isGate) {
          // Diamond Logic Gate
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(Math.PI / 4 + time * 0.2);
          const gateSize = 5.5 * dpr;
          ctx.strokeStyle = `rgba(245, 166, 35, ${(0.80 * nodeAlpha).toFixed(3)})`;
          ctx.lineWidth = 1.2 * dpr;
          ctx.strokeRect(-gateSize / 2, -gateSize / 2, gateSize, gateSize);
          ctx.fillStyle = `rgba(45, 212, 191, ${(0.75 * nodeAlpha).toFixed(3)})`;
          ctx.fillRect(-gateSize / 4, -gateSize / 4, gateSize / 2, gateSize / 2);
          ctx.restore();
        } else if (isCore) {
          // Core Node: Concentric Ring + Reticle Ticks
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 7.5 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(45, 180, 150, ${(0.75 * nodeAlpha).toFixed(3)})`;
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();

          // Reticle cross-ticks
          ctx.strokeStyle = `rgba(245, 166, 35, ${(0.65 * nodeAlpha).toFixed(3)})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(pos.x - 10 * dpr, pos.y);
          ctx.lineTo(pos.x - 6 * dpr, pos.y);
          ctx.moveTo(pos.x + 6 * dpr, pos.y);
          ctx.lineTo(pos.x + 10 * dpr, pos.y);
          ctx.moveTo(pos.x, pos.y - 10 * dpr);
          ctx.lineTo(pos.x, pos.y - 6 * dpr);
          ctx.moveTo(pos.x, pos.y + 6 * dpr);
          ctx.lineTo(pos.x, pos.y + 10 * dpr);
          ctx.stroke();

          // Solid glowing core
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 3.5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = '#2DD4BF';
          ctx.shadowColor = '#2DD4BF';
          ctx.shadowBlur = 9 * dpr;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Standard Node
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.4 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = '#10B981';
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 6 * dpr;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Telemetry Sci-Fi Label (Displayed on desktop when tier is sufficiently active)
        if (node.label && width >= 960 && tierGrowth > 0.55) {
          const textAlpha = ((tierGrowth - 0.55) / 0.45 * 0.70).toFixed(3);
          ctx.font = `${isApex ? 10.5 : 8.5}px "JetBrains Mono", monospace`;
          ctx.fillStyle = isApex
            ? `rgba(245, 166, 35, ${textAlpha})`
            : `rgba(148, 179, 168, ${textAlpha})`;

          const isRight = node.x > 0.5;
          const textX = pos.x + (isApex ? 0 : isRight ? -14 * dpr : 14 * dpr);
          const textAlign = isApex ? 'center' : (isRight ? 'right' : 'left');
          ctx.textAlign = textAlign;
          ctx.textBaseline = 'middle';
          ctx.fillText(node.label, textX, isApex ? pos.y + 22 * dpr : pos.y);
        }
      });

      // -----------------------------------------------------------------------
      // 4. GRAND REVEAL TWIN APEX GLOW (Progress >= 0.75, at Final Card)
      // -----------------------------------------------------------------------
      if (p > 0.75) {
        const apexIntensity = ((p - 0.75) / 0.25);
        ['L32', 'R32'].forEach((apexId) => {
          const apexNode = nodeMap.get(apexId);
          if (apexNode) {
            const apexPos = getNodePos(apexNode);
            const apexGrad = ctx.createRadialGradient(
              apexPos.x, apexPos.y, 6 * dpr,
              apexPos.x, apexPos.y, 110 * dpr
            );
            apexGrad.addColorStop(0, `rgba(245, 166, 35, ${(0.24 * apexIntensity).toFixed(3)})`);
            apexGrad.addColorStop(0.5, `rgba(45, 180, 150, ${(0.09 * apexIntensity).toFixed(3)})`);
            apexGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = apexGrad;
            ctx.beginPath();
            ctx.arc(apexPos.x, apexPos.y, 110 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      animId = requestAnimationFrame(tick);
    };

    isRunning = true;
    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScrollProgress);
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [wrapperRef]);

  return (
    <canvas
      ref={canvasRef}
      className="projects-neural-matrix-canvas"
      aria-hidden="true"
    />
  );
}
