const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.flashscore.com/match/l2KEZ8Mt/#/match-summary/match-statistics/1', { waitUntil: 'load' });
  try {
     const abaHT = await page.getByRole('link', { name: /1st Half|1º Tempo/i }).first();
     if (abaHT) await abaHT.click({timeout: 2000});
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 4000));
  
  try {
     const res = await page.evaluate(() => {
         // Get the section containing the stats
         const sec = document.querySelector('.section');
         return sec ? sec.outerHTML : document.body.innerHTML;
     });
     fs.writeFileSync('debug_dom.html', res, 'utf-8');
     console.log('Saved DOM!');
  } catch(e) {}
  await browser.close();
})();
