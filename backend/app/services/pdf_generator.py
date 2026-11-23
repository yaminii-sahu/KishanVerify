"""
KishanVerify PDF Report Generator
================================
Publication-quality PDF discrepancy and verification reports using ReportLab.
Includes arithmetic tables, farmer metadata, procedural reasons, official rule citations,
and actionable next steps (Nearby Offices, Kisan Call Centre 1800-180-1551).
Supports Devanagari Hindi font rendering with automatic fallback.
"""

import io
import os
import datetime
from typing import List, Dict, Any, Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
    Image as RLImage,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ---------------------------------------------------------------------------
# Font Initialization (Devanagari / UTF-8 Support)
# ---------------------------------------------------------------------------

FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

def init_fonts():
    global FONT_REGULAR, FONT_BOLD
    font_candidates = [
        ("C:/Windows/Fonts/mangal.ttf", "C:/Windows/Fonts/mangalb.ttf"),
        ("C:/Windows/Fonts/Nirmala.ttc", "C:/Windows/Fonts/NirmalaB.ttc"),
        ("/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf", "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf"),
        ("/usr/share/fonts/truetype/freefont/FreeSans.ttf", "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"),
    ]
    for reg, bld in font_candidates:
        if os.path.exists(reg):
            try:
                pdfmetrics.registerFont(TTFont("DevanagariFont", reg))
                if os.path.exists(bld):
                    pdfmetrics.registerFont(TTFont("DevanagariFont-Bold", bld))
                    FONT_BOLD = "DevanagariFont-Bold"
                else:
                    FONT_BOLD = "DevanagariFont"
                FONT_REGULAR = "DevanagariFont"
                break
            except Exception:
                continue

init_fonts()


def _get_styles():
    styles = getSampleStyleSheet()

    forest_green = colors.HexColor("#233E25")
    sage_green = colors.HexColor("#4E6E3D")
    charcoal = colors.HexColor("#222222")
    muted = colors.HexColor("#555555")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName=FONT_BOLD,
        fontSize=18,
        leading=22,
        textColor=forest_green,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName=FONT_REGULAR,
        fontSize=9.5,
        leading=13,
        textColor=muted
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName=FONT_BOLD,
        fontSize=11,
        leading=15,
        textColor=forest_green,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName=FONT_REGULAR,
        fontSize=9,
        leading=12.5,
        textColor=charcoal
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName=FONT_BOLD,
        fontSize=9,
        leading=12.5,
        textColor=charcoal
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName=FONT_REGULAR,
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#666666")
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "section": section_heading,
        "body": body_style,
        "body_bold": body_bold,
        "disclaimer": disclaimer_style,
        "forest": forest_green,
        "sage": sage_green,
        "border": colors.HexColor("#D8D4C8"),
        "alert": colors.HexColor("#B83227"),
        "verified": colors.HexColor("#2E7D32"),
        "cream": colors.HexColor("#FAF8F2"),
    }


def _build_header(story, styles, report_ref: str):
    logo_path = os.path.join(os.path.dirname(__file__), "..", "assets", "logo-tile.png")
    if not os.path.exists(logo_path):
        logo_path = os.path.join(os.path.dirname(__file__), "..", "assets", "logo-mark.png")

    date_str = datetime.date.today().strftime('%d %b %Y')
    if os.path.exists(logo_path):
        logo_img = RLImage(logo_path, width=0.6 * inch, height=0.6 * inch)
        header_table = Table(
            [
                [
                    logo_img,
                    Paragraph("<b>KISANVERIFY</b><br/><font size=8 color='#555555'>Agricultural Financial Transparency Platform</font>", styles["body"]),
                    Paragraph(f"<b>REPORT REF:</b> {report_ref}<br/><b>DATE:</b> {date_str}", ParagraphStyle('R', parent=styles["body"], alignment=2))
                ]
            ],
            colWidths=[0.75 * inch, 3.45 * inch, 3.0 * inch]
        )
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
    else:
        header_table = Table(
            [
                [
                    Paragraph("<b>KISANVERIFY</b><br/><font size=8 color='#555555'>Agricultural Financial Transparency Platform</font>", styles["body"]),
                    Paragraph(f"<b>REPORT REF:</b> {report_ref}<br/><b>DATE:</b> {date_str}", ParagraphStyle('R', parent=styles["body"], alignment=2))
                ]
            ],
            colWidths=[3.8 * inch, 3.4 * inch]
        )
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))

    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=styles["sage"], spaceBefore=3, spaceAfter=10))


