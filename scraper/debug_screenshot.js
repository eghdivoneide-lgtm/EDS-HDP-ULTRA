const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.flashscore.com/match/l2KEZ8Mt/#/match-summary/match-statistics/0', { waitUntil: 'load' });
  try {
     const abaStats = await page.getByRole('link', { name: /Estatísticas|Stats/i }).first();
     if (abaStats) await abaStats.click({timeout: 2000});
  } catch(e) {}
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'portland_ft.png' });
  console.log('Screenshot save to portland_ft.png');
  await browser.close();
})();
