/* =============================================================
   ECEL ESPORTS — MAIN JAVASCRIPT
   New additions:
   • Loader screen with progress bar
   • Custom cursor with magnetic hover
   • Animated stats counters
   • Text scramble effect on reveal
   • Cursor trail sparks
   • Card tilt (3D mouse-follow)
   • Stat bar fill on scroll
   ============================================================= */

'use strict';

/* ---------------------------------------------------------------
   CUSTOM CURSOR
--------------------------------------------------------------- */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Hide on touch devices
  if (window.matchMedia('(pointer:coarse)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    return;
  }

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Smooth ring follow
  const animRing = () => {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  };
  requestAnimationFrame(animRing);

  // Hover effect
  const hoverables = document.querySelectorAll('a, button, .player-card, .tc-card, .media-card, .stat-card, .social-btn');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

/* ---------------------------------------------------------------
   NAVBAR
--------------------------------------------------------------- */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('navToggle');
  const links   = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  const closeMenu = () => {
    toggle.classList.remove('active');
    links.classList.remove('open');
    overlay.classList.remove('visible');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    toggle.classList.add('active');
    links.classList.add('open');
    overlay.classList.add('visible');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    links.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  const trackActive = () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', trackActive, { passive:true });
}

/* ---------------------------------------------------------------
   SCROLL PROGRESS BAR
--------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
  }, { passive:true });
}

/* ---------------------------------------------------------------
   REVEAL ON SCROLL
--------------------------------------------------------------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay) || 0;
      setTimeout(() => entry.target.classList.add('revealed'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------------
   ANIMATED COUNTERS
--------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 1600;
    const start  = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const v = Math.floor(easeOut(t) * target);
      el.textContent = v + suffix;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
        // Flash red glow on completion
        el.style.textShadow = '0 0 30px rgba(204,0,0,.9), 0 0 60px rgba(204,0,0,.5)';
        el.style.transition = 'text-shadow 0.8s ease';
        setTimeout(() => { el.style.textShadow = ''; }, 900);
      }
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ---------------------------------------------------------------
   STAT BAR FILL ANIMATION
--------------------------------------------------------------- */
function initStatBars() {
  const bars = document.querySelectorAll('.stat-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const targetW = entry.target.style.width || '0%';
      entry.target.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          entry.target.style.width = targetW;
        });
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
}

/* ---------------------------------------------------------------
   TEXT SCRAMBLE (on section titles when revealed)
--------------------------------------------------------------- */
class TextScramble {
  constructor(el) {
    this.el    = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⚡#@';
    this.orig  = el.textContent;
  }

  scramble(duration = 900) {
    const orig   = this.orig;
    const startT = performance.now();
    const tick   = (now) => {
      const t = Math.min((now - startT) / duration, 1);
      let out = '';
      for (let i = 0; i < orig.length; i++) {
        if (orig[i] === ' ' || orig[i] === '\n') { out += orig[i]; continue; }
        if (t > i / orig.length) {
          out += orig[i];
        } else {
          out += this.chars[Math.floor(Math.random() * this.chars.length)];
        }
      }
      this.el.textContent = out;
      if (t < 1) requestAnimationFrame(tick);
      else this.el.textContent = orig;
    };
    requestAnimationFrame(tick);
  }
}

function initScramble() {
  // Apply scramble to plain-text section titles when they enter viewport
  const titles = document.querySelectorAll('.section-title');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Only scramble the first text node (not the .accent span)
      const textNode = entry.target.childNodes[0];
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
      const orig = textNode.textContent;
      const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const dur   = 700;
      const start = performance.now();
      const tick  = (now) => {
        const t = Math.min((now - start) / dur, 1);
        let out = '';
        for (let i = 0; i < orig.length; i++) {
          if (orig[i] === ' ') { out += ' '; continue; }
          out += t > i / orig.length
            ? orig[i]
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        textNode.textContent = out;
        if (t < 1) requestAnimationFrame(tick);
        else textNode.textContent = orig;
      };
      requestAnimationFrame(tick);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  titles.forEach(t => observer.observe(t));
}

/* ---------------------------------------------------------------
   PARALLAX — HERO LOGO
--------------------------------------------------------------- */
function initParallax() {
  const logoWrap = document.querySelector('.hero-logo-wrap');
  if (!logoWrap) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      logoWrap.style.transform = `translateY(${y * 0.12}px)`;
    }
  }, { passive:true });
}

