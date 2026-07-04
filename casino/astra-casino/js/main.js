/* =====================================================================
   main.js — entry point
   Wires UI (header, menu, sound, filters, modal) and orchestrates the
   progressive-enhancement modules (media / scene / scroll).
   ===================================================================== */

import { initMedia } from './media.js';
import { initScroll } from './scroll.js';

/* Single source of truth — keeps cards, filters, posters and video paths
   from drifting apart. Video paths are extension-less; both webm+mp4 exist. */
export const games = [
  { id: 'nova-reels',     title: 'Nova Reels',     category: 'slots',   poster: 'assets/img/nova-reels.webp',     video: 'assets/video/nova-reels' },
  { id: 'prism-roulette', title: 'Prism Roulette', category: 'live',    poster: 'assets/img/prism-roulette.webp', video: 'assets/video/prism-roulette' },
  { id: 'orbit-run',      title: 'Orbit Run',      category: 'instant', poster: 'assets/img/orbit-run.webp',      video: 'assets/video/orbit-run' },
  { id: 'pulse-drop',     title: 'Pulse Drop',     category: 'instant', poster: 'assets/img/pulse-drop.webp',     video: 'assets/video/pulse-drop' },
  { id: 'void-grid',      title: 'Void Grid',      category: 'instant', poster: 'assets/img/void-grid.webp',      video: 'assets/video/void-grid' },
  { id: 'aurora-21',      title: 'Aurora 21',      category: 'table',   poster: 'assets/img/aurora-21.webp',      video: 'assets/video/aurora-21' },
];
const CAT_LABEL = { slots: 'Slots', live: 'Live', instant: 'Instant', table: 'Table' };
const byId = Object.fromEntries(games.map((g) => [g.id, g]));

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initSound();
  initFilters();
  initModal();
  initMedia();
  initMagnetic();
  initTilt();
  bootEnhancements();
});

/* ---------- Header: glass after 80px ---------- */
function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 80) header.setAttribute('data-scrolled', '');
    else header.removeAttribute('data-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  const close = () => { btn.setAttribute('aria-expanded', 'false'); nav.hidden = true; };
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    if (open) close();
    else { btn.setAttribute('aria-expanded', 'true'); nav.hidden = false; }
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) close(); });
}

/* ---------- Sound button — real ambient track, gentle fade, no autoplay ---------- */
function initSound() {
  const btn = document.getElementById('soundBtn');
  const audio = document.getElementById('ambient');
  if (!btn || !audio) return;
  const label = btn.querySelector('.sound-label');
  const MAX = 0.7;
  let raf = 0;
  audio.volume = 0;

  function fadeTo(target, done) {
    cancelAnimationFrame(raf);
    const step = () => {
      const d = target - audio.volume;
      if (Math.abs(d) < 0.02) { audio.volume = target; if (done) done(); return; }
      audio.volume = Math.max(0, Math.min(1, audio.volume + d * 0.08));
      raf = requestAnimationFrame(step);
    };
    step();
  }
  function setState(on) {
    btn.setAttribute('aria-pressed', String(on));
    if (label) label.textContent = on ? 'Вкл' : 'Звук';
    btn.setAttribute('aria-label', on ? 'Выключить фоновый звук' : 'Включить фоновый звук');
  }

  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') === 'true';
    if (on) {
      fadeTo(0, () => audio.pause());
      setState(false);
    } else {
      audio.play().then(() => fadeTo(MAX)).catch(() => {}); // click is the user gesture
      setState(true);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && !audio.paused) { audio.dataset.wasOn = '1'; audio.pause(); }
    else if (document.visibilityState === 'visible' && audio.dataset.wasOn === '1' && btn.getAttribute('aria-pressed') === 'true') { audio.play().catch(() => {}); audio.dataset.wasOn = ''; }
  });
}

/* ---------- Magnetic buttons (fine pointer only) ---------- */
function initMagnetic() {
  if (prefersReduced || !window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.btn, .sound-btn').forEach((btn) => {
    const s = 0.28;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * s).toFixed(1) + 'px');
      btn.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * s).toFixed(1) + 'px');
    });
    btn.addEventListener('pointerleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
  });
}

