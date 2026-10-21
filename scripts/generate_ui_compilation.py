#!/usr/bin/env python3
"""
System UI Screenshot Compilation & Wireframe Reference Generator
Cabanatuan City Ordinance & Legislative Portal

Generates:
1. Curated standalone high-resolution screenshots for core routes.
2. Composite multi-screen overview boards (Master All-in-One, Citizen, Admin).
3. Multi-page Wireframe Reference PDF (1 page per key screen with layout specs).
4. Interactive HTML Viewer with copy-paste ChatGPT prompt integration.
5. Markdown Cheat Sheet with prompts for ChatGPT wireframing.
"""

import os
import sys
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Set root directory
ROOT_DIR = Path(__file__).resolve().parent.parent
SOURCE_ORIG_DIR = ROOT_DIR / "docs" / "user_manual" / "screenshots" / "original"
OUTPUT_DIR = ROOT_DIR / "docs" / "screenshot_compilation"
SCREENS_DIR = OUTPUT_DIR / "screens"
BOARDS_DIR = OUTPUT_DIR / "boards"

for d in [OUTPUT_DIR, SCREENS_DIR, BOARDS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Font discovery
FONT_PATH = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BOLD_PATH = r"C:\Windows\Fonts\segoeuib.ttf"
if not os.path.exists(FONT_PATH):
    FONT_PATH = r"C:\Windows\Fonts\arial.ttf"
if not os.path.exists(FONT_BOLD_PATH):
    FONT_BOLD_PATH = r"C:\Windows\Fonts\arialbd.ttf"

def get_font(size, bold=False):
    p = FONT_BOLD_PATH if bold else FONT_PATH
    try:
        return ImageFont.truetype(p, size)
    except Exception:
        return ImageFont.load_default()

# 14 Essential System Screens Definition
SCREENS = [
    {
        "id": "01",
        "title": "Public Citizen Portal - Homepage & Hero",
        "role": "Citizen & Public",
        "role_badge_bg": (2, 132, 199),  # Sky blue
        "route": "/",
        "filename": "01_Citizen_Homepage_Hero.png",
        "source": SOURCE_ORIG_DIR / "common" / "common_01_homepage_hero.png",
        "category": "citizen",
        "summary": "Public landing portal with search gateway, fast statistics, feature cards, and direct links to ordinances, news, and incident reporting.",
        "components": [
            "Top Navbar: Brand logo, navigation links, theme toggle, and Sign In action",
            "Hero Section: Search bar with instant autocomplete and scope selector",
            "Metrics Strip: Total ordinances, active barangays, and resolved incidents",
            "Navigation Feature Cards: Ordinance Explorer, AI Chatbot, Community Reports, Civic News",
            "Public Footer: LGU contact details, transparency seal, and legal notices"
        ]
    },
    {
        "id": "02",
        "title": "System Authentication & Role Sign-In",
        "role": "Universal Access",
        "role_badge_bg": (100, 116, 139),  # Slate
        "route": "/login",
        "filename": "02_Auth_Login_Modal.png",
        "source": SOURCE_ORIG_DIR / "common" / "common_02_login_page.png",
        "category": "common",
        "summary": "Secure authentication card modal supporting role-based sign in for citizens, barangay officials, and city administrators.",
        "components": [
            "Modal Backdrop: Dimmed focus overlay with close action",
            "Card Header: Cabanatuan official seal, portal title, and sign-in instructions",
            "Role Selector / Segmented Tabs: Citizen, Barangay Official, City Admin",
            "Input Form: Email address, password field with visibility toggle",
            "Action Buttons: Primary 'Sign In' CTA and 'Forgot Password' recovery link"
        ]
    },
    {
        "id": "03",
        "title": "Public Ordinance Explorer & Filter Engine",
        "role": "Citizen & Public",
        "role_badge_bg": (2, 132, 199),
        "route": "/ordinances",
        "filename": "03_Citizen_Ordinance_Explorer.png",
        "source": SOURCE_ORIG_DIR / "citizen" / "citizen_01_ordinance_explorer.png",
        "category": "citizen",
        "summary": "Central public repository with faceted category filtering, keyword search, status tags, and paginated ordinance cards.",
        "components": [
            "Filter Bar: Keyword search input, category pills (Traffic, Health, Zoning, Safety)",
            "Sorting Controls: Sort by enactment date, ordinance number, or relevance",
            "Ordinance Card Grid: Number badge, title, enactment date, executive summary, category tags",
            "Quick Actions: 'Read Provisions' button and 'Download PDF' quick icon",
            "Pagination Bar: Page number indicators, previous/next controls, and count summary"
        ]
    },
    {
        "id": "04",
        "title": "Ordinance Document Reader & Provisions",
        "role": "Citizen & Public",
        "role_badge_bg": (2, 132, 199),
        "route": "/ordinances/[slug]",
        "filename": "04_Citizen_Ordinance_Detail.png",
        "source": SOURCE_ORIG_DIR / "citizen" / "citizen_02_ordinance_detail.png",
        "category": "citizen",
        "summary": "Detailed legal document reader showcasing ordinance metadata, section-by-section provisions, sanctions, and PDF viewer access.",
        "components": [
            "Breadcrumb Trail: Home > Ordinances > Ordinance Detail",
            "Metadata Banner: Ordinance number, author/sponsor, date approved, effectivity date",
            "Executive Summary Box: Key takeaways in plain language for public comprehension",
            "Provisions Content Body: Structured legal sections, articles, and definitions",
            "Sanctions & Penalties Alert: Highlighted violations and corresponding penalties box",
            "Action Floating Bar: View Original PDF, Print, and Share document"
        ]
    },
    {
        "id": "05",
        "title": "AI Legislative Assistant & Citation Chatbot",
        "role": "Citizen & Public",
        "role_badge_bg": (2, 132, 199),
        "route": "/chatbot",
        "filename": "05_Citizen_AI_Legislative_Assistant.png",
        "source": SOURCE_ORIG_DIR / "citizen" / "citizen_04_ai_assistant.png",
        "category": "citizen",
        "summary": "Retrieval-Augmented Generation (RAG) conversational legal assistant providing cited answers referencing verified city ordinances.",
        "components": [
            "Chat Stream: Chronological conversation message bubbles (User & AI)",
            "Citation Pill Badges: Clickable ordinance reference links citing exact section numbers",
            "Quick Suggestion Chips: Preset FAQ prompts (e.g. curfew hours, noise regulations, tricycle fares)",
            "Input Bar: Multi-line text query input, send button, and disclaimer badge",
            "Legal Disclaimer: Automated AI assistance notice advising confirmation with official texts"
        ]
    },
    {
        "id": "06",
        "title": "Citizen Incident & Violation Report Form",
        "role": "Citizen & Public",
        "role_badge_bg": (2, 132, 199),
        "route": "/report",
        "filename": "06_Citizen_Incident_Report_Form.png",
        "source": SOURCE_ORIG_DIR / "citizen" / "citizen_05_community_report_form.png",
        "category": "citizen",
        "summary": "Community incident and violation submission interface with photo uploader, barangay tagging, geolocation, and anonymous toggle.",
        "components": [
            "Header Card: Purpose description and community reporting guidelines",
            "Category Dropdown: Violation type (e.g., Illegal Parking, Noise Curfew, Waste Disposal)",
            "Location Selectors: Specific Barangay selector and street/landmark input field",
            "Incident Narrative: Detailed description textarea",
            "Evidence Attachment Area: Drag-and-drop photo uploader with preview thumbnails",
            "Privacy Control: Anonymous submission toggle switch to protect citizen identity",
            "Submit CTA: Primary 'Submit Incident Report' button with verification notice"
        ]
    },
    {
        "id": "07",
        "title": "Civic News & Announcements Bulletin",
        "role": "Citizen & Public",
        "role_badge_bg": (2, 132, 199),
        "route": "/news",
        "filename": "07_Citizen_Civic_News.png",
        "source": SOURCE_ORIG_DIR / "citizen" / "citizen_07_civic_news.png",
        "category": "citizen",
        "summary": "Public civic updates bulletin featuring official announcements, public hearing notices, and executive community orders.",
        "components": [
            "Featured Spotlight Card: Hero banner for high-priority city announcements",
            "Filter Pills: All, Public Hearings, Advisory, Community Notices, Traffic Updates",
            "News Cards Grid: 3-column card layout with thumbnail image, date badge, title, excerpt",
            "Article Footer: Read More button, sharing links, and author attribution"
        ]
    },
    {
        "id": "08",
        "title": "Barangay Admin - Operational Dashboard",
        "role": "Barangay Admin",
        "role_badge_bg": (5, 150, 105),  # Emerald green
        "route": "/admin/barangay",
        "filename": "08_Barangay_Admin_Dashboard.png",
        "source": SOURCE_ORIG_DIR / "barangay_admin" / "barangay_01_dashboard.png",
        "category": "barangay",
        "summary": "Operational home for barangay officials with KPI summary statistics, pending review queues, and recent community incident tickets.",
        "components": [
            "Sidebar Navigation: Dashboard, Ordinances, Community Reports, Analytics, Settings",
            "Header Bar: Barangay identifier badge, quick notifications, user profile menu",
            "KPI Metric Cards: Total Local Ordinances, Active Community Reports, Pending LGU Submissions, Resolution Rate",
            "Recent Activity Feed: Chronological log of recent ordinance drafts and status changes",
            "Pending Incident Queue: Quick-access table of urgent citizen reports awaiting triage"
        ]
    },
    {
        "id": "09",
        "title": "Barangay Admin - Ordinance Registry & Drafting",
        "role": "Barangay Admin",
        "role_badge_bg": (5, 150, 105),
        "route": "/admin/barangay/ordinances",
        "filename": "09_Barangay_Ordinance_Management.png",
        "source": SOURCE_ORIG_DIR / "barangay_admin" / "barangay_02_ordinance_management.png",
        "category": "barangay",
        "summary": "Barangay ordinance registry interface with status filters (Draft, Submitted, Enacted) and new draft ordinance creation action.",
        "components": [
            "Action Toolbar: Search input, status filter tabs (All, Draft, Submitted to LGU, Enacted)",
            "Primary CTA: '+ Draft New Ordinance' modal launcher button",
            "Registry Table: Columns for Ordinance No., Title, Category, Submission Date, Workflow Status Badge",
            "Row Actions: Edit draft, upload PDF document, submit to City LGU review, delete draft",
            "Table Pagination: Page selector and row count summary"
        ]
    },
    {
        "id": "10",
        "title": "Barangay Admin - Incident Triage & Resolution Modal",
        "role": "Barangay Admin",
        "role_badge_bg": (5, 150, 105),
        "route": "/admin/barangay/reports (modal)",
        "filename": "10_Barangay_Incident_Triage.png",
        "source": SOURCE_ORIG_DIR / "barangay_admin" / "barangay_06_report_triage_modal.png",
        "category": "barangay",
        "summary": "Detailed triage modal allowing barangay officials to inspect citizen reports, review photo evidence, and update verification status.",
        "components": [
            "Modal Dialog: Focused popup over blurred admin table background",
            "Report Header: Ticket ID, submission timestamp, and reporter contact (or 'Anonymous')",
            "Evidence Viewer: Full photo evidence preview with zoom capability",
            "Status Selector: Radio / dropdown (Pending, Under Investigation, Resolved, Dismissed)",
            "Official Notes: Officer inspection remarks and action taken textarea",
            "Action CTAs: 'Save Status Update' button and 'Close' button"
        ]
    },
    {
        "id": "11",
        "title": "LGU City Admin - Executive Oversight Dashboard",
        "role": "City LGU Admin",
        "role_badge_bg": (124, 58, 237),  # Purple
        "route": "/admin/lgu",
        "filename": "11_LGU_Executive_Dashboard.png",
        "source": SOURCE_ORIG_DIR / "lgu_admin" / "lgu_01_executive_dashboard.png",
        "category": "lgu",
        "summary": "City-wide executive console displaying high-level legislative metrics, pending barangay ordinance approvals, and city incident trends.",
        "components": [
            "Admin Sidebar: Executive Dashboard, Ordinance Repository, Review Workflow, User Management, Barangays, Reports, News, Analytics",
            "Executive KPI Strip: Total City Ordinances, Registered Barangays, Pending Legislative Reviews, Total Community Incidents",
            "Legislative Review Urgent Queue: High-priority table of ordinances awaiting City Council action",
            "Barangay Submission Activity: Quick-glance status indicators across all city districts"
        ]
    },
    {
        "id": "12",
        "title": "LGU City Admin - Legislative Review & Approval Modal",
        "role": "City LGU Admin",
        "role_badge_bg": (124, 58, 237),
        "route": "/admin/lgu/ordinances (modal)",
        "filename": "12_LGU_Ordinance_Review_Approval.png",
        "source": SOURCE_ORIG_DIR / "lgu_admin" / "lgu_03_review_approve_modal.png",
        "category": "lgu",
        "summary": "Official legislative review modal for Sangguniang Panlungsod approval, compliance validation, and revision request feedback.",
        "components": [
            "Modal Header: Draft Ordinance title, originating barangay, and submission date",
            "Document Preview: Legal provisions summary and AI-extracted compliance parameters",
            "Council Review Remarks: Rich text feedback box for revision notes or commendations",
            "Approval Action Bar: 'Approve & Enact' (Success), 'Request Revisions' (Warning), 'Reject' (Danger), 'Cancel'"
        ]
    },
    {
        "id": "13",
        "title": "LGU City Admin - City-wide Reports & Incident Monitoring",
        "role": "City LGU Admin",
        "role_badge_bg": (124, 58, 237),
        "route": "/admin/lgu/reports",
        "filename": "13_LGU_City_Reports_Monitoring.png",
        "source": SOURCE_ORIG_DIR / "lgu_admin" / "lgu_07_city_reports_monitoring.png",
        "category": "lgu",
        "summary": "City-wide monitoring system aggregating reports from all 89 barangays with multi-level filtering and status tracking.",
        "components": [
            "Filter Controls: Barangay district dropdown, category selector, date range picker, and resolution status tabs",
            "Summary Metric Badges: Open Incidents, Under Investigation, Resolved, Average Resolution Time",
            "Master Incidents Table: Ticket ID, Date, Barangay, Category, Description Excerpt, Current Status Badge, Action View Button",
            "Export Tools: Export to CSV / PDF report buttons"
        ]
    },
    {
        "id": "14",
        "title": "LGU City Admin - Legislative Analytics & Trends",
        "role": "City LGU Admin",
        "role_badge_bg": (124, 58, 237),
        "route": "/admin/lgu/analytics",
        "filename": "14_LGU_Legislative_Analytics.png",
        "source": SOURCE_ORIG_DIR / "lgu_admin" / "lgu_10_analytics_charts.png",
        "category": "lgu",
        "summary": "Interactive analytics dashboard visualizing ordinance enactments, category distributions, and community resolution performance.",
        "components": [
            "Date Range Filter: Predefined presets (Last 30 Days, 6 Months, Year-to-Date, All Time)",
            "Summary Stat Cards: Enacted Ordinances, Citizen Report Resolution Rate, Active AI Queries",
            "Chart 1 (Bar/Line): Monthly Ordinance Enactment and Submission Trends",
            "Chart 2 (Donut/Pie): Legislative Distribution by Category (Traffic, Sanitation, Safety, Governance)",
            "Chart 3 (Comparative): Barangay Activity & Incident Resolution Rate Comparison",
            "Export Toolbar: Download high-res chart image or raw data dataset"
        ]
    }
]

print(f"Total curated screens to process: {len(SCREENS)}")

# Step 1: Copy clean curated screenshots
for sc in SCREENS:
    src = sc["source"]
    dst = SCREENS_DIR / sc["filename"]
    if src.exists():
        shutil.copy2(src, dst)
        print(f"  [OK] Copied {sc['filename']} ({os.path.getsize(dst)} bytes)")
    else:
        print(f"  [WARN] Source not found: {src}")

# Step 2: Build Composite Boards using PIL
def build_composite_board(board_screens, cols, title_text, subtitle_text, out_filename):
    """
    Renders an ultra-clean composite image containing framed screenshots
    with role badges, titles, and wireframe element breakdowns.
    """
    rows = (len(board_screens) + cols - 1) // cols
    
    # Thumbnail resolution
    thumb_w = 920
    thumb_h = int(thumb_w * (960 / 1600))  # 552 px
    
    card_header_h = 56
    card_footer_h = 44
    card_h = card_header_h + thumb_h + card_footer_h
    card_w = thumb_w
    
    pad_x = 36
    pad_y = 36
    top_header_h = 130
    
    board_w = pad_x * 2 + cols * card_w + (cols - 1) * pad_x
    board_h = top_header_h + rows * card_h + (rows - 1) * pad_y + pad_y
    
    # Background: modern slate-100
    board = Image.new("RGB", (board_w, board_h), (241, 245, 249))
    draw = ImageDraw.Draw(board)
    
    # Header Banner (Deep Civic Slate #0f172a)
    draw.rectangle([(0, 0), (board_w, top_header_h - 20)], fill=(15, 23, 42))
    
    # Header text
    f_title = get_font(32, bold=True)
    f_sub = get_font(18, bold=False)
    f_badge = get_font(14, bold=True)
    f_card_title = get_font(18, bold=True)
    f_card_route = get_font(14, bold=False)
    f_footer = get_font(13, bold=False)
    
    draw.text((pad_x, 24), title_text, fill=(255, 255, 255), font=f_title)
    draw.text((pad_x, 68), subtitle_text, fill=(148, 163, 184), font=f_sub)
    
    # Counter badge in top right
    count_badge_text = f"Total Screens: {len(board_screens)}"
    badge_w = 180
    badge_h = 36
    bx = board_w - pad_x - badge_w
    by = 38
    draw.rounded_rectangle([(bx, by), (bx + badge_w, by + badge_h)], radius=6, fill=(30, 41, 59))
    draw.text((bx + 20, by + 8), count_badge_text, fill=(56, 189, 248), font=f_badge)
    
    # Draw cards
    for idx, sc in enumerate(board_screens):
        c = idx % cols
        r = idx // cols
        
        x = pad_x + c * (card_w + pad_x)
        y = top_header_h + r * (card_h + pad_y)
        
        # Card container shadow / border
        draw.rounded_rectangle([(x, y), (x + card_w, y + card_h)], radius=10, fill=(255, 255, 255), outline=(203, 213, 225), width=2)
        
        # Card header fill (subtle slate-50)
        draw.rounded_rectangle([(x, y), (x + card_w, y + card_header_h)], radius=10, fill=(248, 250, 252))
        draw.rectangle([(x, y + card_header_h - 10), (x + card_w, y + card_header_h)], fill=(248, 250, 252))
        draw.line([(x, y + card_header_h), (x + card_w, y + card_header_h)], fill=(226, 232, 240), width=1)
        
        # Role Badge pill
        role_text = f" {sc['role'].upper()} "
        rx = x + 16
        ry = y + 14
        rw = 130 if "City" in sc['role'] else 110
        draw.rounded_rectangle([(rx, ry), (rx + rw, ry + 26)], radius=4, fill=sc["role_badge_bg"])
        draw.text((rx + 8, ry + 4), sc['role'], fill=(255, 255, 255), font=get_font(12, bold=True))
        
        # Title text
        title_display = f"#{sc['id']}: {sc['title']}"
        draw.text((rx + rw + 14, y + 10), title_display, fill=(15, 23, 42), font=f_card_title)
        draw.text((rx + rw + 14, y + 32), f"Route: {sc['route']}", fill=(100, 116, 139), font=f_card_route)
        
        # Screenshot image
        src_img_path = SCREENS_DIR / sc["filename"]
        if src_img_path.exists():
            im = Image.open(src_img_path)
            im_resized = im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            board.paste(im_resized, (x, y + card_header_h))
        else:
            draw.rectangle([(x, y + card_header_h), (x + card_w, y + card_header_h + thumb_h)], fill=(226, 232, 240))
            draw.text((x + 200, y + card_header_h + 200), "Screenshot Not Found", fill=(100, 116, 139), font=f_title)
        
        # Card footer (Wireframe summary highlights)
        fy = y + card_header_h + thumb_h
        draw.line([(x, fy), (x + card_w, fy)], fill=(226, 232, 240), width=1)
        
        components_short = " • ".join(sc["components"][:3])
        if len(components_short) > 115:
            components_short = components_short[:112] + "..."
        draw.text((x + 16, fy + 14), f"Components: {components_short}", fill=(71, 85, 105), font=f_footer)

    out_path = BOARDS_DIR / out_filename
    board.save(out_path, quality=95)
    print(f"  [OK] Saved composite board: {out_filename} ({board.size[0]}x{board.size[1]} px, {os.path.getsize(out_path)} bytes)")
    return out_path

# Board 1: Master All-in-One (3 cols x 4 rows = 12 core screens)
core_12 = [s for s in SCREENS if s["id"] not in ["02", "07"]]  # Exclude secondary auth/news to keep 12 pristine core pages
build_composite_board(
    core_12, 
    cols=3, 
    title_text="CABANATUAN CITY LEGISLATIVE PORTAL - SYSTEM UI WIREFRAME COMPILATION",
    subtitle_text="Curated High-Resolution UI Architecture & Wireframe Reference for ChatGPT & System Skeletons",
    out_filename="00_MASTER_COMPILATION_OVERVIEW.png"
)

# Board 2: Citizen & Public Portal Board (2 cols x 3 rows = 6 screens)
citizen_screens = [s for s in SCREENS if s["category"] == "citizen"][:6]
build_composite_board(
    citizen_screens,
    cols=2,
    title_text="CITIZEN & PUBLIC ACCESS PORTAL - UI WIREFRAME REFERENCE",
    subtitle_text="Public-Facing Architectural Blueprints (Landing, Search, Detail, AI Chatbot, Reports, News)",
    out_filename="01_CITIZEN_PORTAL_COMPILATION.png"
)

# Board 3: Administrative Portals Board (Barangay & City LGU) (2 cols x 3 rows = 6 screens)
admin_screens = [s for s in SCREENS if s["id"] in ["08", "09", "10", "11", "12", "14"]]
build_composite_board(
    admin_screens,
    cols=2,
    title_text="ADMINISTRATIVE PORTALS (BARANGAY & LGU) - UI WIREFRAME REFERENCE",
    subtitle_text="Internal Management Dashboards, Legislative Review Queues, Triage Modals & Analytics",
    out_filename="02_ADMIN_PORTAL_COMPILATION.png"
)

# Step 3: Multi-page PDF Generator using PIL
def build_wireframe_pdf():
    """
    Builds a high-definition PDF presentation (1920x1080 per page)
    containing each screen with detailed wireframe layout notes.
    """
    pages = []
    page_w, page_h = 1920, 1080
    
    f_page_num = get_font(18, bold=True)
    f_header_title = get_font(26, bold=True)
    f_header_route = get_font(18, bold=False)
    f_role_badge = get_font(14, bold=True)
    f_sect_title = get_font(16, bold=True)
    f_body = get_font(14, bold=False)
    
    for idx, sc in enumerate(SCREENS):
        page = Image.new("RGB", (page_w, page_h), (248, 250, 252))
        draw = ImageDraw.Draw(page)
        
        # Header banner (dark slate)
        header_h = 90
        draw.rectangle([(0, 0), (page_w, header_h)], fill=(15, 23, 42))
        
        # Page index badge
        draw.text((40, 30), f"PAGE {idx + 1:02d} / {len(SCREENS):02d}", fill=(148, 163, 184), font=f_page_num)
        
        # Title
        draw.text((220, 26), f"Screen #{sc['id']}: {sc['title']}", fill=(255, 255, 255), font=f_header_title)
        
        # Role Badge
        rw = 140 if "City" in sc['role'] else 120
        draw.rounded_rectangle([(page_w - 40 - rw, 28), (page_w - 40, 62)], radius=6, fill=sc["role_badge_bg"])
        draw.text((page_w - 30 - rw, 34), sc['role'], fill=(255, 255, 255), font=f_role_badge)
        
        # Screenshot preview (1400 x 840) placed on left side
        ss_w = 1380
        ss_h = int(ss_w * (960 / 1600))  # 828 px
        sx = 40
        sy = header_h + 30
        
        src_img_path = SCREENS_DIR / sc["filename"]
        if src_img_path.exists():
            im = Image.open(src_img_path)
            im_resized = im.resize((ss_w, ss_h), Image.Resampling.LANCZOS)
            # Draw card border around screenshot
            draw.rounded_rectangle([(sx - 4, sy - 4), (sx + ss_w + 4, sy + ss_h + 4)], radius=8, fill=(255, 255, 255), outline=(203, 213, 225), width=2)
            page.paste(im_resized, (sx, sy))
        
        # Right sidebar (Wireframe & Skeleton breakdown)
        rx = sx + ss_w + 30
        rw = page_w - rx - 40
        rh = ss_h + 8
        
        draw.rounded_rectangle([(rx, sy - 4), (rx + rw, sy + rh)], radius=8, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
        
        # Sidebar header
        draw.rounded_rectangle([(rx, sy - 4), (rx + rw, sy + 44)], radius=8, fill=(241, 245, 249))
        draw.text((rx + 20, sy + 10), "WIREFRAME SPECIFICATION", fill=(30, 41, 59), font=f_sect_title)
        
        cur_y = sy + 60
        # Route
        draw.text((rx + 20, cur_y), "Target Route:", fill=(100, 116, 139), font=get_font(13, bold=True))
        draw.text((rx + 20, cur_y + 20), sc["route"], fill=(2, 132, 199), font=get_font(15, bold=True))
        cur_y += 56
        
        # Summary
        draw.text((rx + 20, cur_y), "Layout Architecture:", fill=(100, 116, 139), font=get_font(13, bold=True))
        cur_y += 22
        # Wrap summary
        words = sc["summary"].split()
        line = ""
        for word in words:
            if len(line + " " + word) < 42:
                line = (line + " " + word).strip()
            else:
                draw.text((rx + 20, cur_y), line, fill=(51, 65, 85), font=f_body)
                cur_y += 20
                line = word
        if line:
            draw.text((rx + 20, cur_y), line, fill=(51, 65, 85), font=f_body)
            cur_y += 28
            
        # Key UI Components
        draw.text((rx + 20, cur_y), "Core UI Skeleton Elements:", fill=(100, 116, 139), font=get_font(13, bold=True))
        cur_y += 24
        
        for c_idx, comp in enumerate(sc["components"][:5]):
            draw.text((rx + 20, cur_y), f"[ {c_idx + 1} ]", fill=(2, 132, 199), font=get_font(12, bold=True))
            c_words = comp.split()
            c_line = ""
            c_first = True
            for w in c_words:
                max_len = 36 if c_first else 40
                if len(c_line + " " + w) < max_len:
                    c_line = (c_line + " " + w).strip()
                else:
                    draw.text((rx + 56 if c_first else rx + 30, cur_y), c_line, fill=(30, 41, 59), font=get_font(13, bold=False))
                    cur_y += 18
                    c_line = w
                    c_first = False
            if c_line:
                draw.text((rx + 56 if c_first else rx + 30, cur_y), c_line, fill=(30, 41, 59), font=get_font(13, bold=False))
                cur_y += 24
                
        # ChatGPT Tip Box at bottom of sidebar
        tip_y = sy + rh - 130
        draw.rounded_rectangle([(rx + 16, tip_y), (rx + rw - 16, tip_y + 114)], radius=6, fill=(240, 253, 250), outline=(153, 246, 228), width=1)
        draw.text((rx + 28, tip_y + 12), "ChatGPT Wireframing Tip:", fill=(15, 118, 110), font=get_font(13, bold=True))
        tip_lines = [
            "Upload this page to ChatGPT & ask:",
            "'Convert this UI screen into a clean",
            "low-fidelity ASCII or Tailwind skeleton",
            "matching the numbered components.'"
        ]
        ty = tip_y + 32
        for tl in tip_lines:
            draw.text((rx + 28, ty), tl, fill=(19, 78, 74), font=get_font(12, bold=False))
            ty += 18
            
        # Bottom page footer
        draw.text((40, page_h - 40), "Cabanatuan City Ordinance & Legislative Portal — Capstone Architecture Reference", fill=(148, 163, 184), font=get_font(13, bold=False))
        
        pages.append(page)
        
    pdf_path = OUTPUT_DIR / "UI_Screenshots_Wireframe_Compilation.pdf"
    if pages:
        pages[0].save(pdf_path, save_all=True, append_images=pages[1:], resolution=100.0)
        print(f"  [OK] Saved multi-page PDF: {pdf_path.name} ({len(pages)} pages, {os.path.getsize(pdf_path)} bytes)")

build_wireframe_pdf()

# Step 4: Generate Interactive HTML Viewer
html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System UI Screenshot Compilation & Wireframe Reference</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">

  <!-- Header Banner -->
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Capstone v2</span>
          <span class="text-xs text-slate-400">Cabanatuan City Legislative Portal</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">System UI Screenshot Compilation & Wireframe Hub</h1>
      </div>
      <div class="flex items-center gap-3">
        <a href="UI_Screenshots_Wireframe_Compilation.pdf" download class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Download PDF Guide
        </a>
        <button onclick="copyMasterPrompt()" class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke_linecap="round" stroke_linejoin="round" stroke_width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
          Copy ChatGPT Master Prompt
        </button>
      </div>
    </div>
  </header>

  <!-- Navigation / Filter Bar -->
  <div class="bg-slate-900 border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button onclick="filterCategory('all')" id="btn-all" class="cat-btn px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white transition">All Screens (14)</button>
        <button onclick="filterCategory('citizen')" id="btn-citizen" class="cat-btn px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition">Citizen Portal (6)</button>
        <button onclick="filterCategory('barangay')" id="btn-barangay" class="cat-btn px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition">Barangay Admin (3)</button>
        <button onclick="filterCategory('lgu')" id="btn-lgu" class="cat-btn px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition">City LGU Admin (4)</button>
        <button onclick="filterCategory('boards')" id="btn-boards" class="cat-btn px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition">Composite Boards (3)</button>
      </div>
      <div class="text-xs text-slate-400">
        Click any screen to zoom • Instant copy prompts for ChatGPT
      </div>
    </div>
  </div>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">

    <!-- Overview Banner Notice -->
    <div class="p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 class="text-base font-bold text-white flex items-center gap-2">
          <span>🚀</span> Ready for ChatGPT Wireframing & Skeleton Generation
        </h2>
        <p class="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          You don't need to upload every single page. You can either upload the <strong class="text-emerald-400">00_MASTER_COMPILATION_OVERVIEW.png</strong> (an all-in-one 4K board of the core screens), the <strong class="text-indigo-400">PDF Guide</strong>, or individual key screens below with the pre-crafted ChatGPT prompts.
        </p>
      </div>
      <a href="boards/00_MASTER_COMPILATION_OVERVIEW.png" download class="whitespace-nowrap px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition">
        Download All-in-One Master Board ↓
      </a>
    </div>

    <!-- Section: Composite Boards -->
    <section id="section-boards" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          Master Composite Collage Boards (Upload 1 Image to ChatGPT)
        </h2>
        <span class="text-xs text-slate-400">High-Resolution Multi-Screen Sheets</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Board 1 -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition flex flex-col">
          <div class="p-4 border-b border-slate-800 bg-slate-900/60">
            <span class="text-xs font-bold text-indigo-400">MASTER OVERVIEW</span>
            <h3 class="text-sm font-semibold text-white mt-0.5">All-in-One System Grid</h3>
            <p class="text-xs text-slate-400 mt-1">12 essential screens compiled in a 3x4 grid</p>
          </div>
          <div class="relative group cursor-pointer aspect-video bg-slate-950 overflow-hidden" onclick="openModal('boards/00_MASTER_COMPILATION_OVERVIEW.png', 'Master All-in-One Compilation Overview')">
            <img src="boards/00_MASTER_COMPILATION_OVERVIEW.png" alt="Master Board" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">View Full Size</span>
            </div>
          </div>
          <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between mt-auto">
            <button onclick="copyPrompt('master')" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Copy ChatGPT Prompt</button>
            <a href="boards/00_MASTER_COMPILATION_OVERVIEW.png" download class="text-xs text-slate-300 hover:text-white">Download ↓</a>
          </div>
        </div>

        <!-- Board 2 -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition flex flex-col">
          <div class="p-4 border-b border-slate-800 bg-slate-900/60">
            <span class="text-xs font-bold text-emerald-400">CITIZEN PORTAL</span>
            <h3 class="text-sm font-semibold text-white mt-0.5">Citizen & Public Flow Sheet</h3>
            <p class="text-xs text-slate-400 mt-1">6 core citizen screens (Search, Detail, AI, Reports)</p>
          </div>
          <div class="relative group cursor-pointer aspect-video bg-slate-950 overflow-hidden" onclick="openModal('boards/01_CITIZEN_PORTAL_COMPILATION.png', 'Citizen Portal Compilation')">
            <img src="boards/01_CITIZEN_PORTAL_COMPILATION.png" alt="Citizen Board" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">View Full Size</span>
            </div>
          </div>
          <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between mt-auto">
            <button onclick="copyPrompt('citizen')" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Copy ChatGPT Prompt</button>
            <a href="boards/01_CITIZEN_PORTAL_COMPILATION.png" download class="text-xs text-slate-300 hover:text-white">Download ↓</a>
          </div>
        </div>

        <!-- Board 3 -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition flex flex-col">
          <div class="p-4 border-b border-slate-800 bg-slate-900/60">
            <span class="text-xs font-bold text-purple-400">ADMINISTRATIVE PORTALS</span>
            <h3 class="text-sm font-semibold text-white mt-0.5">Barangay & City Admin Sheet</h3>
            <p class="text-xs text-slate-400 mt-1">6 management screens (Dashboards, Reviews, Analytics)</p>
          </div>
          <div class="relative group cursor-pointer aspect-video bg-slate-950 overflow-hidden" onclick="openModal('boards/02_ADMIN_PORTAL_COMPILATION.png', 'Admin Portal Compilation')">
            <img src="boards/02_ADMIN_PORTAL_COMPILATION.png" alt="Admin Board" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span class="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold">View Full Size</span>
            </div>
          </div>
          <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between mt-auto">
            <button onclick="copyPrompt('admin')" class="text-xs text-purple-400 hover:text-purple-300 font-medium">Copy ChatGPT Prompt</button>
            <a href="boards/02_ADMIN_PORTAL_COMPILATION.png" download class="text-xs text-slate-300 hover:text-white">Download ↓</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section: Individual Curated Screens -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Curated Core System Screens
        </h2>
        <span class="text-xs text-slate-400">14 Essential Screens • 1600x960 Pristine Resolution</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="screens-grid">
"""

# Append screens dynamically into HTML
for sc in SCREENS:
    role_color = "sky" if "Citizen" in sc["role"] else ("emerald" if "Barangay" in sc["role"] else ("purple" if "City" in sc["role"] else "slate"))
    comp_bullets = "".join([f"<li class='text-[11px] text-slate-300 truncate'>• {c}</li>" for c in sc["components"][:4]])
    
    html_content += f"""
        <!-- Screen Card {sc['id']} -->
        <div class="screen-card bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col" data-cat="{sc['category']}">
          <!-- Header -->
          <div class="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-{role_color}-500/20 text-{role_color}-400 border border-{role_color}-500/30">
                  {sc['role']}
                </span>
                <span class="text-[11px] font-mono text-slate-400">{sc['route']}</span>
              </div>
              <h3 class="text-sm font-semibold text-white mt-1">#{sc['id']}: {sc['title']}</h3>
            </div>
            <span class="text-xs font-mono text-slate-500">#{sc['id']}</span>
          </div>

          <!-- Image Preview -->
          <div class="relative group cursor-pointer aspect-video bg-slate-950 overflow-hidden" onclick="openModal('screens/{sc['filename']}', '#{sc['id']}: {sc['title']}')">
            <img src="screens/{sc['filename']}" alt="{sc['title']}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">Zoom Preview</span>
            </div>
          </div>

          <!-- Component Highlights -->
          <div class="p-3.5 bg-slate-900/40 border-b border-slate-800/80 flex-1">
            <p class="text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Wireframe Structure:</p>
            <ul class="space-y-1">
              {comp_bullets}
            </ul>
          </div>

          <!-- Card Actions -->
          <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
            <button onclick="copyScreenPrompt('{sc['id']}', '{sc['title']}', '{sc['route']}')" class="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
              Copy Prompt
            </button>
            <a href="screens/{sc['filename']}" download class="text-slate-400 hover:text-white">Download PNG ↓</a>
          </div>
        </div>
    """

html_content += """
      </div>
    </section>

    <!-- Prompt Cheat Sheet Section -->
    <section class="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
      <h2 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
        <span class="text-xl">💬</span> How to send to ChatGPT for Wireframe / Skeleton Generation
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
        <div class="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <span class="font-bold text-emerald-400 text-sm">Option 1: Upload All-in-One Board</span>
          <p>Download <code class="text-indigo-300 font-mono">00_MASTER_COMPILATION_OVERVIEW.png</code> and upload it directly to ChatGPT with the prompt below. ChatGPT will analyze all 12 core screens at once.</p>
        </div>
        <div class="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <span class="font-bold text-sky-400 text-sm">Option 2: Upload PDF Compilation</span>
          <p>Upload <code class="text-indigo-300 font-mono">UI_Screenshots_Wireframe_Compilation.pdf</code> to ChatGPT Plus. ChatGPT parses every page and its structural layout specifications.</p>
        </div>
        <div class="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <span class="font-bold text-purple-400 text-sm">Option 3: Specific Single Screen</span>
          <p>Pick just the exact screen you are working on (e.g. AI Assistant or Ordinance Detail), upload its PNG, and click "Copy Prompt" on that card.</p>
        </div>
      </div>
    </section>

  </main>

  <!-- Image Modal -->
  <div id="image-modal" class="fixed inset-0 z-50 bg-black/90 backdrop-blur hidden flex flex-col items-center justify-center p-4" onclick="closeModal()">
    <div class="max-w-6xl w-full flex flex-col max-h-[92vh]" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-3 text-white">
        <h3 id="modal-title" class="text-base font-semibold"></h3>
        <button onclick="closeModal()" class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm">✕ Close</button>
      </div>
      <div class="overflow-auto rounded-lg border border-slate-700 bg-slate-950 max-h-[85vh] flex items-center justify-center">
        <img id="modal-img" src="" alt="Enlarged" class="max-w-full max-h-full object-contain">
      </div>
    </div>
  </div>

  <!-- Notification Toast -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold translate-y-20 opacity-0 transition duration-300">
    Copied prompt to clipboard!
  </div>

  <script>
    function filterCategory(cat) {
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.className = 'cat-btn px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition';
      });
      const activeBtn = document.getElementById('btn-' + cat);
      if (activeBtn) {
        activeBtn.className = 'cat-btn px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white transition';
      }

      const cards = document.querySelectorAll('.screen-card');
      const boardsSection = document.getElementById('section-boards');

      if (cat === 'all') {
        cards.forEach(c => c.style.display = 'flex');
        boardsSection.style.display = 'block';
      } else if (cat === 'boards') {
        cards.forEach(c => c.style.display = 'none');
        boardsSection.style.display = 'block';
      } else {
        boardsSection.style.display = 'none';
        cards.forEach(c => {
          c.style.display = (c.getAttribute('data-cat') === cat) ? 'flex' : 'none';
        });
      }
    }

    function openModal(src, title) {
      document.getElementById('modal-img').src = src;
      document.getElementById('modal-title').innerText = title;
      document.getElementById('image-modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('image-modal').classList.add('hidden');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.remove('translate-y-20', 'opacity-0');
      setTimeout(() => {
        t.classList.add('translate-y-20', 'opacity-0');
      }, 2500);
    }

    function copyToClipboard(text, msg) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(msg || "Copied to clipboard!");
      });
    }

    function copyMasterPrompt() {
      const p = `I am attaching screenshots of our web application (Cabanatuan City Ordinance & Legislative Portal).

Please convert these UI screens into low-fidelity wireframes / skeletons for our system design documentation.

For each screen:
1. Provide an ASCII or structural layout diagram showing the main layout zones (Navbar, Sidebar, Hero/Filters, Main Content Grid/Table, Action Buttons, Modals).
2. Outline the exact component hierarchy (Container -> Section -> Card/Table -> Controls).
3. If requested, provide a React + Tailwind CSS skeleton component representing the page loading / low-fidelity wireframe state.
4. Keep the design clean, modular, and accessible.`;
      copyToClipboard(p, "Master ChatGPT prompt copied!");
    }

    function copyPrompt(type) {
      let p = "";
      if (type === 'master') {
        copyMasterPrompt();
        return;
      } else if (type === 'citizen') {
        p = `I am attaching the compilation board of our Citizen & Public Portal screens (Cabanatuan City Ordinance Portal).
Please convert these 6 public-facing screens (Homepage, Ordinance Explorer, Document Reader, AI Legislative Assistant, Incident Report Form, Civic News) into:
1. Clean low-fidelity wireframe diagrams (ASCII / Markdown representation).
2. Component wireframe specifications (Header, Search, Filters, Cards, Forms, Modals).
3. Clear interaction flow between search -> detail -> AI query -> incident reporting.`;
      } else if (type === 'admin') {
        p = `I am attaching the compilation board of our Administrative Portals (Barangay Admin & City LGU Admin).
Please convert these administrative management screens into low-fidelity wireframe layouts:
1. Dashboard layout (Sidebar, Metric KPI Cards, Queue Tables).
2. Ordinance Management & Review Workflow (Table columns, status pills, action modals).
3. Incident Triage & Legislative Analytics charts wireframe structure.`;
      }
      copyToClipboard(p, "Board prompt copied!");
    }

    function copyScreenPrompt(id, title, route) {
      const p = `Here is a screenshot of our system UI screen:
Screen #${id}: ${title}
Route: ${route}

Please generate:
1. A clean low-fidelity wireframe / ASCII layout representation of this screen.
2. A component breakdown listing all UI zones (Navbar/Sidebar, Header, Main content, Inputs/Tables/Cards, Actions).
3. A Tailwind CSS skeleton component snippet representing this wireframe skeleton.`;
      copyToClipboard(p, `Prompt for #${id} copied!`);
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>
"""

html_path = OUTPUT_DIR / "index.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"  [OK] Saved Interactive HTML Viewer: {html_path.name} ({os.path.getsize(html_path)} bytes)")

# Step 5: Generate ChatGPT Prompts Markdown Guide
md_content = """# ChatGPT Wireframe & Skeleton Generation Prompts

This guide provides copy-paste prompts designed specifically to feed the screenshots in this compilation to **ChatGPT** (GPT-4o, ChatGPT Vision, or Canvas) to generate clean wireframes, skeleton screens, or system architecture layouts.

---

## 📁 Files in This Compilation

| File | Type | Description |
|---|---|---|
| [`boards/00_MASTER_COMPILATION_OVERVIEW.png`](boards/00_MASTER_COMPILATION_OVERVIEW.png) | **Master Board** | 12 core screens compiled into a single 4K overview image. |
| [`boards/01_CITIZEN_PORTAL_COMPILATION.png`](boards/01_CITIZEN_PORTAL_COMPILATION.png) | **Citizen Board** | 6 citizen-facing screens (Landing, Explorer, Detail, AI, Reports, News). |
| [`boards/02_ADMIN_PORTAL_COMPILATION.png`](boards/02_ADMIN_PORTAL_COMPILATION.png) | **Admin Board** | 6 administrative screens (Barangay & City LGU Dashboards, Review, Analytics). |
| [`UI_Screenshots_Wireframe_Compilation.pdf`](UI_Screenshots_Wireframe_Compilation.pdf) | **Multi-Page PDF** | 14-page presentation with 1 high-res screen and layout spec per page. |
| [`screens/`](screens/) | **Individual Screens** | 14 standalone 1600x960 PNGs, numbered 01 to 14. |
| [`index.html`](index.html) | **Interactive Viewer** | Double-click to browse all screens, zoom, and copy prompts with 1 click. |

---

## 🎯 Prompt 1: Master All-in-One Wireframe (Upload `00_MASTER_COMPILATION_OVERVIEW.png`)

> **How to use:** Upload `00_MASTER_COMPILATION_OVERVIEW.png` (or `UI_Screenshots_Wireframe_Compilation.pdf`) to ChatGPT and paste:

```markdown
I have attached a screenshot compilation board of our web application: the Cabanatuan City Ordinance & Legislative Portal.

Based on these actual system UI screens, please generate a comprehensive Low-Fidelity Wireframe & Skeleton Specification for our system documentation.

Please provide:
1. System Information Architecture & Role Division:
   - Public Citizen Flow (Homepage, Explorer, Detail Reader, AI Chatbot, Incident Report Form, Civic News)
   - Barangay Admin Flow (Dashboard, Ordinance Management, Incident Triage)
   - City LGU Admin Flow (Executive Dashboard, Review & Approval Modal, Analytics)

2. ASCII / Markdown Wireframe Layout for each major page archetype:
   - Show header/navbar, sidebar (if admin), search/filter strips, main grid/table, and action buttons.

3. Component Hierarchy Tree:
   - Outline the primary reusable components across pages (Navbar, FilterBar, OrdinanceCard, StatusBadge, IncidentModal, KPIStatCard).

Keep the formatting clean, professional, and ready to include in our Capstone system design chapter.
```

---

## 🎯 Prompt 2: ASCII / Low-Fidelity Wireframe for a Specific Screen

> **How to use:** Upload any individual screenshot from `screens/` (e.g., `03_Citizen_Ordinance_Explorer.png` or `05_Citizen_AI_Legislative_Assistant.png`) and paste:

```markdown
I have attached a screenshot of our system UI screen:
[Insert Screen Name, e.g. "Ordinance Explorer" or "AI Legislative Assistant"]

Please convert this screenshot into a clean Low-Fidelity ASCII Wireframe and component blueprint.

Include:
1. ASCII visual layout diagram (enclosing box with [Buttons], [Inputs], [Cards], and [Tables]).
2. Layout structure breakdown (Header, Sidebar/Filter Zone, Main Viewport, Pagination/Footer).
3. Field & Control Inventory:
   - Every input field, filter dropdown, pill badge, and button visible on this screen.
4. Responsive behavior notes (Desktop vs. Mobile behavior).
```

---

## 🎯 Prompt 3: React + Tailwind CSS Skeleton Screen Generator

> **How to use:** Upload a screenshot or describe the screen and paste:

```markdown
Based on the attached screenshot of our UI screen, please write a React (Next.js) Skeleton Component using Tailwind CSS (`animate-pulse`).

Requirements:
- Match the exact visual layout structure of the screenshot (header, grid/table, card dimensions, button placeholders).
- Use gray background placeholders (`bg-slate-200` or `bg-slate-700 dark:bg-slate-800`) with rounded corners (`rounded-lg`, `rounded-full`).
- Ensure it can be used as a drop-in loading fallback in Next.js (`loading.tsx` or Suspense fallback).
- Keep the code modular, self-contained, and clean.
```

---

## 🎯 Prompt 4: Figma / UI Design Specifications

> **How to use:** Upload a screenshot and paste:

```markdown
Analyze the attached UI screenshot and generate a Figma Layout Blueprint with Auto-Layout specifications:

1. Frame hierarchy:
   - Root Frame dimensions and layout direction (Vertical Auto-Layout).
   - Header / Navigation Bar padding, gap, and child alignment.
   - Main content container constraints (Max width, margins, column gaps).
2. Design Tokens:
   - Color palette breakdown (Background, Surface, Border, Primary Brand, Text Hierarchy).
   - Typography scale (Page title, Section header, Body text, Badge text).
3. Component variants:
   - Detail states for primary buttons, cards, and data table rows (Default, Hover, Active, Disabled).
```

---

## 📋 Master Checklist of Included Screens

1. **`01_Citizen_Homepage_Hero.png`** — Public Landing Page, Search Bar, Quick Stats
2. **`02_Auth_Login_Modal.png`** — Role-based Sign-in Modal (Citizen, Barangay, LGU)
3. **`03_Citizen_Ordinance_Explorer.png`** — Public Search, Faceted Category Filters, Cards Grid
4. **`04_Citizen_Ordinance_Detail.png`** — Legal Reader, Sectioned Provisions, Sanctions Box
5. **`05_Citizen_AI_Legislative_Assistant.png`** — RAG AI Chatbot with verified citations
6. **`06_Citizen_Incident_Report_Form.png`** — Community Incident Form, Photo Uploader, Anonymous Toggle
7. **`07_Citizen_Civic_News.png`** — Public Civic Bulletins, Category Badges, News Grid
8. **`08_Barangay_Admin_Dashboard.png`** — Barangay KPI Counters, Pending Tickets, Recent Activity
9. **`09_Barangay_Ordinance_Management.png`** — Barangay Local Ordinance Table, Status Pills, Draft CTA
10. **`10_Barangay_Incident_Triage.png`** — Incident Photo Inspection & Verification Triage Modal
11. **`11_LGU_Executive_Dashboard.png`** — City Council Executive Stats & Legislative Review Queue
12. **`12_LGU_Ordinance_Review_Approval.png`** — Official Legislative Enactment & Revision Modal
13. **`13_LGU_City_Reports_Monitoring.png`** — City-wide 89-Barangay Incident Heatmap & Master Table
14. **`14_LGU_Legislative_Analytics.png`** — Trend Charts, Category Distribution & Metrics Visualizations
"""

md_path = OUTPUT_DIR / "CHATGPT_WIREFRAME_PROMPTS.md"
with open(md_path, "w", encoding="utf-8") as f:
    f.write(md_content)
print(f"  [OK] Saved Prompts Guide: {md_path.name} ({os.path.getsize(md_path)} bytes)")

print("\nAll screenshot compilation assets successfully generated in:")
print(f"-> {OUTPUT_DIR}")
