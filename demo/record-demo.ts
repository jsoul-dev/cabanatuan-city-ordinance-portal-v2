import { chromium, type Page, type Locator } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "demo", "output");
const TEMP_VIDEO_DIR = path.resolve(process.cwd(), "demo", "temp-recordings");
const TIMELINE_FILE = path.resolve(process.cwd(), "demo", "timeline.json");
const FRAMES_DIR = path.resolve(OUTPUT_DIR, "frames");

export type FlowType = "BARANGAY" | "LGU_ADMIN" | "CITIZEN" | "DEFENSE";

interface TimelineStep {
  stepNumber: number;
  flow: FlowType;
  title: string;
  description: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
}

const timeline: TimelineStep[] = [];
let recordingStartTime = 0;
let currentStepNumber = 0;
let currentStepStart = 0;
let currentFlow: FlowType = "BARANGAY";
let currentTitle = "";
let currentDescription = "";

function getElapsedSeconds(): number {
  return Number(((Date.now() - recordingStartTime) / 1000).toFixed(2));
}

async function startStep(
  page: Page,
  flow: FlowType,
  title: string,
  description: string
) {
  if (currentStepNumber > 0) {
    const endSec = getElapsedSeconds();
    timeline.push({
      stepNumber: currentStepNumber,
      flow: currentFlow,
      title: currentTitle,
      description: currentDescription,
      startSeconds: currentStepStart,
      endSeconds: endSec,
      durationSeconds: Number((endSec - currentStepStart).toFixed(2)),
    });
  }

  currentStepNumber++;
  currentFlow = flow;
  currentTitle = title;
  currentDescription = description;
  currentStepStart = getElapsedSeconds();

  const flowLabel =
    flow === "BARANGAY"
      ? "BARANGAY ADMIN"
      : flow === "LGU_ADMIN"
      ? "LGU SUPER ADMIN"
      : flow === "CITIZEN"
      ? "PUBLIC CITIZEN"
      : "DEFENSE DEMO";

  console.log(
    `\n🎬 [${flowLabel}] Step ${currentStepNumber} (${currentStepStart.toFixed(1)}s): ${title}`
  );
  console.log(`   ↳ ${description}`);

  await page.evaluate(
    ({ flowLabel, title, description }) => {
      // @ts-expect-error injected overlay
      window.__demoCursor?.setCaption(flowLabel, title, description);
    },
    { flowLabel, title, description }
  );
}

async function finishTimeline() {
  if (currentStepNumber > 0) {
    const endSec = getElapsedSeconds();
    timeline.push({
      stepNumber: currentStepNumber,
      flow: currentFlow,
      title: currentTitle,
      description: currentDescription,
      startSeconds: currentStepStart,
      endSeconds: endSec,
      durationSeconds: Number((endSec - currentStepStart).toFixed(2)),
    });
  }

  fs.writeFileSync(TIMELINE_FILE, JSON.stringify(timeline, null, 2), "utf-8");
  console.log(`\n📝 Timeline saved to ${TIMELINE_FILE} (${timeline.length} steps)`);
}

/**
 * Injected script that provides the custom animated cursor and caption overlay
 */
const OVERLAY_INIT_SCRIPT = fs.readFileSync(
  path.resolve(process.cwd(), "demo", "cursor-overlay.js"),
  "utf-8"
);

async function smoothMoveTo(page: Page, targetX: number, targetY: number, durationMs = 600) {
  // @ts-expect-error injected overlay
  const startPos = await page.evaluate(() => window.__demoCursor?.getPos() || { x: 960, y: 540 });
  const steps = Math.max(14, Math.floor(durationMs / 25));

  for (let i = 1; i <= steps; i++) {
    const elapsed = i / steps;
    // easeInOutCubic
    const t = elapsed < 0.5 ? 4 * elapsed * elapsed * elapsed : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
    const curX = startPos.x + (targetX - startPos.x) * t;
    const curY = startPos.y + (targetY - startPos.y) * t;
    // @ts-expect-error injected overlay
    await page.evaluate(({ x, y }) => window.__demoCursor?.setPos(x, y), { x: curX, y: curY });
    await page.mouse.move(curX, curY);
    await page.waitForTimeout(durationMs / steps);
  }
}

async function clickElement(page: Page, locator: Locator, options: { moveDuration?: number; pauseAfter?: number; timeout?: number } = {}) {
  const { moveDuration = 600, pauseAfter = 500, timeout = 6000 } = options;
  await locator.scrollIntoViewIfNeeded({ timeout }).catch(() => {});
  const box = await locator.boundingBox().catch(() => null);
  if (!box) {
    await locator.click({ timeout });
    return;
  }
  const targetX = Math.round(box.x + box.width / 2);
  const targetY = Math.round(box.y + box.height / 2);

  await smoothMoveTo(page, targetX, targetY, moveDuration);
  await page.waitForTimeout(100);

  // Press
  // @ts-expect-error injected overlay
  await page.evaluate(() => window.__demoCursor?.press());
  await page.waitForTimeout(80);

  // Click
  await locator.click({ force: true });

  // Release
  // @ts-expect-error injected overlay
  await page.evaluate(() => window.__demoCursor?.release());
  await page.waitForTimeout(pauseAfter);
}

