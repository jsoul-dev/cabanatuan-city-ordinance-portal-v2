#!/usr/bin/env python3
"""
Capstone Appendix C User Manual Generator
Modeled directly after the academic capstone reference:
  "10. A-PROGRESSIVE-WEB-APPLICATIONBASED-QUEUE-pages-deleted.pdf"

Format and Structure:
  - Header: APPENDIX C / User Manual / Cabanatuan City Ordinance & Legislative Portal
  - Typography: Times New Roman throughout (12pt body, 1.15 line spacing, 0.5-inch first-line indent)
  - Layout: Standard 1-inch margins (6.5 inches printable width)
  - Procedural focus: 100% focused on HOW TO USE THE SYSTEM (no generic headers, logos, theme toggles, or sidebars)
  - Figure Images: Framed cards with dark title banners and clean numbered circular callout pins (NO cluttering boxes!)
  - Tables: Standard 2-column format:
      No. | Field, Control, or Area — Detailed Technical Description
  - Master Index: Summary Checklist of All User Manual Figures (matching reference P43-P46)
"""

import os
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent
ORIGINAL_DIR = BASE_DIR / "screenshots" / "original"
CAPSTONE_IMG_DIR = BASE_DIR / "screenshots" / "capstone"
CAPSTONE_IMG_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DOCX_OUTPUT_PATH = OUTPUT_DIR / "Cabanatuan_City_Ordinance_Portal_User_Manual.docx"
PDF_OUTPUT_PATH = OUTPUT_DIR / "Cabanatuan_City_Ordinance_Portal_User_Manual.pdf"

# Color Palette for Pins
PIN_BG_COLOR = (29, 78, 216, 255)       # Royal Blue (#1D4ED8)
PIN_BORDER_COLOR = (255, 255, 255, 255) # Pure White (2px)
PIN_SHADOW_COLOR = (0, 0, 0, 110)       # Drop shadow
BANNER_BG = (15, 23, 42)                 # Dark Navy/Slate (#0F172A)
FRAME_BORDER = (203, 213, 225)           # Light Slate (#CBD5E1)

def get_fonts():
    """Load bold and regular Windows fonts."""
    font_paths = [
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
    ]
    banner_font = None
    pin_font = None
    for p in font_paths:
        if os.path.exists(p):
            try:
                banner_font = ImageFont.truetype(p, 18)
                pin_font = ImageFont.truetype(p, 15)
                break
            except Exception:
                continue
    if not banner_font:
        banner_font = ImageFont.load_default()
        pin_font = ImageFont.load_default()
    return banner_font, pin_font

