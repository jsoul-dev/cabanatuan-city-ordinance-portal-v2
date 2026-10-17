import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const VIDEO_DIR = "C:\\.JC\\Antigravity-Projects\\Capstone Project v2\\demo-output\\scratch\\videos_d";

async function main() {
  if (fs.existsSync(VIDEO_DIR)) {
    fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log("Section D: Recording Analytics & Reports (Target: ~54s)...");
  const browser = await chromium.launch({
    headless: false,
    args: ["--window-size=1920,1080", "--start-maximized"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // 1. Login as LGU Admin
  console.log("Navigating to login page...");
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  const lguBtn = page.locator("button:has-text('LGU Super Admin'), button:has-text('lgu.admin.cabanatuan@gmail.com')").first();
  if (await lguBtn.isVisible()) {
    await lguBtn.click();
    await page.waitForTimeout(800);
  } else {
    await page.fill("#email-input", "admin@cabanatuan.gov.ph");
    await page.fill("#password-input", "admin123");
  }

  const submitBtn = page.locator("button[type='submit']");
  await submitBtn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  // 2. Navigate to City Analytics (/admin/lgu/analytics)
  console.log("Navigating to City Analytics...");
  const analyticsNav = page.locator("a[href*='/admin/lgu/analytics']").first();
  if (await analyticsNav.isVisible()) {
    await analyticsNav.hover();
    await page.waitForTimeout(1000);
    await analyticsNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/lgu/analytics");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(5000);

  // Hover over charts and scroll down
  console.log("Exploring analytical visualizations...");
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(6000);

  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
  await page.waitForTimeout(6000);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 3. Navigate to Ordinance Reports Generator (/admin/lgu/ordinance-reports)
  console.log("Navigating to Ordinance Reports...");
  const reportsNav = page.locator("a[href*='/admin/lgu/ordinance-reports']").first();
  if (await reportsNav.isVisible()) {
    await reportsNav.hover();
    await page.waitForTimeout(1000);
    await reportsNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/lgu/ordinance-reports");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(5000);

  // Inspect report table and filters
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(7000);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 4. Logout
  const logoutBtn = page.locator("button:has-text('Mag-logout'), button:has-text('Logout'), a[href*='logout']").first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.hover();
    await page.waitForTimeout(1000);
    await logoutBtn.click();
  } else {
    await page.goto("http://localhost:3000/login");
  }
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);

  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith(".webm") || f.endsWith(".mp4"));
  if (files.length > 0) {
    const rawVideo = path.join(VIDEO_DIR, files[0]);
    console.log("SECTION D RAW VIDEO READY:", rawVideo);
  }
}

main().catch(console.error);
