# 3d-portfolio-with-frames

A modern full-stack developer portfolio featuring premium UI, cinematic animations, 3D-inspired design, AI-powered experiences, and immersive interactions built with React and TypeScript.

## Scroll-scrubbed frame-sequence Hero and About sections, built with Vite + React.

## What changed in this update

- **Crop fix**: the frame canvas now scales to always cover the viewport while anchoring the crop to the *right edge* (`dx = canvasWidth - drawWidth` instead of centering). Since the character always sits on the right side of every source frame, this guarantees he's never cropped or over-zoomed, on any window size/aspect ratio — only the left side (clouds/room) ever gets cropped when needed.
- **Hero card** redesigned to match the reference: "Hi, I'm" / large gradient name, role line, gradient divider, description, "View My Work" + "Download Resume" buttons, and a social icon row (GitHub/LinkedIn/Twitter/Email — currently `#` placeholder links, wire up real profile URLs). Card widened.
- **About card** redesigned to match the reference two-column layout: bio + quote box on the left, "At a Glance" stat list on the right, and a full-width "What I Explore" strip with 5 mini cards underneath. Copy is placeholder (student/CV details) — replace with your real details in `HeroAboutScroll.jsx`.
- **Animation**: both cards now use a scroll-linked slide (translateY, eased with smoothstep) instead of a plain opacity fade — they physically slide up into place as you scroll, tied 1:1 to the frame sequence, not a timed CSS fade.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## What's included

- **Header** — fixed glass nav: logo (left), Home/About/Skills/Projects/Services/Contact links (center), Resume download button (right).
- **Hero + About** — a single continuous scroll-scrubbed animation (`src/components/HeroAboutScroll.jsx`) built from a hardware-accelerated video file (`public/scroll-video.mp4`).

## How the scroll animation works

- The video scene is pinned to the viewport (`position: sticky`) while the user scrolls through a tall wrapper (`500vh`). The video playback head (`currentTime`) is programmatically scrubbed based on the scroll position.
- Once the wrapper's scroll distance is used up, the sticky pin releases and the page resumes normal scrolling into the next section.
- Playback is throttled via `requestAnimationFrame` and a change threshold delta to avoid overloading seeks, providing highly responsive hardware-decoded transitions.

## Still to do (next phases)

- Skills section (50-skill rotating marquee) - not part of this phase.
- Projects, Services, Contact sections.
- Replace `public/resume.pdf` with the real resume file (the download button currently points to this path).
- Swap in real About copy/stats.

## Folder structure

```
public/scroll-video.mp4  Scroll-driven background video
src/components/          Header, HeroAboutScroll (+ their CSS)
src/App.jsx              page composition
src/index.css            design tokens (colors, type, glass utility)
```
