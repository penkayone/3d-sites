// ============================================================
// scene.js — Three.js: интимный натюрморт при свете свечей.
// Тёмный стол, тарелка с подачей, бокал вина, капля и пар
// в тёплом луче, свеча, частицы; пост (bloom + DOF +
// зерно/виньетка/винно-золотой грейд). Всё процедурно —
// внешних ассетов нет (модели/HDRI можно добавить в assets/).
// ============================================================

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// --- цветокоррекция: винные тени, золотые света, зерно, виньетка ---
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.05 },
    uVignette: { value: 0.62 },
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
      // тёплые винные тени
      col = mix(col, col * vec3(1.08, 0.82, 0.86), (1.0 - smoothstep(0.0, 0.5, luma)) * 0.35);
      // золото в светах
      col += vec3(0.10, 0.06, 0.005) * smoothstep(0.55, 1.0, luma);
      // виньетка — собирает свет к центру, интимнее
      float d = distance(vUv, vec2(0.5));
      col *= 1.0 - uVignette * smoothstep(0.32, 0.98, d);
      // лёгкое зерно
      col += (hash(vUv * 900.0) - 0.5) * uGrain;
      gl_FragColor = vec4(col, tex.a);
    }`,
};

// --- мягкая круглая текстура (частицы, свечение) ---
function makeSoftCircle(inner = 0.0) {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, s * inner, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

// --- текстура пара: мягкий вертикальный клуб ---
function makeSteamTexture() {
  const w = 64;
  const h = 128;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  for (let i = 0; i < 10; i++) {
    const x = w * (0.35 + Math.random() * 0.3);
    const y = h * (0.15 + Math.random() * 0.75);
    const r = w * (0.16 + Math.random() * 0.2);
    const a = 0.05 + Math.random() * 0.08;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,246,232,${a})`);
    g.addColorStop(1, 'rgba(255,246,232,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  return new THREE.CanvasTexture(c);
}

// --- процедурное окружение для отражений (тёмный зал + тёплый ключ) ---
function makeEnvScene(keyDir) {
  const scene = new THREE.Scene();
  const geo = new THREE.SphereGeometry(50, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uKey: { value: keyDir.clone().normalize() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      uniform vec3 uKey;
      void main() {
        vec3 d = normalize(vDir);
        vec3 base = vec3(0.03, 0.018, 0.012);            // тёмный зал
        float key = pow(max(dot(d, uKey), 0.0), 3.0);
        vec3 col = base + vec3(1.0, 0.66, 0.34) * key * 1.4;   // тёплый ключ
        float fill = pow(max(dot(d, -uKey), 0.0), 2.0);
        col += vec3(0.28, 0.06, 0.11) * fill * 0.5;       // винный контровой
        col += vec3(0.05, 0.02, 0.012) * max(d.y, 0.0);   // мягкий верх
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(geo, mat));
  return scene;
}

// --- тарелка (лате-профиль) с минималистичной подачей ---
function makePlate(low) {
  const group = new THREE.Group();

  const profile = [
    [0.0, 0.05], [0.5, 0.04], [0.72, 0.05], [0.86, 0.12],
    [0.98, 0.17], [1.02, 0.16], [1.0, 0.02],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const plateGeo = new THREE.LatheGeometry(profile, low ? 48 : 96);
  const plateMat = new THREE.MeshPhysicalMaterial({
    color: 0xede4d3,
    roughness: 0.3,
    metalness: 0.02,
    clearcoat: low ? 0 : 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.7,
    side: THREE.DoubleSide,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.castShadow = true;
  plate.receiveShadow = true;
  group.add(plate);

  // соус — глянцевый винный мазок (дуга)
  const sauce = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.022, 12, 40, Math.PI * 0.9),
    new THREE.MeshStandardMaterial({ color: 0x3a0e18, roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9 })
  );
  sauce.rotation.x = -Math.PI / 2;
  sauce.rotation.z = -0.5;
  sauce.scale.set(1, 1, 0.4);
  sauce.position.set(0.06, 0.055, 0.04);
  sauce.castShadow = true;
  group.add(sauce);

  // кнель (главный элемент подачи)
  const quenelle = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, low ? 16 : 28, low ? 12 : 20),
    new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.5 })
  );
  quenelle.scale.set(1.5, 0.85, 1);
  quenelle.rotation.y = 0.5;
  quenelle.position.set(-0.12, 0.12, 0.04);
  quenelle.castShadow = true;
  quenelle.receiveShadow = true;
  group.add(quenelle);

  // обжаренный элемент (гребешок)
  const scallop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.145, 0.075, low ? 18 : 30),
    new THREE.MeshStandardMaterial({ color: 0xd9b478, roughness: 0.42, metalness: 0.08, envMapIntensity: 0.6 })
  );
  scallop.position.set(0.2, 0.09, -0.14);
  scallop.castShadow = true;
  scallop.receiveShadow = true;
  group.add(scallop);

  // золотые точки-гарнир
  const dotGeo = new THREE.SphereGeometry(0.016, 10, 8);
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xc7962e, roughness: 0.3, metalness: 0.9, envMapIntensity: 1 });
  for (const p of [[0.02, 0.07, 0.28], [-0.28, 0.07, -0.06], [0.34, 0.07, 0.12], [-0.02, 0.07, -0.26]]) {
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(p[0], p[1], p[2]);
    group.add(dot);
  }

  // микро-зелень
  const herbMat = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.6 });
  for (const p of [[-0.05, 0.2, 0.02], [0.02, 0.19, -0.02]]) {
    const herb = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.09, 6), herbMat);
    herb.position.set(p[0], p[1], p[2]);
    herb.rotation.z = (Math.random() - 0.5) * 0.8;
    group.add(herb);
  }

  return group;
}

