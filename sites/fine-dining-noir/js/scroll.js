// ============================================================
// scroll.js — Lenis + GSAP ScrollTrigger:
// вступительный rack-focus, пролёт камеры по натюрморту,
// появления со stagger, счётчики цифр, плавные якоря.
// ============================================================

// Ключевые точки камеры (раскадровка вечера)
export const CAM = {
  start:      { px: 0.0,  py: 1.95, pz: 6.3, tx: 0,    ty: 0.24, tz: -0.1, roll: 0,     fov: 45, focus: 7.6 },
  hero:       { px: 0.0,  py: 1.16, pz: 4.35, tx: 0.16, ty: 0.28, tz: -0.05, roll: 0,   fov: 42, focus: 4.35 },
  philosophy: { px: -1.6, py: 0.95, pz: 3.5, tx: 0.15, ty: 0.42, tz: 0.05, roll: -0.02, fov: 42, focus: 3.7 },
  menu:       { px: 0.1,  py: 2.0,  pz: 2.5, tx: 0,    ty: 0.12, tz: 0,    roll: 0.02,  fov: 44, focus: 2.9 },
  chef:       { px: 0.95, py: 0.7,  pz: 2.7, tx: 0.78, ty: 0.5,  tz: -0.3, roll: 0,     fov: 44, focus: 2.7 },
  atmosphere: { px: 0.0,  py: 1.2,  pz: 6.8, tx: 0,    ty: 0.6,  tz: -1.5, roll: 0,     fov: 58, focus: 8.5 },
  reserve:    { px: 1.15, py: 0.7,  pz: 2.9, tx: 1.6,  ty: 0.45, tz: 0.3,  roll: 0,     fov: 46, focus: 2.9 },
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

  // --- появления и счётчики ---
  if (!reducedMotion) {
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const targets = el.hasAttribute('data-reveal-group') ? Array.from(el.children) : [el];
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const counter = { v: 0 };
      el.textContent = '0' + suffix;
      gsap.to(counter, {
        v: end,
        duration: 1.7,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(counter.v) + suffix; },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  // --- вступление: наезд из расфокуса, наводка на каплю и блюдо ---
  function playIntro(onDone) {
    if (reducedMotion) {
      if (camState) Object.assign(camState, CAM.hero);
      if (onDone) onDone();
      return;
    }
    const tl = gsap.timeline({ onComplete: onDone });
    const hasCam = !!camState;
    if (hasCam) {
      tl.to(camState, { ...CAM.hero, duration: 5.2, ease: 'power2.inOut' }, 0);
    }
    // y: 0 сбрасывает пиксельный сдвиг, который GSAP парсит из CSS translateY(115%)
    gsap.set('.hero .w__in', { yPercent: 115, y: 0 });
    tl.to('.hero .w__in', {
      yPercent: 0,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.14,
    }, hasCam ? 2.4 : 0.1);
    tl.to('[data-intro]', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power2.out',
      stagger: 0.1,
    }, hasCam ? 3.2 : 0.5);
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
      .to(camState, { ...CAM.philosophy, duration: 1.0 })                          // дрейф влево, открывается свеча
      .to({}, { duration: 0.2 })
      .to(camState, { ...CAM.menu, duration: 0.95, ease: 'power3.inOut' })         // подъём над тарелкой
      .to({}, { duration: 0.18 })
      .to(camState, { ...CAM.chef, duration: 0.9 })                                // к бокалу вина
      .to({}, { duration: 0.2 })
      .to(camState, { ...CAM.atmosphere, duration: 1.1, ease: 'power2.inOut' })    // отъезд, боке зала
      .to({}, { duration: 0.16 })
      .to(camState, { ...CAM.reserve, duration: 1.1 });                            // наезд к свече, финал
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
