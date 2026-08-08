"""
Automated Comprehensive Test Suite for AI Smart Civic Services (Pakistan Civic Edition).
Validates OOP Domain Entities, AI Pipeline Inference (Roman Urdu + English),
Statistical Formulas (IQR/Outlier Fences), and Database Persistence.
"""

import sys
import os
from pathlib import Path

# Add server directory to python path
SERVER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SERVER_DIR))

from app.models.entities import (
    Citizen,
    Complaint,
    Department,
    ComplaintCategory,
    PriorityLevel,
    ComplaintStatus,
    AIAnalysisResult
)
from app.services.statistics_service import StatisticalEngine
from app.services.ai_service import (
    TextClassificationService,
    PriorityEstimationService,
    ActionableSummarizerService,
    DuplicateDetectionService,
    VisionInspectionService,
    CivicAssistantService,
    AIService
)
from app.services.database_manager import DatabaseManager
from app.services.notification_manager import NotificationManager
from app.services.complaint_manager import ComplaintManager


def test_oop_entities():
    print("=== Testing OOP Architecture (Benchmark 3) ===")
    citizen = Citizen("Muhammad Bilal", "+92 300 5551234", "bilal@example.com", "Karachi - Gulshan-e-Iqbal")
    assert citizen.name == "Muhammad Bilal"
    assert citizen.phone == "+92 300 5551234"
    assert citizen.ward == "Karachi - Gulshan-e-Iqbal"
    
    complaint = Complaint(
        complaint_id="CMP-TEST-001",
        citizen=citizen,
        description="Dangerous water leak near school",
        location="University Road",
        category=ComplaintCategory.WATER_SUPPLY.value,
        priority=PriorityLevel.HIGH.value,
        priority_score=80.0
    )
    assert complaint.status == ComplaintStatus.OPEN.value
    assert "Water" in complaint.assigned_department
    
    # Test state transition
    complaint.update_status(ComplaintStatus.RESOLVED.value)
    assert complaint.status == ComplaintStatus.RESOLVED.value
    assert complaint.resolution_hours is not None
    print("[PASS] OOP Entities and domain lifecycle methods verified.")


def test_statistical_engine():
    print("\n=== Testing Statistical Analytics Engine (Benchmark 2) ===")
    stats = StatisticalEngine()
    
    # Test dataset with known values
    # Values: [5, 10, 10, 15, 20, 25, 30, 80] (80 is an upper outlier!)
    test_values = [5.0, 10.0, 10.0, 15.0, 20.0, 25.0, 30.0, 80.0]
    
    mean = stats.calculate_mean(test_values)
    assert mean == 24.38, f"Mean expected 24.38, got {mean}"
    
    median = stats.calculate_median(test_values)
    assert median == 17.5, f"Median expected 17.5, got {median}"
    
    mode = stats.calculate_mode(test_values)
    assert mode == 10.0, f"Mode expected 10.0, got {mode}"
    
    variance = stats.calculate_variance(test_values)
    assert variance > 0, "Variance should be greater than zero"
    
    std_dev = stats.calculate_standard_deviation(test_values)
    assert std_dev > 0, "Standard deviation should be positive"
    
    q1, q2, q3, iqr = stats.calculate_quartiles(test_values)
    lower_fence, upper_fence = stats.calculate_outlier_fences(q1, q3, iqr)
    
    print(f"Stats summary: Mean={mean}, Median={median}, Mode={mode}, StdDev={std_dev}")
    print(f"Quartiles: Q1={q1}, Q2={q2}, Q3={q3}, IQR={iqr}, UpperFence={upper_fence}")
    
    assert upper_fence < 80.0, f"80.0 should exceed upper fence {upper_fence}"
    print("[PASS] Descriptive statistics, IQR and outlier fences mathematically validated.")


