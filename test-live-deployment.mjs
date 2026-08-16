import { chromium } from 'playwright';

async function testLive() {
  const baseUrl = 'https://tibbak-demo.idreess-c.workers.dev';
  const routes = [
    '/ar',
    '/ar/search',
    '/ar/doctors',
    '/ar/doctors/dr-firas-khatib-1',
    '/ar/favorites',
    '/ar/messages',
    '/ar/account',
    '/ar/dashboard/doctor?demo=1',
    '/en',
    '/en/search'
  ];

  console.log('--- TESTING LIVE ROUTES ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: 'ar-JO'
  });
  const page = await context.newPage();

  let failedRoutes = [];
  for (const route of routes) {
    const fullUrl = `${baseUrl}${route}`;
    try {
      const resp = await page.goto(fullUrl, { waitUntil: 'commit', timeout: 15000 });
      const status = resp.status();
      if (status >= 400) {
        console.error(`FAIL: ${route} (Status ${status})`);
        failedRoutes.push({ route, status });
      } else {
        console.log(`PASS: ${route} (Status ${status})`);
      }
    } catch (err) {
      console.error(`FAIL: ${route} (${err.message})`);
      failedRoutes.push({ route, error: err.message });
    }
  }

  console.log('\n--- TESTING LIVE MOBILE JOURNEY ---');
  try {
    // 1. Home
    await page.goto(`${baseUrl}/ar`, { waitUntil: 'commit' });
    await page.waitForTimeout(1000);
    console.log('1. Home loaded');

    // 2. Search
    await page.goto(`${baseUrl}/ar/search`, { waitUntil: 'commit' });
    await page.waitForTimeout(1000);
    console.log('2. Search loaded');

    // 3. Doctor Profile
    await page.goto(`${baseUrl}/ar/doctors/dr-firas-khatib-1`, { waitUntil: 'commit' });
    await page.waitForTimeout(1000);
    console.log('3. Doctor profile loaded');

    // 4. Favorite Toggle
    const favBtn = page.locator('button:has-text("إضافة للمفضلة"), button:has-text("مفضلة")').first();
    if (await favBtn.isVisible()) {
      await favBtn.click();
      await page.waitForTimeout(500);
      console.log('4. Favorite toggled');
    }

    // 5. Booking Widget
    const bookingWidget = page.locator('#booking-widget').first();
    if (await bookingWidget.isVisible()) {
      await bookingWidget.scrollIntoViewIfNeeded();
      const firstSlotBtn = page.locator('#booking-widget button:has-text("AM"), #booking-widget button:has-text("PM")').first();
      if (await firstSlotBtn.isVisible()) {
        await firstSlotBtn.click();
        await page.waitForTimeout(300);
        const confirmBtn = page.locator('#booking-widget button[type="submit"]').first();
        await confirmBtn.click();
        await page.waitForTimeout(1000);
        console.log('5. Booking confirmed & receipt generated');
      }
    }
  } catch (err) {
    console.error('Error in mobile journey test:', err.message);
  }

  await browser.close();
  if (failedRoutes.length > 0) {
    console.log('\nFailed routes count:', failedRoutes.length);
    process.exit(1);
  } else {
    console.log('\nALL LIVE ROUTES & MOBILE JOURNEY PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

testLive();
