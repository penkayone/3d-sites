"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const services = [
  {
    number: "01",
    title: "Launch experiences",
    text: "A clear product story, premium interaction design and a production-ready build in one focused sprint.",
    tags: "Strategy · UX · Development",
  },
  {
    number: "02",
    title: "Digital brand worlds",
    text: "A visual and motion system that gives your product a recognisable behaviour—not just another visual skin.",
    tags: "Art direction · Motion · Systems",
  },
  {
    number: "03",
    title: "AI product narratives",
    text: "Complex AI becomes tangible through interactive demos, guided stories and interfaces people understand quickly.",
    tags: "Prototype · Story · Conversion",
  },
];

const packages = [
  { name: "Signal", price: "$12k", time: "14 days", copy: "A focused launch page for one offer that needs to land now." },
  { name: "Flagship", price: "$24k", time: "21 days", copy: "A brand-defining experience with art direction, motion and build." },
  { name: "Universe", price: "$42k+", time: "5–7 weeks", copy: "A scalable digital world for products, campaigns and new chapters." },
];

type Tone = "cobalt" | "coral" | "mint";

export default function Home() {
  const siteRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const [tone, setTone] = useState<Tone>("cobalt");
  const [motionPaused, setMotionPaused] = useState(false);
  const [packageIndex, setPackageIndex] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const site = siteRef.current;
    const motion = motionRef.current;
    if (!site) return;

    let frame = 0;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      site.style.setProperty("--page-progress", String(window.scrollY / max));

      if (motion) {
        const rect = motion.getBoundingClientRect();
        const distance = Math.max(1, rect.height - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / distance));
        site.style.setProperty("--motion-progress", String(progress));
      }
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onPointer = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      site.style.setProperty("--cursor-x", x.toFixed(3));
      site.style.setProperty("--cursor-y", y.toFixed(3));
    };

    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.14 },
    );

    site.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      revealObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const toggleMotion = () => {
    const paused = !motionPaused;
    setMotionPaused(paused);
    [heroVideoRef.current, storyVideoRef.current].forEach((video) => {
      if (!video) return;
      if (paused) video.pause();
      else void video.play();
    });
  };

  const handleBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const selectedPackage = packages[packageIndex];

  return (
    <div
      className={motionPaused ? "site motion-paused" : "site"}
      data-tone={tone}
      ref={siteRef}
    >
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="page-progress" aria-hidden="true" />

      <header className="header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="SYNKRA home">
            <span className="brand-symbol" aria-hidden="true"><i /><i /></span>
            <span>SYNKRA</span>
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#process">Process</a>
          </nav>
          <a className="nav-cta" href="#contact">
            Start a project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="ambient ambient-one" aria-hidden="true" />
          <div className="ambient ambient-two" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-copy reveal">
              <div className="availability"><span /> Two launch slots open</div>
              <h1 id="hero-title">Digital experiences <em>that move people.</em></h1>
              <p className="hero-lead">SYNKRA is a senior digital studio for ambitious AI and technology launches. We turn complicated products into clear, memorable experiences.</p>
              <div className="hero-actions">
                <a className="button button-solid" href="#contact"><span>Start a project</span><b aria-hidden="true">↗</b></a>
                <a className="text-link" href="#work">See selected work <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero-facts" aria-label="Studio facts">
                <div><strong>21</strong><span>days to flagship launch</span></div>
                <div><strong>01</strong><span>senior team, end to end</span></div>
                <div><strong>∞</strong><span>room for a bold idea</span></div>
              </div>
            </div>

            <div className="hero-media reveal">
              <div className="media-frame">
                <video
                  ref={heroVideoRef}
                  src="/synkra-hero.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Abstract cobalt and coral digital form in motion"
                />
                <div className="media-wash" aria-hidden="true" />
                <div className="media-topline" aria-hidden="true"><span>Generative study / 01</span><span>Live render</span></div>
                <div className="media-title" aria-hidden="true"><span>SYNKRA / MOTION</span><strong>Form follows feeling.</strong></div>
                <div className="media-cursor" aria-hidden="true"><span /></div>
              </div>

              <div className="tone-picker" role="group" aria-label="Choose site accent colour">
                <span>Shift the mood</span>
                {(["cobalt", "coral", "mint"] as Tone[]).map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`tone tone-${item}`}
                    aria-label={`Use ${item} accent`}
                    aria-pressed={tone === item}
                    onClick={() => setTone(item)}
                  />
                ))}
              </div>

              <button
                className="pause-button"
                type="button"
                aria-label={motionPaused ? "Resume motion" : "Pause motion"}
                aria-pressed={motionPaused}
                onClick={toggleMotion}
              >
                <span aria-hidden="true">{motionPaused ? "▶" : "Ⅱ"}</span>
                {motionPaused ? "Play" : "Pause"}
              </button>
            </div>
          </div>
        </section>

        <div className="capability-rail" aria-hidden="true">
          <div>
            <span>Strategy</span><i>✦</i><span>Art direction</span><i>✦</i><span>Motion</span><i>✦</i><span>Development</span><i>✦</i>
            <span>Strategy</span><i>✦</i><span>Art direction</span><i>✦</i><span>Motion</span><i>✦</i><span>Development</span><i>✦</i>
          </div>
        </div>

        <section className="motion-story" ref={motionRef} aria-labelledby="motion-title">
          <div className="motion-sticky">
            <div className="motion-copy reveal">
              <p className="eyebrow">Motion, with restraint</p>
              <h2 id="motion-title">Movement should guide—not interrupt.</h2>
              <p className="section-lead">Every transition has a purpose: focus the eye, reveal the next idea, make the product easier to understand.</p>
              <div className="motion-points">
                <div><span>01</span><p><strong>Attention</strong> without visual noise.</p></div>
                <div><span>02</span><p><strong>Continuity</strong> between sections and states.</p></div>
                <div><span>03</span><p><strong>Clarity</strong> at every screen size.</p></div>
              </div>
            </div>
            <div className="story-media reveal">
              <div className="story-video-wrap">
                <video
                  ref={storyVideoRef}
                  src="/synkra-wave.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Soft cobalt and violet abstract wave animation"
                />
                <div className="story-overlay" aria-hidden="true"><span>Scroll-driven composition</span><strong>00 — 100</strong></div>
              </div>
              <div className="story-progress" aria-hidden="true"><i /><span>Scroll to direct the frame</span></div>
            </div>
          </div>
        </section>

        <section className="work section" id="work" aria-labelledby="work-title">
          <div className="section-head reveal">
            <div><p className="eyebrow">Selected studio experiments</p><h2 id="work-title">Ideas you can almost touch.</h2></div>
            <p>Two self-initiated worlds exploring how motion, atmosphere and product clarity can live together.</p>
          </div>
          <div className="work-grid">
            <article className="project-card reveal">
              <div className="project-media project-media-tall">
                <video src="/synkra-hero.mp4" autoPlay muted loop playsInline aria-label="Aura visual identity motion study" />
                <div className="project-glass"><span>Concept / AI wellbeing</span><b aria-hidden="true">↗</b></div>
              </div>
              <div className="project-copy"><div><span>01 / AURA</span><small>Brand world · Product story</small></div><h3>Technology that feels quietly human.</h3></div>
            </article>
            <article className="project-card project-card-offset reveal">
              <div className="project-media project-media-wide">
                <video src="/synkra-wave.mp4" autoPlay muted loop playsInline aria-label="NOA material research motion study" />
                <div className="project-glass"><span>Concept / New materials</span><b aria-hidden="true">↗</b></div>
              </div>
              <div className="project-copy"><div><span>02 / NOA</span><small>Launch system · Motion</small></div><h3>A material launch with digital gravity.</h3></div>
            </article>
          </div>
        </section>

        <section className="services section" id="services" aria-labelledby="services-title">
          <div className="section-head section-head-dark reveal">
            <div><p className="eyebrow">One team, no handoff fog</p><h2 id="services-title">From sharp idea to shipped experience.</h2></div>
            <p>Strategy, design and build stay in one room. That keeps the work coherent and the launch moving.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card reveal" key={service.number}>
                <div className="service-number"><span>{service.number}</span><b aria-hidden="true">↗</b></div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <small>{service.tags}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="process section" id="process" aria-labelledby="process-title">
          <div className="process-intro reveal">
            <p className="eyebrow">The flagship sprint</p>
            <h2 id="process-title">Three weeks.<br />Three clear decisions.</h2>
            <p>No theatre, no fifty-slide reveal. You see the real experience take shape from the first week.</p>
          </div>
          <ol className="process-list">
            <li className="reveal"><span>Days 01—04</span><strong>Find the signal</strong><p>Positioning, audience tension and the one story everything follows.</p><i>01</i></li>
            <li className="reveal"><span>Days 05—12</span><strong>Build the world</strong><p>Design direction, interaction language and a working prototype.</p><i>02</i></li>
            <li className="reveal"><span>Days 13—21</span><strong>Ship with confidence</strong><p>Production build, responsive refinement and launch support.</p><i>03</i></li>
          </ol>
        </section>

        <section className="packages section" aria-labelledby="packages-title">
          <div className="packages-heading reveal">
            <p className="eyebrow">A clear starting point</p>
            <h2 id="packages-title">Choose the size of the ambition.</h2>
          </div>
          <div className="package-layout reveal">
            <div className="package-tabs" role="tablist" aria-label="Project package">
              {packages.map((item, index) => (
                <button type="button" role="tab" aria-selected={packageIndex === index} onClick={() => setPackageIndex(index)} key={item.name}>
                  <span>0{index + 1}</span><strong>{item.name}</strong><i aria-hidden="true">↗</i>
                </button>
              ))}
            </div>
            <div className="package-result" role="tabpanel">
              <div><span>Typical investment</span><strong>{selectedPackage.price}</strong></div>
              <p>{selectedPackage.copy}</p>
              <div className="package-bottom"><span>Typical timing / {selectedPackage.time}</span><a href="#contact">Start here <b aria-hidden="true">↗</b></a></div>
            </div>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="contact-orb contact-orb-one" aria-hidden="true" />
          <div className="contact-orb contact-orb-two" aria-hidden="true" />
          <div className="contact-inner">
            <div className="contact-copy reveal">
              <p className="eyebrow">Ready when the idea is</p>
              <h2 id="contact-title">Let’s make it impossible to ignore.</h2>
              <p>Share the ambition. We’ll return with the sharpest first move—not a generic sales deck.</p>
            </div>
            {!submitted ? (
              <form className="brief-form reveal" onSubmit={handleBrief}>
                <label><span>Work email</span><input type="email" required autoComplete="email" placeholder="you@company.com" /></label>
                <label><span>The idea in one sentence</span><input type="text" required placeholder="We want to launch…" /></label>
                <button className="button button-solid" type="submit"><span>Build my starting point</span><b aria-hidden="true">↗</b></button>
                <small>A senior reply within two business days.</small>
              </form>
            ) : (
              <div className="brief-success" role="status">
                <span>Starting point unlocked</span>
                <h3>Your idea is ready for a real conversation.</h3>
                <p>Open an introduction email and we’ll take it from there.</p>
                <a className="button button-solid" href={`mailto:hello@synkra.studio?subject=${encodeURIComponent(`New ${selectedPackage.name} project`)}`}><span>Open intro email</span><b aria-hidden="true">↗</b></a>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <a className="brand" href="#top" aria-label="Back to top"><span className="brand-symbol" aria-hidden="true"><i /><i /></span><span>SYNKRA</span></a>
          <p>Independent AI-native digital studio.</p>
          <div><a href="mailto:hello@synkra.studio">Email</a><a href="#top">Back to top ↑</a></div>
        </div>
      </footer>
    </div>
  );
}
