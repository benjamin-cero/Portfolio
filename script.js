/* ========================
   PARTICLE BACKGROUND
======================== */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.r = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.45 + 0.05;
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.speedY = (Math.random() - 0.5) * 0.2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(108,99,255,${this.alpha})`;
    ctx.fill();
  }
}

// Init particles
for (let i = 0; i < 120; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(108,99,255,${0.08 * (1 - dist / 110)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ========================
   NAVBAR SCROLL
======================== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  highlightNavLink();
});

/* ========================
   ACTIVE NAV LINK
======================== */
function highlightNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
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
   SMOOTH PARALLAX HERO
======================== */
window.addEventListener('scroll', () => {
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroContent || !heroVisual) return;
  const y = window.scrollY;
  heroContent.style.transform = `translateY(${y * 0.12}px)`;
  heroVisual.style.transform = `translateY(${y * 0.07}px)`;
});

/* ========================
   CURSOR GLOW (subtle)
======================== */
const glow = document.createElement('div');
glow.id = 'cursor-glow';
Object.assign(glow.style, {
  position: 'fixed',
  width: '350px',
  height: '350px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)',
  pointerEvents: 'none',
  transform: 'translate(-50%,-50%)',
  zIndex: '0',
  transition: 'opacity .3s',
});
document.body.appendChild(glow);

window.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

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
