import os
import sys

# Ensure backend root is on path when running as script
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import text
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
    Office,
    ContactMessage,
    RuleSource,
    LoanProduct,
)
from app.services.storage import get_storage_backend

DUMMY_PDF_BYTES = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
DUMMY_PNG_BYTES = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x03\x05\xfe\x02\xfe\x1c\xc1m\x00\x00\x00\x00IEND\xaeB`\x82"

def get_all_seed_schemes():
    return [
        Scheme(
            scheme_code="PM-KISAN",
            title="PM-KISAN Samman Nidhi",
            title_hi="पीएम-किसान सम्मान निधि",
            level="Central",
            state=None,
            category="Income Support",
            short_description="Direct income support of ₹6,000/year to landholding farmer families.",
            eligibility_summary="All landholding farmer families having cultivable landholding in their name.",
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
            official_url="https://pmkisan.gov.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/pm-kisan",
            source_note="Official portal of PM-KISAN, Ministry of Agriculture & Farmers Welfare, GoI",
            last_verified_on="2025-04-10",
            ministry="Ministry of Agriculture and Farmers Welfare",
            source="myScheme.gov.in",
        ),
        Scheme(
            scheme_code="PMFBY",
            title="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            title_hi="प्रधानमंत्री फसल बीमा योजना",
            level="Central",
            state=None,
            category="Insurance",
            short_description="Subsidized crop insurance coverage against non-preventable natural risks.",
            eligibility_summary="All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.",
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
            official_url="https://pmfby.gov.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/pmfby",
            source_note="Official PMFBY Portal, Ministry of Agriculture & Farmers Welfare, GoI",
            last_verified_on="2025-04-10",
            ministry="Ministry of Agriculture and Farmers Welfare",
            source="myScheme.gov.in",
        ),
        Scheme(
            scheme_code="KCC",
            title="Kisan Credit Card (KCC) Scheme",
            title_hi="किसान क्रेडिट कार्ड योजना",
            level="Central",
            state=None,
            category="Loan",
            short_description="Flexible revolving cash credit for cultivation and farm asset maintenance at 4% interest.",
            eligibility_summary="All farmers, individual/joint borrowers who are owner cultivators or tenant farmers.",
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
            official_url="https://agricoop.nic.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/kcc",
            source_note="Official portal under Department of Agriculture & Farmers Welfare, GoI",
            last_verified_on="2025-04-10",
            ministry="Ministry of Agriculture and Farmers Welfare",
            source="myScheme.gov.in",
        ),
        Scheme(
            scheme_code="SOIL-CARD",
            title="Soil Health Card Scheme",
            title_hi="मृदा स्वास्थ्य कार्ड योजना",
            level="Central",
            state=None,
            category="Subsidy",
            short_description="Free soil testing report card with crop-wise nutrient recommendations.",
            eligibility_summary="Open to all farmers across India holding cultivable land.",
            description="Provides farmers with soil health cards carrying nutrient status and fertilizer dosage recommendations every 2 years to reduce farming costs.",
            description_hi="किसानों को मिट्टी की गुणवत्ता और पोषक तत्वों की सटीक रिपोर्ट तथा खाद उपयोग की सिफारिशें।",
            benefits="Free scientific soil laboratory test and customized fertilizer advisory",
            benefits_hi="निःशुल्क वैज्ञानिक मिट्टी परीक्षण और उर्वरक सलाह",
            eligibility_rules={"categories": ["All Farmers"]},
            documents_required=["Aadhaar Card", "Land Identification Details (Khasra No.)"],
            deadline="Ongoing cycle 2025-26",
            official_url="https://soilhealth.dac.gov.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/shc",
            source_note="Official Soil Health Portal, Ministry of Agriculture & Farmers Welfare, GoI",
            last_verified_on="2025-04-10",
            ministry="Ministry of Agriculture and Farmers Welfare",
            source="myScheme.gov.in",
        ),
        Scheme(
            scheme_code="ENAM",
            title="National Agriculture Market (e-NAM)",
            title_hi="राष्ट्रीय कृषि बाजार (ई-नाम)",
            level="Central",
            state=None,
            category="Equipment",
            short_description="Pan-India electronic trading portal integrating APMC mandis.",
            eligibility_summary="Farmers selling agricultural commodities through regulated APMC markets.",
            description="Online trading platform for agricultural commodities facilitating transparent price discovery and online payment directly into farmer accounts.",
            description_hi="पारदर्शी बोली और बेहतर मूल्य प्राप्ति के लिए अखिल भारतीय इलेक्ट्रॉनिक कृषि व्यापार पोर्टल।",
            benefits="Direct access to nationwide buyers and transparent digital bidding",
            benefits_hi="देशभर के व्यापारियों से सीधे ऑनलाइन बोली और बैंक भुगतान",
            eligibility_rules={"categories": ["All Farmers"]},
            documents_required=["Aadhaar Card", "Bank Account Details", "Mandi Entry Pass"],
            deadline="Year-round operation",
            official_url="https://enam.gov.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/e-nam",
            source_note="Official e-NAM portal under Small Farmers Agribusiness Consortium (SFAC), GoI",
            last_verified_on="2025-04-10",
            ministry="Ministry of Agriculture and Farmers Welfare",
            source="myScheme.gov.in",
        ),
        Scheme(
            scheme_code="PM-KUSUM",
            title="Pradhan Mantri KUSUM Yojana",
            title_hi="प्रधानमंत्री कुसुम योजना (सोलर पंप)",
            level="Central",
            state=None,
            category="Irrigation",
            short_description="Up to 60% subsidy for installation of stand-alone solar agriculture pumps.",
            eligibility_summary="Individual farmers, cooperatives, panchayats with agricultural land.",
            description="Supports farmers in installing solar irrigation water pumps, replacing expensive diesel pumps and securing reliable daytime irrigation.",
            description_hi="कृषि में सिंचाई के लिए सोलर पंप स्थापना पर 60% तक का भारी सरकारी अनुदान।",
            benefits="60% government subsidy (30% Central + 30% State) on solar pump systems",
            benefits_hi="सोलर पंप स्थापना पर 60% तक का अनुदान",
            eligibility_rules={"categories": ["Small Farmer", "Marginal Farmer", "Large Farmer"]},
            documents_required=["Land Ownership Papers (Khasra/B1)", "Bank Details", "Aadhaar Card"],
            deadline="Apply by 31 Dec 2025",
            official_url="https://pmkusum.mnre.gov.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/pm-kusum",
            source_note="Official portal of PM-KUSUM, Ministry of New and Renewable Energy, GoI",
            last_verified_on="2025-04-10",
            ministry="Ministry of New and Renewable Energy",
            source="myScheme.gov.in",
        ),
        Scheme(
            scheme_code="CG-KUY",
            title="Krishi Unnati Yojana (Chhattisgarh)",
            title_hi="कृषक उन्नति योजना (छत्तीसगढ़)",
            level="State",
            state="Chhattisgarh",
            category="Subsidy",
            short_description="State input incentive ensuring up to ₹3,100/quintal remunerative price for paddy.",
            eligibility_summary="Farmers selling paddy at designated Primary Agricultural Cooperative Societies (PACS) in Chhattisgarh.",
            description="Flagship scheme of Govt of Chhattisgarh providing input assistance to paddy farmers, ensuring ₹3,100 per quintal total price for up to 21 quintals/acre.",
            description_hi="धान उत्पादक किसानों को ₹3,100 प्रति क्विंटल तक का सुनिश्चित लाभकारी मूल्य व आदान सहायता।",
            benefits="Input assistance bridging market price to ₹3,100 per quintal up to 21 quintals/acre",
            benefits_hi="21 क्विंटल/एकड़ तक ₹3,100 प्रति क्विंटल का भुगतान",
            eligibility_rules={
                "states": ["Chhattisgarh"],
                "crops": ["Paddy"],
            },
            documents_required=["Kisan Rin Pustika (KRP)", "Girdawari Registration Slip", "Aadhaar Card", "Bank Passbook"],
            deadline="Procurement season cycle",
            official_url="https://agriportal.cg.nic.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/smam",
            source_note="Official Portal of Directorate of Agriculture, Government of Chhattisgarh",
            last_verified_on="2025-04-10",
            ministry="Department of Agriculture, Govt of Chhattisgarh",
            source="agriportal.cg.nic.in",
        ),
        Scheme(
            scheme_code="CG-SSY",
            title="Saur Sujala Yojana (Chhattisgarh)",
            title_hi="सौर सुजला योजना (छत्तीसगढ़)",
            level="State",
            state="Chhattisgarh",
            category="Irrigation",
            short_description="Subsidized solar-powered water irrigation pumps for Chhattisgarh farmers.",
            eligibility_summary="Farmers in un-electrified or low-voltage agricultural regions of Chhattisgarh.",
            description="CREDA initiative to deploy 3HP and 5HP solar irrigation pumps to farmers at highly subsidized rates for un-electrified agricultural lands.",
            description_hi="छत्तीसगढ़ के गैर-विद्युतीकृत कृषि क्षेत्रों में 3HP/5HP सोलर पंप नाममात्र दर पर उपलब्ध कराना।",
            benefits="Solar water pump installation at 90%+ subsidized cost for small/marginal farmers",
            benefits_hi="लघु व सीमांत किसानों को 90% से अधिक अनुदान पर सोलर पंप",
            eligibility_rules={
                "states": ["Chhattisgarh"],
            },
            documents_required=["B-1/P-II Khasra Copy", "Caste Certificate (for SC/ST concession)", "Aadhaar Card", "Bank Details"],
            deadline="Apply via District CREDA office",
            official_url="https://creda.cgstate.gov.in",
            myscheme_url="https://www.myscheme.gov.in/schemes/pm-kusum",
            source_note="Official Portal of Chhattisgarh State Renewable Energy Development Agency (CREDA)",
            last_verified_on="2025-04-10",
            ministry="CREDA, Energy Department, Govt of Chhattisgarh",
            source="creda.cgstate.gov.in",
        ),
    ]

def seed_schemes_list(db):
    schemes = get_all_seed_schemes()
    for s in schemes:
        existing = db.query(Scheme).filter_by(scheme_code=s.scheme_code).first()
        if existing:
            existing.title = s.title
            existing.title_hi = s.title_hi
            existing.level = s.level
            existing.state = s.state
            existing.category = s.category
            existing.short_description = s.short_description
            existing.description = s.description
            existing.description_hi = s.description_hi
            existing.benefits = s.benefits
            existing.benefits_hi = s.benefits_hi
            existing.eligibility_summary = s.eligibility_summary
            existing.official_url = s.official_url
            existing.myscheme_url = s.myscheme_url
            existing.source_note = s.source_note
            existing.last_verified_on = s.last_verified_on
            existing.deadline = s.deadline
            existing.documents_required = s.documents_required
        else:
            db.add(s)
    db.commit()

def ensure_sqlite_columns():
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # 1. Check schemes table
            res = conn.execute(text("PRAGMA table_info(schemes)")).fetchall()
            col_names = [r[1] for r in res]
            if col_names and ("level" not in col_names or "ministry" not in col_names or "official_url" not in col_names):
                conn.execute(text("DROP TABLE IF EXISTS schemes"))
                conn.commit()
            
            # 2. Check loans table columns
            l_res = conn.execute(text("PRAGMA table_info(loans)")).fetchall()
            loan_cols = [r[1] for r in l_res]
            if loan_cols:
                if "verification_status" not in loan_cols:
                    conn.execute(text("ALTER TABLE loans ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Needs Review'"))
                if "reason_codes" not in loan_cols:
                    conn.execute(text("ALTER TABLE loans ADD COLUMN reason_codes JSON DEFAULT '[]'"))
                if "last_verified_at" not in loan_cols:
                    conn.execute(text("ALTER TABLE loans ADD COLUMN last_verified_at VARCHAR(50)"))
                if "sanction_doc_name" not in loan_cols:
                    conn.execute(text("ALTER TABLE loans ADD COLUMN sanction_doc_name VARCHAR(200)"))
                conn.commit()

        Base.metadata.tables["schemes"].create(bind=engine, checkfirst=True)
        if "loan_products" in Base.metadata.tables:
            Base.metadata.tables["loan_products"].create(bind=engine, checkfirst=True)
    except Exception as e:
        print(f"Table columns check notice: {e}")

def get_all_seed_loan_products():
    return [
        LoanProduct(
            product_code="KCC-CROP-LOAN",
            name="Kisan Credit Card (KCC) Crop Loan",
            name_hi="किसान क्रेडिट कार्ड (केसीसी) फसल ऋण",
            level="Central",
            state=None,
            lender_type="Commercial Bank / RRB / Cooperative",
            purpose="Crop Production",
            purpose_hi="फसल उत्पादन एवं कार्यशील पूंजी",
            description="Revolving short-term credit facility for cultivation expenses, harvesting, and farm asset maintenance at 4% effective interest with timely repayment.",
            description_hi="समय पर पुनर्भुगतान करने पर 4% की प्रभावी ब्याज दर पर फसल बुआई, कटाई एवं कृषि परिसंपत्ति रखरखाव हेतु रियायती अल्पावधि साख सीमा।",
            max_amount_rule="Up to ₹3,00,000 (collateral-free up to ₹1,60,000)",
            interest_rate_rule="7.0% p.a. standard (Effective 4.0% with prompt repayment incentive)",
            tenure="1 Year (Revolving for 5 Years)",
            collateral_rule="No collateral / hypothecation up to ₹1.60 Lakh",
            required_documents=[
                "Aadhaar Card",
                "Land Ownership Record (7/12 / Khasra / B-1)",
                "Bank Passbook",
                "Sowing Certificate (Girdawari)",
            ],
            eligibility_rules={
                "min_land_acres": 0.5,
                "max_land_acres": None,
                "farmer_categories": ["Marginal Farmer", "Small Farmer", "Large Farmer"],
                "allowed_crops": [],
            },
            official_url="https://agricoop.nic.in",
            source_name="Ministry of Agriculture & Farmers Welfare, GoI / RBI",
            source_document="Master Circular – Kisan Credit Card (KCC) Scheme (FIDD.CO.FSD.BC.No.12/05.05.010/2018-19)",
            last_verified_on="2025-04-10",
            status="verified",
        ),
        LoanProduct(
            product_code="AGRI-TERM-TRACTOR",
            name="Agricultural Term Loan - Farm Mechanization (Tractor & Implements)",
            name_hi="कृषि मियादी ऋण - फार्म मशीनीकरण (ट्रैक्टर एवं उपकरण)",
            level="Central",
            state=None,
            lender_type="Commercial Bank",
            purpose="Farm Mechanization",
            purpose_hi="ट्रैक्टर एवं उन्नत कृषि यंत्र",
            description="Term loan for purchasing new tractors, power tillers, rotavators, and harvesters under SMAM mechanization guidelines.",
            description_hi="खेती की उत्पादकता बढ़ाने हेतु नए ट्रैक्टर, पावर टिलर एवं आधुनिक कृषि यंत्रों की खरीद के लिए दीर्घकालिक मियादी ऋण।",
            max_amount_rule="Up to ₹10,00,000 or 85% of asset invoice",
            interest_rate_rule="8.50% - 9.75% p.a. (Bank base rate linked)",
            tenure="5 to 7 Years (Half-yearly EMIs after harvest)",
            collateral_rule="Hypothecation of purchased tractor/implement + Land mortgage for > ₹5 Lakh",
            required_documents=[
                "Aadhaar Card",
                "Land Record (Khasra / B-1)",
                "Dealer Proforma Invoice / Quotation",
                "Bank Passbook",
            ],
            eligibility_rules={
                "min_land_acres": 2.0,
                "max_land_acres": None,
                "farmer_categories": ["Small Farmer", "Large Farmer"],
                "allowed_crops": [],
            },
            official_url="https://farmech.dac.gov.in",
            source_name="Department of Agriculture & Farmers Welfare (DA&FW)",
            source_document="Sub-Mission on Agricultural Mechanization (SMAM) Operational Guidelines",
            last_verified_on="2025-04-10",
            status="verified",
        ),
        LoanProduct(
            product_code="AIF-POST-HARVEST",
            name="Agriculture Infrastructure Fund (AIF) Term Loan",
            name_hi="कृषि अवसंरचना कोष (एआईएफ) मियादी ऋण",
            level="Central",
            state=None,
            lender_type="Commercial Bank / Cooperative",
            purpose="Post-Harvest Infrastructure",
            purpose_hi="गोदाम, कोल्ड स्टोरेज एवं प्राथमिक प्रसंस्करण",
            description="Medium-to-long term debt financing for post-harvest management infrastructure and community farming assets with 3% interest subvention and CGTMSE guarantee.",
            description_hi="कटाई उपरांत फसल प्रबंधन, भंडारण, गोदाम एवं प्राथमिक प्रसंस्करण इकाइयों के निर्माण हेतु 3% ब्याज अनुदान सहित दीर्घकालिक वित्तपोषण।",
            max_amount_rule="Up to ₹2,00,00,000 eligible for 3% interest subvention",
            interest_rate_rule="Effective rate capped at Bank Base Rate + 1% minus 3% subvention (~6.0% p.a.)",
            tenure="Up to 7 Years (Including moratorium up to 2 years)",
            collateral_rule="CGTMSE credit guarantee coverage up to ₹2 Crore",
            required_documents=[
                "Aadhaar Card",
                "Land Record (Khasra / B-1)",
                "Detailed Project Report (DPR)",
                "Bank Passbook",
            ],
            eligibility_rules={
                "min_land_acres": 1.0,
                "max_land_acres": None,
                "farmer_categories": ["Small Farmer", "Large Farmer"],
                "allowed_crops": [],
            },
            official_url="https://agriinfra.dac.gov.in",
            source_name="Ministry of Agriculture & Farmers Welfare, GoI",
            source_document="Central Sector Scheme of Financing Facility under Agriculture Infrastructure Fund",
            last_verified_on="2025-04-10",
            status="verified",
        ),
        LoanProduct(
            product_code="KCC-DAIRY-ANIMAL",
            name="KCC for Animal Husbandry & Dairy Farming",
            name_hi="पशुपालन एवं डेयरी किसान क्रेडिट कार्ड",
            level="Central",
            state=None,
            lender_type="Commercial Bank / Cooperative",
            purpose="Dairy & Animal Husbandry",
            purpose_hi="दुधारू पशु आहार, स्वास्थ्य एवं रख-रखाव",
            description="Working capital cash credit for dairy farmers, buffalo/cow rearers to meet feeding, veterinary, and operating expenses.",
            description_hi="दुग्ध उत्पादकों व पशुपालकों को पशु आहार, चिकित्सा एवं दैनिक कार्यशील पूंजी की पूर्ति हेतु रियायती केसीसी सुविधा।",
            max_amount_rule="Up to ₹2,00,000 (collateral-free limit)",
            interest_rate_rule="7.0% p.a. standard (Effective 4.0% with prompt repayment incentive)",
            tenure="1 Year (Revolving facility)",
            collateral_rule="Collateral-free up to ₹1.60 Lakh (or ₹2.0 Lakh with tie-up)",
            required_documents=[
                "Aadhaar Card",
                "Animal Health Certificate / Ear Tagging Record",
                "Bank Passbook",
            ],
            eligibility_rules={
                "min_land_acres": 0.0,
                "max_land_acres": None,
                "farmer_categories": ["Marginal Farmer", "Small Farmer", "Large Farmer"],
                "allowed_crops": [],
            },
            official_url="https://dahd.nic.in",
            source_name="Department of Animal Husbandry & Dairying (DAHD), GoI / RBI",
            source_document="RBI Circular FIDD.CO.FSD.BC.12/05.05.010/2018-19: Extension of KCC facility to Animal Husbandry Farmers and Fisheries",
            last_verified_on="2025-04-10",
            status="verified",
        ),
        LoanProduct(
            product_code="KCC-FISHERIES",
            name="KCC for Fisheries and Aquaculture",
            name_hi="मत्स्य पालन किसान क्रेडिट कार्ड",
            level="Central",
            state=None,
            lender_type="Commercial Bank / Cooperative",
            purpose="Fisheries",
            purpose_hi="मत्स्य बीज, दाना एवं तालाब रख-रखाव",
            description="Short-term credit for inland fisheries, fish seed purchase, feed, maintenance, and harvesting expenses.",
            description_hi="मत्स्य पालकों को बीज, चारा, जल शोधन एवं तालाब संचालन के दैनिक खर्चों हेतु रियायती कार्यशील पूंजी साख।",
            max_amount_rule="Up to ₹2,00,000 (collateral-free)",
            interest_rate_rule="7.0% p.a. standard (Effective 4.0% with prompt repayment incentive)",
            tenure="1 Year (Revolving facility)",
            collateral_rule="Collateral-free up to ₹1.60 Lakh",
            required_documents=[
                "Aadhaar Card",
                "Water Body Title / Lease Agreement",
                "Bank Passbook",
            ],
            eligibility_rules={
                "min_land_acres": 0.0,
                "max_land_acres": None,
                "farmer_categories": ["Marginal Farmer", "Small Farmer", "Large Farmer"],
                "allowed_crops": [],
            },
            official_url="https://dof.gov.in",
            source_name="Department of Fisheries, Ministry of Fisheries, Animal Husbandry & Dairying, GoI",
            source_document="KCC Guidelines for Fisheries and Aquaculture Beneficiaries",
            last_verified_on="2025-04-10",
            status="verified",
        ),
        LoanProduct(
            product_code="PM-KUSUM-SOLAR",
            name="PM-KUSUM Component-B Standalone Solar Agri Pump Loan",
            name_hi="पीएम-कुसुम कंपोनेंट-बी सोलर कृषि पंप ऋण",
            level="Central",
            state=None,
            lender_type="Commercial Bank / Regional Rural Bank",
            purpose="Irrigation & Solar",
            purpose_hi="सौर ऊर्जा संचालित सिंचाई पंप",
            description="Subsidized term loan financing for the remaining farmer contribution (up to 30%) towards standalone 3HP to 7.5HP solar agricultural pumps.",
            description_hi="सौर सिंचाई पंप स्थापना हेतु कृषक अंशदान (30% तक) के लिए बैंक ऋण सुविधा, शेष 60% केंद्र व राज्य सरकार द्वारा अनुदानित।",
            max_amount_rule="Up to ₹2,50,000 (covering up to 30% farmer share)",
            interest_rate_rule="8.00% - 9.00% p.a.",
            tenure="5 to 7 Years",
            collateral_rule="Hypothecation of solar pump system",
            required_documents=[
                "Aadhaar Card",
                "Land Record (Khasra / B-1)",
                "Bank Passbook",
            ],
            eligibility_rules={
                "min_land_acres": 1.0,
                "max_land_acres": None,
                "farmer_categories": ["Marginal Farmer", "Small Farmer", "Large Farmer"],
                "allowed_crops": [],
            },
            official_url="https://pmkusum.mnre.gov.in",
            source_name="Ministry of New and Renewable Energy (MNRE), GoI",
            source_document="PM-KUSUM Scheme Guidelines for Component-B",
            last_verified_on="2025-04-10",
            status="verified",
        ),
        LoanProduct(
            product_code="CG-SHAKAMBHARI-IRRIGATION",
            name="Shakambhari Yojana Well & Pump Set Subsidy & Loan (Chhattisgarh)",
            name_hi="शाकंभरी योजना कूप एवं पंप अनुदान व ऋण (छत्तीसगढ़)",
            level="State",
            state="Chhattisgarh",
            lender_type="Cooperative / Commercial Bank",
            purpose="Irrigation & Solar",
            purpose_hi="कूप निर्माण एवं सिंचाई पंप",
            description="Specialized irrigation support for small and marginal farmers in Chhattisgarh with up to 75% subsidy on pump sets and 50% on open wells with bank co-financing.",
            description_hi="छत्तीसगढ़ के लघु एवं सीमांत किसानों के लिए कूप निर्माण (50% अनुदान) एवं पंप स्थापना (75% अनुदान) हेतु विशेष सहायता व बैंक सह-ऋण।",
            max_amount_rule="Up to ₹1,50,000 (Project unit cost)",
            interest_rate_rule="7.50% - 8.50% p.a. (Post state subsidy)",
            tenure="5 Years",
            collateral_rule="Hypothecation of pump machinery",
            required_documents=[
                "Aadhaar Card",
                "Land Record (Khasra / B-1)",
                "Small/Marginal Farmer Certificate",
                "Bank Passbook",
            ],
            eligibility_rules={
                "min_land_acres": 0.5,
                "max_land_acres": 5.0,
                "farmer_categories": ["Marginal Farmer", "Small Farmer"],
                "allowed_crops": [],
            },
            official_url="https://agriportal.cg.nic.in",
            source_name="Department of Agriculture, Govt of Chhattisgarh",
            source_document="Directorate of Agriculture Shakambhari Scheme Guidelines",
            last_verified_on="2025-04-10",
            status="verified",
        ),
        LoanProduct(
            product_code="CG-KISAN-SAMRIDHI",
            name="Kisan Samridhi Nalkoop Tube-Well Loan & Subsidy (Chhattisgarh)",
            name_hi="किसान समृद्धि नलकूप योजना ऋण एवं अनुदान (छत्तीसगढ़)",
            level="State",
            state="Chhattisgarh",
            lender_type="Cooperative / Commercial Bank",
            purpose="Irrigation & Solar",
            purpose_hi="नलकूप खनन एवं विद्युतीकरण",
            description="Tube well boring and pump energization loan with state capital subsidies for non-command agricultural lands in Chhattisgarh.",
            description_hi="असिंचित कृषि क्षेत्रों में नलकूप खनन एवं पंप स्थापना हेतु शासकीय अनुदान एवं रियायती ऋण सहायता।",
            max_amount_rule="Up to ₹1,80,000",
            interest_rate_rule="8.00% p.a.",
            tenure="5 to 7 Years",
            collateral_rule="Hypothecation of equipment + Land mortgage",
            required_documents=[
                "Aadhaar Card",
                "Land Record (Khasra / B-1)",
                "Gram Panchayat NOC",
                "Bank Passbook",
            ],
            eligibility_rules={
                "min_land_acres": 1.5,
                "max_land_acres": 15.0,
                "farmer_categories": ["Small Farmer", "Large Farmer"],
                "allowed_crops": [],
            },
            official_url="https://agriportal.cg.nic.in",
            source_name="Department of Agriculture, Govt of Chhattisgarh",
            source_document="Kisan Samridhi Yojana Implementation Circular",
            last_verified_on="2025-04-10",
            status="verified",
        ),
    ]

def enrich_farmer_loans(db, ramesh):
    l1 = db.query(Loan).filter_by(loan_ref="LN-2024-8812").first()
    if l1:
        l1.verification_status = "Needs Review"
        l1.reason_codes = ["DISBURSEMENT_MISMATCH", "PROCESSING_FEE_FLAG"]
        l1.last_verified_at = "12 Apr 2025"
        l1.sanction_doc_name = "Loan_Sanction_Letter_SBI.pdf"
        l1.reasons = [
            "Approved amount (₹80,000) exceeds disbursed amount (₹70,000) by ₹10,000 difference.",
            "Deductions include ₹5,000 unitemized processing or administrative fee (RBI mandates ₹0 fee up to ₹3 Lakh).",
            "Crop insurance (PMFBY) premium auto-deduction requires verification against policy certificate.",
        ]

    l_sunita = db.query(Loan).filter_by(loan_ref="LN-2024-9104").first()
    if l_sunita:
        l_sunita.verification_status = "Verified"
        l_sunita.difference = 0.0
        l_sunita.last_verified_at = "18 May 2024"

    if not db.query(Loan).filter_by(loan_ref="LN-2023-4102").first():
        l_ver = Loan(
            loan_ref="LN-2023-4102",
            farmer_id=ramesh.id,
            bank_name="State Bank of India",
            loan_type="KCC Short-term",
            approved_amount=50000.0,
            disbursed_amount=50000.0,
            interest_rate=7.0,
            deductions=0.0,
            repayments=50000.0,
            difference=0.0,
            status="Verified",
            verification_status="Verified",
            reason_codes=[],
            reasons=["All figures match the approved sanction letter and statutory guidelines."],
            loan_date="10-06-2023",
            last_verified_at="15 Jan 2024",
            sanction_doc_name="KCC_Sanction_Letter_2023.pdf",
        )
        db.add(l_ver)

    if not db.query(Loan).filter_by(loan_ref="LN-2024-9943").first():
        l_not_ver = Loan(
            loan_ref="LN-2024-9943",
            farmer_id=ramesh.id,
            bank_name="Chhattisgarh Rajya Gramin Bank",
            loan_type="Agri Term Loan",
            approved_amount=120000.0,
            disbursed_amount=0.0,
            interest_rate=9.5,
            deductions=0.0,
            repayments=0.0,
            difference=120000.0,
            status="Not Verified",
            verification_status="Not Verified",
            reason_codes=["MISSING_SANCTION_DOC", "CHECK_NOT_RUN"],
            reasons=[
                "Missing sanction letter or document. Please upload your sanction letter to verify.",
                "Verification check has not been executed yet.",
            ],
            loan_date="20-03-2024",
            last_verified_at=None,
            sanction_doc_name=None,
        )
        db.add(l_not_ver)

    db.commit()

def get_all_seed_offices():
    return [
        Office(
            office_code="OFF-CG-DUR-01",
            name="Common Service Centre (CSC) Digital Seva Kendra",
            name_hi="कॉमन सर्विस सेंटर (सीएससी) डिजिटल सेवा केंद्र",
            office_type="CSC",
            category_label="Common Service Centre",
            address="Gram Panchayat Bhawan, Main Chowk, Patan, Durg, Chhattisgarh",
            district="Durg",
            state="Chhattisgarh",
            pin_code="491111",
            phone="011-49754975",
            email="csc.patan@digitalindia.gov.in",
            lat=21.0371,
            lon=81.5348,
            opening_hours="Mon-Sun: 9:00 AM - 7:00 PM",
            services_offered=["PM-KISAN e-KYC", "Khasra B-1 Printing", "PMFBY Enrollment", "Aadhaar Seeding", "Banking Correspondent"],
        ),
        Office(
            office_code="OFF-CG-DUR-02",
            name="State Bank of India (SBI) - Patan Branch (KCC Nodal)",
            name_hi="भारतीय स्टेट बैंक (एसबीआई) - पाटन शाखा (केसीसी नोडल)",
            office_type="Bank",
            category_label="KCC / Agriculture Bank Branch",
            address="Main Road, Opposite Tehsil Office, Patan, Durg, Chhattisgarh",
            district="Durg",
            state="Chhattisgarh",
            pin_code="491111",
            phone="1800-11-2211",
            email="sbi.01423@sbi.co.in",
            lat=21.0362,
            lon=81.5375,
            opening_hours="Mon-Fri: 10:00 AM - 4:00 PM, Alt Sat",
            services_offered=["Kisan Credit Card (KCC)", "Agri Term Loan", "Tractor Finance", "Subsidized Interest Subvention"],
        ),
        Office(
            office_code="OFF-CG-DUR-03",
            name="District Soil Testing Laboratory",
            name_hi="जिला मृदा परीक्षण प्रयोगशाला",
            office_type="Soil Lab",
            category_label="Soil Testing Laboratory",
            address="Block Agriculture Office Campus, Near Tehsil, Patan, Durg, Chhattisgarh",
            district="Durg",
            state="Chhattisgarh",
            pin_code="491111",
            phone="07826-273515",
            email="soillab.patan@cg.gov.in",
            lat=21.0385,
            lon=81.5390,
            opening_hours="Mon-Sat: 10:30 AM - 5:00 PM",
            services_offered=["Free Soil Health Card Analysis", "NPK & pH Testing", "Micronutrient Profiling", "Fertilizer Dosage Recommendation"],
        ),
        Office(
            office_code="OFF-CG-DUR-04",
            name="Patan Krishi Upaj Mandi Samiti (APMC)",
            name_hi="पाटन कृषि उपज मंडी समिति (एपीएमसी)",
            office_type="APMC",
            category_label="Mandi Samiti / APMC",
            address="Mandi Road, Near Bus Stand, Patan, Durg, Chhattisgarh",
            district="Durg",
            state="Chhattisgarh",
            pin_code="491111",
            phone="07826-273210",
            email="mandi.patan@cg.gov.in",
            lat=21.0350,
            lon=81.5360,
            opening_hours="Mon-Sat: 8:00 AM - 6:00 PM",
            services_offered=["MSP Paddy Procurement", "Electronic Weighbridge", "e-NAM Digital Auction", "Direct Payment Verification"],
        ),
        Office(
            office_code="OFF-CG-DUR-05",
            name="Krishi Vigyan Kendra (KVK), Anjora",
            name_hi="कृषि विज्ञान केंद्र (केवीके), अंजोरा",
            office_type="KVK",
            category_label="Krishi Vigyan Kendra",
            address="IGKV Research Campus, Anjora, Durg, Chhattisgarh",
            district="Durg",
            state="Chhattisgarh",
            pin_code="491001",
            phone="0788-2623344",
            email="kvk.durg@igkv.ac.in",
            lat=21.1610,
            lon=81.2580,
            opening_hours="Mon-Sat: 10:00 AM - 5:00 PM",
            services_offered=["Crop Advisory & Pest Diagnosis", "Certified Foundation Seeds", "Organic Farming Demonstration", "Weather-smart Agriculture Training"],
        ),
        Office(
            office_code="OFF-CG-DUR-06",
            name="Deputy Director of Agriculture (DDA) Office",
            name_hi="उप संचालक कृषि कार्यालय, दुर्ग",
            office_type="DDA",
            category_label="District Agriculture Office",
            address="Collectorate Compound, G.E. Road, Durg, Chhattisgarh",
            district="Durg",
            state="Chhattisgarh",
            pin_code="491001",
            phone="0788-2322521",
            email="dda-agri.durg@cg.nic.in",
            lat=21.1904,
            lon=81.2849,
            opening_hours="Mon-Fri: 10:00 AM - 5:30 PM",
            services_offered=["State Scheme Subsidies (Rajiv Gandhi / Krishak Unnati)", "Fertilizer Retail Licensing", "PM-KISAN Grievance Cell", "Crop Loss Assessment"],
        ),
        Office(
            office_code="OFF-CG-RPR-01",
            name="Raipur Krishi Vigyan Kendra & Research Centre",
            name_hi="रायपुर कृषि विज्ञान केंद्र एवं अनुसंधान केंद्र",
            office_type="KVK",
            category_label="Krishi Vigyan Kendra",
            address="Indira Gandhi Krishi Vishwavidyalaya Campus, Krishak Nagar, Raipur, Chhattisgarh",
            district="Raipur",
            state="Chhattisgarh",
            pin_code="492012",
            phone="0771-2442537",
            email="kvk.raipur@igkv.ac.in",
            lat=21.2335,
            lon=81.7065,
            opening_hours="Mon-Sat: 10:00 AM - 5:00 PM",
            services_offered=["Advanced Soil & Water Testing", "Tissue Culture Seedlings", "Agricultural Drone Demonstration", "Farm Mechanization Workshops"],
        ),
        Office(
            office_code="OFF-CG-DUR-07",
            name="Durg Krishi Upaj Mandi Samiti (APMC)",
            name_hi="दुर्ग कृषि उपज मंडी समिति (एपीएमसी)",
            office_type="APMC",
            category_label="Mandi Samiti / APMC",
            address="Mandi Parisar, Dhamdha Road, Durg, Chhattisgarh",
            district="Durg",
            state="Chhattisgarh",
            pin_code="491001",
            phone="0788-2210892",
            email="mandidurg@cg.gov.in",
            lat=21.2050,
            lon=81.2720,
            opening_hours="Mon-Sat: 8:00 AM - 6:00 PM",
            services_offered=["Multi-Crop Mandi Auction", "Storage Godowns", "Moisture Quality Testing", "Kisan Vishram Griha"],
        ),
    ]

def get_all_seed_rules():
    return [
        RuleSource(
            rule_code="CACP-MSP-KHARIF-PADDY-2024",
            scheme_name="Minimum Support Price (MSP)",
            rule_type="msp",
            crop="Paddy",
            season="Kharif 2024-25",
            description_en="Statutory Minimum Support Price for Paddy (Common) for Kharif Marketing Season 2024-25 at ₹2,300 per quintal.",
            description_hi="खरीफ विपणन सत्र 2024-25 के लिए धान (सामान्य) का वैधानिक न्यूनतम समर्थन मूल्य ₹2,300 प्रति क्विंटल।",
            formula_or_value="₹2,300 / quintal",
            source_name="Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
            source_document="Price Policy for Kharif Crops: The Marketing Season 2024-25",
            source_url="https://cacp.dacnet.nic.in",
            effective_from="2024-10-01",
            effective_to="2025-09-30",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="CACP-MSP-KHARIF-PADDY-A-2024",
            scheme_name="Minimum Support Price (MSP)",
            rule_type="msp",
            crop="Paddy (Grade A)",
            season="Kharif 2024-25",
            description_en="Statutory Minimum Support Price for Paddy (Grade A) for Kharif Marketing Season 2024-25 at ₹2,320 per quintal.",
            description_hi="खरीफ विपणन सत्र 2024-25 के लिए धान (ग्रेड ए) का वैधानिक न्यूनतम समर्थन मूल्य ₹2,320 प्रति क्विंटल।",
            formula_or_value="₹2,320 / quintal",
            source_name="Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
            source_document="Price Policy for Kharif Crops: The Marketing Season 2024-25 (Grade A)",
            source_url="https://cacp.dacnet.nic.in",
            effective_from="2024-10-01",
            effective_to="2025-09-30",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="CACP-MSP-RABI-WHEAT-2024",
            scheme_name="Minimum Support Price (MSP)",
            rule_type="msp",
            crop="Wheat",
            season="Rabi 2024-25",
            description_en="Statutory Minimum Support Price for Wheat for Rabi Marketing Season 2024-25 at ₹2,275 per quintal.",
            description_hi="रबी विपणन सत्र 2024-25 के लिए गेहूं का वैधानिक न्यूनतम समर्थन मूल्य ₹2,275 प्रति क्विंटल।",
            formula_or_value="₹2,275 / quintal",
            source_name="Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
            source_document="Price Policy for Rabi Crops: The Marketing Season 2024-25",
            source_url="https://cacp.dacnet.nic.in",
            effective_from="2024-04-01",
            effective_to="2025-03-31",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="CACP-MSP-KHARIF-SOYBEAN-2024",
            scheme_name="Minimum Support Price (MSP)",
            rule_type="msp",
            crop="Soybean",
            season="Kharif 2024-25",
            description_en="Statutory Minimum Support Price for Soybean (Yellow) for Kharif Marketing Season 2024-25 at ₹4,600 per quintal.",
            description_hi="खरीफ विपणन सत्र 2024-25 के लिए सोयाबीन (पीला) का वैधानिक न्यूनतम समर्थन मूल्य ₹4,600 प्रति क्विंटल।",
            formula_or_value="₹4,600 / quintal",
            source_name="Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
            source_document="Price Policy for Kharif Crops: The Marketing Season 2024-25 (Oilseeds)",
            source_url="https://cacp.dacnet.nic.in",
            effective_from="2024-10-01",
            effective_to="2025-09-30",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="CACP-MSP-KHARIF-MAIZE-2024",
            scheme_name="Minimum Support Price (MSP)",
            rule_type="msp",
            crop="Maize",
            season="Kharif 2024-25",
            description_en="Statutory Minimum Support Price for Maize for Kharif Marketing Season 2024-25 at ₹2,090 per quintal.",
            description_hi="खरीफ विपणन सत्र 2024-25 के लिए मक्का का वैधानिक न्यूनतम समर्थन मूल्य ₹2,090 प्रति क्विंटल।",
            formula_or_value="₹2,090 / quintal",
            source_name="Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
            source_document="Price Policy for Kharif Crops: The Marketing Season 2024-25 (Coarse Cereals)",
            source_url="https://cacp.dacnet.nic.in",
            effective_from="2024-10-01",
            effective_to="2025-09-30",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="CACP-MSP-RABI-CHANA-2024",
            scheme_name="Minimum Support Price (MSP)",
            rule_type="msp",
            crop="Chana",
            season="Rabi 2024-25",
            description_en="Statutory Minimum Support Price for Chana (Gram) for Rabi Marketing Season 2024-25 at ₹5,440 per quintal.",
            description_hi="रबी विपणन सत्र 2024-25 के लिए चना (ग्राम) का वैधानिक न्यूनतम समर्थन मूल्य ₹5,440 प्रति क्विंटल।",
            formula_or_value="₹5,440 / quintal",
            source_name="Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
            source_document="Price Policy for Rabi Crops: The Marketing Season 2024-25 (Pulses)",
            source_url="https://cacp.dacnet.nic.in",
            effective_from="2024-04-01",
            effective_to="2025-03-31",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="CACP-MSP-RABI-MUSTARD-2024",
            scheme_name="Minimum Support Price (MSP)",
            rule_type="msp",
            crop="Mustard",
            season="Rabi 2024-25",
            description_en="Statutory Minimum Support Price for Rapeseed & Mustard for Rabi Marketing Season 2024-25 at ₹5,650 per quintal.",
            description_hi="रबी विपणन सत्र 2024-25 के लिए सरसों/तोरिया का वैधानिक न्यूनतम समर्थन मूल्य ₹5,650 प्रति क्विंटल।",
            formula_or_value="₹5,650 / quintal",
            source_name="Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
            source_document="Price Policy for Rabi Crops: The Marketing Season 2024-25 (Rapeseed & Mustard)",
            source_url="https://cacp.dacnet.nic.in",
            effective_from="2024-04-01",
            effective_to="2025-03-31",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="RBI-FIDD-KCC-2019",
            scheme_name="Kisan Credit Card (KCC) Scheme",
            rule_type="loan_disbursement",
            crop=None,
            season=None,
            description_en="RBI Master Circular governing credit limits, revolving cash credit facility, and mandatory scale of finance for KCC.",
            description_hi="आरबीआई मास्टर परिपत्र: केसीसी ऋण सीमा, आवर्ती नकद साख सुविधा और वित्त मापमान के नियम।",
            formula_or_value="Scale of Finance + 10% post-harvest + 20% maintenance",
            source_name="Reserve Bank of India (RBI)",
            source_document="Master Circular – Kisan Credit Card (KCC) Scheme (FIDD.CO.FSD.BC.No.12/05.05.010/2018-19)",
            source_url="https://www.rbi.org.in",
            effective_from="2019-02-04",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="MOA-MISS-PRI-2024",
            scheme_name="Modified Interest Subvention Scheme (MISS)",
            rule_type="interest_subvention",
            crop=None,
            season=None,
            description_en="Operational Guidelines for Modified Interest Subvention Scheme: 7.0% p.a. standard benchmark lending rate; 3.0% Prompt Repayment Incentive (effective 4.0% p.a.) up to ₹3 Lakh.",
            description_hi="संशोधित ब्याज अनुदान योजना परिचालन दिशानिर्देश: 7% मानक ब्याज दर एवं 3% शीघ्र पुनर्भुगतान प्रोत्साहन (प्रभावी 4%) ₹3 लाख तक।",
            formula_or_value="Standard 7.0% p.a. - 3.0% PRI = Effective 4.0% p.a. up to ₹3,00,000",
            source_name="Ministry of Agriculture & Farmers Welfare, GoI / RBI",
            source_document="Operational Guidelines for Modified Interest Subvention Scheme (MISS) for Short-Term Agri Loans",
            source_url="https://agriwelfare.gov.in",
            effective_from="2024-04-01",
            effective_to="2025-03-31",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="RBI-FEE-WAIVER-2019",
            scheme_name="Agricultural Loan Service Charges Waiver",
            rule_type="processing_fee",
            crop=None,
            season=None,
            description_en="Mandatory statutory waiver of processing, documentation, inspection, and ledger folio charges for crop loans up to ₹3 Lakh.",
            description_hi="₹3 लाख तक के फसल ऋणों पर प्रोसेसिंग, दस्तावेज़ीकरण, निरीक्षण और लेज़र फोलियो शुल्क की वैधानिक पूर्ण छूट।",
            formula_or_value="₹0 charges on crop loans up to ₹3,00,000",
            source_name="Reserve Bank of India (RBI)",
            source_document="Waiver of Processing, Documentation, Inspection and Ledger Folio Charges for KCC loans up to ₹3 Lakh (FIDD.CO.FSD.BC.No.13/05.05.010/2018-19)",
            source_url="https://www.rbi.org.in",
            effective_from="2019-02-07",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
        RuleSource(
            rule_code="PMFBY-REV-GUIDELINES-2020",
            scheme_name="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            rule_type="insurance_claim",
            crop=None,
            season=None,
            description_en="PMFBY statutory threshold yield assessment, localized calamity claim settlement, and post-harvest loss indemnity rules.",
            description_hi="पीएमएफबीवाई वैधानिक थ्रेशोल्ड उपज आकलन, स्थानीयकृत आपदा दावा निपटान एवं कटाई उपरांत क्षतिपूर्ति नियम।",
            formula_or_value="Indemnity = [(Threshold Yield - Actual Yield) / Threshold Yield] * Sum Insured",
            source_name="Ministry of Agriculture & Farmers Welfare, GoI",
            source_document="PMFBY Revised Operational Guidelines",
            source_url="https://pmfby.gov.in",
            effective_from="2020-04-01",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
        ),
    ]

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_columns()

    db = SessionLocal()
    try:
        # Check if already seeded
        farmer_exists = db.query(Farmer).filter_by(farmer_id="FV12345").first()
        if farmer_exists:
            # Check if schemes need enrichment
            if not db.query(Scheme).filter_by(scheme_code="SOIL-CARD").first():
                print("Enriching schemes with Central/State entries...")
                seed_schemes_list(db)
            if db.query(Office).count() == 0:
                print("Seeding offices...")
                db.add_all(get_all_seed_offices())
                db.commit()
            if db.query(RuleSource).count() == 0:
                print("Seeding reference rules...")
                db.add_all(get_all_seed_rules())
                db.commit()
            if db.query(LoanProduct).count() == 0:
                print("Seeding loan products...")
                db.add_all(get_all_seed_loan_products())
                db.commit()
            enrich_farmer_loans(db, farmer_exists)
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
            verification_status="Needs Review",
            reason_codes=["DISBURSEMENT_MISMATCH", "PROCESSING_FEE_FLAG"],
            reasons=[
                "Approved amount (₹80,000) exceeds disbursed amount (₹70,000) by ₹10,000 difference.",
                "Deductions include ₹5,000 unitemized processing or administrative fee (RBI mandates ₹0 fee up to ₹3 Lakh).",
                "Crop insurance (PMFBY) premium auto-deduction requires verification against policy certificate.",
            ],
            loan_date="12-03-2024",
            last_verified_at="12 Apr 2025",
            sanction_doc_name="Loan_Sanction_Letter_SBI.pdf",
        )
        loan_ver = Loan(
            loan_ref="LN-2023-4102",
            farmer_id=ramesh.id,
            bank_name="State Bank of India",
            loan_type="KCC Short-term",
            approved_amount=50000.0,
            disbursed_amount=50000.0,
            interest_rate=7.0,
            deductions=0.0,
            repayments=50000.0,
            difference=0.0,
            status="Verified",
            verification_status="Verified",
            reason_codes=[],
            reasons=["All figures match the approved sanction letter and statutory guidelines."],
            loan_date="10-06-2023",
            last_verified_at="15 Jan 2024",
            sanction_doc_name="KCC_Sanction_Letter_2023.pdf",
        )
        loan_not_ver = Loan(
            loan_ref="LN-2024-9943",
            farmer_id=ramesh.id,
            bank_name="Chhattisgarh Rajya Gramin Bank",
            loan_type="Agri Term Loan",
            approved_amount=120000.0,
            disbursed_amount=0.0,
            interest_rate=9.5,
            deductions=0.0,
            repayments=0.0,
            difference=120000.0,
            status="Not Verified",
            verification_status="Not Verified",
            reason_codes=["MISSING_SANCTION_DOC", "CHECK_NOT_RUN"],
            reasons=[
                "Missing sanction letter or document. Please upload your sanction letter to verify.",
                "Verification check has not been executed yet.",
            ],
            loan_date="20-03-2024",
            last_verified_at=None,
            sanction_doc_name=None,
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
            verification_status="Verified",
            reason_codes=[],
            reasons=["All figures match the approved sanction letter."],
            loan_date="18-05-2024",
            last_verified_at="18 May 2024",
        )
        db.add_all([loan1, loan_ver, loan_not_ver, loan2])

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

        # 6. Schemes (Central and State Schemes with verified government portals)
        seed_schemes_list(db)

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

        # 10. Nearby Agriculture Offices
        db.add_all(get_all_seed_offices())

        # 11. Cited Reference Rules and Statutory Benchmarks
        db.add_all(get_all_seed_rules())

        # 12. Loan Products Catalog
        db.add_all(get_all_seed_loan_products())

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
