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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="loans")

class MSPRecord(Base):
    __tablename__ = "msp_records"

    id = Column(Integer, primary_key=True, index=True)
    record_ref = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    crop = Column(String(50), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    msp_rate = Column(Float, nullable=False) # Rate per quintal e.g. 2300
    expected_payment = Column(Float, nullable=False)
    actual_payment = Column(Float, nullable=False)
    difference = Column(Float, default=0.0)
    status = Column(String(50), default="Verified") # "Verified", "Needs Review", "Possible Discrepancy"
    procurement_center = Column(String(100), default="Patan Mandi")
    payment_date = Column(String(50), nullable=False)
    reasons = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="msp_records")

class InsuranceRecord(Base):
    __tablename__ = "insurance_records"

    id = Column(Integer, primary_key=True, index=True)
    insurance_ref = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    crop = Column(String(50), nullable=False)
    season = Column(String(50), default="Kharif 2024")
    premium_paid = Column(Float, default=0.0)
    claim_amount_expected = Column(Float, nullable=False)
    amount_received = Column(Float, nullable=False)
    difference = Column(Float, default=0.0)
    claim_status = Column(String(50), default="Under Review") # "Under Review", "Needs Review", "Verified"
    filing_date = Column(String(50), nullable=False)
    reasons = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="insurance_records")

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


