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

async function getBox(page, selector, fallback = null) {
  try {
    const el = await page.$(selector);
    if (el) {
      const box = await el.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        return {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
      }
    }
  } catch (e) {
    // ignore
  }
  return fallback;
}

async function captureAll() {
  console.log("=======================================================");
  console.log("  📸 CAPTURING GENUINE APPLICATION SCREENSHOTS");
  console.log("=======================================================\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const config = {
    generatedAt: new Date().toISOString(),
    viewport: { width: 1280, height: 800 },
    screenshots: {},
  };

  // Helper to record screenshot and its elements
  async function saveScreenshot(role, name, filename, title, caption, elements) {
    const relativePath = path.join(role, filename);
    const fullPath = path.join(SCREENSHOTS_ORIG_DIR, relativePath);
    await page.screenshot({ path: fullPath });
    console.log(`  ✓ Captured [${role}] ${name} -> ${relativePath}`);

    config.screenshots[name] = {
      role,
      name,
      filename,
      originalPath: fullPath,
      annotatedFilename: filename.replace(".png", "_annotated.png"),
      title,
      caption,
      elements,
    };
  }

  try {
    // =========================================================================
    // SECTION 1: COMMON & AUTHENTICATION
    // =========================================================================
    console.log("\n--- Capturing Common & Authentication Screens ---");

    // 1. Homepage Hero (Light Mode)
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const common01Elements = [
      {
        num: 1,
        label: "Cabanatuan City Seal & Portal Branding",
        box: (await getBox(page, "header a[href='/']")) || { x: 32, y: 16, width: 260, height: 48 },
      },
      {
        num: 2,
        label: "Main Navigation Bar",
        box: (await getBox(page, "header nav")) || { x: 350, y: 16, width: 550, height: 48 },
      },
      {
        num: 3,
        label: "Hero Search Bar",
        box: (await getBox(page, "input[placeholder*='Maghanap']")) || { x: 260, y: 280, width: 760, height: 56 },
      },
      {
        num: 4,
        label: "Quick Category Discovery Chips",
        box: (await getBox(page, "div.flex-wrap:has(a[href*='/ordinances?category='])")) || { x: 260, y: 350, width: 760, height: 42 },
      },
      {
        num: 5,
        label: "Interactive 3D Ordinance Archive Canvas",
        box: (await getBox(page, "canvas")) || { x: 100, y: 440, width: 1080, height: 320 },
      },
      {
        num: 6,
        label: "Portal Theme Toggle (Dark/Light)",
        box: (await getBox(page, "button:has-text('Theme'), button[aria-label*='theme' i]")) || { x: 1200, y: 20, width: 44, height: 44 },
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
        box: (await getBox(page, "header")) || { x: 32, y: 24, width: 1216, height: 50 },
      },
      {
        num: 2,
        label: "Official Email Address Input Field",
        box: (await getBox(page, "#email-input")) || { x: 680, y: 260, width: 380, height: 46 },
      },
      {
        num: 3,
        label: "Password Input Field",
        box: (await getBox(page, "#password-input")) || { x: 680, y: 340, width: 380, height: 46 },
      },
      {
        num: 4,
        label: "Sign In / Submit Button (Pumasok sa Portal)",
        box: (await getBox(page, "button[type='submit']")) || { x: 680, y: 420, width: 380, height: 46 },
      },
      {
        num: 5,
        label: "Quick Role Preset Access Chips",
        box: (await getBox(page, "div:has(button:has-text('admin@cabanatuan.gov.ph'))")) || { x: 680, y: 480, width: 380, height: 60 },
      },
      {
        num: 6,
        label: "Return to Public Portal Homepage Link",
        box: (await getBox(page, "a:has-text('Bumalik sa Home')")) || { x: 1100, y: 24, width: 140, height: 36 },
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
    const themeBtn = await page.$("button:has-text('Theme'), button[aria-label*='theme' i]");
    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(600);
    }
    const common03Elements = [
      {
        num: 1,
        label: "Dark High-Contrast Civic Header",
        box: (await getBox(page, "header")) || { x: 32, y: 16, width: 1216, height: 50 },
      },
      {
        num: 2,
        label: "Active Dark Mode Theme Toggle",
        box: (await getBox(page, "button:has-text('Theme'), button[aria-label*='theme' i]")) || { x: 1200, y: 20, width: 44, height: 44 },
      },
      {
        num: 3,
        label: "Dark Glassmorphic Search & Suggestion Bar",
        box: (await getBox(page, "input[placeholder*='Maghanap']")) || { x: 260, y: 280, width: 760, height: 56 },
      },
      {
        num: 4,
        label: "Interactive 3D Cylinder Archive (Dark Scheme)",
        box: (await getBox(page, "canvas")) || { x: 100, y: 440, width: 1080, height: 320 },
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

    // Reset back to light theme for crisp documentation
    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(400);
    }

    // =========================================================================
    // SECTION 2: CITIZEN / PUBLIC END-USER WORKFLOWS
    // =========================================================================
    console.log("\n--- Capturing Citizen / Public User Screens ---");

    // 4. Ordinance Explorer
    await page.goto(`${BASE_URL}/ordinances`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const citizen01Elements = [
      {
        num: 1,
        label: "Full-Text Keyword Search Input",
        box: (await getBox(page, "input[placeholder*='Maghanap']")) || { x: 48, y: 100, width: 450, height: 44 },
      },
      {
        num: 2,
        label: "Policy Category Filter Chips",
        box: (await getBox(page, "div.flex-wrap:has(button)")) || { x: 48, y: 160, width: 800, height: 40 },
      },
      {
        num: 3,
        label: "Dynamic Year Range Filter Slider",
        box: (await getBox(page, "div:has(input[type='range'])")) || { x: 880, y: 100, width: 350, height: 60 },
      },
      {
        num: 4,
        label: "Jurisdiction Scope Filter (City vs Barangay)",
        box: (await getBox(page, "div:has(button:has-text('City'))")) || { x: 48, y: 215, width: 350, height: 36 },
      },
      {
        num: 5,
        label: "Ordinance Card Grid with Status & Category Tags",
        box: (await getBox(page, "div.grid:has(a[href^='/ordinances/'])")) || { x: 48, y: 270, width: 1184, height: 500 },
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

    // 5. Ordinance Detail Page (Split Screen)
    const firstOrdLink = await page.$("a[href^='/ordinances/']");
    const ordUrl = firstOrdLink ? await firstOrdLink.getAttribute("href") : "/ordinances/002-2024";
    await page.goto(`${BASE_URL}${ordUrl}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const citizen02Elements = [
      {
        num: 1,
        label: "Official Ordinance Title & Resolution Number",
        box: (await getBox(page, "h1")) || { x: 48, y: 90, width: 750, height: 60 },
      },
      {
        num: 2,
        label: "Legislative Metadata (Date, Series Year, Enacting Body)",
        box: (await getBox(page, "div:has(span:has-text('Resolution'))")) || { x: 48, y: 160, width: 750, height: 40 },
      },
      {
        num: 3,
        label: "Structured Legal Articles & Provisions (Split-Screen Left)",
        box: (await getBox(page, "div.space-y-6, article")) || { x: 48, y: 220, width: 750, height: 540 },
      },
      {
        num: 4,
        label: "Summary, Sanctions & Tiered Penalties Card (Right)",
        box: (await getBox(page, "aside, div:has(h3:has-text('Penalties'))")) || { x: 830, y: 220, width: 400, height: 320 },
      },
      {
        num: 5,
        label: "Open Official PDF Document Viewer Button",
        box: (await getBox(page, "button:has-text('PDF'), button:has-text('Buksan')")) || { x: 830, y: 560, width: 400, height: 46 },
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
    const openPdfBtn = await page.$("button:has-text('PDF'), button:has-text('Buksan')");
    if (openPdfBtn) {
      await openPdfBtn.click();
      await page.waitForTimeout(1000);
    }
    const citizen03Elements = [
      {
        num: 1,
        label: "Official Document Modal Dialog Header",
        box: (await getBox(page, "[role='dialog'] h2, [role='dialog'] header")) || { x: 180, y: 40, width: 920, height: 50 },
      },
      {
        num: 2,
        label: "Embedded Digital PDF Document Canvas",
        box: (await getBox(page, "[role='dialog'] iframe, [role='dialog'] embed, [role='dialog'] canvas")) || { x: 200, y: 100, width: 880, height: 620 },
      },
      {
        num: 3,
        label: "Interactive Zoom & Pagination Controls",
        box: (await getBox(page, "[role='dialog'] div:has(button:has-text('+'))")) || { x: 750, y: 45, width: 180, height: 38 },
      },
      {
        num: 4,
        label: "Direct PDF File Download Action Button",
        box: (await getBox(page, "[role='dialog'] a:has-text('Download'), [role='dialog'] button:has-text('Download')")) || { x: 940, y: 45, width: 120, height: 38 },
      },
      {
        num: 5,
        label: "Modal Dismiss / Close Action (Esc)",
        box: (await getBox(page, "[role='dialog'] button[aria-label*='close' i], [role='dialog'] button:has-text('✕')")) || { x: 1070, y: 45, width: 36, height: 36 },
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

    // 7. AI Civic Assistant (Chatbot)
    await page.goto(`${BASE_URL}/chatbot`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Click a sample question to trigger realistic conversation
    const sampleQueryBtn = await page.$("button:has-text('Curfew'), button:has-text('basura')");
    if (sampleQueryBtn) {
      await sampleQueryBtn.click();
      await page.waitForTimeout(3000); // Wait for Gemini stream
    }

    const citizen04Elements = [
      {
        num: 1,
        label: "Civic Safety & Informational Disclaimer Banner",
        box: (await getBox(page, "div.text-center:has-text('IMBAKAN')")) || { x: 80, y: 80, width: 1120, height: 40 },
      },
      {
        num: 2,
        label: "Quick Common Inquiry Action Buttons",
        box: (await getBox(page, "div.flex-wrap:has(button)")) || { x: 80, y: 130, width: 1120, height: 44 },
      },
      {
        num: 3,
        label: "Citizen Inquiry Message Bubble",
        box: (await getBox(page, "div.flex-row-reverse")) || { x: 450, y: 200, width: 750, height: 60 },
      },
      {
        num: 4,
        label: "Gemini RAG Assistant Answer with Ordinance Citations",
        box: (await getBox(page, "div:has(div.text-emerald-600) + div")) || { x: 80, y: 280, width: 950, height: 260 },
      },
      {
        num: 5,
        label: "Bilingual Question Input Field",
        box: (await getBox(page, "input[placeholder*='ordinance inquiry']")) || { x: 80, y: 680, width: 1040, height: 48 },
      },
      {
        num: 6,
        label: "Send Message Action Button",
        box: (await getBox(page, "button[type='submit']:has-text('➔')")) || { x: 1130, y: 680, width: 48, height: 48 },
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
    await page.waitForTimeout(800);

    const citizen05Elements = [
      {
        num: 1,
        label: "24/7 City Emergency Hotline Numbers Banner",
        box: (await getBox(page, "div:has(h3:has-text('Emergency Hotline'))")) || { x: 310, y: 120, width: 660, height: 130 },
      },
      {
        num: 2,
        label: "Assigned Barangay Jurisdiction Dropdown",
        box: (await getBox(page, "select#barangay-select, select:has(option)")) || { x: 310, y: 270, width: 660, height: 44 },
      },
      {
        num: 3,
        label: "Incident Category Selector",
        box: (await getBox(page, "select#category-select, div:has(label:has-text('Kategorya')) select")) || { x: 310, y: 340, width: 660, height: 44 },
      },
      {
        num: 4,
        label: "Incident Subject / Summary Input Field",
        box: (await getBox(page, "input#subject-input, input[name='subject']")) || { x: 310, y: 410, width: 660, height: 44 },
      },
      {
        num: 5,
        label: "Incident Narrative & Location Details Textarea",
        box: (await getBox(page, "textarea#details-input, textarea[name='details']")) || { x: 310, y: 480, width: 660, height: 120 },
      },
      {
        num: 6,
        label: "Anonymous Reporting Toggle & Contact Fields",
        box: (await getBox(page, "div:has(input[type='checkbox'])")) || { x: 310, y: 620, width: 660, height: 50 },
      },
      {
        num: 7,
        label: "Submit Incident Report Action Button",
        box: (await getBox(page, "button:has-text('I-sumite')")) || { x: 310, y: 690, width: 660, height: 46 },
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
    // Fill the report form to trigger confirmation
    try {
      const bgySelect = await page.$("select");
      if (bgySelect) {
        await bgySelect.selectOption({ index: 1 });
      }
      const subjectInput = await page.$("input[type='text']:not([readonly])");
      if (subjectInput) {
        await subjectInput.fill("Pagsusunog ng tuyong dahon at basura sa bakuran");
      }
      const detailsInput = await page.$("textarea");
      if (detailsInput) {
        await detailsInput.fill("May patuloy na pagsusunog ng basura sa tabi ng kalsada tuwing hapon na nagdudulot ng makapal na usok.");
      }
      const submitBtn = await page.$("button:has-text('I-sumite')");
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log("Note on report submission:", e.message);
    }

    const citizen06Elements = [
      {
        num: 1,
        label: "Official Submission Confirmation Alert Banner",
        box: (await getBox(page, "[role='alert'], div.bg-emerald-500\\/10, div:has-text('Matagumpay')")) || { x: 310, y: 140, width: 660, height: 180 },
      },
      {
        num: 2,
        label: "Target Barangay Hall Routing Notification",
        box: (await getBox(page, "div:has-text('Barangay')")) || { x: 330, y: 190, width: 620, height: 40 },
      },
      {
        num: 3,
        label: "Official Tracking Reference Code",
        box: (await getBox(page, "span.font-mono, code")) || { x: 330, y: 240, width: 620, height: 35 },
      },
      {
        num: 4,
        label: "File Another Report / Return Option",
        box: (await getBox(page, "button:has-text('panibagong'), button:has-text('Bumalik')")) || { x: 330, y: 290, width: 220, height: 40 },
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
        box: (await getBox(page, "h1")) || { x: 48, y: 80, width: 500, height: 50 },
      },
      {
        num: 2,
        label: "News Category Filter Tabs (Lahat, Lungsod, Barangay)",
        box: (await getBox(page, "div:has(button:has-text('Lahat'))")) || { x: 48, y: 140, width: 400, height: 40 },
      },
      {
        num: 3,
        label: "Pinned Official Executive Advisory Card",
        box: (await getBox(page, "article:has(span:has-text('Pinned')), article:first-of-type")) || { x: 48, y: 200, width: 1184, height: 180 },
      },
      {
        num: 4,
        label: "Chronological Community News Feed",
        box: (await getBox(page, "div.grid:has(article), div.space-y-4:has(article)")) || { x: 48, y: 400, width: 1184, height: 360 },
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
    // SECTION 3: BARANGAY ADMINISTRATOR WORKFLOWS
    // =========================================================================
    console.log("\n--- Capturing Barangay Administrator Screens ---");

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
        label: "Barangay-Scoped Header ('Barangay Governance Dashboard — Camp Tinio')",
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 650, height: 40 },
      },
      {
        num: 2,
        label: "Local Enacted Ordinances Metric Card",
        box: (await getBox(page, "div:has-text('Ordinansa'):has-text('Kabuuang')")) || { x: 260, y: 90, width: 220, height: 110 },
      },
      {
        num: 3,
        label: "Pending Legislative Proposals Metric Card",
        box: (await getBox(page, "div:has-text('Nakabinbin'):has-text('LGU')")) || { x: 500, y: 90, width: 220, height: 110 },
      },
      {
        num: 4,
        label: "Active Community Incident Reports Metric Card",
        box: (await getBox(page, "div:has-text('Mga Ulat'):has-text('Residente')")) || { x: 740, y: 90, width: 220, height: 110 },
      },
      {
        num: 5,
        label: "Recent Community Incident Triage Feed",
        box: (await getBox(page, "div.rounded-2xl:has(table)")) || { x: 260, y: 220, width: 980, height: 500 },
      },
      {
        num: 6,
        label: "Barangay Admin Dedicated Navigation Sidebar",
        box: (await getBox(page, "aside, nav")) || { x: 0, y: 0, width: 240, height: 800 },
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
        box: (await getBox(page, "div:has(button:has-text('Lahat')):has(button:has-text('Pending'))")) || { x: 260, y: 90, width: 600, height: 44 },
      },
      {
        num: 2,
        label: "Create / Propose New Ordinance Action Button",
        box: (await getBox(page, "button:has-text('Magdagdag')")) || { x: 1040, y: 90, width: 200, height: 44 },
      },
      {
        num: 3,
        label: "Local Ordinance Keyword Search Input",
        box: (await getBox(page, "input[placeholder*='Maghanap']")) || { x: 260, y: 150, width: 450, height: 40 },
      },
      {
        num: 4,
        label: "Barangay Ordinance Records Table with Status Badges",
        box: (await getBox(page, "table")) || { x: 260, y: 210, width: 980, height: 520 },
      },
      {
        num: 5,
        label: "Item Action Controls (View, Edit Draft, Resubmit)",
        box: (await getBox(page, "table tbody tr:first-child td:last-child")) || { x: 1100, y: 260, width: 140, height: 45 },
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
    const addBgyOrdBtn = await page.$("button:has-text('Magdagdag')");
    if (addBgyOrdBtn) {
      await addBgyOrdBtn.click();
      await page.waitForTimeout(600);
    }
    const barangay03Elements = [
      {
        num: 1,
        label: "New Ordinance Proposal Modal Dialog Header",
        box: (await getBox(page, "[role='dialog'] h2, [role='dialog'] h3")) || { x: 300, y: 50, width: 680, height: 40 },
      },
      {
        num: 2,
        label: "Proposed Title & Resolution Number Input Fields",
        box: (await getBox(page, "[role='dialog'] input[name='title']")) || { x: 320, y: 110, width: 640, height: 44 },
      },
      {
        num: 3,
        label: "Legislative Category & Year Series Dropdowns",
        box: (await getBox(page, "[role='dialog'] select[name='category']")) || { x: 320, y: 175, width: 310, height: 44 },
      },
      {
        num: 4,
        label: "Legal Summary & Prohibited Acts Content Fields",
        box: (await getBox(page, "[role='dialog'] textarea[name='description']")) || { x: 320, y: 240, width: 640, height: 100 },
      },
      {
        num: 5,
        label: "Save as Draft Action Button (Internal Staging)",
        box: (await getBox(page, "[role='dialog'] button:has-text('Draft')")) || { x: 620, y: 680, width: 160, height: 44 },
      },
      {
        num: 6,
        label: "Submit to LGU for Approval Button (Official Transmittal)",
        box: (await getBox(page, "[role='dialog'] button:has-text('Isumite')")) || { x: 800, y: 680, width: 160, height: 44 },
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
    // Upload sample fixture to show AI extraction dropzone
    try {
      const fileInput = await page.$("[role='dialog'] input[type='file']");
      if (fileInput) {
        await fileInput.setInputFiles("test-fixtures/ordinance-sample-text.pdf");
        await page.waitForTimeout(600);
      }
    } catch (e) {
      console.log("Note on file input:", e.message);
    }

    const barangay04Elements = [
      {
        num: 1,
        label: "AI Auto-Extraction Section Header & Gemini Sparkle Badge",
        box: (await getBox(page, "[role='dialog'] div:has-text('AI Auto-Extraction')")) || { x: 320, y: 90, width: 640, height: 40 },
      },
      {
        num: 2,
        label: "Scanned Document PDF / Image File Dropzone",
        box: (await getBox(page, "[role='dialog'] div:has-text('I-drag ang file')")) || { x: 320, y: 140, width: 640, height: 90 },
      },
      {
        num: 3,
        label: "Execute Multimodal AI Parsing Button ('I-Extract gamit ang AI')",
        box: (await getBox(page, "[role='dialog'] button:has-text('Extract')")) || { x: 320, y: 240, width: 220, height: 40 },
      },
      {
        num: 4,
        label: "Multimodal OCR Status & Parsing Sequence",
        box: (await getBox(page, "[role='dialog'] div:has-text('Binabasa')")) || { x: 560, y: 240, width: 400, height: 40 },
      },
      {
        num: 5,
        label: "Auto-Populated Form Inputs with Human Verification",
        box: (await getBox(page, "[role='dialog'] div:has(input[name='title'])")) || { x: 320, y: 300, width: 640, height: 350 },
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
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 600, height: 40 },
      },
      {
        num: 2,
        label: "Status Filter Chips (Lahat, Bago, Inaaksyunan, Naresolba)",
        box: (await getBox(page, "div:has(button:has-text('Lahat')):has(button:has-text('Bago'))")) || { x: 260, y: 90, width: 500, height: 40 },
      },
      {
        num: 3,
        label: "Incident Report Record Row with Timestamp & Category",
        box: (await getBox(page, "table tbody tr:first-child")) || { x: 260, y: 210, width: 980, height: 50 },
      },
      {
        num: 4,
        label: "Constituent Anonymity / Contact Verification Badge",
        box: (await getBox(page, "table tbody tr:first-child td:nth-child(4)")) || { x: 800, y: 210, width: 150, height: 50 },
      },
      {
        num: 5,
        label: "Triage & Status Action Control",
        box: (await getBox(page, "table tbody tr:first-child td:last-child")) || { x: 1080, y: 210, width: 160, height: 50 },
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

    // 16. Report Triage & Action Modal
    const reportActionBtn = await page.$("table tbody tr:first-child button");
    if (reportActionBtn) {
      await reportActionBtn.click();
      await page.waitForTimeout(600);
    }
    const barangay06Elements = [
      {
        num: 1,
        label: "Incident Case Triage Dialog Header",
        box: (await getBox(page, "[role='dialog'] h2, [role='dialog'] h3")) || { x: 350, y: 100, width: 580, height: 40 },
      },
      {
        num: 2,
        label: "Constituent Incident Details & Evidence Overview",
        box: (await getBox(page, "[role='dialog'] div.space-y-4")) || { x: 370, y: 160, width: 540, height: 200 },
      },
      {
        num: 3,
        label: "Resolution Status Selector (Bago -> Inaaksyunan -> Naresolba)",
        box: (await getBox(page, "[role='dialog'] select")) || { x: 370, y: 380, width: 540, height: 44 },
      },
      {
        num: 4,
        label: "Barangay Official Action Remarks & Findings Field",
        box: (await getBox(page, "[role='dialog'] textarea")) || { x: 370, y: 440, width: 540, height: 90 },
      },
      {
        num: 5,
        label: "Confirm Status Update Action Button",
        box: (await getBox(page, "[role='dialog'] button:has-text('Update'), [role='dialog'] button:has-text('I-save')")) || { x: 740, y: 550, width: 170, height: 44 },
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
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // 17. Barangay Analytics & Ordinance Reports
    await page.goto(`${BASE_URL}/admin/barangay/ordinance-reports`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const barangay07Elements = [
      {
        num: 1,
        label: "Barangay-Scoped Legislative Reports Header",
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 600, height: 40 },
      },
      {
        num: 2,
        label: "Report Criteria & Category Selector",
        box: (await getBox(page, "div.grid:has(select)")) || { x: 260, y: 90, width: 980, height: 160 },
      },
      {
        num: 3,
        label: "Generate Localized Report Button",
        box: (await getBox(page, "button:has-text('I-generate')")) || { x: 260, y: 260, width: 200, height: 44 },
      },
      {
        num: 4,
        label: "Official Export & PDF Download Toolbar",
        box: (await getBox(page, "div:has(button:has-text('PDF'))")) || { x: 260, y: 330, width: 980, height: 80 },
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
    // SECTION 4: LGU SUPER ADMINISTRATOR WORKFLOWS
    // =========================================================================
    console.log("\n--- Capturing LGU Super Administrator Screens ---");

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
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 500, height: 40 },
      },
      {
        num: 2,
        label: "City-Wide KPI Cards (Total Ordinances, Approved, Pending, Drafts, Barangays)",
        box: (await getBox(page, "div.grid:has(div:has-text('Ordinansa'))")) || { x: 260, y: 90, width: 980, height: 120 },
      },
      {
        num: 3,
        label: "Quick Governance Action Shortcuts (Add Ordinance, Export, Reviews)",
        box: (await getBox(page, "div:has(a:has-text('Magdagdag'))")) || { x: 260, y: 230, width: 980, height: 60 },
      },
      {
        num: 4,
        label: "Recent City-Wide Legislative Activity Log",
        box: (await getBox(page, "div.rounded-2xl:has(table)")) || { x: 260, y: 310, width: 980, height: 450 },
      },
      {
        num: 5,
        label: "Full Executive Navigation Sidebar (8 Integrated Administrative Modules)",
        box: (await getBox(page, "aside, nav")) || { x: 0, y: 0, width: 240, height: 800 },
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
        box: (await getBox(page, "div:has(button:has-text('Lahat')):has(button:has-text('Pending'))")) || { x: 260, y: 90, width: 620, height: 44 },
      },
      {
        num: 2,
        label: "Instant City Ordinance Repository Search Input",
        box: (await getBox(page, "input[placeholder*='Maghanap']")) || { x: 260, y: 150, width: 450, height: 40 },
      },
      {
        num: 3,
        label: "Add City Ordinance / AI Document Parsing Action Button",
        box: (await getBox(page, "button:has-text('Magdagdag')")) || { x: 1040, y: 90, width: 200, height: 44 },
      },
      {
        num: 4,
        label: "City-Wide Ordinance Repository Table with Jurisdiction Badges",
        box: (await getBox(page, "table")) || { x: 260, y: 210, width: 980, height: 520 },
      },
      {
        num: 5,
        label: "Legislative Oversight Action Controls (Review, Enact, Delete)",
        box: (await getBox(page, "table tbody tr:first-child td:last-child")) || { x: 1080, y: 260, width: 160, height: 45 },
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
    const pendingTabBtn = await page.$("button:has-text('Pending')");
    if (pendingTabBtn) {
      await pendingTabBtn.click();
      await page.waitForTimeout(600);
    }
    const reviewBtn = await page.$("table tbody tr button:has-text('Suriin'), table tbody tr button:has-text('Review')");
    if (reviewBtn) {
      await reviewBtn.click();
      await page.waitForTimeout(600);
    }
    const lgu03Elements = [
      {
        num: 1,
        label: "Sangguniang Panlungsod Legislative Review Dialog Header",
        box: (await getBox(page, "[role='dialog'] h2, [role='dialog'] h3")) || { x: 350, y: 80, width: 580, height: 40 },
      },
      {
        num: 2,
        label: "Barangay Proposal Summary & Enactment Metadata",
        box: (await getBox(page, "[role='dialog'] div.space-y-4, [role='dialog'] p")) || { x: 370, y: 130, width: 540, height: 180 },
      },
      {
        num: 3,
        label: "City Legal Review Comments & Observation Remarks",
        box: (await getBox(page, "[role='dialog'] textarea")) || { x: 370, y: 330, width: 540, height: 90 },
      },
      {
        num: 4,
        label: "Official Enactment / Approval Action Button ('Aprubahan')",
        box: (await getBox(page, "[role='dialog'] button:has-text('Aprubahan')")) || { x: 550, y: 440, width: 170, height: 44 },
      },
      {
        num: 5,
        label: "Request Revision / Deny Submission Button ('Tanggihan')",
        box: (await getBox(page, "[role='dialog'] button:has-text('Tanggihan')")) || { x: 740, y: 440, width: 170, height: 44 },
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
    const addLguOrdBtn = await page.$("button:has-text('Magdagdag')");
    if (addLguOrdBtn) {
      await addLguOrdBtn.click();
      await page.waitForTimeout(600);
    }
    const lgu04Elements = [
      {
        num: 1,
        label: "AI-Powered Multimodal OCR Ordinance Extractor Header",
        box: (await getBox(page, "[role='dialog'] div:has-text('AI Auto-Extraction')")) || { x: 320, y: 80, width: 640, height: 40 },
      },
      {
        num: 2,
        label: "Official Scanned Resolution Upload Dropzone",
        box: (await getBox(page, "[role='dialog'] div:has-text('I-drag')")) || { x: 320, y: 130, width: 640, height: 90 },
      },
      {
        num: 3,
        label: "Multimodal AI Parsing Execution Button",
        box: (await getBox(page, "[role='dialog'] button:has-text('Extract')")) || { x: 320, y: 230, width: 220, height: 40 },
      },
      {
        num: 4,
        label: "Auto-Populated Resolution Number, Series & Enactment Date",
        box: (await getBox(page, "[role='dialog'] input[name='resolutionNumber']")) || { x: 320, y: 290, width: 310, height: 44 },
      },
      {
        num: 5,
        label: "Auto-Extracted Tiered Sanctions & Fines Breakdown",
        box: (await getBox(page, "[role='dialog'] textarea[name='penalties']")) || { x: 320, y: 480, width: 640, height: 80 },
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
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 500, height: 40 },
      },
      {
        num: 2,
        label: "Register New Official Action Button ('Magrehistro ng Opisyal')",
        box: (await getBox(page, "button:has-text('Magrehistro')")) || { x: 1040, y: 32, width: 200, height: 44 },
      },
      {
        num: 3,
        label: "Official Directory Table with Security Badges",
        box: (await getBox(page, "table")) || { x: 260, y: 100, width: 980, height: 620 },
      },
      {
        num: 4,
        label: "Role-Based Privilege Badges (LGU Admin vs Barangay Admin)",
        box: (await getBox(page, "table tbody tr:first-child td:nth-child(3)")) || { x: 620, y: 160, width: 140, height: 45 },
      },
      {
        num: 5,
        label: "Assigned Territorial Barangay Jurisdiction Tag",
        box: (await getBox(page, "table tbody tr:first-child td:nth-child(4)")) || { x: 780, y: 160, width: 180, height: 45 },
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
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 500, height: 40 },
      },
      {
        num: 2,
        label: "Active Participation & Onboarding Indicators",
        box: (await getBox(page, "div.grid:has(div:has-text('Aktibo'))")) || { x: 260, y: 90, width: 980, height: 180 },
      },
      {
        num: 3,
        label: "Registered Barangay Directory Cards with Ordinance Counters",
        box: (await getBox(page, "div.grid:has(div.rounded-2xl)")) || { x: 260, y: 290, width: 980, height: 450 },
      },
      {
        num: 4,
        label: "Local Jurisdiction Contact & Profile Shortcuts",
        box: (await getBox(page, "div.grid > div:first-child a")) || { x: 280, y: 400, width: 120, height: 36 },
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
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 600, height: 40 },
      },
      {
        num: 2,
        label: "Territorial Barangay Filter Dropdown (All 89 Barangays)",
        box: (await getBox(page, "select#barangay-filter, select:first-of-type")) || { x: 260, y: 90, width: 280, height: 42 },
      },
      {
        num: 3,
        label: "Resolution Status Filter Tabs (Lahat, Bago, Inaaksyunan, Naresolba)",
        box: (await getBox(page, "div:has(button:has-text('Lahat')):has(button:has-text('Bago'))")) || { x: 560, y: 90, width: 450, height: 42 },
      },
      {
        num: 4,
        label: "Consolidated City-Wide Incident Records Table",
        box: (await getBox(page, "table")) || { x: 260, y: 150, width: 980, height: 580 },
      },
      {
        num: 5,
        label: "Executive Incident Oversight & Status Update Action",
        box: (await getBox(page, "table tbody tr:first-child td:last-child")) || { x: 1080, y: 200, width: 160, height: 45 },
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
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 500, height: 40 },
      },
      {
        num: 2,
        label: "Publish New Advisory Action Button ('Maglathala ng Anunsyo')",
        box: (await getBox(page, "button:has-text('Maglathala')")) || { x: 1040, y: 32, width: 200, height: 44 },
      },
      {
        num: 3,
        label: "Published Public News & Emergency Advisories List",
        box: (await getBox(page, "div.space-y-4:has(article), table")) || { x: 260, y: 100, width: 980, height: 600 },
      },
      {
        num: 4,
        label: "Priority Pinning Toggle for Urgent Civic Directives",
        box: (await getBox(page, "article button:has-text('Pin'), article span:has-text('Pinned')")) || { x: 920, y: 120, width: 120, height: 36 },
      },
      {
        num: 5,
        label: "Advisory Management Controls (Edit, Delete, Sync to Public Feed)",
        box: (await getBox(page, "article button:has-text('Burahin')")) || { x: 1060, y: 120, width: 160, height: 36 },
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

    // Click "I-generate ang Ulat" to show live report preview
    const generateReportBtn = await page.$("button:has-text('I-generate')");
    if (generateReportBtn) {
      await generateReportBtn.click();
      await page.waitForTimeout(1000);
    }

    const lgu09Elements = [
      {
        num: 1,
        label: "Legislative Report Structure Selector (All, by Month, Barangay, Category, Status)",
        box: (await getBox(page, "div.space-y-3:has(button)")) || { x: 260, y: 90, width: 310, height: 260 },
      },
      {
        num: 2,
        label: "Multi-Criteria Filter Parameters (Year, Status, Category, Origin)",
        box: (await getBox(page, "div:has(label:has-text('Status'))")) || { x: 590, y: 90, width: 650, height: 160 },
      },
      {
        num: 3,
        label: "Execute Report Generation Action Button",
        box: (await getBox(page, "button:has-text('I-generate')")) || { x: 590, y: 260, width: 200, height: 44 },
      },
      {
        num: 4,
        label: "Official Government Header Preview with Cabanatuan City Seal",
        box: (await getBox(page, "div.print\\:block, div:has-text('REPUBLIC OF THE PHILIPPINES')")) || { x: 260, y: 380, width: 980, height: 120 },
      },
      {
        num: 5,
        label: "Export Formal PDF Document Action Button ('I-download bilang PDF')",
        box: (await getBox(page, "button:has-text('PDF')")) || { x: 1040, y: 325, width: 200, height: 44 },
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
    await page.waitForTimeout(800);

    const lgu10Elements = [
      {
        num: 1,
        label: "Governance Analytics & Policy Intelligence Header",
        box: (await getBox(page, "h1")) || { x: 260, y: 32, width: 600, height: 40 },
      },
      {
        num: 2,
        label: "Legislative Enactment Velocity Trend Chart (Yearly Trajectory)",
        box: (await getBox(page, "div.rounded-2xl:has(svg)")) || { x: 260, y: 90, width: 640, height: 320 },
      },
      {
        num: 3,
        label: "Policy Category Distribution Breakdown Chart",
        box: (await getBox(page, "div.rounded-2xl:has(div:has-text('Kategorya'))")) || { x: 920, y: 90, width: 320, height: 320 },
      },
      {
        num: 4,
        label: "Barangay Legislative Participation & Enactment Ranking",
        box: (await getBox(page, "div.rounded-2xl:has-text('Barangay')")) || { x: 260, y: 430, width: 480, height: 310 },
      },
      {
        num: 5,
        label: "Citizen Report Resolution Rate & Efficiency Metrics",
        box: (await getBox(page, "div.rounded-2xl:has-text('Resolution Rate')")) || { x: 760, y: 430, width: 480, height: 310 },
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

    console.log("\n✅ All 27 Genuine Screenshots Successfully Captured!");

    // Save configuration JSON
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
    console.log(`\n📄 Configuration metadata saved to: ${CONFIG_FILE}`);

  } catch (err) {
    console.error("❌ Error capturing screenshots:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

captureAll().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
