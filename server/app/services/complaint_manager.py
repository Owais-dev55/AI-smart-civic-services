"""
Complaint Manager business logic service for AI Smart Civic Services.
Orchestrates domain entities, AI pipelines, database persistence, and notifications.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from app.models.entities import (
    Complaint,
    Citizen,
    Department,
    ComplaintStatus,
    AIAnalysisResult
)
from app.services.database_manager import DatabaseManager
from app.services.ai_service import AIService
from app.services.notification_manager import NotificationManager
from app.services.statistics_service import StatisticalEngine


class ComplaintManager:
    """
    Core business service class responsible for complaint lifecycle,
    AI orchestration, operational routing, and statistical generation.
    """
    def __init__(
        self,
        db_manager: DatabaseManager,
        ai_service: AIService,
        notification_manager: NotificationManager,
        stats_engine: StatisticalEngine
    ):
        self.db = db_manager
        self.ai = ai_service
        self.notifier = notification_manager
        self.stats = stats_engine

    def register_complaint(
        self,
        citizen_name: str,
        citizen_phone: str,
        citizen_email: str,
        ward: str,
        location: str,
        description: str,
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes and registers a new citizen complaint:
        1. Instantiates Citizen domain entity
        2. Queries existing complaints for duplicate detection
        3. Executes multi-stage AI analysis (Category, Priority, Summary, Vision)
        4. Instantiates Complaint domain entity
        5. Persists to database
        6. Dispatches citizen confirmation SMS/Email notification
        """
        # Fetch current complaints for duplicate detection
        all_existing = self.db.get_all_complaints()

        # Run multi-stage AI analysis pipeline
        ai_result: AIAnalysisResult = self.ai.process_complaint(
            description=description,
            location=location,
            image_url=image_url,
            existing_complaints=all_existing
        )

        # Generate sequential ID
        count = self.db.count_complaints() + 1
        complaint_id = f"CMP-2026-{count:03d}"

        # Create Citizen OOP Entity
        citizen = Citizen(
            name=citizen_name,
            phone=citizen_phone,
            email=citizen_email,
            ward=ward
        )

        # Create Complaint OOP Entity
        complaint = Complaint(
            complaint_id=complaint_id,
            citizen=citizen,
            description=description,
            location=location,
            category=ai_result.predicted_category,
            priority=ai_result.predicted_priority,
            priority_score=ai_result.priority_score,
            status=ComplaintStatus.OPEN.value,
            assigned_department=ai_result.recommended_department,
            ai_summary=ai_result.actionable_summary,
            hazard_level=ai_result.hazard_level,
            image_url=image_url,
            created_at=datetime.now()
        )

        # Persist to Database
        self.db.insert_complaint(complaint.to_dict())

        # Dispatch confirmation notification
        self.notifier.send_submission_alert(
            complaint_id=complaint_id,
            citizen_name=citizen.name,
            citizen_phone=citizen.phone,
            category=complaint.category,
            priority=complaint.priority,
            department=complaint.assigned_department
        )

        return {
            "complaint": complaint.to_dict(),
            "ai_analysis": ai_result.to_dict(),
            "message": "Complaint successfully submitted and analyzed by Civic AI."
        }

    def get_complaints(
        self,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        ward: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        return self.db.get_all_complaints(
            category=category,
            priority=priority,
            status=status,
            ward=ward,
            search=search
        )

    def get_complaint_details(self, complaint_id: str) -> Optional[Dict[str, Any]]:
        return self.db.get_complaint_by_id(complaint_id)

    def change_status(self, complaint_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        updated = self.db.update_complaint_status(complaint_id, new_status)
        if updated:
            self.notifier.send_status_update_alert(
                complaint_id=complaint_id,
                citizen_phone=updated["citizen_phone"],
                new_status=new_status,
                department=updated["assigned_department"]
            )
        return updated

    def reassign_department(self, complaint_id: str, new_department: str) -> Optional[Dict[str, Any]]:
        updated = self.db.assign_complaint_department(complaint_id, new_department)
        if updated:
            self.notifier.send_dispatch_alert(
                complaint_id=complaint_id,
                department=new_department,
                priority=updated["priority"],
                summary=updated["ai_summary"]
            )
        return updated

    def get_statistical_report(self) -> Dict[str, Any]:
        """Generates comprehensive descriptive statistics, frequencies, IQR fences, and civic narratives."""
        all_complaints = self.db.get_all_complaints()
        return self.stats.generate_comprehensive_report(all_complaints)
