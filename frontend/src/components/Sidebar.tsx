"use client";

import React, { useEffect, useState } from "react";
import { CivicAPI } from "@/lib/api";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReset: () => void;
  onGoHome: () => void;
  open?: boolean;
  onClose?: () => void;
}

const NAV = [
  { id: "citizen",    label: "Citizen Portal"        },
  { id: "admin",      label: "Command Center"         },
  { id: "statistics", label: "Statistical Analytics"  },
  { id: "ailab",      label: "AI Explainability Lab"  },
];

export function Sidebar({ activeTab, setActiveTab, onReset, onGoHome, open, onClose }: SidebarProps) {
  const [health, setHealth] = useState<{ total_complaints_stored?: number }>({});
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    CivicAPI.getHealth().then(setHealth).catch(() => {});
  }, []);

  const handleReset = async () => {
    if (!confirm("Reset database to 35 clean Pakistani seed records?")) return;
    setResetting(true);
    try { await onReset(); } finally { setResetting(false); }
  };

  return (
    <aside className={`sidebar${open ? " sidebar--open" : ""}`} style={{ width: "var(--sidebar-w)", minHeight: "100vh", position: "fixed", top: 0, left: 0, display: "flex", flexDirection: "column", background: "#111111" }}>

      {/* Brand — click to go back to landing */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onGoHome}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", flex: 1 }}
          title="Back to Home"
        >
          <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-.02em", marginBottom: 3 }}>
            AwaamCare AI
          </div>
          <div style={{ fontSize: "0.5875rem", color: "#555555", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 }}>
            Municipal Intelligence Platform
          </div>
        </button>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{ background: "none", border: "none", color: "#555555", fontSize: "1.1rem", cursor: "pointer", padding: "4px", lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 10px", flex: 1 }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#444444", padding: "0 10px", marginBottom: 8 }}>
          Modules
        </div>
        {NAV.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                marginBottom: 2,
                textAlign: "left",
                fontSize: "0.8125rem",
                fontWeight: active ? 600 : 400,
                fontFamily: "inherit",
                color: active ? "#FFFFFF" : "#777777",
                background: active ? "rgba(255,255,255,0.09)" : "transparent",
                borderLeft: `2px solid ${active ? "#FFFFFF" : "transparent"}`,
                transition: "all .12s",
              }}
              onMouseEnter={e => { if (!active) { const el = e.currentTarget; el.style.color = "#BBBBBB"; el.style.background = "rgba(255,255,255,0.05)"; }}}
              onMouseLeave={e => { if (!active) { const el = e.currentTarget; el.style.color = "#777777"; el.style.background = "transparent"; }}}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#44AA66", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: "0.6875rem", color: "#555555" }}>
            {health.total_complaints_stored ?? "—"} records · Pakistan DB
          </span>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          style={{
            display: "block", width: "100%",
            padding: "7px 12px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            color: "#777777",
            fontSize: "0.75rem",
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "all .12s",
          }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.06)"; el.style.color = "#BBBBBB"; }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = "transparent"; el.style.color = "#777777"; }}
        >
          {resetting ? "Resetting…" : "Reset Seed Data"}
        </button>
      </div>
    </aside>
  );
}