def _build_status_banner(story, styles, status: str, title: str, subtitle: str):
    is_flagged = "review" in status.lower() or "discrepancy" in status.lower()
    is_bonus = "bonus" in status.lower() or "exceeds" in status.lower()

    if is_flagged:
        color = styles["alert"]
        bg = colors.HexColor("#FCEAE4")
    elif is_bonus:
        color = colors.HexColor("#1E5F74")
        bg = colors.HexColor("#E3F2FD")
    else:
        color = styles["verified"]
        bg = colors.HexColor("#EDF7ED")

    story.append(Paragraph(title, styles["title"]))
    story.append(Paragraph(subtitle, styles["subtitle"]))
    story.append(Spacer(1, 6))

    status_pill = [
        [Paragraph(f"<b>RECONCILIATION STATUS:</b> <font color='{color}'>{status.upper()}</font>", ParagraphStyle('St', parent=styles["body_bold"], alignment=1))]
    ]
    status_table = Table(status_pill, colWidths=[7.2 * inch])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg),
        ('BOX', (0, 0), (-1, -1), 1, color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(status_table)
    story.append(Spacer(1, 10))


def _build_disclaimer_and_footer(story, styles):
    story.append(Spacer(1, 8))
    disclaimer_box = [
        [
            Paragraph(
                "<b>LEGAL & POLICY NOTICE:</b><br/>"
                "This report is generated automatically by KisanVerify. Calculations are strictly deterministic based on "
                "entered records and cited statutory benchmark rules. The presence of a discrepancy does not constitute proof of "
                "wrongdoing or fraud; discrepancies commonly arise from legitimate administrative causes (such as uncredited subsidies, "
                "mandi moisture refractions, or authorized fee schedules). For assistance, contact the Kisan Call Centre at "
                "<b>1800-180-1551</b> (toll-free) or visit your nearest Agricultural Office.",
                styles["disclaimer"]
            )
        ]
    ]
    disc_table = Table(disclaimer_box, colWidths=[7.2 * inch])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F5F5F3")),
        ('BOX', (0, 0), (-1, -1), 0.5, styles["border"]),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(disc_table)


# ---------------------------------------------------------------------------
# 1. LOAN VERIFICATION REPORT GENERATOR
# ---------------------------------------------------------------------------

def generate_loan_report_pdf(
    report_ref: str,
    farmer_name: str,
    farmer_id: str,
    village: str,
    district: str,
    state: str,
    bank_name: str,
    account_masked: str,
    approved_amount: float,
    disbursed_amount: float,
    deductions: float,
    difference: float,
    unaccounted: float,
    status: str,
    reasons: List[str],
    sources: Optional[List[Dict[str, Any]]] = None,
    loan_date: str = "12-03-2024",
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = _get_styles()
    story = []

    _build_header(story, styles, report_ref)
    _build_status_banner(
        story, styles, status,
        "Agricultural Loan Verification Report",
        "Deterministic audit of sanctioned credit limit vs. recorded loan disbursement"
    )

    # 1. Beneficiary & Loan Particulars
    story.append(Paragraph("1. Beneficiary & Financial Institution Particulars", styles["section"]))
    farmer_data = [
        [Paragraph("<b>Farmer Name:</b>", styles["body"]), Paragraph(farmer_name, styles["body"]),
         Paragraph("<b>Farmer ID:</b>", styles["body"]), Paragraph(farmer_id, styles["body"])],
        [Paragraph("<b>Location:</b>", styles["body"]), Paragraph(f"{village}, {district}, {state}", styles["body"]),
         Paragraph("<b>Sanction Date:</b>", styles["body"]), Paragraph(loan_date, styles["body"])],
        [Paragraph("<b>Lending Bank:</b>", styles["body"]), Paragraph(bank_name, styles["body"]),
         Paragraph("<b>Account Number:</b>", styles["body"]), Paragraph(account_masked, styles["body"])],
    ]
    farmer_table = Table(farmer_data, colWidths=[1.7 * inch, 1.9 * inch, 1.7 * inch, 1.9 * inch])
    farmer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9F8F5")),
        ('GRID', (0, 0), (-1, -1), 0.5, styles["border"]),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(farmer_table)
    story.append(Spacer(1, 10))

    # 2. Arithmetic Reconciliation Table
    story.append(Paragraph("2. Financial Figures & Itemized Deduction Reconciliation", styles["section"]))
    diff_color = styles["alert"] if difference > 0 else styles["verified"]
    unacc_color = styles["alert"] if unaccounted > 0 else styles["verified"]

    fin_data = [
        [Paragraph("<b>Metric / Deduction Head</b>", styles["body_bold"]), Paragraph("<b>Amount (INR)</b>", ParagraphStyle('R', parent=styles["body_bold"], alignment=2))],
        [Paragraph("Approved Loan Sanction Limit", styles["body"]), Paragraph(f"₹ {approved_amount:,.2f}", ParagraphStyle('R', parent=styles["body"], alignment=2))],
        [Paragraph("Recorded Disbursed Amount (Bank Credit)", styles["body"]), Paragraph(f"₹ {disbursed_amount:,.2f}", ParagraphStyle('R', parent=styles["body"], alignment=2))],
        [Paragraph("Gross Arithmetic Difference (Approved − Disbursed)", styles["body"]), Paragraph(f"<b><font color='{diff_color}'>₹ {difference:,.2f}</font></b>", ParagraphStyle('R', parent=styles["body"], alignment=2))],
        [Paragraph("Itemized Deductions (Processing Fees, Documentation, PMFBY)", styles["body"]), Paragraph(f"₹ {deductions:,.2f}", ParagraphStyle('R', parent=styles["body"], alignment=2))],
        [Paragraph("<b>Net Unexplained Difference (Gross − Deductions)</b>", styles["body_bold"]), Paragraph(f"<b><font color='{unacc_color}'>₹ {unaccounted:,.2f}</font></b>", ParagraphStyle('R', parent=styles["body_bold"], alignment=2))],
    ]

    fin_table = Table(fin_data, colWidths=[4.9 * inch, 2.3 * inch])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), styles["forest"]),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, styles["border"]),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('BACKGROUND', (0, -1), (-1, -1), styles["cream"]),
    ]))
    story.append(fin_table)
    story.append(Spacer(1, 10))

    # 3. Basis of This Check (Cited Statutory Rules)
    story.append(Paragraph("3. Basis of This Check & Cited Official Rules", styles["section"]))
    rule_data = [
        [
            Paragraph("<b>Rule Code</b>", styles["body_bold"]),
            Paragraph("<b>Scheme & Policy Authority</b>", styles["body_bold"]),
            Paragraph("<b>Statutory Directive / Limit</b>", styles["body_bold"]),
            Paragraph("<b>Official Source</b>", styles["body_bold"]),
        ]
    ]

    if sources:
        for s in sources:
            code = s.get("rule_code", "RULE")
            scheme = f"<b>{s.get('scheme_name', '')}</b><br/><font size=7 color='#666666'>{s.get('authority', s.get('source_name', ''))}</font>"
            details = s.get("details", s.get("formula_or_value", ""))
            url = s.get("url") or s.get("source_url") or "Official Portal"
            rule_data.append([
                Paragraph(f"<font size=8>{code}</font>", styles["body"]),
                Paragraph(scheme, styles["body"]),
                Paragraph(f"<font size=8>{details}</font>", styles["body"]),
                Paragraph(f"<font size=8 color='#1E5F74'>{url}</font>", styles["body"]),
            ])
    else:
        rule_data.extend([
            [
                Paragraph("<font size=8>RBI-FEE-WAIVER-2019</font>", styles["body"]),
                Paragraph("<b>Agricultural Fee Waiver</b><br/><font size=7 color='#666666'>Reserve Bank of India</font>", styles["body"]),
                Paragraph("<font size=8>₹0 processing, documentation and ledger fee on crop loans up to ₹3,00,000</font>", styles["body"]),
                Paragraph("<font size=8 color='#1E5F74'>https://www.rbi.org.in</font>", styles["body"]),
            ],
            [
                Paragraph("<font size=8>MOA-MISS-PRI-2024</font>", styles["body"]),
                Paragraph("<b>Interest Subvention Scheme (MISS)</b><br/><font size=7 color='#666666'>MoA&FW / RBI</font>", styles["body"]),
                Paragraph("<font size=8>7% benchmark lending rate with 3% prompt repayment subvention (effective 4%)</font>", styles["body"]),
                Paragraph("<font size=8 color='#1E5F74'>https://agriwelfare.gov.in</font>", styles["body"]),
            ],
        ])

    rule_table = Table(rule_data, colWidths=[1.3 * inch, 2.3 * inch, 2.2 * inch, 1.4 * inch])
    rule_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EFEFEA")),
        ('GRID', (0, 0), (-1, -1), 0.5, styles["border"]),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(rule_table)
    story.append(Spacer(1, 10))

    # 4. Procedural Context & Legitimate Reasons
    story.append(Paragraph("4. Procedural Explanations for Identified Variance", styles["section"]))
    for r in reasons:
        story.append(Paragraph(f"• {r}", styles["body"]))
        story.append(Spacer(1, 1.5))
    story.append(Spacer(1, 8))

    # 5. Actionable Next Steps
    story.append(Paragraph("5. Recommended Next Steps for Farmer", styles["section"]))
    steps = [
        "Visit your bank branch with this report and request an itemized loan deduction break-up statement.",
        "Verify if PMFBY crop insurance premium was auto-deducted under statutory notification.",
        "Contact the nearest Agriculture Office / Lead Bank Manager (accessible via Nearby Offices on KisanVerify).",
        "Call the Kisan Call Centre (Toll-Free): <b>1800-180-1551</b> for institutional guidance.",
        f"If the variance remains unresolved after 10 working days, raise a grievance citing Report Ref: <b>{report_ref}</b>.",
    ]
    for idx, s in enumerate(steps, 1):
        story.append(Paragraph(f"<b>{idx}.</b> {s}", styles["body"]))
        story.append(Spacer(1, 2))

    _build_disclaimer_and_footer(story, styles)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


