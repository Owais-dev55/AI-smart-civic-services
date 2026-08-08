/**
 * Typed API Client for AI Smart Civic Services
 * Seamlessly proxies through Next.js rewrite or direct backend on http://127.0.0.1:8000
 */

const API_BASE = "";

export interface Complaint {
  id: string;
  citizen_name: string;
  citizen_phone: string;
  citizen_email: string;
  ward: string;
  location: string;
  description: string;
  category: string;
  priority: string;
  priority_score: number;
  status: string;
  assigned_department: string;
  ai_summary: string;
  hazard_level?: string;
  image_url?: string;
  created_at: string;
  resolved_at?: string;
  resolution_hours?: number;
}

export interface AIAnalysisResult {
  predicted_category: string;
  confidence_score: number;
  predicted_priority: string;
  priority_score: number;
  actionable_summary: string;
  hazard_level: string;
  recommended_department: string;
  duplicate_detected: boolean;
  duplicate_of_id?: string;
  duplicate_similarity: number;
  vision_tags: string[];
  visual_severity_index?: number;
  visual_confidence?: number;
  model_engine?: string;
  hazard_summary?: string;
  top_categories: { category: string; confidence: number; percentage: string }[];
  explainability: {
    extracted_tokens?: string[];
    priority_factors?: string[];
    vision_evaluated?: boolean;
  };
}

export interface StatisticalReport {
  total_complaints: number;
  resolution_time_stats: {
    count_resolved: number;
    mean_hours: number;
    median_hours: number;
    mode_hours: number;
    min_hours: number;
    max_hours: number;
    range_hours: number;
    variance: number;
    std_dev_hours: number;
    quartiles: {
      q1_hours: number;
      q2_median_hours: number;
      q3_hours: number;
      iqr_hours: number;
      lower_fence_hours: number;
      upper_fence_hours: number;
    };
    upper_fence_outliers: {
      id: string;
      category: string;
      ward: string;
      resolution_hours: number;
      threshold_exceeded_by: number;
      description: string;
    }[];
  };
  priority_score_stats: {
    mean_score: number;
    median_score: number;
    mode_score: number;
    min_score: number;
    max_score: number;
    std_dev: number;
  };
  category_distribution: { category: string; count: number; percentage: number }[];
  priority_distribution: { priority: string; count: number; percentage: number }[];
  status_distribution: { status: string; count: number; percentage: number }[];
  ward_distribution: { ward: string; count: number; percentage: number }[];
  statistical_interpretation: {
    central_tendency_insight: string;
    dispersion_and_outliers_insight: string;
    volume_and_risk_insight: string;
  };
}

export const CivicAPI = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error("Backend connection failed");
    return await res.json();
  },

  async submitComplaint(data: any): Promise<{ complaint: Complaint; ai_analysis: any; message: string }> {
    const payload = {
      citizen_name: data.citizen_name,
      citizen_phone: data.citizen_phone || data.contact || "+92 300 0000000",
      citizen_email: data.citizen_email || (data.contact && data.contact.includes("@") ? data.contact : `${(data.citizen_name || "citizen").toLowerCase().replace(/\s+/g, "")}@awaamcare.pk`),
      contact: data.contact,
      ward: data.ward || "Ward 1 - Gulshan-e-Iqbal, Karachi",
      location: data.location,
      description: data.description,
      image_url: data.image_url !== "none" ? data.image_url : null
    };
    const res = await fetch(`${API_BASE}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      let msg = "Failed to submit Complain";
      try {
        const err = await res.json();
        if (typeof err.detail === "string") {
          msg = err.detail;
        } else if (Array.isArray(err.detail)) {
          msg = err.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
        }
      } catch { }
      throw new Error(msg);
    }
    return await res.json();
  },

  async getComplaints(filters: Record<string, string> = {}): Promise<Complaint[]> {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All") params.append("category", filters.category);
    if (filters.priority && filters.priority !== "All") params.append("priority", filters.priority);
    if (filters.status && filters.status !== "All") params.append("status", filters.status);
    if (filters.ward && filters.ward !== "All") params.append("ward", filters.ward);
    if (filters.search) params.append("search", filters.search);

    const res = await fetch(`${API_BASE}/api/complaints?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch complaints");
    return await res.json();
  },

  async updateStatus(id: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/complaints/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Failed to update status");
    return await res.json();
  },

  async assignDepartment(id: string, assigned_department: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/complaints/${id}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_department })
    });
    if (!res.ok) throw new Error("Failed to assign department");
    return await res.json();
  },

  async liveAnalyze(description: string, image_url: string | null = null): Promise<AIAnalysisResult> {
    const res = await fetch(`${API_BASE}/api/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, image_url })
    });
    if (!res.ok) throw new Error("AI analysis request failed");
    return await res.json();
  },

  async getStatistics(): Promise<StatisticalReport> {
    const res = await fetch(`${API_BASE}/api/statistics`);
    if (!res.ok) throw new Error("Failed to retrieve statistics");
    return await res.json();
  },

  async chatAssistant(message: string): Promise<{ response: string; intent: string; suggested_actions: string[] }> {
    const res = await fetch(`${API_BASE}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error("Assistant request failed");
    return await res.json();
  },

  async resetDatabase(): Promise<{ message: string; seeded_count: number }> {
    const res = await fetch(`${API_BASE}/api/seed/reset`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset database");
    return await res.json();
  }
};
