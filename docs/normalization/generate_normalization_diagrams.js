const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderDiagrams() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    deviceScaleFactor: 2, // 2x retina crisp quality for academic thesis
  });

  const files = [
    { html: '01_unf.html', output: '01_UNF_Cabanatuan_Ordinance_Portal.png', width: 1040, height: 1100 },
    { html: '02_1nf.html', output: '02_1NF_Cabanatuan_Ordinance_Portal.png', width: 1300, height: 980 },
    { html: '03_2nf.html', output: '03_2NF_Cabanatuan_Ordinance_Portal.png', width: 1300, height: 980 },
    { html: '04_3nf.html', output: '04_3NF_Cabanatuan_Ordinance_Portal.png', width: 1300, height: 980 }
  ];

  const htmlDir = path.join(__dirname, 'html');
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const item of files) {
    const page = await context.newPage();
    const filePath = 'file:///' + path.join(htmlDir, item.html).replace(/\\/g, '/');
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.goto(filePath, { waitUntil: 'networkidle' });

    // Find the main card or canvas element
    const element = await page.$('.unf-card, .canvas');
    const outPath = path.join(outputDir, item.output);

    if (element) {
      // Add a slight margin around the element screenshot
      await element.screenshot({
        path: outPath,
        omitBackground: false
      });
    } else {
      await page.screenshot({ path: outPath, fullPage: true });
    }

    console.log(`Successfully generated: ${item.output}`);
    await page.close();
  }

  await browser.close();
  console.log('All diagrams generated successfully!');
}

renderDiagrams().catch((err) => {
  console.error('Error generating diagrams:', err);
  process.exit(1);
});
