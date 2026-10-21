import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const ROOT_DIR = path.resolve(process.cwd(), "docs", "user_manual");
const SCREENSHOTS_ORIG_DIR = path.join(ROOT_DIR, "screenshots", "original");
const CONFIG_FILE = path.join(ROOT_DIR, "config", "annotations_config.json");

// Ensure directories exist
for (const sub of ["common", "citizen", "barangay_admin", "lgu_admin"]) {
  fs.mkdirSync(path.join(SCREENSHOTS_ORIG_DIR, sub), { recursive: true });
}
fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });

async function getBox(page, selector, padding = 3) {
  try {
    const el = await page.$(selector);
    if (el) {
      const box = await el.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        // Apply small padding for comfortable framing around UI elements
        const pad = padding;
        const x = Math.max(0, Math.round(box.x) - pad);
        const y = Math.max(0, Math.round(box.y) - pad);
        const width = Math.min(1600 - x, Math.round(box.width) + pad * 2);
        const height = Math.min(960 - y, Math.round(box.height) + pad * 2);
        return { x, y, width, height };
      }
    }
  } catch (e) {
    console.error(`  ⚠️ Error getting bounding box for "${selector}": ${e.message}`);
  }
  console.warn(`  ⚠️ Warning: Element not found: ${selector}`);
  return null;
}

