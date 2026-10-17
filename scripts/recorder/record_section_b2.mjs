import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const VIDEO_DIR = "C:\\.JC\\Antigravity-Projects\\Capstone Project v2\\demo-output\\scratch\\videos_b2";

async function main() {
  if (fs.existsSync(VIDEO_DIR)) {
    fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log("Section B2: Recording LGU Super Admin Flow (Target: ~68s)...");
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

  // 2. Select LGU Super Admin Quick Fill
  console.log("Logging in as LGU Super Admin...");
  const lguBtn = page.locator("button:has-text('LGU Super Admin'), button:has-text('lgu.admin.cabanatuan@gmail.com')").first();
  if (await lguBtn.isVisible()) {
    await lguBtn.hover();
    await page.waitForTimeout(1000);
    await lguBtn.click();
    await page.waitForTimeout(1000);
  } else {
    await page.fill("#email-input", "admin@cabanatuan.gov.ph");
    await page.fill("#password-input", "admin123");
  }

  const submitBtn = page.locator("button[type='submit']");
  await submitBtn.hover();
  await page.waitForTimeout(1000);
  await submitBtn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(4000);

  // 3. Inspect City Executive Dashboard (/admin/lgu)
  console.log("Exploring City Executive Dashboard...");
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 4. Navigate to City Ordinances & Review Queue (/admin/lgu/ordinances)
  console.log("Navigating to City Ordinances & Review Queue...");
  const ordinancesNav = page.locator("a[href*='/admin/lgu/ordinances']").first();
  if (await ordinancesNav.isVisible()) {
    await ordinancesNav.hover();
    await page.waitForTimeout(1000);
    await ordinancesNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/lgu/ordinances");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(4000);

  // Filter or inspect pending submissions
  const pendingTab = page.locator("button:has-text('Pending'), a:has-text('Pending')").first();
  if (await pendingTab.isVisible()) {
    await pendingTab.hover();
    await page.waitForTimeout(1000);
    await pendingTab.click();
    await page.waitForTimeout(4000);
  }
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(3000);

  // 5. Navigate to City Reports Oversight (/admin/lgu/reports)
  console.log("Navigating to City Reports...");
  const reportsNav = page.locator("a[href*='/admin/lgu/reports']").first();
  if (await reportsNav.isVisible()) {
    await reportsNav.hover();
    await page.waitForTimeout(1000);
    await reportsNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/lgu/reports");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(3000);

  // 6. Navigate to System Accounts & User Governance (/admin/lgu/users)
  console.log("Navigating to User Management...");
  const usersNav = page.locator("a[href*='/admin/lgu/users']").first();
  if (await usersNav.isVisible()) {
    await usersNav.hover();
    await page.waitForTimeout(1000);
    await usersNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/admin/lgu/users");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(3000);

  // 7. Logout
  console.log("Logging out from LGU Super Admin...");
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
    console.log("SECTION B2 RAW VIDEO READY:", rawVideo);
  }
}

main().catch(console.error);
