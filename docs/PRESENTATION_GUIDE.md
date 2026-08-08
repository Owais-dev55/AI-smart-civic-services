# Hackathon Presentation & Demonstration Guide (3–5 Minutes)

## AI Smart Civic Services Platform

---

## 🎯 3–5 Minute Live Pitch Script for Judges

### Minute 1: Problem Definition & Architecture Overview (10 Marks)
> "Good morning, judges! In municipal governance, millions of citizen complaints are reported as unstructured text—unclear, unprioritized, and misrouted.
> We built **AI Smart Civic Services**, an intelligent end-to-end platform that transforms unstructured citizen reports into structured, prioritized, actionable municipal operations.
> Our system is built on a clean **Object-Oriented Architecture (OOP)** in Python with FastAPI, featuring dedicated classes for `Citizen`, `Department`, `Complaint`, and a modular `BaseAIAnalyzer` pipeline."

### Minute 2: Live AI Complaint Submission & Real-Time Preview (25 Marks)
1. Navigate to the **Citizen Portal** (`http://localhost:8000`).
2. Start typing a realistic emergency report into the description box:
   > *"High voltage electric wire snapped from the streetlight pole and is sparking on the water-logged footpath outside the primary school gate."*
3. **Point out the Live AI Preview Card on the right:**
   - Notice the debounced live inference in action:
   - **Category:** `Electricity & Streetlights` (96% Confidence).
   - **Urgency Tier:** `Critical` (Urgency Score: 98.0/100) due to live wire + school vulnerability multipliers.
   - **Department:** Automatically assigned to `Electricity & Lighting Board`.
   - **Operational Summary:** Crisp 1-sentence briefing generated for field crews.
   - **Vision Tags:** `Exposed Conductor Cable`, `Electrical Enclosure Breach`.
4. Click **Submit Civic Complain** $\to$ observe the modal with tracking reference (e.g. `CMP-2026-036`).

### Minute 3: Command Center, Kanban & Status Lifecycle (15 Marks)
1. Switch to the **Command Center** tab.
2. Demonstrate **Multi-Filtering & Search**:
   - Filter by *Category: Water Supply*, *Priority: Critical*, or *Ward: Ward 3*.
   - Search by keyword *"crater"* or citizen name.
3. Toggle between **Table View** and **Kanban Board**.
4. Change status on a ticket from `Open` to `In Progress` and `Resolved` $\to$ notice real-time recalculation of resolution hours and simulated citizen SMS notification dispatch!

### Minute 4: Statistical Analytics Intelligence Suite (15 Marks)
1. Switch to the **Statistical Analytics** tab.
2. Walk the judges through the descriptive statistics:
   - **Mean resolution time** vs. **Median resolution time** (explaining distribution skewness).
   - **Mode**, **Sample Variance ($s^2$)**, and **Standard Deviation ($\sigma$)**.
   - **Interquartile Range ($IQR = Q_3 - Q_1$)** and **Tukey Outlier Fences**:
     - $\text{Lower Fence} = Q_1 - 1.5 \times IQR$
     - $\text{Upper Fence} = Q_3 + 1.5 \times IQR$
3. Point out the **Outlier Alert Box**:
   - Identifies complaints that exceeded the Upper Fence cutoff as anomalous delays requiring municipal commissioner intervention.
4. Show the **Chart.js Visualizations**:
   - Category distribution, Priority donut, Ward hotspots, and Quartile resolution spread.
5. Highlight the **AI Natural Language Statistical Briefing** paragraphs that explain what the numbers mean for city decision-makers.

### Minute 5: AI Explainability Lab & Q&A (10 Marks)
1. Switch to the **AI Explainability Lab**.
2. Run custom text in the **Live Sandbox** to demonstrate token weight extraction and feature importance.
3. Show documented **AI Limitations & Failure Cases** (compound complaints, regional slang, nocturnal photos).
4. Demonstrate the floating **Civic AI Assistant** chatbot.
5. Conclude and invite technical Q&A!

---

## 📋 Evaluation Checklist Reference

| Checklist Item | Demonstration Step | Status |
| :--- | :--- | :---: |
| **Civic problem & target users explained** | Minute 1 Pitch Intro | ✅ Ready |
| **Live complaint submission** | Minute 2 Citizen Form | ✅ Ready |
| **AI classification & priority prediction** | Minute 2 Live Preview Card | ✅ Ready |
| **Stored complaint & AI output in SQLite** | Minute 3 Command Center | ✅ Ready |
| **Administrator management & status workflow** | Minute 3 Table / Kanban View | ✅ Ready |
| **Search & multi-filtering demonstrated** | Minute 3 Filter Bar | ✅ Ready |
| **Statistics & dashboard insights** | Minute 4 Mean/StdDev/IQR/Fences/Charts | ✅ Ready |
| **AI technology & limitations explained** | Minute 5 AI Explainability Lab | ✅ Ready |
| **Deployed application demonstrated** | `http://localhost:8000` | ✅ Ready |
| **Technical Q&A readiness** | Complete doc package in `docs/` | ✅ Ready |
