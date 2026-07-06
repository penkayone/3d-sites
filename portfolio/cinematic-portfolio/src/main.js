import "./style.css";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createScene } from "./scene.js";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const isMobile = coarse || window.innerWidth < 760;

/* ============================================================
   1. Smooth scroll (Lenis) ↔ ScrollTrigger
   ============================================================ */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// anchor links → smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: "smooth" });
  });
});

/* ============================================================
   2. Custom cursor (desktop only)
   ============================================================ */
if (!coarse) {
  const cur = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  let mx = innerWidth / 2,
    my = innerHeight / 2,
    cx = mx,
    cy = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function ring() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(ring);
  })();

  document.querySelectorAll("[data-cursor], a, .btn").forEach((el) => {
    el.addEventListener("mouseenter", () => cur.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cur.classList.remove("is-hover"));
  });
}

/* ============================================================
   3. 3D scene (desktop only; mobile uses the CSS gradient)
   ============================================================ */
const canvas = document.getElementById("scene");
const scene = createScene(canvas, { reducedMotion: reduced, mobile: isMobile });

ScrollTrigger.create({
  trigger: "#hero",
  start: "top top",
  end: "bottom top",
  scrub: true,
  onUpdate: (self) => scene.setProgress(self.progress),
  onToggle: (self) => scene.setActive && scene.setActive(self.isActive),
});

/* ============================================================
   4. Manifesto — word-by-word reveal on scrub
   (manual split; no premium plugin needed)
   ============================================================ */
(function splitManifesto() {
  const el = document.querySelector("[data-split]");
  if (!el) return;
  const raw = el.textContent.trim().replace(/\s+/g, " ");
  el.textContent = "";
  const frag = document.createDocumentFragment();
  raw.split(" ").forEach((w, i, arr) => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    // gently accent the closing phrase "while you sleep."
    if (i >= arr.length - 3) span.classList.add("accent");
    frag.appendChild(span);
    if (i < arr.length - 1) frag.appendChild(document.createTextNode(" "));
  });
  el.appendChild(frag);

  const words = el.querySelectorAll(".word");
  if (reduced) {
    gsap.set(words, { opacity: 1 });
    return;
  }
  gsap.set(words, { opacity: 0.14 });
  gsap.to(words, {
    opacity: 1,
    stagger: 0.05,
    ease: "none",
    scrollTrigger: {
      trigger: el,
      start: "top 78%",
      end: "bottom 60%",
      scrub: true,
    },
  });
})();

/* ============================================================
   5. Generic reveals
   ============================================================ */
gsap.utils.toArray(".reveal").forEach((el) => {
  if (reduced) {
    gsap.set(el, { opacity: 1, y: 0 });
    return;
  }
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: "top 88%" },
    y: 54,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  });
});

/* ============================================================
   6. Marquee drift + scroll-velocity skew
   ============================================================ */
(function marquee() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;
  if (reduced) return;
  let x = 0;
  const half = () => track.offsetWidth / 2;
  gsap.ticker.add(() => {
    x -= 0.6;
    if (x < -half()) x += half();
    track.style.transform = `translateX(${x}px)`;
  });
  ScrollTrigger.create({
    trigger: ".marquee",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      gsap.to(track, {
        skewX: gsap.utils.clamp(-12, 12, self.getVelocity() / -320),
        duration: 0.4,
        overwrite: true,
      });
    },
  });
})();

/* ============================================================
   7. Count-up stats
   ============================================================ */
gsap.utils.toArray("[data-count]").forEach((el) => {
  const end = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  if (reduced) {
    el.textContent = end + suffix;
    return;
  }
  const o = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () =>
      gsap.to(o, {
        v: end,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(o.v) + suffix;
        },
      }),
  });
});

/* ============================================================
   8. Card 3D tilt (desktop, non-reduced)
   ============================================================ */
if (!coarse && !reduced) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateY: x * 7,
        rotateX: -y * 7,
        transformPerspective: 900,
        duration: 0.5,
        ease: "power2.out",
      });
    });
    card.addEventListener("mouseleave", () =>
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" })
    );
  });
}

/* ============================================================
   9. Loader → hero intro
   ============================================================ */
function heroIntro() {
  document.body.classList.add("ready");
  if (reduced) {
    gsap.set("[data-hero], [data-hero-fade]", { opacity: 1, y: 0 });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.from("[data-hero]", { yPercent: 115, duration: 1.1, stagger: 0.12 })
    .from(
      "[data-hero-fade]",
      { opacity: 0, y: 24, duration: 0.9, stagger: 0.12 },
      "-=0.6"
    )
    .from(".topbar", { opacity: 0, y: -20, duration: 0.8 }, "-=0.9");
  ScrollTrigger.refresh();
}

function runLoader() {
  const num = document.getElementById("loaderNum");
  const bar = document.getElementById("loaderBar");
  const loader = document.getElementById("loader");

  if (reduced) {
    loader.style.display = "none";
    heroIntro();
    return;
  }

  const counter = { v: 0 };
  gsap.to(counter, {
    v: 100,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      num.textContent = Math.round(counter.v);
      bar.style.width = counter.v + "%";
    },
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut",
        onComplete: () => (loader.style.display = "none"),
      });
      heroIntro();
    },
  });
}

window.addEventListener("load", runLoader);
// Fallback: if 'load' was already missed, kick off shortly.
if (document.readyState === "complete") runLoader();
