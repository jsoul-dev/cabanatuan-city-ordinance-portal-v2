#!/usr/bin/env python3
"""
Cabanatuan City Ordinance Portal — User Manual Generator.
Generates an executive, publication-grade Microsoft Word (.docx) document
complete with:
  - Official cover page with city seal and metadata
  - Automated Table of Contents
  - Executive introduction, scope, and technical stack
  - System access & Role-Based Access Control (RBAC) matrix
  - Separate detailed sections for Citizen, Barangay Admin, and LGU Super Admin
  - 27 verified workflows with numbered step-by-step instructions
  - Programmatically annotated genuine screenshots with captions
  - UI element callout tables matching badges 1:1
  - Policy prerequisites, audit trails, and troubleshooting guidance
  - Professional typography, styling, callout note boxes, headers, footers, and page numbers.
"""

import os
import sys
import json
from pathlib import Path

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_APP_DIR = BASE_DIR.parent.parent
SCREENSHOTS_ANNOTATED = BASE_DIR / "screenshots" / "annotated"
CONFIG_FILE = BASE_DIR / "config" / "annotations_config.json"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DOCX = OUTPUT_DIR / "Cabanatuan_City_Ordinance_Portal_User_Manual.docx"
LGU_LOGO = ROOT_APP_DIR / "public" / "lgu-logo.png"

# Color Palette
HEX_EMERALD = "047857"
HEX_EMERALD_LIGHT = "F0FDF4"
HEX_EMERALD_BORDER = "10B981"
HEX_GOLD = "D97706"
HEX_AMBER_LIGHT = "FFFBEB"
HEX_AMBER_BORDER = "F59E0B"
HEX_DARK_SLATE = "0F172A"
HEX_BODY = "334155"
HEX_MUTED = "64748B"
HEX_LIGHT_GRAY = "F8FAFC"
HEX_BORDER = "CBD5E1"

COLOR_EMERALD = RGBColor(4, 120, 87)
COLOR_GOLD = RGBColor(217, 119, 6)
COLOR_DARK_SLATE = RGBColor(15, 23, 42)
COLOR_BODY = RGBColor(51, 65, 85)
COLOR_MUTED = RGBColor(100, 116, 139)

def set_cell_background(cell, hex_color):
    """Set the background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    """Set cell padding in twips (1 pt = 20 twips)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_callout_borders(cell, border_color_hex=HEX_EMERALD_BORDER):
    """Set a thick left border and clear others for callout boxes."""
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

