"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const services = [
  {
    index: "01",
    title: "Immersive launch",
    copy: "A cinematic product story, responsive 3D art direction and a conversion path engineered to feel inevitable.",
    meta: "Strategy · Design · Build",
  },
  {
    index: "02",
    title: "AI brand world",
    copy: "A living visual system with generative assets, motion rules and a distinct digital behavior your competitors cannot copy.",
    meta: "Identity · Art · Motion",
  },
  {
    index: "03",
    title: "Conversion lab",
    copy: "Focused experiments that turn attention into action—new narratives, launch mechanics and high-intent interactions.",
    meta: "Prototype · Test · Scale",
  },
];

const packages = [
  {
    name: "Signal",
    label: "Launch page",
    price: "$12k",
    time: "14 days",
    detail: "For one sharp offer that needs to land now.",
  },
  {
    name: "Bloom",
    label: "Flagship experience",
    price: "$24k",
    time: "21 days",
    detail: "For a brand-defining release with motion and 3D depth.",
  },
  {
    name: "Orbit",
    label: "Digital universe",
    price: "$42k+",
    time: "5–7 weeks",
    detail: "For multi-page products, campaigns and evolving systems.",
  },
];

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [labMode, setLabMode] = useState<"bloom" | "orbit" | "signal">("bloom");
  const [packageIndex, setPackageIndex] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const root = pageRef.current;
    const story = storyRef.current;
    if (!root) return;

    let ticking = false;
    const updateScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      root.style.setProperty("--page-progress", String(window.scrollY / max));

      if (story) {
        const rect = story.getBoundingClientRect();
        const distance = Math.max(1, rect.height - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / distance));
        root.style.setProperty("--scene-progress", String(progress));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScroll);
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      root.style.setProperty("--pointer-x", x.toFixed(3));
      root.style.setProperty("--pointer-y", y.toFixed(3));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );

    root.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
    };
  }, []);

  const toggleMotion = () => {
    const next = !motionPaused;
    setMotionPaused(next);
    if (next) videoRef.current?.pause();
    else void videoRef.current?.play();
  };

  const handleBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const selectedPackage = packages[packageIndex];

  return (
    <div
      className={motionPaused ? "site motion-paused" : "site"}
      data-lab-mode={labMode}
      ref={pageRef}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="scroll-progress" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="SYNKRA home">
          <span className="brand-mark" aria-hidden="true" />
          SYNKRA
        </a>
        <nav className="nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
        </nav>
        <a className="header-cta" href="#start">
          Start a project <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">AI-native digital studio / Worldwide</p>
            <h1 id="hero-title">
              <span>We make digital</span>
              <span className="alive">feel alive</span>
            </h1>
            <div className="hero-bottom">
              <p className="hero-intro">
                We create immersive, <strong>AI-powered web experiences</strong> that turn curious visitors into believers—from first concept to launch in 21 days.
              </p>
              <div className="hero-actions">
                <a className="button button-primary magnetic" href="#start">
                  Start a project <span aria-hidden="true">↗</span>
                </a>
                <a className="button" href="#lab">
                  Enter the lab
                </a>
              </div>
            </div>
          </div>

          <div className="visual-stage" aria-hidden="true">
            <span className="visual-index">Generative object / 01</span>
            <div className="bloom">
              {Array.from({ length: 8 }, (_, index) => (
                <span className="petal" key={index} />
              ))}
              <span className="orb" />
              <span className="orbit" />
            </div>
            <div className="visual-caption">
              <div className="caption-top">
                <span>Live render</span>
                <span>01:24</span>
              </div>
              <strong>Obsidian Bloom</strong>
              <small>AI form study / responsive</small>
            </div>
            <span className="vertical-ticker">MAKE IT MOVE</span>
          </div>

          <button
            className="motion-toggle"
            type="button"
            aria-label={motionPaused ? "Resume ambient motion" : "Pause ambient motion"}
            aria-pressed={motionPaused}
            onClick={toggleMotion}
          >
            <span aria-hidden="true">{motionPaused ? "▶" : "Ⅱ"}</span>
          </button>

          <div className="hero-proof" aria-label="Studio highlights">
            <div className="metric">
              <span>From brief to live</span>
              <strong><em>21</em> days</strong>
            </div>
            <div className="metric">
              <span>Designed for</span>
              <strong><em>3×</em> attention</strong>
            </div>
            <div className="metric">
              <span>Small by design</span>
              <strong><em>01</em> senior team</strong>
            </div>
            <a className="proof-cta" href="#start">
              <span>Have an impossible idea?</span>
              <strong>Make it feel inevitable.</strong>
              <b aria-hidden="true">↗</b>
            </a>
          </div>
        </section>

        <section className="motion-story" id="lab" ref={storyRef} aria-labelledby="motion-title">
          <div className="sticky-scene">
            <div className="story-heading reveal">
              <p className="section-kicker">Motion with a job to do</p>
              <h2 id="motion-title">Every scroll earns the next second.</h2>
            </div>

            <div className="story-note story-note-one">
              <span>01 / Attention</span>
              <p>A living visual interrupts autopilot and gives the story a pulse.</p>
            </div>
            <div className="story-note story-note-two">
              <span>02 / Direction</span>
              <p>The object moves with intent, guiding the eye toward the offer.</p>
            </div>

            <div className="video-shell">
              <video
                ref={videoRef}
                className="motion-video"
                src="/synkra-motion.mp4"
                autoPlay
                muted
                loop
                playsInline
                aria-label="Abstract lime fractal flowing through a dark field"
              />
              <div className="video-chrome" aria-hidden="true">
                <span>LIVE / SYNKRA.MOTION</span>
                <span>SCROLL DRIVEN</span>
              </div>
              <div className="video-reticle" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="lab" aria-labelledby="lab-title">
          <div className="section-heading reveal">
            <p className="section-kicker">Interactive art lab / 02</p>
            <h2 id="lab-title">Touch the system.<br />Change its behavior.</h2>
          </div>
          <div className="lab-layout reveal">
            <div className="lab-controls" role="group" aria-label="Choose an art behavior">
              {(["bloom", "orbit", "signal"] as const).map((mode, index) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={labMode === mode}
                  onClick={() => setLabMode(mode)}
                >
                  <span>0{index + 1}</span>
                  <strong>{mode}</strong>
                  <b aria-hidden="true">↗</b>
                </button>
              ))}
            </div>
            <div className="lab-canvas" aria-live="polite">
              <p className="sr-only">Current art mode: {labMode}</p>
              <div className="lab-aura" aria-hidden="true" />
              <div className="lab-object" aria-hidden="true">
                <span /><span /><span /><span /><i />
              </div>
              <div className="lab-readout" aria-hidden="true">
                <span>MODE / {labMode.toUpperCase()}</span>
                <span>RESPONSE / REALTIME</span>
              </div>
            </div>
          </div>
        </section>

        <section className="services" id="services" aria-labelledby="services-title">
          <div className="section-heading reveal">
            <p className="section-kicker">What we make</p>
            <h2 id="services-title">One bold team.<br />No handoff fog.</h2>
          </div>
          <div className="service-list">
            {services.map((service) => (
              <article className="service-card reveal" key={service.index}>
                <span>{service.index}</span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <small>{service.meta}</small>
                <b aria-hidden="true">↗</b>
              </article>
            ))}
          </div>
        </section>

        <section className="work" id="work" aria-labelledby="work-title">
          <div className="work-head reveal">
            <div>
              <p className="section-kicker">Studio experiments / Selected</p>
              <h2 id="work-title">Proof of feeling.</h2>
            </div>
            <p>Three self-initiated prototypes that show how we turn complex ideas into clear, desirable digital worlds.</p>
          </div>
          <div className="work-grid">
            <article className="project project-aurora reveal">
              <div className="project-art" aria-hidden="true">
                <span className="portal" />
                <span className="project-word">AURA</span>
              </div>
              <div className="project-meta"><span>AI wellness system</span><span>Brand world / Web</span></div>
              <h3>Aura remembers how you want to feel.</h3>
            </article>
            <article className="project project-mono reveal">
              <div className="project-art" aria-hidden="true">
                <span className="mono-sphere" />
                <span className="project-word">N / 01</span>
              </div>
              <div className="project-meta"><span>New material lab</span><span>Story / Motion</span></div>
              <h3>A material launch you can almost touch.</h3>
            </article>
          </div>
        </section>

        <section className="process" id="process" aria-labelledby="process-title">
          <div className="process-intro reveal">
            <p className="section-kicker">The 21-day sprint</p>
            <h2 id="process-title">Fast enough to stay electric.</h2>
            <p>We protect momentum with one senior team, three decisive phases and a live prototype from week one.</p>
          </div>
          <ol className="timeline reveal">
            <li><span>Days 01–04</span><strong>Find the signal</strong><p>Positioning, audience tension and the one idea everything follows.</p></li>
            <li><span>Days 05–12</span><strong>Build the world</strong><p>Art direction, interface, motion language and a working prototype.</p></li>
            <li><span>Days 13–21</span><strong>Make it real</strong><p>Production build, responsive polish, launch checks and handoff.</p></li>
          </ol>
        </section>

        <section className="estimator" aria-labelledby="estimator-title">
          <div className="estimator-head reveal">
            <p className="section-kicker">Pick your ambition</p>
            <h2 id="estimator-title">Start with a shape.<br />We’ll make it yours.</h2>
          </div>
          <div className="estimator-panel reveal">
            <div className="package-tabs" role="tablist" aria-label="Project packages">
              {packages.map((item, index) => (
                <button
                  role="tab"
                  aria-selected={packageIndex === index}
                  key={item.name}
                  onClick={() => setPackageIndex(index)}
                  type="button"
                >
                  <span>0{index + 1}</span>{item.name}
                </button>
              ))}
            </div>
            <div className="package-result" role="tabpanel">
              <span>{selectedPackage.label}</span>
              <strong>{selectedPackage.price}</strong>
              <p>{selectedPackage.detail}</p>
              <small>Typical launch / {selectedPackage.time}</small>
              <a href="#start">Choose {selectedPackage.name} <b aria-hidden="true">↗</b></a>
            </div>
          </div>
        </section>

        <section className="final-cta" id="start" aria-labelledby="start-title">
          <div className="cta-orbit" aria-hidden="true"><span /><span /></div>
          <div className="cta-copy reveal">
            <p className="section-kicker">Two launch slots open</p>
            <h2 id="start-title">Bring the impossible idea.</h2>
            <p>Tell us where you want to go. We’ll reply with the sharpest first move—not a generic sales deck.</p>
          </div>
          {!submitted ? (
            <form className="brief-form reveal" onSubmit={handleBrief}>
              <label>
                <span>Your email</span>
                <input type="email" name="email" placeholder="you@company.com" required autoComplete="email" />
              </label>
              <label>
                <span>The idea in one line</span>
                <input type="text" name="idea" placeholder="We want to make…" required />
              </label>
              <button className="button button-dark" type="submit">Build my starting point <span aria-hidden="true">↗</span></button>
              <small>No pitch maze. A human reply within two business days.</small>
            </form>
          ) : (
            <div className="brief-success" role="status">
              <span>Brief unlocked / 01</span>
              <h3>Your idea has a starting point.</h3>
              <p>Send the intro and SYNKRA will turn it into a focused first conversation.</p>
              <a className="button button-dark" href={`mailto:hello@synkra.studio?subject=${encodeURIComponent(`New ${selectedPackage.name} project`)}`}>
                Open intro email <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#top" aria-label="Back to top"><span className="brand-mark" aria-hidden="true" />SYNKRA</a>
        <p>Independent AI-native studio / Built for memorable launches.</p>
        <div><a href="mailto:hello@synkra.studio">Email</a><a href="#top">Back to top ↑</a></div>
      </footer>
    </div>
  );
}
