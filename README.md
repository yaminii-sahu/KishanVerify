# KisanVerify (किसानवेरीफाई)

> **"Every rupee. Every benefit. Verified."**  
> *Agricultural Financial Transparency & Policy Simplification Platform*

KisanVerify is a farmer-first transparency platform that makes agricultural financial records understandable. It empowers farmers to verify agricultural loans, Minimum Support Price (MSP) payments, crop insurance claims, and government scheme entitlements. 

By comparing approved vs disbursed amounts and expected vs received payouts, KisanVerify identifies records that may need review, explains discrepancies in plain Hindi and English without accusatory language, offers voice-driven assistance, and provides actionable grievance reporting for banks and administrative authorities.

---

## Architecture Overview

```
                                      +--------------------------+
                                      |   Farmer Mobile & Web    |
                                      |   Admin Web Dashboard    |
                                      +-------------+------------+
                                                    | (REST / JSON)
                                                    v
+---------------------------------------------------+---------------------------------------------------+
|                                            FastAPI Backend                                            |
|                                                                                                       |
|  +--------------------+   +-----------------------+   +-----------------------+   +----------------+  |
|  | Verification Engine|   | Scheme Recommendation |   |  AI Policy Simplifier |   | PDF Generation |  |
|  | (Deterministic)   |   | (Rule-Based Engine)   |   |  (Gemini + Fallback)  |   | & OCR Intake   |  |
|  +--------------------+   +-----------------------+   +-----------------------+   +----------------+  |
|                                                    |                                                  |
|                                                    v                                                  |
|                               +--------------------+---------------------+                            |
|                               |     SQLAlchemy ORM + SQLite / PG         |                            |
|                               +------------------------------------------+                            |
+-------------------------------------------------------------------------------------------------------+
```

## Core Principles

1. **Deterministic Calculations First**: All math (differences, deductions, percentages, eligibility criteria) is calculated deterministically in tested Python modules. The AI never invents numbers or balances.
2. **Neutral & Non-Accusatory Wording**: We flag records as *"Needs Review"* or *"Possible Discrepancy"*. Wording explicitly notes that discrepancies are not proof of wrongdoing and suggests transparent steps.
3. **Accessibility First**: Designed with large touch targets, high-contrast sage/olive theme, bilingual support (Hindi / English), and voice synthesis/recognition.

---

## Project Structure

```
KishanVerify/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS Farmer & Admin UI
├── backend/              # FastAPI Python backend (Engine, ORM, AI, Reports, PDF)
│   ├── app/
│   │   ├── api/          # Routers (auth, schemes, verify, grievances, reports, admin)
│   │   ├── core/         # Config, security, database session
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Verification engine, eligibility engine, AI, PDF/OCR
│   └── tests/            # Pytest test suite for deterministic calculation edge cases
├── docs/                 # Blueprint specification & UI design assets
├── .env.example          # Sample environment variables
├── .gitignore            # Git ignore specification
└── README.md             # Project documentation
```

---

*Built with precision for the Agricultural Financial Transparency Hackathon.*
