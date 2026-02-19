'use strict';

// Saturday 00:01 → Friday 00:00 = 6d 23h 59m
const CYCLE_MS = (6 * 24 * 60 + 23 * 60 + 59) * 60 * 1000;

function getNextFriday(from) {
  const day = from.getDay();
  const daysUntil = day === 6 ? 6 : (5 - day + 7) % 7 || 7;
  const friday = new Date(from);
  friday.setDate(friday.getDate() + daysUntil);
  friday.setHours(0, 0, 0, 0);
  return friday;
}

function getLastSaturdayStart(now) {
  const day = now.getDay();
  const daysAgo = (day + 1) % 7;
  const sat = new Date(now);
  sat.setDate(sat.getDate() - daysAgo);
  sat.setHours(0, 1, 0, 0);
  return sat;
}

function getState() {
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours();
  const m = now.getMinutes();

  const isFriday = day === 5 || (day === 6 && h === 0 && m < 1);

  if (isFriday) {
    return { isFriday: true, target: now, progressPercent: 100 };
  }

  const target = getNextFriday(now);
  const weekStart = getLastSaturdayStart(now);
  const elapsed = now.getTime() - weekStart.getTime();
  const progressPercent = Math.min(100, Math.max(0, (elapsed / CYCLE_MS) * 100));

  return { isFriday: false, target, progressPercent };
}

function getTimeRemaining(target) {
  const total = Math.max(0, target.getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 60000) % 60);
  const hours = Math.floor((total / 3600000) % 24);
  const days = Math.floor(total / 86400000);
  return { days, hours, minutes, seconds, total };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateDigit(id, value) {
  const el = document.getElementById(id);
  if (el.textContent !== value) {
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
    el.textContent = value;
  }
}

function setFridayMode(active) {
  const body = document.body;
  const headline = document.getElementById('headline');
  const sub = document.getElementById('subheadline');
  const badge = document.getElementById('badge');

  if (active) {
    body.classList.add('friday-mode');
    headline.textContent = "IT'S FRIDAY!";
    sub.textContent = 'THE WEEKEND HAS ARRIVED · ENJOY IT';
    badge.textContent = '🎉 FRIDAY';
    badge.classList.add('friday-badge');
  } else {
    body.classList.remove('friday-mode');
    headline.textContent = 'COUNTDOWN TO FRIDAY';
    sub.textContent = 'THE WEEKEND IS LOADING...';
    badge.textContent = 'LIVE';
    badge.classList.remove('friday-badge');
  }
}

function tick() {
  const state = getState();

  setFridayMode(state.isFriday);

  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  fill.style.width = `${state.progressPercent.toFixed(2)}%`;

  if (state.isFriday) {
    updateDigit('days-val', '00');
    updateDigit('hours-val', '00');
    updateDigit('minutes-val', '00');
    updateDigit('seconds-val', '00');
    label.textContent = '100.0% · FRIDAY ACHIEVED';
    return;
  }

  const t = getTimeRemaining(state.target);
  updateDigit('days-val', pad(t.days));
  updateDigit('hours-val', pad(t.hours));
  updateDigit('minutes-val', pad(t.minutes));
  updateDigit('seconds-val', pad(t.seconds));
  label.textContent = `${state.progressPercent.toFixed(1)}% OF THE WEEK GONE · HANG TIGHT`;
}

// ── Particle system ──────────────────────────────────────────────

function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#00ffd1', '#7c3aed', '#ff006e', '#0099ff', '#6ee7b7'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.01 + Math.random() * 0.02,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}

// ── Boot ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  tick();
  setInterval(tick, 1000);
});
