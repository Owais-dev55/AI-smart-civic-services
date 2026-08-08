"""
FastAPI Application Backend for AI Smart Civic Services Platform.
Implements REST API endpoints, CORS headers, error handling,
dependency injection of OOP managers, and static file hosting.
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.models.schemas import (
    ComplaintCreateRequest,
    AIAnalyzeRequest,
    AIAnalyzeResponse,
    StatusUpdateRequest,
    AssignDepartmentRequest,
    AssistantChatRequest,
    AssistantChatResponse,
    ComplaintResponse
)
from app.models.entities import ComplaintStatus, PriorityLevel, ComplaintCategory, Department
from app.services.database_manager import DatabaseManager
from app.services.ai_service import AIService
from app.services.statistics_service import StatisticalEngine
from app.services.notification_manager import NotificationManager
from app.services.complaint_manager import ComplaintManager

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = Path(__file__).resolve().parent
WORKSPACE_DIR = BASE_DIR.parent
DATA_DIR = APP_DIR / "data"
CLIENT_DIR = WORKSPACE_DIR / "client"

# Initialize SQLite database and training datasets
SEED_FILE = str(DATA_DIR / "seed_complaints.json")
TRAIN_FILE = str(DATA_DIR / "training_dataset.json")
DB_FILE = str(BASE_DIR / "civic_service.db")

# Initialize OOP Services Layer
database_mgr = DatabaseManager(db_path=DB_FILE, seed_path=SEED_FILE)
ai_service = AIService(dataset_path=TRAIN_FILE)
stats_engine = StatisticalEngine()
notification_mgr = NotificationManager(db_manager=database_mgr)
complaint_mgr = ComplaintManager(
    db_manager=database_mgr,
    ai_service=ai_service,
    notification_manager=notification_mgr,
    stats_engine=stats_engine
)

# Initialize FastAPI App
app = FastAPI(
    title="AwaamCare AI API",
    description="AwaamCare AI — Pakistan Citizen Grievance & Municipal Intelligence Platform powered by ML, Gemini, OOP, and Statistical Analytics",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://awaamcare.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """System health and AI model readiness verification."""
    count = database_mgr.count_complaints()
    return {
        "status": "healthy",
        "service": "AwaamCare AI Platform API",
        "database_connected": True,
        "total_complaints_stored": count,
        "nlp_model_loaded": ai_service.classifier.is_trained,
        "sklearn_engine": True
    }


@app.post("/api/complaints", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def submit_complaint(payload: ComplaintCreateRequest):
    """
    Submits a new citizen complaint:
    Runs multi-stage AI analysis, detects duplicates, stores complaint in SQLite,
    and dispatches simulated citizen notifications.
    """
    try:
        phone = payload.citizen_phone or payload.contact or "+92 300 0000000"
        email = payload.citizen_email or (payload.contact if payload.contact and "@" in payload.contact else f"{payload.citizen_name.lower().replace(' ', '')}@awaamcare.pk")
        result = complaint_mgr.register_complaint(
            citizen_name=payload.citizen_name,
            citizen_phone=phone,
            citizen_email=email,
            ward=payload.ward,
            location=payload.location,
            description=payload.description,
            image_url=payload.image_url
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering civic complaint: {str(e)}"
        )


@app.get("/api/complaints", response_model=List[ComplaintResponse])
def list_complaints(
    category: Optional[str] = Query(None, description="Filter by complaint category"),
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    status: Optional[str] = Query(None, description="Filter by status (Open, Assigned, In Progress, Resolved)"),
    ward: Optional[str] = Query(None, description="Filter by municipal ward"),
    search: Optional[str] = Query(None, description="Search keyword in description/location/name")
):
    """Retrieves complaints with flexible multi-attribute filtering."""
    try:
        complaints = complaint_mgr.get_complaints(
            category=category,
            priority=priority,
            status=status,
            ward=ward,
            search=search
        )
        return complaints
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching complaints: {str(e)}"
        )


@app.get("/api/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_single_complaint(complaint_id: str):
    """Retrieves specific complaint details by tracking ID."""
    complaint = complaint_mgr.get_complaint_details(complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' was not found in civic records."
        )
    return complaint


@app.patch("/api/complaints/{complaint_id}/status")
def update_status(complaint_id: str, payload: StatusUpdateRequest):
    """Updates complaint lifecycle status (e.g. Open -> In Progress -> Resolved)."""
    valid_statuses = [s.value for s in ComplaintStatus]
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Must be one of: {valid_statuses}"
        )

    updated = complaint_mgr.change_status(complaint_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' not found."
        )
    return {
        "message": f"Complaint {complaint_id} status updated to {payload.status}.",
        "complaint": updated
    }


@app.patch("/api/complaints/{complaint_id}/assign")
def assign_department(complaint_id: str, payload: AssignDepartmentRequest):
    """Re-assigns complaint to a responsible service department."""
    updated = complaint_mgr.reassign_department(complaint_id, payload.assigned_department)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' not found."
        )
    return {
        "message": f"Complaint {complaint_id} assigned to {payload.assigned_department}.",
        "complaint": updated
    }


@app.post("/api/ai/analyze", response_model=AIAnalyzeResponse)
def live_ai_analysis(payload: AIAnalyzeRequest):
    """
    Live real-time AI inference endpoint:
    Evaluates text & image to return category prediction, confidence score,
    priority scoring, actionable summary, vision hazard tags, and explainability breakdown.
    """
    try:
        all_existing = database_mgr.get_all_complaints()
        ai_res = ai_service.process_complaint(
            description=payload.description,
            image_url=payload.image_url,
            existing_complaints=all_existing
        )
        
        # Include top categories and explainable tokens
        cls_meta = ai_service.classifier.analyze(payload.description)
        prio_meta = ai_service.priority_estimator.analyze(payload.description)
        
        return AIAnalyzeResponse(
            predicted_category=ai_res.predicted_category,
            confidence_score=ai_res.confidence_score,
            predicted_priority=ai_res.predicted_priority,
            priority_score=ai_res.priority_score,
            actionable_summary=ai_res.actionable_summary,
            hazard_level=ai_res.hazard_level,
            recommended_department=ai_res.recommended_department,
            duplicate_detected=ai_res.duplicate_detected,
            duplicate_of_id=ai_res.duplicate_of_id,
            duplicate_similarity=ai_res.duplicate_similarity,
            vision_tags=ai_res.vision_tags,
            top_categories=cls_meta.get("top_categories", []),
            explainability={
                "extracted_tokens": cls_meta.get("explainable_tokens", []),
                "priority_factors": prio_meta.get("justification_factors", []),
                "vision_evaluated": bool(payload.image_url)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )


@app.post("/api/ai/assistant", response_model=AssistantChatResponse)
def civic_assistant_chat(payload: AssistantChatRequest):
    """Interactive conversational AI chatbot for citizen inquiries and municipal guidance."""
    try:
        total_count = database_mgr.count_complaints()
        res = ai_service.assistant.answer_query(payload.message, complaint_count=total_count)
        return AssistantChatResponse(
            response=res["response"],
            intent=res["intent"],
            suggested_actions=res.get("suggested_actions", [])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Civic Assistant error: {str(e)}"
        )


@app.get("/api/statistics")
def get_statistical_analytics():
    """
    Returns full Statistical Analytics payload satisfying Benchmark 2:
    Mean, Median, Mode, Range, Variance, StdDev, Quartiles, IQR, Outlier Fences,
    Frequency Distributions, and plain-English natural language interpretations.
    """
    try:
        report = complaint_mgr.get_statistical_report()
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate statistical metrics: {str(e)}"
        )


@app.get("/api/notifications")
def list_notifications():
    """Returns simulated notification logs."""
    return notification_mgr.get_recent_alerts(limit=25)


@app.post("/api/seed/reset")
def reset_demo_data():
    """Resets database back to clean 35-complaint seed dataset for demonstration purposes."""
    seeded_count = database_mgr.reset_database()
    return {
        "message": f"Civic Database successfully reset and seeded with {seeded_count} realistic records.",
        "seeded_count": seeded_count
    }


# Mount Client Web UI Static Assets
if CLIENT_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(CLIENT_DIR)), name="static")

    @app.get("/")
    def serve_frontend_index():
        index_path = CLIENT_DIR / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return JSONResponse({"message": "Frontend static file index.html is being prepared."})
