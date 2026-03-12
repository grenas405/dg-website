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
            translateX: e.clientX - 20,
            translateY: e.clientY - 20,
            duration: 500,
            easing: 'easeOutExpo'
        });
    });

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
        scale: [0.9, 1],
        duration: 1200
    }, '-=600')
    .add({
        targets: '.hero-sub',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800
    }, '-=800')
    .add({
        targets: '.hero-btns button',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 800
    }, '-=600')
    .add({
        targets: '.card',
        opacity: [0, 1],
        translateY: [40, 0],
        rotate: [-5, 0],
        delay: anime.stagger(150),
        duration: 1000
    }, '-=1000');

    // --- Floating Blobs Animation ---
    anime({
        targets: '.blob',
        translateX: () => anime.random(-50, 50),
        translateY: () => anime.random(-50, 50),
        scale: () => anime.random(0.8, 1.2),
        duration: 3000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutQuad'
    });

    // --- Hover Effects for Cards ---
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                scale: 1.1,
                rotate: 2,
                duration: 400,
                easing: 'easeOutElastic(1, .6)'
            });
        });
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
                rotate: 0,
                duration: 400,
                easing: 'easeOutElastic(1, .6)'
            });
        });
    });

    // --- Feature Grid Scroll Animation ---
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target.querySelectorAll('.feature-item'),
                    translateY: [50, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(100),
                    duration: 800,
                    easing: 'easeOutQuad'
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const grid = document.querySelector('.grid');
    if (grid) observer.observe(grid);

    // --- Simple Countdown Timer (7 days from now for teaser effect) ---
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('days').innerText = days;
        document.getElementById('hours').innerText = hours;
        document.getElementById('mins').innerText = mins;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

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
            scale: [1, 0.9, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });
        alert("Genesis is near! Check back soon for the official launch.");
    });
});