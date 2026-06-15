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

    const reducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Smooth in-page navigation ---
    function smoothScrollTo(selector) {
        const target = document.querySelector(selector);
        if (!target) return;
        target.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    document.querySelectorAll('[data-scroll]').forEach(btn => {
        btn.addEventListener('click', () => {
            anime({
                targets: btn,
                scale: [1, 0.94, 1],
                duration: 300,
                easing: 'easeInOutQuad'
            });
            smoothScrollTo(btn.dataset.scroll);
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length > 1 && document.querySelector(id)) {
                e.preventDefault();
                smoothScrollTo(id);
                history.pushState(null, '', id);
            }
        });
    });

    // --- Launch Countdown ---
    const LAUNCH = new Date('2026-10-01T15:00:00Z'); // Autumn 2026 genesis
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        const values = countdownEl.querySelectorAll('.cd-value');
        const previous = {};
        const pad = (n) => String(n).padStart(2, '0');

        function renderCountdown() {
            const remaining = Math.max(LAUNCH - Date.now(), 0);
            const map = {
                days: Math.floor(remaining / 86400000),
                hours: Math.floor(remaining / 3600000) % 24,
                minutes: Math.floor(remaining / 60000) % 60,
                seconds: Math.floor(remaining / 1000) % 60
            };
            values.forEach(el => {
                const unit = el.dataset.unit;
                const next = unit === 'days'
                    ? String(map[unit])
                    : pad(map[unit]);
                if (previous[unit] !== next) {
                    el.textContent = next;
                    if (!reducedMotion && previous[unit] !== undefined) {
                        el.classList.remove('tick');
                        void el.offsetWidth; // reflow to restart the animation
                        el.classList.add('tick');
                    }
                    previous[unit] = next;
                }
            });
        }

        renderCountdown();
        setInterval(renderCountdown, 1000);

        if (reducedMotion) {
            countdownEl.style.opacity = 1;
        } else {
            anime({
                targets: countdownEl,
                opacity: [0, 1],
                translateY: [16, 0],
                duration: 900,
                delay: 2600,
                easing: 'easeOutExpo'
            });
        }
    }

    // --- Waitlist ---
    const countLabel = document.getElementById('waitlistCount');

    function formatProof(total) {
        if (!total || total < 1) return 'Be among the first to join';
        const n = total.toLocaleString();
        return total === 1
            ? '1 builder has reserved their place'
            : `${n} builders have reserved their place`;
    }

    async function loadCount() {
        try {
            const res = await fetch('/api/waitlist', {
                headers: { accept: 'application/json' }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (countLabel) countLabel.textContent = formatProof(data.total);
        } catch {
            /* keep the default copy on failure */
        }
    }
    loadCount();

    const waitlistForm = document.getElementById('waitlistForm');
    if (waitlistForm) {
        const emailInput = document.getElementById('waitlistEmail');
        const honeypot = document.getElementById('waitlistCompany');
        const submitBtn = document.getElementById('waitlistSubmit');
        const msg = document.getElementById('waitlistMsg');
        const field = waitlistForm.querySelector('.waitlist-field');
        const successBox = document.getElementById('waitlistSuccess');
        const successPos = document.getElementById('successPosition');
        const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

        function setError(text) {
            msg.textContent = text;
            msg.classList.add('is-error');
            field.classList.add('is-error');
        }
        function clearError() {
            msg.textContent = '';
            msg.classList.remove('is-error');
            field.classList.remove('is-error');
        }
        emailInput.addEventListener('input', clearError);

        function showSuccess(data) {
            waitlistForm.hidden = true;
            successBox.hidden = false;
            if (successPos && typeof data.position === 'number') {
                const lead = data.status === 'existing'
                    ? "You're already"
                    : "You're";
                successPos.innerHTML =
                    `${lead} <strong>#${data.position}</strong> in the founding cohort`;
            }
            if (!reducedMotion) {
                anime({
                    targets: successBox,
                    opacity: [0, 1],
                    scale: [0.96, 1],
                    duration: 700,
                    easing: 'easeOutExpo'
                });
            }
            loadCount();
        }

        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (!EMAIL_RE.test(email)) {
                setError('Please enter a valid email address.');
                emailInput.focus();
                return;
            }
            clearError();
            submitBtn.disabled = true;
            submitBtn.classList.add('is-loading');
            try {
                const res = await fetch('/api/waitlist', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        company: honeypot ? honeypot.value : ''
                    })
                });
                const data = await res.json().catch(() => ({}));
                if (res.status === 200 || res.status === 201) {
                    showSuccess(data);
                } else if (res.status === 400) {
                    setError('That email looks off — mind checking it?');
                } else if (res.status === 429) {
                    setError('Whoa, slow down a moment and try again.');
                } else {
                    setError('Something glitched on our end. Try again shortly.');
                }
            } catch {
                setError('Network hiccup — check your connection and retry.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
            }
        });
    }
});
