"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CitizenPortal } from "@/components/CitizenPortal";
import { AdminCenter } from "@/components/AdminCenter";
import { StatisticsSuite } from "@/components/StatisticsSuite";
import { AILab } from "@/components/AILab";
import { CivicAssistant } from "@/components/CivicAssistant";
import { CivicAPI, Complaint } from "@/lib/api";

export default function Home() {
  const [tab, setTab]             = useState("citizen");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [toast, setToast]         = useState<string | null>(null);

  const loadComplaints = async () => {
    try { setComplaints(await CivicAPI.getComplaints()); } catch { }
  };

  useEffect(() => { loadComplaints(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleReset = async () => {
    const res = await CivicAPI.resetDatabase();
    showToast(res.message);
    await loadComplaints();
  };

  return (
    <div className="layout">
      <Sidebar activeTab={tab} setActiveTab={setTab} onReset={handleReset} />

      <div className="main-content">
        <div className="page-body">
          {tab === "citizen"    && <CitizenPortal onSuccess={() => { showToast("Complain successfully registered."); loadComplaints(); }} onNavigateToAdmin={() => setTab("admin")} />}
          {tab === "admin"      && <AdminCenter complaints={complaints} onRefresh={loadComplaints} />}
          {tab === "statistics" && <StatisticsSuite />}
          {tab === "ailab"      && <AILab />}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #EEEEEE", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "#888888", fontWeight: 600 }}>AwaamCare AI · Pakistan Municipal Redressal Platform</span>
          <span style={{ fontSize: "0.7rem", color: "#CCCCCC" }}>FastAPI · Next.js · Gemini AI · Scikit-Learn · SQLite</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: "#FFFFFF", border: "1px solid #E0E0E0", borderRadius: 8, padding: "10px 16px", fontSize: "0.8rem", color: "#111111", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
          {toast}
        </div>
      )}

      <CivicAssistant onNavigateTab={setTab} />
    </div>
  );
}
