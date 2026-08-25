/* ==========================================================================
   BIRTHDAY SITE — script.js
   Everything below is vanilla JS. No dependencies.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------------------------
       1. PRELOADER
       Fades out once the window has fully loaded (fonts/images included).
       A minimum display time keeps the heartbeat from flashing by too fast.
    ------------------------------------------------------------------ */
    const preloader = document.getElementById('preloader');
    const MIN_PRELOADER_MS = 900;
    const startTime = Date.now();

    function hidePreloader() {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_PRELOADER_MS - elapsed);
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, remaining);
    }

    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
        // Safety net in case 'load' never fires (e.g. missing asset files)
        setTimeout(hidePreloader, 3000);
    }


    /* ------------------------------------------------------------------
       2. AMBIENT BACKGROUND — floating hearts & soft glow particles
       Lightweight canvas loop, pauses when tab is hidden to save battery.
    ------------------------------------------------------------------ */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function createParticle() {
        const isHeart = Math.random() > 0.45;
        return {
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 40 + Math.random() * 200,
            size: isHeart ? 8 + Math.random() * 12 : 1.5 + Math.random() * 3,
            speed: 0.25 + Math.random() * 0.5,
            drift: (Math.random() - 0.5) * 0.4,
            opacity: 0.12 + Math.random() * 0.28,
            isHeart,
            wobble: Math.random() * Math.PI * 2,
        };
    }

    function initParticles() {
        const count = window.innerWidth < 640 ? 18 : 32;
        particles = Array.from({ length: count }, createParticle);
    }

    function drawHeart(x, y, size, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#F4C2C2';
        ctx.beginPath();
        const s = size / 2;
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(0, -s * 0.4, -s, -s * 0.4, -s, s * 0.2);
        ctx.bezierCurveTo(-s, s * 0.9, 0, s * 1.2, 0, s * 1.6);
        ctx.bezierCurveTo(0, s * 1.2, s, s * 0.9, s, s * 0.2);
        ctx.bezierCurveTo(s, -s * 0.4, 0, -s * 0.4, 0, s * 0.3);
        ctx.fill();
        ctx.restore();
    }

    function drawGlow(x, y, size, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, 'rgba(244, 194, 194, 0.9)');
        gradient.addColorStop(1, 'rgba(244, 194, 194, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function tickParticles() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particles.forEach((p) => {
            p.y -= p.speed;
            p.wobble += 0.02;
            p.x += Math.sin(p.wobble) * p.drift;

            if (p.isHeart) {
                drawHeart(p.x, p.y, p.size, p.opacity);
            } else {
                drawGlow(p.x, p.y, p.size, p.opacity);
            }

            if (p.y < -60) {
                Object.assign(p, createParticle(), { y: window.innerHeight + 40 });
            }
        });

        animationId = requestAnimationFrame(tickParticles);
    }

    resizeCanvas();
    initParticles();
    tickParticles();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animationId = requestAnimationFrame(tickParticles);
        }
    });


    /* ------------------------------------------------------------------
       3. CONFETTI BURST
       Lightweight custom particle burst — no external library.
    ------------------------------------------------------------------ */
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    const CONFETTI_COLORS = ['#F4C2C2', '#D9A79C', '#F6ECE2', '#C98A93', '#FFFFFF'];

    function resizeConfettiCanvas() {
        confettiCanvas.width = window.innerWidth * devicePixelRatio;
        confettiCanvas.height = window.innerHeight * devicePixelRatio;
        confettiCanvas.style.width = window.innerWidth + 'px';
        confettiCanvas.style.height = window.innerHeight + 'px';
        confettiCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);

    function launchConfetti(originX, originY) {
        const pieces = Array.from({ length: 140 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 4 + Math.random() * 9;
            return {
                x: originX,
                y: originY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 4, // slight upward bias
                size: 5 + Math.random() * 6,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                gravity: 0.18 + Math.random() * 0.08,
                drag: 0.985,
                life: 1,
                decay: 0.006 + Math.random() * 0.006,
                shape: Math.random() > 0.5 ? 'rect' : 'circle',
            };
        });

        function frame() {
            confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            let alive = false;
            pieces.forEach((p) => {
                if (p.life <= 0) return;
                alive = true;

                p.vx *= p.drag;
                p.vy = p.vy * p.drag + p.gravity;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.life -= p.decay;

                confettiCtx.save();
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate((p.rotation * Math.PI) / 180);
                confettiCtx.globalAlpha = Math.max(p.life, 0);
                confettiCtx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    confettiCtx.beginPath();
                    confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    confettiCtx.fill();
                }
                confettiCtx.restore();
            });

            if (alive) {
                requestAnimationFrame(frame);
            } else {
                confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            }
        }

        requestAnimationFrame(frame);
    }


    /* ------------------------------------------------------------------
       4. ENVELOPE INTERACTION
       Click/tap -> confetti burst + envelope fade + hero slide up +
       main content reveal + typewriter kicks off.
    ------------------------------------------------------------------ */
    const envelopeBtn = document.getElementById('envelope');
    const hero = document.getElementById('hero');
    const mainContent = document.getElementById('main-content');
    let opened = false;

    envelopeBtn.addEventListener('click', () => {
        if (opened) return;
        opened = true;

        // Burst confetti from the envelope's screen position
        const rect = envelopeBtn.getBoundingClientRect();
        launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

        envelopeBtn.classList.add('opened');
        envelopeBtn.setAttribute('aria-disabled', 'true');

        // Let the open animation play briefly, then slide the hero away
        // and reveal the rest of the page.
        setTimeout(() => {
            hero.classList.add('envelope-opened');
            mainContent.classList.add('revealed');

            setTimeout(() => {
                mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                startTypewriter();
            }, 500);
        }, 650);
    });


    /* ------------------------------------------------------------------
       5. TYPEWRITER EFFECT FOR THE LETTER
       Replace LETTER_TEXT with your real message — line breaks (\n)
       are preserved.
    ------------------------------------------------------------------ */
    const LETTER_TEXT =
        `My BUTU,

Happy birthday! 🎉

I hope today is filled with everything that makes you happy — good food, good laughs, and people who make you feel loved (which, let's be honest, you deserve a lot of).

I just wanted to take a second to say how glad I am that you're in my life. You're one of those people I can talk to about literally anything, and somehow you always make things better, whether it's with your advice, your randomness, or just you being you. Not everyone gets a friend like that, and I don't take it for granted.

Here's to another year of your terrible jokes, our ridiculous conversations, and all the memories we haven't made yet. Hope this year brings you everything you're hoping for.

Have the best birthday. Go be a little extra today — you've earned it.`;

    const typewriterEl = document.getElementById('typewriter-text');
    const cursorEl = document.getElementById('typewriter-cursor');
    let typewriterStarted = false;

    function startTypewriter() {
        if (typewriterStarted) return;
        typewriterStarted = true;

        let i = 0;
        const speed = 99; // ms per character

        function typeNext() {
            if (i < LETTER_TEXT.length) {
                typewriterEl.textContent += LETTER_TEXT.charAt(i);
                i++;
                setTimeout(typeNext, speed);
            } else {
                cursorEl.classList.add('done');
            }
        }

        typeNext();
    }


    /* ------------------------------------------------------------------
       6. MEMORY GALLERY — tap-to-toggle on touch devices
       Hover already works via CSS; this adds a tap toggle for mobile
       where there is no hover state.
    ------------------------------------------------------------------ */
    const polaroids = document.querySelectorAll('.polaroid');

    polaroids.forEach((card) => {
        card.addEventListener('click', () => {
            const isTouchDevice = window.matchMedia('(hover: none)').matches;
            if (!isTouchDevice) return;

            const wasActive = card.classList.contains('active');
            polaroids.forEach((c) => c.classList.remove('active'));
            if (!wasActive) card.classList.add('active');
        });
    });


    /* ------------------------------------------------------------------
       7. FLOATING MUSIC PLAYER
       Toggles playback of the background song and spins the vinyl icon.
    ------------------------------------------------------------------ */
    const musicToggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-audio');

    function setPlayingUI(isPlaying) {
        musicToggle.classList.toggle('playing', isPlaying);
        musicToggle.setAttribute('aria-pressed', String(isPlaying));
        musicToggle.setAttribute('aria-label', isPlaying ? 'Pause our song' : 'Play our song');
    }

    function tryAutoplay() {
        audio.muted = false;
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setPlayingUI(true);
                })
                .catch(() => {
                    setPlayingUI(false);
                    document.addEventListener('click', startOnFirstInteraction, { once: true });
                    document.addEventListener('keydown', startOnFirstInteraction, { once: true });
                    document.addEventListener('touchstart', startOnFirstInteraction, { once: true });
                });
        }
    }

    function startOnFirstInteraction() {
        if (audio.paused) {
            audio.play().then(() => setPlayingUI(true)).catch(() => {});
        }
    }

    musicToggle.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(() => {
                console.warn('Could not play audio — check that song/song1.mp3 exists.');
            });
            setPlayingUI(true);
        } else {
            audio.pause();
            setPlayingUI(false);
        }
    });

    tryAutoplay();

});