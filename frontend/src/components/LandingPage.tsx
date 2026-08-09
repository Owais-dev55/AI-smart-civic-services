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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHit(true); }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, hit };
}

const FEATURES = [
  { id: "a", label: "Citizen Portal",          desc: "Submit infrastructure, utility and sanitation complaints in English or Roman Urdu." },
  { id: "b", label: "Gemini AI Assistant",     desc: "Chat with a civic AI trained on Pakistani municipal context. Guides every step."   },
  { id: "c", label: "Statistical Analytics",   desc: "Live dashboards with IQR outlier detection, complaint trends and heatmaps."        },
  { id: "d", label: "ML Classification",       desc: "NLP classifier auto-routes complaints with a confidence-weighted priority score."   },
  { id: "e", label: "Admin Command Center",    desc: "Filterable queues, priority badges and AI-generated action notes for officials."   },
  { id: "f", label: "AI Image Analysis",       desc: "Upload site photos for AI severity assessment and location context verification."   },
];

const STATS = [
  { n: 35,  s: "+",  label: "Complaints",   sub: "Realistic Pakistani seed data" },
  { n: 10,  s: "+",  label: "Categories",   sub: "Auto-classified by NLP"        },
  { n: 99,  s: "%",  label: "Accuracy",     sub: "ML classification rate"        },
  { n: 24,  s: "/7", label: "Availability", sub: "Always-on AI"                 },
];

const TECH  = ["Next.js 16", "FastAPI", "Gemini AI", "Scikit-Learn", "Three.js 3D", "Python 3.12", "TypeScript", "SQLite"];

const STEPS = [
  { n: "01", title: "Submit",   desc: "File a complaint in English or Roman Urdu with optional photo attachment."  },
  { n: "02", title: "Classify", desc: "Gemini AI and NLP route the complaint to the correct department instantly." },
  { n: "03", title: "Resolve",  desc: "Admins action prioritised queues and update status in real-time."           },
  { n: "04", title: "Analyse",  desc: "Dashboards track resolution rates, trends and city-wide civic health."      },
];

