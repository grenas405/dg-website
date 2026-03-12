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

## [0.1.1] - 2026-03-12

### Changed
- `main.css`: Major visual overhaul — refined color palette (deeper bg, indigo secondary, improved muted fg), noise grain overlay, hero grid-line pattern, floating blob CSS keyframe animations, enhanced glassmorphism on nav and cards, gradient border accents on feature items and countdown, individual accent colors per stack card via CSS custom properties, scroll-progress bar styles, tighter typography (letter-spacing, improved clamp sizes).
- `index.html`: Added scroll progress bar element, `data-label` attributes on countdown items (used by CSS `::after` for labeling), removed inline letter suffixes from countdown spans.
- `script.js`: Wired scroll progress bar width to page scroll position.
