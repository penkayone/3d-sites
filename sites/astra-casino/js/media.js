/* =====================================================================
   media.js — video lifecycle
   HERO: a seamless, never-ending loop. Two stacked copies crossfade at
   the loop seam (0.7s), so the clip never visibly "ends" or cuts.
   GAME clips: play on HOVER (fine pointer) or when >=55% visible (touch).
   Only ONE video plays at a time across the whole page; the hero pauses
   while a game clip or the modal is active, and resumes when they stop.
   Respect reduced-motion / Save-Data / hidden tab.
   ===================================================================== */

export function initMedia() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData === true;
  const staticOnly = prefersReduced || saveData;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const cleanups = [];
  cleanups.push(setupHero(staticOnly));
  cleanups.push(setupGames(staticOnly, finePointer));
  return () => cleanups.forEach((fn) => fn && fn());
}

/* ---------------- HERO: seamless crossfade loop ---------------- */
function setupHero(staticOnly) {
  const heroMedia = document.querySelector('[data-hero]');
  const vA = heroMedia && heroMedia.querySelector('video');
  if (!heroMedia || !vA || staticOnly) return () => {}; // poster only

  const vB = vA.cloneNode(true);      // second layer (same sources)
  vB.setAttribute('aria-hidden', 'true');
  vA.removeAttribute('loop'); vB.removeAttribute('loop');
  vA.muted = vB.muted = true;
  vA.style.opacity = '1'; vB.style.opacity = '0';
  heroMedia.appendChild(vB);
  heroMedia.classList.add('is-playing');

  let front = vA, back = vB;
  let crossing = false, visible = false, gameActive = false, suspended = false, swapTimer = 0;
  const FADE = 0.7;

  const canPlay = () => visible && !gameActive && !suspended && document.visibilityState !== 'hidden';

  function update() {
    if (canPlay()) { if (front.paused) front.play().catch(() => {}); }
    else { front.pause(); back.pause(); }
  }

  let raf = requestAnimationFrame(function loop() {
    if (canPlay() && !crossing && front.duration && front.currentTime >= front.duration - FADE) {
      crossing = true;
      back.currentTime = 0;
      back.play().catch(() => {});
      front.style.opacity = '0';
      back.style.opacity = '1';                       // CSS transition does the crossfade
      const old = front;
      swapTimer = setTimeout(() => {
        old.pause();
        const t = front; front = back; back = t;      // swap roles
        crossing = false;
      }, FADE * 1000);
    }
    raf = requestAnimationFrame(loop);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { visible = e.isIntersecting && e.intersectionRatio >= 0.5; });
    update();
  }, { threshold: [0, 0.5, 0.9] });
  io.observe(heroMedia);

  const onVis = () => { if (document.visibilityState === 'hidden') { front.pause(); back.pause(); } else update(); };
  const onSuspend = () => { suspended = true; update(); };
  const onResume = () => { suspended = false; update(); };
  const onGameOn = () => { gameActive = true; update(); };
  const onGameOff = () => { gameActive = false; update(); };
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('astra:media-suspend', onSuspend);
  window.addEventListener('astra:media-resume', onResume);
  window.addEventListener('astra:hero-suspend', onGameOn);
  window.addEventListener('astra:hero-resume', onGameOff);

  return () => {
    cancelAnimationFrame(raf); clearTimeout(swapTimer); io.disconnect();
    vA.pause(); vB.pause();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('astra:media-suspend', onSuspend);
    window.removeEventListener('astra:media-resume', onResume);
    window.removeEventListener('astra:hero-suspend', onGameOn);
    window.removeEventListener('astra:hero-resume', onGameOff);
  };
}

/* ---------------- GAME clips ---------------- */
function setupGames(staticOnly, finePointer) {
  const figures = Array.from(document.querySelectorAll('[data-media]'))
    .filter((f) => f.querySelector('video') && !f.hasAttribute('data-hero'));
  const items = figures.map((figure) => ({ figure, video: figure.querySelector('video'), ratio: 0, minRatio: 0.55 }));

  let active = null, suspended = false;

  function stop(item) { if (!item) return; item.video.pause(); item.figure.classList.remove('is-playing'); }
  function clearActive() { if (active) { stop(active); active = null; window.dispatchEvent(new Event('astra:hero-resume')); } }
  function start(item) {
    if (!item || item === active || suspended) return;
    stop(active); active = item;
    window.dispatchEvent(new Event('astra:hero-suspend'));   // hero yields the slot
    const p = item.video.play();
    if (p && p.catch) p.catch(() => { if (active === item) active = null; item.figure.classList.remove('is-playing'); });
  }

  items.forEach((item) => item.video.addEventListener('playing', () => item.figure.classList.add('is-playing')));

  const teardown = [];

  if (!staticOnly && finePointer) {
    items.forEach((item) => {
      const onEnter = () => start(item);
      const onLeave = () => { if (active === item) clearActive(); };
      item.figure.addEventListener('pointerenter', onEnter);
      item.figure.addEventListener('pointerleave', onLeave);
      const btn = item.figure.closest('.game-block') && item.figure.closest('.game-block').querySelector('[data-open-modal]');
      if (btn) { btn.addEventListener('focus', onEnter); btn.addEventListener('blur', onLeave); }
      teardown.push(() => { item.figure.removeEventListener('pointerenter', onEnter); item.figure.removeEventListener('pointerleave', onLeave); });
    });
  } else if (!staticOnly && 'IntersectionObserver' in window) {
    function reconcile() {
      if (suspended || document.visibilityState === 'hidden') { clearActive(); return; }
      let best = null;
      for (const item of items) if (item.ratio >= item.minRatio && (!best || item.ratio > best.ratio)) best = item;
      if (!best) clearActive(); else start(best);
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) { const it = items.find((i) => i.figure === e.target); if (it) it.ratio = e.isIntersecting ? e.intersectionRatio : 0; }
      reconcile();
    }, { threshold: [0, 0.25, 0.55, 0.75, 1] });
    items.forEach((i) => io.observe(i.figure));
    teardown.push(() => io.disconnect());
  }

  const onVis = () => { if (document.visibilityState === 'hidden') { items.forEach(stop); active = null; } };
  document.addEventListener('visibilitychange', onVis);
  const onSuspend = () => { suspended = true; items.forEach(stop); active = null; };
  const onResume = () => { suspended = false; };
  window.addEventListener('astra:media-suspend', onSuspend);
  window.addEventListener('astra:media-resume', onResume);

  return () => {
    teardown.forEach((fn) => fn());
    items.forEach(stop);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('astra:media-suspend', onSuspend);
    window.removeEventListener('astra:media-resume', onResume);
  };
}
