import { chromium } from 'playwright-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BENCH_URL || 'http://localhost:3001';

async function runBench() {
  console.log(`Starting Playwright Navigation Benchmark on ${BASE_URL}...`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Monitor network and errors
  const slowNetwork: any[] = [];
  page.on('request', (req) => {
    (req as any)._t0 = performance.now();
  });
  page.on('response', (res) => {
    const t0 = (res.request() as any)._t0;
    if (t0) {
      const dur = performance.now() - t0;
      if (dur > 600 || res.status() >= 400) {
        slowNetwork.push({
          url: res.url().slice(0, 90),
          status: res.status(),
          durationMs: Math.round(dur),
        });
      }
    }
  });

  page.on('pageerror', (err) => {
    console.error('[PageError]:', err.message);
  });

  // 1. Login with TEST001
  console.log('\n--- STEP 1: AUTHENTICATION ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="nim"]', 'TEST001');
  await page.fill('input[name="password"]', 'testing123');

  const tLoginStart = performance.now();
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL((url) => url.pathname.startsWith('/app'), { timeout: 8000 });
  } catch (err) {
    const errEl = await page.$('.text-danger-text, [role="alert"]');
    const errText = errEl ? await errEl.textContent() : null;
    console.error(`Login failed or stalled! Current URL: ${page.url()}, Error on page: "${errText}"`);
    throw err;
  }
  const loginDuration = Math.round(performance.now() - tLoginStart);
  console.log(`✅ Logged in successfully in ${loginDuration}ms! URL: ${page.url()}`);

  const routes = [
    { name: 'Kalender', href: '/app/calendar' },
    { name: 'Daftar Agenda', href: '/app/agendas' },
    { name: 'Tugas Saya', href: '/app/tasks' },
    { name: 'File Materi', href: '/app/materials' },
    { name: 'Knowledge Hub', href: '/app/knowledge' },
    { name: 'Pengajuan Saya', href: '/app/submissions' },
    { name: 'Akun & Profil', href: '/app/account' },
    { name: 'Dashboard', href: '/app' },
  ];

  // Helper to click link and measure transition
  async function testMenu(route: { name: string; href: string }, cycle: string) {
    const selector = `aside a[href="${route.href}"]`;
    await page.waitForSelector(selector, { state: 'visible' });

    const tStart = performance.now();
    await page.click(selector);
    await page.waitForURL((url) => url.pathname === route.href, { timeout: 8000 });
    // Wait until network settles or main container is interactive
    await page.waitForSelector('main, .animate-pulse', { state: 'attached' });
    const dur = Math.round(performance.now() - tStart);

    console.log(`[${cycle}] Menu: ${route.name.padEnd(16)} -> ${dur}ms (Target: <1500ms)`);
    return dur;
  }

  // Round 1: Cold Navigation Transitions
  console.log('\n--- STEP 2: COLD NAVIGATION TRANSITIONS (CYCLE 1) ---');
  const coldTimings: Record<string, number> = {};
  for (const r of routes) {
    coldTimings[r.name] = await testMenu(r, 'COLD');
    await page.waitForTimeout(150); // slight pause
  }

  // Round 2: Warm Navigation Transitions
  console.log('\n--- STEP 3: WARM NAVIGATION TRANSITIONS (CYCLE 2) ---');
  const warmTimings: Record<string, number> = {};
  for (const r of routes) {
    warmTimings[r.name] = await testMenu(r, 'WARM');
    await page.waitForTimeout(100);
  }

  // Summary
  console.log('\n========================================');
  console.log('       BENCHMARK RESULTS SUMMARY        ');
  console.log('========================================');
  console.log('Menu Route          | Cold (ms) | Warm (ms)');
  console.log('--------------------+-----------+----------');
  for (const r of routes) {
    console.log(
      `${r.name.padEnd(19)} | ${String(coldTimings[r.name]).padStart(9)} | ${String(warmTimings[r.name]).padStart(8)}`
    );
  }

  if (slowNetwork.length > 0) {
    console.log('\nRequests > 600ms or Errors:');
    console.table(slowNetwork);
  } else {
    console.log('\n✅ Zero slow requests (>600ms) and zero HTTP error responses!');
  }

  await browser.close();
}

runBench().catch(console.error);