def test_ai_pipeline():
    print("\n=== Testing AI & NLP Pipeline (Pakistani Roman Urdu + English) ===")
    train_file = str(SERVER_DIR / "app" / "data" / "training_dataset.json")
    ai = AIService(dataset_path=train_file)
    
    # Test 1: Electricity issue in Roman Urdu
    res1 = ai.process_complaint("electricity nhi arahi hai subha se transformer trip ho gaya hai")
    assert res1.predicted_category == "Electricity & Power Outage", f"Expected Electricity, got {res1.predicted_category}"
    assert "Power" in res1.recommended_department or "Electric" in res1.recommended_department
    print(f"[PASS] Electricity Urdu test: Category='{res1.predicted_category}', Priority='{res1.predicted_priority}', Dept='{res1.recommended_department}'")
    
    # Test 2: Sweeper / Waste issue in Roman Urdu
    res2 = ai.process_complaint("sweeper safai nhi kr raha pichle 2 hafton se kachra phail gaya hai")
    assert res2.predicted_category == "Waste & Sanitation", f"Expected Waste & Sanitation, got {res2.predicted_category}"
    print(f"[PASS] Sweeper Urdu test: Category='{res2.predicted_category}', Priority='{res2.predicted_priority}'")
    
    # Test 3: Gas Load shedding in Roman Urdu
    res3 = ai.process_complaint("gas ki load shedding ho rahi hai subha se chulha nahi chal raha")
    assert res3.predicted_category == "Gas Supply & Loadshedding", f"Expected Gas Supply, got {res3.predicted_category}"
    print(f"[PASS] Gas Load Shedding test: Category='{res3.predicted_category}'")

    # Test 4: Gutter / Sewerage issue
    res4 = ai.process_complaint("gutter ubal raha hai manhole ka dhakkan gayab hai")
    assert res4.predicted_category == "Drainage & Sewerage"
    print(f"[PASS] Gutter / Drainage test: Category='{res4.predicted_category}'")


def test_database_and_complaint_manager():
    print("\n=== Testing Database & Complaint Manager Integration ===")
    test_db = str(SERVER_DIR / "test_civic.db")
    if os.path.exists(test_db):
        try: os.remove(test_db)
        except Exception: pass
        
    seed_file = str(SERVER_DIR / "app" / "data" / "seed_complaints.json")
    db = DatabaseManager(db_path=test_db, seed_path=seed_file)
    assert db.count_complaints() >= 30, f"Expected at least 30 seeded complaints, got {db.count_complaints()}"
    
    ai = AIService(dataset_path=str(SERVER_DIR / "app" / "data" / "training_dataset.json"))
    stats = StatisticalEngine()
    notifier = NotificationManager(db_manager=db)
    mgr = ComplaintManager(db, ai, notifier, stats)
    
    # Register new complaint in Roman Urdu
    result = mgr.register_complaint(
        citizen_name="Muhammad Ali",
        citizen_phone="+92 300 1234567",
        citizen_email="ali@example.com",
        ward="Lahore - Model Town",
        location="Link Road Model Town",
        description="sweeper safai nhi kr raha aur kachray ka dher laga hua hai"
    )
    
    new_cmp = result["complaint"]
    assert new_cmp["category"] == "Waste & Sanitation"
    assert "Solid Waste" in new_cmp["assigned_department"]
    
    # Verify statistical report generation
    report = mgr.get_statistical_report()
    assert report["total_complaints"] > 30
    assert "mean_hours" in report["resolution_time_stats"]
    assert "central_tendency_insight" in report["statistical_interpretation"]
    
    # Clean up test DB safely on Windows
    try:
        if os.path.exists(test_db):
            os.remove(test_db)
    except Exception:
        pass
        
    print("[PASS] Full end-to-end integration verified successfully.")


if __name__ == "__main__":
    print("=========================================================")
    print("RUNNING AI SMART CIVIC SERVICES AUTOMATED TEST SUITE")
    print("=========================================================")
    test_oop_entities()
    test_statistical_engine()
    test_ai_pipeline()
    test_database_and_complaint_manager()
    print("\nALL BENCHMARK TEST SUITES COMPLETED WITH 100% PASS RATE!")
