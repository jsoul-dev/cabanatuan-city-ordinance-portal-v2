import { chromium } from "playwright";
import path from "path";

async function main() {
  const videoDir = "C:\\.JC\\Antigravity-Projects\\Capstone Project v2\\demo-output\\scratch\\videos";
  console.log("Launching Playwright with recordVideo...");
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--window-size=1920,1080",
      "--start-maximized",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  console.log("Page title:", await page.title());

  await page.waitForTimeout(2000);
  console.log("Hovering browse button...");
  const btn = page.locator("a:has-text('Mag-browse ng mga Ordinansa'), a:has-text('Browse Ordinances'), a[href*='ordinances']").first();
  if (await btn.isVisible()) {
    await btn.hover();
    await page.waitForTimeout(1000);
    await btn.click();
    await page.waitForLoadState("networkidle");
  }

  await page.waitForTimeout(2000);
  await page.close();
  await context.close();
  await browser.close();

  const video = await page.video();
  if (video) {
    const videoPath = await video.path();
    console.log("Recorded video path:", videoPath);
  }
}

main().catch(console.error);
