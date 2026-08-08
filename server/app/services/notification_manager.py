"""
Notification and Dispatch Manager for AI Smart Civic Services.
Simulates multi-channel citizen SMS, Email, and Municipal Dispatch alerts.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


class NotificationManager:
    """
    Simulates automated citizen notifications (SMS, Email) and municipal
    department dispatch alerts with event logging.
    """
    def __init__(self, db_manager=None):
        self.db = db_manager
        self.in_memory_logs: List[Dict[str, Any]] = []

    def set_db_manager(self, db_manager):
        self.db = db_manager

    def send_submission_alert(
        self,
        complaint_id: str,
        citizen_name: str,
        citizen_phone: str,
        category: str,
        priority: str,
        department: str
    ) -> Dict[str, Any]:
        msg = (
            f"Dear {citizen_name}, your civic Complain {complaint_id} ({category}) "
            f"has been received with AI Priority: '{priority}'. Routed to {department}. "
            f"Track live at civic.gov/track/{complaint_id}"
        )
        self._log(complaint_id, citizen_phone, "SMS / Citizen Portal", msg)
        return {"status": "sent", "channel": "SMS", "complaint_id": complaint_id}

    def send_status_update_alert(
        self,
        complaint_id: str,
        citizen_phone: str,
        new_status: str,
        department: str
    ) -> Dict[str, Any]:
        msg = (
            f"Civic Alert: Complain {complaint_id} status updated to '{new_status}' "
            f"by {department}. Thank you for helping keep our city safe and clean."
        )
        self._log(complaint_id, citizen_phone, "SMS Alert", msg)
        return {"status": "sent", "channel": "SMS", "complaint_id": complaint_id}

    def send_dispatch_alert(
        self,
        complaint_id: str,
        department: str,
        priority: str,
        summary: str
    ) -> Dict[str, Any]:
        msg = (
            f"[DISPATCH ALERT] New {priority} priority ticket {complaint_id} assigned to {department}. "
            f"Operational Summary: {summary}"
        )
        self._log(complaint_id, f"dept:{department.lower()}", "Internal Dispatch Webhook", msg)
        return {"status": "dispatched", "channel": "Webhook", "complaint_id": complaint_id}

    def _log(self, complaint_id: str, recipient: str, channel: str, message: str):
        record = {
            "complaint_id": complaint_id,
            "recipient": recipient,
            "channel": channel,
            "message": message,
            "sent_at": datetime.now().isoformat()
        }
        self.in_memory_logs.append(record)
        if self.db:
            try:
                self.db.log_notification(complaint_id, recipient, channel, message)
            except Exception as e:
                print(f"[NotificationManager] Error writing to DB: {e}")

    def get_recent_alerts(self, limit: int = 15) -> List[Dict[str, Any]]:
        if self.db:
            try:
                return self.db.get_notifications()[:limit]
            except Exception:
                pass
        return self.in_memory_logs[-limit:]
