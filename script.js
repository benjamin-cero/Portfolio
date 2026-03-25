/* ========================
   PARTICLE BACKGROUND (max optimized)
======================== */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
let particles = [];
let canvasW = 0, canvasH = 0;

function resize() {
  canvasW = canvas.width = window.innerWidth;
  canvasH = canvas.height = window.innerHeight;
}
resize();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 200);
}, { passive: true });

const PARTICLE_COUNT = 45;
const CONNECT_DIST_SQ = 9000; // ~95px squared, skip sqrt entirely

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvasW;
    this.y = Math.random() * canvasH;
    this.r = Math.random() * 1.5 + 0.4;
    this.alpha = Math.random() * 0.4 + 0.08;
    this.vx = (Math.random() - 0.5) * 0.18;
    this.vy = (Math.random() - 0.5) * 0.18;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvasW || this.y < 0 || this.y > canvasH) this.reset();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

// Draw connections every 3rd frame to cut GPU work by ~66%
let frameCount = 0;
let isTabVisible = true;

document.addEventListener('visibilitychange', () => {
  isTabVisible = !document.hidden;
});

function animateParticles() {
  if (!isTabVisible) { requestAnimationFrame(animateParticles); return; }

  ctx.clearRect(0, 0, canvasW, canvasH);
  const len = particles.length;

  // Update + draw particles
  ctx.fillStyle = 'rgba(108,99,255,0.25)';
  for (let i = 0; i < len; i++) {
    const p = particles[i];
    p.update();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.2832);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Connections only every 3rd frame
  if (frameCount % 3 === 0) {
    ctx.lineWidth = 0.5;
    for (let i = 0; i < len; i++) {
      const a = particles[i];
      for (let j = i + 1; j < len; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < CONNECT_DIST_SQ) {
          ctx.globalAlpha = 0.07 * (1 - dSq / CONNECT_DIST_SQ);
          ctx.strokeStyle = 'rgb(108,99,255)';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  frameCount++;
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ========================
   SINGLE SCROLL HANDLER (rAF throttled)
======================== */
const navbar = document.getElementById('navbar');
const heroContent = document.querySelector('.hero-content');
const heroVisual = document.querySelector('.hero-visual');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

let scrollTicking = false;
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(handleScroll);
  }
}, { passive: true });

function handleScroll() {
  const y = lastScrollY;

  // Navbar
  navbar.classList.toggle('scrolled', y > 30);

  // Active nav link
  let current = '';
  for (let i = 0; i < sections.length; i++) {
    if (y >= sections[i].offsetTop - 120) current = sections[i].id;
  }
  for (let i = 0; i < navLinks.length; i++) {
    const link = navLinks[i];
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  }

  // Parallax (GPU compositing via translate3d)
  if (heroContent) heroContent.style.transform = `translate3d(0,${y * 0.12}px,0)`;
  if (heroVisual) heroVisual.style.transform = `translate3d(0,${y * 0.07}px,0)`;

  scrollTicking = false;
}

/* ========================
   HAMBURGER MENU
======================== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ========================
   SCROLL REVEAL (lightweight)
======================== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ========================
   COUNTER ANIMATION
======================== */
function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target, parseInt(entry.target.dataset.target, 10));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

/* ========================
   CURSOR GLOW (GPU only, no layout thrash)
======================== */
const glow = document.createElement('div');
glow.id = 'cursor-glow';
Object.assign(glow.style, {
  position: 'fixed',
  top: '0', left: '0',
  width: '350px', height: '350px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: '0',
  willChange: 'transform',
  contain: 'layout style paint',
});
document.body.appendChild(glow);

let mx = -500, my = -500, glowQueued = false;
window.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  if (!glowQueued) {
    glowQueued = true;
    requestAnimationFrame(() => {
      glow.style.transform = `translate3d(${mx - 175}px,${my - 175}px,0)`;
      glowQueued = false;
    });
  }
}, { passive: true });

/* ========================
   BACKEND WAKE-UP SERVICE
======================== */
document.querySelectorAll('.wakeup-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const url = btn.dataset.url;
    const id = btn.id.replace('wake-', '');
    const dot = document.getElementById(`dot-${id}`);
    const status = document.getElementById(`status-${id}`);

    dot.className = 'wakeup-dot pinging';
    status.textContent = 'Waking up...';
    btn.disabled = true;
    btn.style.pointerEvents = 'none';

    try {
      const start = Date.now();
      await fetch(url, { mode: 'no-cors' });
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      dot.className = 'wakeup-dot online';
      status.textContent = `Online (${elapsed}s)`;
    } catch (err) {
      try {
        await fetch(url, { mode: 'no-cors' });
        dot.className = 'wakeup-dot online';
        status.textContent = 'Online';
      } catch (e) {
        dot.className = 'wakeup-dot error';
        status.textContent = 'Error';
      }
    }

    btn.disabled = false;
    btn.style.pointerEvents = '';
  });
});
