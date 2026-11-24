from typing import Optional, List
from pydantic import BaseModel, Field

class LoanVerifyRequest(BaseModel):
    bank_name: str = "State Bank of India"
    loan_account_ref: Optional[str] = "SBIN*******1234"
    loan_type: Optional[str] = "Crop Loan (KCC)"
    approved_amount: float = Field(..., gt=0, description="Sanctioned loan amount in Rupees")
    disbursed_amount: float = Field(..., ge=0, description="Actual amount credited into account")
    interest_rate: Optional[float] = 7.0
    deductions: Optional[float] = 0.0
    repayments: Optional[float] = 0.0
    loan_date: Optional[str] = "2024-03-12"
    farmer_id: Optional[str] = "FV12345"

class MSPVerifyRequest(BaseModel):
    crop: str = "Paddy"
    quantity_quintals: float = Field(..., gt=0, description="Quantity sold in quintals")
    msp_rate: float = Field(..., gt=0, description="MSP rate per quintal in Rupees")
    actual_payment: float = Field(..., ge=0, description="Actual payment received in Rupees")
    procurement_center: Optional[str] = "Patan Mandi"
    state_bonus_per_quintal: Optional[float] = Field(0.0, ge=0, description="State bonus per quintal in Rupees")
    adjustments: Optional[List[dict]] = Field(default=None, description="Optional list of itemized adjustments")
    payment_date: Optional[str] = "2024-04-05"
    farmer_id: Optional[str] = "FV12345"

class InsuranceVerifyRequest(BaseModel):
    insurance_ref: Optional[str] = "INS-2024-7711"
    crop: str = "Paddy"
    season: Optional[str] = "Kharif 2024"
    claim_amount_expected: Optional[float] = Field(None, ge=0, description="Expected assessed claim")
    amount_received: Optional[float] = Field(None, ge=0, description="Amount received")
    claim_status: Optional[str] = "Under Review"
    farmer_id: Optional[str] = "FV12345"
    sum_insured: Optional[float] = Field(None, ge=0, description="Total sum insured for parcel")
    insured_area_hectares: Optional[float] = Field(None, ge=0, description="Insured land area in hectares")
    assessed_loss_percentage: Optional[float] = Field(None, ge=0, le=100, description="Assessed crop loss percentage (0-100)")
    tolerance: Optional[float] = Field(100.0, ge=0, description="Matching tolerance in Rupees")
    rule_missing: Optional[bool] = Field(False, description="Flag indicating rule missing in registry")