# ---------------------------------------------------------------------------
# 2. MSP PAYMENT VERIFICATION REPORT GENERATOR
# ---------------------------------------------------------------------------

def generate_msp_report_pdf(
    report_ref: str,
    farmer_name: str,
    farmer_id: str,
    village: str,
    district: str,
    state: str,
    crop: str,
    quantity_quintals: float,
    msp_rate: float,
    expected_payment: float,
    actual_payment: float,
    difference: float,
    status: str,
    procurement_center: str = "Procurement Mandi",
    season: str = "Kharif 2024-25",
    reasons: Optional[List[str]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = _get_styles()
    story = []

    _build_header(story, styles, report_ref)
    _build_status_banner(
        story, styles, status,
        "MSP Payment Verification & Procurement Reconciliation Report",
        f"Statutory price policy reconciliation for {crop} ({season})"
    )

    # 1. Beneficiary & Procurement Particulars
    story.append(Paragraph("1. Beneficiary & Mandi Procurement Particulars", styles["section"]))
    farmer_data = [
        [Paragraph("<b>Farmer Name:</b>", styles["body"]), Paragraph(farmer_name, styles["body"]),
         Paragraph("<b>Farmer ID:</b>", styles["body"]), Paragraph(farmer_id, styles["body"])],
        [Paragraph("<b>Location:</b>", styles["body"]), Paragraph(f"{village}, {district}, {state}", styles["body"]),
         Paragraph("<b>Marketing Season:</b>", styles["body"]), Paragraph(season, styles["body"])],
        [Paragraph("<b>Procurement Mandi:</b>", styles["body"]), Paragraph(procurement_center, styles["body"]),
         Paragraph("<b>Procured Crop:</b>", styles["body"]), Paragraph(crop, styles["body"])],
    ]
    farmer_table = Table(farmer_data, colWidths=[1.7 * inch, 1.9 * inch, 1.7 * inch, 1.9 * inch])
    farmer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9F8F5")),
        ('GRID', (0, 0), (-1, -1), 0.5, styles["border"]),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(farmer_table)
    story.append(Spacer(1, 10))

    # 2. Step-by-Step MSP Arithmetic Breakdown Table
    story.append(Paragraph("2. Deterministic MSP Formula & Financial Reconciliation", styles["section"]))
    diff_color = styles["alert"] if difference > 0 else styles["verified"]

    fin_data = [
        [Paragraph("<b>Reconciliation Step</b>", styles["body_bold"]), Paragraph("<b>Calculation / Value</b>", ParagraphStyle('R', parent=styles["body_bold"], alignment=2))],
        [Paragraph(f"Weighed Crop Quantity ({crop})", styles["body"]), Paragraph(f"{quantity_quintals:,.2f} Quintals", ParagraphStyle('R', parent=styles["body"], alignment=2))],
        [Paragraph("Statutory Minimum Support Price (CACP Rate)", styles["body"]), Paragraph(f"₹ {msp_rate:,.2f} / Quintal", ParagraphStyle('R', parent=styles["body"], alignment=2))],
        [Paragraph("<b>Total Statutory Expected Entitlement (Qty × Rate)</b>", styles["body_bold"]), Paragraph(f"<b>₹ {expected_payment:,.2f}</b>", ParagraphStyle('R', parent=styles["body_bold"], alignment=2))],
        [Paragraph("Actual Procurement Payment Credited (Bank / PFMS DBT)", styles["body"]), Paragraph(f"₹ {actual_payment:,.2f}", ParagraphStyle('R', parent=styles["body"], alignment=2))],
        [Paragraph("<b>Reconciliation Difference (Expected − Actual)</b>", styles["body_bold"]), Paragraph(f"<b><font color='{diff_color}'>₹ {difference:,.2f}</font></b>", ParagraphStyle('R', parent=styles["body_bold"], alignment=2))],
    ]

    fin_table = Table(fin_data, colWidths=[4.9 * inch, 2.3 * inch])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), styles["forest"]),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, styles["border"]),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('BACKGROUND', (0, -1), (-1, -1), styles["cream"]),
    ]))
    story.append(fin_table)
    story.append(Spacer(1, 10))

    # 3. Basis of This Check (CACP Gazette Notification)
    story.append(Paragraph("3. Statutory Authority & Cited Procurement Notifications", styles["section"]))
    rule_data = [
        [
            Paragraph("<b>Rule Code</b>", styles["body_bold"]),
            Paragraph("<b>Statutory Authority</b>", styles["body_bold"]),
            Paragraph("<b>Notification / Circular Title</b>", styles["body_bold"]),
            Paragraph("<b>Official Source</b>", styles["body_bold"]),
        ]
    ]

    if sources:
        for s in sources:
            code = s.get("rule_code", "RULE")
            auth = f"<b>{s.get('authority', s.get('source_name', 'CACP / DA&FW'))}</b>"
            doc_name = s.get("document", s.get("source_document", f"MSP Price Policy for {crop}"))
            url = s.get("url") or s.get("source_url") or "https://cacp.dacnet.nic.in"
            rule_data.append([
                Paragraph(f"<font size=8>{code}</font>", styles["body"]),
                Paragraph(auth, styles["body"]),
                Paragraph(f"<font size=8>{doc_name}</font>", styles["body"]),
                Paragraph(f"<font size=8 color='#1E5F74'>{url}</font>", styles["body"]),
            ])
    else:
        rule_data.extend([
            [
                Paragraph("<font size=8>CACP-MSP-2024</font>", styles["body"]),
                Paragraph("<b>CACP / DA&FW, GoI</b>", styles["body"]),
                Paragraph(f"<font size=8>Price Policy for {crop}: Marketing Season {season} Gazette</font>", styles["body"]),
                Paragraph("<font size=8 color='#1E5F74'>https://cacp.dacnet.nic.in</font>", styles["body"]),
            ],
            [
                Paragraph("<font size=8>MANDI-JFORM-RECEIPT</font>", styles["body"]),
                Paragraph(f"<b>{procurement_center}</b>", styles["body"]),
                Paragraph("<font size=8>Weighment Slip & Electronic Mandi J-Form Receipt</font>", styles["body"]),
                Paragraph("<font size=8 color='#1E5F74'>https://enam.gov.in</font>", styles["body"]),
            ],
            [
                Paragraph("<font size=8>PFMS-DBT-SETTLEMENT</font>", styles["body"]),
                Paragraph("<b>Ministry of Finance, GoI</b>", styles["body"]),
                Paragraph("<font size=8>Public Financial Management System DBT Settlement Protocol</font>", styles["body"]),
                Paragraph("<font size=8 color='#1E5F74'>https://pfms.nic.in</font>", styles["body"]),
            ],
        ])

    rule_table = Table(rule_data, colWidths=[1.4 * inch, 2.0 * inch, 2.4 * inch, 1.4 * inch])
    rule_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EFEFEA")),
        ('GRID', (0, 0), (-1, -1), 0.5, styles["border"]),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(rule_table)
    story.append(Spacer(1, 10))

    # 4. Potential Procedural Reasons
    story.append(Paragraph("4. Legitimate Procedural Reasons for Variance", styles["section"]))
    msp_reasons = reasons or [
        "Quality moisture deduction applied at Mandi weighbridge (refraction beyond FAQ specifications).",
        "Partial procurement tranche released; subsequent balance payment scheduled in second disbursement cycle.",
        "Mandi cess, handling charges, or gunny bag security withheld under APMC regulations.",
        "Direct Benefit Transfer (PFMS) clearing delay between state treasury and bank branch.",
    ]
    for r in msp_reasons:
        story.append(Paragraph(f"• {r}", styles["body"]))
        story.append(Spacer(1, 1.5))
    story.append(Spacer(1, 8))

    # 5. Actionable Next Steps
    story.append(Paragraph("5. Recommended Actionable Steps for Farmer", styles["section"]))
    steps = [
        "Check your Mandi J-Form and weighbridge slip for documented moisture percentage or FAQ refraction cuts.",
        f"Inquire at the procurement helpdesk at {procurement_center} regarding scheduled payment tranches.",
        "Contact the District Civil Supplies Office / Food & Civil Supplies Department for DBT reconciliation.",
        "Call the Kisan Call Centre (Toll-Free): <b>1800-180-1551</b> for procurement assistance.",
        f"If the variance remains unexplained, file a formal complaint citing Report Ref: <b>{report_ref}</b>.",
    ]
    for idx, s in enumerate(steps, 1):
        story.append(Paragraph(f"<b>{idx}.</b> {s}", styles["body"]))
        story.append(Spacer(1, 2))

    _build_disclaimer_and_footer(story, styles)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


