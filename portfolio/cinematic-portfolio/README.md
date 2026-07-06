# Anton Goloskokov — 3D Portfolio

A single-page, scroll-driven 3D portfolio for a Technical SEO & AI Automation
Engineer. Built with Vite, Three.js, GSAP + ScrollTrigger, and Lenis.

The 3D centrepiece is a **sparse node network** (an homage to n8n) that lives in
the **right negative space** only. Nodes are dark with a thin fresnel rim, links
are faint, and soft data pulses travel the edges now and then. There is **no
bloom and no post-processing**, so nothing can wash out the headline on the
left. A radial + linear mask (`.hero-grad`) drives the scene to pure background
over the text column, and the text always sits on a higher layer.

---

## Run it

```bash
npm install
npm run dev      # local dev server (prints a localhost URL)
npm run build    # production build → ./dist
npm run preview  # serve the production build locally
```

Requires Node 18+ (developed on Node 22).

---

## Project structure

```
portfolio/cinematic-portfolio/
├── index.html        # all markup + copy (the 7 "acts")
├── src/
│   ├── main.js       # loader, cursor, Lenis, GSAP timelines, scroll triggers
│   ├── scene.js      # the Three.js node network (Variant A)
│   └── style.css     # design tokens + every section style
├── vite.config.js
└── package.json
```

---

## Where to change things

### Text / content
All copy lives in **`index.html`**, grouped by act with comments
(`ACT 1 — HERO`, `ACT 2 — MARQUEE`, … `ACT 7 — CONTACT`). Edit it directly.

- **Name / role / intro** → `<section id="hero">`
- **Marquee words** → `<div class="marquee">` (duplicated twice for a seamless
  loop — keep both copies in sync)
- **Manifesto** → `<h2 class="manifesto-text" data-split>` (the last three words
  get the gradient accent automatically; change the count in
  `splitManifesto()` in `main.js`)
- **Stats** → `data-count="…"` and `data-suffix="…"` on each `.num`
  (`data-static` is used for `24/7`, which is not a number)
- **Focus** → `<section id="focus">`
- **Process** (the n8n-style pipeline) → `<section id="process">`; each step is a
  `<li class="pnode">`. Reorder/rename steps freely; the connecting "wire" and
  its travelling pulse are pure CSS.
- **Selected work cards** → `<section id="work">`. Each card has:
  - a result metric — `<div class="card-metric"><i></i><b>1000+</b><span>…</span></div>`
    (the `<i>` is the accent dot; pull the number from real copy, don't invent)
  - a generated abstract visual — `<div class="card-viz">` with inline SVG
    (`viz-cyan` / `viz-violet`). These are decorative, not real screenshots —
    swap the SVG paths to restyle. Classes: `.ln` (faint line), `.flow`
    (animated dashed line), `.ring`, `.area`, `.nd` / `.nd.hot` (nodes).
  - chips — the `<ul class="chips">` list
- **Stack** → `<section id="stack">`; each `<div class="stack-row">` is a
  category with a chip list
- **Contact links / footer** → `<section id="contact">` and `<footer>`

### Colors
All design tokens are CSS variables at the top of **`src/style.css`** (`:root`):

```css
--bg: #05060a;        /* background        */
--bg-soft: #0b0b12;   /* card background   */
--ink: #f4f3f7;       /* text              */
--muted: #8a8896;     /* muted text        */
--line: rgba(255,255,255,0.09);
--cyan: #00e5ff;      /* accent            */
--violet: #6d5cff;    /* accent            */
--coral: #ff4d9d;     /* the single CTA    */
```

The 3D scene reads the same hexes in **`src/scene.js`** (`COLORS` object) —
update both if you re-brand.

### The 3D scene
Tuning knobs at the top of `createScene()` in **`src/scene.js`**:

- `NODE_COUNT` — how many nodes (default 15)
- `PULSE_COUNT` — concurrent data pulses (default 5)
- `PARTICLE_COUNT` — ambient particles (default 130; `size: 0.02`,
  `opacity: 0.4`)
- `placeGraph()` — how far right the graph sits
- `MAX_DIST` — link density between nodes

The hero mask is `.hero-grad` in `style.css` — widen/narrow the transparent
window to give the scene more or less room.

---

## Accessibility & performance

- **Contrast:** near-white `#F4F3F7` on near-black `#05060A` (> 7:1), with an
  extra scrim under the hero headline.
- **`prefers-reduced-motion`:** Lenis, the loader animation, scene motion, data
  pulses, and scroll reveals are all disabled; the page renders calm and static.
- **Mobile:** the WebGL scene is **not** initialised below 760px / on coarse
  pointers — a lightweight CSS gradient stands in, and the native cursor is used.
- **`pixelRatio`** is capped at 2; the render loop pauses when the hero scrolls
  out of view. WebGL failures degrade gracefully to the static background.

---

## Notes

- **SplitText is not used.** The manifesto's word-by-word reveal is done with a
  tiny manual splitter in `main.js`, so there's no dependency on GSAP's premium
  plugin.
- `npm audit` reports a dev-only advisory in esbuild/Vite (the dev server's
  CORS behaviour). It does not affect the production build in `dist/`; only
  upgrade to Vite 8 if you specifically need it.
- The AETHER studio landing (studio "AETHER") that inspired the visual language
  lives elsewhere in this collection at `../../other/aether-studio/`. It was used
  only as a taste reference.
