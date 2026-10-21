# ChatGPT Wireframe & Skeleton Generation Prompts

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
