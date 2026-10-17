import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const VIDEO_DIR = "C:\\.JC\\Antigravity-Projects\\Capstone Project v2\\demo-output\\scratch\\videos_c";

async function main() {
  if (fs.existsSync(VIDEO_DIR)) {
    fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log("Section C: Recording Citizen / End-User Flow (Target: ~112s)...");
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

  // 1. Start on Home Page
  console.log("Navigating to home page...");
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(4000);

  // 2. Navigate to Ordinance Directory (/ordinances)
  console.log("Navigating to Ordinances...");
  const browseBtn = page.locator("a:has-text('Mag-browse ng mga Ordinansa'), a[href*='/ordinances']").first();
  if (await browseBtn.isVisible()) {
    await browseBtn.hover();
    await page.waitForTimeout(1000);
    await browseBtn.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/ordinances");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(4000);

  // 3. Search and Filtering in Directory
  console.log("Applying search and category filters...");
  const searchInput = page.locator("input[placeholder*='Maghanap'], input[type='search'], input[type='text']").first();
  if (await searchInput.isVisible()) {
    await searchInput.hover();
    await page.waitForTimeout(1000);
    await searchInput.click();
    await searchInput.type("curfew", { delay: 100 });
    await page.waitForTimeout(4000);
    await searchInput.fill("");
    await searchInput.type("basura", { delay: 100 });
    await page.waitForTimeout(4000);
    await searchInput.fill("");
  }

  // Filter tabs or pills
  const filterPill = page.locator("button:has-text('Kalinisan'), button:has-text('Environment'), button:has-text('General')").first();
  if (await filterPill.isVisible()) {
    await filterPill.hover();
    await page.waitForTimeout(1000);
    await filterPill.click();
    await page.waitForTimeout(4000);
  }

  // Scroll through ordinance cards
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 4. Open an Ordinance Detail Page
  console.log("Opening ordinance detail page...");
  const firstCard = page.locator("a[href^='/ordinances/']").first();
  if (await firstCard.isVisible()) {
    await firstCard.hover();
    await page.waitForTimeout(1200);
    await firstCard.click();
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(5000);

  // Inspect detail sections: resolution number, date, articles, penalties, PDF
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 5. Navigate to Incident Reporting (/report)
  console.log("Navigating to Incident Reporting...");
  const reportNav = page.locator("a[href*='/report']").first();
  if (await reportNav.isVisible()) {
    await reportNav.hover();
    await page.waitForTimeout(1000);
    await reportNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/report");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(4000);

  // Fill in incident report form
  console.log("Filling incident report...");
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
  await page.waitForTimeout(2000);

  // Select Issue Type
  const issueSelect = page.locator("select[name='type'], select[id*='type']").first();
  if (await issueSelect.isVisible()) {
    await issueSelect.selectOption({ index: 1 });
    await page.waitForTimeout(1500);
  }

  // Select Barangay
  const brgySelect = page.locator("select[name='barangayId'], select[id*='barangay']").first();
  if (await brgySelect.isVisible()) {
    await brgySelect.selectOption({ label: "Camp Tinio" }).catch(() => brgySelect.selectOption({ index: 1 }));
    await page.waitForTimeout(1500);
  }

  // Type Description
  const descArea = page.locator("textarea[name='description'], textarea").first();
  if (await descArea.isVisible()) {
    await descArea.click();
    await descArea.type("Patuloy na pagsusunog ng tuyong dahon at plastik sa Purok 3.", { delay: 60 });
    await page.waitForTimeout(2000);
  }

  // Toggle Anonymous Checkbox
  const anonCheckbox = page.locator("input[type='checkbox']").first();
  if (await anonCheckbox.isVisible()) {
    await anonCheckbox.hover();
    await page.waitForTimeout(1000);
    await anonCheckbox.click();
    await page.waitForTimeout(2000);
  }

  // Scroll down to submit
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
  await page.waitForTimeout(4000);

  // 6. Navigate to AI-Assisted Ordinance Assistant (/chatbot)
  console.log("Navigating to AI Chatbot...");
  const chatNav = page.locator("a[href*='/chatbot']").first();
  if (await chatNav.isVisible()) {
    await chatNav.hover();
    await page.waitForTimeout(1000);
    await chatNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/chatbot");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(4000);

  // Type a realistic question in chatbot
  console.log("Asking AI Chatbot query...");
  const chatInput = page.locator("input[placeholder*='Tanong'], textarea[placeholder*='Tanong'], input[type='text'], textarea").first();
  if (await chatInput.isVisible()) {
    await chatInput.hover();
    await page.waitForTimeout(1000);
    await chatInput.click();
    await chatInput.type("Ano ang curfew hours sa Cabanatuan para sa kabataan?", { delay: 60 });
    await page.waitForTimeout(1500);

    const sendBtn = page.locator("button:has-text('Ipadala'), button:has-text('Send'), button[type='submit']").first();
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
    } else {
      await page.keyboard.press("Enter");
    }
  }

  // Wait for streaming AI response
  console.log("Waiting for AI response...");
  await page.waitForTimeout(12000);

  // Scroll to show citation and legal disclaimer
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: "smooth" }));
  await page.waitForTimeout(6000);

  // 7. Navigate to News (/news)
  console.log("Navigating to News...");
  const newsNav = page.locator("a[href*='/news']").first();
  if (await newsNav.isVisible()) {
    await newsNav.hover();
    await page.waitForTimeout(1000);
    await newsNav.click();
    await page.waitForLoadState("networkidle");
  } else {
    await page.goto("http://localhost:3000/news");
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(5000);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
  await page.waitForTimeout(8000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(6000);

  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith(".webm") || f.endsWith(".mp4"));
  if (files.length > 0) {
    const rawVideo = path.join(VIDEO_DIR, files[0]);
    console.log("SECTION C RAW VIDEO READY:", rawVideo);
  }
}

main().catch(console.error);
