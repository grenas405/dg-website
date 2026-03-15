# Changelog

All notable changes to the DenoGenesis frontend will be documented in this file.

## [Unreleased]

### Fixed
- Hero title not centered on mobile: added `align-items: center` to `.hero-title` in the `max-width: 900px` media query.
- Developer note mission statement invisible on scroll: `.dev-note-mission` container was stuck at `opacity: 0` (CSS) while only inner `.char` spans were animated. Added an opacity flush (delay: 900ms) before the typewriter fires, matching the pattern used for `.hero-sub`.

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

## [0.3.0] - 2026-03-15

### Added
- `index.html`: New `.dev-note` section replacing the countdown — cathedral-edition developer manifesto by Pedro M. Dominguez. Contains: CSS gothic arch crown, rotating ✦ scripture ornament, large italic quote ("For many are called, few are chosen." — Matthew 22:14), tribute block to St. Joseph Old Cathedral (OKC, Est. 1903), stained-glass ✛ cross divider, developer name/role/mission, gradient-border CTA pill with pulsing ring.
- `main.css`: Full `.dev-note` cathedral component — indigo vault + gold halo + nave-pillar atmosphere via layered radial gradients + repeating-linear-gradient; `.cathedral-arch` gothic arch ornament with double-border + `arch-glow` keyframe; `.scripture-ornament` slow-spin animation; `.scripture-quote` gold gradient text with `gradient-shift`; `.cathedral-tribute` with `tribute-shimmer` keyframe on St. Joseph name; `.stained-divider` gold line + ✛ cross glyph; `.dev-note-mission` starts at opacity:0 for typewriter reveal; `.dev-note-cta` gradient border-box pill with `.cta-pulse` ring.
- `main.css`: New keyframes — `arch-glow`, `ornament-rotate`, `tribute-shimmer`.
- `script.js`: IntersectionObserver on `.dev-note` — stagger-animates all blocks in on scroll entry, then typewriters mission statement (28ms/char, no cursor kept).

### Removed
- `index.html`: Countdown timer section (`.teaser-footer`, `.countdown`, `.count-item`, `.count-sep`).
- `main.css`: All countdown styles and `@keyframes count-pulse`, `count-sweep`, `sep-pulse`.
- `script.js`: `targetDate`, `updateCountdown()`, `setInterval`, teaser observer block.

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
