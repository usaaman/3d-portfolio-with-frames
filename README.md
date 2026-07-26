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
- **Hero + About** — a single continuous scroll-scrubbed animation (`src/components/HeroAboutScroll.jsx`) built from 261 WebP frames in `public/frames/`.
- All 261 frames are used, resized to 1600px wide WebP and lightly enhanced (contrast/color/sharpness) for smaller file size and a crisper look. A small CSS filter on the `<canvas>` adds a bit more punch. Originals were 1920x1080 PNG.

## How the scroll animation works

- The frame sequence is pinned to the viewport (`position: sticky`) while the user scrolls through a tall wrapper (`500vh`). Nothing scrolls "up" during this phase — the scene stays stuck to the screen and only the visible frame changes, exactly as discussed.
- Once the wrapper's scroll distance is used up (all 261 frames have played), the sticky pin naturally releases and the page resumes normal scrolling into the next section.
- All 261 frames are preloaded before the sequence becomes interactive (loading screen shown in the meantime) so scrubbing stays smooth with no flicker.
- Frame checkpoints (edit these constants at the top of `HeroAboutScroll.jsx` if you want to retime anything):
  - `HERO_IN_START/END` (70-100): hero card fades in
  - `HERO_OUT_START/END` (146-165): hero card fades out
  - `ABOUT_IN_START/END` (214-240): about card animates in

## Still to do (next phases)

- Skills section (50-skill rotating marquee) - not part of this phase.
- Projects, Services, Contact sections.
- Replace `public/resume.pdf` with the real resume file (the download button currently points to this path).
- Swap in real About copy/stats.

## Folder structure

```
public/frames/       261 optimized WebP frames (frame-001.webp ... frame-261.webp)
src/components/       Header, HeroAboutScroll (+ their CSS)
src/App.jsx           page composition
src/index.css         design tokens (colors, type, glass utility)
```
