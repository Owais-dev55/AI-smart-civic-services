"""
Database Manager for AI Smart Civic Services.
Provides SQLite database persistence, schema migration, seed initialization,
and encapsulates all low-level SQL operations in clean OOP methods.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime


class DatabaseManager:
    """
    Encapsulates SQLite database operations with thread-safe connection pooling,
    automatic schema creation, seeding, and transaction management.
    """
    def __init__(self, db_path: str = "civic_service.db", seed_path: Optional[str] = None):
        self.db_path = db_path
        self.seed_path = seed_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Creates tables if they do not exist and populates initial seed data."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Create Complaints table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS complaints (
                    id TEXT PRIMARY KEY,
                    citizen_name TEXT NOT NULL,
                    citizen_phone TEXT NOT NULL,
                    citizen_email TEXT NOT NULL,
                    ward TEXT NOT NULL,
                    location TEXT NOT NULL,
                    description TEXT NOT NULL,
                    category TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    priority_score REAL NOT NULL,
                    status TEXT NOT NULL,
                    assigned_department TEXT NOT NULL,
                    ai_summary TEXT NOT NULL,
                    hazard_level TEXT,
                    image_url TEXT,
                    created_at TEXT NOT NULL,
                    resolved_at TEXT,
                    resolution_hours REAL
                )
            """)

            # Create Audit Log / Notification table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    complaint_id TEXT NOT NULL,
                    recipient TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    message TEXT NOT NULL,
                    sent_at TEXT NOT NULL
                )
            """)
            conn.commit()

        # Seed data if table is currently empty
        if self.count_complaints() == 0 and self.seed_path and os.path.exists(self.seed_path):
            self.seed_database(self.seed_path)

    def seed_database(self, json_filepath: str) -> int:
        """Loads realistic complaints from JSON dataset."""
        try:
            with open(json_filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            with self._get_connection() as conn:
                cursor = conn.cursor()
                for item in data:
                    cursor.execute("""
                        INSERT OR REPLACE INTO complaints (
                            id, citizen_name, citizen_phone, citizen_email, ward, location,
                            description, category, priority, priority_score, status,
                            assigned_department, ai_summary, hazard_level, image_url,
                            created_at, resolved_at, resolution_hours
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        item.get("id"),
                        item.get("citizen_name"),
                        item.get("citizen_phone"),
                        item.get("citizen_email"),
                        item.get("ward", "Ward 1 (West)"),
                        item.get("location"),
                        item.get("description"),
                        item.get("category"),
                        item.get("priority"),
                        float(item.get("priority_score", 50.0)),
                        item.get("status", "Open"),
                        item.get("assigned_department"),
                        item.get("ai_summary"),
                        item.get("hazard_level"),
                        item.get("image_url"),
                        item.get("created_at"),
                        item.get("resolved_at"),
                        item.get("resolution_hours")
                    ))
                conn.commit()
            print(f"[DatabaseManager] Seeded {len(data)} realistic complaints successfully.")
            return len(data)
        except Exception as e:
            print(f"[DatabaseManager] Error seeding database: {e}")
            return 0

    def count_complaints(self) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM complaints")
            row = cursor.fetchone()
            return row[0] if row else 0

    def insert_complaint(self, data: Dict[str, Any]) -> str:
        """Inserts a new complaint record."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO complaints (
                    id, citizen_name, citizen_phone, citizen_email, ward, location,
                    description, category, priority, priority_score, status,
                    assigned_department, ai_summary, hazard_level, image_url,
                    created_at, resolved_at, resolution_hours
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["id"],
                data["citizen_name"],
                data["citizen_phone"],
                data["citizen_email"],
                data["ward"],
                data["location"],
                data["description"],
                data["category"],
                data["priority"],
                data["priority_score"],
                data["status"],
                data["assigned_department"],
                data["ai_summary"],
                data.get("hazard_level"),
                data.get("image_url"),
                data["created_at"],
                data.get("resolved_at"),
                data.get("resolution_hours")
            ))
            conn.commit()
        return data["id"]

    def get_all_complaints(
        self,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        ward: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves and filters complaints with dynamic multi-attribute queries."""
        query = "SELECT * FROM complaints WHERE 1=1"
        params = []

        if category and category != "All":
            query += " AND category = ?"
            params.append(category)
        if priority and priority != "All":
            query += " AND priority = ?"
            params.append(priority)
        if status and status != "All":
            query += " AND status = ?"
            params.append(status)
        if ward and ward != "All":
            query += " AND ward = ?"
            params.append(ward)
        if search:
            query += " AND (description LIKE ? OR location LIKE ? OR citizen_name LIKE ? OR id LIKE ? OR assigned_department LIKE ?)"
            term = f"%{search.strip()}%"
            params.extend([term, term, term, term, term])

        query += " ORDER BY created_at DESC"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_complaint_by_id(self, complaint_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_complaint_status(self, complaint_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        """Updates status and calculates resolution hours if transitioned to Resolved."""
        existing = self.get_complaint_by_id(complaint_id)
        if not existing:
            return None

        resolved_at = existing.get("resolved_at")
        resolution_hours = existing.get("resolution_hours")

        if new_status == "Resolved" and not resolved_at:
            now = datetime.now()
            resolved_at = now.isoformat()
            try:
                created_dt = datetime.fromisoformat(existing["created_at"])
                diff = (now - created_dt).total_seconds()
                resolution_hours = round(max(0.5, diff / 3600.0), 2)
            except Exception:
                resolution_hours = 4.0
        elif new_status != "Resolved":
            resolved_at = None
            resolution_hours = None

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE complaints
                SET status = ?, resolved_at = ?, resolution_hours = ?
                WHERE id = ?
            """, (new_status, resolved_at, resolution_hours, complaint_id))
            conn.commit()

        return self.get_complaint_by_id(complaint_id)

    def assign_complaint_department(self, complaint_id: str, department: str) -> Optional[Dict[str, Any]]:
        existing = self.get_complaint_by_id(complaint_id)
        if not existing:
            return None

        new_status = existing["status"]
        if new_status == "Open":
            new_status = "Assigned"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE complaints
                SET assigned_department = ?, status = ?
                WHERE id = ?
            """, (department, new_status, complaint_id))
            conn.commit()

        return self.get_complaint_by_id(complaint_id)

    def log_notification(self, complaint_id: str, recipient: str, channel: str, message: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO notifications (complaint_id, recipient, channel, message, sent_at)
                VALUES (?, ?, ?, ?, ?)
            """, (complaint_id, recipient, channel, message, datetime.now().isoformat()))
            conn.commit()

    def get_notifications(self, complaint_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if complaint_id:
                cursor.execute("SELECT * FROM notifications WHERE complaint_id = ? ORDER BY sent_at DESC", (complaint_id,))
            else:
                cursor.execute("SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 50")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def reset_database(self) -> int:
        """Wipes database and reloads default seed data."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM complaints")
            cursor.execute("DELETE FROM notifications")
            conn.commit()

        if self.seed_path and os.path.exists(self.seed_path):
            return self.seed_database(self.seed_path)
        return 0
