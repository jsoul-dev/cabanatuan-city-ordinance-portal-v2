# 🏛️ Cabanatuan City Ordinance Portal — User Manual Documentation Suite

This directory contains the automated, reusable workflow and generated documents for the official **Cabanatuan City Ordinance Portal User Manual** (Capstone Defense Edition).

---

## 📂 Directory Layout

```text
docs/user_manual/
├── config/
│   └── annotations_config.json        # Bounding box coordinates, roles, and UI element definitions
├── output/
│   ├── Cabanatuan_City_Ordinance_Portal_User_Manual.docx   # Master Word document (4.4 MB)
│   └── Cabanatuan_City_Ordinance_Portal_User_Manual.pdf    # Matching PDF document (3.5 MB)
├── screenshots/
│   ├── original/                      # Pristine unannotated screenshots captured by browser automation
│   │   ├── common/                    # Public landing, login, and theme toggle (3 screenshots)
│   │   ├── citizen/                   # Public search, split-screen, PDF modal, AI, reports (7 screenshots)
│   │   ├── barangay_admin/            # Barangay dashboard, drafting, AI OCR, triage (7 screenshots)
│   │   └── lgu_admin/                 # City dashboard, repository, approvals, users, reports (10 screenshots)
│   └── annotated/                     # Copies with programmatic numbered badges, highlights, and borders
│       ├── common/
│       ├── citizen/
│       ├── barangay_admin/
│       └── lgu_admin/
└── scripts/
    ├── capture_screenshots.mjs        # Playwright browser automation script
    ├── annotate_screenshots.py        # Python Pillow image annotation engine
    ├── generate_manual.py             # Python-docx document builder
    ├── convert_to_pdf.ps1             # PowerShell Word COM PDF export script
    └── run_workflow.py                # Master orchestrator script
```

---

## 🚀 How to Regenerate the Manual

### Prerequisites
1. **Next.js Application Running:**
   Ensure the local portal server is running on `http://localhost:3000`:
   ```powershell
   npm run dev
   # or
   npm run demo
   ```
2. **Python Environment:**
   Python 3.10+ with `pillow` and `python-docx`:
   ```powershell
   pip install pillow python-docx
   ```
3. **PDF Generation (Windows):**
   Microsoft Word 2016+ installed on the host operating system (used via Word COM automation).

### One-Click Execution
To re-run the entire pipeline from scratch (capturing screenshots, annotating, generating the DOCX, and exporting the PDF):
```powershell
python docs/user_manual/scripts/run_workflow.py
```

### Individual Step Execution
If you only need to run specific parts of the workflow:

1. **Re-capture Browser Screenshots:**
   ```powershell
   node docs/user_manual/scripts/capture_screenshots.mjs
   ```
2. **Re-annotate Screenshots:**
   ```powershell
   python docs/user_manual/scripts/annotate_screenshots.py
   ```
3. **Re-generate Microsoft Word Document:**
   ```powershell
   python docs/user_manual/scripts/generate_manual.py
   ```
4. **Re-export PDF Document:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File docs/user_manual/scripts/convert_to_pdf.ps1
   ```

---

## 📋 Covered Roles & Workflows

| # | User Role | Workflow Name | Filename |
|---|---|---|---|
| **1** | Common | Public Landing Page & 3D Archive | `common_01_homepage_hero.png` |
| **2** | Common | Multi-Role Authentication Interface | `common_02_login_page.png` |
| **3** | Common | High-Contrast Dark Mode Toggle | `common_03_theme_toggle.png` |
| **4** | Citizen | Public Ordinance Explorer & Search | `citizen_01_ordinance_explorer.png` |
| **5** | Citizen | Split-Screen Legal Text & Sanctions | `citizen_02_ordinance_detail.png` |
| **6** | Citizen | Scanned PDF Viewer Modal | `citizen_03_pdf_modal.png` |
| **7** | Citizen | AI Civic Assistant (Bilingual Gemini RAG) | `citizen_04_ai_assistant.png` |
| **8** | Citizen | Community Incident Report Desk | `citizen_05_community_report_form.png` |
| **9** | Citizen | Submission Confirmation & Tracking Code | `citizen_06_report_submitted.png` |
| **10** | Citizen | Civic News & Public Advisories | `citizen_07_civic_news.png` |
| **11** | Barangay Admin | Localized Governance Dashboard (Camp Tinio) | `barangay_01_dashboard.png` |
| **12** | Barangay Admin | Barangay Ordinance Management & Status Tabs | `barangay_02_ordinance_management.png` |
| **13** | Barangay Admin | Ordinance Drafting & City Hall Transmittal | `barangay_03_draft_ordinance_modal.png` |
| **14** | Barangay Admin | Multimodal AI Document Extraction (OCR) | `barangay_04_ai_extraction_modal.png` |
| **15** | Barangay Admin | Constituent Incident Reports Management | `barangay_05_community_reports.png` |
| **16** | Barangay Admin | Report Triage, Officer Dispatch & Status Update | `barangay_06_report_triage_modal.png` |
| **17** | Barangay Admin | Barangay Legislative Reporting & Analytics | `barangay_07_ordinance_reports_analytics.png` |
| **18** | LGU Super Admin | Executive City Hall Governance Dashboard | `lgu_01_executive_dashboard.png` |
| **19** | LGU Super Admin | Central Municipal Ordinance Repository | `lgu_02_ordinance_repository.png` |
| **20** | LGU Super Admin | Sangguniang Panlungsod Review & Approval Modal | `lgu_03_review_approve_modal.png` |
| **21** | LGU Super Admin | Multimodal OCR Extractor for Paper Resolutions | `lgu_04_ai_document_extraction.png` |
| **22** | LGU Super Admin | User Directory & Official Account Provisioning | `lgu_05_users_management.png` |
| **23** | LGU Super Admin | Cabanatuan City Barangay Directory & Coverage | `lgu_06_barangays_directory.png` |
| **24** | LGU Super Admin | City-Wide Incident Reports Monitoring Desk | `lgu_07_city_reports_monitoring.png` |
| **25** | LGU Super Admin | Civic News & Public Broadcast Management | `lgu_08_news_publishing.png` |
| **26** | LGU Super Admin | Legislative Report Generator & Certified PDF Export | `lgu_09_legislative_report_generator.png` |
| **27** | LGU Super Admin | Governance Analytics & Policy Trend Charts | `lgu_10_analytics_charts.png` |

---

## 🔒 Verification & Quality Assurance

- **Zero Artificial Screenshots:** 100% of the screenshots in this manual were captured directly from the live running web application using headless Chromium automation.
- **Pixel-Accurate Annotations:** Highlight bounding boxes and numbered circular badges were calculated directly from the browser DOM bounding rects.
- **Non-Obtrusive Design:** Callout circles are positioned at top-left corners with white contrasting halos and translucent tint fills to prevent obscuring typography or form controls.
- **Audit Compliance:** Follows all stipulations from the BSIT Capstone Final Defense Guide regarding administrative workflows, public access transparency, and AI innovation demonstrations.
