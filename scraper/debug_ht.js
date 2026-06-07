const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('response', r => {
    if(r.url().includes('feed') && r.url().includes('st_')) {
      console.log('FEED API: ', r.url().split('/').pop());
    }
  });
  await page.goto('https://www.flashscore.com/match/r1DNXnig/#/match-summary/match-statistics/1', { waitUntil: 'load' });
  try {
     const abaHT = await page.getByRole('link', { name: /1st Half|1º Tempo/i }).first();
     if (abaHT) await abaHT.click({timeout: 2000});
  } catch(e) {}
  await new Promise(r => setTimeout(r, 6000));
  await browser.close();
})();