async function hoverElement(page: Page, locator: Locator, duration = 600) {
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 4000 });
    const box = await locator.boundingBox();
    if (!box) return;
    const targetX = Math.round(box.x + box.width / 2);
    const targetY = Math.round(box.y + box.height / 2);
    await smoothMoveTo(page, targetX, targetY, duration);
  } catch {
    // Non-blocking
  }
}

async function navigateViaNav(page: Page, locator: Locator, targetUrlPath: string) {
  await clickElement(page, locator, { pauseAfter: 600 });
  try {
    await page.waitForURL(`**${targetUrlPath}**`, { timeout: 4000 });
  } catch {
    if (!page.url().includes(targetUrlPath)) {
      await page.goto(`${BASE_URL}${targetUrlPath}`);
    }
  }
  await pause(page, 700);
}

async function typeHuman(page: Page, locator: Locator, text: string) {
  await clickElement(page, locator, { pauseAfter: 150 });
  await locator.focus();
  await locator.fill("");
  await locator.pressSequentially(text, { delay: 24, timeout: 60000 });
  await page.waitForTimeout(200);
}

async function smoothScroll(page: Page, deltaY: number, steps = 20, delayPerStep = 28) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" }), deltaY / steps);
    await page.waitForTimeout(delayPerStep);
  }
}

