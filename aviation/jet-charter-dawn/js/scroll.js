// ============================================================
// scroll.js — Lenis + GSAP ScrollTrigger:
// пролёт камеры по ключевым точкам, появления со stagger,
// счётчики цифр, HUD «эшелона», плавные якоря.
// ============================================================

// Ключевые точки камеры (раскадровка «снижения с эшелона»)
export const CAM = {
  start:   { px: 0,    py: 0.15, pz: 47,   tx: 0,  ty: 1.5, tz: -20,  roll: 0,     fov: 60, focus: 12 },
  hero:    { px: 0,    py: 1.15, pz: 26,   tx: 0,  ty: 1.7, tz: -20,  roll: 0,     fov: 55, focus: 30 },
  dest:    { px: -7,   py: 6.5,  pz: 16,   tx: 0,  ty: 1.2, tz: -14,  roll: -0.05, fov: 52, focus: 26 },
  fleet:   { px: -7.5, py: 2.3,  pz: 1.5,  tx: 0,  ty: 1.7, tz: -6.5, roll: 0.03,  fov: 48, focus: 11 },
  service: { px: 4.4,  py: 1.9,  pz: -0.5, tx: -3, ty: 2.1, tz: -10,  roll: -0.02, fov: 44, focus: 8 },
  safety:  { px: 0,    py: 11.5, pz: 15,   tx: 0,  ty: 0.6, tz: -22,  roll: 0,     fov: 55, focus: 42 },
  request: { px: 0,    py: 2.3,  pz: 5,    tx: 12, ty: 6,   tz: -65,  roll: 0,     fov: 58, focus: 55 },
};

export function initScroll({ camState = null, reducedMotion = false }) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  let tickerFn = null;
  let camTl = null;

  // --- плавный скролл ---
  if (!reducedMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on('scroll', ScrollTrigger.update);
    tickerFn = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);
  }

  // --- плавные якоря ---
  const onAnchorClick = (e) => {
    const a = e.currentTarget;
    const id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.6 });
    else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach((a) => a.addEventListener('click', onAnchorClick));

  // --- фон навигации после отрыва от героя ---
  ScrollTrigger.create({
    start: 80,
    end: 'max',
    toggleClass: { className: 'nav--scrolled', targets: '#nav' },
  });

  // --- HUD: эшелон растёт по мере прокрутки ---
  const flEl = document.getElementById('hud-fl');
  if (flEl) {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        flEl.textContent = 'FL ' + String(35 + Math.round(self.progress * 375)).padStart(3, '0');
      },
    });
  }

  // --- появления и счётчики ---
  if (!reducedMotion) {
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const targets = el.hasAttribute('data-reveal-group') ? Array.from(el.children) : [el];
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    const fmt = new Intl.NumberFormat('ru-RU');
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const counter = { v: 0 };
      el.textContent = '0' + suffix;
      gsap.to(counter, {
        v: end,
        duration: 1.7,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = fmt.format(Math.round(counter.v)) + suffix; },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  // --- вступительный пролёт: сквозь облака к джету на рассвете ---
  function playIntro(onDone) {
    if (reducedMotion) {
      if (camState) Object.assign(camState, CAM.hero);
      if (onDone) onDone();
      return;
    }
    const tl = gsap.timeline({ onComplete: onDone });
    const hasCam = !!camState;
    if (hasCam) {
      tl.to(camState, { ...CAM.hero, duration: 5.4, ease: 'power2.inOut' }, 0);
    }
    // y: 0 сбрасывает пиксельный сдвиг, который GSAP парсит из CSS translateY(115%)
    gsap.set('.hero .w__in', { yPercent: 115, y: 0 });
    tl.to('.hero .w__in', {
      yPercent: 0,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.14,
    }, hasCam ? 2.6 : 0.1);
    tl.to('[data-intro]', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power2.out',
      stagger: 0.1,
    }, hasCam ? 3.4 : 0.5);
  }

  // --- мастер-таймлайн камеры, скраб по всей странице ---
  function startCameraTrack() {
    if (!camState || reducedMotion) return;
    camTl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '#page',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });
    camTl
      .to(camState, { ...CAM.dest, duration: 1.0 })       // подъём над морем облаков
      .to({}, { duration: 0.2 })                          // пауза
      .to(camState, { ...CAM.fleet, duration: 0.95, ease: 'power3.inOut' }) // снижение к борту
      .to({}, { duration: 0.18 })
      .to(camState, { ...CAM.service, duration: 0.9 })    // вплотную к крылу, контровое золото
      .to({}, { duration: 0.22 })
      .to(camState, { ...CAM.safety, duration: 1.0 })     // высокий спокойный план
      .to({}, { duration: 0.16 })
      .to(camState, { ...CAM.request, duration: 1.2 });   // финал — в сторону солнца
  }

  function destroy() {
    if (camTl) camTl.kill();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    anchors.forEach((a) => a.removeEventListener('click', onAnchorClick));
    if (tickerFn) gsap.ticker.remove(tickerFn);
    if (lenis) lenis.destroy();
  }

  return { playIntro, startCameraTrack, destroy };
}
