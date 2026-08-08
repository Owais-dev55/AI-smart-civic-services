"use client";

import React, { useState, useRef, useEffect } from "react";
import { CivicAPI } from "@/lib/api";

interface CivicAssistantProps {
  onNavigateTab?: (tab: string) => void;
}

type Msg = { sender: "user" | "bot"; text: string; actions?: string[]; powered_by?: string };

export function CivicAssistant({ onNavigateTab }: CivicAssistantProps) {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Msg[]>([{
    sender: "bot",
    text: "Assalam-o-Alaikum! Main AwaamCare AI Support Assistant hoon. Bijli (K-Electric/LESCO), Gas load shedding, Sweeper/Kachra, ya Paani ke masail me main aapki kya madad karoon?",
    actions: ["Bijli Ki Shikayat", "Gas Load Shedding", "Sweeper / Safai", "Paani / WASA Help"],
    powered_by: "AwaamCare Gemini AI"
  }]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    setInput("");
    setMsgs(p => [...p, { sender: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await CivicAPI.chatAssistant(msg);
      setMsgs(p => [...p, {
        sender: "bot",
        text: res.response,
        actions: res.suggested_actions,
        powered_by: "AwaamCare Support"
      }]);
    } catch {
      setMsgs(p => [...p, { sender: "bot", text: "Maazrat, support server thori dair ke liye offline hai. Baraye meherbani thori dair baad dobara koshish kijiye." }]);
    } finally { setLoading(false); }
  };

  const handleAction = (a: string) => {
    if (a.toLowerCase().includes("stat") || a.toLowerCase().includes("analytics") || a.toLowerCase().includes("outlier")) { onNavigateTab?.("statistics"); return; }
    if (a.toLowerCase().includes("report") || a.toLowerCase().includes("submit") || a.toLowerCase().includes("shikayat") || a.toLowerCase().includes("portal")) { onNavigateTab?.("citizen"); return; }
    if (a.toLowerCase().includes("command") || a.toLowerCase().includes("ticket") || a.toLowerCase().includes("center") || a.toLowerCase().includes("admin")) { onNavigateTab?.("admin"); return; }
    send(a);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Open AwaamCare Assistant"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          width: 48, height: 48, borderRadius: "50%",
          background: "#111111", color: "#FFFFFF",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.2rem",
          boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.transform = "scale(1.08)"; el.style.boxShadow = "0 6px 22px rgba(0,0,0,0.28)"; }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.transform = "scale(1)";    el.style.boxShadow = "0 4px 18px rgba(0,0,0,0.22)"; }}
      >
        💬
      </button>

      {/* Chat drawer */}
      {open && (
        <div style={{
          position: "fixed", bottom: 82, right: 24, zIndex: 50,
          width: 380, maxWidth: "calc(100vw - 40px)",
          height: 520, maxHeight: "72vh",
          display: "flex", flexDirection: "column",
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 14,
          boxShadow: "0 18px 54px rgba(0,0,0,0.16)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#44AA66", display: "inline-block", boxShadow: "0 0 6px #44AA66" }} />
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111111" }}>AwaamCare Support</div>
                <div style={{ fontSize: "0.625rem", color: "#888888" }}>Municipal Redressal · Roman Urdu / English</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#AAAAAA", fontSize: "1rem", lineHeight: 1 }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 12, background: "#FAFAFA" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.sender === "user" ? "flex-end" : "flex-start", gap: 6 }}>
                <div className={m.sender === "bot" ? "bubble-bot" : "bubble-user"} style={{ maxWidth: "90%", whiteSpace: "pre-line" }}>
                  {m.text}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxWidth: "90%" }}>
                    {m.actions.map((a, j) => (
                      <button key={j} onClick={() => handleAction(a)} style={{
                        fontSize: "0.65rem", fontWeight: 600, padding: "4px 11px", borderRadius: 99,
                        background: "#F0F0F0", border: "1px solid #E0E0E0", color: "#333333",
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "background .12s",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#E4E4E4"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F0F0F0"; }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F4F4F2", borderRadius: 8, width: "fit-content" }}>
                <span style={{ fontSize: "0.75rem", color: "#888888" }}>AwaamCare is thinking…</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #F0F0F0", display: "flex", gap: 8, background: "#FFFFFF" }}>
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="e.g. electricity nhi arahi / sweeper safai nahi kar raha..."
              className="field"
              style={{ flex: 1 }}
            />
            <button onClick={() => send(input)} className="btn btn-primary" style={{ padding: "0 14px", flexShrink: 0 }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