// --- бокал вина (лате-профиль) с отражениями окружения ---
function makeWineGlass(low) {
  const group = new THREE.Group();

  const profile = [
    [0.0, 0.0], [0.3, 0.0], [0.3, 0.012], [0.045, 0.022],
    [0.032, 0.03], [0.032, 0.34], [0.05, 0.4], [0.26, 0.52],
    [0.34, 0.66], [0.36, 0.78], [0.33, 0.9], [0.335, 0.905],
  ].map((p) => new THREE.Vector2(p[0], p[1]));

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf1ead9,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: low ? 0.28 : 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: low ? 1.0 : 1.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glass = new THREE.Mesh(new THREE.LatheGeometry(profile, low ? 32 : 64), glassMat);
  group.add(glass);

  // объём вина в чаше
  const wineBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, low ? 18 : 32, low ? 14 : 20),
    new THREE.MeshStandardMaterial({ color: 0x4a1220, roughness: 0.18, metalness: 0.1, envMapIntensity: 0.8 })
  );
  wineBody.scale.set(1, 0.62, 1);
  wineBody.position.y = 0.57;
  group.add(wineBody);

  // зеркальная поверхность вина
  const wineTop = new THREE.Mesh(
    new THREE.CircleGeometry(0.305, low ? 24 : 48),
    new THREE.MeshStandardMaterial({ color: 0x5a1626, roughness: 0.08, metalness: 0.2, envMapIntensity: 1.1 })
  );
  wineTop.rotation.x = -Math.PI / 2;
  wineTop.position.y = 0.645;
  group.add(wineTop);

  group.position.set(0.95, 0, -0.42);
  group.rotation.y = -0.2;
  return group;
}

// --- капля, застывшая в фокусе (сигнатурный элемент) ---
function makeDroplet(low) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xf3ecdc,
    roughness: 0,
    metalness: 0,
    transparent: true,
    opacity: 0.55,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: low ? 1.4 : 2.2,
  });
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 20), mat);
  drop.scale.set(1, 1.25, 1);
  drop.position.set(-0.06, 0.6, 0.08);
  return drop;
}