def set_table_borders(table, color_hex=HEX_BORDER):
    """Set subtle, professional horizontal borders on a table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{color_hex}"/>'
        f'<w:bottom w:val="single" w:sz="12" w:space="0" w:color="{color_hex}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color_hex}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_page_number_to_run(run):
    """Inject dynamic Word PAGE field code."""
    fldChar1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
    instrText = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> PAGE </w:instrText>')
    fldChar2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
    fldChar3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def add_numpages_to_run(run):
    """Inject dynamic Word NUMPAGES field code."""
    fldChar1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
    instrText = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> NUMPAGES </w:instrText>')
    fldChar2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
    fldChar3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def add_callout(doc, title, text, callout_type="note"):
    """Insert a styled callout box (note, tip, warning, or troubleshooting)."""
    bg_hex = HEX_EMERALD_LIGHT if callout_type in ("note", "tip") else HEX_AMBER_LIGHT
    border_hex = HEX_EMERALD_BORDER if callout_type in ("note", "tip") else HEX_AMBER_BORDER
    title_color = COLOR_EMERALD if callout_type in ("note", "tip") else COLOR_GOLD
    icon_prefix = "📌 NOTE: " if callout_type == "note" else ("💡 PRO-TIP: " if callout_type == "tip" else "⚠️ CAUTION: ")

    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)

    set_cell_background(cell, bg_hex)
    set_callout_borders(cell, border_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15

    r_title = p.add_run(f"{icon_prefix}{title}\n")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(10)
    r_title.font.color.rgb = title_color

    r_text = p.add_run(text)
    r_text.font.name = "Arial"
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = COLOR_BODY

    # Add small bottom space after table
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(4)

def add_workflow_step(doc, num, title, description):
    """Add a clearly styled step item with a bold numbered title."""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.25)
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15

    r_num = p.add_run(f"Step {num}: {title} — ")
    r_num.bold = True
    r_num.font.name = "Arial"
    r_num.font.size = Pt(10.5)
    r_num.font.color.rgb = COLOR_DARK_SLATE

    r_desc = p.add_run(description)
    r_desc.font.name = "Arial"
    r_desc.font.size = Pt(10)
    r_desc.font.color.rgb = COLOR_BODY

def add_screenshot_block(doc, image_path, caption_text, figure_num):
    """Embed an annotated screenshot centered with full width and formal caption."""
    if not image_path.exists():
        print(f"  [!] Missing image: {image_path}")
        return

    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(2)

    run_img = p_img.add_run()
    run_img.add_picture(str(image_path), width=Inches(6.25))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(8)

    r_fig = p_cap.add_run(f"Figure {figure_num}: ")
    r_fig.bold = True
    r_fig.font.name = "Arial"
    r_fig.font.size = Pt(9)
    r_fig.font.color.rgb = COLOR_EMERALD

    r_cap = p_cap.add_run(caption_text)
    r_cap.font.name = "Arial"
    r_cap.font.size = Pt(9)
    r_cap.font.italic = True
    r_cap.font.color.rgb = COLOR_MUTED

def add_elements_table(doc, elements):
    """Insert a clean 3-column reference table mapping badge numbers to UI elements."""
    if not elements:
        return

    tbl = doc.add_table(rows=1, cols=3)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl)

    col_widths = [Inches(0.6), Inches(2.2), Inches(3.7)]

    # Header Row
    hdr_cells = tbl.rows[0].cells
    headers = ["#", "Interface Element / Control", "Operational Purpose & Usage"]
    for i, h in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], HEX_EMERALD)
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for idx, item in enumerate(elements):
        row = tbl.add_row()
        cells = row.cells
        bg = HEX_LIGHT_GRAY if idx % 2 == 1 else "FFFFFF"

        for i in range(3):
            cells[i].width = col_widths[i]
            set_cell_background(cells[i], bg)
            set_cell_margins(cells[i], top=80, bottom=80, left=120, right=120)

        # Col 0: Badge number
        p0 = cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(str(item.get("num", idx + 1)))
        r0.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = COLOR_EMERALD

        # Col 1: Label
        p1 = cells[1].paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(item.get("label", ""))
        r1.bold = True
        r1.font.name = "Arial"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_DARK_SLATE

        # Col 2: Operational Description
        p2 = cells[2].paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        p2.paragraph_format.line_spacing = 1.15
        r2 = p2.add_run(item.get("purpose", item.get("label", "")))
        r2.font.name = "Arial"
        r2.font.size = Pt(9)
        r2.font.color.rgb = COLOR_BODY

    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(6)

def enrich_element_purposes(elements, workflow_key):
    """Enrich element dictionaries with detailed operational purpose descriptions."""
    purposes_map = {
        # Common
        "common_01_homepage_hero": [
            "Official seal of the City Government of Cabanatuan, linking back to the root landing interface.",
            "Top persistent navigation bar hosting direct links to Ordinances, Report, AI Assistant, News, and Login.",
            "Primary full-text query bar supporting real-time keywords, resolution numbers, and Tagalog terms.",
            "Search submission trigger initiating instant client-side filtering across approved city legislation.",
            "1-click shortcut launching the bilingual Cabanatuan Ordinance AI citizen conversational assistant.",
            "Interactive WebGL Three.js 3D cylindrical visualization displaying active municipal legislation.",
            "Accessibility theme toggle allowing instant switching between high-contrast Dark Mode and crisp Light Mode.",
        ],
        "common_02_login_page": [
            "Official civic authentication branding with municipal security badges and credential encryption notice.",
            "Email entry field accepting registered administrative credentials (e.g., admin@cabanatuan.gov.ph).",
            "Masked password field authenticated via salted bcrypt hashing and HTTP-only session tokens.",
            "Primary authentication submission button triggering server-side role evaluation and session dispatch.",
            "Rapid test-credential selector enabling instant sign-in for demonstration and testing purposes.",
            "Public redirect anchor allowing users to exit the authentication boundary and return to public browsing.",
        ],
        "common_03_theme_toggle": [
            "Dark-optimized civic header with emerald branding maintaining AAA contrast standards.",
            "Active state theme switch reflecting dark mode engagement across the entire application shell.",
            "Glassmorphic high-contrast search input designed for glare-free nighttime legibility.",
            "Three.js canvas dynamically re-rendered with ambient emerald glow and dark cylindrical facets.",
        ],
        # Citizen
        "citizen_01_ordinance_explorer": [
            "Real-time debounce search input filtering ordinances across title, resolution number, and content.",
            "Jurisdiction filter segmented buttons toggling between City-Wide and Barangay-level ordinances.",
            "Policy category selector dropdown filtering ordinances by municipal administrative domain.",
            "Legislative year selector dropdown isolating ordinances enacted in specific legislative terms.",
            "Responsive card grid displaying approved ordinances with title, category, year, and read-more actions.",
        ],
        "citizen_02_ordinance_detail": [
            "Official ordinance heading and enacted resolution identifier formatted for civic clarity.",
            "Comprehensive enactment metadata including date passed, series year, and presiding legislative body.",
            "Executive legal summary box providing plain-language overview of the legislative mandate.",
            "High-priority action button launching the interactive scanned PDF document modal dialog.",
            "Structured legal provisions broken down into numbered articles, sections, and prohibited acts.",
        ],
        "citizen_03_pdf_modal": [
            "Official document modal dialog header displaying resolution title and unique code.",
            "Embedded document renderer presenting the original certified scanned paper copy with official seals.",
            "Direct download button retrieving the official PDF file to the resident's local storage.",
            "Open in dedicated browser tab action button for full-screen inspection and local printing.",
            "Accessible dismissal control triggering clean modal close (also supports keyboard Escape key).",
        ],
        "citizen_04_ai_assistant": [
            "Prominent civic advisory banner stating AI outputs are informational and do not constitute formal legal counsel.",
            "Preset citizen inquiry chips launching common questions regarding curfew, traffic, and waste management.",
            "Bilingual prompt input supporting conversational inquiries with debounced token streaming.",
            "Message dispatch button transmitting prompt to the Gemini 3.5 Flash Lite retrieval pipeline.",
            "Bottom civic disclaimer reminding citizens to verify official texts for formal legal proceedings.",
        ],
        "citizen_05_community_report_form": [
            "Emergency numbers bulletin emphasizing that urgent rescue, fire, and police matters must call 911 / CDRRMO.",
            "Participating barangay dropdown routing the incident directly to the designated barangay hall.",
            "Standardized incident category selector (Open Burning, Noise Disturbance, Road Obstruction, etc.).",
            "Incident subject input capturing a concise summary of the observed ordinance violation.",
            "Narrative details textarea capturing factual descriptions of the observed ordinance violation.",
            "Anonymous submission checkbox protecting resident identity with optional follow-up phone entry.",
            "Formal report submission trigger validating required fields and committing to the database.",
        ],
        "citizen_06_report_submitted": [
            "Official confirmation alert banner verifying direct submission to the target barangay hall.",
            "Client-side draft persistence status confirming the form state has been safely cleared.",
            "Reset action button allowing the resident to clear form fields and prepare another submission.",
        ],
        "citizen_07_civic_news": [
            "Civic newsroom header displaying verified announcements from City Hall and participating barangays.",
            "Official Cabanatuan LGU public authority badge validating authenticity of published notices.",
            "Prominent official executive advisory card highlighting priority legislative announcements.",
            "Official timestamp and policy categorization badge denoting when the notice was enacted.",
            "Comprehensive text narrative detailing civic guidelines, meeting schedules, and public directives.",
        ],
        # Barangay Admin
        "barangay_01_dashboard": [
            "Scoped header confirming administrative session for Barangay Camp Tinio with localized authority.",
            "Local governance welcome banner summarizing current operational status for the barangay council.",
            "Prominent quick-action button initiating a new barangay ordinance proposal transmittal.",
            "Active local ordinances counter tracking enacted barangay resolutions within the jurisdiction.",
            "Pending proposals counter monitoring legislation submitted to City Hall awaiting LGU approval.",
            "Community reports KPI displaying incoming violation reports filed by barangay residents.",
            "Barangay navigation sidebar providing rapid access to Ordinances, Community Reports, and Analytics.",
        ],
        "barangay_02_ordinance_management": [
            "Accessible status tabs filtering local records by All, Pending, Approved, Draft, and Rejected.",
            "Primary enactment button opening the multi-stage ordinance proposal and drafting modal dialog.",
            "Search input enabling quick lookup of local barangay resolutions by keyword or series number.",
            "Comprehensive barangay ordinance data table displaying resolution numbers, titles, and dates.",
            "Action controls allowing officials to edit drafts, inspect rejected feedback, and resubmit items.",
        ],
        "barangay_03_draft_ordinance_modal": [
            "Ordinance drafting modal header indicating proposal preparation for barangay council consideration.",
            "Proposed ordinance title input adhering to standard barangay legislative naming conventions.",
            "Legislative category selector mapping the ordinance to city governance domains.",
            "Draft saving action button persisting work-in-progress to the database without alerting City Hall.",
            "Official transmittal button submitting the finalized ordinance to the LGU Super Admin for legal review.",
        ],
        "barangay_04_ai_extraction_modal": [
            "AI extraction module header featuring Google Gemini multimodal OCR integration badge.",
            "Drag-and-drop file upload zone accepting scanned PDF documents or multi-page high-resolution images.",
            "Extraction execution trigger initiating automated text recognition and semantic clause extraction.",
        ],
        "barangay_05_community_reports": [
            "Barangay reports desk header confirming oversight of citizen incident submissions in Camp Tinio.",
            "Status filter buttons (All, New, In Progress, Resolved, Dismissed) segregating reports by stage.",
            "Incident reports records table displaying violations, landmarks, reporters, and submission dates.",
            "Inline status triage dropdown allowing immediate transition between New, In Progress, and Resolved.",
        ],
        "barangay_06_report_triage_modal": [
            "Focused incident report record row selected for investigation and administrative status update.",
            "Violation category badge classifying the complaint (Trash Burning, Noise, Road Obstruction).",
            "Reporter identification and contact details verification cell (with anonymous flag protection).",
            "Current life-cycle status badge reflecting real-time handling status in the central database.",
            "Administrative status mutation dropdown enabling officials to record action and resolve complaints.",
        ],
        "barangay_07_ordinance_reports_analytics": [
            "Barangay legislative report generator header displaying localized documentation tools.",
            "Report type and filter selector defining parameters for generating formal barangay council reports.",
            "Multi-criteria filter panel with dropdowns for year series, status, category, and barangay scoping.",
            "Official export toolbar enabling instant download of formal PDF documentation with barangay headers.",
        ],
        # LGU Admin
        "lgu_01_executive_dashboard": [
            "City Government Executive Governance Dashboard header confirming City Hall Super Admin privileges.",
            "Consolidated city-wide KPI cards showing Total Ordinances, Approved, Pending, Drafts, and Barangays.",
            "Executive quick-action shortcuts for rapid ordinance enactment, report generation, and pending reviews.",
            "Recent legislative activity stream recording real-time enactment, submissions, and status mutations.",
            "Full administrative sidebar providing direct routing across all eight executive management modules.",
        ],
        "lgu_02_ordinance_repository": [
            "Status tabs with live record badges categorizing the complete municipal archive (56 total records).",
            "New Ordinance enactment button launching the City Hall legislative creation and AI extraction modal.",
            "Client-side instant search input filtering city and barangay ordinances without network latency.",
            "Consolidated repository table with jurisdiction badges distinguishing City vs Barangay resolutions.",
        ],
        "lgu_03_review_approve_modal": [
            "Sangguniang Panlungsod Legislative Review modal displaying pending barangay proposal details.",
            "Legal enactment confirmation notice asking the administrator to verify statutory compliance.",
            "Official enactment approval button updating status to APPROVED and publishing to the public portal.",
            "Cancel / dismiss action button returning to the pending list without altering ordinance status.",
        ],
        "lgu_04_ai_document_extraction": [
            "LGU multimodal AI extraction tool powered by Google Gemini for scanning physical paper ordinances.",
            "Certified resolution document upload dropzone supporting multi-page PDF documents and high-res scans.",
            "AI extraction execution trigger initiating automated OCR, preamble stripping, and penalty categorization.",
        ],
        "lgu_05_users_management": [
            "Official personnel directory header displaying registered administrative accounts across Cabanatuan.",
            "Provisioning action button opening the modal for registering new barangay captains and secretaries.",
            "User directory data table showing full names, official emails, assigned roles, and creation dates.",
            "Role privilege badges distinguishing LGU Super Admin permissions from scoped Barangay Admin rights.",
            "Territorial assignment badge ensuring barangay officials are strictly mapped to their local jurisdiction.",
        ],
        "lgu_06_barangays_directory": [
            "Cabanatuan City Barangay Directory header tracking administrative coverage across all 89 barangays.",
            "Participation and coverage statistics banner displaying total barangays and active admin accounts.",
            "Barangay search input field allowing instant lookup by barangay name or captain email address.",
            "Primary registration button launching the new barangay creation and official account setup modal.",
            "Consolidated directory records table displaying enacted local ordinances and resident report tallies.",
        ],
        "lgu_07_city_reports_monitoring": [
            "City-wide community incident monitoring desk header providing executive oversight of citizen reports.",
            "Consolidated status tabs segregating reports across New, In Progress, Resolved, and Dismissed stages.",
            "Comprehensive incident records table displaying violation categories, locations, and barangay assignments.",
            "Originating barangay jurisdiction column indicating which local council has local primary authority.",
            "Real-time status badge tracking whether the barangay tanods or officials have addressed the issue.",
        ],
        "lgu_08_news_publishing": [
            "Civic news and public broadcast management desk header for City Hall legislative announcements.",
            "Advisory publishing button opening the rich news composer dialog with category and pinning options.",
            "Published public advisories table displaying active executive notices, reminders, and press releases.",
            "Advisory management controls allowing city personnel to modify announcement content or archive items.",
        ],
        "lgu_09_legislative_report_generator": [
            "Report type selector offering 8 specialized structures (All, by Month, Barangay, Filer, Category, Status).",
            "Multi-criteria filter panel with dropdowns for year series, status, category, and barangay scoping.",
            "Report generation execution button querying the database and rendering the formal print-ready layout.",
            "Direct PDF download button generating a certified legislative summary document with pagination.",
        ],
        "lgu_10_analytics_charts": [
            "Governance analytics and policy intelligence header providing data-driven legislative insights.",
            "Legislative year filter dropdown enabling dynamic scoping across calendar years or entire history.",
            "Executive key performance indicator (KPI) metric banner showing total ordinances and resolution rate.",
            "Policy category distribution chart illustrating legislative focus across health, safety, and environment.",
            "Legislative status proportion pie chart displaying approved, pending, draft, and rejected distribution.",
        ],
    }

    raw_purposes = purposes_map.get(workflow_key, [])
    enriched = []
    for idx, el in enumerate(elements):
        p_text = raw_purposes[idx] if idx < len(raw_purposes) else el.get("label", "")
        enriched.append({
            "num": el.get("num", idx + 1),
            "label": el.get("label", ""),
            "purpose": p_text,
        })
    return enriched

def build_document():
    print("=======================================================")
    print("  📝 GENERATING COMPREHENSIVE DOCX USER MANUAL")
    print("=======================================================\n")

    if not CONFIG_FILE.exists():
        print(f"[!] Error: Configuration file not found at {CONFIG_FILE}")
        sys.exit(1)

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)

    screenshots = config.get("screenshots", {})

    doc = Document()

    # Configure Margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True

        # Header (Pages 2+)
        hdr = section.header
        p_hdr = hdr.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_hdr.paragraph_format.space_before = Pt(0)
        p_hdr.paragraph_format.space_after = Pt(0)
        r_hdr = p_hdr.add_run("Cabanatuan City Ordinance Portal — Official Multi-Role User Manual | Capstone Defense Edition")
        r_hdr.font.name = "Arial"
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = COLOR_MUTED

        # Footer (Pages 2+)
        ftr = section.footer
        p_ftr = ftr.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_ftr.paragraph_format.space_before = Pt(0)
        p_ftr.paragraph_format.space_after = Pt(0)
        r_ftr_l = p_ftr.add_run("City Government of Cabanatuan  •  Confidential & Civic Operational Guide                 Page ")
        r_ftr_l.font.name = "Arial"
        r_ftr_l.font.size = Pt(8.5)
        r_ftr_l.font.color.rgb = COLOR_MUTED
        add_page_number_to_run(p_ftr.add_run())
        r_of = p_ftr.add_run(" of ")
        r_of.font.name = "Arial"
        r_of.font.size = Pt(8.5)
        r_of.font.color.rgb = COLOR_MUTED
        add_numpages_to_run(p_ftr.add_run())

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    p_cov_top = doc.add_paragraph()
    p_cov_top.paragraph_format.space_before = Pt(36)
    p_cov_top.paragraph_format.space_after = Pt(12)
    p_cov_top.alignment = WD_ALIGN_PARAGRAPH.CENTER

    if LGU_LOGO.exists():
        run_logo = p_cov_top.add_run()
        run_logo.add_picture(str(LGU_LOGO), width=Inches(1.8))

    p_cov_rep = doc.add_paragraph()
    p_cov_rep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cov_rep.paragraph_format.space_before = Pt(6)
    p_cov_rep.paragraph_format.space_after = Pt(2)
    r_rep = p_cov_rep.add_run("REPUBLIC OF THE PHILIPPINES\nPROVINCE OF NUEVA ECIJA\nCITY GOVERNMENT OF CABANATUAN")
    r_rep.bold = True
    r_rep.font.name = "Arial"
    r_rep.font.size = Pt(10)
    r_rep.font.color.rgb = COLOR_MUTED

    p_cov_title = doc.add_paragraph()
    p_cov_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cov_title.paragraph_format.space_before = Pt(24)
    p_cov_title.paragraph_format.space_after = Pt(8)
    r_title = p_cov_title.add_run("A Web-Based AI-Assisted Ordinance\nInformation System for Cabanatuan City")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(24)
    r_title.font.color.rgb = COLOR_EMERALD

    p_cov_sub = doc.add_paragraph()
    p_cov_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cov_sub.paragraph_format.space_before = Pt(4)
    p_cov_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_cov_sub.add_run("Comprehensive Multi-Role User & Administrative Manual\nEnd-User Citizen  •  Barangay Administrator  •  LGU Super Administrator")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = COLOR_BODY

    # Decorative separator line table
    tbl_sep = doc.add_table(rows=1, cols=1)
    tbl_sep.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_sep = tbl_sep.cell(0, 0)
    cell_sep.width = Inches(5.0)
    set_cell_background(cell_sep, HEX_EMERALD)
    set_cell_margins(cell_sep, top=20, bottom=20, left=0, right=0)
    p_sep = cell_sep.paragraphs[0]
    p_sep.paragraph_format.space_before = Pt(0)
    p_sep.paragraph_format.space_after = Pt(0)

    p_cov_meta = doc.add_paragraph()
    p_cov_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cov_meta.paragraph_format.space_before = Pt(40)
    p_cov_meta.paragraph_format.space_after = Pt(0)
    p_cov_meta.paragraph_format.line_spacing = 1.25

    r_meta = p_cov_meta.add_run(
        "BSIT Capstone Project Final Defense Edition\n"
        "Document Version 2.0  •  October 2026\n\n"
        "Capstone Research Proponents:\n"
        "Chris Karl M. Lacanilao  •  John Carlo DG. Lemence\n"
        "Manny N. Agulto  •  Reyven B. Calara\n\n"
        "Degree Program:\n"
        "Bachelor of Science in Information Technology (BSIT)\n"
        "College of Information and Communications Technology\n"
        "Cabanatuan City, Nueva Ecija, Philippines"
    )
    r_meta.font.name = "Arial"
    r_meta.font.size = Pt(10)
    r_meta.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # =========================================================================
    # TABLE OF CONTENTS & DOCUMENT ROADMAP
    # =========================================================================
    p_h1 = doc.add_heading("Table of Contents", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    toc_entries = [
        ("1. Executive Summary & System Overview", "1.1 Background & Innovation, 1.2 System Scope & Objectives, 1.3 Key Innovation Matrix"),
        ("2. System Architecture & Role-Based Access Control", "2.1 Technical Stack, 2.2 Security Architecture, 2.3 Role Permissions Matrix"),
        ("3. System Access & Multi-Role Authentication", "3.1 Zero-Barrier Public Access, 3.2 Secure Login Procedure, 3.3 Session Management"),
        ("4. Citizen & Public End-User Guide (7 Workflows)", "4.1 Homepage & 3D Archive, 4.2 Ordinance Explorer, 4.3 Split-Screen Detail View, 4.4 Official Scanned PDF Viewer, 4.5 AI Civic Assistant, 4.6 Incident Reporting, 4.7 Civic News Feed"),
        ("5. Barangay Administrator Operations Guide (7 Workflows)", "5.1 Barangay Governance Dashboard, 5.2 Local Ordinance Repository, 5.3 Ordinance Proposal & Drafting, 5.4 AI Multimodal OCR Extraction, 5.5 Resident Incident Triage, 5.6 Case Status Updates, 5.7 Barangay Legislative Reports"),
        ("6. LGU Super Administrator Executive Guide (10 Workflows)", "6.1 Executive City Hall Dashboard, 6.2 Central Ordinance Repository, 6.3 Reviewing Barangay Submissions, 6.4 AI Ordinance Extraction, 6.5 User & Official Management, 6.6 Barangay Directory, 6.7 City-Wide Reports Monitoring, 6.8 Civic News Broadcast, 6.9 Legislative Report Generator, 6.10 Governance Analytics & Visualizations"),
        ("7. Multi-Tenant Data Isolation & Security Guidelines", "7.1 Multi-Tenant Integrity, 7.2 Salted bcrypt Encryption, 7.3 Audit Trails & Traceability"),
        ("8. Troubleshooting, System Prerequisites & FAQ", "8.1 System Requirements, 8.2 Common Operational Issues, 8.3 Defense Panel Technical FAQ"),
    ]

    tbl_toc = doc.add_table(rows=1, cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_toc)
    hdr_t = tbl_toc.rows[0].cells
    hdr_t[0].width = Inches(2.8)
    hdr_t[1].width = Inches(3.7)
    set_cell_background(hdr_t[0], HEX_EMERALD)
    set_cell_background(hdr_t[1], HEX_EMERALD)
    set_cell_margins(hdr_t[0], top=100, bottom=100, left=120, right=120)
    set_cell_margins(hdr_t[1], top=100, bottom=100, left=120, right=120)

    p0 = hdr_t[0].paragraphs[0]
    r0 = p0.add_run("Manual Section")
    r0.bold = True
    r0.font.name = "Arial"
    r0.font.size = Pt(10)
    r0.font.color.rgb = RGBColor(255, 255, 255)

    p1 = hdr_t[1].paragraphs[0]
    r1 = p1.add_run("Covered Workflows & Architectural Topics")
    r1.bold = True
    r1.font.name = "Arial"
    r1.font.size = Pt(10)
    r1.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (title, sub) in enumerate(toc_entries):
        row = tbl_toc.add_row()
        c0, c1 = row.cells
        bg = HEX_LIGHT_GRAY if idx % 2 == 1 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=80, bottom=80, left=120, right=120)
        set_cell_margins(c1, top=80, bottom=80, left=120, right=120)

        p_t0 = c0.paragraphs[0]
        r_t0 = p_t0.add_run(title)
        r_t0.bold = True
        r_t0.font.name = "Arial"
        r_t0.font.size = Pt(9.5)
        r_t0.font.color.rgb = COLOR_DARK_SLATE

        p_t1 = c1.paragraphs[0]
        r_t1 = p_t1.add_run(sub)
        r_t1.font.name = "Arial"
        r_t1.font.size = Pt(9)
        r_t1.font.color.rgb = COLOR_BODY

    add_callout(
        doc,
        "HOW TO USE THIS OPERATIONAL MANUAL",
        "This user manual is formatted on a per-user-role basis. To perform tasks specific to your official capacity, navigate directly to your designated chapter:\n"
        "• Public Citizens: Chapter 4 (Workflows 4.1 to 4.7)\n"
        "• Barangay Captains & Secretaries: Chapter 5 (Workflows 5.1 to 5.7)\n"
        "• City Hall & LGU Super Administrators: Chapter 6 (Workflows 6.1 to 6.10)\n"
        "Each section contains high-resolution genuine application screenshots with numbered callout circles corresponding exactly to the step-by-step instructions.",
        callout_type="note"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: EXECUTIVE SUMMARY & SYSTEM OVERVIEW
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 1: Executive Summary & System Overview", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(6)
    r = p_body.add_run(
        "The Cabanatuan City Ordinance Portal is an integrated web-based civic technology platform engineered to modernise, centralise, and automate municipal and barangay ordinance governance across the City of Cabanatuan, Nueva Ecija. Operating across eighty-nine (89) administrative barangays, local government units historically faced fragmented physical records, cumbersome paper drafting procedures, manual OCR encoding bottlenecks, and limited public visibility into enacted local laws.\n\n"
        "To decisively overcome these governance challenges, this project introduces a unified, multi-tiered legislative ecosystem combining zero-barrier civic transparency for citizens, localized jurisdictional autonomy for barangay councils, and comprehensive executive oversight for City Hall."
    )
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY

    p_h2 = doc.add_heading("1.1 Core Innovation Matrix", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    innovations = [
        ("Multimodal AI Document Extractor", "Powered by Google Gemini multimodal vision processing. Government clerks upload scanned PDF copies or smartphone photos of signed physical ordinances. The engine performs high-precision OCR, strips bureaucratic legal preambles, and populates resolution numbers, series years, categories, coverage, and tiered fine schedules with human-in-the-loop review in under 5 seconds."),
        ("Bilingual Gemini AI Civic Assistant (RAG)", "A conversational Retrieval-Augmented Generation assistant embedded on the public portal. Citizens inquire in English, Tagalog, or Taglish (e.g., 'Ano ang parusa sa illegal dumping sa Camp Tinio?'). The pipeline injects verified local database legislation into the LLM context window to provide grounded, citation-rich answers while strictly refusing to give out-of-scope legal advice."),
        ("Multi-Tenant Barangay Isolation", "Complete data partitioning and RBAC enforcement. Barangay administrators can only draft, view, and modify legislative records and community incident reports within their assigned jurisdiction, while City Hall LGU Super Admins retain consolidated city-wide oversight."),
        ("End-to-End Incident Traceability", "A closed-loop community reporting mechanism. Residents submit violation complaints with automatic location landmarking and draft auto-save persistence. The system routes the report to the local Barangay Tanod desk, provides an audit reference tracking code to the citizen, and updates resolution statuses in real time."),
    ]

    tbl_inn = doc.add_table(rows=1, cols=2)
    tbl_inn.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_inn)
    hdr_i = tbl_inn.rows[0].cells
    hdr_i[0].width = Inches(2.2)
    hdr_i[1].width = Inches(4.3)
    set_cell_background(hdr_i[0], HEX_EMERALD)
    set_cell_background(hdr_i[1], HEX_EMERALD)
    set_cell_margins(hdr_i[0], top=100, bottom=100, left=120, right=120)
    set_cell_margins(hdr_i[1], top=100, bottom=100, left=120, right=120)

    p0 = hdr_i[0].paragraphs[0]
    r0 = p0.add_run("System Innovation")
    r0.bold = True
    r0.font.name = "Arial"
    r0.font.size = Pt(10)
    r0.font.color.rgb = RGBColor(255, 255, 255)

    p1 = hdr_i[1].paragraphs[0]
    r1 = p1.add_run("Technical Implementation & Impact")
    r1.bold = True
    r1.font.name = "Arial"
    r1.font.size = Pt(10)
    r1.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (title, desc) in enumerate(innovations):
        row = tbl_inn.add_row()
        c0, c1 = row.cells
        bg = HEX_LIGHT_GRAY if idx % 2 == 1 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=80, bottom=80, left=120, right=120)
        set_cell_margins(c1, top=80, bottom=80, left=120, right=120)

        p_t0 = c0.paragraphs[0]
        r_t0 = p_t0.add_run(title)
        r_t0.bold = True
        r_t0.font.name = "Arial"
        r_t0.font.size = Pt(9.5)
        r_t0.font.color.rgb = COLOR_DARK_SLATE

        p_t1 = c1.paragraphs[0]
        r_t1 = p_t1.add_run(desc)
        r_t1.font.name = "Arial"
        r_t1.font.size = Pt(9)
        r_t1.font.color.rgb = COLOR_BODY

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: SYSTEM ARCHITECTURE & ROLE-BASED ACCESS CONTROL
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 2: System Architecture & Role Permissions", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(6)
    r = p_body.add_run(
        "The application is engineered on Next.js 16 (App Router & Turbopack), React 19, Tailwind CSS v4, Prisma ORM 7 with SQLite, and the Google GenAI SDK. Authentication is enforced through cryptographically signed JSON Web Tokens (jose) stored in Secure HTTP-only cookies, eliminating client-side token interception risks.\n\n"
        "User permissions adhere strictly to the principle of least privilege through three dedicated roles:"
    )
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY

    p_h2 = doc.add_heading("2.1 Role-Based Access Control (RBAC) Matrix", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    matrix_rows = [
        ("Public Landing Page & 3D Archive", "Full Access (No Login)", "Full Access", "Full Access"),
        ("Ordinance Explorer & PDF Viewer", "Full Access (No Login)", "Full Access", "Full Access"),
        ("AI Civic Assistant (Chatbot RAG)", "Full Access (No Login)", "Full Access", "Full Access"),
        ("Community Incident Report Submission", "Full Access (Draft Persistence)", "Full Access", "Full Access"),
        ("Barangay Governance Dashboard", "No Access (Denied)", "Full Access (Scoped to Barangay)", "Supervisory View"),
        ("Drafting Local Barangay Ordinances", "No Access (Denied)", "Full Access (Save Draft / Submit)", "Full Access (City Enactments)"),
        ("AI Document OCR Extraction Tool", "No Access (Denied)", "Local Extraction & Upload", "Full City Hall Extraction"),
        ("Review & Approve/Reject Submissions", "No Access (Denied)", "No Access (Barangay is Submitter)", "Full Legislative Authority"),
        ("User & Personnel Account Management", "No Access (Denied)", "No Access (Barangay Level)", "Full Admin User Provisioning"),
        ("Barangay Directory & Coverage", "View Public Directory", "View Local Barangay", "Full 89 Barangay Management"),
        ("Incident Report Resolution Triage", "No Access (Resident View)", "Triage Local Reports (Tanod Desk)", "City-Wide Oversight & Auditing"),
        ("Civic News Publishing & Broadcast", "View Public Feed", "Propose Local Advisories", "Publish, Edit, Pin City Bulletins"),
        ("Official Legislative Report Generator", "No Access", "Barangay Local Summary PDF", "Full Municipal PDF Generator"),
        ("Executive Governance Analytics", "No Access", "Barangay Resolution Rates", "Comprehensive Recharts Analytics"),
    ]

    tbl_rb = doc.add_table(rows=1, cols=4)
    tbl_rb.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_rb)
    hdr_r = tbl_rb.rows[0].cells
    hdr_r[0].width = Inches(2.2)
    hdr_r[1].width = Inches(1.4)
    hdr_r[2].width = Inches(1.5)
    hdr_r[3].width = Inches(1.4)

    headers_rb = ["System Module / Capability", "Citizen / Public", "Barangay Admin", "LGU Super Admin"]
    for i, h in enumerate(headers_rb):
        set_cell_background(hdr_r[i], HEX_EMERALD)
        set_cell_margins(hdr_r[i], top=100, bottom=100, left=100, right=100)
        p = hdr_r[i].paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (mod, cit, bar, lgu) in enumerate(matrix_rows):
        row = tbl_rb.add_row()
        c = row.cells
        bg = HEX_LIGHT_GRAY if idx % 2 == 1 else "FFFFFF"
        for i in range(4):
            set_cell_background(c[i], bg)
            set_cell_margins(c[i], top=70, bottom=70, left=100, right=100)

        p0 = c[0].paragraphs[0]
        r0 = p0.add_run(mod)
        r0.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9)
        r0.font.color.rgb = COLOR_DARK_SLATE

        for i, val in enumerate([cit, bar, lgu], start=1):
            p = c[i].paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            r.font.color.rgb = COLOR_BODY

    add_callout(
        doc,
        "SECURITY ARCHITECTURE COMPLIANCE",
        "The system complies with Section II of the BSIT Capstone Defense Guide. Passwords are never stored in plaintext and are hashed using bcrypt with 10 salt rounds. Multi-tenant database queries enforce WHERE barangayId = session.barangayId on all mutation endpoints, preventing unauthorized cross-jurisdiction access.",
        callout_type="tip"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: SYSTEM ACCESS & MULTI-ROLE AUTHENTICATION
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 3: System Access & Multi-Role Authentication", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(6)
    r = p_body.add_run(
        "Access to the Cabanatuan City Ordinance Portal is structured into two tiers: zero-barrier public exploration (requiring zero registration or login) and secure administrative access for city and barangay officials."
    )
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY

    # Workflow 3.1: Homepage Hero
    p_h2 = doc.add_heading("3.1 Public Portal Landing & Civic Navigation", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Accessing the Portal", "Open any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari) and navigate to the official portal domain (or http://localhost:3000 for local administrative installations).")
    add_workflow_step(doc, 2, "Public Portal Navigation", "Inspect the civic navigation bar (Badge 2) containing direct links to Ordinances, Community Reports, AI Assistant, Civic News, and Administrative Sign-in.")
    add_workflow_step(doc, 3, "Keyword Quick Search", "Locate the prominent Hero Search input (Badge 3). Type in any keyword such as 'Traffic', 'Basura', or 'Curfew' to execute immediate full-text search across all municipal legislation.")
    add_workflow_step(doc, 4, "Category Discovery", "Click any of the quick discovery category chips (Badge 4) to instantly filter ordinances by municipal interest areas.")
    add_workflow_step(doc, 5, "Interactive 3D Archive Exploration", "Interact with the Three.js 3D Ordinance Archive Canvas (Badge 5) using mouse drag or touch gestures to rotate the cylindrical archive.")
    add_workflow_step(doc, 6, "Toggling Accessibility Themes", "Click the Theme Toggle button (Badge 6) in the upper right header to switch between Light and Dark mode.")

    wf01 = screenshots.get("common_01_homepage_hero", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "common" / "common_01_homepage_hero_annotated.png",
        wf01.get("caption", "Public homepage providing zero-barrier access to city ordinances and search."),
        "3.1"
    )
    add_elements_table(doc, enrich_element_purposes(wf01.get("elements", []), "common_01_homepage_hero"))

    # Workflow 3.2: Login Page
    p_h2 = doc.add_heading("3.2 Multi-Role Authentication Procedure", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Authentication", "Click the 'Mag-log In' button on the navigation bar, or navigate directly to /login.")
    add_workflow_step(doc, 2, "Entering Official Email", "In the Email field (Badge 2), enter your verified administrative email address (e.g., admin@cabanatuan.gov.ph for LGU Super Admin or kapitan@cabanatuan.gov.ph for Barangay Admin).")
    add_workflow_step(doc, 3, "Entering Password", "In the Password field (Badge 3), input your secure password. The interface masks characters for shoulder-surfing protection.")
    add_workflow_step(doc, 4, "Submitting Credentials", "Click the 'Pumasok sa Portal' button (Badge 4). Upon verification, the system creates an HTTP-only JWT session cookie and redirects you automatically to your designated dashboard.")
    add_workflow_step(doc, 5, "Demo Preset Quick-Fill", "For defense demonstrations or training, click any of the preset role chips (Badge 5) to auto-fill verified demonstration credentials.")

    wf02 = screenshots.get("common_02_login_page", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "common" / "common_02_login_page_annotated.png",
        wf02.get("caption", "Secure sign-in interface supporting Role-Based Access Control."),
        "3.2"
    )
    add_elements_table(doc, enrich_element_purposes(wf02.get("elements", []), "common_02_login_page"))

    # Workflow 3.3: Theme Toggle
    p_h2 = doc.add_heading("3.3 High-Contrast Dark Mode & Accessibility", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Engaging Dark Theme", "Click the Theme Toggle icon (Badge 2). The application dynamically swaps CSS design tokens across backgrounds, borders, and typography.")
    add_workflow_step(doc, 2, "Reviewing High Contrast", "Inspect the high-contrast dark header and search bar (Badges 1 and 3) designed with muted emerald accents for night viewing.")
    add_workflow_step(doc, 3, "Visualizing 3D Elements in Dark Mode", "The WebGL canvas (Badge 4) automatically adapts its lighting shaders and particle background to dark aesthetics.")

    wf03 = screenshots.get("common_03_theme_toggle", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "common" / "common_03_theme_toggle_annotated.png",
        wf03.get("caption", "Persistent high-contrast dark aesthetic compliant with WCAG accessibility standards."),
        "3.3"
    )
    add_elements_table(doc, enrich_element_purposes(wf03.get("elements", []), "common_03_theme_toggle"))

    add_callout(
        doc,
        "OFFICIAL DEMONSTRATION CREDENTIALS REFERENCE",
        "For defense evaluation, the system is seeded with three primary verified accounts:\n"
        "• LGU Super Admin: admin@cabanatuan.gov.ph | Password: admin123 (Redirects to /admin/lgu)\n"
        "• Barangay Admin (Camp Tinio): kapitan@cabanatuan.gov.ph | Password: kapitan123 (Redirects to /admin/barangay)\n"
        "• Resident / Citizen: juan@cabanatuan.gov.ph | Password: citizen123 (Public exploration & report filing)",
        callout_type="tip"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: CITIZEN & PUBLIC END-USER GUIDE
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 4: Citizen & Public End-User Guide", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(6)
    r = p_body.add_run(
        "A cornerstone of the Cabanatuan City Ordinance Portal is zero-barrier public civic transparency. Cabanatuan residents, students, business owners, and legal researchers can browse enacted municipal regulations, examine certified PDF copies, consult the bilingual Gemini AI Civic Assistant, and submit incident reports without mandatory account creation."
    )
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY

    # Workflow 4.1: Ordinance Explorer
    p_h2 = doc.add_heading("4.1 Public Ordinance Explorer & Multi-Filtering", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Explorer", "Click 'Mga Ordinansa' in the navigation bar or visit /ordinances.")
    add_workflow_step(doc, 2, "Instant Keyword Filtering", "Enter terms into the Full-Text Search box (Badge 1). The interface filters records instantly with zero page reloads.")
    add_workflow_step(doc, 3, "Selecting Policy Categories", "Click any category button (Badge 2) such as 'Kapayapaan at Kaayusan', 'Kalusugan', or 'Kapaligiran' to narrow results.")
    add_workflow_step(doc, 4, "Adjusting Year Slider", "Drag the Year Range Slider (Badge 3) to isolate legislation enacted within specific legislative calendar terms.")
    add_workflow_step(doc, 5, "Filtering by Jurisdiction", "Use the Jurisdiction Scope buttons (Badge 4) to toggle between City-Wide Ordinances and Barangay Regulations.")
    add_workflow_step(doc, 6, "Browsing Results", "Click any ordinance card in the responsive grid (Badge 5) to inspect its full legal text.")

    wf04 = screenshots.get("citizen_01_ordinance_explorer", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "citizen" / "citizen_01_ordinance_explorer_annotated.png",
        wf04.get("caption", "Public Ordinance Explorer allowing residents to filter legislation across categories and years."),
        "4.1"
    )
    add_elements_table(doc, enrich_element_purposes(wf04.get("elements", []), "citizen_01_ordinance_explorer"))

    # Workflow 4.2: Ordinance Detail View
    p_h2 = doc.add_heading("4.2 Split-Screen Legal Text & Sanctions View", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Reviewing Heading & Resolution Number", "Verify the official ordinance title and unique legislative resolution number at the top of the view (Badge 1).")
    add_workflow_step(doc, 2, "Inspecting Legislative Metadata", "Check the enacting date, year series, and authorizing body (Badge 2).")
    add_workflow_step(doc, 3, "Reading Legal Provisions", "Read through the structured legal articles and prohibited acts on the split-screen left pane (Badge 3).")
    add_workflow_step(doc, 4, "Inspecting Sanctions & Penalties", "Examine the dedicated Sanctions Card on the right sidebar (Badge 4) for tiered monetary fines and community service provisions.")
    add_workflow_step(doc, 5, "Accessing Certified PDF Document", "Click the 'Buksan ang Opisyal na PDF' button (Badge 5) to open the verified scanned original document.")

    wf05 = screenshots.get("citizen_02_ordinance_detail", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "citizen" / "citizen_02_ordinance_detail_annotated.png",
        wf05.get("caption", "Split-screen ordinance detail view presenting legal articles and structured penalties."),
        "4.2"
    )
    add_elements_table(doc, enrich_element_purposes(wf05.get("elements", []), "citizen_02_ordinance_detail"))

    # Workflow 4.3: Scanned PDF Viewer Modal
    p_h2 = doc.add_heading("4.3 Official Scanned PDF Viewer Modal", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Inspecting Scanned Resolution Copy", "The embedded viewer (Badge 2) loads the scanned physical document complete with official dry seals and physical signatures.")
    add_workflow_step(doc, 2, "Using Interactive Zoom Controls", "Use the Zoom In (+) and Zoom Out (-) buttons (Badge 3) to inspect fine print, signatures, and legal annotations.")
    add_workflow_step(doc, 3, "Downloading the PDF File", "Click the 'I-download ang Dokumento' button (Badge 4) to save a certified copy to your computer or mobile device.")
    add_workflow_step(doc, 4, "Closing the Modal Dialog", "Click the Close button (Badge 5) or press the Escape key to return to the ordinance overview.")

    wf06 = screenshots.get("citizen_03_pdf_modal", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "citizen" / "citizen_03_pdf_modal_annotated.png",
        wf06.get("caption", "Official scanned PDF viewer modal with zoom controls and direct download."),
        "4.3"
    )
    add_elements_table(doc, enrich_element_purposes(wf06.get("elements", []), "citizen_03_pdf_modal"))

    # Workflow 4.4: AI Civic Assistant (Chatbot RAG)
    p_h2 = doc.add_heading("4.4 AI Civic Assistant (Bilingual Gemini RAG)", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to AI Assistant", "Click 'AI Assistant' in the header navigation or open /chatbot.")
    add_workflow_step(doc, 2, "Noting the Civic Safety Disclaimer", "Read the informational notice at the top (Badge 1) clarifying that the assistant provides informational citations and not legal advice.")
    add_workflow_step(doc, 3, "Using Preset Action Inquiries", "Click any of the quick prompt chips (Badge 2) to explore common questions regarding curfew hours, waste burning, or traffic rules.")
    add_workflow_step(doc, 4, "Typing Natural Language Inquiries", "Type your question into the chat input field (Badge 5) in English, Tagalog, or Taglish, then click Send (Badge 6).")
    add_workflow_step(doc, 5, "Reviewing Citation-Grounded Responses", "The Gemini RAG pipeline queries local municipal ordinances and streams an answer citing specific resolution numbers and fine schedules (Badge 4).")

    wf07 = screenshots.get("citizen_04_ai_assistant", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "citizen" / "citizen_04_ai_assistant_annotated.png",
        wf07.get("caption", "Bilingual Gemini AI Civic Assistant providing ordinance citations with strict guardrails."),
        "4.4"
    )
    add_elements_table(doc, enrich_element_purposes(wf07.get("elements", []), "citizen_04_ai_assistant"))

    # Workflow 4.5: Incident Report Form
    p_h2 = doc.add_heading("4.5 Submitting a Community Incident Report", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Reviewing Emergency Hotline Notice", "Inspect the prominent red emergency banner (Badge 1). If an incident involves an ongoing fire, medical emergency, or crime in progress, call the listed hotlines immediately (e.g., CDRRMO Rescue at 044-940-0161).")
    add_workflow_step(doc, 2, "Selecting Assigned Barangay", "Open the Barangay selector (Badge 2) and select the specific barangay where the violation occurred (e.g., Camp Tinio).")
    add_workflow_step(doc, 3, "Choosing Violation Category", "Select the category from the dropdown (Badge 3), such as 'Sanitation / Basura', 'Ingay / Loud Exhausts', or 'Obstruction'.")
    add_workflow_step(doc, 4, "Entering Subject & Details", "Provide a brief summary in the Subject line (Badge 4) and full narrative details in the Textarea (Badge 5), including landmarks.")
    add_workflow_step(doc, 5, "Client-Side Draft Persistence", "The form automatically saves typed content to browser local storage. If your page reloads accidentally, all typed information is instantly restored.")
    add_workflow_step(doc, 6, "Submitting the Report", "Choose whether to remain anonymous (Badge 6) and click 'I-sumite ang Ulat sa Barangay' (Badge 7).")

    wf08 = screenshots.get("citizen_05_community_report_form", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "citizen" / "citizen_05_community_report_form_annotated.png",
        wf08.get("caption", "Community Incident Reporting Desk with draft persistence and emergency hotline numbers."),
        "4.5"
    )
    add_elements_table(doc, enrich_element_purposes(wf08.get("elements", []), "citizen_05_community_report_form"))

    # Workflow 4.6: Report Submitted Confirmation
    p_h2 = doc.add_heading("4.6 Submission Feedback & Tracking Reference", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Reviewing Confirmation Alert", "Upon submission, a prominent green confirmation alert banner appears on screen (Badge 1).")
    add_workflow_step(doc, 2, "Verifying Destination Routing", "The banner confirms that the incident has been officially routed to the target barangay hall (Badge 2).")
    add_workflow_step(doc, 3, "Recording Tracking Code", "Copy or screenshot the generated unique Transaction Reference Code (Badge 3) for future follow-up with barangay officials.")

    wf09 = screenshots.get("citizen_06_report_submitted", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "citizen" / "citizen_06_report_submitted_annotated.png",
        wf09.get("caption", "Confirmation alert providing a unique tracking code for citizen verification."),
        "4.6"
    )
    add_elements_table(doc, enrich_element_purposes(wf09.get("elements", []), "citizen_06_report_submitted"))

    # Workflow 4.7: Civic News Feed
    p_h2 = doc.add_heading("4.7 Civic News & Public Advisories Feed", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Accessing Newsroom", "Click 'Balita' in the navigation bar or visit /news.")
    add_workflow_step(doc, 2, "Filtering by Category", "Toggle between 'Lahat', 'Lungsod', and 'Barangay' filters (Badge 2).")
    add_workflow_step(doc, 3, "Reading Pinned Urgent Directives", "Inspect high-priority executive directives marked with the Pinned tag (Badge 3) at the top of the feed.")
    add_workflow_step(doc, 4, "Browsing Community Articles", "Read chronological updates, cleanup drives, and municipal council session summaries (Badge 4).")

    wf10 = screenshots.get("citizen_07_civic_news", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "citizen" / "citizen_07_civic_news_annotated.png",
        wf10.get("caption", "Public newsfeed synchronizing city advisories and barangay legislative notices."),
        "4.7"
    )
    add_elements_table(doc, enrich_element_purposes(wf10.get("elements", []), "citizen_07_civic_news"))

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: BARANGAY ADMINISTRATOR OPERATIONS GUIDE
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 5: Barangay Administrator Operations Guide", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(6)
    r = p_body.add_run(
        "Barangay Administrators (Punong Barangays, Barangay Secretaries, and Sangguniang Barangay Members) possess dedicated administrative privileges scoped strictly to their registered barangay. Officials can draft local ordinances, parse scanned documents via Google Gemini multimodal OCR, transmit legislation to City Hall for legal review, triage community incident reports, and generate formal legislative reports."
    )
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY

    # Workflow 5.1: Barangay Dashboard
    p_h2 = doc.add_heading("5.1 Local Governance Dashboard Overview", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Signing In", "Sign in using your verified barangay credentials (e.g., kapitan@cabanatuan.gov.ph / kapitan123).")
    add_workflow_step(doc, 2, "Verifying Jurisdiction Header", "Confirm the header reads 'Barangay Governance Dashboard — Camp Tinio' (Badge 1). Data isolation prevents visibility of unrelated barangays.")
    add_workflow_step(doc, 3, "Inspecting Local KPI Cards", "Monitor active local ordinances (Badge 2), pending proposals awaiting Sangguniang Panlungsod approval (Badge 3), and citizen reports (Badge 4).")
    add_workflow_step(doc, 4, "Triage Overview Feed", "Examine incoming incident reports from constituents in the central activity table (Badge 5).")
    add_workflow_step(doc, 5, "Navigating Modules", "Use the dedicated sidebar (Badge 6) to transition between Ordinances, Reports, and Analytics.")

    wf11 = screenshots.get("barangay_01_dashboard", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "barangay_admin" / "barangay_01_dashboard_annotated.png",
        wf11.get("caption", "Barangay governance dashboard displaying metrics scoped exclusively to Barangay Camp Tinio."),
        "5.1"
    )
    add_elements_table(doc, enrich_element_purposes(wf11.get("elements", []), "barangay_01_dashboard"))

    # Workflow 5.2: Barangay Ordinance Management
    p_h2 = doc.add_heading("5.2 Barangay Ordinance Management & Status Tabs", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Repository", "Click 'Mga Ordinansa' on the sidebar or visit /admin/barangay/ordinances.")
    add_workflow_step(doc, 2, "Triage by Status Tabs", "Use the accessible status tabs (Badge 1) to inspect All, Pending, Approved, Draft, and Rejected ordinances.")
    add_workflow_step(doc, 3, "Searching Local Records", "Type resolution numbers or keywords into the local search bar (Badge 3).")
    add_workflow_step(doc, 4, "Initiating New Enactment", "Click the 'Magdagdag ng Ordinansa' button (Badge 2) to launch the proposal modal.")
    add_workflow_step(doc, 5, "Managing Legislative Records", "Click action buttons (Badge 5) on any row to view, edit drafts, or resubmit rejected items.")

    wf12 = screenshots.get("barangay_02_ordinance_management", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "barangay_admin" / "barangay_02_ordinance_management_annotated.png",
        wf12.get("caption", "Barangay ordinance repository for managing local resolutions across their complete lifecycle."),
        "5.2"
    )
    add_elements_table(doc, enrich_element_purposes(wf12.get("elements", []), "barangay_02_ordinance_management"))

    # Workflow 5.3: Draft Ordinance Creation
    p_h2 = doc.add_heading("5.3 Drafting & Transmitting Local Ordinances", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Filling Legislative Metadata", "Enter the proposed title and resolution number (Badge 2), followed by the policy category and year series (Badge 3).")
    add_workflow_step(doc, 2, "Drafting Legal Text & Sanctions", "Enter legal provisions, prohibited acts, and fine schedules in the description and content inputs (Badge 4).")
    add_workflow_step(doc, 3, "Saving as Draft (Internal Staging)", "Click 'I-save bilang Draft' (Badge 5). The record is stored with status DRAFT. City Hall cannot see or approve drafts until transmitted.")
    add_workflow_step(doc, 4, "Official Transmittal to LGU", "Once approved by the Barangay Council, click 'Isumite sa LGU para sa Pagsusuri' (Badge 6). Status changes to PENDING and appears on the City Hall docket.")

    wf13 = screenshots.get("barangay_03_draft_ordinance_modal", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "barangay_admin" / "barangay_03_draft_ordinance_modal_annotated.png",
        wf13.get("caption", "Drafting interface supporting work-in-progress drafts and official transmittals to City Hall."),
        "5.3"
    )
    add_elements_table(doc, enrich_element_purposes(wf13.get("elements", []), "barangay_03_draft_ordinance_modal"))

    # Workflow 5.4: AI Multimodal OCR Extractor
    p_h2 = doc.add_heading("5.4 Multimodal AI Document Extraction (Barangay)", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Activating AI Extractor", "In the ordinance creation modal, locate the 'AI Auto-Extraction' section (Badge 1).")
    add_workflow_step(doc, 2, "Uploading Scanned Document", "Drag and drop a scanned PDF or smartphone photograph of the signed paper ordinance into the dropzone (Badge 2).")
    add_workflow_step(doc, 3, "Executing AI Extraction", "Click 'I-Extract gamit ang AI' (Badge 3). The system dispatches the file to the Google Gemini multimodal model.")
    add_workflow_step(doc, 4, "Monitoring Multi-Stage Progress", "Watch the animated progress indicator (Badge 4) as the model parses OCR text, resolution numbers, and penalty clauses.")
    add_workflow_step(doc, 5, "Human-in-the-Loop Review", "Inspect the automatically populated fields (Badge 5). Make minor adjustments if necessary, then click Save.")

    wf14 = screenshots.get("barangay_04_ai_extraction_modal", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "barangay_admin" / "barangay_04_ai_extraction_modal_annotated.png",
        wf14.get("caption", "Automated extraction tool utilizing Google Gemini to convert scanned paper ordinances into digital records."),
        "5.4"
    )
    add_elements_table(doc, enrich_element_purposes(wf14.get("elements", []), "barangay_04_ai_extraction_modal"))

    # Workflow 5.5: Incident Reports Management
    p_h2 = doc.add_heading("5.5 Constituent Incident Reports Desk", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Reports Desk", "Click 'Mga Ulat ng Residente' on the sidebar or visit /admin/barangay/reports.")
    add_workflow_step(doc, 2, "Filtering by Status", "Click status filter buttons (Badge 2) to display New complaints, In Progress investigations, or Resolved incidents.")
    add_workflow_step(doc, 3, "Inspecting Incident Rows", "Examine violation categories, landmark locations, and narrative testimonies submitted by residents (Badge 3).")
    add_workflow_step(doc, 4, "Verifying Anonymity Badges", "Check whether the citizen filed anonymously or attached verified contact details (Badge 4).")
    add_workflow_step(doc, 5, "Launching Triage Dialog", "Click the action button (Badge 5) on any row to open the case management modal.")

    wf15 = screenshots.get("barangay_05_community_reports", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "barangay_admin" / "barangay_05_community_reports_annotated.png",
        wf15.get("caption", "Triage desk where barangay officials monitor, inspect, and process violation reports."),
        "5.5"
    )
    add_elements_table(doc, enrich_element_purposes(wf15.get("elements", []), "barangay_05_community_reports"))

    # Workflow 5.6: Report Triage & Resolution Modal
    p_h2 = doc.add_heading("5.6 Incident Case Triage & Status Resolution", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Reviewing Testimony & Evidence", "Inspect the citizen's incident testimony, landmark coordinates, and timestamp (Badge 2).")
    add_workflow_step(doc, 2, "Updating Operational Status", "Select the new status from the dropdown (Badge 3): change from 'Bago' (New) to 'Inaaksyunan' (In Progress) or 'Naresolba' (Resolved).")
    add_workflow_step(doc, 3, "Attaching Official Action Notes", "In the Remarks field (Badge 4), enter official dispatch notes (e.g., 'Dispatched Barangay Tanod Team B for site inspection and mediation').")
    add_workflow_step(doc, 4, "Saving Updates", "Click 'I-update ang Status' (Badge 5) to commit changes and log an audit timestamp.")

    wf16 = screenshots.get("barangay_06_report_triage_modal", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "barangay_admin" / "barangay_06_report_triage_modal_annotated.png",
        wf16.get("caption", "Action dialog enabling barangay leaders to dispatch officers and record resolution findings."),
        "5.6"
    )
    add_elements_table(doc, enrich_element_purposes(wf16.get("elements", []), "barangay_06_report_triage_modal"))

    # Workflow 5.7: Barangay Legislative Reports
    p_h2 = doc.add_heading("5.7 Barangay Legislative Reporting & Export", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Reporting Desk", "Navigate to /admin/barangay/ordinance-reports or click 'Analytics & Reports'.")
    add_workflow_step(doc, 2, "Setting Report Parameters", "Select report criteria, year ranges, and policy categories (Badge 2).")
    add_workflow_step(doc, 3, "Generating Summary Layout", "Click 'I-generate ang Ulat' (Badge 3) to render the certified tabular layout.")
    add_workflow_step(doc, 4, "Exporting Formal PDF Documentation", "Click 'I-download bilang PDF' (Badge 4) to compile a certified legislative record for the Barangay Hall physical archives.")

    wf17 = screenshots.get("barangay_07_ordinance_reports_analytics", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "barangay_admin" / "barangay_07_ordinance_reports_analytics_annotated.png",
        wf17.get("caption", "Reporting module allowing barangay officials to generate formatted summaries of local legislation."),
        "5.7"
    )
    add_elements_table(doc, enrich_element_purposes(wf17.get("elements", []), "barangay_07_ordinance_reports_analytics"))

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: LGU SUPER ADMINISTRATOR EXECUTIVE GUIDE
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 6: LGU Super Administrator Executive Guide", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(6)
    r = p_body.add_run(
        "LGU Super Administrators (City Mayor, City Legal Council, Sangguniang Panlungsod Secretariat, and System Administrators) exercise full city-wide governance over all 89 barangays. Capabilities include managing the central municipal repository, reviewing and legally approving/rejecting barangay submissions, high-throughput AI document parsing, official account provisioning, city-wide incident auditing, civic broadcast publishing, and certified legislative PDF report generation."
    )
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY

    # Workflow 6.1: Executive Dashboard
    p_h2 = doc.add_heading("6.1 Executive Governance Dashboard & City KPIs", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Executive Sign-In", "Sign in with City Hall credentials (admin@cabanatuan.gov.ph / admin123) and navigate to /admin/lgu.")
    add_workflow_step(doc, 2, "Inspecting City-Wide KPI Cards", "Examine live indicators (Badge 2): Total Ordinances (56), Approved Laws (43), Pending Barangay Proposals (6), Drafts (6), and Registered Barangays (14).")
    add_workflow_step(doc, 3, "Using Governance Quick Actions", "Use direct action shortcuts (Badge 3) to enact city ordinances, generate certified reports, or jump directly to pending submissions.")
    add_workflow_step(doc, 4, "Auditing Real-Time Legislative Activity", "Review the activity stream (Badge 4) for recent transmittals, approvals, and citizen report updates.")
    add_workflow_step(doc, 5, "Accessing Navigation Modules", "The left sidebar (Badge 5) grants direct access to all eight administrative desks.")

    wf18 = screenshots.get("lgu_01_executive_dashboard", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_01_executive_dashboard_annotated.png",
        wf18.get("caption", "Executive overview displaying city-wide legislative health metrics and real-time activity stream."),
        "6.1"
    )
    add_elements_table(doc, enrich_element_purposes(wf18.get("elements", []), "lgu_01_executive_dashboard"))

    # Workflow 6.2: Central Ordinance Repository
    p_h2 = doc.add_heading("6.2 Central Ordinance Repository & Status Triage", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Repository", "Click 'Mga Ordinansa' on the sidebar or visit /admin/lgu/ordinances.")
    add_workflow_step(doc, 2, "Filtering by Status Tabs", "Click accessible tabs with live record counters (Badge 1): All (56), Pending (6), Approved (43), Draft (6), Rejected.")
    add_workflow_step(doc, 3, "Performing Instant Search", "Type search terms into the input box (Badge 2) for immediate client-side table filtering.")
    add_workflow_step(doc, 4, "Enacting City Legislation", "Click 'Magdagdag ng Ordinansa' (Badge 3) to enact a new city-wide regulation or launch AI document parsing.")
    add_workflow_step(doc, 5, "Verifying Jurisdiction Badges", "Inspect the origin badges (Badge 4) distinguishing municipal City ordinances from local Barangay submissions.")

    wf19 = screenshots.get("lgu_02_ordinance_repository", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_02_ordinance_repository_annotated.png",
        wf19.get("caption", "Central repository managing all official city ordinances and legislative proposals."),
        "6.2"
    )
    add_elements_table(doc, enrich_element_purposes(wf19.get("elements", []), "lgu_02_ordinance_repository"))

    # Workflow 6.3: Reviewing & Approving Barangay Submissions
    p_h2 = doc.add_heading("6.3 Reviewing & Processing Barangay Submissions", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Selecting Pending Submissions Tab", "Click the 'Pending' tab on /admin/lgu/ordinances.")
    add_workflow_step(doc, 2, "Launching Review Modal", "Locate a pending proposal (e.g., from Barangay Camp Tinio) and click 'Suriin / Review'.")
    add_workflow_step(doc, 3, "Evaluating Legal Provisions", "Read the submitted title, background rationale, and proposed fine schedules (Badge 2).")
    add_workflow_step(doc, 4, "Attaching Legal Council Remarks", "In the Remarks field (Badge 3), enter formal feedback (e.g., 'Reviewed and approved pursuant to City Council Session No. 14').")
    add_workflow_step(doc, 5, "Granting Enactment Approval", "Click 'Aprubahan' (Badge 4). Status transitions immediately to APPROVED and the ordinance is published to the public portal.")
    add_workflow_step(doc, 6, "Requesting Revisions / Denying", "Alternatively, enter required corrective actions and click 'Tanggihan' (Badge 5) to return the item to the barangay with attached notes.")

    wf20 = screenshots.get("lgu_03_review_approve_modal", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_03_review_approve_modal_annotated.png",
        wf20.get("caption", "Sangguniang Panlungsod review interface for evaluating proposed barangay ordinances."),
        "6.3"
    )
    add_elements_table(doc, enrich_element_purposes(wf20.get("elements", []), "lgu_03_review_approve_modal"))

    # Workflow 6.4: AI Multimodal OCR Extractor (City Hall)
    p_h2 = doc.add_heading("6.4 Multimodal OCR Ordinance Extractor (Powered by Gemini)", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Opening City Ordinance Modal", "Click 'Magdagdag ng Ordinansa' on /admin/lgu/ordinances.")
    add_workflow_step(doc, 2, "Uploading Official Scanned PDF", "Drag and drop the scanned resolution file into the upload zone (Badge 2).")
    add_workflow_step(doc, 3, "Executing AI Multimodal Parsing", "Click 'I-Extract gamit ang AI' (Badge 3). Google Gemini analyzes text and visual document structure.")
    add_workflow_step(doc, 4, "Inspecting Extracted Metadata", "Verify auto-populated fields (Badge 4): Resolution Number, Series Year, Enacted Date, and Title.")
    add_workflow_step(doc, 5, "Validating Sanctions Breakdown", "Verify structured first, second, and third offense fines (Badge 5), make minor text adjustments, and save.")

    wf21 = screenshots.get("lgu_04_ai_document_extraction", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_04_ai_document_extraction_annotated.png",
        wf21.get("caption", "High-throughput AI parser transforming scanned paper ordinances into verified digital records."),
        "6.4"
    )
    add_elements_table(doc, enrich_element_purposes(wf21.get("elements", []), "lgu_04_ai_document_extraction"))

    # Workflow 6.5: User & Official Accounts Management
    p_h2 = doc.add_heading("6.5 Administrative Accounts & Official Directory", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Official Directory", "Click 'Mga Opisyal / Users' on the sidebar or visit /admin/lgu/users.")
    add_workflow_step(doc, 2, "Registering a New Official", "Click 'Magrehistro ng Opisyal' (Badge 2) to open the account provisioning dialog.")
    add_workflow_step(doc, 3, "Assigning Roles & Barangays", "Select the role (LGU_ADMIN vs BARANGAY_ADMIN) and bind the account to their specific barangay jurisdiction (Badge 5).")
    add_workflow_step(doc, 4, "Security & Password Protection", "Passwords are encrypted using salted bcrypt hashing before storage (Badge 3).")

    wf22 = screenshots.get("lgu_05_users_management", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_05_users_management_annotated.png",
        wf22.get("caption", "User directory for provisioning barangay captains and city personnel with role-based access control."),
        "6.5"
    )
    add_elements_table(doc, enrich_element_purposes(wf22.get("elements", []), "lgu_05_users_management"))

    # Workflow 6.6: Barangay Directory & Coverage
    p_h2 = doc.add_heading("6.6 Barangay Directory & Territorial Coverage", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Barangay Directory", "Click 'Direktoryo ng Barangay' or visit /admin/lgu/barangays.")
    add_workflow_step(doc, 2, "Inspecting Participation Indicators", "Examine active participation badges across the 14 registered barangays (Badge 2).")
    add_workflow_step(doc, 3, "Monitoring Enacted Legislation Counts", "Inspect individual barangay cards (Badge 3) showing local resolution counts and active captains.")
    add_workflow_step(doc, 4, "Direct Barangay Archive Navigation", "Click the view link on any card (Badge 4) to inspect that barangay's local archive.")

    wf23 = screenshots.get("lgu_06_barangays_directory", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_06_barangays_directory_annotated.png",
        wf23.get("caption", "Directory tracking participation and enacted local resolutions across all barangays."),
        "6.6"
    )
    add_elements_table(doc, enrich_element_purposes(wf23.get("elements", []), "lgu_06_barangays_directory"))

    # Workflow 6.7: City-Wide Community Reports Monitoring
    p_h2 = doc.add_heading("6.7 City-Wide Community Incident Reports Desk", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Reports Desk", "Click 'Mga Ulat ng Komunidad' on the sidebar or visit /admin/lgu/reports.")
    add_workflow_step(doc, 2, "Filtering by Barangay Jurisdiction", "Use the Barangay Dropdown (Badge 2) to filter complaints across any of Cabanatuan's barangays.")
    add_workflow_step(doc, 3, "Auditing Resolution Performance", "Toggle status filter tabs (Badge 3) to identify unaddressed citizen reports.")
    add_workflow_step(doc, 4, "Inspecting Consolidated Evidence", "Review violation categories, descriptions, and photographic evidence (Badge 4).")
    add_workflow_step(doc, 5, "Executive Override & Intervention", "Click the status action control (Badge 5) to update status or assign city-level enforcement.")

    wf24 = screenshots.get("lgu_07_city_reports_monitoring", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_07_city_reports_monitoring_annotated.png",
        wf24.get("caption", "Supervisory desk enabling city administrators to monitor citizen reports and audit resolution times."),
        "6.7"
    )
    add_elements_table(doc, enrich_element_purposes(wf24.get("elements", []), "lgu_07_city_reports_monitoring"))

    # Workflow 6.8: Civic News & Advisories Broadcast
    p_h2 = doc.add_heading("6.8 Civic News & Public Advisories Broadcast Desk", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to News Desk", "Click 'Mga Balita at Anunsyo' on the sidebar or visit /admin/lgu/news.")
    add_workflow_step(doc, 2, "Drafting New Public Advisory", "Click 'Maglathala ng Anunsyo' (Badge 2) to open the announcement composer.")
    add_workflow_step(doc, 3, "Composing Title, Category & Content", "Enter an informative title, select category (City or Barangay), and type announcement details.")
    add_workflow_step(doc, 4, "Pinning Urgent Public Advisories", "Toggle the 'Pinned' switch (Badge 4) for critical weather, curfew, or public health directives.")
    add_workflow_step(doc, 5, "Publishing to Citizen Portal", "Click Publish. The announcement synchronizes immediately with the public citizen portal (/news).")

    wf25 = screenshots.get("lgu_08_news_publishing", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_08_news_publishing_annotated.png",
        wf25.get("caption", "Communication center for publishing legislative alerts and public health directives."),
        "6.8"
    )
    add_elements_table(doc, enrich_element_purposes(wf25.get("elements", []), "lgu_08_news_publishing"))

    # Workflow 6.9: Legislative Report Generator & PDF Exporter
    p_h2 = doc.add_heading("6.9 Legislative Report Generator & PDF Exporter", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Report Generator", "Click 'Mga Ulat at Dokumento' on the sidebar or visit /admin/lgu/ordinance-reports.")
    add_workflow_step(doc, 2, "Selecting Report Structure", "Choose from eight specialized report structures (Badge 1): List of All Ordinances, by Month, Barangay, Filer, Category, Status, Type, or Year.")
    add_workflow_step(doc, 3, "Applying Criteria Filters", "Set parameters in the filter panel (Badge 2) for Year, Status, Category, and Barangay origin.")
    add_workflow_step(doc, 4, "Executing Report Generation", "Click 'I-generate ang Ulat' (Badge 3) to execute database aggregation and render the official preview.")
    add_workflow_step(doc, 5, "Inspecting Certified Document Preview", "Verify the official Republic of the Philippines heading, Cabanatuan seal, and tabular format (Badge 4).")
    add_workflow_step(doc, 6, "Exporting Certified PDF Document", "Click 'I-download bilang PDF' (Badge 5) to compile a certified legislative summary document.")

    wf26 = screenshots.get("lgu_09_legislative_report_generator", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_09_legislative_report_generator_annotated.png",
        wf26.get("caption", "Formal reporting tool generating certified legislative summaries with official headers and PDF export."),
        "6.9"
    )
    add_elements_table(doc, enrich_element_purposes(wf26.get("elements", []), "lgu_09_legislative_report_generator"))

    # Workflow 6.10: Governance Analytics & Trend Charts
    p_h2 = doc.add_heading("6.10 Governance Analytics & Policy Trend Visualizations", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_workflow_step(doc, 1, "Navigating to Analytics", "Click 'Analytics' on the sidebar or visit /admin/lgu/analytics.")
    add_workflow_step(doc, 2, "Analyzing Enactment Velocity", "Inspect the interactive line chart (Badge 2) tracking municipal ordinance enactment velocity over time.")
    add_workflow_step(doc, 3, "Examining Policy Distributions", "Review the Category Distribution chart (Badge 3) showing thematic allocations (Health, Environment, Peace & Order).")
    add_workflow_step(doc, 4, "Auditing Barangay Participation", "Inspect the Barangay Participation ranking (Badge 4) identifying top-contributing local councils.")
    add_workflow_step(doc, 5, "Tracking Community Resolution Efficiency", "Analyze the Report Resolution Rate gauge (Badge 5) measuring average turnaround times for citizen complaints.")

    wf27 = screenshots.get("lgu_10_analytics_charts", {})
    add_screenshot_block(
        doc,
        SCREENSHOTS_ANNOTATED / "lgu_admin" / "lgu_10_analytics_charts_annotated.png",
        wf27.get("caption", "Interactive data visualization suite tracking legislative velocity and civic report resolution performance."),
        "6.10"
    )
    add_elements_table(doc, enrich_element_purposes(wf27.get("elements", []), "lgu_10_analytics_charts"))

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7: MULTI-TENANT DATA ISOLATION & SECURITY GUIDELINES
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 7: Data Isolation & Security Guidelines", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_body = doc.add_paragraph()
    p_body.paragraph_format.line_spacing = 1.15
    p_body.paragraph_format.space_after = Pt(6)
    r = p_body.add_run(
        "To guarantee administrative integrity, operational privacy, and compliance with the Philippine Data Privacy Act of 2012 (RA 10173), the Cabanatuan City Ordinance Portal implements multi-tiered security protocols:\n\n"
        "1. Multi-Tenant Jurisdictional Isolation:\n"
        "Every database mutation (creation, status update, deletion) verifies that the authenticated user's session barangayId matches the target record's barangayId. Barangay Captains cannot view drafts or modify citizen reports belonging to neighboring barangays.\n\n"
        "2. Cryptographic Token Protection:\n"
        "Authentication tokens are signed with HMAC-SHA256 and transmitted exclusively in HTTP-only, SameSite=Lax cookies with path-level route guards in Next.js middleware, mitigating cross-site scripting (XSS) and CSRF vectors.\n\n"
        "3. Salted Password Hashing:\n"
        "User credentials are encrypted using salted bcrypt hashing with a work factor of 10. No plaintext credentials ever touch persistent storage or server log files.\n\n"
        "4. Audit Logging & Legislative Traceability:\n"
        "All ordinance approvals, rejections, and citizen report status updates record an immutable audit trail capturing the actor's user ID, timestamp, and review remarks for complete civic accountability."
    )
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY

    add_callout(
        doc,
        "IMMUTABLE LEGISLATIVE AUDIT TRAILS",
        "When an LGU Super Administrator approves or denies a proposed ordinance, the system records: (1) reviewedById foreign key reference, (2) approvedAt timestamp, and (3) rejectedReason text notes. This audit record is preserved permanently in the database and visible in formal legislative PDF exports.",
        callout_type="tip"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8: TROUBLESHOOTING, PREREQUISITES & FAQ
    # =========================================================================
    p_h1 = doc.add_heading("Chapter 8: Troubleshooting, Prerequisites & FAQ", level=1)
    p_h1.runs[0].font.name = "Arial"
    p_h1.runs[0].font.size = Pt(18)
    p_h1.runs[0].font.color.rgb = COLOR_EMERALD

    p_h2 = doc.add_heading("8.1 System Requirements & Browser Compatibility", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    reqs = [
        ("Supported Browsers", "Google Chrome 110+, Microsoft Edge 110+, Mozilla Firefox 115+, Safari 16+"),
        ("Display Resolution", "Responsive: 360px mobile viewport up to 1920x1080 Full HD desktop"),
        ("Server Runtime", "Node.js 20+ LTS or Node.js 22+, SQLite 3.40+, Better-SQLite3"),
        ("Hardware Requirements", "Minimum 4 GB RAM, 2 GHz dual-core processor, 500 MB disk space"),
        ("Network Connectivity", "Broadband internet connection required for Google Gemini API inference; offline database exploration supported locally"),
    ]

    tbl_rq = doc.add_table(rows=1, cols=2)
    tbl_rq.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_rq)
    hdr_q = tbl_rq.rows[0].cells
    hdr_q[0].width = Inches(2.2)
    hdr_q[1].width = Inches(4.3)
    set_cell_background(hdr_q[0], HEX_EMERALD)
    set_cell_background(hdr_q[1], HEX_EMERALD)
    set_cell_margins(hdr_q[0], top=100, bottom=100, left=120, right=120)
    set_cell_margins(hdr_q[1], top=100, bottom=100, left=120, right=120)

    p0 = hdr_q[0].paragraphs[0]
    r0 = p0.add_run("System Component")
    r0.bold = True
    r0.font.name = "Arial"
    r0.font.size = Pt(10)
    r0.font.color.rgb = RGBColor(255, 255, 255)

    p1 = hdr_q[1].paragraphs[0]
    r1 = p1.add_run("Technical Specification")
    r1.bold = True
    r1.font.name = "Arial"
    r1.font.size = Pt(10)
    r1.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (comp, spec) in enumerate(reqs):
        row = tbl_rq.add_row()
        c0, c1 = row.cells
        bg = HEX_LIGHT_GRAY if idx % 2 == 1 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=80, bottom=80, left=120, right=120)
        set_cell_margins(c1, top=80, bottom=80, left=120, right=120)

        p_t0 = c0.paragraphs[0]
        r_t0 = p_t0.add_run(comp)
        r_t0.bold = True
        r_t0.font.name = "Arial"
        r_t0.font.size = Pt(9.5)
        r_t0.font.color.rgb = COLOR_DARK_SLATE

        p_t1 = c1.paragraphs[0]
        r_t1 = p_t1.add_run(spec)
        r_t1.font.name = "Arial"
        r_t1.font.size = Pt(9)
        r_t1.font.color.rgb = COLOR_BODY

    p_h2 = doc.add_heading("8.2 Common Operational Issues & Troubleshooting", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    add_callout(
        doc,
        "ISSUE 1: AI MULTIMODAL EXTRACTION TIMEOUT OR ERROR",
        "Symptom: Uploading a large scanned PDF results in an error message or spinning wheel.\n"
        "Resolution: Ensure the uploaded PDF or image is under 15 MB and clearly legible. Verify that your GEMINI_API_KEY environment variable is configured in .env and that the server has an active internet connection to access the Google GenAI endpoints.",
        callout_type="warning"
    )

    add_callout(
        doc,
        "ISSUE 2: FORBIDDEN / REDIRECT LOOP DURING LOGIN",
        "Symptom: Attempting to access /admin/lgu redirects back to /login.\n"
        "Resolution: Clear your browser session cookies for localhost:3000. Re-authenticate using the exact LGU Super Admin credentials (admin@cabanatuan.gov.ph / admin123). Ensure that caps lock is off.",
        callout_type="warning"
    )

    add_callout(
        doc,
        "ISSUE 3: SUBMITTED ORDINANCE NOT APPEARING ON PUBLIC EXPLORER",
        "Symptom: A barangay official submitted an ordinance, but citizens cannot find it in /ordinances.\n"
        "Resolution: Newly submitted barangay ordinances carry the status 'PENDING'. They only appear publicly once an LGU Super Administrator reviews and officially APPROVES the proposal pursuant to Sangguniang Panlungsod procedures.",
        callout_type="note"
    )

    p_h2 = doc.add_heading("8.3 Defense Panel Technical FAQ", level=2)
    p_h2.runs[0].font.name = "Arial"
    p_h2.runs[0].font.size = Pt(14)
    p_h2.runs[0].font.color.rgb = COLOR_DARK_SLATE

    faqs = [
        ("Q1: Why was Google Gemini chosen over OpenAI or self-hosted models?",
         "Answer: Google Gemini provides superior multimodal vision for analyzing scanned physical documents with stamps and signatures, low inference latency, and excellent bilingual Tagalog/English comprehension. In our RAG architecture, all city data remains securely on our local database, invoking Gemini solely for context synthesis."),
        ("Q2: How does the system prevent AI hallucinations and unauthorized legal advice?",
         "Answer: The AI Civic Assistant utilizes strict prompt grounding with local retrieval injection. It only answers questions based on retrieved municipal ordinances and refuses to answer out-of-scope national legal questions. A prominent civic disclaimer informs residents that outputs are informational only."),
        ("Q3: How is multi-tenant security handled across eighty-nine barangays?",
         "Answer: We enforce multi-tenant role-based access control using Prisma ORM and JWT tokens. Each barangay session is strictly bound to its assigned barangayId, preventing unauthorized cross-jurisdiction access or modification."),
    ]

    for q, a in faqs:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(6)
        p_q.paragraph_format.space_after = Pt(2)
        p_q.paragraph_format.line_spacing = 1.15
        r_q = p_q.add_run(q)
        r_q.bold = True
        r_q.font.name = "Arial"
        r_q.font.size = Pt(10)
        r_q.font.color.rgb = COLOR_EMERALD

        p_a = doc.add_paragraph()
        p_a.paragraph_format.left_indent = Inches(0.2)
        p_a.paragraph_format.space_before = Pt(0)
        p_a.paragraph_format.space_after = Pt(6)
        p_a.paragraph_format.line_spacing = 1.15
        r_a = p_a.add_run(a)
        r_a.font.name = "Arial"
        r_a.font.size = Pt(9.5)
        r_a.font.color.rgb = COLOR_BODY

    # Save document
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc.save(OUTPUT_DOCX)
    print(f"\n[OK] Document successfully generated: {OUTPUT_DOCX}")
    print(f"File size: {os.path.getsize(OUTPUT_DOCX):,} bytes")

if __name__ == "__main__":
    build_document()
