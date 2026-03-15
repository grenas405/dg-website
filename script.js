document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Cursor Logic ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    document.addEventListener('mousemove', (e) => {
        anime({
            targets: cursor,
            translateX: e.clientX,
            translateY: e.clientY,
            duration: 0,
            easing: 'linear'
        });

        anime({
            targets: follower,
            translateX: e.clientX - 18,
            translateY: e.clientY - 18,
            duration: 500,
            easing: 'easeOutExpo'
        });
    });

    // --- Typewriter System ---
    /**
     * Splits element text into .char spans and animates them in with AnimeJS.
     * Appends a blinking .typewriter-cursor after the text.
     * @param {Element} el - Target element
     * @param {number} startDelay - Milliseconds before typing starts
     * @param {number} charDelay - Milliseconds between each character (default 38)
     * @param {boolean} keepCursor - Leave cursor blinking after done (default true)
     */
    function typewriteElement(el, startDelay = 0, charDelay = 38, keepCursor = true) {
        if (!el) return;

        const text = el.textContent.trim().replace(/\s+/g, ' ');
        el.textContent = '';

        // Build char spans, grouping each word in a nowrap wrapper so
        // line breaks only happen at space boundaries, never mid-word.
        const chars = [];
        const words = text.split(' ');
        words.forEach((word, wi) => {
            const wordWrap = document.createElement('span');
            wordWrap.style.cssText = 'display:inline-block;white-space:nowrap;';
            word.split('').forEach(char => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                wordWrap.appendChild(span);
                chars.push(span);
            });
            el.appendChild(wordWrap);
            // Space between words (breakable point)
            if (wi < words.length - 1) {
                const space = document.createElement('span');
                space.className = 'char';
                space.textContent = '\u00A0';
                el.appendChild(space);
                chars.push(space);
            }
        });

        // Blinking cursor
        const cursorEl = document.createElement('span');
        cursorEl.className = 'typewriter-cursor';
        el.appendChild(cursorEl);

        // Animate characters
        anime({
            targets: chars,
            opacity: [0, 1],
            delay: anime.stagger(charDelay, { start: startDelay }),
            duration: 1,
            easing: 'linear',
            complete() {
                if (!keepCursor) cursorEl.remove();
            }
        });
    }

    // --- Hero Animations ---
    const timeline = anime.timeline({
        easing: 'easeOutExpo',
    });

    timeline
    .add({
        targets: '.nav-link, .logo, .cta-btn',
        translateY: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800
    })
    .add({
        targets: '.pre-title',
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 800
    }, '-=400')
    .add({
        targets: '.glitch-text',
        opacity: [0, 1],
        scale: [0.88, 1],
        duration: 1200
    }, '-=600')
    .add({
        targets: '.hero-btns button',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 800
    }, '-=400')
    .add({
        targets: '.card',
        opacity: [0, 1],
        translateY: [40, 0],
        rotate: [-5, 0],
        delay: anime.stagger(150),
        duration: 1000
    }, '-=800');

    // Hero subtitle typewriter (starts after glitch text appears, ~2200ms in)
    typewriteElement(document.querySelector('.hero-sub'), 2200, 22, true);

    // Fade hero-sub container in so it's visible for typewriter
    anime({
        targets: '.hero-sub',
        opacity: [0, 1],
        duration: 1,
        delay: 2200,
        easing: 'linear'
    });

    // --- Floating Blobs Animation ---
    anime({
        targets: '.blob',
        translateX: () => anime.random(-55, 55),
        translateY: () => anime.random(-55, 55),
        scale: () => anime.random(0.8, 1.2) / 10 + 0.9,
        duration: 3200,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
    });

    // --- Hover Effects for Cards ---
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                scale: 1.08,
                rotate: 1.5,
                duration: 420,
                easing: 'easeOutElastic(1, .6)'
            });
        });
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
                rotate: 0,
                duration: 420,
                easing: 'easeOutElastic(1, .6)'
            });
        });
    });

    // --- Scroll-triggered Animations ---
    const observerOptions = { threshold: 0.18 };

    let featureTyped = false;
    let devNoteAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const target = entry.target;

            // Feature grid reveal
            if (target.classList.contains('grid')) {
                anime({
                    targets: target.querySelectorAll('.feature-item'),
                    translateY: [50, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(110),
                    duration: 850,
                    easing: 'easeOutQuad'
                });

                // Typewriter on section subtitle (fires once)
                if (!featureTyped) {
                    featureTyped = true;
                    const subP = document.querySelector('.section-header p');
                    typewriteElement(subP, 300, 30, false);
                }

                observer.unobserve(target);
            }

            // Developer note cathedral section
            if (target.classList.contains('dev-note') && !devNoteAnimated) {
                devNoteAnimated = true;

                // Stagger in all major blocks
                anime({
                    targets: [
                        '.dev-note-scripture',
                        '.cathedral-tribute',
                        '.stained-divider',
                        '.dev-note-name',
                        '.dev-note-role',
                        '.dev-note-cta'
                    ],
                    opacity: [0, 1],
                    translateY: [32, 0],
                    delay: anime.stagger(180),
                    duration: 900,
                    easing: 'easeOutExpo'
                });

                // Typewriter mission statement after other elements appear
                const missionEl = target.querySelector('.dev-note-mission');
                // Flush the container opacity so chars typed inside are visible
                anime({
                    targets: missionEl,
                    opacity: [0, 1],
                    duration: 1,
                    delay: 900,
                    easing: 'linear'
                });
                typewriteElement(missionEl, 900, 28, false);

                observer.unobserve(target);
            }
        });
    }, observerOptions);

    const grid = document.querySelector('.grid');
    if (grid) observer.observe(grid);

    const devNoteSection = document.querySelector('.dev-note');
    if (devNoteSection) observer.observe(devNoteSection);

    // --- Scroll Progress Bar ---
    const scrollBar = document.getElementById('scrollProgress');
    if (scrollBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollBar.style.width = (scrollTop / docHeight * 100) + '%';
        }, { passive: true });
    }

    // --- Button Fun ---
    const primaryBtn = document.querySelector('.primary-btn');
    primaryBtn.addEventListener('click', () => {
        anime({
            targets: '.primary-btn',
            scale: [1, 0.92, 1],
            duration: 320,
            easing: 'easeInOutQuad'
        });
        alert("Genesis is near! Check back soon for the official launch.");
    });
});
