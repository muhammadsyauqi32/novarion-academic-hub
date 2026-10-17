import { chromium } from 'playwright-core';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\SYAUQI\\.gemini\\antigravity-ide\\brain\\8d7ac3ef-a442-4eb4-9737-dd484fa46f77';

async function captureAfterScreenshots() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-375', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    console.log(`Navigating to http://localhost:3001 at ${vp.name}...`);
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    const shotPath = path.join(ARTIFACT_DIR, `after-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);

    const fullPath = path.join(ARTIFACT_DIR, `after-${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Saved full page screenshot: ${fullPath}`);

    await page.close();
  }

  await browser.close();
  console.log('AFTER screenshots captured successfully!');
}

captureAfterScreenshots().catch(console.error);
