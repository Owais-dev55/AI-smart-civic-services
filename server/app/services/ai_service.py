"""
AI Services & Machine Learning Pipeline for AI Smart Civic Services (Pakistani Context).
Implements Benchmark 1 (Advance AI & Data Science) and integrates cleanly
into Benchmark 3 (OOP Architecture) with BaseAIAnalyzer class hierarchy.
"""

import os
import json
import re
import math
from typing import Dict, Any, List, Optional, Tuple
from abc import ABC, abstractmethod

# Scikit-learn & scientific imports
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

from app.models.entities import (
    ComplaintCategory,
    PriorityLevel,
    Department,
    AIAnalysisResult
)
from app.services.gemini_service import GeminiCivicAssistant


class BaseAIAnalyzer(ABC):
    """Abstract Base Class for all specialized AI sub-analyzers."""
    
    @abstractmethod
    def analyze(self, text: str, **kwargs) -> Any:
        """Execute inference on the provided input."""
        pass


class TextClassificationService(BaseAIAnalyzer):
    """
    NLP Text Classifier that predicts the civic category and department.
    Supports English & Roman Urdu (Pakistani Civic Context).
    Uses TF-IDF Vectorization with Multinomial Naive Bayes, backed by rule-based heuristic fallbacks.
    """
    def __init__(self, dataset_path: Optional[str] = None):
        self.categories = [c.value for c in ComplaintCategory]
        self.pipeline: Optional[Pipeline] = None
        self.is_trained = False
        self.feature_names = []
        self.dataset_path = dataset_path
        self._initialize_model()

    def _initialize_model(self):
        training_data = []
        if self.dataset_path and os.path.exists(self.dataset_path):
            try:
                with open(self.dataset_path, "r", encoding="utf-8") as f:
                    training_data = json.load(f)
            except Exception as e:
                print(f"[AI Service] Warning loading dataset: {e}")

        if not training_data:
            # Fallback default training corpus with Roman Urdu & English
            training_data = [
                {"text": "electricity nhi arahi bijli chali gayi load shedding transformer light blackout power voltage", "category": "Electricity & Power Outage"},
                {"text": "gas ki load shedding pressure low chulha ssgc sngpl sui gas pipeline leak heater", "category": "Gas Supply & Loadshedding"},
                {"text": "sweeper safai nhi kr raha kachra garbage waste dher trash dumpster lwmc sswmb badbu", "category": "Waste & Sanitation"},
                {"text": "paani nahi araha water leak burst pipe wasa kwsb tanker drinking supply ganda pani", "category": "Water Supply & Leakage"},
                {"text": "gutter ubal raha hai sewer line block manhole dhakkan nala drainage overflow sewerage", "category": "Drainage & Sewerage"},
                {"text": "sadak tooti khadday road pothole crater asphalt patch cda kda accident toot phoot", "category": "Roads & Infrastructure"},
                {"text": "awara kuttay dog bite park jhoola thelay footpath encroachment safety", "category": "Public Safety & Parks"}
            ]

        texts = [item["text"] for item in training_data]
        labels = [item["category"] for item in training_data]

        if SKLEARN_AVAILABLE:
            try:
                self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words="english")
                self.classifier = MultinomialNB(alpha=0.1)
                self.pipeline = Pipeline([
                    ("tfidf", self.vectorizer),
                    ("clf", self.classifier)
                ])
                self.pipeline.fit(texts, labels)
                self.is_trained = True
                print(f"[AI Service] NLP Classifier trained on {len(texts)} civic samples (Pakistani dataset).")
            except Exception as e:
                print(f"[AI Service] Sklearn pipeline fit error: {e}")
                self.is_trained = False

    def analyze(self, text: str, **kwargs) -> Dict[str, Any]:
        """Predict category, confidence score, and explainability features."""
        clean_text = text.lower().strip()
        
        if SKLEARN_AVAILABLE and self.is_trained and self.pipeline:
            try:
                probs = self.pipeline.predict_proba([clean_text])[0]
                classes = self.pipeline.classes_
                top_indices = probs.argsort()[::-1]
                
                top_category = classes[top_indices[0]]
                confidence = float(probs[top_indices[0]])
                
                # Format top 3 category distribution
                top_categories = []
                for idx in top_indices[:3]:
                    top_categories.append({
                        "category": classes[idx],
                        "confidence": round(float(probs[idx]), 3),
                        "percentage": f"{round(float(probs[idx]) * 100, 1)}%"
                    })
                
                # Rule-based confidence booster for strong trigger keywords in Roman Urdu
                boosted_category, boosted_conf = self._heuristic_check(clean_text)
                if boosted_conf > confidence:
                    top_category = boosted_category
                    confidence = boosted_conf

                return {
                    "predicted_category": top_category,
                    "confidence_score": min(0.99, max(0.48, confidence)),
                    "top_categories": top_categories,
                    "recommended_department": Department.get_recommended_department(top_category),
                    "explainable_tokens": self._extract_key_tokens(clean_text)
                }
            except Exception as e:
                print(f"[AI Service] Sklearn inference error: {e}")

        # Fallback heuristic prediction
        cat, conf = self._heuristic_check(clean_text)
        return {
            "predicted_category": cat,
            "confidence_score": conf,
            "top_categories": [{"category": cat, "confidence": conf, "percentage": f"{int(conf*100)}%"}],
            "recommended_department": Department.get_recommended_department(cat),
            "explainable_tokens": self._extract_key_tokens(clean_text)
        }

    def _heuristic_check(self, text: str) -> Tuple[str, float]:
        keywords = {
            ComplaintCategory.ELECTRICITY_POWER.value: [
                "electricity", "bijli", "load shedding", "loadshedding", "light", "transformer", 
                "k-electric", "kelectric", "lesco", "iesco", "fesco", "gepco", "hesco", "wapda",
                "voltage", "current", "taar", "meter", "sparking", "feeder", "blackout", "pole"
            ],
            ComplaintCategory.GAS_SUPPLY.value: [
                "gas", "sui gas", "ssgc", "sngpl", "chulha", "pressure", "geyser", "stove",
                "gas leak", "gas pipe", "gas cylinder", "gas ki load shedding", "gas nahi"
            ],
            ComplaintCategory.WASTE_SANITATION.value: [
                "sweeper", "safai", "kachra", "kachray", "garbage", "waste", "dher", "dump",
                "trash", "dumpster", "litter", "badbu", "makhiyan", "carcass", "lwmc", "sswmb",
                "dumper", "jalaya", "burning"
            ],
            ComplaintCategory.WATER_SUPPLY.value: [
                "paani", "pani", "water", "pipe", "pipeline", "wasa", "kwsb", "tanker", 
                "leakage", "gushing", "drinking water", "tap", "pressure zero", "line leak"
            ],
            ComplaintCategory.DRAINAGE_SEWAGE.value: [
                "gutter", "guttar", "sewer", "sewerage", "drain", "drainage", "manhole", 
                "dhakkan", "nala", "nullah", "ganda paani", "choked", "overflow", "culvert"
            ],
            ComplaintCategory.ROADS_INFRASTRUCTURE.value: [
                "khadda", "khadday", "sadak", "road", "pothole", "crater", "asphalt", "tar", 
                "toot phoot", "patch work", "flyover", "bridge", "speed breaker"
            ],
            ComplaintCategory.PUBLIC_SAFETY.value: [
                "kutta", "kuttay", "dog", "bite", "park", "jhoola", "jhoolay", "thelay", 
                "encroach", "footpath", "chori", "street crime", "vendor"
            ]
        }
        
        matches = {}
        for cat, terms in keywords.items():
            count = sum(1 for term in terms if term in text)
            if count > 0:
                matches[cat] = count

        if matches:
            best_cat = max(matches, key=matches.get)
            score = min(0.98, 0.72 + (matches[best_cat] * 0.08))
            return best_cat, score
            
        return ComplaintCategory.OTHER.value, 0.50

    def _extract_key_tokens(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        stop_words = {"this", "that", "there", "where", "with", "from", "near", "have", "been", "causing", "because", "please", "very", "much", "hai", "hain", "raha", "rahi", "nahi", "nhi", "aur", "par", "se"}
        tokens = [w for w in words if w not in stop_words]
        return list(dict.fromkeys(tokens))[:6]


class PriorityEstimationService(BaseAIAnalyzer):
    """
    Estimates urgency and severity level (Low, Medium, High, Critical)
    using multi-factor hazard keyword weighting (English + Roman Urdu).
    """
    CRITICAL_TRIGGERS = [
        "live wire", "sparking", "burst", "collapse", "deep crater", "raw sewage",
        "emergency", "fatal", "hospital", "flooding", "blackout", "exposed wire",
        "gas leak", "blast", "aag", "current", "zehreela", "khula gutter", "rabies",
        "transformer aag", "nangi taar", "carcass"
    ]
    
    HIGH_TRIGGERS = [
        "pothole", "clogged", "overflowing", "stagnant", "contaminated", "accident",
        "school", "main road", "highway", "heavy rain", "unattended", "falling",
        "no water", "dark street", "danger", "load shedding", "paani nahi", "gas nahi",
        "khadday", "ganda paani", "kuttay"
    ]
    
    MEDIUM_TRIGGERS = [
        "leak", "crack", "stench", "odor", "delay", "debris", "encroachment",
        "broken bench", "flickering", "litter", "unpaved", "sweeper", "low pressure",
        "chulha", "jhoola"
    ]

    def analyze(self, text: str, **kwargs) -> Dict[str, Any]:
        clean = text.lower()
        score = 42.0  # Base neutral score
        hazard_level = "Medium"
        factors = []

        # Evaluate critical conditions
        for trig in self.CRITICAL_TRIGGERS:
            if trig in clean:
                score += 26.0
                factors.append(f"Critical trigger identified: '{trig}'")

        # Evaluate high severity conditions
        for trig in self.HIGH_TRIGGERS:
            if trig in clean:
                score += 15.0
                factors.append(f"High-impact factor: '{trig}'")

        # Evaluate medium severity conditions
        for trig in self.MEDIUM_TRIGGERS:
            if trig in clean:
                score += 7.0
                factors.append(f"Medium urgency factor: '{trig}'")

        # Contextual scale multipliers
        if any(w in clean for w in ["children", "school", "bachay", "hospital", "mariz", "patient"]):
            score += 15.0
            factors.append("Vulnerable population exposure detected (+15)")

        if any(w in clean for w in ["main road", "arterial", "highway", "chowrangi", "markaz", "market"]):
            score += 12.0
            factors.append("High transit infrastructure impact (+12)")

        # Cap score between 10 and 99
        final_score = min(99.0, max(15.0, score))

        if final_score >= 85.0:
            priority = PriorityLevel.CRITICAL.value
            hazard_level = "Critical Threat"
        elif final_score >= 68.0:
            priority = PriorityLevel.HIGH.value
            hazard_level = "High Hazard"
        elif final_score >= 45.0:
            priority = PriorityLevel.MEDIUM.value
            hazard_level = "Moderate Issue"
        else:
            priority = PriorityLevel.LOW.value
            hazard_level = "Minor Complain"

        return {
            "predicted_priority": priority,
            "priority_score": round(final_score, 1),
            "hazard_level": hazard_level,
            "justification_factors": factors[:4]
        }


class ActionableSummarizerService(BaseAIAnalyzer):
    """
    Generates concise 1-sentence operational summaries for municipal dispatch crews.
    """
    def analyze(self, text: str, **kwargs) -> str:
        clean = text.strip()
        location_hint = kwargs.get("location", "")
        
        # Clean extra whitespaces
        clean = re.sub(r'\s+', ' ', clean)
        
        # Split into sentences
        sentences = [s.strip() for s in re.split(r'[.!?\n]+', clean) if len(s.strip()) > 5]
        
        if not sentences:
            return clean[:100]
            
        first_sentence = sentences[0]
        if len(first_sentence) <= 120 and len(first_sentence) > 20:
            summary = first_sentence
        else:
            words = first_sentence.split()
            summary = " ".join(words[:18])
            if not summary.endswith('.'):
                summary += "..."
                
        if location_hint and location_hint.lower() not in summary.lower():
            return f"{summary} [Location: {location_hint}]"
        return summary


class DuplicateDetectionService:
    """
    Detects duplicate citizen complaints in active unresolved states
    using TF-IDF vector similarity.
    """
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english") if SKLEARN_AVAILABLE else None

    def find_duplicate(self, new_text: str, existing_complaints: List[Dict[str, Any]], threshold: float = 0.65) -> Tuple[bool, Optional[str], float]:
        if not SKLEARN_AVAILABLE or not existing_complaints or not self.vectorizer:
            return False, None, 0.0

        open_complaints = [c for c in existing_complaints if c.get("status") in ["Open", "Assigned", "In Progress"]]
        if not open_complaints:
            return False, None, 0.0

        corpus = [c["description"] for c in open_complaints]
        corpus.append(new_text)

        try:
            tfidf_matrix = self.vectorizer.fit_transform(corpus)
            sim_matrix = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
            best_idx = sim_matrix.argmax()
            best_sim = float(sim_matrix[0, best_idx])

            if best_sim >= threshold:
                matched_id = open_complaints[best_idx].get("id")
                return True, matched_id, best_sim
        except Exception as e:
            print(f"[DuplicateDetector] Error during similarity calculation: {e}")

        return False, None, 0.0


from app.services.vision_service import ComputerVisionEngine


class VisionInspectionService(BaseAIAnalyzer):
    """
    Computer Vision Analyzer that processes real images and Base64 uploads
    using Gemini Multimodal Vision and Local Feature Extraction.
    """
    def __init__(self):
        self.engine = ComputerVisionEngine()

    def analyze(self, image_url: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        text = kwargs.get("text", "")
        category = kwargs.get("category", "")
        res = self.engine.inspect_image(image_url, text_hint=text, category_hint=category)
        return {
            "has_image": res.get("has_image", False),
            "image_url": image_url,
            "vision_tags": res.get("vision_tags", []),
            "visual_confidence": res.get("visual_confidence", 0.90),
            "visual_severity_index": res.get("visual_severity_index", 0.0),
            "hazard_summary": res.get("hazard_summary", ""),
            "model_engine": res.get("model_engine", "")
        }


class CivicAssistantService:
    """
    Conversational RAG assistant integrating Google Gemini LLM API with
    grounded knowledge of Pakistani municipal civic laws, SLAs, and database state.
    Provides short, crisp 1-2 sentence municipal customer support responses.
    """
    KNOWLEDGE_BASE_URDU = {
        "electricity": "K-Electric / LESCO outage ki shikayat 'Citizen Portal' me submit karein. Emergency response time 2 se 4 ghantay hai.",
        "gas": "Sui Gas (SSGC / SNGPL) low pressure ki complaint portal par darj karein. Inspection team 24 ghantay me visit karegi.",
        "sweeper": "Sweeper ki ghair-hazri SSWMB / LWMC ko report karein. Zonal Inspector 24 ghantay ke andar action lega.",
        "water": "WASA / KWSB paani ki supply ya pipeline leak ki complaint darj karein. Repair team 12 ghantay me deploy hoti hai.",
        "gutter": "Gutter ubalne ya khulay manhole ki complaint portal par submit karein. Jetting machine 12 ghantay me dispatch hoti hai.",
        "road": "Sadak par khadday CDA / KDA / PWD ko report karein. Patch work 24 se 48 ghantay me schedule hota hai.",
        "status": "Apni complaint ka live status dekhne ke liye 'Command Center' me tracking ID (e.g. CMP-2026-004) search karein.",
        "resolution": "City dashboard par complaints ka average resolution time ~24.8 ghantay hai. Tafseelat 'Statistical Analytics' tab me dekhein."
    }

    KNOWLEDGE_BASE_EN = {
        "electricity": "Submit power outage complaints in the Citizen Portal. Emergency restoration SLA is 2 to 4 hours.",
        "gas": "Report Sui Gas low pressure via the Citizen Portal. Zonal team inspects within 24 hours.",
        "sweeper": "Report sweeper absence to SSWMB / LWMC. Zonal inspector inspects within 24 hours.",
        "water": "Report water shortages or leaks to WASA / KWSB. Repair crews deploy within 12 hours.",
        "gutter": "Report overflowing gutters or missing manhole covers. Jetting machine dispatches within 12 hours.",
        "road": "Report potholes to Metropolitan Authority (CDA/PWD). Road patch repair is scheduled within 48 hours.",
        "status": "Track your complaint status by searching your ID (e.g. CMP-2026-001) in the Command Center.",
        "resolution": "Average municipal resolution time across wards is ~24.8 hours. View details in Statistical Analytics."
    }

    def __init__(self):
        self.gemini = GeminiCivicAssistant()

    def _is_roman_urdu(self, text: str) -> bool:
        urdu_markers = [
            "nhi", "nahi", "arahe", "araha", "arahee", "hai", "hain", "kya", "karo", "karein",
            "gali", "sadak", "bijli", "chulha", "paani", "pani", "gutter", "sweeper", "safai",
            "bohat", "boht", "dher", "batao", "kab", "theek", "mera", "meri", "hum", "aap",
            "subha", "shaam", "raat", "bachay", "khadday", "badbu"
        ]
        text_lower = text.lower()
        return any(re.search(r'\b' + re.escape(w) + r'\b', text_lower) for w in urdu_markers)

    def answer_query(self, message: str, complaint_count: int = 35) -> Dict[str, Any]:
        # 1. Try Gemini LLM first with short response instructions
        db_context = {
            "total_complaints": complaint_count,
            "avg_resolution_hours": 24.8
        }
        gemini_res = self.gemini.generate_chat_response(message, db_context=db_context)
        if gemini_res.get("success") and gemini_res.get("response"):
            return {
                "response": gemini_res["response"],
                "intent": "gemini_llm_response",
                "suggested_actions": gemini_res["suggested_actions"],
                "powered_by": "Gemini AI"
            }

        # 2. Contextual Fallback RAG Engine (Short, crisp 1-2 sentence replies)
        is_urdu = self._is_roman_urdu(message)
        kb = self.KNOWLEDGE_BASE_URDU if is_urdu else self.KNOWLEDGE_BASE_EN
        msg = message.lower()

        if "electr" in msg or "bijli" in msg or "load shedding" in msg or "light" in msg or "power" in msg:
            resp = kb["electricity"]
            intent = "electricity_power"
            actions = ["Bijli Ki Shikayat Darj Karein", "K-Electric Outage SLA", "Live Ward Stats"]
        elif "gas" in msg or "sui" in msg or "chulha" in msg or "ssgc" in msg or "sngpl" in msg:
            resp = kb["gas"]
            intent = "gas_supply"
            actions = ["Gas Load Shedding Report", "SSGC / SNGPL Helpline", "Gas Leakage Emergency"]
        elif "sweep" in msg or "kachra" in msg or "safai" in msg or "garbage" in msg or "waste" in msg:
            resp = kb["sweeper"]
            intent = "waste_management"
            actions = ["Sweeper Ki Shikayat", "Kachra Dumper Request", "SSWMB / LWMC Help"]
        elif "paani" in msg or "pani" in msg or "water" in msg or "wasa" in msg or "kwsb" in msg or "tanker" in msg:
            resp = kb["water"]
            intent = "water_supply"
            actions = ["Paani Ki Shikayat Karein", "WASA Tanker Request", "Pipeline Leakage"]
        elif "gutter" in msg or "drain" in msg or "sewer" in msg or "manhole" in msg or "nala" in msg:
            resp = kb["gutter"]
            intent = "drainage_sewage"
            actions = ["Gutter Ubalnay Ki Shikayat", "Missing Manhole Dhakkan", "Jetting Machine Request"]
        elif "road" in msg or "sadak" in msg or "khadda" in msg or "pothole" in msg:
            resp = kb["road"]
            intent = "road_infrastructure"
            actions = ["Sadak / Khadda Report", "CDA / PWD Road SLA", "Road Patch Work"]
        elif "how long" in msg or "time" in msg or "average" in msg or "statistics" in msg or "kab tak" in msg or "waqt" in msg:
            resp = kb["resolution"]
            intent = "statistics_inquiry"
            actions = ["Statistics Dashboard Kholein", "Outlier Fences Dekhein"]
        elif "track" in msg or "status" in msg or "cmp-" in msg or "mera" in msg or "check" in msg:
            resp = kb["status"]
            intent = "complaint_tracking"
            actions = ["Command Center Kholein", "Ticket Search Karein", "Active Complaints"]
        elif "salam" in msg or "hello" in msg or "hi" in msg:
            resp = "Assalam-o-Alaikum! Bijli, gas, sweeper, ya paani ke masail me main aapki kya madad karoon?" if is_urdu else "Hello! How can I assist you with municipal services today?"
            intent = "greeting"
            actions = ["Bijli Ki Shikayat", "Gas Load Shedding", "Sweeper / Kachra Safai"]
        else:
            if is_urdu:
                resp = "Aap Bijli, Gas, Sweeper, ya WASA paani ke masail 'Citizen Portal' me submit kar sakte hain ya ticket ID track kar sakte hain."
            else:
                resp = "You can submit electricity, gas, sanitation, or water Complains in the Citizen Portal or track your ticket ID in the Command Center."
            intent = "general_civic_support"
            actions = ["Bijli Ki Shikayat", "Gas Load Shedding", "Sweeper / Kachra Safai"]

        return {
            "response": resp,
            "intent": intent,
            "suggested_actions": actions,
            "powered_by": "CivicCare Support Engine"
        }


class AIService:
    """
    Unified AI Service orchestrator encapsulating all NLP, Priority, Summarization,
    Duplicate Detection, Vision, and Civic Assistant capabilities.
    """
    def __init__(self, dataset_path: Optional[str] = None):
        self.classifier = TextClassificationService(dataset_path)
        self.priority_estimator = PriorityEstimationService()
        self.summarizer = ActionableSummarizerService()
        self.duplicate_detector = DuplicateDetectionService()
        self.vision_inspector = VisionInspectionService()
        self.assistant = CivicAssistantService()

    def process_complaint(
        self,
        description: str,
        location: str = "",
        image_url: Optional[str] = None,
        existing_complaints: Optional[List[Dict[str, Any]]] = None
    ) -> AIAnalysisResult:
        """Runs the complete multi-stage AI analysis pipeline."""
        # 1. NLP Classification
        cls_result = self.classifier.analyze(description)
        category = cls_result["predicted_category"]
        confidence = cls_result["confidence_score"]
        dept = cls_result["recommended_department"]

        # 2. Priority & Hazard Urgency
        prio_result = self.priority_estimator.analyze(description)
        priority = prio_result["predicted_priority"]
        priority_score = prio_result["priority_score"]
        hazard = prio_result["hazard_level"]

        # 3. Actionable Operational Summarizer
        summary = self.summarizer.analyze(description, location=location)

        # 4. Duplicate Detection
        dup_detected, dup_id, dup_sim = False, None, 0.0
        if existing_complaints:
            dup_detected, dup_id, dup_sim = self.duplicate_detector.find_duplicate(description, existing_complaints)

        # 5. Vision Inspection
        vision_result = self.vision_inspector.analyze(image_url, category=category, text=description)
        vision_tags = vision_result.get("vision_tags", [])

        return AIAnalysisResult(
            predicted_category=category,
            confidence_score=confidence,
            predicted_priority=priority,
            priority_score=priority_score,
            actionable_summary=summary,
            hazard_level=hazard,
            recommended_department=dept,
            duplicate_detected=dup_detected,
            duplicate_of_id=dup_id,
            duplicate_similarity=dup_sim,
            vision_tags=vision_tags
        )
