/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
(function () {
  const cur = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  let mx = innerWidth / 2, my = innerHeight / 2;
  let cx = mx, cy = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });

  (function loop() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll("[data-cursor], a, .btn").forEach((el) => {
    el.addEventListener("mouseenter", () => cur.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cur.classList.remove("is-hover"));
  });
})();

/* ============================================================
   2. THREE.JS — abstract shader object + particles
   ============================================================ */
let pointer = { x: 0, y: 0, tx: 0, ty: 0 };

(function initThree() {
  const mount = document.getElementById("webgl");
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  /* --- Simplex noise (Ashima) injected into shaders --- */
  const noiseGLSL = `
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }`;

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uC1: { value: new THREE.Color("#6d5cff") },
    uC2: { value: new THREE.Color("#00e5ff") },
    uC3: { value: new THREE.Color("#ff4d9d") },
  };

  /* --- Main displaced blob --- */
  const geo = new THREE.IcosahedronGeometry(1.6, 64);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      uniform float uTime; uniform vec2 uMouse;
      varying vec3 vNormal; varying float vDisp; varying vec3 vView;
      ${noiseGLSL}
      void main(){
        vec3 pos = position;
        float t = uTime * 0.35;
        float n = snoise(pos * 1.1 + vec3(t));
        float n2 = snoise(pos * 2.4 - vec3(t * 0.6));
        float disp = n * 0.45 + n2 * 0.18;
        // mouse pushes the surface
        float m = (uMouse.x + uMouse.y) * 0.25;
        disp += sin(pos.y * 3.0 + uTime) * 0.06 * (1.0 + m);
        vDisp = disp;
        vec3 newPos = pos + normal * disp;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(newPos, 1.0);
        vView = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform float uTime;
      varying vec3 vNormal; varying float vDisp; varying vec3 vView;
      void main(){
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vView);
        float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);
        float mix1 = smoothstep(-0.4, 0.5, vDisp);
        vec3 base = mix(uC1, uC3, mix1);
        base = mix(base, uC2, fres);
        // inner darkness for depth
        base *= 0.35 + fres * 1.4 + smoothstep(0.0, 0.5, vDisp) * 0.4;
        gl_FragColor = vec4(base, 1.0);
      }`,
  });
  const blob = new THREE.Mesh(geo, mat);
  scene.add(blob);

  /* --- Wireframe halo --- */
  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.45, 2),
    new THREE.MeshBasicMaterial({ color: 0x6d5cff, wireframe: true, transparent: true, opacity: 0.12 })
  );
  scene.add(wire);

  /* --- Particle field --- */
  const pCount = 900;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 4 + Math.random() * 7;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pPos[i * 3 + 2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.55, sizeAttenuation: true })
  );
  scene.add(particles);

  /* --- pointer tracking --- */
  window.addEventListener("mousemove", (e) => {
    pointer.tx = (e.clientX / innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / innerHeight) * 2 - 1);
  });

  const clock = new THREE.Clock();
  function render() {
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(pointer.x, pointer.y);

    // slow base rotation + mouse parallax
    blob.rotation.y = t * 0.15 + pointer.x * 0.5;
    blob.rotation.x = t * 0.08 + pointer.y * 0.4;
    wire.rotation.y = -t * 0.06;
    wire.rotation.z = t * 0.04;
    particles.rotation.y = t * 0.02;

    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 0.6 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  // expose blob scale target for scroll
  window.__blob = blob;
  window.__wire = wire;

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();

/* ============================================================
   3. LOADER → reveal sequence
   ============================================================ */
window.addEventListener("load", () => {
  const num = document.getElementById("loaderNum");
  const bar = document.getElementById("loaderBar");
  const loader = document.getElementById("loader");
  const counter = { v: 0 };

  gsap.to(counter, {
    v: 100, duration: 2.2, ease: "power2.inOut",
    onUpdate: () => {
      num.textContent = Math.round(counter.v);
      bar.style.width = counter.v + "%";
    },
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -100, duration: 1, ease: "power4.inOut",
        onComplete: () => { loader.style.display = "none"; },
      });
      heroIntro();
    },
  });
});

/* ============================================================
   4. GSAP scroll & intro animations
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.from("[data-hero]", { yPercent: 110, duration: 1.1, stagger: 0.12 })
    .from("[data-hero-fade]", { opacity: 0, y: 24, duration: 0.9, stagger: 0.15 }, "-=0.6")
    .from("nav", { opacity: 0, y: -20, duration: 0.8 }, "-=0.9");
}

window.addEventListener("load", () => {
  // generic reveal
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 88%" },
      y: 60, opacity: 0, duration: 1, ease: "power3.out",
    });
  });

  // manifesto word-by-word
  if (window.SplitText) {
    const split = new SplitText("#manifestoText", { type: "words" });
    gsap.set(split.words, { opacity: 0.12 });
    gsap.to(split.words, {
      opacity: 1, stagger: 0.06, ease: "none",
      scrollTrigger: { trigger: "#manifestoText", start: "top 80%", end: "bottom 55%", scrub: true },
    });
  }

  // marquee scroll-velocity drift
  const track = document.querySelector(".marquee-track");
  let mxp = 0;
  gsap.ticker.add(() => { mxp -= 0.6; if (mxp < -track.offsetWidth / 2) mxp = 0; track.style.transform = `translateX(${mxp}px)`; });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onUpdate: (self) => { gsap.to(track, { skewX: self.getVelocity() / -300, duration: 0.4, overwrite: true }); },
  });

  // counters
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const suf = el.dataset.suffix || "";
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }),
    });
  });

  // hero pin / blob scale on scroll
  ScrollTrigger.create({
    trigger: "#hero", start: "top top", end: "bottom top", scrub: 1,
    onUpdate: (self) => {
      if (window.__blob) {
        const s = 1 - self.progress * 0.45;
        window.__blob.scale.setScalar(s);
        if (window.__wire) window.__wire.scale.setScalar(s);
      }
    },
  });
  gsap.to(".hero-title", {
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    yPercent: 40, opacity: 0.2, ease: "none",
  });

  // cards subtle 3D tilt on hover
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" }));
  });
});

/* smooth anchor scroll */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth" }); }
  });
});
