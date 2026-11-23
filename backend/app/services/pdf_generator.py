"""
KisanVerify PDF Report Generator
================================
Generates publication-quality PDF discrepancy and verification reports using ReportLab.
Includes arithmetic tables, farmer metadata, procedural reasons, and non-accusatory disclaimers.
"""

import io
import os
import datetime
from reportlab.lib.pagesizes import letter, A4
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
    Generates a PDF report as raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Brand Colors
    forest_green = colors.HexColor("#233E25")
    sage_green = colors.HexColor("#4E6E3D")
    cream_bg = colors.HexColor("#FAF8F2")
    alert_red = colors.HexColor("#C53030")
    verified_green = colors.HexColor("#2E7D32")
    border_gray = colors.HexColor("#D8D4C8")

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=forest_green,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#555555")
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=forest_green,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#222222")
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#666666")
    )

    story = []

    # 1. Header Banner with Official Logo
    logo_path = os.path.join(os.path.dirname(__file__), "..", "assets", "logo-tile.png")
    if not os.path.exists(logo_path):
        logo_path = os.path.join(os.path.dirname(__file__), "..", "assets", "logo-mark.png")

    if os.path.exists(logo_path):
        logo_img = RLImage(logo_path, width=0.65 * inch, height=0.65 * inch)
        header_data = [
            [
                logo_img,
                Paragraph("<b>KISANVERIFY</b><br/><font size=8 color='#555555'>Agricultural Financial Transparency Platform</font>", body_style),
                Paragraph(f"<b>REPORT REF:</b> {report_ref}<br/><b>DATE:</b> {datetime.date.today().strftime('%d %b %Y')}", ParagraphStyle('RightText', parent=body_style, alignment=2))
            ]
        ]
        header_table = Table(header_data, colWidths=[0.8 * inch, 3.4 * inch, 3.0 * inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
    else:
        header_data = [
            [
                Paragraph("<b>KISANVERIFY</b><br/><font size=8 color='#555555'>Agricultural Financial Transparency Platform</font>", body_style),
                Paragraph(f"<b>REPORT REF:</b> {report_ref}<br/><b>DATE:</b> {datetime.date.today().strftime('%d %b %Y')}", ParagraphStyle('RightText', parent=body_style, alignment=2))
            ]
        ]
        header_table = Table(header_data, colWidths=[3.8 * inch, 3.4 * inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=sage_green, spaceBefore=4, spaceAfter=14))

    # 2. Report Title & Status Badge
    is_flagged = "review" in status.lower() or "discrepancy" in status.lower()
    status_color = alert_red if is_flagged else verified_green
    status_bg = colors.HexColor("#FDECEB") if is_flagged else colors.HexColor("#EDF7ED")

    story.append(Paragraph(f"{report_type} — Statement of Reconciliation", title_style))
    story.append(Paragraph("Every rupee. Every benefit. Verified.", subtitle_style))
    story.append(Spacer(1, 10))

    status_pill = [
        [Paragraph(f"<b>VERIFICATION STATUS:</b> <font color='{status_color}'>{status.upper()}</font>", ParagraphStyle('Status', parent=body_style, fontName='Helvetica-Bold'))]
    ]
    status_table = Table(status_pill, colWidths=[7.2 * inch])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), status_bg),
        ('BOX', (0, 0), (-1, -1), 1, status_color),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(status_table)
    story.append(Spacer(1, 14))

    # 3. Farmer & Account Identification Card
    story.append(Paragraph("1. Beneficiary & Account Particulars", section_heading))
    farmer_data = [
        [Paragraph("<b>Farmer Name:</b>", body_style), Paragraph(farmer_name, body_style),
         Paragraph("<b>Farmer ID:</b>", body_style), Paragraph(farmer_id, body_style)],
        [Paragraph("<b>Village & District:</b>", body_style), Paragraph(f"{village}, {district}", body_style),
         Paragraph("<b>State:</b>", body_style), Paragraph(state, body_style)],
        [Paragraph("<b>Financial Institution:</b>", body_style), Paragraph(bank_name, body_style),
         Paragraph("<b>Account Ref (Masked):</b>", body_style), Paragraph(account_masked, body_style)],
    ]
    farmer_table = Table(farmer_data, colWidths=[1.8 * inch, 1.8 * inch, 1.8 * inch, 1.8 * inch])
    farmer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9F8F5")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_gray),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(farmer_table)
    story.append(Spacer(1, 14))

    # 4. Deterministic Financial Reconciliation Table
    story.append(Paragraph("2. Financial Reconciliation & Arithmetic", section_heading))

    label_expected = "Approved Sanction Limit" if "Loan" in report_type else "Expected Statutory MSP"
    label_actual = "Disbursed Amount Recorded" if "Loan" in report_type else "Actual Payment Credited"

    fin_data = [
        [Paragraph("<b>Financial Metric</b>", body_style), Paragraph("<b>Recorded Amount (INR)</b>", ParagraphStyle('R', parent=body_style, alignment=2))],
        [Paragraph(label_expected, body_style), Paragraph(f"₹ {approved_or_expected:,.2f}", ParagraphStyle('R', parent=body_style, alignment=2))],
        [Paragraph(label_actual, body_style), Paragraph(f"₹ {disbursed_or_actual:,.2f}", ParagraphStyle('R', parent=body_style, alignment=2))],
    ]

    if extra_details and "deductions" in extra_details and extra_details["deductions"] > 0:
        fin_data.append([
            Paragraph("Itemized Deductions (Processing Fees / Insurance)", body_style),
            Paragraph(f"₹ {extra_details['deductions']:,.2f}", ParagraphStyle('R', parent=body_style, alignment=2))
        ])

    diff_color = alert_red if difference > 0 else verified_green
    fin_data.append([
        Paragraph("<b>Reconciliation Difference</b>", body_style),
        Paragraph(f"<b><font color='{diff_color}'>₹ {difference:,.2f}</font></b>", ParagraphStyle('R', parent=body_style, alignment=2))
    ])

    fin_table = Table(fin_data, colWidths=[4.8 * inch, 2.4 * inch])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), forest_green),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, border_gray),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, -1), (-1, -1), cream_bg),
    ]))
    story.append(fin_table)
    story.append(Spacer(1, 14))

    # 5. Explanations and Possible Procedural Reasons
    story.append(Paragraph("3. Procedural Context & Potential Explanations", section_heading))
    story.append(Paragraph(
        "KisanVerify calculates differences deterministically. The presence of a difference does not represent "
        "evidence of misconduct. Common legitimate administrative explanations include:",
        body_style
    ))
    story.append(Spacer(1, 4))

    for reason in reasons:
        story.append(Paragraph(f"• {reason}", body_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 12))

    # 6. Actionable Next Steps
    story.append(Paragraph("4. Recommended Next Steps for Farmer", section_heading))
    steps = [
        "Present this verification summary to your bank branch or local mandi procurement desk.",
        "Check bank account statement for matching itemized fee schedules or CCE notifications.",
        "If the difference remains unresolved after 10 working days, file a formal grievance via KisanVerify.",
    ]
    for s in steps:
        story.append(Paragraph(f"1. {s}" if s == steps[0] else f"2. {s}" if s == steps[1] else f"3. {s}", body_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 16))

    # 7. Official Sign-off & Non-accusatory Disclaimer
    disclaimer_box = [
        [
            Paragraph(
                "<b>LEGAL & POLICY NOTICE:</b><br/>"
                "This report is generated automatically by the KisanVerify Agricultural Financial Transparency System. "
                "Calculations are strictly mathematical based on entered and recorded values. A discrepancy flag is "
                "intended to prompt administrative review and is not proof of fraud or wrongdoing. "
                "For formal inquiries, contact the District Lead Bank Office or District Collectorate, Chhattisgarh.",
                disclaimer_style
            )
        ]
    ]
    disc_table = Table(disclaimer_box, colWidths=[7.2 * inch])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F5F5F3")),
        ('BOX', (0, 0), (-1, -1), 0.5, border_gray),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(disc_table)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
