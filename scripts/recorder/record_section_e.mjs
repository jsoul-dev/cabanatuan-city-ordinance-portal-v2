import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const VIDEO_DIR = "C:\\.JC\\Antigravity-Projects\\Capstone Project v2\\demo-output\\scratch\\videos_e";
const SLIDE_URL = "file:///C:/.JC/Antigravity-Projects/Capstone%20Project%20v2/app/scripts/recorder/closing_slide.html";

async function main() {
  if (fs.existsSync(VIDEO_DIR)) {
    fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log("Section E: Recording Closing Summary (Target: ~38s)...");
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

  // 1. Return to Home Page for wrap-up
  console.log("Navigating to home page for closing recap...");
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(4000);

  // Smooth scroll across hero
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 2. Transition to Final Defense Closing Slide
  console.log("Displaying Final Defense Closing Slide...");
  await page.goto(SLIDE_URL);
  await page.waitForTimeout(27000);

  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith(".webm") || f.endsWith(".mp4"));
  if (files.length > 0) {
    const rawVideo = path.join(VIDEO_DIR, files[0]);
    console.log("SECTION E RAW VIDEO READY:", rawVideo);
  }
}

main().catch(console.error);
