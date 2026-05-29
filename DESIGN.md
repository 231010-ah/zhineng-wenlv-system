# Design

## Theme
A dark-mode digital-twin theme. It mimics an SRE dashboard and sci-fi console with a dark space-blue canvas, glowing data lines, and soft translucent overlays.

## Color Palette
```css
--color-cyber-bg: #0D0E12;      /* Deep space background */
--color-cyber-dark: #0A0D14;    /* Jet black panel background */
--color-cyber-green: #00E676;   /* Cyber green (live status, healthy state) */
--color-cyber-blue: #00E5FF;    /* Cyber blue (interactive state, active menu) */
--color-cyber-purple: #7C4DFF;  /* Cyber purple (secondary focus, AI state) */
--color-cyber-slate: #1E2230;   /* Panel border/base background */
--color-cyber-border: rgba(255, 255, 255, 0.08);
```

## Typography
- **Primary Sans-Serif Font**: `'Outfit'`, sans-serif. Highly readable geometric shapes, used for body copy and headings.
- **Monospace Font**: `'JetBrains Mono'`, monospace. Used for numbers, status indicators, and metrics to emphasize telemetry data.

## Elevation & Glows
- **Glass Panel**: Translucent black background with blur (`16px`) and a thin glowing border.
- **Glowing Shadows**:
  - `shadow-glow-green`: `0 0 20px rgba(0, 230, 118, 0.35)`
  - `shadow-glow-blue`: `0 0 20px rgba(0, 229, 255, 0.35)`
  - `shadow-glow-purple`: `0 0 20px rgba(124, 77, 255, 0.35)`

## Motion & Transitions
- **Cursor trailing**: Spring physics driven by mousemove with coordinate lagging (`0.25` factor for core, `0.12` factor for ring).
- **Page transitions**: Fade-out with slight translate-up (350ms, easeInQuad) followed by fade-in with translate-up (500ms, easeOutQuad) driven by Anime.js.
- **Background morphing**: Interpolation of 3D WebGL particle positions over a 1.5s Anime.js timeline using a cubic-bezier transition profile.
