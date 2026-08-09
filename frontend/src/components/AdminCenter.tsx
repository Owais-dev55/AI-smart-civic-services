"use client";

import React, { useState } from "react";
import { Complaint, CivicAPI } from "@/lib/api";

interface AdminCenterProps {
  complaints: Complaint[];
  onRefresh: () => void;
}

export function PriorityTag({ priority }: { priority: string }) {
  const cls = priority === "Critical" ? "tag tag-critical" : priority === "High" ? "tag tag-high" : priority === "Medium" ? "tag tag-medium" : "tag tag-low";
  return <span className={cls}>{priority}</span>;
}

export function AdminCenter({ complaints, onRefresh }: AdminCenterProps) {
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("All");
  const [prioF, setPrioF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [wardF, setWardF] = useState("All");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [detail, setDetail] = useState<Complaint | null>(null);

  const filtered = complaints.filter(c => {
    if (catF !== "All" && c.category !== catF) return false;
    if (prioF !== "All" && c.priority !== prioF) return false;
    if (statusF !== "All" && c.status !== statusF) return false;
    if (wardF !== "All" && c.ward !== wardF) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (![c.id, c.description, c.citizen_name, c.location, c.assigned_department].some(s => s.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    await CivicAPI.updateStatus(id, status).then(onRefresh).catch(e => alert(e.message));
  };
  const assignDept = async (id: string, dept: string) => {
    await CivicAPI.assignDepartment(id, dept).then(onRefresh).catch(e => alert(e.message));
  };

  const total = complaints.length;
  const open = complaints.filter(c => c.status === "Open").length;
  const inProgress = complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const critical = complaints.filter(c => c.priority === "Critical").length;

  const STATUSES = ["Open", "Assigned", "In Progress", "Resolved"];
  const DEPTS = [
    "Power Distribution Company (K-Electric / LESCO / HESCO)",
    "Sui Gas Authority (SSGC / SNGPL)",
    "Solid Waste Management Board (SSWMB / LWMC)",
    "Water & Sanitation Agency (WASA / KWSB)",
    "Drainage & Sewerage Division",
    "Metropolitan Development Authority (CDA / KDA / PWD)",
    "Parks & Civic Amenities Directorate"
  ];
  const CATS = [
    "All",
    "Electricity & Power Outage",
    "Gas Supply & Loadshedding",
    "Waste & Sanitation",
    "Water Supply & Leakage",
    "Drainage & Sewerage",
    "Roads & Infrastructure",
    "Public Safety & Parks"
  ];
  const WARDS = [
    "All",
    "Karachi - Gulshan-e-Iqbal",
    "Karachi - Clifton",
    "Karachi - North Nazimabad",
    "Lahore - Model Town",
    "Lahore - Gulberg III",
    "Lahore - Johar Town",
    "Islamabad - F-10/2",
    "Islamabad - G-9/4",
    "Rawalpindi - Satellite Town",
    "Peshawar - University Town",
    "Quetta - Cantt",
    "Faisalabad - Madina Town"
  ];

  return (
    <div>
      <style>{`
        .ac-kpi   { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-bottom: 20px; }
        .ac-kanban { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; align-items: start; }
        .ac-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; font-size: 0.8rem; }
        .ac-modal-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        @media (max-width: 1100px) { .ac-kanban { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 900px)  { .ac-kpi { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 640px)  {
          .ac-kpi    { grid-template-columns: repeat(2,1fr); }
          .ac-kanban { grid-template-columns: 1fr; }
          .ac-modal-grid  { grid-template-columns: 1fr; }
          .ac-modal-fields { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="section-header">
        <h1>Command Center</h1>
        <p>Manage civic Complain lifecycles, reassign departments, and track service status across all municipal wards.</p>
      </div>

      {/* KPI strip */}
      <div className="ac-kpi">
        {[
          { label: "Total", value: total },
          { label: "Open", value: open },
          { label: "Active", value: inProgress },
          { label: "Resolved", value: resolved },
          { label: "Critical", value: critical },
        ].map(s => (
          <div key={s.label} className="surface stat-card">
            <div className="value">{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search ID, citizen, location, keyword…" className="field"
          style={{ maxWidth: 240, flex: "1 0 180px" }} />

        {[
          { val: catF, set: setCatF, opts: CATS },
          { val: prioF, set: setPrioF, opts: ["All", "Critical", "High", "Medium", "Low"] },
          { val: statusF, set: setStatusF, opts: ["All", ...STATUSES] },
          { val: wardF, set: setWardF, opts: WARDS },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)} className="field" style={{ flex: "0 0 auto", width: "auto" }}>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "#F0F0F0", padding: 3, borderRadius: 8 }}>
          {(["table", "kanban"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "4px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: "0.75rem", fontWeight: 600,
              background: view === v ? "#FFFFFF" : "transparent",
              color: view === v ? "#111111" : "#888888",
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all .12s",
            }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      {view === "table" ? (
        <div className="surface" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>{["ID", "Citizen / Ward", "Category", "Priority", "Status", "Department", ""].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#111111", fontWeight: 600 }}>{c.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111111", fontSize: "0.8rem" }}>{c.citizen_name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#AAAAAA" }}>{c.ward}</div>
                    </td>
                    <td>{c.category}</td>
                    <td><PriorityTag priority={c.priority} /></td>
                    <td>
                      <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)} className="field" style={{ padding: "4px 8px", fontSize: "0.75rem", width: "auto" }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: "0.75rem", maxWidth: 180 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.assigned_department}</div>
                    </td>
                    <td><button className="btn btn-ghost" style={{ padding: "3px 10px" }} onClick={() => setDetail(c)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban */
        <div className="ac-kanban">
          {STATUSES.map(col => {
            const cards = filtered.filter(c => c.status === col);
            return (
              <div key={col}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "#888888" }}>{col}</span>
                  <span style={{ fontSize: "0.7rem", color: "#CCCCCC", fontFamily: "monospace" }}>{cards.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cards.map(c => (
                    <div key={c.id} className="kanban-card" onClick={() => setDetail(c)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                        <span style={{ fontSize: "0.65rem", fontFamily: "monospace", color: "#888888" }}>{c.id}</span>
                        <PriorityTag priority={c.priority} />
                      </div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111111", marginBottom: 5 }}>{c.category}</div>
                      <div style={{ fontSize: "0.7rem", color: "#888888", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.ai_summary}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(250,250,250,0.85)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="surface" style={{ maxWidth: 540, width: "100%", padding: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #F0F0F0" }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#888888", marginBottom: 2 }}>{detail.id}</div>
                <div style={{ fontWeight: 700, color: "#111111" }}>{detail.category}</div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#AAAAAA", fontSize: "1.1rem" }}>✕</button>
            </div>
            <div className="ac-modal-grid">
              <div>
                <div style={{ color: "#AAAAAA", fontSize: "0.7rem", marginBottom: 3 }}>Citizen</div>
                <div style={{ fontWeight: 600, color: "#111111" }}>{detail.citizen_name}</div>
                <div style={{ color: "#888888", fontSize: "0.75rem" }}>{detail.citizen_phone}</div>
              </div>
              <div>
                <div style={{ color: "#AAAAAA", fontSize: "0.7rem", marginBottom: 3 }}>Ward / Location</div>
                <div style={{ fontWeight: 600, color: "#111111" }}>{detail.ward}</div>
                <div style={{ color: "#888888", fontSize: "0.75rem" }}>{detail.location}</div>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#AAAAAA", fontSize: "0.7rem", marginBottom: 5 }}>Citizen Complain Description</div>
              <div style={{ fontSize: "0.8rem", color: "#444444", background: "#F8F8F8", borderRadius: 7, padding: "10px 12px", border: "1px solid #EEEEEE", lineHeight: 1.6 }}>{detail.description}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#AAAAAA", fontSize: "0.7rem", marginBottom: 5 }}>AI Dispatch Briefing</div>
              <div style={{ fontSize: "0.8rem", color: "#444444", background: "#F8F8F8", borderRadius: 7, padding: "10px 12px", border: "1px solid #EEEEEE", lineHeight: 1.6 }}>{detail.ai_summary}</div>
            </div>
            <div className="ac-modal-fields">
              <div>
                <div style={{ color: "#AAAAAA", fontSize: "0.7rem", marginBottom: 5 }}>Status Transition</div>
                <select value={detail.status} onChange={e => updateStatus(detail.id, e.target.value)} className="field">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={{ color: "#AAAAAA", fontSize: "0.7rem", marginBottom: 5 }}>Reassign Department</div>
                <select value={detail.assigned_department} onChange={e => assignDept(detail.id, e.target.value)} className="field">
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
