import { chromium } from "playwright";

async function main() {
  console.log("Launching System Chrome in App Mode...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    args: [
      "--app=http://localhost:3000",
      "--window-size=1600,1000",
      "--window-position=50,50",
    ],
  });

  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  const title = await page.title();
  console.log("Page title:", title);

  console.log("Keeping window open for 15s...");
  await new Promise((r) => setTimeout(r, 15000));
  await browser.close();
  console.log("Closed.");
}

main().catch(console.error);