def create_capstone_figure_image(orig_subpath, figure_label, title, pins, out_filename):
    """
    Renders an academic capstone figure image:
      - Top banner with dark navy background and white title text
      - Framed original screenshot
      - Numbered circular pin badges resting directly on targeted controls (NO bounding boxes!)
    """
    orig_file = ORIGINAL_DIR / orig_subpath
    if not orig_file.exists():
        print(f"  [!] Missing original screenshot: {orig_file}")
        return None

    banner_font, pin_font = get_fonts()
    im = Image.open(orig_file).convert("RGB")
    w, h = im.size

    banner_h = 46
    canvas = Image.new("RGB", (w, h + banner_h), BANNER_BG)
    draw = ImageDraw.Draw(canvas)

    # 1. Top banner text: Figure C-X. Title
    banner_text = f"{figure_label}. {title}"
    draw.text((24, 13), banner_text, font=banner_font, fill=(255, 255, 255))

    # 2. Paste screenshot
    canvas.paste(im, (0, banner_h))

    # 3. Outer border
    draw.rectangle([0, banner_h, w - 1, h + banner_h - 1], outline=FRAME_BORDER, width=2)

    # 4. Draw circular pin badges
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    radius = 16

    for num, cx, cy in pins:
        # Shift cy by banner_h
        actual_cy = cy + banner_h
        # Clamp within canvas
        actual_cx = max(radius + 4, min(w - radius - 4, cx))
        actual_cy = max(banner_h + radius + 4, min(h + banner_h - radius - 4, actual_cy))

        # Shadow
        odraw.ellipse(
            [actual_cx - radius + 1, actual_cy - radius + 2, actual_cx + radius + 1, actual_cy + radius + 2],
            fill=PIN_SHADOW_COLOR
        )
        # White border ring (2px)
        odraw.ellipse(
            [actual_cx - radius - 2, actual_cy - radius - 2, actual_cx + radius + 2, actual_cy + radius + 2],
            fill=PIN_BORDER_COLOR
        )
        # Solid Royal Blue Pin
        odraw.ellipse(
            [actual_cx - radius, actual_cy - radius, actual_cx + radius, actual_cy + radius],
            fill=PIN_BG_COLOR
        )
        # Number string centered
        num_str = str(num)
        bbox = odraw.textbbox((0, 0), num_str, font=pin_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        odraw.text((actual_cx - tw / 2, actual_cy - th / 2 - 1), num_str, font=pin_font, fill=(255, 255, 255))

    final_img = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
    out_path = CAPSTONE_IMG_DIR / out_filename
    final_img.save(out_path, "PNG", optimize=True)
    return out_path

# ==============================================================================
# Complete 26 Figures Data Dictionary (100% Procedural & Operational)
# ==============================================================================

FIGURES_DATA = [
    {
        "figure_num": "Figure C-1",
        "section_name": "Public Access & Legislative Discovery",
        "title": "Public Welcome Portal & Legislative Search Gateway",
        "orig_subpath": "common/common_01_homepage_hero.png",
        "out_filename": "fig_c01_public_welcome.png",
        "target_role": "Public / Citizens",
        "what_it_is_for": (
            "The public welcome portal serves as the primary municipal gateway for Cabanatuan City's digital "
            "legislative repository. It provides unrestricted, zero-barrier public access for citizens, researchers, "
            "and local business owners to discover enacted city ordinances, municipal tax codes, traffic regulations, "
            "and public health policies without requiring prior account registration. The interface incorporates "
            "real-time full-text indexing, spatial 3D document visualization, and instant shortcuts to AI-assisted "
            "legal advisory tools. An essential architectural feature of this gateway is its strict public privacy boundary; "
            "internal administrative workflows, pending legislative deliberations, law enforcement sensitive reports, "
            "and barangay official contact directories remain inaccessible until an authenticated session is established."
        ),
        "pins": [
            (1, 173, 673),
            (2, 655, 673),
            (3, 173, 734),
            (4, 959, 299)
        ],
        "controls": [
            ("Hero Ordinance Search Input Field", "Text input field equipped with instant keyword matching. Citizens enter common topics, legal terms, or keywords (e.g., 'curfew', 'waste segregation', 'business permit', 'tricycle fare') to initiate legislative discovery across the municipal repository."),
            ("Search Execution Action Button", "Primary search execution button styled with high-contrast emerald civic branding. Submits active keyword parameters to the search engine and seamlessly transitions the citizen into the categorized Ordinance Explorer interface."),
            ("Ask AI Legal Assistant Action Button", "Dedicated action button providing 1-click routing into the conversational AI Legal Assistant interface, allowing citizens to formulate natural-language legal inquiries in conversational Tagalog or English."),
            ("Interactive 3D Ordinance Archive Canvas", "Three.js hardware-accelerated 3D cylinder archive visualizing 42+ indexed municipal ordinances. Enables citizens to interactively rotate, inspect, and spatially browse legislative enactment volumes chronologically.")
        ]
    },
    {
        "figure_num": "Figure C-2",
        "section_name": "Account Access & Authentication",
        "title": "Secure Multi-Role Portal Sign-In & Authentication",
        "orig_subpath": "common/common_02_login_page.png",
        "out_filename": "fig_c02_secure_signin.png",
        "target_role": "All Users / Barangay Officials / LGU Superadmins",
        "what_it_is_for": (
            "The portal authentication interface controls authorized access to restricted administrative modules, "
            "including legislative proposal drafting, ordinance review and ratification, and community incident triage. "
            "Built with Role-Based Access Control (RBAC), the authentication service validates government personnel "
            "and assigns security contexts corresponding to LGU Super Administrators, Barangay Officials, and Registered "
            "Citizens. Confidential government records, audit logs, and citizen whistleblower reports are strictly guarded "
            "behind session tokens."
        ),
        "pins": [
            (1, 982, 396),
            (2, 982, 480),
            (3, 1286, 551),
            (4, 982, 678),
            (5, 1218, 50)
        ],
        "controls": [
            ("Official Email Address Input Field", "Validated input field capturing the official government or registered citizen email address. Implements live format checking and whitespace trimming to prevent authentication errors."),
            ("Encrypted Password Input Field", "Masked credential input field securing passwords during entry. Enforces secure character masking and interacts directly with backend cryptographic hashing algorithms."),
            ("Sign In Primary Action CTA Button", "Primary authentication trigger authenticating entered credentials against Firebase Auth. Upon successful token verification, the system inspects custom claims and routes users to their respective governance console."),
            ("Quick Role Preset Access Chips", "Pre-configured demonstration credentials allowing authorized evaluators and officials to rapidly test system workflows across LGU Superadmin, Barangay Official, and Citizen security tiers with a single tap."),
            ("Return to Public Portal Navigation Link", "Direct safe-exit navigation link allowing unauthenticated visitors or citizens to return to the public search gateway without modifying session state.")
        ]
    },
    {
        "figure_num": "Figure C-3",
        "section_name": "Public Legal Search & Discovery",
        "title": "Public Ordinance Explorer & Multi-Criteria Legal Filtering",
        "orig_subpath": "citizen/citizen_01_ordinance_explorer.png",
        "out_filename": "fig_c03_ordinance_explorer.png",
        "target_role": "Citizens / Public Users",
        "what_it_is_for": (
            "The Public Ordinance Explorer represents the central discovery portal for municipal law. Citizens can "
            "filter hundreds of enacted city regulations and barangay resolutions through a multi-faceted search architecture. "
            "The explorer provides instant keyword matching, jurisdiction segmentation, category sorting, and enactment year "
            "filtering to help residents find applicable laws quickly."
        ),
        "pins": [
            (1, 226, 366),
            (2, 226, 452),
            (3, 823, 451),
            (4, 1122, 451),
            (5, 209, 627)
        ],
        "controls": [
            ("Full-Text Legal Search Input Field", "Real-time search field querying ordinance titles, official resolution numbers, executive summaries, and enacted provisions with live debounced filtering."),
            ("Jurisdiction Scope Segmented Switcher", "Segmented filter buttons allowing citizens to toggle search scope between 'Lahat' (All Laws), 'City Ordinances' (Sangguniang Panlungsod enactments), and 'Barangay Resolutions' (local council measures)."),
            ("Policy Category Filter Dropdown", "Dropdown selector categorizing legislation into civic policy domains including Traffic & Transportation, Solid Waste Management, Curfew & Youth Welfare, Health & Sanitation, and Fiscal Revenue."),
            ("Legislative Enactment Year Dropdown", "Chronological dropdown filter allowing researchers to isolate ordinances passed in specific municipal legislative years from 2018 to 2026."),
            ("Interactive Ordinance Result Card", "Responsive legislative preview card showcasing ordinance number, official title, category tag, enactment date, plain-language digest, and direct link to the codified detail record.")
        ]
    },
    {
        "figure_num": "Figure C-4",
        "section_name": "Public Legal Search & Discovery",
        "title": "Codified Ordinance Full Text & Articles Viewer",
        "orig_subpath": "citizen/citizen_02_ordinance_detail.png",
        "out_filename": "fig_c04_ordinance_detail.png",
        "target_role": "Citizens / Legal Researchers",
        "what_it_is_for": (
            "The codified ordinance view presents the authoritative legal text of an enacted measure in a modern digital "
            "reader format. Rather than forcing citizens to decipher complex legal terminology in dense scanned PDFs, the system "
            "parses the document into structured articles, sections, and penalty provisions, accompanied by an executive summary."
        ),
        "pins": [
            (1, 366, 230),
            (2, 366, 570),
            (3, 366, 406),
            (4, 366, 731),
            (5, 337, 836)
        ],
        "controls": [
            ("Official Ordinance Title & Resolution Number", "Header displaying the authoritative legislative title, certified resolution number, and sponsoring council committee."),
            ("Legislative Metadata Bar", "Metadata banner indicating the date of third-reading enactment, mayoral approval timestamp, and jurisdictional coverage across Cabanatuan City."),
            ("Executive Legal Summary & Plain-Language Digest", "Citizen-centric overview summarizing the purpose, community scope, obligations, and citizen rights established by the ordinance in non-technical terms."),
            ("View Official Scanned PDF Action Button", "Primary action button launching the embedded official signed PDF document reader modal for certified legal inspection."),
            ("Codified Articles & Sections Hierarchical Accordion", "Expandable legal section tree allowing users to browse individual codified articles, specific mandates, prohibited acts, and monetary/custodial penalty clauses.")
        ]
    },
    {
        "figure_num": "Figure C-5",
        "section_name": "Document Verification & Official Assets",
        "title": "Official Legislative PDF Document Reader Modal",
        "orig_subpath": "citizen/citizen_03_pdf_modal.png",
        "out_filename": "fig_c05_pdf_modal.png",
        "target_role": "Citizens / Legal Clerks",
        "what_it_is_for": (
            "The official document reader modal delivers certified verification of municipal legislation. When official evidence "
            "or legal citations are required for court proceedings, business licensing, or academic research, citizens can inspect "
            "the original scanned municipal document bearing the official seal and wet signatures of the City Mayor and City Secretary."
        ),
        "pins": [
            (1, 316, 158),
            (2, 909, 90),
            (3, 1083, 90),
            (4, 1276, 90)
        ],
        "controls": [
            ("Embedded Digital PDF Document Canvas", "Hardware-accelerated PDF canvas rendering the authentic signed and sealed municipal ordinance document with pan, zoom, and multi-page navigation."),
            ("Direct PDF File Download Action Button", "Action button allowing citizens to download the official PDF file directly to their local workstation or mobile device for offline reference."),
            ("Open in Dedicated Full-Screen Tab Button", "Navigation trigger opening the raw PDF asset in an isolated browser tab, enabling native browser print workflows and external annotation."),
            ("Modal Dismiss / Close Action (Esc)", "Close trigger safely terminating the reader modal and returning the citizen to the active ordinance detail workspace.")
        ]
    },
    {
        "figure_num": "Figure C-6",
        "section_name": "AI-Powered Legal Advisory Services",
        "title": "AI Legal Assistant Interactive Inquiry Console",
        "orig_subpath": "citizen/citizen_04_ai_assistant.png",
        "out_filename": "fig_c06_ai_assistant.png",
        "target_role": "Citizens / Public Users",
        "what_it_is_for": (
            "The AI Legal Assistant employs Google Gemini multimodal intelligence paired with a Retrieval-Augmented Generation "
            "(RAG) pipeline over Cabanatuan City's codified ordinances. Citizens can ask practical questions in everyday language, "
            "and the assistant returns clear, verified explanations citing the exact ordinance and article numbers."
        ),
        "pins": [
            (1, 234, 618),
            (2, 635, 810),
            (3, 1360, 810),
            (4, 635, 394)
        ],
        "controls": [
            ("Preset Quick Action Inquiry Buttons", "Curated prompt chips allowing citizens to query common legal concerns (e.g., 'Curfew para sa kabataan', 'Bawal bang mag-videoke sa gabi?', 'Tamang tapunan ng basura') with a single click."),
            ("Bilingual Question Input Field", "Text input area accepting conversational prompts in Tagalog, English, or Taglish regarding municipal rules, fines, and administrative procedures."),
            ("Send Inquiry Execution Action Button", "Action trigger transmitting the query to the server-side RAG engine for vector similarity retrieval and grounded response generation."),
            ("AI Legal Analysis & Verified Citation Feed", "Conversational response container presenting synthesized answers with statutory article references, specific fine schedules, and official ordinance titles.")
        ]
    },
    {
        "figure_num": "Figure C-7",
        "section_name": "Community Grievance Reporting & Civic Action",
        "title": "Citizen Community Incident & Violation Reporting Form",
        "orig_subpath": "citizen/citizen_05_community_report_form.png",
        "out_filename": "fig_c07_report_form.png",
        "target_role": "Residents / Whistleblowers",
        "what_it_is_for": (
            "The community incident reporting system empowers Cabanatuan residents to actively participate in local governance "
            "by reporting non-emergency neighborhood violations directly to their respective barangay councils. This interface "
            "digitizes community grievances, routing them instantly to barangay triage desks."
        ),
        "pins": [
            (1, 513, 314),
            (2, 546, 652),
            (3, 546, 740),
            (4, 829, 740),
            (5, 546, 828)
        ],
        "controls": [
            ("Emergency Hotline Numbers Banner", "High-visibility alert panel detailing 24/7 emergency dispatch numbers (CDRRMO, PNP Cabanatuan, BFP Fire Station) for urgent life-safety situations."),
            ("Incident Subject / Title Input Field", "Single-line text field capturing a concise headline of the community concern (e.g., 'Nakatambak na basura sa tapat ng paaralan')."),
            ("Assigned Barangay Jurisdiction Dropdown", "Mandatory dropdown mapping the complaint to one of Cabanatuan City's 89 barangays, establishing local jurisdictional responsibility."),
            ("Incident Category Selector Dropdown", "Classification menu grouping complaints into Sanitation/Waste, Noise Disturbance, Public Right-of-Way Obstruction, Youth Curfew, or Other."),
            ("Incident Narrative & Location Details Textarea", "Multi-line narrative textarea capturing full incident context, exact street landmarks, recurring hours of violation, and observed circumstances.")
        ]
    },
    {
        "figure_num": "Figure C-8",
        "section_name": "Community Grievance Reporting & Civic Action",
        "title": "Community Report Submission Confirmation & Incident Reference",
        "orig_subpath": "citizen/citizen_06_report_submitted.png",
        "out_filename": "fig_c08_report_confirmation.png",
        "target_role": "Residents / Citizens",
        "what_it_is_for": (
            "Upon successful incident report submission, the portal provides immediate verification to the citizen. "
            "This confirmation confirms delivery to the barangay council and establishes accountability for local investigation."
        ),
        "pins": [
            (1, 546, 541),
            (2, 546, 683),
            (3, 956, 683)
        ],
        "controls": [
            ("Official Submission Confirmation Alert Banner", "Alert banner verifying successful transmission of the community report to the designated Barangay Hall dashboard."),
            ("Draft Auto-Save Status Bar", "System indicator confirming that browser local draft storage has been safely cleared following successful server persistence."),
            ("Reset & Clear Form Action Button", "Action button resetting form state and clearing input fields to allow residents to log another incident report if needed.")
        ]
    },
    {
        "figure_num": "Figure C-9",
        "section_name": "Civic Information & Public Communications",
        "title": "Civic News, Public Advisories & Legislative Announcements Feed",
        "orig_subpath": "citizen/citizen_07_civic_news.png",
        "out_filename": "fig_c09_civic_news.png",
        "target_role": "Public / Citizens",
        "what_it_is_for": (
            "The Civic News feed delivers real-time official municipal announcements, public hearing advisories, newly ratified "
            "ordinance notices, and executive orders directly to the public, preventing misinformation."
        ),
        "pins": [
            (1, 337, 140),
            (2, 337, 330),
            (3, 362, 355),
            (4, 362, 431)
        ],
        "controls": [
            ("Official LGU Public Authority Badge", "Authoritative badge verifying that published advisories originate from authenticated Sangguniang Panlungsod and City Mayor desks."),
            ("Official Executive Advisory Card", "Card container housing publication details, category classification tag, and headline for prominent municipal updates."),
            ("Publication Date & Civic Category Badge", "Attribution banner showing official posting date, sponsoring barangay or department, and functional category."),
            ("Executive Directive Content Narrative", "Detailed body narrative of the advisory providing directives, compliance deadlines, implementation procedures, and public instructions.")
        ]
    },
    {
        "figure_num": "Figure C-10",
        "section_name": "Barangay Governance Console",
        "title": "Barangay Executive Governance Dashboard",
        "orig_subpath": "barangay_admin/barangay_01_dashboard.png",
        "out_filename": "fig_c10_barangay_dashboard.png",
        "target_role": "Barangay Captains / Barangay Administrators",
        "what_it_is_for": (
            "The Barangay Executive Dashboard provides local village officials with a real-time operational overview of their "
            "community's legislative output, pending city approvals, and resident grievances."
        ),
        "pins": [
            (1, 1350, 171),
            (2, 305, 322),
            (3, 629, 322),
            (4, 953, 322)
        ],
        "controls": [
            ("Submit New Ordinance Quick Action Button", "Primary call-to-action button launching the digital ordinance registration and drafting workflow for local council measures."),
            ("Local Enacted Ordinances Metric Card", "Real-time KPI card tracking the total count of officially enacted and codified barangay ordinances."),
            ("Pending Legislative Proposals Metric Card", "Status metric card highlighting legislative drafts currently submitted to the Sangguniang Panlungsod for legal review."),
            ("Active Community Incident Reports Metric Card", "Actionable alert card displaying the count of open resident grievances requiring barangay officer inspection and resolution.")
        ]
    },
    {
        "figure_num": "Figure C-11",
        "section_name": "Barangay Legislative Operations",
        "title": "Barangay Ordinance Management & Status Tracking Roster",
        "orig_subpath": "barangay_admin/barangay_02_ordinance_management.png",
        "out_filename": "fig_c11_barangay_ordinances.png",
        "target_role": "Barangay Secretaries / Councilors",
        "what_it_is_for": (
            "The Ordinance Management module enables barangay legislative staff to maintain their local resolution records, "
            "monitor transmittal progress with the City Council, and initiate new proposals."
        ),
        "pins": [
            (1, 305, 263),
            (2, 1367, 203),
            (3, 911, 263),
            (4, 306, 326)
        ],
        "controls": [
            ("Legislative Status Filter Tabs", "Segmented filter tabs filtering local ordinances across 'Lahat' (All), 'Pending' (Under Review), 'Approved' (Enacted), 'Draft', and 'Rejected'."),
            ("Create / Propose New Ordinance Action Button", "Primary action button opening the full drafting modal to author a new barangay ordinance proposal."),
            ("Local Ordinance Keyword Search Input", "Text field allowing secretaries to filter internal records instantly by resolution number, title keywords, or author."),
            ("Barangay Ordinance Records Table", "Ledger table listing ordinance number, title, category, enactment date, status badge, and action triggers.")
        ]
    },
    {
        "figure_num": "Figure C-12",
        "section_name": "Barangay Legislative Operations",
        "title": "Barangay Ordinance Proposal & Legislative Drafting Modal",
        "orig_subpath": "barangay_admin/barangay_03_draft_ordinance_modal.png",
        "out_filename": "fig_c12_draft_modal.png",
        "target_role": "Barangay Secretaries / Committee Chairs",
        "what_it_is_for": (
            "This modal provides the formal drafting interface for new barangay legislative measures. Secretaries can manually "
            "enter legislative details or use integrated AI extraction to digitize existing paper ordinances."
        ),
        "pins": [
            (1, 454, 553),
            (2, 454, 725),
            (3, 750, 866),
            (4, 944, 866)
        ],
        "controls": [
            ("Proposed Ordinance Title Input Field", "Mandatory form field capturing the formal statutory title of the proposed barangay measure."),
            ("Legislative Category Dropdown", "Classification dropdown grouping the proposal under municipal functional sectors (e.g., General, Peace & Order, Sanitation)."),
            ("Save as Draft Action Button", "Action button saving active form data into editable draft storage for internal review without transmittal to city hall."),
            ("Submit to LGU for Approval Button", "Primary transmittal CTA validating statutory requirements and submitting the measure to the Sangguniang Panlungsod.")
        ]
    },
    {
        "figure_num": "Figure C-13",
        "section_name": "Barangay Legislative Operations",
        "title": "AI-Powered Ordinance PDF Extraction & Auto-Structuring Suite",
        "orig_subpath": "barangay_admin/barangay_04_ai_extraction_modal.png",
        "out_filename": "fig_c13_ai_extraction.png",
        "target_role": "Barangay Secretaries / Digitization Clerks",
        "what_it_is_for": (
            "Eliminating hours of manual re-typing, the AI Document Extraction tool ingests scanned PDF or image copies of physical "
            "signed barangay resolutions and automatically extracts structured metadata, articles, and penalties."
        ),
        "pins": [
            (1, 484, 274),
            (2, 471, 372)
        ],
        "controls": [
            ("Scanned Document PDF / Image File Dropzone", "Interactive dropzone accepting PDF scans and camera images of signed physical barangay council documents."),
            ("Execute Multimodal AI Parsing Button", "Execution button dispatching uploaded files to Gemini AI for optical character recognition, article extraction, and penalty parsing.")
        ]
    },
    {
        "figure_num": "Figure C-14",
        "section_name": "Barangay Incident Triage & Resolution",
        "title": "Barangay Community Incident Reports & Grievance Ledger",
        "orig_subpath": "barangay_admin/barangay_05_community_reports.png",
        "out_filename": "fig_c14_barangay_reports.png",
        "target_role": "Barangay Peace & Order Officers / Tanods",
        "what_it_is_for": (
            "The Barangay Community Reports ledger centralizes resident grievances filed through the portal. Officers can monitor "
            "incoming complaints, verify complainant details, and assign personnel for field investigation."
        ),
        "pins": [
            (1, 305, 203),
            (2, 306, 266),
            (3, 1424, 321)
        ],
        "controls": [
            ("Status Filter Tabs", "Filter tabs categorizing reports across 'Lahat' (All), 'Bago' (New), 'Inaaksyunan' (In Progress), 'Nalutas' (Resolved), and 'Ibinasura' (Dismissed)."),
            ("Incident Reports Records Table", "Master grievances table showing Reference ID, filing date, incident subject, category, reporter classification, and status."),
            ("Inline Status Triage & Resolution Dropdown Control", "Direct interactive control on each row allowing officers to update status immediately upon taking action.")
        ]
    },
    {
        "figure_num": "Figure C-15",
        "section_name": "Barangay Incident Triage & Resolution",
        "title": "Barangay Incident Triage & Resolution Management",
        "orig_subpath": "barangay_admin/barangay_06_report_triage_modal.png",
        "out_filename": "fig_c15_report_triage.png",
        "target_role": "Barangay Desk Officers / Kagawads",
        "what_it_is_for": (
            "When addressing resident grievances, officers inspect incident specifics, verify whether the report is anonymous, "
            "and record field actions taken by barangay tanods to close out the report."
        ),
        "pins": [
            (1, 306, 307),
            (2, 955, 307),
            (3, 1107, 307),
            (4, 1424, 321)
        ],
        "controls": [
            ("Target Incident Report Record Row", "Focused grievance record row highlighting the specific incident being inspected and triaged."),
            ("Reporter Information & Anonymity Verification", "Verification column displaying the complainant's identity or affirming protected anonymous whistleblower status."),
            ("Current Report Life-Cycle Status Badge", "Visual badge reflecting the current progress of the incident from initial intake through final settlement."),
            ("Official Status Mutation & Triage Dropdown Selector", "Dropdown selector executing status changes and updating the citizen tracking state in real time.")
        ]
    },
    {
        "figure_num": "Figure C-16",
        "section_name": "Barangay Analytical Intelligence",
        "title": "Barangay Legislative Reporting & Volume Analytics",
        "orig_subpath": "barangay_admin/barangay_07_ordinance_reports_analytics.png",
        "out_filename": "fig_c16_barangay_analytics.png",
        "target_role": "Barangay Captains / Council Secretaries",
        "what_it_is_for": (
            "This module aggregates barangay legislative productivity and resident incident patterns into standardized report "
            "summaries ready for council review and annual compliance audits."
        ),
        "pins": [
            (1, 305, 203),
            (2, 742, 203),
            (3, 759, 420)
        ],
        "controls": [
            ("Report Type Structure Selector Card", "Selection panel allowing officials to choose standardized report formats including Ordinance Rosters, Category Digests, and Grievance Summaries."),
            ("Multi-Criteria Filter Parameters Panel", "Parameters panel configuring date horizons, enactment status, and category filters for the report compilation."),
            ("Generate Localized Report Action Button", "Action trigger querying the database and generating a formatted on-screen report preview.")
        ]
    },
    {
        "figure_num": "Figure C-17",
        "section_name": "LGU City-Wide Administration",
        "title": "LGU Executive Governance Dashboard & Legislative Pulse",
        "orig_subpath": "lgu_admin/lgu_01_executive_dashboard.png",
        "out_filename": "fig_c17_lgu_dashboard.png",
        "target_role": "City Mayor / SP Presiding Officer / SuperAdmins",
        "what_it_is_for": (
            "The LGU Executive Governance Dashboard serves as the central command console for city-wide legislative oversight. "
            "City executives can monitor municipal policy enactment rates, review incoming barangay measures, and assess legislative trends."
        ),
        "pins": [
            (1, 305, 123),
            (2, 305, 301),
            (3, 306, 452)
        ],
        "controls": [
            ("City-Wide KPI Cards", "Metric cards tracking aggregate statistics: Total Codified Ordinances, Approved Measures, Pending Review Submissions, Drafts, and Connected Barangays."),
            ("Ordinance Status Life-Cycle Summary Grid", "Consolidated breakdown tracking the flow of legislation through drafting, committee evaluation, mayoral review, and public enactment."),
            ("Recent City-Wide Legislative Activity Log", "Chronological ledger showcasing newly enacted city policies, transmittal dates, and sponsoring officials.")
        ]
    },
    {
        "figure_num": "Figure C-18",
        "section_name": "LGU City-Wide Administration",
        "title": "LGU Central Legislative Repository & City Ordinance Archive",
        "orig_subpath": "lgu_admin/lgu_02_ordinance_repository.png",
        "out_filename": "fig_c18_lgu_repository.png",
        "target_role": "Sangguniang Panlungsod Legal Clerks / SuperAdmins",
        "what_it_is_for": (
            "The LGU Central Repository is the authoritative master database of all enacted municipal legislation in Cabanatuan City. "
            "Administrators manage city-wide enactments, evaluate pending barangay proposals, and codify new measures."
        ),
        "pins": [
            (1, 305, 297),
            (2, 1363, 220),
            (3, 920, 297),
            (4, 306, 360)
        ],
        "controls": [
            ("Accessible Status Filter Tabs with Live Record Counters", "Filter tabs displaying live record tallies across 'Lahat', 'Enacted', 'In Review', and 'Rejected' ordinances."),
            ("Add City Ordinance Action Button", "Primary action button launching the codification workflow for newly enacted Sangguniang Panlungsod city ordinances."),
            ("Instant City Ordinance Repository Search Input", "Search field querying central ordinances by title, resolution number, sponsor, or legal summary."),
            ("City-Wide Ordinance Repository Master Table", "Master ledger displaying ordinance metadata, jurisdiction tags (City vs Barangay), enactment dates, and administrative action menus.")
        ]
    },
    {
        "figure_num": "Figure C-19",
        "section_name": "Legislative Review & Ratification",
        "title": "Legislative Review, Enactment & Official Approval Workflow",
        "orig_subpath": "lgu_admin/lgu_03_review_approve_modal.png",
        "out_filename": "fig_c19_review_approve.png",
        "target_role": "Sangguniang Panlungsod Review Committee / City Council",
        "what_it_is_for": (
            "Under the Local Government Code of 1991 (RA 7160), all barangay ordinances must undergo review by the Sangguniang Panlungsod "
            "to confirm statutory compliance. This modal facilitates the formal approval or return of submitted measures."
        ),
        "pins": [
            (1, 663, 458),
            (2, 887, 538),
            (3, 775, 538)
        ],
        "controls": [
            ("Pending Ordinance Title & Legal Enactment Notice", "Review prompt displaying the title and jurisdiction of the proposed barangay measure undergoing council scrutiny."),
            ("Official Enactment / Approval Action Button ('Aprubahan')", "Approval CTA enacting the measure, updating its status to 'Approved', and publishing it directly to the public legal repository."),
            ("Dismiss Review / Return Button ('Bumalik')", "Action button returning the proposal to the originating barangay with feedback for legislative revision.")
        ]
    },
    {
        "figure_num": "Figure C-20",
        "section_name": "AI-Powered Archival Digitization",
        "title": "LGU Legislative PDF AI Digitization & Ingestion Suite",
        "orig_subpath": "lgu_admin/lgu_04_ai_document_extraction.png",
        "out_filename": "fig_c20_lgu_ai_digitization.png",
        "target_role": "City Legal Codifiers / Archival Staff",
        "what_it_is_for": (
            "To digitize historical municipal records and newly signed council resolutions, the LGU ingestion suite processes multi-page "
            "scanned PDF documents with Gemini Multimodal AI to extract title, articles, sections, and penalties."
        ),
        "pins": [
            (1, 484, 274),
            (2, 471, 372)
        ],
        "controls": [
            ("Official Scanned Resolution Upload Dropzone", "Dropzone accepting high-resolution scans of signed municipal resolutions and certified ordinance documents."),
            ("Multimodal AI Parsing Execution Button", "Trigger initiating AI optical character recognition, article segmentation, and penalty extraction.")
        ]
    },
    {
        "figure_num": "Figure C-21",
        "section_name": "User Administration & Security Governance",
        "title": "Official User Accounts & Role-Based Access Control (RBAC) Management",
        "orig_subpath": "lgu_admin/lgu_05_users_management.png",
        "out_filename": "fig_c21_users_management.png",
        "target_role": "Super Administrators / IT Governance",
        "what_it_is_for": (
            "The User Management console oversees municipal user identities and system credentials. Superadministrators provision official "
            "accounts for city staff and barangay secretaries, assigning granular permissions."
        ),
        "pins": [
            (1, 1376, 203),
            (2, 306, 264),
            (3, 947, 305),
            (4, 1159, 305)
        ],
        "controls": [
            ("Register New Official Action Button ('Magdagdag ng Opisyal')", "Action button opening the account creation modal to provision access for new government personnel."),
            ("Official Directory Table with Security Badges", "Comprehensive roster of registered personnel displaying full name, official email, assigned role, and territory."),
            ("Role-Based Privilege Badges", "Visual badges differentiating Super Administrator accounts from localized Barangay Administrator permissions."),
            ("Assigned Territorial Barangay Jurisdiction Tag", "Scope tag specifying which of the 89 barangays the official is authorized to administer.")
        ]
    },
    {
        "figure_num": "Figure C-22",
        "section_name": "Barangay Accreditation & Directory Oversight",
        "title": "89-Barangay Municipal Directory & Accreditation Roster",
        "orig_subpath": "lgu_admin/lgu_06_barangays_directory.png",
        "out_filename": "fig_c22_barangays_directory.png",
        "target_role": "LGU Executive Staff / DILG Officers",
        "what_it_is_for": (
            "The Barangay Directory maintains authoritative records for all 89 political subdivisions of Cabanatuan City. "
            "Administrators manage hall contact information, track active officials, and monitor village onboarding."
        ),
        "pins": [
            (1, 305, 203),
            (2, 322, 350),
            (3, 1296, 350),
            (4, 306, 434)
        ],
        "controls": [
            ("Barangay Participation & Onboarding Indicators", "Status banner summarizing onboarding progress and active portal connectivity across city barangays."),
            ("Barangay Search & Filter Input Field", "Search filter allowing officers to look up any barangay by name, district zone, or contact person."),
            ("Register New Barangay Action Button", "Action button registering a newly accredited barangay or modifying jurisdictional boundaries."),
            ("Barangay Directory Table with Ordinance & Report Counts", "Master directory table displaying barangay names, enacted local ordinances, open reports, and contact info.")
        ]
    },
    {
        "figure_num": "Figure C-23",
        "section_name": "City-Wide Grievance Monitoring",
        "title": "City-wide Civic Incident Monitoring & Cross-Barangay Oversight",
        "orig_subpath": "lgu_admin/lgu_07_city_reports_monitoring.png",
        "out_filename": "fig_c23_city_reports.png",
        "target_role": "City Mayor's Action Center / CDRRMO / SuperAdmins",
        "what_it_is_for": (
            "This monitoring desk provides city leadership with cross-jurisdictional visibility over all resident grievances filed "
            "across the 89 barangays, identifying systemic issues requiring city intervention."
        ),
        "pins": [
            (1, 305, 203),
            (2, 306, 266),
            (3, 538, 307),
            (4, 1237, 307)
        ],
        "controls": [
            ("Resolution Status Filter Tabs", "Filter tabs categorizing city grievances across 'Lahat', 'Bago', 'Inaaksyunan', 'Nalutas', and 'Ibinasura'."),
            ("Consolidated City-Wide Incident Records Table", "Comprehensive table tracking complaint tracking numbers, filing timestamps, categories, and assigned barangays."),
            ("Originating Barangay Jurisdiction Identification", "Jurisdiction column identifying the exact local village where the reported community incident occurred."),
            ("Current Operational Resolution Status Badge", "Status badge reflecting whether the local barangay has initiated investigation or resolved the resident complaint.")
        ]
    },
    {
        "figure_num": "Figure C-24",
        "section_name": "Civic News & Public Communications Management",
        "title": "City News Publishing & Public Advisory Broadcast Console",
        "orig_subpath": "lgu_admin/lgu_08_news_publishing.png",
        "out_filename": "fig_c24_news_publishing.png",
        "target_role": "City Public Information Office (PIO) / SuperAdmins",
        "what_it_is_for": (
            "The News Publishing console provides the City Public Information Office (PIO) with a centralized desk to compose "
            "and publish official public advisories, notices of newly enacted legislation, and emergency guidelines."
        ),
        "pins": [
            (1, 1384, 203),
            (2, 330, 272),
            (3, 1386, 321)
        ],
        "controls": [
            ("Publish New Advisory Action Button ('+ Magdagdag ng Anunsyo')", "Primary call-to-action button opening the advisory drafting form to publish an official municipal announcement."),
            ("Published Public News & Advisories Table", "Archive table listing all published public announcements, publication timestamps, and authoring offices."),
            ("Advisory Management Controls", "Action triggers allowing PIO officers to edit broadcast text, manage active status, or unpublish outdated notices.")
        ]
    },
    {
        "figure_num": "Figure C-25",
        "section_name": "Legislative Reporting & Certified PDF Generation",
        "title": "Official Legislative PDF Report Generator & Export Engine",
        "orig_subpath": "lgu_admin/lgu_09_legislative_report_generator.png",
        "out_filename": "fig_c25_report_generator.png",
        "target_role": "Sangguniang Panlungsod Secretariat / Legal Researchers",
        "what_it_is_for": (
            "The Legislative Report Generator compiles comprehensive, certified municipal reports. Officials can generate "
            "legislative summaries, compliance digests, or category breakdowns and export them as formal PDF documents."
        ),
        "pins": [
            (1, 305, 203),
            (2, 742, 203),
            (3, 759, 496),
            (4, 1361, 686)
        ],
        "controls": [
            ("Legislative Report Structure Selector Card", "Selection card allowing administrators to choose from 8 standardized report structures (e.g., List of All Ordinances, Ordinances by Month, Ordinances by Category)."),
            ("Multi-Criteria Filter Parameters Panel", "Configuration panel setting year, date range, status, category, and barangay origin parameters for compilation."),
            ("Execute Report Generation Action Button", "Execution trigger querying the database and generating an on-screen preview of the compiled legislative report."),
            ("Export Formal PDF Document Action Button ('I-download bilang PDF')", "Action button generating and downloading the certified, print-ready PDF legislative report with official letterhead.")
        ]
    },
    {
        "figure_num": "Figure C-26",
        "section_name": "Legislative Analytics & Visual Intelligence",
        "title": "Legislative Analytics, Category Breakdown & Compliance Charts",
        "orig_subpath": "lgu_admin/lgu_10_analytics_charts.png",
        "out_filename": "fig_c26_analytics_charts.png",
        "target_role": "City Mayor / SP Committee on Laws / SuperAdmins",
        "what_it_is_for": (
            "The Legislative Analytics suite provides interactive visual intelligence on municipal policy trends. Executives examine "
            "category frequency, approval ratios, and village submission rankings to inform future policy development."
        ),
        "pins": [
            (1, 1428, 141),
            (2, 305, 229),
            (3, 305, 371),
            (4, 1174, 371)
        ],
        "controls": [
            ("Legislative Year Filter Dropdown Selector", "Dropdown menu filtering analytical datasets and charts by calendar or legislative year."),
            ("Executive Key Performance Indicators Summary Banner", "Summary banner tracking city-wide legislative output, enactment velocity, and barangay participation metrics."),
            ("Policy Category Distribution Breakdown Chart", "Interactive bar chart visualizing the frequency of enacted ordinances across civic policy categories."),
            ("Legislative Status Breakdown Distribution Chart", "Donut/pie chart illustrating the proportion of enacted ordinances versus pending proposals and rejected measures.")
        ]
    }
]

# ==============================================================================
# DOCX Helper Functions (Academic Formatting matching sample)
# ==============================================================================

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set padding in twips (1/20 of a pt)."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, fill_hex):
    """Set cell background shading."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    """Apply clean thin borders to table."""
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>\n'
            f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

def make_row_cant_split(row):
    """Prevent table row from splitting across a page boundary."""
    trPr = row._element.get_or_add_trPr()
    trPr.append(OxmlElement('w:cantSplit'))

def set_header_row(row):
    """Repeat header row if table splits across pages."""
    trPr = row._element.get_or_add_trPr()
    trPr.append(OxmlElement('w:tblHeader'))

def add_academic_paragraph(doc, text, bold=False, italic=False, size_pt=12, indent=True, space_after=6):
    """Add a body paragraph styled in Times New Roman with 0.5-inch indent."""
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(space_after)
    if indent:
        p.paragraph_format.first_line_indent = Inches(0.5)
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(15, 23, 42)
    return p

def main():
    print("=======================================================")
    print("  📘 CAPSTONE APPENDIX C USER MANUAL GENERATOR")
    print("  Modeled after reference capstone structure & format")
    print("=======================================================\n")

    # 1. Render all 26 Capstone Figures
    print("--- STEP 1: Rendering All 26 Academic Figure Images ---")
    generated_figures = []
    for item in FIGURES_DATA:
        f_num = item["figure_num"]
        f_title = item["title"]
        orig = item["orig_subpath"]
        out_fn = item["out_filename"]
        pins = item["pins"]

        img_path = create_capstone_figure_image(orig, f_num, f_title, pins, out_fn)
        if img_path:
            generated_figures.append((item, img_path))
            print(f"  ✓ {f_num}: {f_title} -> {out_fn}")
        else:
            print(f"  ⚠️ Failed to generate image for {f_num}")

    print(f"\n[OK] Successfully rendered {len(generated_figures)} capstone figure images!\n")

    # 2. Build Word Document
    print("--- STEP 2: Assembling Academic Word Document (.docx) ---")
    doc = Document()

    # Set 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

        # Header with page number
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("APPENDIX C: USER MANUAL")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(9)
        hrun.font.color.rgb = RGBColor(148, 163, 184)

    # Main Appendix Title (matching sample P1)
    p_app = doc.add_paragraph()
    p_app.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_app.paragraph_format.space_before = Pt(0)
    p_app.paragraph_format.space_after = Pt(4)
    run_app = p_app.add_run("APPENDIX C")
    run_app.font.name = "Times New Roman"
    run_app.font.size = Pt(14)
    run_app.bold = True

    p_man = doc.add_paragraph()
    p_man.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_man.paragraph_format.space_after = Pt(4)
    run_man = p_man.add_run("User Manual")
    run_man.font.name = "Times New Roman"
    run_man.font.size = Pt(13)
    run_man.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    run_sub = p_sub.add_run("Cabanatuan City Ordinance & Legislative Portal")
    run_sub.font.name = "Times New Roman"
    run_sub.font.size = Pt(11)
    run_sub.italic = True
    run_sub.font.color.rgb = RGBColor(71, 85, 105)

    # Iterate through all 26 figures
    current_section = None
    for fig_data, img_path in generated_figures:
        sec_name = fig_data["section_name"]
        f_num = fig_data["figure_num"]
        f_title = fig_data["title"]
        what_it_is_for = fig_data["what_it_is_for"]
        controls = fig_data["controls"]

        # Section Heading if changed
        if sec_name != current_section:
            current_section = sec_name
            p_sec = doc.add_paragraph()
            p_sec.paragraph_format.space_before = Pt(18)
            p_sec.paragraph_format.space_after = Pt(4)
            p_sec.paragraph_format.keep_with_next = True
            run_sec = p_sec.add_run(sec_name)
            run_sec.font.name = "Times New Roman"
            run_sec.font.size = Pt(13)
            run_sec.bold = True
            run_sec.font.color.rgb = RGBColor(15, 23, 42)

        # Subsection Heading
        p_subhead = doc.add_paragraph()
        p_subhead.paragraph_format.space_before = Pt(8)
        p_subhead.paragraph_format.space_after = Pt(4)
        p_subhead.paragraph_format.keep_with_next = True
        run_subhead = p_subhead.add_run(f"What the {f_title} Is For")
        run_subhead.font.name = "Times New Roman"
        run_subhead.font.size = Pt(12)
        run_subhead.bold = True
        run_subhead.italic = True

        # Narrative description (0.5 inch indent)
        add_academic_paragraph(doc, what_it_is_for, indent=True, space_after=8)

        # Figure Caption (matching sample)
        p_fig = doc.add_paragraph()
        p_fig.paragraph_format.space_before = Pt(6)
        p_fig.paragraph_format.space_after = Pt(2)
        p_fig.paragraph_format.keep_with_next = True
        r_fnum = p_fig.add_run(f"{f_num}.\n")
        r_fnum.font.name = "Times New Roman"
        r_fnum.font.size = Pt(11)
        r_fnum.bold = True

        r_ftitle = p_fig.add_run(f"{f_title}")
        r_ftitle.font.name = "Times New Roman"
        r_ftitle.font.size = Pt(11)
        r_ftitle.italic = True

        # Figure Image (Full printable width 6.5 inches)
        p_img = doc.add_paragraph()
        p_img.paragraph_format.space_before = Pt(4)
        p_img.paragraph_format.space_after = Pt(8)
        p_img.paragraph_format.keep_with_next = True
        run_img = p_img.add_run()
        run_img.add_picture(str(img_path), width=Inches(6.5))

        # Technical Description Table (matching sample format: No. | Field, Control, or Area — Detailed Technical Description)
        table = doc.add_table(rows=1, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        set_table_borders(table, color="CBD5E1", sz="4")

        # Column widths: Col 1 = 0.45 in, Col 2 = 6.05 in (Total = 6.5 in)
        col_widths = [Inches(0.45), Inches(6.05)]

        # Header Row
        hdr_row = table.rows[0]
        set_header_row(hdr_row)
        make_row_cant_split(hdr_row)

        hdr_cells = hdr_row.cells
        hdr_cells[0].width = col_widths[0]
        hdr_cells[1].width = col_widths[1]

        set_cell_background(hdr_cells[0], "F1F5F9")
        set_cell_background(hdr_cells[1], "F1F5F9")
        set_cell_margins(hdr_cells[0], top=120, bottom=120, left=100, right=100)
        set_cell_margins(hdr_cells[1], top=120, bottom=120, left=140, right=140)

        p_h0 = hdr_cells[0].paragraphs[0]
        p_h0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        rh0 = p_h0.add_run("No.")
        rh0.font.name = "Times New Roman"
        rh0.font.size = Pt(11)
        rh0.bold = True

        p_h1 = hdr_cells[1].paragraphs[0]
        rh1 = p_h1.add_run("Field, Control, or Area — Detailed Technical Description")
        rh1.font.name = "Times New Roman"
        rh1.font.size = Pt(11)
        rh1.bold = True

        # Data Rows
        for num, (ctrl_name, ctrl_desc) in enumerate(controls, start=1):
            row = table.add_row()
            make_row_cant_split(row)
            cells = row.cells
            cells[0].width = col_widths[0]
            cells[1].width = col_widths[1]

            set_cell_margins(cells[0], top=100, bottom=100, left=100, right=100)
            set_cell_margins(cells[1], top=100, bottom=100, left=140, right=140)

            # Col 1: Number (Centered)
            p0 = cells[0].paragraphs[0]
            p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p0.paragraph_format.space_before = Pt(2)
            p0.paragraph_format.space_after = Pt(2)
            r0 = p0.add_run(str(num))
            r0.font.name = "Times New Roman"
            r0.font.size = Pt(11)
            r0.bold = True

            # Col 2: Name — Description
            p1 = cells[1].paragraphs[0]
            p1.paragraph_format.line_spacing = 1.15
            p1.paragraph_format.space_before = Pt(2)
            p1.paragraph_format.space_after = Pt(2)

            r_name = p1.add_run(f"{ctrl_name} — ")
            r_name.font.name = "Times New Roman"
            r_name.font.size = Pt(11)
            r_name.bold = True

            r_desc = p1.add_run(ctrl_desc)
            r_desc.font.name = "Times New Roman"
            r_desc.font.size = Pt(11)

        # Space after table
        p_spacer = doc.add_paragraph()
        p_spacer.paragraph_format.space_before = Pt(0)
        p_spacer.paragraph_format.space_after = Pt(12)

    # ==========================================================================
    # Master Summary Checklist of All User Manual Figures (matching sample P43-P46)
    # ==========================================================================
    p_chk_title = doc.add_paragraph()
    p_chk_title.paragraph_format.space_before = Pt(24)
    p_chk_title.paragraph_format.space_after = Pt(6)
    p_chk_title.paragraph_format.keep_with_next = True
    r_chkt = p_chk_title.add_run("Summary Checklist of All User Manual Figures")
    r_chkt.font.name = "Times New Roman"
    r_chkt.font.size = Pt(13)
    r_chkt.bold = True

    add_academic_paragraph(
        doc,
        "The following master index summarizes all twenty-six (26) user manual figures documented in Appendix C, "
        "including their target user roles and primary functional components:",
        indent=True,
        space_after=10
    )

    chk_table = doc.add_table(rows=1, cols=4)
    chk_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    chk_table.autofit = False
    set_table_borders(chk_table, color="CBD5E1", sz="4")

    # Column widths: 0.9 in, 2.1 in, 1.3 in, 2.2 in (Total = 6.5 in)
    chk_col_widths = [Inches(0.9), Inches(2.1), Inches(1.3), Inches(2.2)]

    chk_hdr = chk_table.rows[0]
    set_header_row(chk_hdr)
    make_row_cant_split(chk_hdr)

    chk_hdr_titles = ["Figure Number", "Document Section & Form Name", "Primary Target Role", "Key Components Covered"]
    for i, c in enumerate(chk_hdr.cells):
        c.width = chk_col_widths[i]
        set_cell_background(c, "F1F5F9")
        set_cell_margins(c, top=120, bottom=120, left=100, right=100)
        p = c.paragraphs[0]
        if i == 0:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(chk_hdr_titles[i])
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)
        r.bold = True

    for item in FIGURES_DATA:
        f_num = item["figure_num"]
        f_title = item["title"]
        f_role = item["target_role"]
        # Summarize key components
        components_summary = ", ".join([c[0].replace(" Input Field", "").replace(" Action Button", "").replace(" Dropdown", "") for c in item["controls"][:4]])

        row = chk_table.add_row()
        make_row_cant_split(row)
        for i, c in enumerate(row.cells):
            c.width = chk_col_widths[i]
            set_cell_margins(c, top=90, bottom=90, left=90, right=90)
            p = c.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)

            if i == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                r = p.add_run(f_num)
                r.bold = True
            elif i == 1:
                r = p.add_run(f_title)
            elif i == 2:
                r = p.add_run(f_role)
            else:
                r = p.add_run(components_summary)

            r.font.name = "Times New Roman"
            r.font.size = Pt(9.5)

    doc.save(DOCX_OUTPUT_PATH)
    docx_size = os.path.getsize(DOCX_OUTPUT_PATH)
    print(f"\n[OK] Document successfully generated: {DOCX_OUTPUT_PATH}")
    print(f"File size: {docx_size:,} bytes")

    # 3. Convert to PDF using PowerShell COM script
    print("\n--- STEP 3: Converting to PDF via Microsoft Word COM ---")
    ps_script = BASE_DIR / "scripts" / "convert_to_pdf.ps1"
    try:
        res = subprocess.run(
            ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(ps_script), "-DocxPath", str(DOCX_OUTPUT_PATH), "-PdfPath", str(PDF_OUTPUT_PATH)],
            capture_output=True,
            text=True,
            check=True
        )
        print(res.stdout)
        if PDF_OUTPUT_PATH.exists():
            pdf_size = os.path.getsize(PDF_OUTPUT_PATH)
            print(f"[OK] PDF successfully generated: {PDF_OUTPUT_PATH} ({pdf_size:,} bytes)")
    except Exception as e:
        print(f"[!] Warning: PDF conversion error: {e}")

if __name__ == "__main__":
    main()
