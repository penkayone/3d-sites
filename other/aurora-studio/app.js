const canvas = document.querySelector("#scene");
const pointer = { x: 0, y: 0 };
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

async function startScene() {
  try {
    const THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    );
    initThreeScene(THREE);
  } catch (error) {
    console.warn("Three.js was unavailable, using local canvas fallback.", error);
    initCanvasFallback();
  }
}

function initThreeScene(THREE) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.45, 8.4);

  const group = new THREE.Group();
  group.position.set(2.72, 0.08, 0);
  group.scale.setScalar(0.95);
  scene.add(group);

  const keyLight = new THREE.DirectionalLight(0xf7f1e4, 3.2);
  keyLight.position.set(-4, 5, 6);
  scene.add(keyLight);

  const tealLight = new THREE.PointLight(0x44d7c7, 8, 18);
  tealLight.position.set(3, 1.8, 4);
  scene.add(tealLight);

  const coralLight = new THREE.PointLight(0xff725f, 6, 16);
  coralLight.position.set(-4, -2.2, 2.4);
  scene.add(coralLight);

  scene.add(new THREE.AmbientLight(0x50615d, 1.05));

  const coreGeometry = new THREE.TorusKnotGeometry(1.32, 0.22, 190, 18, 2, 3);
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf0d28a,
    metalness: 0.54,
    roughness: 0.2,
    clearcoat: 0.82,
    clearcoatRoughness: 0.18,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  const shellGeometry = new THREE.IcosahedronGeometry(2.42, 1);
  const shellEdges = new THREE.EdgesGeometry(shellGeometry);
  const shell = new THREE.LineSegments(
    shellEdges,
    new THREE.LineBasicMaterial({
      color: 0x44d7c7,
      transparent: true,
      opacity: 0.36,
    })
  );
  group.add(shell);

  const shardGeometry = new THREE.BoxGeometry(0.18, 1.4, 0.48);
  const shardMaterials = [
    new THREE.MeshStandardMaterial({
      color: 0x44d7c7,
      metalness: 0.18,
      roughness: 0.36,
      transparent: true,
      opacity: 0.74,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xff725f,
      metalness: 0.16,
      roughness: 0.34,
      transparent: true,
      opacity: 0.68,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xf7f1e4,
      metalness: 0.28,
      roughness: 0.28,
      transparent: true,
      opacity: 0.6,
    }),
  ];
  const shards = [];

  for (let i = 0; i < 14; i += 1) {
    const shard = new THREE.Mesh(shardGeometry, shardMaterials[i % shardMaterials.length]);
    const angle = (i / 14) * Math.PI * 2;
    const radius = 2.2 + (i % 4) * 0.38;
    shard.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.7) * 1.12,
      Math.sin(angle) * 0.9
    );
    shard.rotation.set(angle * 0.72, angle, angle * 0.36);
    shard.scale.set(0.9 + (i % 3) * 0.28, 0.88 + (i % 5) * 0.15, 0.8);
    shard.userData.spin = 0.22 + i * 0.018;
    shards.push(shard);
    group.add(shard);
  }

  const floor = new THREE.GridHelper(16, 26, 0x44d7c7, 0xf7f1e4);
  floor.position.set(1.45, -2.75, -1.6);
  floor.rotation.x = 0.04;
  floor.material.transparent = true;
  floor.material.opacity = 0.13;
  scene.add(floor);

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [
    new THREE.Color(0x44d7c7),
    new THREE.Color(0xff725f),
    new THREE.Color(0xf0b64a),
    new THREE.Color(0xf7f1e4),
  ];

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 18;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = -Math.random() * 8 - 0.5;

    const color = palette[i % palette.length];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      size: 0.026,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    })
  );
  scene.add(particles);

  const clock = new THREE.Clock();
  document.body.dataset.scene = "three";
  window.__sceneStatus = "three-ready";

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerWidth < 760) {
      group.position.set(0.12, -0.72, 0);
      group.scale.setScalar(0.78);
      camera.position.z = 9.4;
    } else {
      group.position.set(2.72, 0.08, 0);
      group.scale.setScalar(0.95);
      camera.position.z = 8.4;
    }
  }

  function animate() {
    const time = clock.getElapsedTime();
    const speed = prefersReducedMotion ? 0.2 : 1;

    group.rotation.y = time * 0.17 * speed + pointer.x * 0.18;
    group.rotation.x = Math.sin(time * 0.24) * 0.09 - pointer.y * 0.08;
    core.rotation.x = time * 0.28 * speed;
    core.rotation.z = time * 0.2 * speed;
    shell.rotation.y = -time * 0.12 * speed;
    shell.rotation.z = time * 0.08 * speed;
    floor.position.x = 1.45 + Math.sin(time * 0.28) * 0.22;
    particles.rotation.y = time * 0.025 * speed;

    shards.forEach((shard, index) => {
      shard.rotation.y += 0.003 * speed + shard.userData.spin * 0.0008;
      shard.position.y += Math.sin(time * 0.8 + index) * 0.0008 * speed;
    });

    camera.position.x += (pointer.x * 0.26 - camera.position.x) * 0.035;
    camera.position.y += (-pointer.y * 0.16 + 0.45 - camera.position.y) * 0.035;
    camera.lookAt(0.45, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();
}

function initCanvasFallback() {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let frame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function project(point, angle, scale) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = point.x * cos - point.z * sin;
    const z = point.x * sin + point.z * cos;
    const depth = 5 / (5 + z);

    return {
      x: width * 0.62 + x * scale * depth + pointer.x * 24,
      y: height * 0.48 + point.y * scale * depth - pointer.y * 18,
    };
  }

  function drawBox(cx, cy, cz, sx, sy, sz, angle, color) {
    const points = [
      { x: cx - sx, y: cy - sy, z: cz - sz },
      { x: cx + sx, y: cy - sy, z: cz - sz },
      { x: cx + sx, y: cy + sy, z: cz - sz },
      { x: cx - sx, y: cy + sy, z: cz - sz },
      { x: cx - sx, y: cy - sy, z: cz + sz },
      { x: cx + sx, y: cy - sy, z: cz + sz },
      { x: cx + sx, y: cy + sy, z: cz + sz },
      { x: cx - sx, y: cy + sy, z: cz + sz },
    ].map((point) => project(point, angle, Math.min(width, height) * 0.16));

    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];

    context.strokeStyle = color;
    context.lineWidth = 1.4;
    context.beginPath();
    edges.forEach(([a, b]) => {
      context.moveTo(points[a].x, points[a].y);
      context.lineTo(points[b].x, points[b].y);
    });
    context.stroke();
  }

  function animateFallback() {
    frame += prefersReducedMotion ? 0.004 : 0.012;
    context.clearRect(0, 0, width, height);

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#080909");
    background.addColorStop(0.45, "#101312");
    background.addColorStop(1, "#160c0a");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < 36; i += 1) {
      const x = ((i * 107 + frame * 800) % (width + 160)) - 80;
      const y = ((i * 61) % (height + 120)) - 60;
      context.fillStyle = i % 3 === 0 ? "#44d7c7" : i % 3 === 1 ? "#ff725f" : "#f0b64a";
      context.globalAlpha = 0.18;
      context.fillRect(x, y, 2, 2);
    }
    context.globalAlpha = 1;

    drawBox(0, 0, 0, 1.2, 1.2, 1.2, frame, "rgba(68, 215, 199, 0.66)");
    drawBox(0, 0, 0, 1.85, 0.72, 1.85, -frame * 0.7, "rgba(247, 241, 228, 0.42)");
    drawBox(0, 0, 0, 0.58, 2.1, 0.58, frame * 0.9, "rgba(255, 114, 95, 0.58)");

    requestAnimationFrame(animateFallback);
  }

  window.addEventListener("resize", resize);
  document.body.dataset.scene = "fallback";
  window.__sceneStatus = "fallback-ready";
  resize();
  animateFallback();
}

function initInterface() {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${
        x * 7
      }deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

initInterface();
startScene();
