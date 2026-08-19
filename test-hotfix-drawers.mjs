import { spawn } from 'child_process';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runQA() {
  const scratchDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const port = 3099;
  console.log(`Checking Next.js production server on port ${port}...`);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const viewports = [
    { width: 375, height: 812, name: '375px' },
    { width: 390, height: 844, name: '390px' },
    { width: 430, height: 932, name: '430px' }
  ];

  for (const vp of viewports) {
    console.log(`\n--- TESTING VIEWPORT ${vp.name} ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      locale: 'ar-JO'
    });
    const page = await context.newPage();

    try {
      // 1. Scroll page halfway -> open mobile menu -> background must not move
      await page.goto(`http://localhost:${port}/ar/search`, { waitUntil: 'commit' });
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);
      
      const menuBtn = page.locator('header button:has(.lucide-menu), header button[aria-label*="القائمة"]').first();
      await menuBtn.click();
      await page.waitForTimeout(400);

      const bodyStyleAfterOpen = await page.evaluate(() => ({
        position: document.body.style.position,
        overflow: document.body.style.overflow
      }));
      console.log(`Scenario 1 (${vp.name}): Body locked =`, bodyStyleAfterOpen.position === 'fixed' && bodyStyleAfterOpen.overflow === 'hidden');

      // 2. Close menu -> exact previous scroll position restored
      const drawerCloseBtn = page.locator('.fixed.inset-0.z-50 button').first();
      await drawerCloseBtn.click();
      await page.waitForTimeout(400);

      const scrollAfterClose = await page.evaluate(() => window.scrollY);
      const bodyStyleAfterClose = await page.evaluate(() => document.body.style.overflow);
      console.log(`Scenario 2 (${vp.name}): Scroll restored (${scrollAfterClose}px === 500px) =`, scrollAfterClose === 500);
      console.log(`Scenario 9 (${vp.name}): Body overflow cleaned up =`, bodyStyleAfterClose === '');

      // 3. Open/close menu repeatedly 10 times
      for (let i = 0; i < 10; i++) {
        await menuBtn.click();
        await page.waitForTimeout(80);
        await page.locator('.fixed.inset-0.z-50 button').first().click();
        await page.waitForTimeout(80);
      }
      const scrollAfter10 = await page.evaluate(() => window.scrollY);
      console.log(`Scenario 3 (${vp.name}): 10x repeat toggle scroll preserved =`, scrollAfter10 === 500);

      // 4 & 5. Filter drawer & Bottom nav behind backdrop
      const filterBtn = page.locator('button:has-text("فلترة نتائج الأطباء")').first();
      if (await filterBtn.isVisible()) {
        await filterBtn.click();
        await page.waitForTimeout(400);

        const drawerBodyScrollable = await page.evaluate(() => {
          const drawerBody = document.querySelector('.fixed.inset-0.z-50 .overflow-y-auto');
          return drawerBody !== null;
        });
        console.log(`Scenario 4 (${vp.name}): Filter drawer body scrollable =`, drawerBodyScrollable);

        // 6. Backdrop tap closes
        const backdrop = page.locator('.fixed.inset-0.z-50').first();
        await backdrop.click({ position: { x: 20, y: 20 } });
        await page.waitForTimeout(400);
        const isDrawerClosed = !(await page.locator('.fixed.inset-0.z-50').isVisible());
        console.log(`Scenario 6 (${vp.name}): Backdrop tap closes =`, isDrawerClosed);
      }

      // 7. Escape key closes
      await menuBtn.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const isClosedByEscape = !(await page.locator('.fixed.inset-0.z-50').isVisible());
      console.log(`Scenario 7 (${vp.name}): Escape closes =`, isClosedByEscape);

      // 8. Route change closes
      await menuBtn.click();
      await page.waitForTimeout(300);
      const doctorsLink = page.locator('.fixed.inset-0.z-50 a:has-text("الأطباء")').first();
      await doctorsLink.click();
      await page.waitForTimeout(1000);
      const isClosedByRouteChange = !(await page.locator('.fixed.inset-0.z-50').isVisible());
      console.log(`Scenario 8 (${vp.name}): Route change closes =`, isClosedByRouteChange);

      // 12. Confirm no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log(`Scenario 12 (${vp.name}): No horizontal scroll =`, !hasHorizontalScroll);

    } catch (err) {
      console.error(`Error in viewport ${vp.name}:`, err.message);
    }
    await context.close();
  }

  if (browser) await browser.close();
  process.exit(0);
}

runQA();
