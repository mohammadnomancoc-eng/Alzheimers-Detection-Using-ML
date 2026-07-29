# services/report_service.py
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os
from datetime import datetime

def generate_report(uniq, img_path, heat_path, label, probabilities, patient_data=None):
    if patient_data is None:
        patient_data = {}

    pdf_filename = f"report_{uniq}.pdf"
    pdf_path = os.path.join("uploads", pdf_filename)
    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                            topMargin=0.9*inch, bottomMargin=0.9*inch,
                            leftMargin=0.8*inch, rightMargin=0.8*inch)
    story = []
    styles = getSampleStyleSheet()

    # === STYLES (PERFECTED) ===
    title = ParagraphStyle('Title', parent=styles['Title'], fontSize=26, spaceAfter=20,
                           alignment=TA_CENTER, textColor=colors.HexColor("#003087"))
    subtitle = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=14, spaceAfter=30,
                              alignment=TA_CENTER, textColor=colors.darkgrey)
    h1 = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=18, spaceBefore=25, spaceAfter=15,
                        textColor=colors.HexColor("#003087"))
    normal = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=11, leading=15)
    center = ParagraphStyle('Center', alignment=TA_CENTER, fontSize=11)
    doctor_name = ParagraphStyle('DoctorName', fontSize=15, fontName='Helvetica-Bold', spaceBefore=60, spaceAfter=8)
    doctor_title = ParagraphStyle('DoctorTitle', fontSize=12, spaceAfter=6)
    center_name = ParagraphStyle('CenterName', fontSize=11, fontName='Helvetica-Oblique')

    # Header
    story.append(Paragraph("ALZIMER DIAGNOSTIC CENTER", title))
    story.append(Paragraph("Advanced AI-Powered Alzheimer's Detection System", subtitle))
    story.append(Spacer(1, 15))

    # Patient Info
    info_data = [
        ["Patient Name", patient_data.get("full_name", "N/A") or "N/A"],
        ["Patient Code", patient_data.get("patient_code", "N/A") or "N/A"],
        ["Age / Gender", f"{patient_data.get('age', 'N/A')} yrs / {patient_data.get('gender', 'N/A')}"],
        ["Referring Doctor", patient_data.get("doctor_name", "N/A") or "N/A"],
        ["Report Generated", datetime.now().strftime("%d %B %Y, %I:%M %p")],
    ]
    table = Table(info_data, colWidths=[2.2*inch, 3.3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#e8f4f8")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#003087")),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#003087")),
        ('LEFTPADDING', (1,0), (1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(table)
    story.append(Spacer(1, 25))

    # AI Diagnosis
    confidence = max(probabilities.values())
    risk_color = colors.red if confidence > 0.7 else colors.orange if confidence > 0.5 else colors.green

    story.append(Paragraph("AI DIAGNOSIS", h1))
    story.append(Paragraph(f"<b>{label.upper()}</b>", ParagraphStyle('Big', fontSize=24, textColor=risk_color, spaceAfter=15)))
    story.append(Paragraph(f"AI Confidence Level: <b>{confidence:.1%}</b>", normal))
    story.append(Spacer(1, 20))

    # Images
    if os.path.exists(img_path):
        img1 = Image(img_path, width=2.7*inch, height=2.7*inch)
        img1.hAlign = 'CENTER'
        heat_img = Image(heat_path, width=2.7*inch, height=2.7*inch) if heat_path and os.path.exists(heat_path) else None

        row = [img1]
        captions = [[Paragraph("<b>Original MRI Scan</b>", center)]]
        if heat_img:
            row.append(heat_img)
            captions[0].append(Paragraph("<b>AI Attention Heatmap</b><br/><font size=9>Red = High Abnormality Focus</font>", center))

        img_table = Table([row] + captions, colWidths=[2.9*inch, 2.9*inch])
        img_table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
        story.append(img_table)
    story.append(Spacer(1, 25))

    # === PROBABILITY TABLE — NO GAP, PERFECT ALIGNMENT ===
           # === DETAILED AI CONFIDENCE SCORES — HEADER & ROWS TIGHTLY JOINED ===
    story.append(Paragraph("Detailed AI Confidence Scores", h1))

    prob_data = [["Condition", "Probability"]]
    sorted_probs = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
    for condition, prob in sorted_probs:
        prob_data.append([
            condition.replace("Demented", " Dementia"),
            f"{prob:.1%}"
        ])

    prob_table = Table(prob_data, colWidths=[4.1*inch, 1.4*inch])
    prob_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#003087")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,0), 'MIDDLE'),

        # Body — TIGHTLY JOINED TO HEADER
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.HexColor("#1e3d59")),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 11),
        ('ALIGN', (0,1), (0,-1), 'LEFT'),
        ('ALIGN', (1,1), (1,-1), 'CENTER'),
        ('VALIGN', (0,1), (-1,-1), 'MIDDLE'),

        # GRID — FULL BOX, NO GAP AT ALL
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#003087")),
        ('BOX', (0,0), (-1,-1), 2, colors.HexColor("#003087")),

        # CRITICAL: ZERO PADDING BETWEEN HEADER AND FIRST ROW
        ('TOPPADDING', (0,1), (-1,1), 6),        # First row after header
        ('BOTTOMPADDING', (0,1), (-1,1), 6),
        ('TOPPADDING', (0,2), (-1,-1), 8),      # Rest of rows
        ('BOTTOMPADDING', (0,2), (-1,-1), 8),
        ('LEFTPADDING', (0,1), (0,-1), 15),
        ('RIGHTPADDING', (1,1), (1,-1), 10),
    ]))
    story.append(prob_table)
    story.append(Spacer(1, 35))

    # Recommendations
    story.append(Paragraph("Clinical Recommendations", h1))
    rec_style = ParagraphStyle('Rec', parent=normal, leftIndent=20)
    if confidence > 0.7:
        story.append(Paragraph("• <font color='#d32f2f'><b>Urgent neurological consultation required</b></font>", rec_style))
        story.append(Paragraph("• Consider Acetylcholinesterase inhibitors (Donepezil/Rivastigmine)", rec_style))
    elif confidence > 0.5:
        story.append(Paragraph("• <font color='#f57c00'><b>Early-stage dementia likely — consult neurologist</b></font>", rec_style))
    else:
        story.append(Paragraph("• Continue routine screening annually", rec_style))
    story.append(Paragraph("• Maintain brain-healthy lifestyle (exercise, diet, sleep)", rec_style))

    # === DOCTOR SIGNATURE — PERFECT SPACING ===
    story.append(Spacer(1, 70))
    story.append(Paragraph("Dr. Husain Bhati", doctor_name))
    story.append(Paragraph("Chief Neurologist & AI Research Head", doctor_title))
    story.append(Paragraph("Alzimer Diagnostic Center", center_name))

    doc.build(story)
    return pdf_path