// --- пар: несколько восходящих клубов (additive-спрайты) ---
function makeSteam(low) {
  const tex = makeSteamTexture();
  const group = new THREE.Group();
  const count = low ? 3 : 5;
  const items = [];
  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffe9cf,
      fog: false,
    });
    const spr = new THREE.Sprite(mat);
    const phase = i / count;
    spr.position.set(-0.1, 0.2, 0.04);
    group.add(spr);
    items.push({
      spr,
      mat,
      phase,
      x0: -0.1 + (Math.random() - 0.5) * 0.12,
      z0: 0.04 + (Math.random() - 0.5) * 0.12,
      speed: 0.09 + Math.random() * 0.05,
      sway: 0.1 + Math.random() * 0.1,
    });
  }
  return {
    group,
    update(t) {
      for (const it of items) {
        const life = ((t * it.speed + it.phase) % 1);       // 0..1
        const y = 0.22 + life * 1.4;
        it.spr.position.set(
          it.x0 + Math.sin(life * 5 + it.phase * 8) * it.sway * life,
          y,
          it.z0
        );
        const s = 0.35 + life * 1.1;
        it.spr.scale.set(s, s * 1.5, 1);
        it.mat.opacity = Math.sin(life * Math.PI) * 0.5;      // проявился и растаял
      }
    },
  };
}

// --- частицы в луче (GPU-анимация) ---
function makeParticles(count) {
  const positions = new Float32Array(count * 3);
  const rnd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2.2;
    positions[i * 3 + 1] = Math.random() * 2.4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6 - 0.1;
    rnd[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTex: { value: makeSoftCircle() },
      uSize: { value: 26 },
      uColor: { value: new THREE.Color(0xffca7a) },
    },
    vertexShader: /* glsl */ `
      attribute float aRand;
      uniform float uTime, uSize;
      varying float vA;
      void main() {
        vec3 p = position;
        float t = uTime * (0.06 + aRand * 0.08) + aRand * 6.2831;
        p.y = mod(p.y + t * 0.4, 2.4);                 // медленный подъём
        p.x += sin(t * 1.3 + aRand * 10.0) * 0.12;     // покачивание
        p.z += cos(t * 1.1 + aRand * 8.0) * 0.1;
        // ярче в тёплом пятне над тарелкой
        float dist = length(vec2(p.x, p.z));
        vA = smoothstep(1.2, 0.0, dist) * (0.35 + 0.65 * aRand);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (0.4 + aRand * 0.6) / (-mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform vec3 uColor;
      varying float vA;
      void main() {
        float a = texture2D(uTex, gl_PointCoord).a;
        gl_FragColor = vec4(uColor, a * vA);
      }`,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return { points, mat };
}

// --- свеча: держатель, пламя, свечение, точечный свет ---
function makeCandle() {
  const group = new THREE.Group();

  const holder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 0.3, 20),
    new THREE.MeshStandardMaterial({ color: 0xc7962e, roughness: 0.35, metalness: 0.85, envMapIntensity: 1 })
  );
  holder.position.y = 0.15;
  holder.castShadow = true;
  group.add(holder);

  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffcf6b, transparent: true, opacity: 0.95, fog: false });
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), flameMat);
  flame.scale.set(1, 1.9, 1);
  flame.position.y = 0.4;
  group.add(flame);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeSoftCircle(),
      color: 0xffb45a,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  );
  glow.position.y = 0.4;
  glow.scale.setScalar(0.9);
  group.add(glow);

  const light = new THREE.PointLight(0xffb066, 6, 6, 2);
  light.position.y = 0.42;
  group.add(light);

  group.position.set(1.75, 0, 0.5);

  return {
    group,
    update(t) {
      const f = 0.82 + Math.sin(t * 11) * 0.08 + Math.sin(t * 23.3) * 0.06;
      flameMat.opacity = 0.85 * f + 0.1;
      flame.scale.set(1 + Math.sin(t * 17) * 0.05, 1.9 * f, 1 + Math.cos(t * 19) * 0.05);
      glow.material.opacity = 0.55 * f + 0.15;
      glow.scale.setScalar(0.85 + f * 0.15);
      light.intensity = 5.2 * f + 1.2;
    },
  };
}

