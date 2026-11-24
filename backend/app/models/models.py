import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), default="farmer") # "farmer" or "admin"
    farmer_ref = Column(String(50), nullable=True) # e.g. "FV12345"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. "FV12345"
    name = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=False)
    village = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False) # e.g. "Durg"
    state = Column(String(100), nullable=False) # e.g. "Chhattisgarh"
    land_area_acres = Column(Float, nullable=False)
    crop = Column(String(50), nullable=False) # "Paddy", "Wheat", etc.
    category = Column(String(50), nullable=False) # "Small Farmer", "Marginal Farmer", "Large Farmer"
    bank_name = Column(String(100), nullable=False)
    account_number_masked = Column(String(50), nullable=False) # "SBIN*******1234"
    kcc_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    loans = relationship("Loan", back_populates="farmer", cascade="all, delete-orphan")
    msp_records = relationship("MSPRecord", back_populates="farmer", cascade="all, delete-orphan")
    insurance_records = relationship("InsuranceRecord", back_populates="farmer", cascade="all, delete-orphan")
    grievances = relationship("Grievance", back_populates="farmer", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="farmer", cascade="all, delete-orphan")

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    loan_ref = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    bank_name = Column(String(100), nullable=False)
    loan_type = Column(String(50), default="Crop Loan") # "Crop Loan", "KCC", "Term Loan"
    approved_amount = Column(Float, nullable=False)
    disbursed_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, default=7.0)
    deductions = Column(Float, default=0.0)
    repayments = Column(Float, default=0.0)
    difference = Column(Float, default=0.0)
    status = Column(String(50), default="Verified") # "Verified", "Needs Review", "Possible Discrepancy"
    reasons = Column(JSON, default=list) # List of potential reasons
    loan_date = Column(String(50), nullable=False)
    verification_status = Column(String(50), default="Verified") # "Verified", "Needs Review", "Not Verified"
    reason_codes = Column(JSON, default=list) # e.g. ["DISBURSEMENT_MISMATCH"]
    last_verified_at = Column(String(50), nullable=True)
    sanction_doc_name = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="loans")
    events = relationship("LoanEvent", back_populates="loan", cascade="all, delete-orphan", order_by="LoanEvent.id.asc()")

class LoanEvent(Base):
    __tablename__ = "loan_events"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    event_type = Column(String(50), nullable=False) # application, sanction, disbursement, deduction, repayment, interest_accrual, closure, note
    fee_type = Column(String(50), nullable=True) # e.g. processing_fee, crop_insurance, documentation_charges
    date = Column(String(50), nullable=False) # e.g. "2024-03-01" or "01-03-2024"
    amount = Column(Float, default=0.0)
    direction = Column(String(20), default="neutral") # "credit", "debit", "neutral"
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    source = Column(String(200), default="Bank Record")
    data_origin = Column(String(50), default="bank_statement") # "sanction_letter", "bank_statement", "user_entered", "demo"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    loan = relationship("Loan", back_populates="events")

class LoanProduct(Base):
    __tablename__ = "loan_products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    name_hi = Column(String(200), nullable=True)
    level = Column(String(50), default="Central") # "Central" or "State"
    state = Column(String(100), nullable=True) # None for Central, "Chhattisgarh" etc. for State
    lender_type = Column(String(100), nullable=False) # "Commercial Bank", "Cooperative / RRB", "NBFC", "Government Scheme"
    purpose = Column(String(100), nullable=False) # "Crop Production", "Farm Mechanization", "Irrigation & Solar", "Post-Harvest Infrastructure", "Dairy & Animal Husbandry", "Fisheries"
    purpose_hi = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    max_amount_rule = Column(String(200), nullable=False)
    interest_rate_rule = Column(String(200), nullable=False)
    tenure = Column(String(100), nullable=False)
    collateral_rule = Column(String(200), nullable=False)
    required_documents = Column(JSON, default=list)
    eligibility_rules = Column(JSON, default=dict)
    official_url = Column(String(255), nullable=True)
    source_name = Column(String(200), default="Ministry of Agriculture & Farmers Welfare, GoI")
    source_document = Column(String(255), default="RBI Operational Guidelines")
    last_verified_on = Column(String(50), default="2025-04-10")
    status = Column(String(50), default="verified") # "verified" or "demo"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MSPRecord(Base):
    __tablename__ = "msp_records"

    id = Column(Integer, primary_key=True, index=True)
    record_ref = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    crop = Column(String(50), nullable=False)
    variety_grade = Column(String(50), default="Common")
    season = Column(String(50), default="Kharif 2024-25")
    year = Column(String(20), default="2024")
    state = Column(String(100), default="Chhattisgarh")
    procurement_center = Column(String(100), default="Patan Krishi Upaj Mandi")
    farmer_reg_id_masked = Column(String(50), default="CG-KRY-****891")
    receipt_no_masked = Column(String(50), default="REC-PTN-****441")
    quantity_quintals = Column(Float, nullable=False)
    weight_slip_quantity = Column(Float, nullable=True)
    recorded_quantity = Column(Float, nullable=True)
    msp_rate = Column(Float, nullable=False)  # Statutory rate per quintal e.g. 2300
    state_bonus_per_quintal = Column(Float, default=0.0)
    expected_payment = Column(Float, nullable=False)
    actual_payment = Column(Float, nullable=False)
    difference = Column(Float, default=0.0)
    status = Column(String(50), default="Needs Review")  # "Verified", "Needs Review", "Possible Discrepancy"
    payment_date = Column(String(50), nullable=False)
    reasons = Column(JSON, default=list)
    adjustments = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="msp_records")
    events = relationship("MSPEvent", back_populates="msp_record", cascade="all, delete-orphan", order_by="MSPEvent.date")