# ---------------------------------------------------------------------------
# 3. UNIFIED DISPATCHER (Backwards & Dynamic Compatibility)
# ---------------------------------------------------------------------------

def generate_verification_pdf(
    report_type: str,
    report_ref: str,
    farmer_name: str,
    farmer_id: str,
    village: str,
    district: str,
    state: str,
    bank_name: str,
    account_masked: str,
    status: str,
    approved_or_expected: float,
    disbursed_or_actual: float,
    difference: float,
    reasons: list,
    extra_details: dict = None
) -> bytes:
    """
    Unified dispatcher: Routes to specialized Loan or MSP template.
    """
    if "MSP" in report_type:
        crop = extra_details.get("crop", "Paddy") if extra_details else "Paddy"
        qty = extra_details.get("quantity_quintals", 50.0) if extra_details else 50.0
        rate = extra_details.get("msp_rate", 2300.0) if extra_details else 2300.0
        sources = extra_details.get("sources") if extra_details else None
        proc_center = extra_details.get("procurement_center", "Procurement Mandi") if extra_details else "Procurement Mandi"

        return generate_msp_report_pdf(
            report_ref=report_ref,
            farmer_name=farmer_name,
            farmer_id=farmer_id,
            village=village,
            district=district,
            state=state,
            crop=crop,
            quantity_quintals=qty,
            msp_rate=rate,
            expected_payment=approved_or_expected,
            actual_payment=disbursed_or_actual,
            difference=difference,
            status=status,
            procurement_center=proc_center,
            reasons=reasons,
            sources=sources,
        )

    # Default to Loan template
    deductions = extra_details.get("deductions", 0.0) if extra_details else 0.0
    unaccounted = extra_details.get("unaccounted", difference - deductions) if extra_details else (difference - deductions)
    sources = extra_details.get("sources") if extra_details else None

    return generate_loan_report_pdf(
        report_ref=report_ref,
        farmer_name=farmer_name,
        farmer_id=farmer_id,
        village=village,
        district=district,
        state=state,
        bank_name=bank_name,
        account_masked=account_masked,
        approved_amount=approved_or_expected,
        disbursed_amount=disbursed_or_actual,
        deductions=deductions,
        difference=difference,
        unaccounted=unaccounted,
        status=status,
        reasons=reasons,
        sources=sources,
    )