async function pause(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function main() {
  console.log("🚀 Starting Cabanatuan City Ordinance Portal Defense Walkthrough Recording...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(TEMP_VIDEO_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  // Launch headed Chromium with 1920x1080 viewport and IDM-safe flags
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--window-size=1920,1080",
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
      "--disable-extensions",
      "--disable-default-apps",
      "--disable-component-extensions-with-background-pages",
      "--no-default-browser-check",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: TEMP_VIDEO_DIR,
      size: { width: 1920, height: 1080 },
    },
    acceptDownloads: true,
  });

  // Attach overlay init script so cursor and caption survive all navigations
  await context.addInitScript(OVERLAY_INIT_SCRIPT);

  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // Safeguard: handle downloads quietly without invoking external download managers
  page.on("download", async (download) => {
    try {
      const suggestedFilename = download.suggestedFilename();
      const savePath = path.join(OUTPUT_DIR, suggestedFilename);
      await download.saveAs(savePath);
      console.log(`[Playwright Download] Successfully captured: ${suggestedFilename}`);
    } catch {
      await download.cancel().catch(() => {});
    }
  });

  recordingStartTime = Date.now();

  try {
    // =========================================================================
    // PART 1: BARANGAY ADMIN FLOW (Punong Barangay Anita S. Pascual, Camp Tinio)
    // =========================================================================

    // STEP 1: Barangay Admin Sign In
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await startStep(
      page,
      "BARANGAY",
      "Barangay Admin Authentication",
      "Signing in to Barangay Camp Tinio administrative portal"
    );
    await pause(page, 1500);

    // Click quick-fill chip for Barangay Admin
    const brgyChip = page.locator('button:has-text("Barangay Admin")');
    await clickElement(page, brgyChip, { pauseAfter: 1000 });

    // Submit Sign in
    const signInBtn = page.locator('button[type="submit"]:has-text("Sign in")');
    await clickElement(page, signInBtn, { pauseAfter: 1500 });
    await page.waitForURL("**/admin/barangay**", { timeout: 15000 });

    // STEP 2: Barangay Dashboard Overview
    await startStep(
      page,
      "BARANGAY",
      "Barangay Governance Dashboard",
      "Localized metrics, Camp Tinio ordinances, and resident community reports"
    );
    await pause(page, 2000);

    // Hover stat cards
    const brgyCards = page.locator(".card-elevated, [class*='stat-card']");
    const countBrgyCards = await brgyCards.count();
    if (countBrgyCards > 0) {
      await hoverElement(page, brgyCards.first(), 700);
      await pause(page, 800);
      if (countBrgyCards > 1) {
        await hoverElement(page, brgyCards.nth(1), 700);
        await pause(page, 800);
      }
    }
    await smoothScroll(page, 300);
    await pause(page, 3000);
    await smoothScroll(page, -300);
    await pause(page, 1500);

    // STEP 3: Barangay Ordinances Management
    await startStep(
      page,
      "BARANGAY",
      "Barangay Legislative Management",
      "Reviewing local ordinances, statuses, and legislative proposals"
    );
    const brgyOrdinancesNav = page.locator('nav a[href="/admin/barangay/ordinances"]');
    await navigateViaNav(page, brgyOrdinancesNav, "/admin/barangay/ordinances");

    // Click status tabs
    const tabApproved = page.locator('button[role="tab"]:has-text("Approved")');
    if (await tabApproved.isVisible({ timeout: 2000 })) {
      await clickElement(page, tabApproved, { pauseAfter: 1200 });
      await pause(page, 1500);
    }
    const tabPending = page.locator('button[role="tab"]:has-text("Pending")');
    if (await tabPending.isVisible({ timeout: 2000 })) {
      await clickElement(page, tabPending, { pauseAfter: 1200 });
      await pause(page, 1500);
    }
    const tabAll = page.locator('button[role="tab"]:has-text("Lahat")');
    if (await tabAll.isVisible({ timeout: 2000 })) {
      await clickElement(page, tabAll, { pauseAfter: 1000 });
    }
    await smoothScroll(page, 240);
    await pause(page, 2500);
    await smoothScroll(page, -240);
    await pause(page, 1000);

    // STEP 4: Barangay Community Incident Reports Desk
    await startStep(
      page,
      "BARANGAY",
      "Barangay Incident Reports Desk",
      "Triage and processing of citizen reports submitted to Barangay Camp Tinio"
    );
    const brgyReportsNav = page.locator('nav a[href="/admin/barangay/reports"]');
    await navigateViaNav(page, brgyReportsNav, "/admin/barangay/reports");

    // Filter by Bago
    const brgyTabNew = page.locator('button[role="tab"]:has-text("Bago")');
    if (await brgyTabNew.isVisible({ timeout: 2000 })) {
      await clickElement(page, brgyTabNew, { pauseAfter: 1200 });
      await pause(page, 1500);
    }

    // Triage a report status from Bago to Inaaksyunan
    const reportSelect = page.locator('select[id^="brgy-status-"]').first();
    if (await reportSelect.isVisible({ timeout: 3000 })) {
      await clickElement(page, reportSelect, { pauseAfter: 600 });
      await reportSelect.selectOption("IN_PROGRESS");
      await reportSelect.dispatchEvent("change");
      await pause(page, 2000);
    }
    const brgyTabLahat = page.locator('button[role="tab"]:has-text("Lahat")');
    if (await brgyTabLahat.isVisible({ timeout: 2000 })) {
      await clickElement(page, brgyTabLahat, { pauseAfter: 1000 });
    }
    await pause(page, 3000);

    // STEP 5: Barangay Admin Sign Out
    await startStep(
      page,
      "BARANGAY",
      "Barangay Session Sign Out",
      "Signing out to transition to the City Hall LGU Super Admin flow"
    );
    const brgyLogoutBtn = page.locator('button[aria-label="Mag-logout"]').first();
    if (await brgyLogoutBtn.isVisible({ timeout: 3000 })) {
      await clickElement(page, brgyLogoutBtn, { pauseAfter: 1400 });
    } else {
      await page.goto(`${BASE_URL}/login`);
    }
    await page.waitForURL("**/login**");
    await pause(page, 1500);

    // =========================================================================
    // PART 2: LGU SUPER ADMIN FLOW (City Government / Sangguniang Panlungsod)
    // =========================================================================

    // STEP 6: LGU Super Admin Sign In
    await startStep(
      page,
      "LGU_ADMIN",
      "LGU Super Admin Authentication",
      "Logging in to the City Hall Executive Administration Portal"
    );
    const lguChip = page.locator('button:has-text("LGU Super Admin")');
    await clickElement(page, lguChip, { pauseAfter: 1000 });
    const lguSignInBtn = page.locator('button[type="submit"]:has-text("Sign in")');
    await clickElement(page, lguSignInBtn, { pauseAfter: 1400 });
    await page.waitForURL("**/admin/lgu**", { timeout: 15000 });

    // STEP 7: Executive Dashboard Overview
    await startStep(
      page,
      "LGU_ADMIN",
      "Executive Dashboard Overview",
      "City-wide metrics across all 89 barangays, ordinances, and pending reviews"
    );
    await pause(page, 2000);
    const lguCards = page.locator(".card-elevated, [class*='stat-card']");
    const countLguCards = await lguCards.count();
    if (countLguCards > 0) {
      await hoverElement(page, lguCards.first(), 700);
      await pause(page, 800);
      if (countLguCards > 1) {
        await hoverElement(page, lguCards.nth(1), 700);
        await pause(page, 800);
      }
    }
    await smoothScroll(page, 320);
    await pause(page, 3500);
    await smoothScroll(page, -320);
    await pause(page, 1500);

    // STEP 8: City-wide Ordinance Repository Management
    await startStep(
      page,
      "LGU_ADMIN",
      "City Ordinance Repository",
      "Filtering, searching, and managing city and barangay ordinances"
    );
    const lguOrdinancesNav = page.locator('nav a[href="/admin/lgu/ordinances"]');
    await navigateViaNav(page, lguOrdinancesNav, "/admin/lgu/ordinances");

    const searchInput = page.locator('input[placeholder*="Maghanap"]');
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await typeHuman(page, searchInput, "Tricycle");
      await pause(page, 1500);
      await searchInput.fill("");
      await pause(page, 1000);
    }
    await pause(page, 2000);

    // STEP 9: Legislative Review & Approval of Pending Barangay Proposal
    await startStep(
      page,
      "LGU_ADMIN",
      "Legislative Review & Approval",
      "Reviewing and formally approving a pending barangay ordinance submission"
    );
    const pendingTab = page.locator('button[role="tab"]:has-text("Pending")');
    if (await pendingTab.isVisible({ timeout: 2000 })) {
      await clickElement(page, pendingTab, { pauseAfter: 1200 });
      await pause(page, 1500);
    }

    const reviewActionBtn = page.locator('button[aria-label^="Aprubahan ang ordinansa"], button:has-text("Aprubahan")').first();
    if (await reviewActionBtn.isVisible({ timeout: 4000 })) {
      await clickElement(page, reviewActionBtn, { pauseAfter: 1200 });

      // Click Confirm button inside the alertdialog
      const confirmApproveBtn = page.locator('div[role="alertdialog"] button:has-text("Aprubahan"), div[role="dialog"] button:has-text("Aprubahan")').last();
      if (await confirmApproveBtn.isVisible({ timeout: 3000 })) {
        await clickElement(page, confirmApproveBtn, { pauseAfter: 1800 });
        await page.waitForSelector('div[role="alertdialog"], div[role="dialog"]', { state: "detached", timeout: 4000 }).catch(() => {});
      }
    }
    await pause(page, 3000);

    // STEP 10: Official Accounts Administration
    await startStep(
      page,
      "LGU_ADMIN",
      "Official Accounts Administration",
      "Managing registered barangay captains and administrative personnel"
    );
    const usersNav = page.locator('nav a[href="/admin/lgu/users"]');
    await navigateViaNav(page, usersNav, "/admin/lgu/users");
    await smoothScroll(page, 240);
    await pause(page, 3000);
    await smoothScroll(page, -240);
    await pause(page, 1000);

    // STEP 11: 89 Barangays Directory & Coverage
    await startStep(
      page,
      "LGU_ADMIN",
      "Barangay Directory & Coverage",
      "Monitoring Cabanatuan City's 89 administrative barangays"
    );
    const barangaysNav = page.locator('nav a[href="/admin/lgu/barangays"]');
    await navigateViaNav(page, barangaysNav, "/admin/lgu/barangays");
    await smoothScroll(page, 260);
    await pause(page, 3000);
    await smoothScroll(page, -260);
    await pause(page, 1000);

    // STEP 12: City-wide Community Reports Desk
    await startStep(
      page,
      "LGU_ADMIN",
      "City-Wide Community Reports Desk",
      "Monitoring citizen incident reports submitted across all barangays"
    );
    const reportsNav = page.locator('nav a[href="/admin/lgu/reports"]');
    await navigateViaNav(page, reportsNav, "/admin/lgu/reports");

    const newReportsTab = page.locator('button[role="tab"]:has-text("Bago")');
    if (await newReportsTab.isVisible({ timeout: 2000 })) {
      await clickElement(page, newReportsTab, { pauseAfter: 1200 });
      await pause(page, 1500);
    }
    const allReportsTab = page.locator('button[role="tab"]:has-text("Lahat")');
    if (await allReportsTab.isVisible({ timeout: 2000 })) {
      await clickElement(page, allReportsTab, { pauseAfter: 1000 });
    }
    await pause(page, 2500);

    // STEP 13: Legislative Report Generation & PDF Export
    await startStep(
      page,
      "LGU_ADMIN",
      "Legislative Report Generation",
      "Exporting official PDF documentation with Cabanatuan City seal"
    );
    const reportsGenNav = page.locator('nav a[href="/admin/lgu/ordinance-reports"]');
    await navigateViaNav(page, reportsGenNav, "/admin/lgu/ordinance-reports");

    const exportBtn = page.locator('button:has-text("I-download bilang PDF")');
    if (await exportBtn.isVisible({ timeout: 4000 })) {
      await clickElement(page, exportBtn, { pauseAfter: 1800 });
    }
    await pause(page, 3500);

    // STEP 14: Civic Governance Analytics
    await startStep(
      page,
      "LGU_ADMIN",
      "Civic Governance Analytics",
      "Interactive data charts, category distribution, and compliance trends"
    );
    const analyticsNav = page.locator('nav a[href="/admin/lgu/analytics"]');
    await navigateViaNav(page, analyticsNav, "/admin/lgu/analytics");
    await smoothScroll(page, 320);
    await pause(page, 3500);
    await smoothScroll(page, -320);
    await pause(page, 1500);

    // STEP 15: Administrative Session Sign Out
    await startStep(
      page,
      "LGU_ADMIN",
      "Administrative Session Sign Out",
      "Safely signing out to transition to the open Citizen Public Flow"
    );
    const lguLogoutBtn = page.locator('button[aria-label="Mag-logout"]').first();
    if (await lguLogoutBtn.isVisible({ timeout: 3000 })) {
      await clickElement(page, lguLogoutBtn, { pauseAfter: 1400 });
    } else {
      await page.goto(`${BASE_URL}/login`);
    }
    await page.waitForURL("**/login**");

    // Return to public home
    const backHomeBtn = page.locator('a:has-text("Bumalik sa Home")').first();
    if (await backHomeBtn.isVisible({ timeout: 3000 })) {
      await clickElement(page, backHomeBtn, { pauseAfter: 1400 });
    } else {
      await page.goto(`${BASE_URL}/`);
    }
    await page.waitForURL("**/");
    await pause(page, 1500);

    // =========================================================================
    // PART 3: PUBLIC CITIZEN FLOW (Zero Login Required — Open Public Access)
    // =========================================================================

    // STEP 16: Public Portal & 3D Ordinance Archive
    await startStep(
      page,
      "CITIZEN",
      "Public Portal & 3D Ordinance Archive",
      "Direct public access to Cabanatuan City's 3D digital ordinance collection without login"
    );
    await pause(page, 2000);

    // Interact with 3D canvas
    const canvas3d = page.locator("canvas").first();
    if (await canvas3d.isVisible({ timeout: 4000 })) {
      const box = await canvas3d.boundingBox();
      if (box) {
        const midX = Math.round(box.x + box.width / 2);
        const midY = Math.round(box.y + box.height / 2);
        await smoothMoveTo(page, midX, midY, 600);
        await page.mouse.down();
        await smoothMoveTo(page, midX + 160, midY, 800);
        await page.mouse.up();
        await pause(page, 1500);
      }
    }
    await smoothScroll(page, 360);
    await pause(page, 3000);
    await smoothScroll(page, -360);
    await pause(page, 1500);

    // STEP 17: Public Ordinance Search & Filters
    await startStep(
      page,
      "CITIZEN",
      "Ordinance Repository & Categorical Search",
      "Filtering local ordinances by category tags (#Basura, #Trapiko) and keywords"
    );
    const ordinancesNavLink = page.locator('header nav a[href="/ordinances"]').first();
    await navigateViaNav(page, ordinancesNavLink, "/ordinances");

    // Click Category filter chip
    const garbageTag = page.locator('button:has-text("#Basura"), button:has-text("Basura"), [data-category*="Basura"]').first();
    if (await garbageTag.isVisible({ timeout: 3000 })) {
      await clickElement(page, garbageTag, { pauseAfter: 1200 });
      await pause(page, 1500);
    }

    const trafficTag = page.locator('button:has-text("#Trapiko"), button:has-text("Trapiko"), [data-category*="Traffic"]').first();
    if (await trafficTag.isVisible({ timeout: 2000 })) {
      await clickElement(page, trafficTag, { pauseAfter: 1200 });
      await pause(page, 1500);
    }
    await smoothScroll(page, 350);
    await pause(page, 3000);

    // STEP 18: Ordinance Detail View & Official PDF Viewer
    await startStep(
      page,
      "CITIZEN",
      "Ordinance Detail View & Official PDF Viewer",
      "Examining ordinance provisions, sanctions, and rendered official PDF document"
    );
    const detailLink = page.locator('a:has-text("Basahin ang Buong Ordinansa")').first();
    if (await detailLink.isVisible({ timeout: 3000 })) {
      await clickElement(page, detailLink, { pauseAfter: 1400 });
    } else {
      await clickElement(page, page.locator("article a, .card a").first(), { pauseAfter: 1400 });
    }

    // Scroll through provisions
    await smoothScroll(page, 320);
    await pause(page, 3000);

    // Open Official PDF Viewer Modal
    const viewPdfBtn = page.locator('button:has-text("View Official PDF Document"), button:has-text("Tingnan ang PDF")').first();
    if (await viewPdfBtn.isVisible({ timeout: 4000 })) {
      await clickElement(page, viewPdfBtn, { pauseAfter: 1400 });
      await pause(page, 4500);

      // Close modal
      const closePdfBtn = page.locator('div[role="dialog"] button[aria-label*="Close"], div[role="dialog"] button:has-text("Isara")').first();
      if (await closePdfBtn.isVisible({ timeout: 3000 })) {
        await clickElement(page, closePdfBtn, { pauseAfter: 1000 });
      } else {
        await page.keyboard.press("Escape");
        await pause(page, 800);
      }
    }
    await smoothScroll(page, -320);
    await pause(page, 1500);

    // STEP 19: AI Civic Assistant (Gemini Powered)
    await startStep(
      page,
      "CITIZEN",
      "AI Civic Assistant (Gemini Powered)",
      "Inquiring on local city ordinances with grounded provisions and citations"
    );
    const aiNavLink = page.locator('header nav a:has-text("AI Assistant"), header nav a[href="/chatbot"]').first();
    await navigateViaNav(page, aiNavLink, "/chatbot");

    const chatInput = page.locator('input[placeholder*="ordinance inquiry"], textarea[placeholder*="ordinance inquiry"]').first();
    await typeHuman(
      page,
      chatInput,
      "Ano ang parusa at multa sa pagsusunog ng basura sa Camp Tinio?"
    );
    await pause(page, 800);

    const sendBtn = page.locator('button[type="submit"], button:has(svg.lucide-arrow-right), button:has(svg.lucide-send)').first();
    await clickElement(page, sendBtn, { pauseAfter: 1400 });

    // Wait for AI response bubble to appear
    await page.waitForSelector('text="Paalala:"', { timeout: 25000 }).catch(async () => {
      await page.waitForSelector('text="Nagsusuri sa database"', { state: "detached", timeout: 20000 }).catch(() => {});
    });
    await pause(page, 4500);
    await smoothScroll(page, 260);
    await pause(page, 3000);
    await smoothScroll(page, -260);
    await pause(page, 1500);

    // STEP 20: Civic Incident Reporting
    await startStep(
      page,
      "CITIZEN",
      "Civic Incident Reporting",
      "Submitting an official community violation report directly to Barangay Hall"
    );
    const reportNavLink = page.locator('header nav a[href="/report"]').first();
    await navigateViaNav(page, reportNavLink, "/report");

    // Fill form
    const subjectInput = page.locator('input[placeholder*="Nakatambak na basura"]');
    await typeHuman(
      page,
      subjectInput,
      "Pagsusunog ng Plastik sa Bakanteng Lote"
    );
    await pause(page, 900);

    // Select Barangay
    const brgySelect = page.locator("#barangay-select");
    await clickElement(page, brgySelect, { pauseAfter: 500 });
    const campTinioOption = brgySelect.locator('option:has-text("Camp Tinio")');
    const campTinioVal = await campTinioOption.getAttribute("value");
    if (campTinioVal) {
      await brgySelect.selectOption(campTinioVal);
      await brgySelect.dispatchEvent("change");
    }
    await pause(page, 900);

    // Select Category
    const catSelect = page.locator("#category-select");
    await clickElement(page, catSelect, { pauseAfter: 500 });
    await catSelect.selectOption("Sanitation / Basura");
    await catSelect.dispatchEvent("change");
    await pause(page, 900);

    // Fill Details
    const detailsInput = page.locator("#report-details");
    await typeHuman(
      page,
      detailsInput,
      "May madalas magsunog ng basura at plastic bottles sa bakanteng lote tuwing hapon. Makapal ang usok at nagdudulot ng ubo."
    );
    await pause(page, 900);

    // Fill Contact Name and Phone
    const nameInput = page.locator('input[placeholder="Juan dela Cruz"]');
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await typeHuman(page, nameInput, "Juan Dela Cruz");
      await pause(page, 700);
    }

    const phoneInput = page.locator('input[placeholder*="0917-000-0000"]');
    if (await phoneInput.isVisible({ timeout: 2000 })) {
      await typeHuman(page, phoneInput, "0917-123-4567");
      await pause(page, 900);
    }

    // STEP 21: Show Validation and Submission Feedback
    await startStep(
      page,
      "CITIZEN",
      "Submission Feedback & Validation",
      "Immediate verification alert confirming report delivery to Barangay Hall"
    );
    const submitReportBtn = page.locator('button:has-text("I-sumite ang Ulat")');
    await clickElement(page, submitReportBtn, { pauseAfter: 1400 });

    // Scroll up to view the confirmation alert banner
    await smoothScroll(page, -420);
    await page.waitForSelector('div[role="alert"]:has-text("Naisumite na ang Ulat!"), [class*="alert"]:has-text("Naisumite")', {
      timeout: 10000,
    }).catch(() => {});
    await pause(page, 5000);

    // STEP 22: Capstone Walkthrough Conclusion
    await startStep(
      page,
      "DEFENSE",
      "Capstone Walkthrough Conclusion",
      "Successfully concluding the official Cabanatuan City Ordinance Portal walkthrough"
    );
    const homeNavLink = page.locator('header nav a[href="/"], header a[href="/"]').first();
    if (await homeNavLink.isVisible({ timeout: 3000 })) {
      await clickElement(page, homeNavLink, { pauseAfter: 1400 });
    } else {
      await page.goto(`${BASE_URL}/`);
    }
    await pause(page, 6000);

    console.log("\n🎉 Defense walkthrough recording completed successfully!");
  } catch (err) {
    console.error("❌ Demo execution failed:", err);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "failure-screenshot.png") });
    throw err;
  } finally {
    await finishTimeline();
    await page.close();
    await context.close();
    await browser.close();
  }

  // =========================================================================
  // POST-PROCESSING: Convert video with FFmpeg
  // =========================================================================
  console.log("\n🎬 Converting recorded video to production MP4 (H.264, 30fps)...");
  const videoFiles = fs
    .readdirSync(TEMP_VIDEO_DIR)
    .filter((f) => f.endsWith(".webm"));

  if (videoFiles.length === 0) {
    throw new Error("No webm video found in temp recordings!");
  }

  // Pick newest webm
  const sortedVideos = videoFiles
    .map((name) => ({
      name,
      time: fs.statSync(path.join(TEMP_VIDEO_DIR, name)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);

  const videoPath = path.join(TEMP_VIDEO_DIR, sortedVideos[0].name);
  const outputMp4 = path.join(OUTPUT_DIR, "cabanatuan-portal-walkthrough.mp4");

  const ffmpegCmd = `ffmpeg -y -i "${videoPath}" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -r 30 "${outputMp4}"`;
  console.log(`Running: ${ffmpegCmd}`);
  execSync(ffmpegCmd, { stdio: "inherit" });

  console.log(`✅ Final MP4 generated at: ${outputMp4}`);

  // Extract verification frames at each recorded step
  console.log("\n📸 Extracting review frames for each step...");
  for (const step of timeline) {
    const framePath = path.join(
      FRAMES_DIR,
      `step-${String(step.stepNumber).padStart(2, "0")}.png`
    );
    const snapTime = Math.max(0.5, step.startSeconds + 1.2).toFixed(2);
    try {
      execSync(
        `ffmpeg -y -ss ${snapTime} -i "${outputMp4}" -frames:v 1 -q:v 2 "${framePath}"`,
        { stdio: "ignore" }
      );
      console.log(`   ✓ Step ${step.stepNumber} frame: ${framePath}`);
    } catch (e) {
      console.warn(`   ⚠ Failed frame for step ${step.stepNumber}:`, e);
    }
  }

  // Calculate and report total duration
  const totalDuration = timeline[timeline.length - 1]?.endSeconds || 0;
  const minutes = Math.floor(totalDuration / 60);
  const seconds = Math.round(totalDuration % 60);
  console.log(`\n⏱️ Total Demo Duration: ${minutes}m ${seconds}s (${totalDuration.toFixed(1)}s)`);

  // Generate Narration Script & SRT Captions
  generateNarrationHelpers(timeline);
}

function generateNarrationHelpers(steps: TimelineStep[]) {
  console.log("\n🎙️ Generating narration script and subtitles (SRT)...");
  const narrationFile = path.resolve(process.cwd(), "demo", "narration-script.md");
  const srtFile = path.resolve(process.cwd(), "demo", "captions.srt");

  let narrationMd = `# Cabanatuan City Ordinance Portal — Official Walkthrough Narration Script
**BSIT Capstone Final Defense Presentation**
*Target Presentation Time: ~6 to 8 minutes*

---

`;

  let srtContent = "";

  function formatSrtTime(totalSec: number): string {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);
    const millis = Math.floor((totalSec % 1) * 1000);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
  }

  const spokenScripts: Record<number, string> = {
    1: "Magandang araw po sa ating kagalang-galang na panel. Sisimulan natin ang opisyal na walkthrough ng Cabanatuan City Ordinance Portal sa Barangay Admin Flow. Dito nagla-log in ang Punong Barangay ng Camp Tinio gamit ang kanyang awtorisadong credentials para buksan ang lokal na portal ng barangay.",
    2: "Ito ang Barangay Governance Dashboard ng Camp Tinio. Malinaw na ipinapakita rito ang mga datos na naka-scope lamang sa nasasakupan ng barangay: bilang ng mga lokal na ordinansa, mga nakabinbing panukala, at ang mga natanggap na ulat ng komunidad mula sa mga residente.",
    3: "Sa module ng Mga Ordinansa ng Barangay, pinapamahalaan ng pamahalaang barangay ang kanilang mga lokal na regulasyon. Maaari nilang i-filter ang mga ordinansa ayon sa status—Approved, Pending, o Draft—at magsumite ng bagong panukala para sa pagsusuri ng Sangguniang Panlungsod.",
    4: "Sa Barangay Incident Reports Desk, pinoproseso ng pamunuan ng barangay ang mga ulat ng paglabag na isinumite ng mga residente ng Camp Tinio. Dito, binabago natin ang status ng ulat mula sa 'Bago' patungo sa 'Inaaksyunan' upang ipahiwatig na iniimbestigahan na ito ng mga barangay tanod.",
    5: "Matapos ang tungkulin sa antas ng barangay, ligtas na magsa-sign out ang Barangay Admin upang ipakita ang susunod na antas ng pamamahala sa City Hall.",
    6: "Tutungo naman tayo sa LGU Super Admin Flow. Dito nagla-log in ang City Administrator o kawani ng Sangguniang Panlungsod para sa pangkalahatang pamamahala ng buong Lungsod ng Cabanatuan.",
    7: "Ito ang Executive Governance Dashboard ng LGU. Makikita rito ang city-wide metrics: kabuuang bilang ng mga ordinansa sa buong lungsod, mga nakabinbing panukala mula sa mga barangay, bilang ng 89 na mga barangay, at pangkalahatang ulat ng komunidad.",
    8: "Sa City Ordinance Repository, maayos na naka-archive ang lahat ng mga ordinansa ng lungsod at barangay. Mayroon itong real-time search filter ayon sa pamagat o resolution number para sa mabilisang pagsusuri.",
    9: "Upang ipakita ang legislative workflow, susuriin ng LGU Super Admin ang isang nakabinbing panukalang ordinansa na isinumite ng barangay at kumpirmadong aaprubahan ito gamit ang accessible confirmation dialog.",
    10: "Sa pamamahala ng mga opisyal, nakatala ang lahat ng rehistradong Punong Barangay at administrative personnel, kalakip ang role-based access control upang mapanatili ang integridad at seguridad ng sistema.",
    11: "Ipinapakita naman dito ang direktoryo at monitoring ng lahat ng 89 na mga barangay sa Lungsod ng Cabanatuan na bahagi ng digital governance network.",
    12: "Sa City-Wide Community Reports Desk, sinusubaybayan ng City Hall ang lahat ng insidente sa bawat barangay tulad ng pagsusunog ng basura at sagabal sa mga lansangan upang matiyak ang koordinasyon sa pagpapatupad ng mga ordinansa.",
    13: "Kritikal sa lokal na pamahalaan ang transparency at reporting. Dito sa Legislative Report Generator, nag-e-export tayo ng pormal na PDF document na naglalaman ng listahan ng mga ordinansa kalakip ang Opisyal na Selyo ng Lungsod ng Cabanatuan.",
    14: "Sa Civic Governance Analytics, biswal na ipinapakita ang distribusyon ng mga ordinansa ayon sa kategorya, compliance trends, at resolution rate ng mga ulat gamit ang interactive visual charts.",
    15: "Matapos ang administratibong pagsusuri, magsa-sign out ang LGU Admin upang ipakita ang bukas na public citizen portal.",
    16: "Ngayon naman, tutungo tayo sa Public Citizen Flow. Mahalagang bigyang-diin na sa Cabanatuan City Ordinance Portal, hindi kinakailangang mag-log in o magrehistro ng account ang mga mamamayan. Ang portal ay ganap na bukas sa publiko para sa agarang transparency. Sinasalubong ang mamamayan ng aming interactive Three.js 3D ordinance cylinder archive.",
    17: "Sa Public Ordinance Explorer, madaling makakahanap ang publiko ng mga regulasyon gamit ang quick category tags tulad ng #Basura at #Trapiko, o sa pamamagitan ng keyword search.",
    18: "Sa detail view ng ordinansa, malinaw na nakasaad ang mga seksyon, saklaw, at takdang parusa o multa alinsunod sa ordinansa. Bukod dito, mayroon itong integrated PDF viewer upang direktang mabasa ang opisyal na nilagdaang dokumento ng ordinansa sa browser.",
    19: "Isa sa mga pangunahing inobasyon ng aming capstone ay ang AI Civic Assistant na pinapagana ng Google Gemini. Dito, nagtanong tayo sa Tagalog ukol sa parusa sa pagsusunog ng basura sa Camp Tinio, at nagbigay ang AI ng grounded na sagot batay sa opisyal na talaan ng mga ordinansa, kalakip ang paalala na ito ay para sa impormasyon lamang.",
    20: "Maaari ring magsumite ang mamamayan ng ulat ng paglabag sa ordinansa nang direkta sa kanilang Barangay Hall sa pamamagitan ng aming community report form na may automatic local draft persistence.",
    21: "Agad na nagbibigay ang portal ng validation alert na nagpapatunay na matagumpay na naipadala ang ulat sa Barangay Hall ng Camp Tinio para sa kaukulang aksyon ng barangay.",
    22: "Dito nagtatapos ang opisyal na walkthrough ng Cabanatuan City Ordinance Portal. Ipinakita natin ang komprehensibong pamamahala ng mga opisyal sa antas ng barangay at lungsod, at ang bukas na transparency portal para sa bawat mamamayan ng Lungsod ng Cabanatuan. Maraming salamat po at handa na kami para sa inyong mga katanungan.",
  };

  steps.forEach((step, index) => {
    const startMin = Math.floor(step.startSeconds / 60);
    const startSec = Math.floor(step.startSeconds % 60);
    const timeFormatted = `[${String(startMin).padStart(2, "0")}:${String(startSec).padStart(2, "0")}]`;

    const flowTitle =
      step.flow === "BARANGAY"
        ? "Barangay Admin (Camp Tinio)"
        : step.flow === "LGU_ADMIN"
        ? "LGU Super Admin (City Hall)"
        : step.flow === "CITIZEN"
        ? "Public Citizen / Resident"
        : "Capstone Defense";

    narrationMd += `### Step ${step.stepNumber}: ${step.title} ${timeFormatted}\n`;
    narrationMd += `**Role:** ${flowTitle}  \n`;
    narrationMd += `**Action:** ${step.description}  \n\n`;

    const script = spokenScripts[step.stepNumber] || step.description;
    narrationMd += `**Narration:**\n> "${script}"\n\n---\n\n`;

    // SRT subtitle format
    srtContent += `${index + 1}\n`;
    srtContent += `${formatSrtTime(step.startSeconds)} --> ${formatSrtTime(step.endSeconds)}\n`;
    srtContent += `[${step.flow}] ${step.title}\n`;
    srtContent += `${step.description}\n\n`;
  });

  fs.writeFileSync(narrationFile, narrationMd, "utf-8");
  fs.writeFileSync(srtFile, srtContent, "utf-8");

  console.log(`✅ Narration script written to: ${narrationFile}`);
  console.log(`✅ Subtitles written to: ${srtFile}`);
}

main().catch((err) => {
  console.error("Fatal demo error:", err);
  process.exit(1);
});