/* ---------- Category filter ---------- */
function initFilters() {
  const chips = Array.from(document.querySelectorAll('.chip'));
  const blocks = Array.from(document.querySelectorAll('[data-category]'));
  const pairs = Array.from(document.querySelectorAll('.game-pair'));
  const empty = document.getElementById('emptyNote');
  if (!chips.length) return;

  function apply(filter) {
    let visible = 0;
    blocks.forEach((b) => {
      const show = filter === 'all' || b.dataset.category === filter;
      b.hidden = !show;
      if (show) visible++;
    });
    // Hide a pair wrapper only when both of its cards are hidden.
    pairs.forEach((p) => {
      const anyVisible = Array.from(p.querySelectorAll('[data-category]')).some((c) => !c.hidden);
      p.hidden = !anyVisible;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      apply(chip.dataset.filter);
    });
  });
}

/* ---------- Modal (native <dialog>, one video at a time) ---------- */
function initModal() {
  const modal = document.getElementById('gameModal');
  if (!modal || typeof modal.showModal !== 'function') return;
  const video = document.getElementById('modalVideo');
  const titleEl = document.getElementById('modalTitle');
  const catEl = document.getElementById('modalCat');
  const closeBtn = document.getElementById('modalClose');
  let opener = null;

  function pausePageVideos() {
    document.querySelectorAll('video').forEach((v) => {
      if (v === video) return; // keep the modal video
      v.pause();
      const fig = v.closest('[data-media]');
      if (fig) fig.classList.remove('is-playing');
    });
  }
  // Enforce the single-video rule whenever the modal actually starts playing.
  video.addEventListener('play', pausePageVideos);

  function open(id, trigger) {
    const game = byId[id];
    if (!game) return;
    opener = trigger || null;
    window.dispatchEvent(new Event('astra:media-suspend'));
    pausePageVideos();
    titleEl.textContent = game.title;
    catEl.textContent = CAT_LABEL[game.category] || 'Demo';
    video.innerHTML =
      `<source src="${game.video}.webm" type="video/webm">` +
      `<source src="${game.video}.mp4" type="video/mp4">`;
    video.setAttribute('poster', game.poster);
    video.setAttribute('aria-label', `Демо-анимация ${game.title}`);
    video.load();
    modal.showModal();
    if (!prefersReduced) {
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }
  }

  function close() {
    video.pause();
    video.removeAttribute('src');
    video.innerHTML = '';
    video.load();
    window.dispatchEvent(new Event('astra:media-resume'));
    if (opener && typeof opener.focus === 'function') opener.focus();
  }

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', () => open(btn.dataset.game, btn));
  });
  closeBtn.addEventListener('click', () => modal.close());
  modal.addEventListener('close', close);
  // Click on backdrop closes.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

/* ---------- Tilt (fine pointer only) — the figure rotates, inner layers
   keep their scroll parallax, so the two never fight over one transform. --- */
function initTilt() {
  if (prefersReduced) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.game-media').forEach((media) => {
    media.style.transition = 'transform .35s cubic-bezier(0.22,1,0.36,1)';
    media.addEventListener('pointermove', (e) => {
      const r = media.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      media.style.transform = `perspective(1000px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 3).toFixed(2)}deg)`;
    });
    media.addEventListener('pointerleave', () => { media.style.transform = ''; });
  });
}

/* ---------- Boot Three.js + scroll, with a low-FPS safety net ---------- */
function bootEnhancements() {
  let cleanupScene = () => {};
  let cleanupScroll = () => {};

  // Scroll first (cheap, no WebGL).
  try { cleanupScroll = initScroll() || (() => {}); } catch (e) {}

  const saveData = navigator.connection && navigator.connection.saveData === true;
  const lowMem = navigator.deviceMemory && navigator.deviceMemory <= 2;
  if (prefersReduced || saveData || lowMem) return; // skip heavy canvas

  const canvas = document.getElementById('astra-canvas');
  if (!canvas) return;

  import('./scene.js')
    .then(({ initScene }) => {
      cleanupScene = initScene(canvas) || (() => {});
      watchFps(canvas, cleanupScene);
    })
    .catch(() => {}); // WebGL/module load failure → silent, site still works

  window.addEventListener('pagehide', () => { cleanupScene(); cleanupScroll(); });
}

/* Auto-drop the canvas if the device can't sustain a smooth frame rate. */
function watchFps(canvas, cleanupScene) {
  let frames = 0;
  let last = performance.now();
  let strikes = 0;
  let raf = 0;
  function sample(now) {
    frames++;
    if (now - last >= 1000) {
      const fps = (frames * 1000) / (now - last);
      frames = 0; last = now;
      if (fps < 32) strikes++; else strikes = 0;
      if (strikes >= 3) {              // ~3s sustained low fps
        cleanupScene();
        canvas.style.display = 'none';
        cancelAnimationFrame(raf);
        return;
      }
    }
    raf = requestAnimationFrame(sample);
  }
  raf = requestAnimationFrame(sample);
}
