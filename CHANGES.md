# Changelog

All notable changes to the DenoGenesis frontend will be documented in this file.

## [0.1.0] - 2026-03-12

### Added
- Initial project structure for the `denogenesis.com` teaser site.
- `index.html`: Core structure with hero, features, and OKC pride sections.
- `main.css`: Modern dark-theme styling with custom cursor, responsive layout, and glassmorphism effects.
- `script.js`: Interactive animations powered by `anime.js`, including:
    - Custom mouse-follower cursor.
    - Staggered hero entrance animations.
    - Floating background blobs.
    - Scroll-triggered feature grid animations.
    - Dynamic countdown timer for the teaser launch.
- `README.md`: Project overview, tech stack details, and developer credits.
- `CHANGES.md`: Initial changelog tracking.

### Changed
- Adjusted hero title (`.glitch-text`) font size and added `max-width` to `.hero-content` to prevent layout overflow.
- Improved mobile centering for hero content.

## [0.1.2] - 2026-03-12

### Changed
- `index.html`: Split hero `h1.glitch-text` into two separate `span.glitch-text` elements ("DENO" / "GENESIS") inside a `.hero-title` wrapper so each word renders on its own line and the glitch pseudo-elements align correctly.
- `main.css`: Added `.hero-title` flex-column wrapper; set `.glitch-text` to `display: block`.

## [0.2.0] - 2026-03-15

### Added
- `main.css`: Full CSS overhaul — OKC spirit palette (`--okc-sunset` #f97316, `--okc-sky`, `--okc-gold`), expanded design token system, `::selection` accent styling, custom webkit scrollbar (gradient thumb), `body::before` ambient radial glow layers.
- `main.css`: AnimeJS typewriter CSS system — `.char` (per-letter span, opacity:0), `.typewriter-cursor` (blinking 2.5px green bar with glow), `@keyframes cursor-blink`.
- `main.css`: New keyframes — `cursor-pulse`, `follower-spin`, `nav-shimmer`, `badge-pulse`, `dot-blink`, `okc-aurora`, `gradient-shift`, `count-pulse`, `count-sweep`, `sep-pulse`, `logo-glow`, `shimmer`, `pulse-glow`.
- `main.css`: Conic-gradient rotating `.cursor-follower` ring with hue-rotate animation.
- `main.css`: Card diagonal shimmer sweep on hover (`.card::after`, `.feature-item::after`).
- `main.css`: OKC Pride animated 6-stop gradient heading (sunset → gold → green → indigo → pink → sunset) with `background-position` shift animation.
- `main.css`: Oklahoma sunset aurora radial gradient on `.okc-pride::before` with slow scale breathe.
- `main.css`: Countdown enhancements — tri-color top border sweep animation, `count-pulse` glow breathe on numbers, `:` separator styling (`.count-sep`).
- `main.css`: Pre-title upgraded to pill badge with pulsing glow border and animated green dot.
- `main.css`: Gradient nav bottom border (`accent → secondary → okc-sunset`) with sweep animation.
- `main.css`: Footer gradient text + enhanced top border.
- `script.js`: `typewriteElement(el, startDelay, charDelay, keepCursor)` — splits text into `.char` spans, animates opacity via AnimeJS stagger.
- `script.js`: Typewriter applied to `.hero-sub` (2200ms delay, 22ms/char), `.section-header p` (IntersectionObserver, 30ms/char), `.teaser-footer h2` (IntersectionObserver, 55ms/char).
- `index.html`: Countdown `:` separators as `.count-sep` spans between count-items.

### Changed
- `main.css`: Glitch animation enhanced with `skewX` distortion on each frame keyframe for more aggressive feel.
- `main.css`: Blobs upgraded to `radial-gradient` fills (solid color → transparent) with 3-phase float keyframes.
- `main.css`: `.primary-btn` and `.cta-btn` upgraded to gradient backgrounds with shimmer `::before` overlays.
- `main.css`: `.feature-item` initial `opacity: 0` (AnimeJS reveals on scroll).
- `script.js`: Hero subtitle typewriter replaces old `.hero-sub` opacity fade in timeline.
- `script.js`: Blob animation uses `easeInOutSine` easing with 3-phase float.

## [0.1.1] - 2026-03-12

### Changed
- `main.css`: Major visual overhaul — refined color palette (deeper bg, indigo secondary, improved muted fg), noise grain overlay, hero grid-line pattern, floating blob CSS keyframe animations, enhanced glassmorphism on nav and cards, gradient border accents on feature items and countdown, individual accent colors per stack card via CSS custom properties, scroll-progress bar styles, tighter typography (letter-spacing, improved clamp sizes).
- `index.html`: Added scroll progress bar element, `data-label` attributes on countdown items (used by CSS `::after` for labeling), removed inline letter suffixes from countdown spans.
- `script.js`: Wired scroll progress bar width to page scroll position.
