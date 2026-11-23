import os
import sys

# Ensure backend root is on path when running as script
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import Base, engine, SessionLocal
from app.models.models import (
    User,
    Farmer,
    Loan,
    MSPRecord,
    InsuranceRecord,
    Scheme,
    Grievance,
    Report,
    Document,
)
from app.services.storage import get_storage_backend

DUMMY_PDF_BYTES = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
DUMMY_PNG_BYTES = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x03\x05\xfe\x02\xfe\x1c\xc1m\x00\x00\x00\x00IEND\xaeB`\x82"

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Farmer).filter_by(farmer_id="FV12345").first():
            print("Database already seeded with demo data.")
            return

        print("Seeding synthetic demo data for KisanVerify...")

        # 1. Users
        users = [
            User(
                username="ramesh",
                email="ramesh.kumar@example.com",
                hashed_password="demo_password_hash",
                role="farmer",
                farmer_ref="FV12345",
            ),
            User(
                username="admin_sbi",
                email="officer.durg@sbi.co.in",
                hashed_password="demo_password_hash",
                role="admin",
                farmer_ref=None,
            ),
        ]
        db.add_all(users)
        db.flush()

        # 2. Farmers
        ramesh = Farmer(
            farmer_id="FV12345",
            name="Ramesh Kumar",
            name_hi="रमेश कुमार",
            phone="+91 98765 43210",
            village="Patan",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=3.0,
            crop="Paddy",
            category="Small Farmer",
            bank_name="State Bank of India",
            account_number_masked="SBIN*******1234",
            kcc_active=True,
        )
        sita = Farmer(
            farmer_id="FV67890",
            name="Sita Devi",
            name_hi="सीता देवी",
            phone="+91 98111 22233",
            village="Gunderdehi",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=2.5,
            crop="Paddy",
            category="Small Farmer",
            bank_name="Chhattisgarh Rajya Gramin Bank",
            account_number_masked="CRGB*******5678",
            kcc_active=True,
        )
        mohan = Farmer(
            farmer_id="FV54321",
            name="Mohan Lal",
            name_hi="मोहन लाल",
            phone="+91 97222 33344",
            village="Bhilai Rural",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=4.0,
            crop="Wheat",
            category="Small Farmer",
            bank_name="Bank of Baroda",
            account_number_masked="BARB*******9012",
            kcc_active=False,
        )
        sunita = Farmer(
            farmer_id="FV99887",
            name="Sunita Bai",
            name_hi="सुनीता बाई",
            phone="+91 96333 44455",
            village="Kurud",
            district="Dhamtari",
            state="Chhattisgarh",
            land_area_acres=2.0,
            crop="Paddy",
            category="Marginal Farmer",
            bank_name="State Bank of India",
            account_number_masked="SBIN*******4433",
            kcc_active=True,
        )

        db.add_all([ramesh, sita, mohan, sunita])
        db.flush()

        # 3. Loans (Blueprint: Approved 80,000, Disbursed 70,000, Difference 10,000)
        loan1 = Loan(
            loan_ref="LN-2024-8812",
            farmer_id=ramesh.id,
            bank_name="State Bank of India",
            loan_type="Crop Loan (KCC)",
            approved_amount=80000.0,
            disbursed_amount=70000.0,
            interest_rate=7.5,
            deductions=5000.0,
            repayments=0.0,
            difference=10000.0,
            status="Needs Review",
            reasons=[
                "Deductions for processing fees and documentation charges",
                "Crop insurance premium auto-deduction (PMFBY)",
                "Bank policy variation on sanction limits",
            ],
            loan_date="12-03-2024",
        )
        loan2 = Loan(
            loan_ref="LN-2024-9104",
            farmer_id=sunita.id,
            bank_name="State Bank of India",
            loan_type="KCC Short-term",
            approved_amount=50000.0,
            disbursed_amount=50000.0,
            interest_rate=7.0,
            deductions=0.0,
            repayments=15000.0,
            difference=0.0,
            status="Verified",
            reasons=["All figures match the approved sanction letter."],
            loan_date="18-05-2024",
        )
        db.add_all([loan1, loan2])

        # 4. MSP Records (Blueprint: 50 quintals * 2300 = 115000 expected, 105000 actual, diff 10000)
        msp1 = MSPRecord(
            record_ref="MSP-2024-4411",
            farmer_id=ramesh.id,
            crop="Paddy (Common)",
            quantity_quintals=50.0,
            msp_rate=2300.0,
            expected_payment=115000.0,
            actual_payment=105000.0,
            difference=10000.0,
            status="Needs Review",
            procurement_center="Patan Krishi Upaj Mandi",
            payment_date="05-04-2024",
            reasons=[
                "Grade deduction / moisture standard variation applied",
                "Partial disbursement by procurement agency",
                "Mandi cess or weighing handling charges withheld",
            ],
        )
        msp2 = MSPRecord(
            record_ref="MSP-2024-4820",
            farmer_id=sita.id,
            crop="Paddy (Grade A)",
            quantity_quintals=50.0,
            msp_rate=2300.0,
            expected_payment=115000.0,
            actual_payment=115000.0,
            difference=0.0,
            status="Verified",
            procurement_center="Durg Mandi Samiti",
            payment_date="14-04-2024",
            reasons=["Payment credited in full per MSP notification."],
        )
        db.add_all([msp1, msp2])

        # 5. Insurance Records
        ins1 = InsuranceRecord(
            insurance_ref="INS-2024-7711",
            farmer_id=ramesh.id,
            crop="Paddy",
            season="Kharif 2024",
            premium_paid=1400.0,
            claim_amount_expected=30000.0,
            amount_received=20000.0,
            difference=10000.0,
            claim_status="Under Review",
            filing_date="28-03-2024",
            reasons=[
                "Crop cutting experiment (CCE) threshold yield assessment ongoing",
                "First installment released; second tranche awaiting state subsidy release",
            ],
        )
        ins2 = InsuranceRecord(
            insurance_ref="INS-2024-8199",
            farmer_id=mohan.id,
            crop="Wheat",
            season="Rabi 2023-24",
            premium_paid=1200.0,
            claim_amount_expected=30000.0,
            amount_received=20000.0,
            difference=10000.0,
            claim_status="Needs Review",
            filing_date="15-02-2024",
            reasons=["Acreage mismatch between Patwari girdawari and insurance portal"],
        )
        db.add_all([ins1, ins2])

        # 6. Schemes (Blueprint & Screenshots: PM-KISAN, PMFBY, KCC, Input Subsidy)
        schemes = [
            Scheme(
                scheme_code="PM-KISAN",
                title="PM-KISAN Samman Nidhi",
                title_hi="पीएम-किसान सम्मान निधि",
                category="Subsidy",
                description="Central sector scheme providing income support of ₹6,000 per year in three equal 4-monthly installments directly to farmer bank accounts.",
                description_hi="किसानों के बैंक खातों में सीधे तीन समान 4-मासिक किश्तों में प्रति वर्ष ₹6,000 की आय सहायता प्रदान करने वाली केंद्रीय योजना।",
                benefits="₹6,000 / year via Direct Benefit Transfer (DBT)",
                benefits_hi="₹6,000 प्रति वर्ष सीधे बैंक खाते में (डीबीटी)",
                eligibility_rules={
                    "max_land_holding": 999.0,
                    "categories": ["Small Farmer", "Marginal Farmer", "Large Farmer"],
                    "institutional_landholder": False,
                },
                documents_required=["Aadhaar Card", "Land Ownership Record (B-1/Khasra)", "Bank Passbook"],
                deadline="Apply by 31 Dec 2025",
                state="All India",
                myscheme_url="https://www.myscheme.gov.in/schemes/pm-kisan",
                ministry="Ministry of Agriculture and Farmers Welfare",
                source="myScheme.gov.in",
            ),
            Scheme(
                scheme_code="PMFBY",
                title="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                title_hi="प्रधानमंत्री फसल बीमा योजना",
                category="Insurance",
                description="Comprehensive crop insurance covering non-preventable natural risks from pre-sowing to post-harvest at very low farmer premiums (2% for Kharif, 1.5% for Rabi).",
                description_hi="बुवाई से पहले से लेकर कटाई के बाद तक गैर-रोकथाम प्राकृतिक जोखिमों को कवर करने वाला व्यापक फसल बीमा।",
                benefits="Up to ₹50,000/acre insurance sum assured against natural calamities",
                benefits_hi="प्राकृतिक आपदाओं के विरुद्ध ₹50,000/एकड़ तक की बीमा राशि",
                eligibility_rules={
                    "crops": ["Paddy", "Wheat", "Maize", "Pulses", "Oilseeds"],
                    "states": ["Chhattisgarh", "All India"],
                },
                documents_required=["Land Girdawari Certificate", "Sowing Certificate", "Aadhaar Card", "Bank Account Details"],
                deadline="Apply by 31 Mar 2026",
                state="All India",
                myscheme_url="https://www.myscheme.gov.in/schemes/pmfby",
                ministry="Ministry of Agriculture and Farmers Welfare",
                source="myScheme.gov.in",
            ),
            Scheme(
                scheme_code="KCC",
                title="Kisan Credit Card (KCC) Scheme",
                title_hi="किसान क्रेडिट कार्ड योजना",
                category="Loan",
                description="Timely, flexible and cost-effective institutional short-term credit for cultivation, post-harvest expenses and maintenance @ effective 4% interest upon prompt repayment.",
                description_hi="समय पर पुनर्भुगतान करने पर प्रभावी 4% ब्याज पर खेती और रख-रखाव के लिए समयबद्ध और लचीला संस्थागत ऋण।",
                benefits="Credit limit up to ₹3,00,000 with 3% prompt repayment subvention",
                benefits_hi="3% ब्याज छूट के साथ ₹3,00,000 तक की ऋण सीमा",
                eligibility_rules={
                    "land_holding_min": 0.1,
                    "age_min": 18,
                    "age_max": 75,
                },
                documents_required=["Land Title (B-1/Khasra Copy)", "Identity Proof", "Address Proof", "No-Dues Certificate"],
                deadline="Apply by 31 Dec 2025",
                state="All India",
                myscheme_url="https://www.myscheme.gov.in/schemes/kcc",
                ministry="Ministry of Agriculture and Farmers Welfare",
                source="myScheme.gov.in",
            ),
            Scheme(
                scheme_code="INPUT-SUB",
                title="Input Subsidy Scheme (Chhattisgarh)",
                title_hi="कृषि आदान सहायता योजना (छत्तीसगढ़)",
                category="Subsidy",
                description="State initiative providing financial support on seeds, micro-nutrients, bio-fertilizers and drip irrigation equipment to boost agricultural productivity.",
                description_hi="कृषि उत्पादकता बढ़ाने के लिए बीज, सूक्ष्म पोषक तत्वों, जैव उर्वरकों और ड्रिप सिंचाई पर वित्तीय सहायता।",
                benefits="Subsidy on seeds, fertilizers, and farm equipment up to ₹9,000/acre",
                benefits_hi="बीज, खाद और कृषि उपकरणों पर ₹9,000/एकड़ तक की सब्सिडी",
                eligibility_rules={
                    "states": ["Chhattisgarh"],
                    "categories": ["Small Farmer", "Marginal Farmer"],
                },
                documents_required=["Kisan Rin Pustika (KRP)", "Mandi Registration Slip", "Aadhaar"],
                deadline="Check details at local Krishi Kendra",
                state="Chhattisgarh",
                myscheme_url="https://www.myscheme.gov.in/schemes/smam",
                ministry="Department of Agriculture & Farmers Welfare",
                source="myScheme.gov.in",
            ),
        ]
        db.add_all(schemes)

        # 7. Grievances
        grievances = [
            Grievance(
                grievance_ref="GRV-2025-0891",
                farmer_id=ramesh.id,
                farmer_name=ramesh.name,
                issue_type="Loan Discrepancy",
                description="Approved loan amount was ₹80,000 under KCC, but bank disbursed ₹70,000 into my savings account. Please review the ₹10,000 difference.",
                status="In Progress",
                attachment_name="Loan_Sanction_SBI_Patan.pdf",
                resolution_notes="Case assigned to SBI Patan Branch Manager for review of processing fee & PMFBY deductions.",
            ),
            Grievance(
                grievance_ref="GRV-2025-0914",
                farmer_id=mohan.id,
                farmer_name=mohan.name,
                issue_type="MSP Payment Delay",
                description="Procurement receipt showed 50 quintals wheat at MSP ₹2,275, but total disbursement is delayed by over 25 days.",
                status="Open",
                attachment_name="Wheat_Mandi_Slip.pdf",
                resolution_notes="Forwarded to District Food & Civil Supplies Officer Durg.",
            ),
        ]
        db.add_all(grievances)

        # 8. Reports (Matching screenshot My Reports list)
        reports = [
            Report(
                report_ref="REP-LN-2025-01",
                farmer_id=ramesh.id,
                title="Loan Verification Report",
                title_hi="ऋण सत्यापन रिपोर्ट",
                report_type="Loan Verification",
                status="Needs Review",
                difference_amount=10000.0,
                summary="State Bank of India Loan LN-2024-8812 approved for ₹80,000 vs disbursed ₹70,000. Difference of ₹10,000 flagged for processing fee / insurance verification.",
                file_size="1.2 MB",
                report_date="12 Apr 2025",
            ),
            Report(
                report_ref="REP-MSP-2025-02",
                farmer_id=ramesh.id,
                title="MSP Payment Report",
                title_hi="एमएसपी भुगतान रिपोर्ट",
                report_type="MSP Payment",
                status="Verified",
                difference_amount=0.0,
                summary="Paddy procurement of 50 quintals at ₹2,300/qtl. Record matches expected payment of ₹1,15,000.",
                file_size="950 KB",
                report_date="05 Apr 2025",
            ),
            Report(
                report_ref="REP-INS-2025-03",
                farmer_id=ramesh.id,
                title="Insurance Claim Report",
                title_hi="फसल बीमा दावा रिपोर्ट",
                report_type="Insurance Claim",
                status="Under Review",
                difference_amount=10000.0,
                summary="PMFBY Claim INS-2024-7711 for Paddy Kharif. ₹20,000 released; ₹10,000 second tranche under administrative review.",
                file_size="1.4 MB",
                report_date="28 Mar 2025",
            ),
            Report(
                report_ref="REP-SCH-2025-04",
                farmer_id=ramesh.id,
                title="Scheme Eligibility Report",
                title_hi="योजना पात्रता रिपोर्ट",
                report_type="Scheme Eligibility",
                status="Verified",
                difference_amount=0.0,
                summary="Potentially eligible for PM-KISAN, PMFBY, KCC, and Chhattisgarh Input Subsidy Scheme based on 3.0-acre landholding in Durg.",
                file_size="800 KB",
                report_date="20 Mar 2025",
            ),
        ]
        db.add_all(reports)

        # 9. My Documents Vault (Ramesh Kumar - FV12345)
        storage = get_storage_backend()
        aadhaar_file = storage.save(DUMMY_PDF_BYTES, "pdf")
        khasra_file = storage.save(DUMMY_PDF_BYTES, "pdf")
        passbook_file = storage.save(DUMMY_PNG_BYTES, "png")
        insurance_file = storage.save(DUMMY_PDF_BYTES, "pdf")
        sanction_file = storage.save(DUMMY_PDF_BYTES, "pdf")

        import uuid
        documents = [
            Document(
                doc_uuid=str(uuid.uuid4()),
                farmer_id="FV12345",
                category="Identity",
                original_name="Aadhaar_Card_Ramesh.pdf",
                stored_filename=aadhaar_file,
                mime_type="application/pdf",
                size_bytes=len(DUMMY_PDF_BYTES),
                note="Aadhaar verified with bank for DBT transfers",
                masked_id="XXXX-XXXX-8921",
            ),
            Document(
                doc_uuid=str(uuid.uuid4()),
                farmer_id="FV12345",
                category="Land",
                original_name="Khasra_B1_Patan_142.pdf",
                stored_filename=khasra_file,
                mime_type="application/pdf",
                size_bytes=len(DUMMY_PDF_BYTES),
                note="3.0 Acres Land Record for Patan, Durg",
                masked_id="KH-142/1",
            ),
            Document(
                doc_uuid=str(uuid.uuid4()),
                farmer_id="FV12345",
                category="Bank",
                original_name="SBI_Passbook_FrontPage.png",
                stored_filename=passbook_file,
                mime_type="image/png",
                size_bytes=len(DUMMY_PNG_BYTES),
                note="SBI Patan Branch savings account",
                masked_id="SBIN*******1234",
            ),
            Document(
                doc_uuid=str(uuid.uuid4()),
                farmer_id="FV12345",
                category="Insurance",
                original_name="PMFBY_Policy_Certificate_2025.pdf",
                stored_filename=insurance_file,
                mime_type="application/pdf",
                size_bytes=len(DUMMY_PDF_BYTES),
                note="Kharif 2024-25 Paddy insurance policy certificate",
                expiry_date="31 Dec 2025",
                masked_id="CI20251234",
            ),
            Document(
                doc_uuid=str(uuid.uuid4()),
                farmer_id="FV12345",
                category="Bank",
                original_name="Loan_Sanction_Letter_SBI.pdf",
                stored_filename=sanction_file,
                mime_type="application/pdf",
                size_bytes=len(DUMMY_PDF_BYTES),
                note="Approved ₹80,000 KCC Sanction from SBI Patan",
                expiry_date="15 Mar 2026",
                masked_id="LN-2024-8812",
            ),
        ]
        db.add_all(documents)

        db.commit()
        print("Demo database seeded successfully with all synthetic records!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
