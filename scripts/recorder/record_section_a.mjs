import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const VIDEO_DIR = "C:\\.JC\\Antigravity-Projects\\Capstone Project v2\\demo-output\\scratch\\videos_a";

async function main() {
  if (fs.existsSync(VIDEO_DIR)) {
    fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log("Section A: Recording 1080p footage (Target: ~59s)...");
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
  
  // 1. Initial Hero Display
  console.log("Navigating to home page...");
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(5000);

  // 2. Slow smooth scroll down to show the 3D archive and key stats
  console.log("Interacting with hero & stats...");
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(6000);

  // 3. Highlight Search Bar & Type Keywords
  console.log("Highlighting search bar...");
  const searchInput = page.locator("input[placeholder*='Maghanap'], input[type='search']").first();
  if (await searchInput.isVisible()) {
    await searchInput.hover();
    await page.waitForTimeout(1500);
    await searchInput.click();
    await searchInput.type("curfew", { delay: 120 });
    await page.waitForTimeout(4000);
    await searchInput.fill("");
    await searchInput.type("basura", { delay: 120 });
    await page.waitForTimeout(4000);
    await searchInput.fill("");
  }

  // 4. Scroll down to show Participating Barangays & Governance Pillars
  console.log("Scrolling through pillars and barangays...");
  await page.evaluate(() => window.scrollBy({ top: 550, behavior: "smooth" }));
  await page.waitForTimeout(7000);

  await page.evaluate(() => window.scrollBy({ top: 550, behavior: "smooth" }));
  await page.waitForTimeout(7000);

  // 5. Scroll back up smoothly
  console.log("Scrolling back to top...");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(6000);

  // 6. Highlight navigation elements
  console.log("Hovering navigation elements...");
  const navLinks = page.locator("nav a, header a");
  const count = await navLinks.count();
  for (let i = 0; i < Math.min(count, 5); i++) {
    const link = navLinks.nth(i);
    if (await link.isVisible()) {
      await link.hover();
      await page.waitForTimeout(1800);
    }
  }

  await page.waitForTimeout(6000);
  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith(".webm") || f.endsWith(".mp4"));
  if (files.length > 0) {
    const rawVideo = path.join(VIDEO_DIR, files[0]);
    console.log("SECTION A RAW VIDEO READY:", rawVideo);
  }
}

main().catch(console.error);
