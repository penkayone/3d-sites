/* =====================================================================
   scroll.js — smooth scroll + cinematic motion (progressive enhancement)
   - Lenis driven by gsap.ticker (one rAF loop → no jank).
   - HERO video is scroll-scrubbed: scrolling the hero scrubs its frames
     (eased seek), instead of just looping. Touch devices loop-on-view.
   - Reveal timeline: hero intro, clip-path media reveals, staggered copy.
   All gated on reduced-motion / missing libs → content stays usable.
   ===================================================================== */

export function initScroll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const Lenis = window.Lenis;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const saveData = navigator.connection && navigator.connection.saveData === true;

  if (prefersReduced || !gsap || !ScrollTrigger) return () => {};
  gsap.registerPlugin(ScrollTrigger);

  const cleanups = [];

  /* ---- Lenis smooth scroll, ticked by GSAP (single rAF) ----
     Calm easeOut curve, driven by one loop. CSS scroll-behavior is OFF so
     nothing fights Lenis for the scroll position. ---- */
  let lenis = null;
  if (Lenis) {
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),   // easeOutCubic — smooth & unobtrusive
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Smooth in-page anchor navigation (replaces the removed CSS smooth-scroll).
    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -72, duration: 1.1 });
    };
    document.addEventListener('click', onAnchor);

    cleanups.push(() => { document.removeEventListener('click', onAnchor); gsap.ticker.remove(tick); lenis.destroy(); });
  }

  /* ---- HERO intro timeline (on load). The looping hero clip itself is
         handled in media.js (seamless crossfade loop). ---- */
  const heroMedia = document.querySelector('[data-hero]');
  const heroCopy = document.querySelector('.hero-copy');
  if (heroCopy) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(heroMedia, { autoAlpha: 0, scale: 1.08, duration: 1.1, ease: 'power2.out' }, 0)
      .from(heroCopy.children, { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.09 }, 0.25);
    cleanups.push(() => tl.kill());
  }

  /* ---- Section heads: rise + fade ---- */
  gsap.utils.toArray('.section-head').forEach((el) => {
    const t = gsap.from(el.children, {
      y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
    cleanups.push(() => t.scrollTrigger && t.scrollTrigger.kill());
  });

  /* ---- Game blocks: media clip-reveal + copy stagger ---- */
  gsap.utils.toArray('.game-block').forEach((block) => {
    const media = block.querySelector('.game-media');
    const text = block.querySelector('.game-text, .featured-head');
    const tl = gsap.timeline({ scrollTrigger: { trigger: block, start: 'top 82%', once: true } });
    if (media) {
      // clip-path + fade only — no transform here, so the hover-tilt's CSS
      // transition on .game-media never fights a GSAP transform tween.
      tl.fromTo(media,
        { clipPath: 'inset(12% 10% 12% 10% round 18px)', autoAlpha: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round 18px)', autoAlpha: 1, duration: 1.0, ease: 'power3.out' }, 0);
    }
    if (text) tl.from(text.children, { y: 22, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.15);
    cleanups.push(() => tl.scrollTrigger && tl.scrollTrigger.kill());
  });

  /* ---- Principles + facts: pop in ---- */
  gsap.utils.toArray('.principle, .about-facts li').forEach((el, i) => {
    const t = gsap.from(el, {
      y: 24, autoAlpha: 0, scale: 0.98, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
    cleanups.push(() => t.scrollTrigger && t.scrollTrigger.kill());
  });

  /* ---- Media parallax inside the frame (GPU: transforms only) ---- */
  gsap.utils.toArray('.game-media').forEach((media) => {
    const layers = media.querySelectorAll('video, .game-poster');
    if (!layers.length) return;
    const t = gsap.fromTo(layers,
      { yPercent: -6, scale: 1.12 },
      { yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    cleanups.push(() => t.scrollTrigger && t.scrollTrigger.kill());
  });

  ScrollTrigger.refresh();

  return function cleanup() {
    cleanups.forEach((fn) => fn());
    ScrollTrigger.getAll().forEach((s) => s.kill());
  };
}