/* ---------------------------------------------------------------
   SMOOTH SCROLL (offset for fixed nav)
--------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---------------------------------------------------------------
   CARD TILT (3D mouse-follow)
--------------------------------------------------------------- */
function initCardTilt() {
  if (window.matchMedia('(pointer:coarse)').matches) return;

  document.querySelectorAll('.player-card, .tc-card, .stat-card, .ach-card, .value-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const dx    = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy    = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      card.style.transform = `translateY(-8px) perspective(600px) rotateX(${dy * -6}deg) rotateY(${dx * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------------------------------------------------------------
   HERO TAGLINE STAGGER
--------------------------------------------------------------- */
function initHeroTagline() {
  document.querySelectorAll('.hero-tagline span').forEach((span, i) => {
    span.style.opacity   = '0';
    span.style.transform = 'translateY(8px)';
    span.style.transition = `opacity .5s ease ${0.85 + i * 0.18}s, transform .5s ease ${0.85 + i * 0.18}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      span.style.opacity   = '1';
      span.style.transform = 'translateY(0)';
    }));
  });
}

/* ---------------------------------------------------------------
   MANIFESTO LINE STAGGER — extra dramatic entrance
--------------------------------------------------------------- */
function initManifesto() {
  const lines = document.querySelectorAll('.manifesto-line');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('revealed'), 80 + i * 120);
      });
      observer.disconnect();
    });
  }, { threshold: 0.2 });

  if (lines.length) observer.observe(lines[0].closest('.manifesto-section') || lines[0]);
}

/* ---------------------------------------------------------------
   MEDIA CARD PLAY — RIPPLE CLICK
--------------------------------------------------------------- */
function initMediaRipple() {
  document.querySelectorAll('.media-card').forEach(card => {
    card.addEventListener('click', e => {
      const ripple = document.createElement('span');
      const rect   = card.getBoundingClientRect();
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(204,0,0,.25);
        width:10px; height:10px;
        top:${e.clientY - rect.top - 5}px;
        left:${e.clientX - rect.left - 5}px;
        pointer-events:none;
        transform:scale(0);
        transition:transform .6s ease, opacity .6s ease;
        z-index:20;
      `;
      card.style.position = 'relative';
      card.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = `scale(${Math.max(rect.width, rect.height) * 0.3})`;
        ripple.style.opacity   = '0';
      });
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

/* ---------------------------------------------------------------
   CURSOR GLOW (desktop ambient)
--------------------------------------------------------------- */
function initCursorGlow() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9000;
    width:350px;height:350px;border-radius:50%;
    background:radial-gradient(circle,rgba(204,0,0,.06) 0%,transparent 60%);
    transform:translate(-50%,-50%);
    top:0;left:0;will-change:left,top;
  `;
  document.body.appendChild(glow);
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive:true });
  const move = () => { glow.style.left = mx+'px'; glow.style.top = my+'px'; requestAnimationFrame(move); };
  requestAnimationFrame(move);
}

/* ---------------------------------------------------------------
   HERO TAGLINE TYPING ENTRANCE
--------------------------------------------------------------- */
function initHeroTyping() {
  const lines = document.querySelectorAll('.hero-tagline span');
  lines.forEach((span, i) => {
    span.style.opacity = '0';
    span.style.transform = 'translateY(8px)';
    span.style.transition = `opacity .5s ease ${0.85 + i * 0.18}s, transform .5s ease ${0.85 + i * 0.18}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
    }));
  });
}

/* ---------------------------------------------------------------
   CONTACT FORM
--------------------------------------------------------------- */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('cfSuccess');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.querySelector('#cf-name').value.trim();
    const email   = form.querySelector('#cf-email').value.trim();
    const subject = form.querySelector('#cf-subject').value;
    const message = form.querySelector('#cf-message').value.trim();

    if (!name || !email || !message) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('https://formsubmit.co/ajax/ffecelesports@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: subject || 'Contact',
          message,
          _subject: 'Mesaj nou — ECEL Esports Website',
          _captcha: 'false',
          _template: 'table'
        })
      });
      const data = await res.json();

      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> Send Message`;

      if (data.success === 'true' || data.success === true) {
        if (success) {
          success.style.display = 'block';
          setTimeout(() => { success.style.display = 'none'; }, 5000);
        }
      } else {
        alert('A apărut o eroare. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> Send Message`;
      alert('Eroare de conexiune. Verifică internetul şi încearcă din nou.');
    }
  });
}

