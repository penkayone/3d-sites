// ============================================================
// main.js — инициализация: детект возможностей, прелоадер,
// запуск сцены и скролла, демо-форма, очистка ресурсов.
// ============================================================

import { createScene } from './scene.js';
import { initScroll, CAM } from './scroll.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);

// класс .js включает скрытые стартовые состояния анимаций —
// только если GSAP реально доступен (иначе контент остаётся видимым)
if (hasGsap) document.documentElement.classList.add('js');

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

// --- сцена ---
const small = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
const quality = small || (navigator.hardwareConcurrency || 8) <= 4 ? 'low' : 'high';

let sceneApi = null;
if (webglSupported()) {
  try {
    sceneApi = createScene({
      container: document.getElementById('webgl'),
      quality,
      reducedMotion,
    });
  } catch {
    sceneApi = null;
  }
}
if (!sceneApi) document.body.classList.add('no-webgl');

if (sceneApi) {
  Object.assign(sceneApi.camState, !hasGsap || reducedMotion ? CAM.hero : CAM.start);
  if (reducedMotion) sceneApi.renderFrame();
  else sceneApi.start();
}

// --- скролл и хореография ---
const scrollApi = hasGsap ? initScroll({ camState: sceneApi ? sceneApi.camState : null, reducedMotion }) : null;

// --- прелоадер ---
const preloader = document.getElementById('preloader');
const barEl = document.getElementById('preloader-bar');
const numEl = document.getElementById('preloader-num');
const progress = { p: 0 };
let fakeTween = null;

function setProgress(v) {
  if (barEl) barEl.style.width = v + '%';
  if (numEl) numEl.textContent = Math.round(v) + '%';
}

if (hasGsap) {
  fakeTween = window.gsap.to(progress, {
    p: 88,
    duration: 2.4,
    ease: 'power1.out',
    onUpdate: () => setProgress(progress.p),
  });
} else {
  setProgress(100);
}

const ready = Promise.all([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  sceneApi ? sceneApi.ready : Promise.resolve(),
  new Promise((res) => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  }),
]);

function begin() {
  if (preloader) preloader.classList.add('is-done');
  if (scrollApi) scrollApi.playIntro(() => scrollApi.startCameraTrack());
}

ready.then(() => {
  if (hasGsap) {
    if (fakeTween) fakeTween.kill();
    window.gsap.to(progress, {
      p: 100,
      duration: 0.5,
      ease: 'power1.inOut',
      onUpdate: () => setProgress(progress.p),
      onComplete: begin,
    });
  } else {
    begin();
  }
});

// --- демо-форма (данные никуда не отправляются) ---
const form = document.getElementById('request-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    form.classList.add('is-sent');
  });
}

// --- ресайз ---
window.addEventListener('resize', () => {
  if (sceneApi) sceneApi.onResize();
});

// --- очистка ресурсов ---
window.addEventListener(
  'pagehide',
  () => {
    if (scrollApi) scrollApi.destroy();
    if (sceneApi) sceneApi.dispose();
  },
  { once: true }
);
