# KisanVerify (किसानवेरीफाई)

> **"Every rupee. Every benefit. Verified."**  
> *Agricultural Financial Transparency & Policy Simplification Platform*

KisanVerify is a farmer-first agricultural financial transparency platform that makes financial records, government subsidies, and bank reconciliations clear, verifiable, and actionable. It empowers Indian farmers to audit their Kisan Credit Card (KCC) loans, Minimum Support Price (MSP) grain sales, crop insurance payouts (PMFBY), and direct benefit transfers (PM-KISAN).

By comparing sanctioned vs. disbursed funds and expected vs. actual market payouts, KisanVerify deterministically flags records that may need institutional review, explains discrepancies in plain conversational Hindi and English without accusatory rhetoric, enables voice interactions for low-literacy users, and provides administrative oversight tools for banks and agricultural officials.

---

## 🏛️ System Architecture

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

---

## 🎯 Core Engineering Principles

1. **Deterministic Calculations First**: All mathematical reconciliations (differences, deductions, interest rates, eligibility criteria) are calculated strictly in verified, unit-tested Python functions. **The AI never computes or hallucinates financial balances.**
2. **Neutral & Non-Accusatory Tone**: All discrepancy notices explicitly state *"Needs Review"* or *"Possible Discrepancy"*. Explanations guide farmers towards transparent bank verification rather than alleging misconduct or fraud.
3. **Inclusive & Accessible**:
   - Palette: Earthy sage/olive green (`#2E6930`, `#F4F8F3`, `#3A7D44`) matching rural design standards.
   - Large touch-friendly controls (minimum 48px height) for mobile field use.
   - Native Hindi (`hi-IN`) and English voice input (STT) and voice speech-out (TTS) via Web Speech API.
   - Official downloadable PDF reports with QR verification stamps and audit trails.

---

## 📱 Feature Highlights

### Farmer Portal (Mobile-First & Desktop Adaptive)
- **Home Hub**: Farmer greeting (`Namaste, Ramesh Kumar`), quick speech inquiry mic, 4 core action tiles (My Schemes, My Loan, MSP Payments, Crop Insurance), and attention alerts.
- **Deterministic Verification Engines**:
  - **KCC Loan Verification**: Sanctioned vs. disbursed audit, processing/insurance deductions table, interest subvention audit.
  - **MSP Mandi Verification**: Weight $\times$ MSP benchmark formula vs. bank account credit difference breakdown.
  - **Crop Insurance (PMFBY)**: Assessed loss claim vs. credited compensation tracker.
- **Multilingual AI Assistant**: Conversational explanations powered by Gemini with offline deterministic fallback. Quick question chips, full text-to-speech, and microphone input.
- **Scheme Eligibility Checker**: Dynamic eligibility rule engine covering PM-KISAN, PMFBY, KCC, and State Input Subsidies with document checklists and deadlines.
- **Official Grievance Flow**: Form with 300-character description limit, optional document upload, and automated tracking ticket generation (e.g. `GRV-2025-0891`).
- **Reports & PDF Export**: Instant download of official, tamper-evident discrepancy audit reports generated via ReportLab.

### Bank & Administrative Console
- **Executive Stat Cards**: Real-time counts of Total Processed Records, 100% Verified Accounts, Flagged Discrepancies, and Pending Grievances.
- **Interactive Discrepancy Case Management**: Search and filter by district, branch, or status with one-click case resolution and escalation modal.
- **Data Analytics (Recharts)**: Bar charts for discrepancies by district, status breakdown donuts, and weekly trend analysis.
- **Audit Export**: Single-click CSV export of all audit logs for district lead bank meetings and vigilance reviews.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, canvas-confetti, react-router-dom.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy ORM, SQLite (`kisanverify.db`), ReportLab, PyMuPDF.
- **AI Intelligence**: Google Gemini API via `google-genai` SDK with deterministic rule-based template fallback.
- **Voice Interactivity**: Browser Web Speech API (`SpeechRecognition` & `speechSynthesis`) in Hindi and English.
- **Testing**: Pytest with automated coverage for zero-difference, negative difference, deduction breakdowns, and non-accusatory language rules.

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yaminii-sahu/KishanVerify.git
cd KishanVerify
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed synthetic demo data
python -m app.core.seed

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
*API interactive documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 3. Frontend Setup
```bash
# In a new terminal window:
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*The web application will open at: [http://localhost:5173](http://localhost:5173)*

---

## 🧪 Running Automated Tests

Run the complete backend verification suite:
```bash
cd backend
.venv\Scripts\python -m pytest tests -v
```

All 19 test cases validate:
- Loan verification arithmetic ($80,000 - 70,000 = 10,000$ discrepancy).
- Zero-difference exact match confirmation.
- Negative difference (excess credit) handling.
- Mandatory non-accusatory phrasing verification (ensuring terms like "fraud" or "scam" never appear).
- Scheme eligibility rule engine logic across small/marginal farmers.
- AI bilingual translation and fallback consistency.

---

## 🎬 End-to-End Demo Walkthrough

1. **Login & Role Selection**:
   - Access [http://localhost:5173](http://localhost:5173).
   - Click **"Demo: Farmer Login"** to enter as Ramesh Kumar (Durg, Chhattisgarh).
2. **Review Home Dashboard**:
   - Notice the prominent banner: *"2 Records Need Attention"*.
   - Tap on the **"My Loan"** tile.
3. **Verify Loan Discrepancy**:
   - The form automatically loads Ramesh's Kisan Credit Card record: Sanctioned ₹80,000 vs. Disbursed ₹70,000.
   - Click **"Verify Details"**.
   - Review the calculated ₹10,000 difference and itemized deductions (processing fee ₹500, crop insurance premium ₹1,200, unreleased balance ₹8,300).
4. **Bilingual AI Voice Explanation**:
   - Click **"Explain in Hindi (हिंदी में समझें)"** to receive a clear, empathetic explanation:
     > *"नमस्ते रमेश जी, आपके किसान क्रेडिट कार्ड ऋण में ₹10,000 का अंतर दिख रहा है..."*
   - Click the audio button to hear the explanation read aloud.
5. **Download Official Audit Report**:
   - Click **"Download Discrepancy Report"** to view and download the official stamped PDF.
6. **Switch to Bank/Admin Console**:
   - Click the header role switcher or navigate to `/admin`.
   - Observe the real-time stat cards and the flagged case for Ramesh Kumar.
   - Click **"Review"** to inspect the case details and mark it as **"Resolved"** with an official note.

---

## ⚖️ Legal & Ethical Transparency

- **Synthetic Data**: All names, account numbers, and land parcels shown are strictly synthetic demo data for evaluation purposes.
- **Advisory Only**: KisanVerify is an independent verification tool. Findings should be confirmed with the respective bank branch or agricultural department.

---

*Developed for the Agricultural Financial Transparency Hackathon.*  
*Repository: [https://github.com/yaminii-sahu/KishanVerify.git](https://github.com/yaminii-sahu/KishanVerify.git)*