// --- дальние боке-огни зала (проявляются на отъезде) ---
function makeRoomLights() {
  const group = new THREE.Group();
  const tex = makeSoftCircle();
  const spots = [
    [-3.2, 0.7, -6.5, 0.5], [2.8, 1.1, -7.5, 0.7], [-1.6, 0.4, -8.5, 0.45],
    [3.6, 0.5, -5.8, 0.4], [-4.2, 1.3, -8.0, 0.6], [0.6, 1.6, -9.2, 0.55],
    [1.8, 0.3, -6.2, 0.35], [-2.4, 1.8, -9.6, 0.5],
  ];
  for (const s of spots) {
    const spr = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex,
        color: 0xffb45a,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      })
    );
    spr.position.set(s[0], s[1], s[2]);
    spr.scale.setScalar(s[3]);
    spr.userData.base = 0.5;
    spr.userData.phase = Math.random() * 6.28;
    group.add(spr);
  }
  return {
    group,
    update(t) {
      for (const spr of group.children) {
        spr.material.opacity = spr.userData.base * (0.75 + Math.sin(t * 2 + spr.userData.phase) * 0.25);
      }
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
  renderer.toneMappingExposure = 1.15;
  if (!low) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0705);
  scene.fog = new THREE.FogExp2(0x0b0705, 0.11);

  const camera = new THREE.PerspectiveCamera(40, width() / height(), 0.1, 100);

  // ключ света смещён вправо-вверх — «мягкий контровой» и тёплый пул на столе
  const keyDir = new THREE.Vector3(0.55, 0.72, 0.42).normalize();

  // окружение для отражений
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(makeEnvScene(keyDir), 0.04, 0.1, 60);
  scene.environment = envRT.texture;
  pmrem.dispose();

  // --- стол ---
  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x120b07, roughness: 0.34, metalness: 0.5, envMapIntensity: 0.55 })
  );
  table.rotation.x = -Math.PI / 2;
  table.receiveShadow = true;
  scene.add(table);

  // --- объекты натюрморта ---
  const plate = makePlate(low);
  scene.add(plate);

  const glass = makeWineGlass(low);
  scene.add(glass);

  const droplet = makeDroplet(low);
  scene.add(droplet);

  const steam = makeSteam(low);
  scene.add(steam.group);

  const particles = makeParticles(low ? 90 : 220);
  scene.add(particles.points);

  const candle = makeCandle();
  scene.add(candle.group);

  const roomLights = makeRoomLights();
  scene.add(roomLights.group);

  // --- свет ---
  const key = new THREE.SpotLight(0xffb45c, low ? 34 : 42, 18, 0.62, 0.85, 1.5);
  key.position.copy(keyDir).multiplyScalar(6);
  key.target.position.set(0, 0.1, 0);
  scene.add(key, key.target);
  if (!low) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 14;
    key.shadow.bias = -0.0006;
    key.shadow.radius = 4;
  }

  // мягкий контровой сзади-сверху — обводит край тарелки, бокала, пара
  const rim = new THREE.DirectionalLight(0xffcaa0, 0.9);
  rim.position.set(-2.6, 2.6, -4.2);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0x3a1f14, 0x000000, 0.35));
  scene.add(new THREE.AmbientLight(0x1a0f0a, 0.5));

  // постобработка
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let bokeh = null;
  if (!low) {
    bokeh = new BokehPass(scene, camera, { focus: 3.1, aperture: 0.0016, maxblur: 0.01 });
    composer.addPass(bokeh);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(width(), height()), low ? 0.5 : 0.7, 0.6, 0.72);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  grade.uniforms.uGrain.value = low ? 0.035 : 0.05;
  composer.addPass(grade);

  // состояние камеры — им управляет scroll.js
  const camState = { px: 0.0, py: 1.16, pz: 4.35, tx: 0.16, ty: 0.28, tz: -0.05, roll: 0, fov: 42, focus: 4.35 };
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

  function updateWorld(t, dt) {
    steam.update(t);
    candle.update(t);
    roomLights.update(t);
    particles.mat.uniforms.uTime.value = t;
    droplet.position.y = 0.6 + Math.sin(t * 1.4) * 0.006;   // едва заметно дышит
  }

  function renderFrame() {
    applyCameraState();
    updateWorld(clock.elapsedTime, 0);
    composer.render();
    if (frames === 0) resolveReady();
    frames++;
  }

  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    updateWorld(t, dt);
    grade.uniforms.uTime.value = t % 1000;
    applyCameraState();
    composer.render();
    if (frames === 0) resolveReady();
    frames++;
    // страж производительности: если старт идёт тяжело — упрощаем
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
    bloom.setSize(w, h);
    if (reducedMotion && frames > 0) renderFrame();
  }

  function dispose() {
    stop();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      for (const m of mats) {
        for (const k in m) {
          if (m[k] && m[k].isTexture) m[k].dispose();
        }
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
