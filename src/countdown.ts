interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface CountdownState {
  isFriday: boolean;
  target: Date;
  progressPercent: number;
}

// Saturday 00:01 → Friday 00:00 = 6d 23h 59m
const CYCLE_MS = (6 * 24 * 60 + 23 * 60 + 59) * 60 * 1000;

function getNextFriday(from: Date): Date {
  const day = from.getDay(); // 0=Sun … 5=Fri, 6=Sat
  // On Saturday (after 00:01) or any other non-Friday day
  const daysUntil = day === 6 ? 6 : (5 - day + 7) % 7 || 7;
  const friday = new Date(from);
  friday.setDate(friday.getDate() + daysUntil);
  friday.setHours(0, 0, 0, 0);
  return friday;
}

function getLastSaturdayStart(now: Date): Date {
  const day = now.getDay();
  const daysAgo = (day + 1) % 7; // days since last Saturday
  const sat = new Date(now);
  sat.setDate(sat.getDate() - daysAgo);
  sat.setHours(0, 1, 0, 0); // 00:01:00
  return sat;
}

function getState(): CountdownState {
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours();
  const m = now.getMinutes();

  // Friday all day, or Saturday before 00:01
  const isFriday =
    day === 5 || (day === 6 && h === 0 && m < 1);

  if (isFriday) {
    return { isFriday: true, target: now, progressPercent: 100 };
  }

  const target = getNextFriday(now);
  const weekStart = getLastSaturdayStart(now);
  const elapsed = now.getTime() - weekStart.getTime();
  const progressPercent = Math.min(100, Math.max(0, (elapsed / CYCLE_MS) * 100));

  return { isFriday: false, target, progressPercent };
}

function getTimeRemaining(target: Date): TimeRemaining {
  const total = Math.max(0, target.getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 60000) % 60);
  const hours = Math.floor((total / 3600000) % 24);
  const days = Math.floor(total / 86400000);
  return { days, hours, minutes, seconds, total };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function updateDigit(id: string, value: string): void {
  const el = document.getElementById(id) as HTMLElement;
  if (el.textContent !== value) {
    el.classList.remove('flip');
    void (el as HTMLElement & { offsetWidth: number }).offsetWidth;
    el.classList.add('flip');
    el.textContent = value;
  }
}

function setFridayMode(active: boolean): void {
  const body = document.body;
  const headline = document.getElementById('headline') as HTMLElement;
  const badge = document.getElementById('badge') as HTMLElement;

  if (active) {
    body.classList.add('friday-mode');
    headline.textContent = "IT'S FRIDAY!";
    badge.textContent = '🎉 FRIDAY';
    badge.classList.add('friday-badge');
  } else {
    body.classList.remove('friday-mode');
    headline.textContent = 'COUNTDOWN TO FRIDAY';
    badge.textContent = 'LIVE';
    badge.classList.remove('friday-badge');
  }
}

// ── Terminal cycling messages ─────────────────────────────────

const TERMINAL_MSGS = [
  'SCANNING CALENDAR MATRIX...',
  'FRIDAY.SYS: ARMED AND READY',
  'TEMPORAL SEQUENCE LOCKED',
  'WEEKEND PROTOCOL: STANDBY',
  'SYNCHRONIZING UTC CLOCK...',
  'COUNTDOWN SEQUENCE: ACTIVE',
  'NETWORK NODE: FULLSEND-01',
  'SIGNAL INTEGRITY: 100%',
];

const TERMINAL_MSGS_FRIDAY = [
  'FRIDAY PROTOCOL: ACTIVATED',
  'WEEKEND SUBROUTINE: RUNNING',
  'WORK PROCESSES TERMINATED',
  'REST.EXE INITIALIZED',
  'ENJOY_WEEKEND.SH EXECUTING',
  'STANDBY FOR MONDAY REBOOT',
];

let terminalIndex = 0;
let terminalTyping = false;

function typeMessage(text: string): void {
  if (terminalTyping) return;
  terminalTyping = true;
  const el = document.getElementById('terminal-text') as HTMLElement;
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      terminalTyping = false;
    }
  }, 38);
}

function initTerminal(isFriday: boolean): void {
  const msgs = isFriday ? TERMINAL_MSGS_FRIDAY : TERMINAL_MSGS;
  typeMessage(msgs[terminalIndex % msgs.length]);
  terminalIndex++;
  setInterval(() => {
    const m = isFriday ? TERMINAL_MSGS_FRIDAY : TERMINAL_MSGS;
    typeMessage(m[terminalIndex % m.length]);
    terminalIndex++;
  }, 4000);
}

// ── UTC system readout ────────────────────────────────────────

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function tickSysReadout(): void {
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  const yyyy = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const wk = String(getWeekNumber(now)).padStart(2, '0');

  const timeEl = document.getElementById('utc-time');
  const dateEl = document.getElementById('utc-date');
  const weekEl = document.getElementById('week-num');
  if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}Z`;
  if (dateEl) dateEl.textContent = `${yyyy}.${mo}.${dd}`;
  if (weekEl) weekEl.textContent = `${wk}/52`;
}

function tick(): void {
  const state = getState();

  setFridayMode(state.isFriday);

  const fill = document.getElementById('progress-fill') as HTMLElement;
  const label = document.getElementById('progress-label') as HTMLElement;
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

function initParticles(): void {
  const canvas = document.getElementById('particles') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const COLORS = ['#00ffd1', '#7c3aed', '#ff006e', '#0099ff', '#00ffd188'];

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles: Particle[] = Array.from({ length: 90 }, () => ({
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

  function draw(): void {
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
  const isFriday = getState().isFriday;
  initParticles();
  initTerminal(isFriday);
  tick();
  tickSysReadout();
  setInterval(tick, 1000);
  setInterval(tickSysReadout, 1000);
});