async function captureAll() {
  console.log("=======================================================");
  console.log("  📸 CAPTURING ALL 27 HIGH-RES DESKTOP SCREENSHOTS");
  console.log("  Resolution: 1600x960 (Desktop Clean & Crisp)");
  console.log("=======================================================\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 960 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    const config = {
      generatedAt: new Date().toISOString(),
      viewport: { width: 1600, height: 960 },
      screenshots: {},
    };

    async function saveScreenshot(role, name, filename, title, caption, elements) {
      const relativePath = path.join(role, filename);
      const fullPath = path.join(SCREENSHOTS_ORIG_DIR, relativePath);
      await page.screenshot({ path: fullPath });
      console.log(`  ✓ [${role}] Captured ${name} -> ${filename}`);

      // Filter out any elements where bounding box could not be determined
      const validElements = elements.filter((item) => item.box !== null);

      config.screenshots[name] = {
        role,
        name,
        filename,
        originalPath: fullPath,
        annotatedFilename: filename.replace(".png", "_annotated.png"),
        title,
        caption,
        elements: validElements,
      };
    }

    // =========================================================================
    // SECTION 1: COMMON & AUTHENTICATION (3 SCREENS)
    // =========================================================================
    console.log("\n--- Section 1: Common & Authentication Screens ---");

    // 1. Homepage Hero
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const common01Elements = [
      {
        num: 1,
        label: "Cabanatuan City Seal & Portal Branding",
        box: await getBox(page, "header a[href='/']"),
      },
      {
        num: 2,
        label: "Main Navigation Bar",
        box: await getBox(page, "header nav"),
      },
      {
        num: 3,
        label: "Hero Ordinance Search Input",
        box: await getBox(page, "form[action='/ordinances'] input[name='search']"),
      },
      {
        num: 4,
        label: "Search Submit Button",
        box: await getBox(page, "form[action='/ordinances'] button[type='submit']"),
      },
      {
        num: 5,
        label: "Ask AI Assistant Action Button",
        box: await getBox(page, "a[href='/chatbot'] button"),
      },
      {
        num: 6,
        label: "Interactive 3D Ordinance Archive Canvas",
        box: await getBox(page, "canvas"),
      },
      {
        num: 7,
        label: "Portal Theme Toggle (Dark/Light)",
        box: await getBox(page, "button[aria-label*='Mode' i]"),
      },
    ];
    await saveScreenshot(
      "common",
      "common_01_homepage_hero",
      "common_01_homepage_hero.png",
      "Cabanatuan City Ordinance Portal — Public Landing Page",
      "The public homepage provides zero-barrier access to city ordinances, quick search, interactive 3D archive, and civic links.",
      common01Elements
    );

    // 2. Login Page
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const common02Elements = [
      {
        num: 1,
        label: "Official Portal Authentication Header",
        box: await getBox(page, "header"),
      },
      {
        num: 2,
        label: "Official Email Address Input Field",
        box: await getBox(page, "#email-input"),
      },
      {
        num: 3,
        label: "Password Input Field",
        box: await getBox(page, "#password-input"),
      },
      {
        num: 4,
        label: "Sign In / Submit Button",
        box: await getBox(page, "button[type='submit']"),
      },
      {
        num: 5,
        label: "Quick Role Preset Access Chips",
        box: await getBox(page, "div.grid.grid-cols-2.gap-2"),
      },
      {
        num: 6,
        label: "Return to Public Portal Homepage Link",
        box: await getBox(page, "a:has-text('Bumalik sa Home')"),
      },
    ];
    await saveScreenshot(
      "common",
      "common_02_login_page",
      "common_02_login_page.png",
      "Portal Multi-Role Authentication Interface",
      "Secure sign-in interface supporting Role-Based Access Control (RBAC) for LGU Super Administrators, Barangay Officials, and Citizens.",
      common02Elements
    );

    // 3. Theme Toggle & Dark Mode
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForSelector("button[aria-label*='Mode' i]");
    const themeToggleBtn = await page.$("button[aria-label*='Mode' i]");
    if (themeToggleBtn) {
      await themeToggleBtn.click();
      await page.waitForTimeout(500);
    }
    const common03Elements = [
      {
        num: 1,
        label: "Dark High-Contrast Civic Header",
        box: await getBox(page, "header"),
      },
      {
        num: 2,
        label: "Active Dark Mode Theme Toggle",
        box: await getBox(page, "button[aria-label*='Mode' i]"),
      },
      {
        num: 3,
        label: "Dark Glassmorphic Search Bar",
        box: await getBox(page, "form[action='/ordinances'] input[name='search']"),
      },
      {
        num: 4,
        label: "Interactive 3D Cylinder Archive (Dark Scheme)",
        box: await getBox(page, "canvas"),
      },
    ];
    await saveScreenshot(
      "common",
      "common_03_theme_toggle",
      "common_03_theme_toggle.png",
      "Persistent High-Contrast Dark Mode Display",
      "Zero-flicker dark aesthetic compliant with WCAG accessibility standards, designed for comfortable nighttime civic reading.",
      common03Elements
    );
    // Switch back to light theme for the rest of the captures
    if (themeToggleBtn) {
      await themeToggleBtn.click();
      await page.waitForTimeout(400);
    }

    // =========================================================================
    // SECTION 2: CITIZEN / PUBLIC WORKFLOWS (7 SCREENS)
    // =========================================================================
    console.log("\n--- Section 2: Citizen / Public User Screens ---");

    // 4. Ordinance Explorer
    await page.goto(`${BASE_URL}/ordinances`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const citizen01Elements = [
      {
        num: 1,
        label: "Full-Text Keyword Search Input",
        box: await getBox(page, "input[placeholder*='pagsusunog']"),
      },
      {
        num: 2,
        label: "Jurisdiction Scope Filter (Lahat, City, Barangay)",
        box: await getBox(page, "div.flex.rounded-lg.border:has(button:has-text('City'))"),
      },
      {
        num: 3,
        label: "Policy Category Filter Dropdown",
        box: await getBox(page, "select#category-select"),
      },
      {
        num: 4,
        label: "Legislative Year Filter Dropdown",
        box: await getBox(page, "select#year-select"),
      },
      {
        num: 5,
        label: "Ordinance Card Grid with Status & Category Tags",
        box: await getBox(page, "div.grid.grid-cols-1.gap-5.md\\:grid-cols-2 > div:first-child"),
      },
    ];
    await saveScreenshot(
      "citizen",
      "citizen_01_ordinance_explorer",
      "citizen_01_ordinance_explorer.png",
      "Public Ordinance Explorer & Dynamic Search",
      "Comprehensive search and multi-filtering system enabling citizens to find city and barangay ordinances by keyword, year, and category.",
      citizen01Elements
    );

    // 5. Ordinance Detail Page
    await page.goto(`${BASE_URL}/ordinances/002-2024`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const citizen02Elements = [
      {
        num: 1,
        label: "Official Ordinance Title & Resolution Number",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Legislative Metadata Bar (Date Enacted & Territorial Coverage)",
        box: await getBox(page, "div.flex.flex-wrap.items-center.gap-5"),
      },
      {
        num: 3,
        label: "Executive Legal Summary & Background Rationale Box",
        box: await getBox(page, "div.border-l-4.border-emerald-500"),
      },
      {
        num: 4,
        label: "Open Official Scanned PDF Viewer Action Button",
        box: await getBox(page, "button:has-text('Tingnan ang Opisyal na PDF')"),
      },
      {
        num: 5,
        label: "Structured Legal Articles & Sections Container",
        box: await getBox(page, "div:has(> div > h2:has-text('Articles & Sections')), div:has(> h2:has-text('Articles & Sections'))"),
      },
    ];
    await saveScreenshot(
      "citizen",
      "citizen_02_ordinance_detail",
      "citizen_02_ordinance_detail.png",
      "Split-Screen Ordinance Detail & Legal Provisions View",
      "Structured presentation of ordinance text, breaking complex legislation into readable articles, penalties, and enforcement mechanisms.",
      citizen02Elements
    );

    // 6. PDF Viewer Modal
    const openPdfButton = await page.$("button:has-text('Tingnan ang Opisyal na PDF')");
    if (openPdfButton) {
      await openPdfButton.click();
      await page.waitForTimeout(800);
    }
    const citizen03Elements = [
      {
        num: 1,
        label: "Official Document Modal Dialog Header & Identifier",
        box: await getBox(page, "h3#modal-title"),
      },
      {
        num: 2,
        label: "Embedded Digital PDF Document Canvas",
        box: await getBox(page, "div[role='dialog'] div.flex-1.w-full"),
      },
      {
        num: 3,
        label: "Direct PDF File Download Action Button",
        box: await getBox(page, "div[role='dialog'] button:has-text('I-download ang PDF')"),
      },
      {
        num: 4,
        label: "Open in Dedicated Full-Screen Tab Button",
        box: await getBox(page, "div[role='dialog'] button:has-text('Buksan sa Bagong Tab')"),
      },
      {
        num: 5,
        label: "Modal Dismiss / Close Action (Esc)",
        box: await getBox(page, "button[aria-label='Isara ang modal']"),
      },
    ];
    await saveScreenshot(
      "citizen",
      "citizen_03_pdf_modal",
      "citizen_03_pdf_modal.png",
      "Official Scanned PDF Viewer Modal",
      "Integrated in-browser document viewer allowing residents to examine official stamped ordinances, zoom into signatures, and download verified copies.",
      citizen03Elements
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // 7. AI Civic Assistant
    await page.goto(`${BASE_URL}/chatbot`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const citizen04Elements = [
      {
        num: 1,
        label: "Civic Safety & Informational Disclaimer Notice",
        box: await getBox(page, "div.rounded-xl.border-amber-500\\/30"),
      },
      {
        num: 2,
        label: "Preset Quick Action Inquiry Buttons",
        box: await getBox(page, "div.space-y-2:has(button)"),
      },
      {
        num: 3,
        label: "Bilingual Question Input Field",
        box: await getBox(page, "input[placeholder*='ordinance inquiry']"),
      },
      {
        num: 4,
        label: "Send Message Action Button",
        box: await getBox(page, "button[type='submit']:has-text('➔')"),
      },
      {
        num: 5,
        label: "Official Informational Banner & Citation Notice",
        box: await getBox(page, "div.mt-3.text-center.font-mono"),
      },
    ];
    await saveScreenshot(
      "citizen",
      "citizen_04_ai_assistant",
      "citizen_04_ai_assistant.png",
      "Cabanatuan Ordinance AI — Bilingual Civic Assistant",
      "Retrieval-Augmented Generation (RAG) assistant powered by Google Gemini, answering citizen inquiries with official ordinance citations.",
      citizen04Elements
    );

    // 8. Community Incident Reporting Form
    await page.goto(`${BASE_URL}/report`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const citizen05Elements = [
      {
        num: 1,
        label: "24/7 City Emergency Hotline Numbers Banner",
        box: await getBox(page, "div.rounded-2xl.border-red-200\\/80, div.rounded-2xl.bg-red-50\\/80"),
      },
      {
        num: 2,
        label: "Assigned Barangay Jurisdiction Dropdown",
        box: await getBox(page, "select#barangay-select"),
      },
      {
        num: 3,
        label: "Incident Category Selector",
        box: await getBox(page, "select#category-select"),
      },
      {
        num: 4,
        label: "Incident Subject / Summary Input Field",
        box: await getBox(page, "input[placeholder*='Nakatambak na basura']"),
      },
      {
        num: 5,
        label: "Incident Narrative & Location Details Textarea",
        box: await getBox(page, "textarea#report-details"),
      },
      {
        num: 6,
        label: "Anonymous Reporting Toggle",
        box: await getBox(page, "div:has(> input#anonymous-check)"),
      },
      {
        num: 7,
        label: "Submit Incident Report Action Button",
        box: await getBox(page, "button:has-text('I-sumite ang Ulat sa Barangay')"),
      },
    ];
    await saveScreenshot(
      "citizen",
      "citizen_05_community_report_form",
      "citizen_05_community_report_form.png",
      "Community Incident Reporting Desk",
      "Citizen incident submission interface equipped with client-side draft auto-save persistence and direct routing to barangay halls.",
      citizen05Elements
    );

    // 9. Report Submitted Confirmation
    await page.selectOption("select#barangay-select", { index: 1 });
    await page.fill("input[placeholder*='Nakatambak na basura']", "Pagsusunog ng tuyong dahon at basura sa bakuran");
    await page.fill("textarea#report-details", "May patuloy na pagsusunog ng dahon tuwing hapon na nagdudulot ng makapal na usok sa komunidad.");
    await page.click("button:has-text('I-sumite ang Ulat sa Barangay')");
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const citizen06Elements = [
      {
        num: 1,
        label: "Official Submission Confirmation Alert Banner",
        box: await getBox(page, "div[role='alert']"),
      },
      {
        num: 2,
        label: "Draft Auto-Save Status Bar",
        box: await getBox(page, "div.mb-6.flex.items-center.justify-between"),
      },
      {
        num: 3,
        label: "Reset & Clear Form Action Button",
        box: await getBox(page, "button:has-text('I-clear ang Draft')"),
      },
    ];
    await saveScreenshot(
      "citizen",
      "citizen_06_report_submitted",
      "citizen_06_report_submitted.png",
      "Submission Confirmation & Tracking Reference",
      "Confirmation alert providing a unique tracking code for citizen verification, seamlessly connecting to barangay admin triage.",
      citizen06Elements
    );

    // 10. Civic News & Advisories
    await page.goto(`${BASE_URL}/news`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const citizen07Elements = [
      {
        num: 1,
        label: "Civic News & Legislative Advisories Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Official LGU Public Authority Badge",
        box: await getBox(page, "div:has(> span:has-text('OPISYAL NA ANUNSYO'))"),
      },
      {
        num: 3,
        label: "Official Executive Advisory Card",
        box: await getBox(page, "div.space-y-6 > div:first-child"),
      },
      {
        num: 4,
        label: "Publication Date & Civic Category Badge",
        box: await getBox(page, "div.space-y-6 > div:first-child div.flex.items-center.gap-2"),
      },
      {
        num: 5,
        label: "Executive Directive Content Narrative",
        box: await getBox(page, "div.space-y-6 > div:first-child p"),
      },
    ];
    await saveScreenshot(
      "citizen",
      "citizen_07_civic_news",
      "citizen_07_civic_news.png",
      "City Hall News & Barangay Advisories Feed",
      "Public information broadcast feed synchronizing official legislative reminders and community announcements across Cabanatuan City.",
      citizen07Elements
    );

    // =========================================================================
    // SECTION 3: BARANGAY ADMINISTRATOR WORKFLOWS (7 SCREENS)
    // =========================================================================
    console.log("\n--- Section 3: Barangay Administrator Screens ---");

    // Login as Kapitan Juan Del Rosario (Camp Tinio)
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#email-input", "kapitan@cabanatuan.gov.ph");
    await page.fill("#password-input", "kapitan123");
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes("/admin/barangay")),
      page.click("button[type='submit']"),
    ]);
    await page.waitForTimeout(800);

    // 11. Barangay Dashboard
    await page.goto(`${BASE_URL}/admin/barangay`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const barangay01Elements = [
      {
        num: 1,
        label: "Barangay Governance Dashboard Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Local Governance Welcome Banner",
        box: await getBox(page, "div.rounded-\\[var\\(--radius-lg\\)\\].border-emerald-500\\/20"),
      },
      {
        num: 3,
        label: "Submit New Ordinance Quick Action Button",
        box: await getBox(page, "a[href='/admin/barangay/ordinances']:has-text('+ Magsumite ng Ordinansa')"),
      },
      {
        num: 4,
        label: "Local Enacted Ordinances Metric Card",
        box: await getBox(page, "section[aria-labelledby='brgy-stats-heading'] > div.grid > div:nth-child(1)"),
      },
      {
        num: 5,
        label: "Pending Legislative Proposals Metric Card",
        box: await getBox(page, "section[aria-labelledby='brgy-stats-heading'] > div.grid > div:nth-child(2)"),
      },
      {
        num: 6,
        label: "Active Community Incident Reports Metric Card",
        box: await getBox(page, "section[aria-labelledby='brgy-stats-heading'] > div.grid > div:nth-child(3)"),
      },
      {
        num: 7,
        label: "Barangay Admin Dedicated Navigation Sidebar",
        box: await getBox(page, "aside"),
      },
    ];
    await saveScreenshot(
      "barangay_admin",
      "barangay_01_dashboard",
      "barangay_01_dashboard.png",
      "Barangay Governance Dashboard (Camp Tinio)",
      "Localized dashboard scoped exclusively to Barangay Camp Tinio, displaying local ordinance counts, pending approvals, and constituent reports.",
      barangay01Elements
    );

    // 12. Barangay Ordinance Management
    await page.goto(`${BASE_URL}/admin/barangay/ordinances`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const barangay02Elements = [
      {
        num: 1,
        label: "Legislative Status Tabs (Lahat, Pending, Approved, Draft, Rejected)",
        box: await getBox(page, "div[role='tablist']"),
      },
      {
        num: 2,
        label: "Create / Propose New Ordinance Action Button",
        box: await getBox(page, "button:has-text('+ Magsumite ng Ordinansa')"),
      },
      {
        num: 3,
        label: "Local Ordinance Keyword Search Input",
        box: await getBox(page, "#search-brgy-ordinances"),
      },
      {
        num: 4,
        label: "Barangay Ordinance Records Table with Status Badges",
        box: await getBox(page, "table[aria-label='Mga ordinansa ng barangay']"),
      },
      {
        num: 5,
        label: "Item Action Controls (View, Edit Draft, Resubmit)",
        box: await getBox(page, "table tbody tr:first-child td:last-child a, table tbody tr:first-child td:last-child button"),
      },
    ];
    await saveScreenshot(
      "barangay_admin",
      "barangay_02_ordinance_management",
      "barangay_02_ordinance_management.png",
      "Barangay Ordinance Management & Repository",
      "Administrative table for managing local resolutions across their complete lifecycle: Drafts, Pending LGU Submissions, and Approved laws.",
      barangay02Elements
    );

    // 13. Draft Ordinance Creation Modal
    await page.click("button:has-text('+ Magsumite ng Ordinansa')");
    await page.waitForTimeout(600);

    const barangay03Elements = [
      {
        num: 1,
        label: "New Ordinance Proposal Modal Dialog Header",
        box: await getBox(page, "#submit-ordinance-title, h2:has-text('Ordinansa')"),
      },
      {
        num: 2,
        label: "Proposed Ordinance Title Input Field",
        box: await getBox(page, "input#ord-title"),
      },
      {
        num: 3,
        label: "Legislative Category Dropdown",
        box: await getBox(page, "select#ord-category"),
      },
      {
        num: 4,
        label: "Save as Draft Action Button (Internal Staging)",
        box: await getBox(page, "button:has-text('I-save bilang Draft')"),
      },
      {
        num: 5,
        label: "Submit to LGU for Approval Button (Official Transmittal)",
        box: await getBox(page, "button:has-text('Isumite para sa Pagsusuri')"),
      },
    ];
    await saveScreenshot(
      "barangay_admin",
      "barangay_03_draft_ordinance_modal",
      "barangay_03_draft_ordinance_modal.png",
      "Drafting & Transmitting Barangay Ordinances",
      "Multi-stage proposal form enabling officials to prepare local legislation, save works-in-progress as drafts, or transmit them directly to City Hall.",
      barangay03Elements
    );

    // 14. AI Document Extraction (Barangay Modal)
    const barangay04Elements = [
      {
        num: 1,
        label: "AI Auto-Extraction Section Header & Gemini Sparkle Badge",
        box: await getBox(page, "div.rounded-\\[var\\(--radius-md\\)\\].border-emerald-500\\/30"),
      },
      {
        num: 2,
        label: "Scanned Document PDF / Image File Dropzone",
        box: await getBox(page, "label:has(input[type='file'])"),
      },
      {
        num: 3,
        label: "Execute Multimodal AI Parsing Button ('I-Extract gamit ang AI')",
        box: await getBox(page, "button:has-text('I-Extract gamit ang AI')"),
      },
    ];
    await saveScreenshot(
      "barangay_admin",
      "barangay_04_ai_extraction_modal",
      "barangay_04_ai_extraction_modal.png",
      "AI Multimodal OCR Ordinance Extraction Interface",
      "Automated extraction tool utilizing Google Gemini to convert scanned physical paper ordinances into structured database records in seconds.",
      barangay04Elements
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // 15. Barangay Community Incident Reports
    await page.goto(`${BASE_URL}/admin/barangay/reports`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const barangay05Elements = [
      {
        num: 1,
        label: "Barangay Community Incident Reports Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Status Filter Tabs (Lahat, Bago, Inaaksyunan, Nalutas, Ibinasura)",
        box: await getBox(page, "div[role='tablist']"),
      },
      {
        num: 3,
        label: "Incident Reports Records Table",
        box: await getBox(page, "table[aria-label='Mga ulat ng komunidad ng barangay']"),
      },
      {
        num: 4,
        label: "Inline Status Triage & Resolution Dropdown Control",
        box: await getBox(page, "table tbody tr:first-child td:last-child select"),
      },
    ];
    await saveScreenshot(
      "barangay_admin",
      "barangay_05_community_reports",
      "barangay_05_community_reports.png",
      "Barangay Incident Reports Management Desk",
      "Triage desk where barangay officials monitor, inspect, and process violation reports submitted by local residents.",
      barangay05Elements
    );

    // 16. Report Triage Focus
    const barangay06Elements = [
      {
        num: 1,
        label: "Target Incident Report Record Row",
        box: await getBox(page, "table tbody tr:first-child"),
      },
      {
        num: 2,
        label: "Incident Classification Badge",
        box: await getBox(page, "table tbody tr:first-child td:nth-child(1)"),
      },
      {
        num: 3,
        label: "Reporter Information & Anonymity Verification",
        box: await getBox(page, "table tbody tr:first-child td:nth-child(3)"),
      },
      {
        num: 4,
        label: "Current Report Life-Cycle Status Badge",
        box: await getBox(page, "table tbody tr:first-child td:nth-child(4)"),
      },
      {
        num: 5,
        label: "Official Status Mutation & Triage Dropdown Selector",
        box: await getBox(page, "table tbody tr:first-child td:last-child select"),
      },
    ];
    await saveScreenshot(
      "barangay_admin",
      "barangay_06_report_triage_modal",
      "barangay_06_report_triage_modal.png",
      "Incident Report Triage & Resolution Processing",
      "Action dialog enabling barangay leaders to dispatch officers, record findings, and transition complaints to 'In Progress' or 'Resolved'.",
      barangay06Elements
    );

    // 17. Barangay Analytics & Ordinance Reports
    await page.goto(`${BASE_URL}/admin/barangay/ordinance-reports`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const barangay07Elements = [
      {
        num: 1,
        label: "Barangay-Scoped Legislative Reports Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Report Type Structure Selector Card",
        box: await getBox(page, "div.rounded-\\[var\\(--radius-md\\)\\].border:has(h2:has-text('Uri ng Ulat'))"),
      },
      {
        num: 3,
        label: "Multi-Criteria Filter Parameters Panel",
        box: await getBox(page, "div.rounded-\\[var\\(--radius-md\\)\\].border:has(h2:has-text('Mga Filter'))"),
      },
      {
        num: 4,
        label: "Generate Localized Report Action Button",
        box: await getBox(page, "button:has-text('I-generate ang Ulat')"),
      },
    ];
    await saveScreenshot(
      "barangay_admin",
      "barangay_07_ordinance_reports_analytics",
      "barangay_07_ordinance_reports_analytics.png",
      "Barangay Legislative Reports & Analytics Desk",
      "Reporting module allowing barangay officials to generate formatted summaries of local legislation for barangay hall records.",
      barangay07Elements
    );

    // =========================================================================
    // SECTION 4: LGU SUPER ADMINISTRATOR WORKFLOWS (10 SCREENS)
    // =========================================================================
    console.log("\n--- Section 4: LGU Super Administrator Screens ---");

    // Login as LGU Super Admin
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#email-input", "admin@cabanatuan.gov.ph");
    await page.fill("#password-input", "admin123");
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes("/admin/lgu")),
      page.click("button[type='submit']"),
    ]);
    await page.waitForTimeout(800);

    // 18. LGU Executive Dashboard
    await page.goto(`${BASE_URL}/admin/lgu`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const lgu01Elements = [
      {
        num: 1,
        label: "Executive Dashboard Header & City Hall Governance Scope",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "City-Wide KPI Cards (Total Ordinances, Approved, Pending, Drafts, Barangays)",
        box: await getBox(page, "section[aria-labelledby='stats-heading'] > div.grid"),
      },
      {
        num: 3,
        label: "Ordinance Status Life-Cycle Summary Grid",
        box: await getBox(page, "section[aria-labelledby='ord-summary-heading'] > div.grid"),
      },
      {
        num: 4,
        label: "Recent City-Wide Legislative Activity Log",
        box: await getBox(page, "table"),
      },
      {
        num: 5,
        label: "Full Executive Navigation Sidebar (8 Integrated Administrative Modules)",
        box: await getBox(page, "aside"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_01_executive_dashboard",
      "lgu_01_executive_dashboard.png",
      "City Government Executive Governance Dashboard",
      "Executive overview displaying city-wide legislative health metrics, pending barangay proposals, and real-time activity stream.",
      lgu01Elements
    );

    // 19. LGU Ordinance Repository
    await page.goto(`${BASE_URL}/admin/lgu/ordinances`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const lgu02Elements = [
      {
        num: 1,
        label: "Accessible Status Filter Tabs with Live Record Counters",
        box: await getBox(page, "div[role='tablist']"),
      },
      {
        num: 2,
        label: "Add City Ordinance Action Button ('+ Bagong City Ordinance')",
        box: await getBox(page, "button:has-text('+ Bagong City Ordinance')"),
      },
      {
        num: 3,
        label: "Instant City Ordinance Repository Search Input",
        box: await getBox(page, "#search-ordinances"),
      },
      {
        num: 4,
        label: "City-Wide Ordinance Repository Table with Jurisdiction Badges",
        box: await getBox(page, "table[aria-label='Lahat ng ordinansa']"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_02_ordinance_repository",
      "lgu_02_ordinance_repository.png",
      "City Ordinance Central Repository & Status Triage",
      "Central repository managing all official city ordinances and legislative proposals submitted by eighty-nine administrative barangays.",
      lgu02Elements
    );

    // 20. Review & Process Pending Barangay Ordinance Modal
    await page.click("div[role='tablist'] button:has-text('Pending')");
    await page.waitForTimeout(600);
    // Click Aprubahan on first pending item to trigger dialog
    const aprubBtn = await page.$("table tbody tr:first-child button:has-text('Aprubahan')");
    if (aprubBtn) {
      await aprubBtn.click();
      await page.waitForTimeout(600);
    }

    const lgu03Elements = [
      {
        num: 1,
        label: "Sangguniang Panlungsod Legislative Approval Dialog Header",
        box: await getBox(page, "div[role='alertdialog'] h2, div[role='alertdialog'] h3, div[role='dialog'] h2"),
      },
      {
        num: 2,
        label: "Pending Ordinance Title & Legal Enactment Notice",
        box: await getBox(page, "div[role='alertdialog'] p, div[role='dialog'] p"),
      },
      {
        num: 3,
        label: "Official Enactment / Approval Action Button ('Aprubahan')",
        box: await getBox(page, "div[role='alertdialog'] button:has-text('Aprubahan'), div[role='dialog'] button:has-text('Aprubahan')"),
      },
      {
        num: 4,
        label: "Dismiss Review / Return Button ('Bumalik')",
        box: await getBox(page, "div[role='alertdialog'] button:has-text('Bumalik'), div[role='dialog'] button:has-text('Bumalik')"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_03_review_approve_modal",
      "lgu_03_review_approve_modal.png",
      "Reviewing & Approving Barangay Ordinance Submissions",
      "Sangguniang Panlungsod review interface for evaluating proposed barangay ordinances, attaching official comments, and granting legal approval.",
      lgu03Elements
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // 21. AI Document Extraction (LGU Modal)
    await page.click("button:has-text('+ Bagong City Ordinance')");
    await page.waitForTimeout(600);

    const lgu04Elements = [
      {
        num: 1,
        label: "AI-Powered Multimodal OCR Ordinance Extractor Header",
        box: await getBox(page, "div.rounded-\\[var\\(--radius-md\\)\\].border-emerald-500\\/30"),
      },
      {
        num: 2,
        label: "Official Scanned Resolution Upload Dropzone",
        box: await getBox(page, "label:has(input[type='file'])"),
      },
      {
        num: 3,
        label: "Multimodal AI Parsing Execution Button",
        box: await getBox(page, "button:has-text('I-Extract gamit ang AI')"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_04_ai_document_extraction",
      "lgu_04_ai_document_extraction.png",
      "Multimodal OCR Ordinance Extractor (Powered by Gemini)",
      "High-throughput AI parser transforming scanned multi-page paper ordinances into verified digital records with tiered fine extraction.",
      lgu04Elements
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // 22. Official Accounts & User Management
    await page.goto(`${BASE_URL}/admin/lgu/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const lgu05Elements = [
      {
        num: 1,
        label: "City Government Official Personnel Roster Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Register New Official Action Button ('Magdagdag ng Opisyal')",
        box: await getBox(page, "button:has-text('Magdagdag ng Opisyal')"),
      },
      {
        num: 3,
        label: "Official Directory Table with Security Badges",
        box: await getBox(page, "table"),
      },
      {
        num: 4,
        label: "Role-Based Privilege Badges (LGU Admin vs Barangay Admin)",
        box: await getBox(page, "table tbody tr:first-child td:nth-child(3)"),
      },
      {
        num: 5,
        label: "Assigned Territorial Barangay Jurisdiction Tag",
        box: await getBox(page, "table tbody tr:first-child td:nth-child(4)"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_05_users_management",
      "lgu_05_users_management.png",
      "User Accounts & Barangay Officials Administration",
      "Administrative user directory for provisioning barangay captains and city personnel with cryptographically secure role-based access control.",
      lgu05Elements
    );

    // 23. Barangay Directory & Coverage
    await page.goto(`${BASE_URL}/admin/lgu/barangays`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const lgu06Elements = [
      {
        num: 1,
        label: "Cabanatuan City Barangay Directory Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Barangay Participation & Onboarding Indicators",
        box: await getBox(page, "div.grid.grid-cols-2.md\\:grid-cols-4.gap-4"),
      },
      {
        num: 3,
        label: "Barangay Search & Filter Input Field",
        box: await getBox(page, "input[placeholder*='Maghanap ng Barangay']"),
      },
      {
        num: 4,
        label: "Register New Barangay Action Button",
        box: await getBox(page, "button:has-text('+ Mag-rehistro ng Bagong Barangay')"),
      },
      {
        num: 5,
        label: "Barangay Directory Table with Ordinance & Report Counts",
        box: await getBox(page, "table"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_06_barangays_directory",
      "lgu_06_barangays_directory.png",
      "Barangay Directory & Territorial Coverage",
      "Directory tracking participation, enacted local resolutions, and administrative contacts across all eighty-nine barangays of Cabanatuan City.",
      lgu06Elements
    );

    // 24. City-Wide Community Reports Monitoring
    await page.goto(`${BASE_URL}/admin/lgu/reports`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const lgu07Elements = [
      {
        num: 1,
        label: "City-Wide Community Reports Monitoring Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Resolution Status Filter Tabs (Lahat, Bago, Inaaksyunan, Nalutas, Ibinasura)",
        box: await getBox(page, "div[role='tablist']"),
      },
      {
        num: 3,
        label: "Consolidated City-Wide Incident Records Table",
        box: await getBox(page, "table[aria-label='Mga ulat ng komunidad']"),
      },
      {
        num: 4,
        label: "Originating Barangay Jurisdiction Identification",
        box: await getBox(page, "table tbody tr:first-child td:nth-child(2)"),
      },
      {
        num: 5,
        label: "Current Operational Resolution Status Badge",
        box: await getBox(page, "table tbody tr:first-child td:nth-child(5)"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_07_city_reports_monitoring",
      "lgu_07_city_reports_monitoring.png",
      "City-Wide Community Reports Monitoring Desk",
      "Centralized supervisory desk enabling city hall administrators to monitor resident concerns and audit barangay action resolution times.",
      lgu07Elements
    );

    // 25. Civic News & Broadcast Advisories Management
    await page.goto(`${BASE_URL}/admin/lgu/news`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const lgu08Elements = [
      {
        num: 1,
        label: "Civic News & Legislative Broadcasts Desk Header",
        box: await getBox(page, "h1"),
      },
      {
        num: 2,
        label: "Publish New Advisory Action Button ('+ Magdagdag ng Anunsyo')",
        box: await getBox(page, "button:has-text('+ Magdagdag ng Anunsyo')"),
      },
      {
        num: 3,
        label: "Published Public News & Advisories Table",
        box: await getBox(page, "table"),
      },
      {
        num: 4,
        label: "Advisory Management Controls (Edit, Delete, Sync to Public Feed)",
        box: await getBox(page, "table tbody tr:first-child td:last-child"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_08_news_publishing",
      "lgu_08_news_publishing.png",
      "Civic News & Public Advisories Broadcast Desk",
      "Communication center for publishing legislative alerts, curfew reminders, and public health directives to the citizen-facing portal.",
      lgu08Elements
    );

    // 26. Legislative Report Generator
    await page.goto(`${BASE_URL}/admin/lgu/ordinance-reports`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // Click generate to show formal report preview and PDF download button
    const genReportBtn = await page.$("button:has-text('I-generate ang Ulat')");
    if (genReportBtn) {
      await genReportBtn.click();
      await page.waitForTimeout(800);
    }

    const lgu09Elements = [
      {
        num: 1,
        label: "Legislative Report Structure Selector Card (8 Standardized Structures)",
        box: await getBox(page, "div.rounded-\\[var\\(--radius-md\\)\\].border:has(h2:has-text('Uri ng Ulat'))"),
      },
      {
        num: 2,
        label: "Multi-Criteria Filter Parameters Panel (Year, Status, Category, Origin)",
        box: await getBox(page, "div.rounded-\\[var\\(--radius-md\\)\\].border:has(h2:has-text('Mga Filter'))"),
      },
      {
        num: 3,
        label: "Execute Report Generation Action Button",
        box: await getBox(page, "button:has-text('I-generate ang Ulat')"),
      },
      {
        num: 4,
        label: "Export Formal PDF Document Action Button ('I-download bilang PDF')",
        box: await getBox(page, "button:has-text('I-download bilang PDF')"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_09_legislative_report_generator",
      "lgu_09_legislative_report_generator.png",
      "Official Legislative Report Generator & PDF Exporter",
      "Formal reporting tool generating certified legislative summaries with official headers, serial codes, and tabular PDF document generation.",
      lgu09Elements
    );

    // 27. Governance Analytics & Trend Charts
    await page.goto(`${BASE_URL}/admin/lgu/analytics`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const lgu10Elements = [
      {
        num: 1,
        label: "Governance Analytics & Policy Intelligence Header Card",
        box: await getBox(page, "div.card-elevated:has(h2:has-text('LGU Executive Analytics Dashboard'))"),
      },
      {
        num: 2,
        label: "Legislative Year Filter Dropdown Selector",
        box: await getBox(page, "select#yr-select"),
      },
      {
        num: 3,
        label: "Executive Key Performance Indicators (KPI) Summary Banner",
        box: await getBox(page, "div.grid.grid-cols-2.lg\\:grid-cols-5.gap-4"),
      },
      {
        num: 4,
        label: "Policy Category Distribution Breakdown Chart",
        box: await getBox(page, "div.card-elevated:has(h3:has-text('Mga Ordinansa bawat Kategorya'))"),
      },
      {
        num: 5,
        label: "Legislative Status Breakdown Distribution Chart",
        box: await getBox(page, "div.card-elevated:has(h3:has-text('Status ng mga Ordinansa'))"),
      },
    ];
    await saveScreenshot(
      "lgu_admin",
      "lgu_10_analytics_charts",
      "lgu_10_analytics_charts.png",
      "Governance Analytics & Policy Trend Visualizations",
      "Interactive data visualization suite tracking legislative velocity, thematic distributions, and civic report resolution performance.",
      lgu10Elements
    );

    console.log("\n✅ All 27 Genuine Screenshots Successfully Captured at 1600x960!");

    // Save configuration JSON
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
    console.log(`\n📄 Configuration metadata saved to: ${CONFIG_FILE}`);

  } catch (err) {
    console.error("❌ Error capturing screenshots:", err);
    throw err;
  } finally {
    await browser.close();
    console.log("  🔒 Browser cleanly closed.");
  }
}

captureAll().catch((err) => {
  console.error("Capture process failed:", err);
  process.exit(1);
});
