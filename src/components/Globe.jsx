"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ---- helpers ------------------------------------------------------------
function toVec(lat, lng, r) {
  const rl = lat * Math.PI / 180;
  const rg = lng * Math.PI / 180;
  return new THREE.Vector3(
    Math.cos(rl) * Math.sin(rg) * r,
    Math.sin(rl) * r,
    Math.cos(rl) * Math.cos(rg) * r
  );
}

function landDensity(lat, lng) {
  const a = Math.sin(lat * 0.05 + 1.3) * Math.cos(lng * 0.04 - 0.6);
  const b = Math.sin(lat * 0.11 + lng * 0.07) * 0.6;
  const c = Math.cos(lat * 0.03) * Math.sin(lng * 0.09 + 2.1) * 0.5;
  return a + b + c;
}

export default function Globe({ hudRotRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth || container.offsetWidth || 400;
    const containerHeight = container.clientHeight || container.offsetHeight || 650;

    const GLOBE_R = 1.15;

    // ---- scene / camera / renderer ----------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03040a, 0.11);

    const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 100);
    camera.position.set(0, 0.55, 5.4);
    camera.lookAt(0, 0.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    scene.add(new THREE.AmbientLight(0x223344, 0.55));
    const rimLight = new THREE.PointLight(0x35e8ff, 2.2, 12);
    rimLight.position.set(0, 2.2, 3);
    scene.add(rimLight);
    const warmLight = new THREE.PointLight(0xd9b36c, 1.1, 10);
    warmLight.position.set(-3, 0.5, -2);
    scene.add(warmLight);

    // ---- globe group ----------------------------------------------------
    const globeGroup = new THREE.Group();
    globeGroup.position.y = 0;
    scene.add(globeGroup);

    // faint glass core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R * 0.985, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x0a2a33, transparent: true, opacity: 0.22 })
    );
    globeGroup.add(core);

    // atmosphere rim glow
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R * 1.09, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x35e8ff,
        transparent: true,
        opacity: 0.14,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      })
    );
    globeGroup.add(atmo);

    // dot cloud (fake landmass clustering)
    const dotPositions = [];
    const step = 2.6;
    for (let lat = -90; lat <= 90; lat += step) {
      const rad = lat * Math.PI / 180;
      const circumf = Math.cos(rad);
      const lngStep = circumf > 0.02 ? step / Math.max(0.15, circumf) : 360;
      for (let lng = -180; lng < 180; lng += lngStep) {
        const d = landDensity(lat, lng);
        if (d > 0.15) dotPositions.push([lat, lng, d]);
      }
    }
    const dotGeo = new THREE.SphereGeometry(0.012, 6, 6);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x6df3ff });
    const dotMesh = new THREE.InstancedMesh(dotGeo, dotMat, dotPositions.length);
    const m4 = new THREE.Matrix4();
    dotPositions.forEach(([lat, lng, d], i) => {
      const p = toVec(lat, lng, GLOBE_R);
      const s = 0.55 + Math.min(1, d) * 0.85;
      m4.makeScale(s, s, s);
      m4.setPosition(p.x, p.y, p.z);
      dotMesh.setMatrixAt(i, m4);
    });
    dotMesh.instanceMatrix.needsUpdate = true;
    globeGroup.add(dotMesh);

    // graticule
    const addGraticule = () => {
      const mat = new THREE.LineBasicMaterial({ color: 0x2a5a66, transparent: true, opacity: 0.35 });
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts = [];
        for (let i = 0; i <= 64; i++) pts.push(toVec(lat, (i / 64) * 360 - 180, GLOBE_R));
        globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
      }
      for (let lng = -180; lng < 180; lng += 30) {
        const pts = [];
        for (let i = 0; i <= 64; i++) pts.push(toVec((i / 64) * 180 - 90, lng, GLOBE_R));
        globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
      }
    };
    addGraticule();

    // markers + connecting arcs (signature network look)
    const MARKERS = [
      { lat: 33.68, lng: 73.06 },   // Islamabad
      { lat: 51.51, lng: -0.13 },   // London
      { lat: 40.71, lng: -74.01 },  // New York
      { lat: 35.68, lng: 139.69 },  // Tokyo
      { lat: -33.87, lng: 151.21 }, // Sydney
    ];
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);
    MARKERS.forEach(mk => {
      const p = toVec(mk.lat, mk.lng, GLOBE_R * 1.012);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe08a })
      );
      dot.position.copy(p);
      markerGroup.add(dot);
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending })
      );
      halo.position.copy(p);
      markerGroup.add(halo);
    });

    const arcCurves = [];
    for (let i = 0; i < MARKERS.length; i++) {
      const a = MARKERS[i], b = MARKERS[(i + 1) % MARKERS.length];
      const pa = toVec(a.lat, a.lng, GLOBE_R * 1.012);
      const pb = toVec(b.lat, b.lng, GLOBE_R * 1.012);
      const mid = pa.clone().add(pb).multiplyScalar(0.5).setLength(GLOBE_R * 1.42);
      const curve = new THREE.CatmullRomCurve3([pa, mid, pb]);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, 0.0035, 6, false),
        new THREE.MeshBasicMaterial({ color: 0x7bd8ff, transparent: true, opacity: 0.32 })
      );
      markerGroup.add(tube);
      arcCurves.push(curve);
    }
    const pulses = arcCurves.map(() => {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      markerGroup.add(s);
      return { mesh: s, t: Math.random() };
    });

    // ---- premium hologram stand -------------------------------------------
    const STAND_Y = -1.85;
    const BASE_TOP_Y = STAND_Y + 0.11;
    const BEAM_BOTTOM = BASE_TOP_Y;
    const BEAM_TOP = -GLOBE_R;
    const BEAM_HEIGHT = BEAM_TOP - BEAM_BOTTOM;

    const standGroup = new THREE.Group();
    standGroup.position.y = STAND_Y;
    scene.add(standGroup);

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x11141c, metalness: 0.85, roughness: 0.28 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.28, 0.22, 64), baseMat);
    standGroup.add(base);

    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(1.06, 0.012, 16, 90),
      new THREE.MeshStandardMaterial({ color: 0xd9b36c, metalness: 0.9, roughness: 0.22, emissive: 0x3a2c10, emissiveIntensity: 0.4 })
    );
    trim.rotation.x = Math.PI / 2;
    trim.position.y = 0.111;
    standGroup.add(trim);

    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.011, 16, 90),
      new THREE.MeshBasicMaterial({ color: 0x35e8ff })
    );
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = 0.112;
    standGroup.add(glowRing);

    // engraved-looking inner ring for detail
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.006, 12, 80),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.112;
    standGroup.add(innerRing);

    function makeBeamTexture() {
      const c = document.createElement('canvas');
      c.width = 8;
      c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 256, 0, 0);
      g.addColorStop(0, 'rgba(53,232,255,0.5)');
      g.addColorStop(0.55, 'rgba(53,232,255,0.16)');
      g.addColorStop(1, 'rgba(53,232,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 8, 256);
      return new THREE.CanvasTexture(c);
    }
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.92, BEAM_HEIGHT, 48, 1, true),
      new THREE.MeshBasicMaterial({
        map: makeBeamTexture(),
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    beam.position.y = (BEAM_TOP + BEAM_BOTTOM) / 2;
    scene.add(beam);

    // scanning rings that travel up the beam
    const scanRings = [];
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.006, 8, 64),
        new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
      );
      ring.rotation.x = Math.PI / 2;
      ring.userData.t = i / 4;
      scene.add(ring);
      scanRings.push(ring);
    }

    // drifting light particles inside the beam
    const PARTICLE_COUNT = 90;
    const pdata = [];
    const parr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      const rad = THREE.MathUtils.lerp(0.85, 0.06, t) * (0.25 + Math.random() * 0.75);
      const ang = Math.random() * Math.PI * 2;
      pdata.push({ ang, rad, t, speed: 0.04 + Math.random() * 0.07 });
      parr[i * 3] = Math.cos(ang) * rad;
      parr[i * 3 + 1] = BEAM_BOTTOM + t * BEAM_HEIGHT;
      parr[i * 3 + 2] = Math.sin(ang) * rad;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(parr, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      color: 0xbfefff,
      size: 0.02,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    scene.add(particles);

    // floor glow beneath the stand
    function makeGlowTexture() {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(53,232,255,0.32)');
      g.addColorStop(0.5, 'rgba(139,92,246,0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    }
    const floorGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 4.6),
      new THREE.MeshBasicMaterial({ map: makeGlowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = 0.001;
    standGroup.add(floorGlow);

    // ---- interaction: drag to rotate, auto-rotate otherwise ----------------
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0.0018;
    const rotation = { x: 0.3, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotation.x += dx * 0.005;
      rotation.y = Math.max(-1.1, Math.min(1.1, rotation.y + dy * 0.005));
      velX = dx * 0.0016;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // ---- resize -------------------------------------------------------------
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth || container.offsetWidth || 400;
      const newHeight = container.clientHeight || container.offsetHeight || 650;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    // ---- animation loop -------------------------------------------------------
    const clock = new THREE.Clock();
    let animationFrameId = null;
    let inView = false;
    let isAnimating = false;

    const animate = () => {
      if (!inView) {
        isAnimating = false;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;

      if (!isDragging) {
        rotation.x += velX;
        velX *= 0.995;
      }
      globeGroup.rotation.y = rotation.x;
      globeGroup.rotation.x = rotation.y;

      // pulsing rings on the stand
      glowRing.material.opacity = 0.7 + Math.sin(time * 2.2) * 0.3;
      const gm = trim.material;
      gm.emissiveIntensity = 0.35 + Math.sin(time * 1.6) * 0.15;
      innerRing.rotation.z = time * 0.4;

      // scan rings rising through the beam
      scanRings.forEach(ring => {
        ring.userData.t += dt * 0.14;
        if (ring.userData.t > 1) ring.userData.t -= 1;
        const t = ring.userData.t;
        ring.position.y = BEAM_BOTTOM + t * BEAM_HEIGHT;
        const s = THREE.MathUtils.lerp(0.92, 0.11, t);
        ring.scale.set(s, s, s);
        ring.material.opacity = 0.65 * (1 - t * 0.6);
      });

      // drifting particles
      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const d = pdata[i];
        d.t += dt * d.speed;
        if (d.t > 1) d.t -= 1;
        const rad = THREE.MathUtils.lerp(0.85, 0.06, d.t) * (0.25 + (i % 7) / 9);
        posAttr.array[i * 3] = Math.cos(d.ang + time * 0.15) * rad;
        posAttr.array[i * 3 + 1] = BEAM_BOTTOM + d.t * BEAM_HEIGHT;
        posAttr.array[i * 3 + 2] = Math.sin(d.ang + time * 0.15) * rad;
      }
      posAttr.needsUpdate = true;

      // traveling pulses along network arcs
      pulses.forEach((p, i) => {
        p.t += dt * 0.12;
        if (p.t > 1) p.t -= 1;
        const pos = arcCurves[i].getPointAt(p.t);
        p.mesh.position.copy(pos);
      });

      // HUD readout update (no re-renders)
      if (hudRotRef && hudRotRef.current) {
        let deg = ((rotation.x * 180 / Math.PI) % 360 + 360) % 360;
        hudRotRef.current.textContent = 'Y ' + deg.toFixed(1).padStart(5, '0') + '°';
      }

      renderer.render(scene, camera);
    };

    // Only animate and render when the globe container is intersecting the viewport
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !isAnimating) {
        isAnimating = true;
        clock.getDelta(); // reset clock delta to prevent jump
        animate();
      }
    }, { threshold: 0.01 });

    intersectionObserver.observe(container);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      intersectionObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
      container.removeChild(canvas);
    };
  }, [hudRotRef]);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2
      }}
    />
  );
}