/* ---------------------------------------------------------------
   HERO PARTICLE CANVAS
--------------------------------------------------------------- */
function initHeroParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const resize = () => {
    const hero = canvas.parentElement;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Spark {
    constructor(initial) { this.reset(initial); }
    reset(initial) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : H + 8;
      this.vx   = (Math.random() - .5) * .55;
      this.vy   = -(Math.random() * 1.3 + .35);
      this.size = Math.random() * 2.2 + .4;
      this.life = 0;
      this.max  = Math.random() * 260 + 100;
      this.base = Math.random() * .55 + .12;
      this.red  = Math.random() > .45;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life >= this.max || this.y < -12) this.reset(false);
    }
    draw() {
      const a = this.base * (1 - (this.life / this.max) ** 2);
      ctx.save();
      ctx.globalAlpha   = a;
      ctx.fillStyle     = this.red ? '#cc0000' : 'rgba(255,255,255,.75)';
      ctx.shadowColor   = this.red ? 'rgba(204,0,0,.9)' : 'rgba(255,255,255,.5)';
      ctx.shadowBlur    = this.red ? 9 : 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const sparks = Array.from({ length: 75 }, (_, i) => new Spark(true));
  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    sparks.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------------------------------------------------------------
   CURSOR SPARKLE TRAIL
--------------------------------------------------------------- */
function initCursorTrail() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  const TRAIL = 14;
  const trail = [];

  for (let i = 0; i < TRAIL; i++) {
    const el = document.createElement('div');
    const sz = 4 - i * 0.22;
    el.style.cssText = [
      'position:fixed', 'pointer-events:none', 'z-index:8999',
      `width:${sz}px`, `height:${sz}px`, 'border-radius:50%',
      `background:rgba(204,0,0,${(0.85 - i * 0.055).toFixed(2)})`,
      `box-shadow:0 0 ${(7 - i * 0.4).toFixed(1)}px rgba(204,0,0,.7)`,
      'transform:translate(-50%,-50%)', 'will-change:left,top',
      'top:0', 'left:0', 'transition:none'
    ].join(';');
    document.body.appendChild(el);
    trail.push({ el, x: 0, y: 0 });
  }

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  const tick = () => {
    let px = mx, py = my;
    trail.forEach((dot, i) => {
      const ease = 0.42 - i * 0.024;
      dot.x += (px - dot.x) * ease;
      dot.y += (py - dot.y) * ease;
      dot.el.style.left = dot.x + 'px';
      dot.el.style.top  = dot.y + 'px';
      px = dot.x; py = dot.y;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------------------------------------------------------------
   MAGNETIC BUTTONS
--------------------------------------------------------------- */
function initMagneticButtons() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  document.querySelectorAll('.btn-primary, .comm-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = `translateY(-3px) translate(${dx * .18}px, ${dy * .18}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------
   BUTTON CLICK SPARK BURST
--------------------------------------------------------------- */
function initButtonSparks() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const COUNT = 16;
      for (let i = 0; i < COUNT; i++) {
        const spark = document.createElement('span');
        const angle = (Math.PI * 2 / COUNT) * i;
        const dist  = 38 + Math.random() * 40;
        const tx    = Math.cos(angle) * dist;
        const ty    = Math.sin(angle) * dist;
        const sz    = 3 + Math.random() * 4;
        const isRed = Math.random() > .4;
        spark.style.cssText = [
          'position:fixed', 'pointer-events:none', 'z-index:99999',
          'border-radius:50%',
          `width:${sz}px`, `height:${sz}px`,
          `left:${e.clientX}px`, `top:${e.clientY}px`,
          'transform:translate(-50%,-50%)',
          `background:${isRed ? '#cc0000' : '#ffffff'}`,
          'box-shadow:0 0 7px rgba(204,0,0,.85)',
          'transition:transform .5s cubic-bezier(.2,.8,.4,1),opacity .5s ease'
        ].join(';');
        document.body.appendChild(spark);
        requestAnimationFrame(() => {
          spark.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
          spark.style.opacity   = '0';
        });
        setTimeout(() => spark.remove(), 560);
      }
    });
  });
}

/* ---------------------------------------------------------------
   CARD DETAILS PANEL
--------------------------------------------------------------- */
function initCardDetails() {
  document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.pc-details-close')) {
        card.classList.remove('details-open');
        return;
      }
      // close any other open card
      document.querySelectorAll('.player-card.details-open').forEach(c => {
        if (c !== card) c.classList.remove('details-open');
      });
      card.classList.toggle('details-open');
    });
  });
}

/* ---------------------------------------------------------------
   ECEL HISTORY MODAL
--------------------------------------------------------------- */
function initEcelModal() {
  const trigger = document.querySelector('.tc-ecel-trigger');
  const modal   = document.getElementById('ecelModal');
  if (!trigger || !modal) return;

  const backdrop = modal.querySelector('.ecel-modal-backdrop');
  const closeBtn = modal.querySelector('.ecel-modal-close');

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    trigger.focus();
  }

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
}

function initTbModal() {
  const trigger = document.querySelector('.tc-tb-trigger');
  const modal   = document.getElementById('tbModal');
  if (!trigger || !modal) return;

  const backdrop = modal.querySelector('.ecel-modal-backdrop');
  const closeBtn = modal.querySelector('.ecel-modal-close');

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    trigger.focus();
  }

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
}

/* ---------------------------------------------------------------
   INIT ALL
--------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initCursorGlow();
  initCursorTrail();

  initNavbar();
  initScrollProgress();
  initReveal();
  initCounters();
  initStatBars();
  initScramble();
  initParallax();
  initSmoothScroll();
  initCardTilt();
  initHeroTagline();
  initManifesto();
  initMediaRipple();
  initHeroTyping();
  initContactForm();
  initHeroParticles();
  initMagneticButtons();
  initButtonSparks();
  initCardDetails();
  initEcelModal();
  initTbModal();
});