class MSPEvent(Base):
    __tablename__ = "msp_events"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("msp_records.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # registered, produce_delivered, quality_checked, weighed, procurement_recorded, payment_initiated, payment_credited, payment_failed, query_raised, note
    date = Column(String(50), nullable=False)
    amount = Column(Float, nullable=True)
    quantity = Column(Float, nullable=True)
    description_en = Column(String(255), nullable=False)
    description_hi = Column(String(255), nullable=False)
    source = Column(String(100), default="APMC Mandi e-NAM Portal")
    data_origin = Column(String(50), default="official")  # official, procurement_record, user_entered, demo
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    msp_record = relationship("MSPRecord", back_populates="events")

class AdjustmentRule(Base):
    __tablename__ = "adjustment_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # mandi_fee, commission, hamali, transport, bardana, quality_cut, loan_recovery
    fee_type = Column(String(20), default="fixed")  # fixed (₹/qtl) or percentage (%)
    rate_or_value = Column(Float, nullable=False)
    state = Column(String(50), default="Chhattisgarh")
    mandi_name = Column(String(100), default="All Mandis")
    authority = Column(String(100), default="State Agricultural Marketing Board (Mandi Board)")
    source_document = Column(String(150), default="APMC Mandi By-Laws & Fee Schedule 2024")
    official_url = Column(String(200), default="https://agriportal.cg.nic.in")
    last_verified_on = Column(String(50), default="2025-04-10")
    status = Column(String(50), default="verified")  # verified | demo
    data_origin = Column(String(50), default="official")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InsuranceRecord(Base):
    __tablename__ = "insurance_records"

    id = Column(Integer, primary_key=True, index=True)
    insurance_ref = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    crop = Column(String(50), nullable=False)
    season = Column(String(50), default="Kharif 2024")
    state = Column(String(100), default="Chhattisgarh")
    district = Column(String(100), default="Durg")
    insured_area_hectares = Column(Float, default=2.0)
    sum_insured = Column(Float, default=80000.0) # Total sum insured for insured acreage
    premium_paid = Column(Float, default=0.0)
    loss_intimated_date = Column(String(50), default="2024-09-12")
    survey_date = Column(String(50), default="2024-09-16")
    assessed_loss_percentage = Column(Float, default=37.5) # e.g. 37.5%
    claim_amount_calculated = Column(Float, default=30000.0)
    claim_amount_expected = Column(Float, nullable=False)
    amount_received = Column(Float, nullable=False)
    difference = Column(Float, default=0.0)
    claim_status = Column(String(50), default="Under Review") # "Under Review", "Needs Review", "Verified"
    filing_date = Column(String(50), nullable=False)
    last_status_date = Column(String(50), default="2024-11-05")
    reasons = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="insurance_records")
    events = relationship("ClaimEvent", back_populates="claim", cascade="all, delete-orphan", order_by="ClaimEvent.id.asc()")

