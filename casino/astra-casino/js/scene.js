/* =====================================================================
   scene.js — ambient decorative 3D (progressive enhancement)
   One canvas, fixed background, pointer-events:none, below all UI.
   Signature motif: a fine starfield + orbital rings around a slow
   wireframe crystal. No heavy postprocessing, no per-frame cost spikes.
   ===================================================================== */

import * as THREE from 'three';

export function initScene(canvas) {
  if (!canvas) return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData === true;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  // WebGL availability guard — never throw if unsupported.
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: 'low-power' });
  } catch (e) {
    return () => {};
  }

  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  const group = new THREE.Group();
  scene.add(group);

  const CYAN = new THREE.Color('#4df3e5');
  const VIOLET = new THREE.Color('#7b5cff');

  /* ---- Starfield ---- */
  const COUNT = isMobile ? 320 : 900;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 6 + Math.pow((i % 100) / 100, 0.6) * 14;
    const theta = (i * 2.399963) % (Math.PI * 2);
    const phi = Math.acos(1 - 2 * ((i + 0.5) / COUNT));
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    const c = i % 3 === 0 ? CYAN : VIOLET;
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const starMat = new THREE.PointsMaterial({
    size: isMobile ? 0.05 : 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeo, starMat);
  group.add(stars);

  /* ---- Orbital rings ---- */
  const rings = [];
  const ringDefs = [
    { r: 4.4, tilt: 1.15, color: CYAN, op: 0.5 },
    { r: 6.2, tilt: 0.5, color: VIOLET, op: 0.4 },
    { r: 8.1, tilt: 1.7, color: CYAN, op: 0.22 },
  ];
  ringDefs.forEach((d) => {
    const pts = [];
    const seg = 128;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * d.r, 0, Math.sin(a) * d.r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: d.color, transparent: true, opacity: d.op, blending: THREE.AdditiveBlending, depthWrite: false });
    const line = new THREE.LineLoop(geo, mat);
    line.rotation.x = d.tilt;
    line.rotation.z = d.tilt * 0.4;
    group.add(line);
    rings.push({ line, geo, mat, speed: 0.04 + d.r * 0.006 });
  });

  /* ---- Central crystal ---- */
  const crystalGeo = new THREE.IcosahedronGeometry(2.1, 1);
  const crystalMat = new THREE.MeshBasicMaterial({ color: VIOLET, wireframe: true, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  group.add(crystal);

  /* ---- Interaction (fine pointer only, tiny parallax) ---- */
  const target = { x: 0, y: 0 };
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  function onPointer(e) {
    target.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
    target.y = (e.clientY / window.innerHeight - 0.5) * 0.6;
  }
  if (finePointer && !prefersReduced) window.addEventListener('pointermove', onPointer, { passive: true });

  /* ---- Resize (single listener, no leak) ---- */
  let resizeRaf = 0;
  function onResize() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    });
  }
  window.addEventListener('resize', onResize);

  /* ---- Loop ---- */
  let raf = 0;
  let running = true;
  let t = 0;
  // On mobile, render at ~30fps to save power.
  const frameSkip = isMobile ? 2 : 1;
  let tick = 0;

  function render() {
    group.rotation.x += (target.y - group.rotation.x) * 0.03;
    group.rotation.y += (target.x - group.rotation.y) * 0.03 + 0.0006;
    t += 0.01;
    stars.rotation.y -= 0.0004;
    rings.forEach((r) => { r.line.rotation.y += r.speed * 0.01; });
    crystal.rotation.x += 0.0025;
    crystal.rotation.y += 0.0018;
    crystal.scale.setScalar(1 + Math.sin(t) * 0.02);
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    tick = (tick + 1) % frameSkip;
    if (tick === 0) render();
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      loop();
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  if (prefersReduced) {
    render(); // one static frame, no animation
  } else {
    loop();
  }

  /* ---- Cleanup: dispose everything, drop listeners ---- */
  return function cleanup() {
    running = false;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(resizeRaf);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    starGeo.dispose(); starMat.dispose();
    crystalGeo.dispose(); crystalMat.dispose();
    rings.forEach((r) => { r.geo.dispose(); r.mat.dispose(); });
    renderer.dispose();
  };
}
