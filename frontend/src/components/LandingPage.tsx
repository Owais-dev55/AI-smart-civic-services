"use client";
import React, { useState, useEffect, useRef } from "react";

interface LandingPageProps { onEnter: () => void; }

function useCounter(target: number, duration = 1800, go = true) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!go) return;
    let n = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      n += step;
      if (n >= target) { setV(target); clearInterval(t); }
      else setV(Math.floor(n));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration, go]);
  return v;
}

function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [hit, setHit] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHit(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, hit };
}

const FEATURES = [
  { label: "Citizen Portal",           desc: "Submit infrastructure, utility and sanitation complaints. Bilingual support in English and Roman Urdu.",               tag: "01" },
  { label: "Gemini AI Assistant",      desc: "Chat with a civic AI trained on Pakistani municipal context. Guides you through filings and follow-ups.",            tag: "02" },
  { label: "Statistical Analytics",   desc: "Live dashboards with IQR outlier detection, complaint trends, heatmaps and resolution time tracking.",               tag: "03" },
  { label: "ML Classification",       desc: "NLP classifier auto-routes complaints to the right department with a confidence-weighted priority score.",            tag: "04" },
  { label: "Admin Command Center",     desc: "Filterable queues, priority badges, AI-generated action notes and real-time status management for officials.",       tag: "05" },
  { label: "AI Image Analysis",        desc: "Upload site photos and let the vision model assess severity, confirm location context and accelerate triage.",       tag: "06" },
];

const STATS = [
  { n: 35,  s: "+",  label: "Complaints",  sub: "Realistic Pakistani seed data" },
  { n: 10,  s: "+",  label: "Categories",  sub: "Auto-classified by NLP"        },
  { n: 99,  s: "%",  label: "Accuracy",    sub: "ML classification rate"        },
  { n: 24,  s: "/7", label: "Availability", sub: "Always-on AI"                 },
];

const TECH = ["Next.js 16", "FastAPI", "Gemini AI", "Scikit-Learn", "Python 3.12", "TypeScript", "SQLite", "Pydantic"];

