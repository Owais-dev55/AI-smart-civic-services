"use client";

import React, { useEffect, useState } from "react";
import { CivicAPI } from "@/lib/api";
import { Activity, RefreshCw, FileText, LayoutDashboard, BarChart3, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReset: () => void;
}

export function Navbar({ activeTab, setActiveTab, onReset }: NavbarProps) {
  const [health, setHealth] = useState<{ nlp_model_loaded?: boolean; total_complaints_stored?: number }>({});
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    CivicAPI.getHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth({}));
  }, []);

  const handleResetClick = async () => {
    if (!confirm("Reset database to the initial 35 realistic civic records?")) return;
    setResetting(true);
    try {
      await onReset();
    } finally {
      setResetting(false);
    }
  };

  const navItems = [
    { id: "citizen", label: "Citizen Portal", icon: FileText },
    { id: "admin", label: "Command Center", icon: LayoutDashboard },
    { id: "statistics", label: "Statistical Analytics", icon: BarChart3 },
    { id: "ailab", label: "AI Explainability Lab", icon: FlaskConical },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080c14]/85 backdrop-blur-xl px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/25 border border-white/20">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                AI Smart Civic Services
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Next.js • shadcn UI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Civic Intelligence & Statistical Redressal Platform
            </p>
          </div>
        </div>

        {/* Unified Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Health Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite: <strong className="text-white font-mono">{health.total_complaints_stored ?? 35}</strong> Cases</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetClick}
            disabled={resetting}
            className="flex items-center gap-1.5 rounded-xl"
            title="Reset database to initial 35 seed complaints"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? "Resetting..." : "Reset Data"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
