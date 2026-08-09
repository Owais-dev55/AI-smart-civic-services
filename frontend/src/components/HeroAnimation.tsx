"use client";

import React, { useState, useEffect, useRef } from "react";

interface CityTelemetry {
  id: string;
  city: string;
  region: string;
  complaint: string;
  category: string;
  dept: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  visionScore: number;
  status: string;
  coords: { x: number; y: number };
}

const CITY_FEEDS: CityTelemetry[] = [
  {
    id: "ISB-402",
    city: "Islamabad",
    region: "Sector F-10/2",
    complaint: "Gas pressure dropped to zero during morning peak hours",
    category: "Gas Supply & Loadshedding",
    dept: "Sui Northern Gas Pipelines (SNGPL)",
    priority: "High",
    confidence: 99.2,
    visionScore: 8.5,
    status: "Auto-Routed & Dispatched",
    coords: { x: 55, y: 32 },
  },
  {
    id: "KHI-819",
    city: "Karachi",
    region: "Gulshan-e-Iqbal Block 7",
    complaint: "Transformer sparking with snapped high-tension live wire",
    category: "Electricity & Power Outage",
    dept: "K-Electric Rapid Emergency Cell",
    priority: "Critical",
    confidence: 99.6,
    visionScore: 9.8,
    status: "Urgent Dispatch Initiated",
    coords: { x: 42, y: 78 },
  },
  {
    id: "LHE-311",
    city: "Lahore",
    region: "Model Town Link Road",
    complaint: "Main WASA supply line burst flooding commercial area",
    category: "Water Supply & Leakage",
    dept: "Water & Sanitation Agency (WASA)",
    priority: "High",
    confidence: 98.7,
    visionScore: 9.1,
    status: "Maintenance Unit Enroute",
    coords: { x: 62, y: 46 },
  },
  {
    id: "RWP-194",
    city: "Rawalpindi",
    region: "Satellite Town Commercial",
    complaint: "Deep open trench hazard left unbarricaded after road work",
    category: "Roads & Infrastructure",
    dept: "Rawalpindi Development Authority (RDA)",
    priority: "High",
    confidence: 97.9,
    visionScore: 8.9,
    status: "Field Inspector Assigned",
    coords: { x: 54, y: 35 },
  },
  {
    id: "PEW-604",
    city: "Peshawar",
    region: "University Road Saddar",
    complaint: "Solid waste dumpster overflowing onto pedestrian footpath",
    category: "Waste & Sanitation",
    dept: "Water & Sanitation Services Peshawar (WSSP)",
    priority: "Medium",
    confidence: 98.4,
    visionScore: 7.6,
    status: "Scheduled for Pickup",
    coords: { x: 48, y: 26 },
  },
  {
    id: "QTA-228",
    city: "Quetta",
    region: "Jinnah Town / Cantt",
    complaint: "Sewerage manhole overflowing and blocking school entrance",
    category: "Drainage & Sewerage",
    dept: "Quetta Water & Sanitation Authority (Q-WASA)",
    priority: "Critical",
    confidence: 99.1,
    visionScore: 9.4,
    status: "Suction Truck Dispatched",
    coords: { x: 32, y: 55 },
  },
];