export function LandingPage({ onEnter }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const statsRef = useInView();
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const c0 = useCounter(35,  1600, statsRef.hit);
  const c1 = useCounter(10,  1400, statsRef.hit);
  const c2 = useCounter(99,  1800, statsRef.hit);
  const c3 = useCounter(24,  1200, statsRef.hit);
  const CV = [c0, c1, c2, c3];

  // Design tokens — exactly matching globals.css
  const BG     = "#FAFAFA";
  const SURF   = "#FFFFFF";
  const DARK   = "#111111";
  const MUTED  = "#888888";
  const SUB    = "#444444";
  const DIM    = "#BBBBBB";
  const BORDER = "rgba(0,0,0,0.08)";
  const BORDM  = "rgba(0,0,0,0.14)";

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: BG, color: DARK, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes in-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      {/* ── NAV ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,250,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Logo — matches sidebar brand style */}
            <div style={{ width: 28, height: 28, background: DARK, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 800, fontSize: 13, letterSpacing: "-0.02em", flexShrink: 0 }}>A</div>
            <span style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.02em", color: DARK }}>AwaamCare AI</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" style={{ fontSize: "0.8125rem", color: MUTED, fontWeight: 500 }}>Features</a>
            <a href="#how"      style={{ fontSize: "0.8125rem", color: MUTED, fontWeight: 500 }}>How it works</a>
            <a href="#tech"     style={{ fontSize: "0.8125rem", color: MUTED, fontWeight: 500 }}>Stack</a>
            <button onClick={onEnter} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: DARK, color: "#FFF", border: "none", borderRadius: 7, fontSize: "0.8125rem", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", letterSpacing: "-0.01em", transition: "background .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#333"; }}
              onMouseLeave={e => { e.currentTarget.style.background = DARK; }}>
              Launch App
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "100px 40px 80px", animation: mounted ? "in-up 0.6s ease both" : "none" }}>
        <div style={{ maxWidth: 760 }}>
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: SURF, border: `1px solid ${BORDM}`, borderRadius: 99, padding: "4px 14px", marginBottom: 32 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#44AA66", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED }}>Pakistan Municipal Intelligence Platform</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.5rem, 5.5vw, 4rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em", color: DARK, marginBottom: 24 }}>
            Civic complaints,<br />resolved with AI.
          </h1>

          <p style={{ fontSize: "clamp(0.9375rem, 1.5vw, 1.0625rem)", color: SUB, maxWidth: 520, lineHeight: 1.65, marginBottom: 40 }}>
            AwaamCare connects Pakistani citizens with municipal authorities through Gemini AI, ML classification and real-time analytics — turning complaints into action.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button id="hero-cta" onClick={onEnter}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: DARK, color: "#FFF", border: "none", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "background .12s, transform .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#222"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = DARK;   e.currentTarget.style.transform = "translateY(0)"; }}>
              Open AwaamCare
              <span style={{ fontSize: "1rem" }}>→</span>
            </button>
            <a href="#features"
              style={{ display: "inline-flex", alignItems: "center", padding: "11px 20px", background: SURF, color: SUB, border: `1px solid ${BORDM}`, borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, transition: "border-color .12s, color .12s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.22)"; e.currentTarget.style.color = DARK; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDM; e.currentTarget.style.color = SUB; }}>
              Explore features
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section ref={statsRef.ref as React.Ref<HTMLElement>} style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: SURF }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ padding: "36px 32px", borderRight: i < 3 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.04em", color: DARK, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{CV[i]}{s.s}</div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: DARK, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: "0.75rem", color: MUTED }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 12 }}>Platform Capabilities</div>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK }}>Everything civic tech needs</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: BORDER, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
          {FEATURES.map(f => <FeatureCell key={f.tag} f={f} surf={SURF} dark={DARK} sub={SUB} muted={MUTED} border={BORDER} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ borderTop: `1px solid ${BORDER}`, background: SURF }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 40px" }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 12 }}>Process</div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: DARK }}>How AwaamCare works</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
            {[
              { n: "01", title: "Submit",   desc: "File a complaint in English or Roman Urdu with optional photo attachment." },
              { n: "02", title: "Classify", desc: "Gemini AI and NLP route the complaint to the correct department instantly." },
              { n: "03", title: "Resolve",  desc: "Admins action prioritised queues and update status in real-time."          },
              { n: "04", title: "Analyse",  desc: "Dashboards track resolution rates, trends and city-wide civic health."     },
            ].map(step => (
              <div key={step.n}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DIM, marginBottom: 14 }}>{step.n}</div>
                <div style={{ width: 32, height: 2, background: DARK, marginBottom: 20 }} />
                <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: DARK, marginBottom: 10, letterSpacing: "-0.02em" }}>{step.title}</div>
                <div style={{ fontSize: "0.8125rem", color: SUB, lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section id="tech" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 40px" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 28 }}>Built With</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TECH.map(t => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", background: SURF, border: `1px solid ${BORDM}`, borderRadius: 99, fontSize: "0.8rem", fontWeight: 500, color: SUB, transition: "border-color .12s, color .12s", cursor: "default" }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLElement; d.style.borderColor = "rgba(0,0,0,0.22)"; d.style.color = DARK; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLElement; d.style.borderColor = BORDM; d.style.color = SUB; }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BLOCK ── */}
      <section style={{ borderTop: `1px solid ${BORDER}`, background: DARK }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 40px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555555", marginBottom: 16 }}>Get Started</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "#FFFFFF", lineHeight: 1.06, maxWidth: 480, marginBottom: 0 }}>
              Your voice matters.<br />Make it heard.
            </h2>
          </div>
          <button id="cta-enter" onClick={onEnter}
            style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "#FFFFFF", color: DARK, border: "none", borderRadius: 8, fontSize: "0.9375rem", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "background .12s, transform .12s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#E8E8E8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Enter AwaamCare <span>→</span>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: DARK, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: "#FFFFFF", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: DARK, flexShrink: 0 }}>A</div>
          <span style={{ fontSize: "0.75rem", color: "#555555", fontWeight: 600 }}>AwaamCare AI — Pakistan Municipal Redressal Platform</span>
        </div>
        <span style={{ fontSize: "0.6875rem", color: "#444444" }}>FastAPI · Next.js · Gemini AI · Scikit-Learn</span>
      </footer>
    </div>
  );
}

interface FeatProps { f: { tag: string; label: string; desc: string }; surf: string; dark: string; sub: string; muted: string; border: string; }
function FeatureCell({ f, surf, dark, sub, muted }: FeatProps) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "32px 28px", background: hov ? "#F4F4F2" : surf, transition: "background .12s", cursor: "default" }}>
      <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: muted, marginBottom: 16 }}>{f.tag}</div>
      <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: dark, marginBottom: 10, letterSpacing: "-0.02em" }}>{f.label}</div>
      <div style={{ fontSize: "0.8125rem", color: sub, lineHeight: 1.65 }}>{f.desc}</div>
    </div>
  );
}
