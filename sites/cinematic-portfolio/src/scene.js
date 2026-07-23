/* ============================================================
   scene.js — the 3D node network (Variant A)
   ------------------------------------------------------------
   An homage to n8n nodes: a sparse graph that lives ONLY in the
   right negative space. Nodes are dark with a thin fresnel rim
   (no glowing lantern); links are faint; soft data pulses travel
   the edges now and then. No bloom, no post-processing — there is
   physically nothing that can wash out the headline on the left.
   ============================================================ */

import * as THREE from "three";

const COLORS = {
  cyan: new THREE.Color("#00e5ff"),
  violet: new THREE.Color("#6d5cff"),
  coral: new THREE.Color("#ff4d9d"),
  muted: new THREE.Color("#8a8896"),
};

const NODE_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

// Dark core, color only on the rim (fresnel). uIntensity lets the
// node "receive" a passing pulse with a brief, contained brighten.
const NODE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 2.4);
    vec3 col = mix(uColor * 0.10, uColor, f);
    col += uColor * uIntensity * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Soft round sprite for the travelling pulses (kept tiny + few).
function makeGlowTexture() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createScene(canvas, opts = {}) {
  const reduced = !!opts.reducedMotion;
  const mobile = !!opts.mobile;
  const useParallax = !reduced && !mobile;

  let width = canvas.clientWidth || window.innerWidth;
  let height = canvas.clientHeight || window.innerHeight;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    return { destroy() {}, setProgress() {} }; // graceful no-op
  }
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  // Mobile: pull the camera back so the centred graph fits a portrait frame.
  camera.position.set(0, 0, mobile ? 7.5 : 6);

  // The whole graph sits in a group we can offset.
  const graph = new THREE.Group();
  scene.add(graph);

  let graphBaseY = 0.15;
  function placeGraph() {
    const aspect = width / height;
    if (mobile) {
      // Desktop has a right negative space; portrait does not, so the graph
      // lives in the LOWER negative space, beneath the headline.
      graph.position.x = 0;
      graphBaseY = -0.7;
    } else {
      // wider viewport → push further into the right negative space
      graph.position.x = THREE.MathUtils.clamp(aspect * 1.15, 1.5, 2.8);
      graphBaseY = 0.15;
    }
    graph.position.y = graphBaseY;
  }
  placeGraph();

  /* ---------- Nodes ---------- */
  const NODE_COUNT = reduced ? 10 : mobile ? 11 : 15;
  const nodeOffsetX = mobile ? 0 : 0.35; // bias into right negative space on desktop
  const nodeGeo = new THREE.IcosahedronGeometry(1, 1);
  const accents = [COLORS.cyan, COLORS.violet, COLORS.muted, COLORS.muted];
  const nodes = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    // sparse ellipsoidal distribution
    const u = Math.random();
    const v = Math.random();
    const th = u * Math.PI * 2;
    const ph = Math.acos(2 * v - 1);
    const r = Math.cbrt(Math.random());
    const pos = new THREE.Vector3(
      Math.sin(ph) * Math.cos(th) * 1.5 * r + nodeOffsetX,
      Math.sin(ph) * Math.sin(th) * 1.5 * r,
      Math.cos(ph) * 1.1 * r
    );
    const color = accents[Math.floor(Math.random() * accents.length)].clone();
    const mat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      uniforms: {
        uColor: { value: color },
        uIntensity: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    const size = 0.06 + Math.random() * 0.05;
    mesh.scale.setScalar(size);
    mesh.position.copy(pos);
    graph.add(mesh);
    nodes.push({ mesh, pos, mat, baseSize: size });
  }

  /* ---------- Edges (faint links) ---------- */
  const edges = [];
  const linePts = [];
  const MAX_DIST = 1.35;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = nodes[i].pos.distanceTo(nodes[j].pos);
      if (d < MAX_DIST) {
        edges.push([i, j]);
        linePts.push(nodes[i].pos.x, nodes[i].pos.y, nodes[i].pos.z);
        linePts.push(nodes[j].pos.x, nodes[j].pos.y, nodes[j].pos.z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePts, 3)
  );
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.09,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  graph.add(lines);

  /* ---------- Data pulses ---------- */
  const glowTex = makeGlowTexture();
  const PULSE_COUNT = reduced ? 0 : mobile ? 3 : 5;
  const pulseColors = [COLORS.cyan, COLORS.cyan, COLORS.violet, COLORS.coral];
  const pulses = [];

  function resetPulse(p) {
    if (!edges.length) return;
    const e = edges[Math.floor(Math.random() * edges.length)];
    p.a = nodes[e[0]];
    p.b = nodes[e[1]];
    p.t = 0;
    p.speed = 0.25 + Math.random() * 0.35;
    p.delay = Math.random() * 2.5; // pause before it starts again
    p.sprite.material.color.copy(
      pulseColors[Math.floor(Math.random() * pulseColors.length)]
    );
  }

  for (let i = 0; i < PULSE_COUNT; i++) {
    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(0.22);
    graph.add(sprite);
    const p = { sprite };
    resetPulse(p);
    p.delay = Math.random() * 4;
    pulses.push(p);
  }

  /* ---------- Rare ambient particles ---------- */
  const PARTICLE_COUNT = reduced ? 60 : mobile ? 70 : 130;
  const pPos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // desktop: biased right; mobile: centred around the lower graph
    pPos[i * 3] = (Math.random() - (mobile ? 0.5 : 0.35)) * (mobile ? 4 : 5);
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 5;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const partMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const particles = new THREE.Points(partGeo, partMat);
  graph.add(particles);

  /* ---------- Interaction state ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollProgress = 0; // 0 = hero top, 1 = hero scrolled away

  function onPointerMove(e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  }
  if (useParallax) window.addEventListener("mousemove", onPointerMove);

  /* ---------- Render loop ---------- */
  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;

  function frame() {
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    if (!reduced) {
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // slow ambient drift + gentle cursor parallax
      graph.rotation.y = t * 0.05 + pointer.x * 0.18;
      graph.rotation.x = Math.sin(t * 0.15) * 0.05 + pointer.y * 0.12;
      particles.rotation.y = -t * 0.01;

      camera.position.x = pointer.x * 0.25;
      camera.position.y = pointer.y * 0.18;
      camera.lookAt(graph.position.x * 0.4, 0, 0);

      // pulses travel the edges
      for (const p of pulses) {
        if (p.delay > 0) {
          p.delay -= dt;
          p.sprite.material.opacity = 0;
          continue;
        }
        p.t += p.speed * dt;
        if (p.t >= 1) {
          // hand off a brief brighten to the destination node
          p.b.mat.uniforms.uIntensity.value = 0.8;
          resetPulse(p);
          continue;
        }
        p.sprite.position.lerpVectors(p.a.pos, p.b.pos, p.t);
        p.sprite.material.opacity = Math.sin(p.t * Math.PI) * 0.9;
      }
      // decay node brighten
      for (const n of nodes) {
        const u = n.mat.uniforms.uIntensity;
        if (u.value > 0) u.value = Math.max(0, u.value - dt * 2.2);
      }
    }

    // scroll: shrink + move the graph away, fade links/particles.
    // Desktop graph lifts up-right; mobile graph sinks down — neither ever
    // crosses the text.
    const s = 1 - scrollProgress * 0.4;
    graph.scale.setScalar(s);
    graph.position.y =
      graphBaseY + (mobile ? -scrollProgress * 1.5 : scrollProgress * 1.2);
    lineMat.opacity = 0.09 * (1 - scrollProgress);
    partMat.opacity = 0.4 * (1 - scrollProgress * 0.8);

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    frame();
    raf = requestAnimationFrame(loop);
  }

  if (reduced) {
    // single static frame, no continuous animation
    clock.getDelta();
    frame();
  } else {
    loop();
  }

  /* ---------- Resize ---------- */
  function onResize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    placeGraph();
    if (reduced) frame();
  }
  window.addEventListener("resize", onResize);

  // Pause rendering when the hero is off-screen (perf).
  function setActive(active) {
    if (reduced) return;
    if (active && !running) {
      running = true;
      clock.getDelta();
      loop();
    } else if (!active && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  return {
    setProgress(p) {
      scrollProgress = THREE.MathUtils.clamp(p, 0, 1);
    },
    setActive,
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    },
  };
}
