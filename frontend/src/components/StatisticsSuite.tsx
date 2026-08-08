"use client";

import React, { useEffect, useState } from "react";
import { CivicAPI, StatisticalReport } from "@/lib/api";

export function StatisticsSuite() {
  const [stats, setStats] = useState<StatisticalReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CivicAPI.getStatistics().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12, flexDirection: "column" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #E0E0E0", borderTopColor: "#111111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ color: "#AAAAAA", fontSize: "0.8rem" }}>Computing statistics…</span>
      </div>
    );
  }

  const r = stats.resolution_time_stats || ({} as any);
  const q = r.quartiles || ({} as any);
  const outliers = r.upper_fence_outliers || [];

  const Row = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid #F0F0F0" }}>
      <span style={{ fontSize: "0.8rem", color: "#666666" }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#111111", fontSize: "0.875rem" }}>{value}</span>
        {sub && <div style={{ fontSize: "0.65rem", color: "#AAAAAA", fontFamily: "monospace" }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <h1>Statistical Analytics</h1>
        <p>Descriptive statistics, quartile fences, frequency distributions, and natural language policy insights from the municipal database.</p>
      </div>

      {/* Outlier alert */}
      {outliers.length > 0 && (
        <div style={{ background: "#FFF8F8", border: "1px solid #EECECE", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ color: "#CC3333", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>Outlier Alert</div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#882222", fontWeight: 600, marginBottom: 6 }}>
              {outliers.length} complaints exceeded Upper Fence ({q.upper_fence_hours}h)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {outliers.map((o: any, i: number) => (
                <span key={i} style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#CC3333", background: "#FFEEEE", padding: "2px 8px", borderRadius: 99, border: "1px solid #EECECE" }}>
                  {o.id} · {o.resolution_hours}h
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

        {/* Central Tendency */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 14 }}>Central Tendency</div>
          <Row label="Mean (x̄)"   value={`${r.mean_hours ?? 0}h`} />
          <Row label="Median (Q2)" value={`${r.median_hours ?? 0}h`} />
          <Row label="Mode"        value={`${r.mode_hours ?? 0}h`} />
        </div>

        {/* Dispersion */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 14 }}>Dispersion</div>
          <Row label="Std Deviation (σ)" value={`${r.std_dev_hours ?? 0}h`} sub={`s² = ${r.variance ?? 0}`} />
          <Row label="Range"             value={`${r.range_hours ?? 0}h`}    sub={`${r.min_hours}h – ${r.max_hours}h`} />
          <Row label="IQR (Q3 − Q1)"    value={`${q.iqr_hours ?? 0}h`}     sub={`Q1=${q.q1_hours}h  Q3=${q.q3_hours}h`} />
        </div>

        {/* Outlier Fences */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 14 }}>Tukey Fences</div>
          <Row label="Lower Fence" value={`${q.lower_fence_hours ?? 0}h`} sub="Q1 − 1.5 × IQR" />
          <Row label="Upper Fence" value={`${q.upper_fence_hours ?? 0}h`} sub="Q3 + 1.5 × IQR" />
          <Row label="Q1"          value={`${q.q1_hours ?? 0}h`} />
          <Row label="Q3"          value={`${q.q3_hours ?? 0}h`} />
        </div>

        {/* Category Distribution */}
        <div className="surface" style={{ padding: 20, gridColumn: "span 2" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 16 }}>Category Frequency Distribution</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(stats.category_distribution || []).map((c, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 5 }}>
                  <span style={{ color: "#333333" }}>{c.category}</span>
                  <span style={{ fontFamily: "monospace", color: "#111111", fontWeight: 700 }}>{c.count}</span>
                </div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${c.percentage}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 14 }}>Priority Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(stats.priority_distribution || []).map((p, i) => {
              const col = p.priority === "Critical" ? "#CC3333" : p.priority === "High" ? "#CC5500" : p.priority === "Medium" ? "#998800" : "#226622";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", color: "#444444" }}>{p.priority}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 80, height: 4, background: "#F0F0F0", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${p.percentage}%`, height: "100%", background: col, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: col, fontWeight: 700, width: 24, textAlign: "right" }}>{p.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ward Hotspots */}
        <div className="surface" style={{ padding: 20, gridColumn: "span 2" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 14 }}>Ward Incident Hotspots</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(stats.ward_distribution || []).map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "#F8F8F8", borderRadius: 6, border: "1px solid #F0F0F0", fontSize: "0.8rem" }}>
                <span style={{ color: "#333333" }}>{w.ward}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "monospace", color: "#111111", fontWeight: 700 }}>{w.count}</span>
                  <span style={{ fontFamily: "monospace", color: "#BBBBBB", fontSize: "0.7rem" }}>{w.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="surface" style={{ padding: 20 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 14 }}>Status Distribution</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(stats.status_distribution || []).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                <span style={{ color: "#444444" }}>{s.status}</span>
                <span style={{ fontFamily: "monospace", color: "#111111", fontWeight: 700 }}>{s.count} <span style={{ color: "#BBBBBB", fontWeight: 400 }}>({s.percentage}%)</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* NL Briefing */}
        <div className="surface" style={{ padding: 22, gridColumn: "1 / -1" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#BBBBBB", marginBottom: 18 }}>AI Statistical Briefing for City Leadership</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { title: "Central Tendency & Service Velocity",    key: "central_tendency_insight"       },
              { title: "Dispersion, IQR & Outlier Bottlenecks", key: "dispersion_and_outliers_insight" },
              { title: "Volume Frequency & Risk Allocation",     key: "volume_and_risk_insight"         },
            ].map(({ title, key }, i) => (
              <div key={i} style={{ background: "#F8F8F8", borderRadius: 8, padding: "14px 16px", border: "1px solid #F0F0F0" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111111", marginBottom: 7 }}>{i + 1}. {title}</div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#555555", lineHeight: 1.65 }}>
                  {(stats.statistical_interpretation as any)?.[key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
