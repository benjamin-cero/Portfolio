/* ========================
   PARTICLE BACKGROUND (optimized)
======================== */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
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
  resizeTimer = setTimeout(resize, 150);
});

// Fewer particles, simpler — still looks the same
const PARTICLE_COUNT = 60;
const CONNECT_DIST = 100;
const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST; // avoid sqrt

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvasW;
    this.y = Math.random() * canvasH;
    this.r = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.45 + 0.05;
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.speedY = (Math.random() - 0.5) * 0.2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvasW || this.y < 0 || this.y > canvasH) {
      this.reset();
    }
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

// Pre-compute color string
const PARTICLE_COLOR = '108,99,255';

function animateParticles() {
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Batch: draw all particles in one path
  const len = particles.length;
  for (let i = 0; i < len; i++) {
    const p = particles[i];
    p.update();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.2832); // 2*PI
    ctx.fillStyle = `rgba(${PARTICLE_COLOR},${p.alpha})`;
    ctx.fill();
  }

  // Connections — use squared distance (no sqrt), batch similar lines
  ctx.lineWidth = 0.5;
  for (let i = 0; i < len; i++) {
    const a = particles[i];
    for (let j = i + 1; j < len; j++) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < CONNECT_DIST_SQ) {
        const alpha = 0.08 * (1 - Math.sqrt(distSq) / CONNECT_DIST);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${PARTICLE_COLOR},${alpha})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ========================
   SCROLL HANDLER (single, throttled via rAF)
======================== */
const navbar = document.getElementById('navbar');
const heroContent = document.querySelector('.hero-content');
const heroVisual = document.querySelector('.hero-visual');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(handleScroll);
    scrollTicking = true;
  }
}, { passive: true });

function handleScroll() {
  const y = window.scrollY;

  // Navbar bg
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

  // Parallax (only on hero, GPU-accelerated with translate3d)
  if (heroContent && heroVisual) {
    heroContent.style.transform = `translate3d(0,${y * 0.12}px,0)`;
    heroVisual.style.transform = `translate3d(0,${y * 0.07}px,0)`;
  }

  scrollTicking = false;
}

/* ========================
   HAMBURGER MENU
======================== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ========================
   SCROLL REVEAL
======================== */
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

/* ========================
   COUNTER ANIMATION
======================== */
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

/* ========================
   CURSOR GLOW (GPU-accelerated)
======================== */
const glow = document.createElement('div');
glow.id = 'cursor-glow';
Object.assign(glow.style, {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '350px',
  height: '350px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: '0',
  willChange: 'transform',
});
document.body.appendChild(glow);

let glowX = 0, glowY = 0;
let glowRAF = false;

window.addEventListener('mousemove', (e) => {
  glowX = e.clientX;
  glowY = e.clientY;
  if (!glowRAF) {
    glowRAF = true;
    requestAnimationFrame(() => {
      glow.style.transform = `translate3d(${glowX - 175}px,${glowY - 175}px,0)`;
      glowRAF = false;
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

    // Reset
    dot.className = 'wakeup-dot pinging';
    status.textContent = 'Waking up...';
    btn.disabled = true;
    btn.style.pointerEvents = 'none';

    try {
      const start = Date.now();
      const res = await fetch(url, { mode: 'no-cors' });
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      dot.className = 'wakeup-dot online';
      status.textContent = `Online (${elapsed}s)`;
    } catch (err) {
      // no-cors mode may throw but server still wakes up, try again
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