export default function HeroAnimation() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCity = CITY_FEEDS[activeIdx];

  // Detect touch device to disable heavy mouse tilt on phones
  useEffect(() => {
    if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      setIsTouchDevice(true);
    }
  }, []);

  // Auto-cycle through city feeds every 4s if not hovering
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % CITY_FEEDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  // 3D Tilt on mouse move (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 6), y: x * 6 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Canvas dynamic particle and holographic radar animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    let pulsePhase = 0;

    const particles = Array.from({ length: 24 }, () => ({
      x: Math.random() * 400,
      y: Math.random() * 400,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.45 + 0.15,
    }));

    const render = () => {
      if (!canvas) return;
      const w = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1));
      const h = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1));
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      const cw = w / (window.devicePixelRatio || 1);
      const ch = h / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, cw, ch);

      const centerX = cw / 2;
      const centerY = ch / 2;

      // 1. Concentric Holographic Radar Rings
      [0.22, 0.42, 0.65, 0.88].forEach((ratio, idx) => {
        const r = (Math.min(cw, ch) / 2) * ratio;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? "rgba(17,17,17,0.1)" : "rgba(17,17,17,0.04)";
        ctx.lineWidth = idx === 1 ? 1.5 : 1;
        if (idx % 2 === 1) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 2. Rotating Radar Sweep Beam
      angle += 0.014;
      const maxR = Math.min(cw, ch) * 0.44;
      const sweepX = centerX + Math.cos(angle) * maxR;
      const sweepY = centerY + Math.sin(angle) * maxR;

      const grad = ctx.createLinearGradient(centerX, centerY, sweepX, sweepY);
      grad.addColorStop(0, "rgba(34,197,94,0.12)");
      grad.addColorStop(1, "rgba(34,197,94,0)");

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxR, angle - 0.35, angle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // 3. Grid Axis lines
      ctx.strokeStyle = "rgba(17,17,17,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, 15);
      ctx.lineTo(centerX, ch - 15);
      ctx.moveTo(15, centerY);
      ctx.lineTo(cw - 15, centerY);
      ctx.stroke();

      // 4. Connecting Data Stream Lines between City nodes
      pulsePhase += 0.03;
      CITY_FEEDS.forEach((c1, i) => {
        const p1x = (c1.coords.x / 100) * cw;
        const p1y = (c1.coords.y / 100) * ch;

        CITY_FEEDS.forEach((c2, j) => {
          if (j <= i) return;
          const p2x = (c2.coords.x / 100) * cw;
          const p2y = (c2.coords.y / 100) * ch;
          const dist = Math.hypot(p1x - p2x, p1y - p2y);

          if (dist < cw * 0.55) {
            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.strokeStyle =
              i === activeIdx || j === activeIdx
                ? "rgba(34,197,94,0.3)"
                : "rgba(17,17,17,0.05)";
            ctx.lineWidth = i === activeIdx || j === activeIdx ? 1.5 : 1;
            ctx.stroke();

            // Animated travelling data pulse packet
            if (i === activeIdx || j === activeIdx) {
              const t = (Math.sin(pulsePhase + i) + 1) / 2;
              const packetX = p1x + (p2x - p1x) * t;
              const packetY = p1y + (p2y - p1y) * t;
              ctx.beginPath();
              ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = "#22C55E";
              ctx.fill();
            }
          }
        });
      });

      // 5. Floating Ambient Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cw;
        if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch;
        if (p.y > ch) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(17,17,17,${p.alpha * 0.35})`;
        ctx.fill();
      });

      // 6. Draw City Pin Nodes on Canvas
      CITY_FEEDS.forEach((c, idx) => {
        const px = (c.coords.x / 100) * cw;
        const py = (c.coords.y / 100) * ch;
        const isActive = idx === activeIdx;

        // Expanding radar pulse for active city
        if (isActive) {
          const pulseR = 7 + (Math.sin(pulsePhase * 2) + 1) * 5;
          ctx.beginPath();
          ctx.arc(px, py, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(34,197,94,0.45)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Pin core
        ctx.beginPath();
        ctx.arc(px, py, isActive ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "#22C55E" : "#111111";
        ctx.fill();

        // City Label text on radar
        ctx.font = `${isActive ? "bold 10px" : "9px"} Inter, system-ui, sans-serif`;
        ctx.fillStyle = isActive ? "#111111" : "#888888";
        ctx.fillText(c.city, px + 7, py + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeIdx]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="hero-anim-box"
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "18px",
        background: "linear-gradient(145deg, #FFFFFF 0%, #F5F5F3 100%)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.07), 0 2px 10px rgba(0,0,0,0.02)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transform: isTouchDevice ? "none" : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
      }}
    >
      <style>{`
        .hero-anim-box {
          height: 460px;
          padding: 18px;
        }
        .hero-stat-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 6px;
        }
        .hero-badge-center {
          width: 64px;
          height: 64px;
          margin: 6px 0;
        }
        .hero-badge-inner {
          width: 42px;
          height: 42px;
          font-size: 1rem;
        }

        @media (max-width: 1024px) {
          .hero-anim-box { height: 430px; padding: 16px; }
        }

        @media (max-width: 768px) {
          .hero-anim-box { height: auto; min-height: 400px; padding: 14px; }
          .hero-badge-center { width: 52px; height: 52px; margin: 4px 0; }
          .hero-badge-inner { width: 36px; height: 36px; font-size: 0.9rem; }
        }

        @media (max-width: 480px) {
          .hero-anim-box { padding: 12px; }
          .hero-stat-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
          .hero-stat-grid > div:last-child { grid-column: span 2; display: flex; justify-content: space-between; align-items: center; }
        }
      `}</style>

      {/* Background Interactive Radar Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Top Header Bar inside 3D Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "10px",
          padding: "8px 12px",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              boxShadow: "0 0 8px #22C55E",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111111", letterSpacing: "-0.01em" }}>
            Live Municipal Telemetry
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.65rem", color: "#888888", fontWeight: 600, fontFamily: "monospace" }}>
            ⚡ 12.4ms Ingest
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              color: "#22C55E",
              background: "rgba(34,197,94,0.1)",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            ACTIVE
          </span>
        </div>
      </div>

      {/* City Switcher Tabs */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          gap: 5,
          overflowX: "auto",
          padding: "6px 0",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {CITY_FEEDS.map((c, idx) => {
          const selected = idx === activeIdx;
          return (
            <button
              key={c.id}
              onClick={() => setActiveIdx(idx)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 9px",
                borderRadius: "99px",
                border: `1px solid ${selected ? "#111111" : "rgba(0,0,0,0.08)"}`,
                background: selected ? "#111111" : "rgba(255,255,255,0.85)",
                color: selected ? "#FFFFFF" : "#555555",
                fontSize: "0.6875rem",
                fontWeight: selected ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.12s ease",
                boxShadow: selected ? "0 2px 6px rgba(0,0,0,0.1)" : "none",
                minHeight: "28px",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: selected ? "#22C55E" : "#AAAAAA",
                  flexShrink: 0,
                }}
              />
              {c.city}
            </button>
          );
        })}
      </div>

      {/* Center Animated Holographic Node Pulse Badge */}
      <div
        className="hero-badge-center"
        style={{
          position: "relative",
          zIndex: 5,
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "1px dashed rgba(34,197,94,0.35)",
            animation: "spin 14s linear infinite",
          }}
        />
        <div
          className="hero-badge-inner"
          style={{
            borderRadius: "50%",
            background: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontWeight: 800,
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
          }}
        >
          A
        </div>
      </div>

      {/* Bottom Live AI Triage Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "12px",
          padding: "12px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        }}
      >
        {/* Card Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.68rem", fontWeight: 700, color: "#111111" }}>
              #{activeCity.id}
            </span>
            <span style={{ fontSize: "0.68rem", color: "#888888" }}>· {activeCity.region}</span>
          </div>
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "4px",
              background:
                activeCity.priority === "Critical"
                  ? "#FEE2E2"
                  : activeCity.priority === "High"
                  ? "#FFEDD5"
                  : "#FEF3C7",
              color:
                activeCity.priority === "Critical"
                  ? "#DC2626"
                  : activeCity.priority === "High"
                  ? "#EA580C"
                  : "#D97706",
            }}
          >
            {activeCity.priority}
          </span>
        </div>

        {/* Complaint Text */}
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#222222",
            lineHeight: 1.35,
            marginBottom: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          "{activeCity.complaint}"
        </div>

        {/* AI Inference Stats Bar */}
        <div
          className="hero-stat-grid"
          style={{
            padding: "6px 8px",
            background: "#F9F9F8",
            borderRadius: "7px",
            border: "1px solid rgba(0,0,0,0.04)",
            marginBottom: 7,
          }}
        >
          <div>
            <div style={{ fontSize: "0.55rem", color: "#888888", textTransform: "uppercase", fontWeight: 700 }}>
              Category
            </div>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeCity.category}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.55rem", color: "#888888", textTransform: "uppercase", fontWeight: 700 }}>
              Confidence
            </div>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#22C55E", fontFamily: "monospace" }}>
              {activeCity.confidence}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.55rem", color: "#888888", textTransform: "uppercase", fontWeight: 700 }}>
              Vision Defect
            </div>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#111111", fontFamily: "monospace" }}>
              {activeCity.visionScore}/10
            </div>
          </div>
        </div>

        {/* Routed Department Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.65rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#555555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
            <span style={{ color: "#22C55E", fontWeight: 700 }}>→</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeCity.dept}</span>
          </div>
          <span style={{ fontSize: "0.62rem", color: "#44AA66", fontWeight: 700 }}>
            {activeCity.status}
          </span>
        </div>
      </div>
    </div>
  );
}
