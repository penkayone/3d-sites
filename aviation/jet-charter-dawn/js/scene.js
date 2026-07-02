// ============================================================
// scene.js — Three.js: рассветное небо, море облаков, джет,
// постобработка (bloom + depth of field + зерно/виньетка/грейд)
// Вся геометрия и текстуры процедурные — внешних ассетов нет.
// ============================================================

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.05 },
    uVignette: { value: 0.5 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uGrain, uVignette;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7)) + uTime * 61.3) * 43758.5453);
    }

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      vec3 col = tex.rgb;
      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      // холодные тени в ночной синий, тёплое золото в света
      col = mix(col, col * vec3(0.9, 1.02, 1.22), (1.0 - smoothstep(0.0, 0.55, luma)) * 0.22);
      col += vec3(0.10, 0.07, 0.02) * smoothstep(0.6, 1.0, luma);
      // виньетка
      float d = distance(vUv, vec2(0.5));
      col *= 1.0 - uVignette * smoothstep(0.42, 0.95, d);
      // лёгкое зерно
      col += (hash(vUv * 900.0) - 0.5) * uGrain;
      gl_FragColor = vec4(col, tex.a);
    }`,
};

function makeCloudTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < 14; i++) {
    const x = size * (0.28 + Math.random() * 0.44);
    const y = size * (0.32 + Math.random() * 0.36);
    const r = size * (0.12 + Math.random() * 0.24);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${0.1 + Math.random() * 0.13})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,224,170,0.9)');
  g.addColorStop(0.35, 'rgba(232,185,106,0.28)');
  g.addColorStop(1, 'rgba(232,185,106,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function makeTrailTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 16);
  return new THREE.CanvasTexture(canvas);
}

function makeSky(sunDir) {
  const geo = new THREE.SphereGeometry(240, 32, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uSunDir: { value: sunDir.clone() },
      uTop: { value: new THREE.Color(0x050d1e) },
      uMid: { value: new THREE.Color(0x1c3a63) },
      uHorWarm: { value: new THREE.Color(0xc07a45) },
      uHorCold: { value: new THREE.Color(0x35597f) },
      uSun: { value: new THREE.Color(0xffd9a0) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      uniform vec3 uSunDir, uTop, uMid, uHorWarm, uHorCold, uSun;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        // тёплый горизонт только со стороны солнца
        vec2 az = normalize(vec2(d.x, d.z) + vec2(1e-4));
        vec2 sunAz = normalize(vec2(uSunDir.x, uSunDir.z) + vec2(1e-4));
        float warm = pow(max(dot(az, sunAz), 0.0), 2.0);
        vec3 horizon = mix(uHorCold, uHorWarm, warm);

        vec3 col = mix(horizon, uMid, smoothstep(-0.02, 0.22, h));
        col = mix(col, uTop, smoothstep(0.12, 0.65, h));
        col = mix(horizon * 0.35, col, smoothstep(-0.4, -0.02, h));

        float s = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSun * (pow(s, 260.0) * 2.2 + pow(s, 24.0) * 0.55 + pow(s, 5.0) * 0.18);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  return new THREE.Mesh(geo, mat);
}

function makeSun(sunDir) {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(5, 48),
    new THREE.MeshBasicMaterial({ color: 0xfff1d6, fog: false })
  );
  disc.position.copy(sunDir).multiplyScalar(228);
  disc.lookAt(0, 0, 0);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  );
  glow.position.copy(sunDir).multiplyScalar(220);
  glow.scale.setScalar(110);

  return { disc, glow };
}

function makeClouds(count, sunDir) {
  const tex = makeCloudTexture();
  const group = new THREE.Group();
  const items = [];
  const base = new THREE.Color(0x9fb6d2);
  const warm = new THREE.Color(0xd9b078);
  const tint = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const nearBand = i % 6 === 0;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      fog: true,
    });
    const spr = new THREE.Sprite(mat);

    if (nearBand) {
      // облака вдоль стартовой траектории камеры — для пролёта «сквозь»;
      // z ≥ 30, чтобы в точке героя (z = 26) камера уже вышла из слоя
      spr.position.set(
        THREE.MathUtils.randFloat(-7, 7),
        THREE.MathUtils.randFloat(-0.6, 1.8),
        THREE.MathUtils.randFloat(30, 46)
      );
      spr.scale.setScalar(THREE.MathUtils.randFloat(10, 17));
      mat.opacity = THREE.MathUtils.randFloat(0.5, 0.8);
    } else {
      // море облаков под маршрутом
      spr.position.set(
        THREE.MathUtils.randFloat(-46, 46),
        THREE.MathUtils.randFloat(-4.6, -1.2),
        THREE.MathUtils.randFloat(-46, 58)
      );
      spr.scale.setScalar(THREE.MathUtils.randFloat(7, 19));
      mat.opacity = THREE.MathUtils.randFloat(0.32, 0.72);
    }

    // ближе к солнцу (−z) — теплее
    const f = THREE.MathUtils.clamp((10 - spr.position.z) / 70, 0, 1);
    tint.lerpColors(base, warm, f * 0.75);
    mat.color.copy(tint);

    items.push({ spr, speed: THREE.MathUtils.randFloat(0.06, 0.3) * (Math.random() < 0.5 ? -1 : 1) });
    group.add(spr);
  }

  return {
    group,
    update(dt) {
      for (const it of items) {
        it.spr.position.x += it.speed * dt;
        if (it.spr.position.x > 50) it.spr.position.x = -50;
        else if (it.spr.position.x < -50) it.spr.position.x = 50;
      }
    },
  };
}

function makeJet() {
  const group = new THREE.Group();

  const body = new THREE.MeshStandardMaterial({ color: 0x1a2f52, metalness: 0.9, roughness: 0.32 });
  const wingMat = body.clone();
  wingMat.side = THREE.DoubleSide;
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24b, metalness: 1.0, roughness: 0.25 });
  const goldDS = gold.clone();
  goldDS.side = THREE.DoubleSide;

  // фюзеляж вдоль X, нос — в −X
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 4.2, 6, 20), body);
  fus.rotation.z = Math.PI / 2;
  group.add(fus);

  // золотая линия по бортам
  for (const zSide of [-1, 1]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 0.02), gold);
    stripe.position.set(0, 0.06, 0.335 * zSide);
    group.add(stripe);
  }

  // крыло: трапеция в плоскости XY (x — хорда, y — размах), затем в горизонт
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(1.3, 0);
  wingShape.lineTo(2.2, 3.2);
  wingShape.lineTo(1.75, 3.2);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.07, bevelEnabled: false });

  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.rotation.x = Math.PI / 2;
  wingL.position.set(-0.5, -0.12, 0);
  group.add(wingL);

  const wingR = wingL.clone();
  wingR.scale.z = -1;
  group.add(wingR);

  // винглеты
  for (const zSide of [-1, 1]) {
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.04), gold);
    winglet.position.set(1.45, 0.05, 3.22 * zSide);
    winglet.rotation.x = -0.15 * zSide;
    group.add(winglet);
  }

  // киль + Т-образное оперение
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0.9, 0);
  finShape.lineTo(1.4, 1.1);
  finShape.lineTo(1.1, 1.1);
  finShape.closePath();
  const fin = new THREE.Mesh(
    new THREE.ExtrudeGeometry(finShape, { depth: 0.06, bevelEnabled: false }),
    wingMat
  );
  fin.position.set(1.15, 0.12, -0.03);
  group.add(fin);

  const tailGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.05, bevelEnabled: false });
  for (const zSide of [-1, 1]) {
    const tail = new THREE.Mesh(tailGeo, wingMat);
    tail.rotation.x = Math.PI / 2;
    tail.scale.set(0.32, 0.32, 0.32 * zSide);
    tail.position.set(2.15, 1.22, 0);
    group.add(tail);
  }

  // двигатели на хвостовой части
  const engGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.72, 20);
  const ringGeo = new THREE.TorusGeometry(0.16, 0.028, 10, 24);
  for (const zSide of [-1, 1]) {
    const eng = new THREE.Mesh(engGeo, body);
    eng.rotation.z = Math.PI / 2;
    eng.position.set(1.25, 0.12, 0.56 * zSide);
    group.add(eng);
    const ring = new THREE.Mesh(ringGeo, goldDS);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(0.89, 0.12, 0.56 * zSide);
    group.add(ring);
  }

  // проблесковые огни (bloom подхватит)
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffe3b0, transparent: true, opacity: 1 });
  const strobeGeo = new THREE.SphereGeometry(0.035, 8, 8);
  for (const pos of [[1.45, 0.05, 3.25], [1.45, 0.05, -3.25], [1.48, 1.28, 0]]) {
    const s = new THREE.Mesh(strobeGeo, strobeMat);
    s.position.set(pos[0], pos[1], pos[2]);
    group.add(s);
  }

  // инверсионные следы за законцовками (крест из двух плоскостей)
  const trailTex = makeTrailTexture();
  const trailMat = new THREE.MeshBasicMaterial({
    map: trailTex,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
  });
  const trailGeoH = new THREE.PlaneGeometry(14, 0.11);
  trailGeoH.rotateX(-Math.PI / 2);
  trailGeoH.translate(7, 0, 0);
  const trailGeoV = new THREE.PlaneGeometry(14, 0.11);
  trailGeoV.translate(7, 0, 0);
  for (const zSide of [-1, 1]) {
    for (const geo of [trailGeoH, trailGeoV]) {
      const trail = new THREE.Mesh(geo, trailMat);
      trail.position.set(1.6, -0.02, 3.22 * zSide);
      group.add(trail);
    }
  }

  return {
    group,
    update(t) {
      group.position.y = 1.6 + Math.sin(t * 0.9) * 0.06;
      group.rotation.z = Math.sin(t * 0.7) * 0.02;
      group.rotation.x = Math.sin(t * 0.55 + 1.2) * 0.012;
      strobeMat.opacity = 0.15 + 0.85 * Math.pow(Math.max(Math.sin(t * 2.4), 0), 8);
      trailMat.opacity = 0.38 + 0.08 * Math.sin(t * 1.7);
    },
  };
}

export function createScene({ container, quality = 'high', reducedMotion = false }) {
  const low = quality === 'low';
  const width = () => container.clientWidth || window.innerWidth;
  const height = () => container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: !low, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75));
  renderer.setSize(width(), height());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b1e3b, 0.016);

  const camera = new THREE.PerspectiveCamera(55, width() / height(), 0.1, 500);

  // небо, солнце, окружение (солнце смещено вправо от оси кадра —
  // текст героя остаётся на тёмной части неба и читается)
  const sunDir = new THREE.Vector3(0.35, 0.12, -1).normalize();
  const sky = makeSky(sunDir);
  scene.add(sky);
  const sun = makeSun(sunDir);
  scene.add(sun.disc, sun.glow);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(sky.clone());
  const envRT = pmrem.fromScene(envScene, 0.04, 1, 400);
  scene.environment = envRT.texture;
  pmrem.dispose();

  // свет
  const sunLight = new THREE.DirectionalLight(0xffd9a0, 2.2);
  sunLight.position.copy(sunDir).multiplyScalar(50);
  scene.add(sunLight);
  scene.add(new THREE.HemisphereLight(0x4a6f9e, 0x0b1e3b, 0.6));

  // «дно» под морем облаков
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ color: 0x0e2444, roughness: 1, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -6.5;
  scene.add(floor);

  const clouds = makeClouds(low ? 55 : 130, sunDir);
  scene.add(clouds.group);

  const jet = makeJet();
  jet.group.position.set(0, 1.6, -6);
  jet.group.rotation.y = -0.55;
  scene.add(jet.group);

  // постобработка
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let bokeh = null;
  if (!low) {
    bokeh = new BokehPass(scene, camera, { focus: 30, aperture: 0.00028, maxblur: 0.0075 });
    composer.addPass(bokeh);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(width(), height()), 0.55, 0.65, 0.75);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  grade.uniforms.uGrain.value = low ? 0.035 : 0.05;
  composer.addPass(grade);

  // состояние камеры — им управляет scroll.js (GSAP пишет, сцена читает)
  const camState = { px: 0, py: 1.15, pz: 26, tx: 0, ty: 1.7, tz: -20, roll: 0, fov: 55, focus: 30 };
  const lookTarget = new THREE.Vector3();

  function applyCameraState() {
    camera.position.set(camState.px, camState.py, camState.pz);
    lookTarget.set(camState.tx, camState.ty, camState.tz);
    camera.lookAt(lookTarget);
    camera.rotation.z += camState.roll;
    if (camera.fov !== camState.fov) {
      camera.fov = camState.fov;
      camera.updateProjectionMatrix();
    }
    if (bokeh) bokeh.uniforms['focus'].value = camState.focus;
  }

  const clock = new THREE.Clock();
  let running = false;
  let rafId = 0;
  let frames = 0;
  let perfAccum = 0;
  let degraded = false;

  let resolveReady;
  const ready = new Promise((res) => { resolveReady = res; });

  function degrade() {
    if (degraded) return;
    degraded = true;
    if (bokeh) {
      composer.removePass(bokeh);
      bokeh = null;
    }
    renderer.setPixelRatio(1.25);
    composer.setPixelRatio(1.25);
    composer.setSize(width(), height());
  }

  function renderFrame() {
    applyCameraState();
    clouds.update(0);
    jet.update(clock.elapsedTime);
    composer.render();
    if (frames === 0) resolveReady();
    frames++;
  }

  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    clouds.update(dt);
    jet.update(t);
    grade.uniforms.uTime.value = t % 1000;
    applyCameraState();
    composer.render();
    if (frames === 0) resolveReady();
    frames++;
    // страж производительности: если первые секунды идут тяжело — упрощаем
    if (!low && !degraded && frames > 60 && frames <= 240) {
      perfAccum += dt;
      if (frames === 240 && perfAccum / 180 > 0.021) degrade();
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function onResize() {
    const w = width();
    const h = height();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    if (reducedMotion && frames > 0) renderFrame();
  }

  function dispose() {
    stop();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      for (const m of mats) {
        if (m.map) m.map.dispose();
        m.dispose();
      }
    });
    envRT.dispose();
    composer.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { camState, ready, start, stop, renderFrame, onResize, dispose };
}