export function LandingPage({ onEnter }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const statsRef = useInView();
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const c0 = useCounter(35,  1600, statsRef.hit);
  const c1 = useCounter(10,  1400, statsRef.hit);
  const c2 = useCounter(99,  1800, statsRef.hit);
  const c3 = useCounter(24,  1200, statsRef.hit);
  const CV = [c0, c1, c2, c3];

  const BG    = "#FAFAFA";
  const SURF  = "#FFFFFF";
  const DARK  = "#111111";
  const MUTED = "#888888";
  const SUB   = "#444444";
  const DIM   = "#BBBBBB";
  const BDR   = "rgba(0,0,0,0.08)";
  const BDRM  = "rgba(0,0,0,0.14)";

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: BG, color: DARK, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes lp-in { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        a.lp { text-decoration:none; color:inherit; }

        /* ── Responsive grid helpers ── */
        .lp-hero-grid   { display:grid; grid-template-columns: 1.15fr 0.85fr; gap:36px; align-items:center; }
        .lp-globe-card  { width:100%; height:440px; border-radius:16px; background:${SURF}; border:1px solid ${BDR}; overflow:hidden; position:relative; box-shadow:0 4px 20px rgba(0,0,0,0.04); }
        .lp-stats-grid  { display:grid; grid-template-columns:repeat(4,1fr); }
        .lp-feat-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:${BDR}; }
        .lp-steps-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:40px; }
        .lp-cta-row     { display:flex; align-items:flex-end; justify-content:space-between; gap:40px; flex-wrap:wrap; }
        .lp-nav-links   { display:flex; align-items:center; gap:32px; }
        .lp-hamburger   { display:none; }
        .lp-mobile-menu { display:none; }
        .lp-hero-btns   { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

        @media (max-width: 1024px) {
          .lp-hero-grid   { grid-template-columns: 1fr; gap:32px; }
          .lp-globe-card  { height:380px; }
          .lp-stats-grid  { grid-template-columns:repeat(2,1fr); }
          .lp-feat-grid   { grid-template-columns:repeat(2,1fr); }
          .lp-steps-grid  { grid-template-columns:repeat(2,1fr); gap:32px; }
        }

        @media (max-width: 768px) {
          .lp-nav-links    { display:none; }
          .lp-hamburger    { display:flex; align-items:center; justify-content:center; background:none; border:1px solid ${BDRM}; border-radius:7px; width:36px; height:36px; cursor:pointer; color:${DARK}; font-size:1rem; }
          .lp-mobile-menu  { display:flex; flex-direction:column; gap:2px; padding:12px 24px 16px; border-bottom:1px solid ${BDR}; background:${SURF}; }
          .lp-feat-grid    { grid-template-columns:1fr; }
          .lp-steps-grid   { grid-template-columns:1fr 1fr; gap:28px; }
          .lp-cta-row      { flex-direction:column; align-items:flex-start; gap:28px; }
          .lp-globe-card   { height:320px; }
        }

        @media (max-width: 520px) {
          .lp-stats-grid   { grid-template-columns:repeat(2,1fr); }
          .lp-steps-grid   { grid-template-columns:1fr; gap:24px; }
          .lp-hero-btns    { flex-direction:column; align-items:stretch; }
          .lp-hero-btns button, .lp-hero-btns a { text-align:center; justify-content:center; }
          .lp-globe-card   { height:280px; }
        }
      `}</style>

      {/* ── STICKY NAV ── */}
      <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(250,250,250,0.94)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderBottom:`1px solid ${BDR}` }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, background:DARK, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#FFF", fontWeight:800, fontSize:13, flexShrink:0 }}>A</div>
            <span style={{ fontWeight:700, fontSize:"0.9375rem", letterSpacing:"-0.02em", color:DARK }}>AwaamCare AI</span>
          </div>

          {/* Desktop nav */}
          <nav className="lp-nav-links">
            <a href="#features" className="lp" style={{ fontSize:"0.8125rem", color:MUTED, fontWeight:500 }}>Features</a>
            <a href="#how"      className="lp" style={{ fontSize:"0.8125rem", color:MUTED, fontWeight:500 }}>How it works</a>
            <a href="#tech"     className="lp" style={{ fontSize:"0.8125rem", color:MUTED, fontWeight:500 }}>Stack</a>
            <button onClick={onEnter}
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 16px", background:DARK, color:"#FFF", border:"none", borderRadius:7, fontSize:"0.8125rem", fontWeight:600, fontFamily:"inherit", cursor:"pointer", transition:"background .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#333"; }}
              onMouseLeave={e => { e.currentTarget.style.background=DARK;   }}>
              Launch App
            </button>
          </nav>

          {/* Hamburger */}
          <button className="lp-hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Toggle menu">☰</button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            {["#features","#how","#tech"].map((href, i) => (
              <a key={href} href={href} className="lp"
                style={{ padding:"10px 4px", fontSize:"0.9rem", fontWeight:500, color:SUB, borderBottom:`1px solid ${BDR}` }}
                onClick={() => setMobileMenuOpen(false)}>
                {["Features","How it works","Stack"][i]}
              </a>
            ))}
            <button onClick={() => { setMobileMenuOpen(false); onEnter(); }}
              style={{ marginTop:8, padding:"11px 0", background:DARK, color:"#FFF", border:"none", borderRadius:7, fontSize:"0.875rem", fontWeight:700, fontFamily:"inherit", cursor:"pointer", width:"100%" }}>
              Launch App
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth:1160, margin:"0 auto", padding:"60px 24px 64px", animation: mounted ? "lp-in 0.6s ease both" : "none" }}>
        <div className="lp-hero-grid">
          {/* Left Text */}
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:SURF, border:`1px solid ${BDRM}`, borderRadius:99, padding:"4px 14px", marginBottom:24 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#44AA66", display:"inline-block", flexShrink:0 }} />
              <span style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:MUTED }}>Pakistan Municipal Intelligence Platform</span>
            </div>

            <h1 style={{ fontSize:"clamp(2.2rem, 5vw, 3.75rem)", fontWeight:800, lineHeight:1.08, letterSpacing:"-0.04em", color:DARK, marginBottom:20 }}>
              Civic complaints,<br />resolved with AI.
            </h1>

            <p style={{ fontSize:"clamp(0.875rem, 1.4vw, 1rem)", color:SUB, maxWidth:480, lineHeight:1.7, marginBottom:32 }}>
              AwaamCare connects Pakistani citizens with municipal authorities through Gemini AI, ML classification and real-time analytics — turning complaints into action.
            </p>

            <div className="lp-hero-btns" style={{ marginBottom:28 }}>
              <button id="hero-cta" onClick={onEnter}
                style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 26px", background:DARK, color:"#FFF", border:"none", borderRadius:8, fontSize:"0.9rem", fontWeight:700, fontFamily:"inherit", cursor:"pointer", transition:"background .12s, transform .12s" }}
                onMouseEnter={e => { e.currentTarget.style.background="#222"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background=DARK;   e.currentTarget.style.transform="translateY(0)"; }}>
                Open AwaamCare →
              </button>
              <a href="#features" className="lp"
                style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"12px 20px", background:SURF, color:SUB, border:`1px solid ${BDRM}`, borderRadius:8, fontSize:"0.9rem", fontWeight:600, transition:"border-color .12s, color .12s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,0,0,0.22)"; e.currentTarget.style.color=DARK; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=BDRM; e.currentTarget.style.color=SUB; }}>
                Explore features
              </a>
            </div>

            {/* City badges */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta"].map(city => (
                <span key={city} style={{ fontSize:"0.72rem", color:MUTED, background:"rgba(0,0,0,0.03)", border:`1px solid ${BDR}`, borderRadius:6, padding:"3px 8px", fontWeight:500 }}>
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Right: 3D Interactive Globe */}
         
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef.ref as React.Ref<HTMLElement>} style={{ borderTop:`1px solid ${BDR}`, borderBottom:`1px solid ${BDR}`, background:SURF }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 24px" }}>
          <div className="lp-stats-grid">
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding:"32px 24px", borderRight: i % 2 === 0 ? `1px solid ${BDR}` : "none" }}>
                <div style={{ fontSize:"clamp(1.75rem,4vw,2.25rem)", fontWeight:800, letterSpacing:"-0.04em", color:DARK, lineHeight:1, marginBottom:6, fontVariantNumeric:"tabular-nums" }}>{CV[i]}{s.s}</div>
                <div style={{ fontSize:"0.8125rem", fontWeight:600, color:DARK, marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:"0.75rem", color:MUTED }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth:1160, margin:"0 auto", padding:"64px 24px" }}>
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:MUTED, marginBottom:10 }}>Platform Capabilities</div>
          <h2 style={{ fontSize:"clamp(1.3rem, 3vw, 1.875rem)", fontWeight:800, letterSpacing:"-0.03em", color:DARK }}>Everything civic tech needs</h2>
        </div>
        <div className="lp-feat-grid" style={{ border:`1px solid ${BDR}`, borderRadius:12, overflow:"hidden" }}>
          {FEATURES.map(f => <FeatureCell key={f.id} f={f} surf={SURF} dark={DARK} sub={SUB} muted={MUTED} bdr={BDR} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ borderTop:`1px solid ${BDR}`, background:SURF }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"64px 24px" }}>
          <div style={{ marginBottom:48 }}>
            <div style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:MUTED, marginBottom:10 }}>Process</div>
            <h2 style={{ fontSize:"clamp(1.3rem, 3vw, 1.875rem)", fontWeight:800, letterSpacing:"-0.03em", color:DARK }}>How AwaamCare works</h2>
          </div>
          <div className="lp-steps-grid">
            {STEPS.map(step => (
              <div key={step.n}>
                <div style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:DIM, marginBottom:12 }}>{step.n}</div>
                <div style={{ width:28, height:2, background:DARK, marginBottom:16 }} />
                <div style={{ fontSize:"0.9375rem", fontWeight:700, color:DARK, marginBottom:8, letterSpacing:"-0.02em" }}>{step.title}</div>
                <div style={{ fontSize:"0.8125rem", color:SUB, lineHeight:1.65 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section id="tech" style={{ borderTop:`1px solid ${BDR}` }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"56px 24px" }}>
          <div style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:MUTED, marginBottom:24 }}>Built With</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {TECH.map(t => (
              <span key={t}
                style={{ display:"inline-flex", alignItems:"center", padding:"6px 14px", background:SURF, border:`1px solid ${BDRM}`, borderRadius:99, fontSize:"0.8rem", fontWeight:500, color:SUB, transition:"border-color .12s, color .12s", cursor:"default" }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLElement; d.style.borderColor="rgba(0,0,0,0.22)"; d.style.color=DARK; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLElement; d.style.borderColor=BDRM; d.style.color=SUB; }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BLOCK ── */}
      <section style={{ borderTop:`1px solid ${BDR}`, background:DARK }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"72px 24px" }}>
          <div className="lp-cta-row">
            <div>
              <div style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#555555", marginBottom:16 }}>Get Started</div>
              <h2 style={{ fontSize:"clamp(1.75rem, 4vw, 3rem)", fontWeight:800, letterSpacing:"-0.04em", color:"#FFFFFF", lineHeight:1.08, maxWidth:440 }}>
                Your voice matters.<br />Make it heard.
              </h2>
            </div>
            <button id="cta-enter" onClick={onEnter}
              style={{ flexShrink:0, display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", background:"#FFFFFF", color:DARK, border:"none", borderRadius:8, fontSize:"0.9375rem", fontWeight:700, fontFamily:"inherit", cursor:"pointer", transition:"background .12s, transform .12s", whiteSpace:"nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background="#E8E8E8"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#FFFFFF"; e.currentTarget.style.transform="translateY(0)"; }}>
              Enter AwaamCare →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.07)", background:DARK, padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:22, height:22, background:"#FFFFFF", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:DARK, flexShrink:0 }}>A</div>
          <span style={{ fontSize:"0.75rem", color:"#555555", fontWeight:600 }}>AwaamCare AI — Pakistan Municipal Redressal Platform</span>
        </div>
        <span style={{ fontSize:"0.6875rem", color:"#444444" }}>FastAPI · Next.js · Gemini AI · Scikit-Learn</span>
      </footer>
    </div>
  );
}

interface FP { f: { id: string; label: string; desc: string }; surf: string; dark: string; sub: string; muted: string; bdr: string; }
function FeatureCell({ f, surf, dark, sub, muted }: FP) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"28px 24px", background:hov ? "#F4F4F2" : surf, transition:"background .12s", cursor:"default" }}>
      <div style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:muted, marginBottom:12 }}>
        {["01","02","03","04","05","06"][["a","b","c","d","e","f"].indexOf(f.id)]}
      </div>
      <div style={{ fontSize:"0.9375rem", fontWeight:700, color:dark, marginBottom:8, letterSpacing:"-0.02em" }}>{f.label}</div>
      <div style={{ fontSize:"0.8125rem", color:sub, lineHeight:1.65 }}>{f.desc}</div>
    </div>
  );
}
