"use client";

import React, { useState, useRef, useEffect } from "react";
import { CivicAPI, AIAnalysisResult } from "@/lib/api";
import { PriorityTag } from "./AdminCenter";

interface CitizenPortalProps {
  onSuccess: () => void;
  onNavigateToAdmin: () => void;
}

const WARDS = [
  "Ward 1 - Gulshan-e-Iqbal, Karachi",
  "Ward 2 - Model Town, Lahore",
  "Ward 3 - Sector F-10/2, Islamabad",
  "Ward 4 - Satellite Town, Rawalpindi",
  "Ward 5 - Cantt Saddar, Peshawar",
  "Ward 6 - Madina Town, Faisalabad",
  "Ward 7 - Jinnah Town, Quetta"
];

export function CitizenPortal({ onSuccess, onNavigateToAdmin }: CitizenPortalProps) {
  const [form, setForm] = useState({
    citizen_name: "",
    contact: "",
    ward: WARDS[0],
    location: "",
    description: "",
    image_url: "none",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ai, setAi] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAna] = useState(false);
  const [submitting, setSub] = useState(false);
  const [submitted, setDone] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Debounced live AI inference on input change
  useEffect(() => {
    if (!form.description.trim() || form.description.length < 5) {
      setAi(null);
      return;
    }
    setAna(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setAi(await CivicAPI.liveAnalyze(form.description, form.image_url !== "none" ? form.image_url : null));
      } catch {
        // silent
      } finally {
        setAna(false);
      }
    }, 450);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [form.description, form.image_url]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setImagePreview(base64Str);
      setForm(prev => ({ ...prev, image_url: base64Str }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setImagePreview(null);
    setForm(prev => ({ ...prev, image_url: "none" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectPreset = (presetName: string) => {
    setImagePreview(null);
    setForm(prev => ({ ...prev, image_url: presetName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.location.trim()) return;
    setSub(true);
    try {
      const res = await CivicAPI.submitComplaint({
        ...form,
        image_url: form.image_url !== "none" ? form.image_url : null
      });
      setDone(res);
      onSuccess();
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSub(false);
    }
  };

  return (
    <div>
      <style>{`
        .cp-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
        .cp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        @media (max-width: 900px) { .cp-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .cp-form-row { grid-template-columns: 1fr; } }
      `}</style>
      <div className="section-header">
        <h1>AwaamCare Citizen Portal</h1>
        <p>Submit a municipal complain in English or Roman Urdu with real photo evidence. The AI instantly categorizes, inspects visual damage, and routes it to the responsible department.</p>
      </div>

      <div className="cp-grid">

        {/* Form */}
        <div className="surface" style={{ padding: 24 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#BBBBBB", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #F0F0F0" }}>
            Complain Registration Details
          </div>
          <form onSubmit={handleSubmit}>
            <div className="cp-form-row">
              <div>
                <FL>Citizen Name</FL>
                <input
                  type="text"
                  required
                  className="field"
                  value={form.citizen_name}
                  onChange={e => setForm({ ...form, citizen_name: e.target.value })}
                  placeholder="e.g. Tariq Mehmood"
                />
              </div>
              <div>
                <FL>Mobile / WhatsApp Number</FL>
                <input
                  type="text"
                  required
                  className="field"
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                  placeholder="e.g. +92 300 1234567"
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <FL>Municipal Ward / City District</FL>
              <select className="field" value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })}>
                {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <FL>Exact Location / Landmark</FL>
              <input
                type="text"
                required
                className="field"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Main University Road opposite Disco Bakery"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <FL>Description (English or Roman Urdu)</FL>
                <span style={{ fontSize: "0.65rem", color: "#CCCCCC" }}>{form.description.length} chars</span>
              </div>
              <textarea
                rows={4}
                required
                className="field"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder='e.g. "electricity nhi arahi hai subha se" / "sweeper safai nahi kar raha" / "gas ki load shedding ho rahi hai"'
              />
            </div>

            {/* Real Photo Evidence Computer Vision Upload */}
            <div style={{ marginBottom: 24, padding: "16px", background: "#FAFAFA", borderRadius: 8, border: "1px dashed #D5D5D5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <FL>Photo Evidence (Real Computer Vision AI)</FL>
                <span style={{ fontSize: "0.65rem", color: "#888888" }}>Gemini Multimodal Vision</span>
              </div>

              {imagePreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px", background: "#FFFFFF", borderRadius: 6, border: "1px solid #E0E0E0" }}>
                  <img src={imagePreview} alt="Evidence Preview" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111111", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>Real Image Attached</div>
                    <div style={{ fontSize: "0.65rem", color: "#44AA66" }}>Ready for Computer Vision Inspection</div>
                  </div>
                  <button type="button" onClick={handleRemovePhoto} style={{ background: "#F5F5F5", border: "1px solid #E0E0E0", borderRadius: 4, padding: "4px 8px", fontSize: "0.6875rem", cursor: "pointer" }}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="evidence-upload"
                  />
                  <label
                    htmlFor="evidence-upload"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "10px 14px", background: "#FFFFFF", border: "1px solid #CCCCCC",
                      borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                      color: "#111111", transition: "background .12s"
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F0F0F0"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FFFFFF"; }}
                  >
                    📷 Upload Real Photo / Take Camera Snapshot
                  </label>

                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.65rem", color: "#888888" }}>Or test sample:</span>
                    {[
                      { label: "Pothole (Sadak)", val: "pothole_mg_road.jpg" },
                      { label: "Sparking Wire", val: "sparking_street_light.jpg" },
                      { label: "Water Leak", val: "water_leak_junction.jpg" },
                      { label: "Kachra Pile", val: "garbage_overflow_block4.jpg" },
                      { label: "Gutter Overflow", val: "sewage_overflow_ecity.jpg" },
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => selectPreset(p.val)}
                        style={{
                          fontSize: "0.65rem", padding: "3px 8px", borderRadius: 4,
                          background: form.image_url === p.val ? "#111111" : "#FFFFFF",
                          color: form.image_url === p.val ? "#FFFFFF" : "#555555",
                          border: "1px solid #E0E0E0", cursor: "pointer"
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.6rem 1rem", fontSize: "0.8125rem" }}>
              {submitting ? "Submitting…" : "Submit Complain"}
            </button>
          </form>
        </div>

        {/* AI Live Inference Card */}
        <div className="surface" style={{ padding: 20, position: "sticky", top: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #F0F0F0" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#BBBBBB", textTransform: "uppercase", letterSpacing: ".08em" }}>AI Live Inference</span>
            <span style={{ fontSize: "0.65rem", color: analyzing ? "#888888" : ai ? "#44AA66" : "#CCCCCC", fontWeight: 600 }}>
              {analyzing ? "Analyzing…" : ai ? "Live" : "Awaiting Input"}
            </span>
          </div>

          {ai ? (
            <>
              {/* Category */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Predicted Category</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111111", marginBottom: 6 }}>{ai.predicted_category}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#888888", marginBottom: 4 }}>
                  <span>NLP Confidence</span>
                  <span style={{ fontFamily: "monospace", color: "#111111", fontWeight: 700 }}>{Math.round(ai.confidence_score * 100)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.round(ai.confidence_score * 100)}%` }} />
                </div>
              </div>

              {/* Priority */}
              <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#FAFAFA", borderRadius: 7, border: "1px solid #F0F0F0" }}>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "#888888", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>Urgency</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111111" }}>{ai.hazard_level}</div>
                </div>
                <PriorityTag priority={ai.predicted_priority} />
              </div>

              {/* Department */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Routed Department</div>
                <div style={{ fontSize: "0.75rem", color: "#333333", background: "#F5F5F5", padding: "7px 10px", borderRadius: 6, border: "1px solid #ECECEC", lineHeight: 1.4 }}>
                  {ai.recommended_department}
                </div>
              </div>

              {/* Computer Vision Inspection */}
              {ai.vision_tags && ai.vision_tags.length > 0 && (
                <div style={{ marginBottom: 14, padding: "10px", background: "#F8FBF8", borderRadius: 6, border: "1px solid #E0EBE0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#338855", textTransform: "uppercase" }}>📸 Computer Vision</span>
                    <span style={{ fontSize: "0.65rem", color: "#555555", fontWeight: 600 }}>Severity: {ai.visual_severity_index}/10</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {ai.vision_tags.map((t, idx) => (
                      <span key={idx} style={{ fontSize: "0.625rem", padding: "2px 6px", background: "#FFFFFF", border: "1px solid #CCE0CC", borderRadius: 4, color: "#226633" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicate alert */}
              {ai.duplicate_detected && (
                <div style={{ padding: "8px 10px", background: "#FDF6ED", border: "1px solid #F5D9B0", borderRadius: 6, fontSize: "0.7rem", color: "#8A5300", lineHeight: 1.4 }}>
                  Duplicate complaint detected ({Math.round((ai.duplicate_similarity ?? 0) * 100)}% match).
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: "16px 8px", textAlign: "center", color: "#AAAAAA", fontSize: "0.75rem", lineHeight: 1.6 }}>
              Type your complain or upload photo evidence to see real-time AI classification, urgency rating, and computer vision tags.
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {submitted && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(250,250,250,0.85)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="surface" style={{ maxWidth: 420, width: "100%", padding: 26, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#111111", marginBottom: 4 }}>Complain Registered</div>
            <div style={{ fontSize: "0.75rem", color: "#888888", marginBottom: 20 }}>Your complaint has been logged and routed to the responsible department.</div>
            <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 16, display: "grid", gap: 10, marginBottom: 20 }}>
              {[
                ["Tracking ID", submitted.id],
                ["Category", submitted.category],
                ["Priority", <PriorityTag key="p" priority={submitted.priority} />],
                ["Department", submitted.assigned_department],
              ].map(([k, v]) => (
                <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                  <span style={{ color: "#888888" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#111111" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setDone(null);
                  setForm({ citizen_name: "", contact: "", ward: WARDS[0], location: "", description: "", image_url: "none" });
                  setImagePreview(null);
                }}
                className="btn"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Submit Another
              </button>
              <button onClick={() => { setDone(null); onNavigateToAdmin(); }} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                View in Center
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FL({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{children}</label>;
}
