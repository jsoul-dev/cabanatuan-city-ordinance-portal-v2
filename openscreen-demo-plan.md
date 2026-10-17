# OpenScreen Demo Production Plan — Cabanatuan City Ordinance Portal

## 1. Project Context
- **Project Working Directory:** `C:\.JC\Antigravity-Projects\Capstone Project v2\app`
- **Output Destination:** `C:\.JC\Antigravity-Projects\Capstone Project v2\demo-output`
- **Reference Standard:** `C:\Users\Admin\Downloads\Documents\CAPSTONE\BSIT_Capstone_Final_Defense_Guide.pdf` (BSIT Capstone Final Defense Guide: 10–15 min limit, Admin flow first, followed by End-User flow).
- **Target Duration:** ~12–13 minutes.

## 2. Tooling and Configuration Status
- **OpenScreen Executable:** Verified at `C:\Program Files\Openscreen\Openscreen.exe`.
- **MCP Server:** Configured in `C:\Users\Admin\.gemini\config\mcp_config.json` under `"openscreen"`.
- **Antigravity Restart:** Needs session reload/restart so Antigravity loads the OpenScreen MCP tools directly into its runtime.
- **Production Website:** Built successfully with `prisma generate && next build` (Turbopack, all 31 routes compiled).
- **Voice-over Tooling:** High-fidelity neural TTS verified via `edge-tts` (7.3.1) and `ffmpeg` (8.1.2) for broadcast-quality narration synchronization.
- **Automated Browser Automation:** Playwright installed and verified for crisp 1600x1000 app window automation with pointer telemetry.

## 3. Section Sequence & Storyboard
- **Section A — Introduction & Overview (~1:15):** Portal vision, dual-level ordinance governance (City vs Barangay), tech stack, public accessibility.
- **Section B — Administrator Walkthrough (Dual-Tier Governance, ~5:15):** 
  - **Part 1: Barangay Administrator Flow (`/admin/barangay`) — Kapitan Juan Del Rosario (`kapitan@cabanatuan.gov.ph` / `kapitan123`)**:
    - Localized Barangay Dashboard inspection (Barangay Camp Tinio metrics, active reports, pending resolutions)
    - Barangay Ordinance drafting & submission: Creating a local ordinance and submitting it to the LGU for legislative concurrence
    - Community Violation Reports: Viewing and resolving local resident reports (trash burning, noise), updating status (New -> In Progress -> Resolved)
    - Barangay Analytics & Logout
  - **Part 2: LGU Super Administrator Flow (`/admin/lgu`) — (`admin@cabanatuan.gov.ph` / `admin123`)**:
    - City-wide Executive Dashboard (consolidated data across all 89 barangays)
    - Legislative Review Queue: Reviewing, inspecting, and formally approving the submitted Camp Tinio ordinance
    - City-wide Ordinance Management: Creating and publishing city-level legislation with PDF attachments
    - System Accounts & Governance (`/admin/lgu/users`): Managing Citizens, Barangay Admins, and LGU Admins
    - Logout
- **Section C — End-User / Citizen Walkthrough (~4:15):**
  - Public portal access (`/`)
  - Interactive Ordinance Exploration (`/ordinances`): Full-text search, category filters (Health, Traffic, Environment, Curfew), barangay selector, year filtering
  - Ordinance Detail & Document Viewer (`/ordinances/[slug]`): Penalties, enforcement agencies, signatories, downloadable PDF
  - Citizen Violation Reporting (`/report`): Submitting real-time ordinance violations, photo upload, anonymous toggle, tracking receipt
  - AI-Assisted Ordinance Assistant (`/chatbot`): Asking natural language questions, citing specific city ordinances, legal disclaimer
  - Community Announcements & News (`/news`)
  - Citizen authentication and logout
- **Section D — Reports, Analytics & Monitoring (~1:30):**
  - Advanced Analytics Dashboard (`/admin/lgu/analytics` & `/admin/lgu/ordinance-reports`)
  - Ordinance category trends, year-over-year enactment velocity, barangay participation metrics, incident resolution charts
  - Generation and export of official audit/summary reports
- **Section E — Closing (~0:45):**
  - Summary of impact: transparency, compliance, streamlined governance for Cabanatuan City
  - Formal conclusion for final defense panel

## 4. Next Session Instructions
Upon restarting Antigravity:
1. Start production server: `npm run start -p 3000` (pre-warmed via `node scripts/warmup.mjs`).
2. Run the section-by-section recording, narration generation, timeline editing, auto-zooms, callouts, and final 1080p MP4 export to `demo-output/`.
