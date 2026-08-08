# System Architecture & Technical Specification

## AI Smart Civic Services Platform

---

## 1. High-Level Architecture Overview

The platform uses a layered, modular Object-Oriented Architecture (OOP) with clear separation of concerns between presentation, API controller routing, domain business services, machine learning inference, statistical computation, and data persistence.

```mermaid
graph TB
    subgraph "Client Tier (Single Page Web Application)"
        CP[Citizen Portal - Live Inference Preview]
        CC[Command Center - Kanban & Table Manager]
        ST[Statistical Intelligence Suite - Chart.js]
        LB[AI Explainability Lab]
        CA[Civic AI Assistant Widget]
    end

    subgraph "API Controller Tier (FastAPI & Pydantic)"
        API[FastAPI REST Router]
        DOCS[OpenAPI Documentation /docs]
    end

    subgraph "Core OOP Service Layer"
        CM[ComplaintManager]
        DM[DatabaseManager - SQLite Engine]
        NM[NotificationManager - Citizen Alerts]
        SE[StatisticalEngine - Mean, IQR, Fences]
    end

    subgraph "AI & Machine Learning Engine"
        AIS[AIService Facade]
        TC[TextClassificationService - TF-IDF + Naive Bayes]
        PE[PriorityEstimationService - Urgency Scorer]
        AS[ActionableSummarizerService - Entity Extraction]
        DD[DuplicateDetectionService - Cosine Similarity]
        VI[VisionInspectionService - Hazard Tags]
        CR[CivicAssistantService - RAG Knowledge Base]
    end

    subgraph "Persistent Storage"
        SQL[(SQLite Database: civic_service.db)]
    end

    CP <-->|HTTP / REST| API
    CC <-->|HTTP / REST| API
    ST <-->|HTTP / REST| API
    LB <-->|HTTP / REST| API
    CA <-->|HTTP / REST| API

    API --> CM
    API --> SE
    API --> AIS

    CM --> DM
    CM --> NM
    CM --> AIS
    CM --> SE

    AIS --> TC
    AIS --> PE
    AIS --> AS
    AIS --> DD
    AIS --> VI
    AIS --> CR

    DM <--> SQL
    SE <--> DM
```

---

## 2. Object-Oriented Class Hierarchy (Benchmark 3)

### 2.1 Domain Entities (`app.models.entities`)

```mermaid
classDiagram
    class Citizen {
        -String _name
        -String _phone
        -String _email
        -String _ward
        +name() String
        +phone() String
        +email() String
        +ward() String
        +to_dict() Dict
    }

    class Department {
        +String name
        +String contact_email
        +int active_tickets_count
        +get_recommended_department(category) String
    }

    class AIAnalysisResult {
        +String predicted_category
        +float confidence_score
        +String predicted_priority
        +float priority_score
        +String actionable_summary
        +String hazard_level
        +String recommended_department
        +bool duplicate_detected
        +String duplicate_of_id
        +float duplicate_similarity
        +List vision_tags
        +to_dict() Dict
    }

    class Complaint {
        +String id
        +Citizen citizen
        +String description
        +String location
        +String category
        +String priority
        +float priority_score
        -String _status
        +String assigned_department
        +String ai_summary
        +String hazard_level
        +String image_url
        +datetime created_at
        +datetime resolved_at
        +float resolution_hours
        +status() String
        +assign_to_department(dept_name) void
        +update_status(new_status) void
        +to_dict() Dict
    }

    Complaint *-- Citizen : contains
    Complaint --> Department : routes to
    Complaint ..> AIAnalysisResult : populated by
```

---

## 3. AI Service Class Hierarchy

```mermaid
classDiagram
    class BaseAIAnalyzer {
        <<abstract>>
        +analyze(text, **kwargs)* Any
    }

    class TextClassificationService {
        -Pipeline pipeline
        -bool is_trained
        +analyze(text) Dict
        -_heuristic_check(text) Tuple
        -_extract_key_tokens(text) List
    }

    class PriorityEstimationService {
        +List CRITICAL_TRIGGERS
        +List HIGH_TRIGGERS
        +List MEDIUM_TRIGGERS
        +analyze(text) Dict
    }

    class ActionableSummarizerService {
        +analyze(text, location) String
    }

    class VisionInspectionService {
        +analyze(image_url, **kwargs) Dict
    }

    class DuplicateDetectionService {
        -TfidfVectorizer vectorizer
        +find_duplicate(new_text, existing_list, threshold) Tuple
    }

    class CivicAssistantService {
        -Dict KNOWLEDGE_BASE
        +answer_query(message, count) Dict
    }

    class AIService {
        +TextClassificationService classifier
        +PriorityEstimationService priority_estimator
        +ActionableSummarizerService summarizer
        +DuplicateDetectionService duplicate_detector
        +VisionInspectionService vision_inspector
        +CivicAssistantService assistant
        +process_complaint(desc, loc, img, existing) AIAnalysisResult
    }

    BaseAIAnalyzer <|-- TextClassificationService
    BaseAIAnalyzer <|-- PriorityEstimationService
    BaseAIAnalyzer <|-- ActionableSummarizerService
    BaseAIAnalyzer <|-- VisionInspectionService

    AIService *-- TextClassificationService
    AIService *-- PriorityEstimationService
    AIService *-- ActionableSummarizerService
    AIService *-- DuplicateDetectionService
    AIService *-- VisionInspectionService
    AIService *-- CivicAssistantService
```

---

## 4. REST API Endpoint Specification

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System & AI model readiness status | None | Health JSON |
| `POST` | `/api/complaints` | Register complaint, run AI, persist & alert | `ComplaintCreateRequest` | Full registered complaint & AI output |
| `GET` | `/api/complaints` | Search & multi-filter complaints | Query params: `category`, `priority`, `status`, `ward`, `search` | List of `ComplaintResponse` |
| `GET` | `/api/complaints/{id}` | Retrieve specific complaint by ID | Path parameter | Single `ComplaintResponse` |
| `PATCH` | `/api/complaints/{id}/status` | Transition lifecycle status (Open $\to$ In Progress $\to$ Resolved) | `StatusUpdateRequest` | Updated complaint |
| `PATCH` | `/api/complaints/{id}/assign` | Reassign responsible municipal department | `AssignDepartmentRequest` | Updated complaint |
| `POST` | `/api/ai/analyze` | Live real-time AI inference preview for typing | `AIAnalyzeRequest` | `AIAnalyzeResponse` |
| `POST` | `/api/ai/assistant` | Interactive conversational RAG chatbot | `AssistantChatRequest` | `AssistantChatResponse` |
| `GET` | `/api/statistics` | Full Statistical Analytics payload | None | Descriptive stats, IQR, Fences, NL Insights |
| `POST` | `/api/seed/reset` | Reset SQLite database to 35 seed complaints | None | Confirmation JSON |
| `GET` | `/api/notifications` | View simulated SMS/Email audit logs | None | Notification array |
