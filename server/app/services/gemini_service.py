"""
Gemini LLM Integration Service for AI Smart Civic Services (Pakistan Support Edition).
Connects to Google's Gemini API with comprehensive context grounding in Pakistani
municipal governance, civic bylaws, department routing, and concise Roman Urdu support style.
"""

import os
import json
import re
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, List, Optional

# Load .env file automatically
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass


class GeminiCivicAssistant:
    """
    LLM-powered Civic Assistant using Google's Gemini API.
    Short, crisp, and direct Pakistani municipal support agent.
    API keys are loaded securely from environment variables.
    """
    SYSTEM_PROMPT = """
You are 'AwaamCare AI' — the official Pakistani Municipal Customer Support Representative for the 'AwaamCare' Civic Platform.

CRITICAL RULES:
1. LENGTH: KEEP RESPONSES VERY SHORT AND CONCISE (Maximum 1 to 2 short sentences!). Never send long paragraphs.
2. GREETINGS: DO NOT repeat 'Salam' / 'Assalam-o-Alaikum' in every message. Only greet if the user explicitly greets you. Otherwise jump directly to the answer.
3. LANGUAGE: If user asks in Roman Urdu, reply in short, natural Roman Urdu. If in English, reply in short English.
4. TONE: Helpful, direct, and actionable municipal support.

PAKISTANI CIVIC CONTEXT:
- Electricity/Bijli: K-Electric, LESCO, IESCO, HESCO, FESCO (SLA: 2-4 hours emergency, 6-12 hours outage).
- Gas/Sui Gas: SSGC, SNGPL (SLA: Gas leak = instant, low pressure = 24 hours).
- Solid Waste/Sweepers: SSWMB, LWMC (SLA: 24 hours zonal inspection).
- Water/Paani: WASA, KWSB (SLA: Pipeline repair in 12 hours, official tanker support).
- Gutter/Sewerage: Drainage Division (SLA: 12 hours jetting machine, missing manhole cover = Priority 1).
- Roads/Khadday: CDA, KDA, PWD (SLA: Patch repair in 24-48 hours).
- Tracking: CMP-2026-XXX tracked in Command Center.

SHORT RESPONSE EXAMPLES:
User: "electricity nhi arahi hai subha se"
Assistant: "K-Electric / LESCO outage ki shikayat 'Citizen Portal' me submit karein. Emergency response time 2 se 4 ghantay hai."

User: "sweeper safai nhi kr raha kachra phail gaya hai"
Assistant: "Sweeper ki ghair-hazri SSWMB / LWMC ko report karein. Zonal Inspector 24 ghantay ke andar action lega."

User: "gas ki load shedding ho rahi hai"
Assistant: "Sui Gas (SSGC / SNGPL) low pressure ki complaint portal par darj karein. Inspection team 24 ghantay me visit karegi."

User: "mera complaint number CMP-2026-004 kab tak theek hoga"
Assistant: "CMP-2026-004 ka live status dekhne ke liye 'Command Center' me tracking ID search karein."
"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.models_to_try = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-pro"
        ]

    def generate_chat_response(self, user_message: str, db_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Sends query to Gemini API with short, crisp response instructions.
        """
        if not self.api_key:
            return {
                "success": False,
                "source": "fallback (no api key)",
                "response": None,
                "suggested_actions": self._generate_suggested_actions(user_message)
            }

        context_str = ""
        if db_context:
            total = db_context.get("total_complaints", 35)
            avg_res = db_context.get("avg_resolution_hours", 24.8)
            context_str = f"\n[Context: Total Complaints={total}, Mean Resolution={avg_res}h]\n"

        prompt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"{self.SYSTEM_PROMPT}\n{context_str}\nCitizen: {user_message}\nSupport Assistant (1-2 sentences max):"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.5,
                "topP": 0.9,
                "maxOutputTokens": 150
            }
        }

        for model in self.models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
                data = json.dumps(prompt_payload).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=data,
                    headers={"Content-Type": "application/json"}
                )
                
                with urllib.request.urlopen(req, timeout=7) as response:
                    res_json = json.loads(response.read().decode("utf-8"))
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        content_parts = candidates[0].get("content", {}).get("parts", [])
                        if content_parts:
                            text_response = content_parts[0].get("text", "").strip()
                            if text_response:
                                return {
                                    "success": True,
                                    "source": f"gemini ({model})",
                                    "response": text_response,
                                    "suggested_actions": self._generate_suggested_actions(user_message)
                                }
            except urllib.error.HTTPError:
                continue
            except Exception:
                continue

        return {
            "success": False,
            "source": "fallback",
            "response": None,
            "suggested_actions": self._generate_suggested_actions(user_message)
        }

    def _generate_suggested_actions(self, message: str) -> List[str]:
        msg = message.lower()
        if "electr" in msg or "bijli" in msg or "light" in msg or "load" in msg:
            return ["Bijli Ki Shikayat Darj Karein", "K-Electric / LESCO SLA", "Live Ward Stats"]
        if "gas" in msg or "sui" in msg or "chulha" in msg:
            return ["Gas Load Shedding Report", "SSGC / SNGPL Helpline", "Gas Leakage Emergency"]
        if "sweep" in msg or "kachra" in msg or "safai" in msg:
            return ["Sweeper Ki Shikayat", "Kachra Dumper Request", "SSWMB / LWMC Help"]
        if "paani" in msg or "pani" in msg or "water" in msg or "wasa" in msg:
            return ["Paani Ki Shikayat Karein", "WASA Tanker Request", "Pipeline Leakage"]
        if "gutter" in msg or "sewer" in msg or "drain" in msg or "manhole" in msg:
            return ["Gutter Ubalnay Ki Shikayat", "Missing Manhole Dhakkan", "Jetting Machine Request"]
        if "track" in msg or "cmp-" in msg or "status" in msg or "mera" in msg:
            return ["Command Center Kholein", "Ticket Search Karein", "Active Complaints"]
        return ["Nayi Shikayat Darj Karein", "Statistics Dashboard", "Municipal SLAs Dekhein"]
