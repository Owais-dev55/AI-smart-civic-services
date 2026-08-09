"use client";

import React, { useState, useEffect } from "react";
import { LandingPage } from "@/components/LandingPage";
import { Sidebar } from "@/components/Sidebar";
import { CitizenPortal } from "@/components/CitizenPortal";
import { AdminCenter } from "@/components/AdminCenter";
import { StatisticsSuite } from "@/components/StatisticsSuite";
import { AILab } from "@/components/AILab";
import { CivicAssistant } from "@/components/CivicAssistant";
import { CivicAPI, Complaint } from "@/lib/api";

const TAB_LABELS: Record<string, string> = {
  citizen:    "Citizen Portal",
  admin:      "Command Center",
  statistics: "Statistical Analytics",
  ailab:      "AI Lab",
};

export default function Home() {
  const [showLanding, setShowLanding]   = useState(true);
  const [tab, setTab]                   = useState("citizen");
  const [complaints, setComplaints]     = useState<Complaint[]>([]);
  const [toast, setToast]               = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const handleEnter   = () => setShowLanding(false);
  const handleGoHome  = () => { setShowLanding(true); setTab("citizen"); setSidebarOpen(false); };
  const toggleSidebar = () => setSidebarOpen(o => !o);
  const closeSidebar  = () => setSidebarOpen(false);
  const handleTabChange = (t: string) => { setTab(t); setSidebarOpen(false); };

  const loadComplaints = async () => {
    try { setComplaints(await CivicAPI.getComplaints()); } catch { }
  };

  useEffect(() => {
    if (!showLanding) loadComplaints();
  }, [showLanding]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleReset = async () => {
    const res = await CivicAPI.resetDatabase();
    showToast(res.message);
    await loadComplaints();
  };

  if (showLanding) {
    return <LandingPage onEnter={handleEnter} />;
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar
        activeTab={tab}
        setActiveTab={handleTabChange}
        onReset={handleReset}
        onGoHome={handleGoHome}
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Overlay — closes sidebar on mobile tap */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " sidebar-overlay--open" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <div className="main-content">
        {/* Mobile top-bar */}
        <div className="mobile-topbar">
          <button
            onClick={toggleSidebar}
            aria-label="Open menu"
            style={{ background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 7, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", color: "#111111", flexShrink: 0 }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111111", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {TAB_LABELS[tab] ?? "AwaamCare AI"}
          </span>
        </div>

        <div className="page-body">
          {tab === "citizen"    && <CitizenPortal onSuccess={() => { showToast("Complain successfully registered."); loadComplaints(); }} onNavigateToAdmin={() => handleTabChange("admin")} />}
          {tab === "admin"      && <AdminCenter complaints={complaints} onRefresh={loadComplaints} />}
          {tab === "statistics" && <StatisticsSuite />}
          {tab === "ailab"      && <AILab />}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #EEEEEE", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: "0.7rem", color: "#888888", fontWeight: 600 }}>AwaamCare AI · Pakistan Municipal Redressal Platform</span>
          <span style={{ fontSize: "0.7rem", color: "#CCCCCC" }}>FastAPI · Next.js · Gemini AI · Scikit-Learn</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: "#FFFFFF", border: "1px solid #E0E0E0", borderRadius: 8, padding: "10px 16px", fontSize: "0.8rem", color: "#111111", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", maxWidth: "calc(100vw - 40px)" }}>
          {toast}
        </div>
      )}

      <CivicAssistant onNavigateTab={handleTabChange} />
    </div>
  );
}
