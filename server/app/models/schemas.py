"""
Pydantic Schemas for AI Smart Civic Services Request & Response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ComplaintCreateRequest(BaseModel):
    citizen_name: str = Field(..., min_length=1, description="Citizen full name")
    citizen_phone: Optional[str] = Field(None, description="Contact phone number")
    citizen_email: Optional[str] = Field(None, description="Citizen email address")
    contact: Optional[str] = Field(None, description="Unified contact number or email")
    ward: str = Field("Ward 1 - Gulshan-e-Iqbal, Karachi", description="Municipal Ward / Zone")
    location: str = Field(..., min_length=2, description="Exact street landmark or address")
    description: str = Field(..., min_length=3, description="Unstructured description of the problem")
    image_url: Optional[str] = Field(None, description="Optional uploaded image filename or base64 data")


class AIAnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=1, description="Complaint text to evaluate")
    image_url: Optional[str] = Field(None, description="Optional image filename or data")


class AIAnalyzeResponse(BaseModel):
    predicted_category: str
    confidence_score: float
    predicted_priority: str
    priority_score: float
    actionable_summary: str
    hazard_level: str
    recommended_department: str
    duplicate_detected: bool
    duplicate_of_id: Optional[str] = None
    duplicate_similarity: float = 0.0
    vision_tags: List[str] = []
    visual_severity_index: Optional[float] = 0.0
    visual_confidence: Optional[float] = 0.90
    model_engine: Optional[str] = None
    hazard_summary: Optional[str] = None
    top_categories: List[Dict[str, Any]] = []
    explainability: Dict[str, Any] = {}


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Open, Assigned, In Progress, Resolved, or Rejected")


class AssignDepartmentRequest(BaseModel):
    assigned_department: str = Field(..., description="Target municipal department name")


class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Citizen or Admin question")
    session_id: Optional[str] = Field("default", description="Conversation session ID")


class AssistantChatResponse(BaseModel):
    response: str
    intent: str
    suggested_actions: List[str] = []
    relevant_context: Optional[Dict[str, Any]] = None


class ComplaintResponse(BaseModel):
    id: str
    citizen_name: str
    citizen_phone: str
    citizen_email: str
    ward: str
    location: str
    description: str
    category: str
    priority: str
    priority_score: float
    status: str
    assigned_department: str
    ai_summary: str
    hazard_level: Optional[str] = None
    image_url: Optional[str] = None
    created_at: str
    resolved_at: Optional[str] = None
    resolution_hours: Optional[float] = None