class ClaimEvent(Base):
    __tablename__ = "claim_events"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("insurance_records.id"), nullable=False)
    event_type = Column(String(50), nullable=False) # policy_enrolled, loss_intimated, survey_done, claim_calculated, claim_approved, amount_credited, rejected, query_raised, note
    date = Column(String(50), nullable=False)
    amount = Column(Float, nullable=True)
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=False)
    source = Column(String(200), default="PMFBY National Portal")
    data_origin = Column(String(50), default="official") # "official", "bank_document", "user_entered", "demo"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("InsuranceRecord", back_populates="events")

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    title_hi = Column(String(200), nullable=True)
    level = Column(String(50), default="Central") # "Central" or "State"
    state = Column(String(100), nullable=True) # None for Central, state name for State
    category = Column(String(50), nullable=False) # "Subsidy", "Insurance", "Loan", "Income Support", "Irrigation", "Equipment"
    description = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    short_description = Column(String(255), nullable=True)
    eligibility_summary = Column(Text, nullable=True)
    benefits = Column(Text, nullable=False)
    benefits_hi = Column(Text, nullable=True)
    eligibility_rules = Column(JSON, default=dict)
    documents_required = Column(JSON, default=list)
    deadline = Column(String(50), nullable=False)
    official_url = Column(String(255), nullable=True) # Must be official .gov.in or .nic.in
    myscheme_url = Column(String(255), nullable=True)
    source_note = Column(String(255), nullable=True)
    last_verified_on = Column(String(50), nullable=True)
    ministry = Column(String(200), default="Ministry of Agriculture and Farmers Welfare")
    source = Column(String(100), default="myScheme.gov.in")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    grievance_ref = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    farmer_name = Column(String(100), nullable=False)
    issue_type = Column(String(100), nullable=False) # "Loan Discrepancy", "MSP Payment Delay", etc.
    description = Column(String(500), nullable=False)
    status = Column(String(50), default="Open") # "Open", "In Progress", "Resolved", "Escalated"
    attachment_name = Column(String(200), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="grievances")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    doc_uuid = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(String(50), index=True, nullable=False) # Owner farmer_id (e.g. "FV12345")
    category = Column(String(50), nullable=False) # Identity, Land, Bank, Insurance, Scheme, Other
    original_name = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    note = Column(String(500), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    masked_id = Column(String(100), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_ref = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    title = Column(String(200), nullable=False)
    title_hi = Column(String(200), nullable=True)
    report_type = Column(String(100), nullable=False) # "Loan Verification", "MSP Payment", etc.
    status = Column(String(50), default="Verified")
    difference_amount = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    file_size = Column(String(20), default="1.2 MB")
    file_path = Column(String(300), nullable=True)
    report_date = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="reports")

class Office(Base):
    __tablename__ = "offices"

    id = Column(Integer, primary_key=True, index=True)
    office_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    name_hi = Column(String(200), nullable=True)
    office_type = Column(String(50), nullable=False, index=True) # "KVK", "APMC", "DDA", "Soil Lab", "CSC", "Bank"
    category_label = Column(String(100), nullable=True)
    address = Column(Text, nullable=False)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    pin_code = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    opening_hours = Column(String(100), default="Mon-Sat: 10:00 AM - 5:00 PM")
    services_offered = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(String(50), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    category = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    attached_doc_uuid = Column(String(50), nullable=True)
    status = Column(String(50), default="Open")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RuleSource(Base):
    __tablename__ = "rule_sources"

    id = Column(Integer, primary_key=True, index=True)
    rule_code = Column(String(50), unique=True, index=True, nullable=False)
    scheme_name = Column(String(100), nullable=False)
    rule_type = Column(String(50), nullable=False, index=True) # loan_disbursement, interest_subvention, processing_fee, msp, insurance_claim
    crop = Column(String(50), nullable=True)
    season = Column(String(50), nullable=True)
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=False)
    formula_or_value = Column(String(200), nullable=False)
    source_name = Column(String(200), nullable=False)
    source_document = Column(String(300), nullable=False)
    source_url = Column(String(500), nullable=True)
    effective_from = Column(String(50), nullable=False)
    effective_to = Column(String(50), nullable=True)
    last_verified_on = Column(String(50), nullable=False)
    status = Column(String(20), default="verified") # verified, demo, unverified
    data_origin = Column(String(30), default="official") # official, bank_document, user_entered, demo
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CallbackRequest(Base):
    __tablename__ = "callback_requests"

    id = Column(Integer, primary_key=True, index=True)
    callback_ref = Column(String(50), unique=True, index=True, nullable=True)
    farmer_id = Column(String(50), nullable=False, index=True)
    raw_phone = Column(String(30), nullable=True, default="+91 98765 43210")
    phone_masked = Column(String(50), nullable=False)
    topic = Column(String(100), nullable=False)
    preferred_language = Column(String(20), default="hi")
    status = Column(String(50), default="Pending") # "Pending", "Called", "Closed"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ToolAuditLog(Base):
    __tablename__ = "tool_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    tool_name = Column(String(100), nullable=False, index=True)
    farmer_id = Column(String(50), nullable=False, index=True)
    outcome = Column(String(50), nullable=False) # "success", "not_found", "unauthorized", "confirmation_required", "error"
    details = Column(String(255), nullable=True) # no personal sensitive data



