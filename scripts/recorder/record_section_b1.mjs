import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const VIDEO_DIR = "C:\\.JC\\Antigravity-Projects\\Capstone Project v2\\demo-output\\scratch\\videos_b1";

async function main() {
  if (fs.existsSync(VIDEO_DIR)) {
    fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log("Section B1: Recording Barangay Admin Flow (Target: ~74s)...");
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

  // 1. Navigate to Login Page
  console.log("Navigating to login page...");
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  // 2. Select Barangay Admin Quick Fill or enter credentials
  console.log("Logging in as Barangay Admin...");
  const brgyBtn = page.locator("button:has-text('Barangay Admin'), button:has-text('captain.camptinio@gmail.com')").first();
  if (await brgyBtn.isVisible()) {
    await brgyBtn.hover();
    await page.waitForTimeout(1000);
    await brgyBtn.click();
    await page.waitForTimeout(1000);
  } else {
    await page.fill("#email-input", "captain.camptinio@gmail.com");
    await page.fill("#password-input", "password123");
  }

  // Click submit
  const submitBtn = page.locator("button[type='submit']");
  await submitBtn.hover();
  await page.waitForTimeout(1000);
  await submitBtn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(4000);

  // 3. Inspect Barangay Dashboard (/admin/barangay)
  console.log("Exploring Barangay Dashboard...");
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 4. Navigate to Barangay Ordinances (/admin/barangay/ordinances)
  console.log("Navigating to Barangay Ordinances...");
  const ordinancesNav = page.locator("a[href*='/admin/barangay/ordinances']").first();
  if (await ordinancesNav.isVisible()) {
    await ordinancesNav.hover();
    await page.waitForTimeout(1000);
    await ordinancesNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/barangay/ordinances");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(5000);

  // Inspect the ordinance list
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 5. Navigate to Barangay Incident Reports (/admin/barangay/reports)
  console.log("Navigating to Barangay Reports...");
  const reportsNav = page.locator("a[href*='/admin/barangay/reports']").first();
  if (await reportsNav.isVisible()) {
    await reportsNav.hover();
    await page.waitForTimeout(1000);
    await reportsNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/barangay/reports");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(5000);

  // Inspect reports and open/filter
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
  await page.waitForTimeout(7000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 6. Navigate to Barangay Analytics (/admin/barangay/analytics)
  console.log("Navigating to Barangay Analytics...");
  const analyticsNav = page.locator("a[href*='/admin/barangay/analytics']").first();
  if (await analyticsNav.isVisible()) {
    await analyticsNav.hover();
    await page.waitForTimeout(1000);
    await analyticsNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/barangay/analytics");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(8000);

  // 7. Logout
  console.log("Logging out from Barangay Admin...");
  const logoutBtn = page.locator("button:has-text('Mag-logout'), button:has-text('Logout'), a[href*='logout']").first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.hover();
    await page.waitForTimeout(1200);
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
    console.log("SECTION B1 RAW VIDEO READY:", rawVideo);
  }
}

main().catch(console.error);
