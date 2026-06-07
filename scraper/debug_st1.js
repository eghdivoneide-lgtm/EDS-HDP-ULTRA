const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('response', async r => {
    if(r.url().includes('feed/df_st_1_')) {
      try {
          const txt = await r.text();
          let out = '';
          txt.split('~').forEach(b => {
              if (b.includes('Corner') || b.includes('posse') || b.includes('Possession') || b.includes('shots') || b.includes('attempts')) {
                  out += b + '\n';
              }
          });
          fs.writeFileSync('debug_payload.txt', out, 'utf-8');
          console.log('Payload saved to debug_payload.txt');
      } catch(e) {}
    }
  });
  await page.goto('https://www.flashscore.com/match/r1DNXnig/#/match-summary/match-statistics/0', { waitUntil: 'load' });
  try {
     const abaStats = await page.getByRole('link', { name: /Estatísticas|Stats/i }).first();
     if (abaStats) await abaStats.click({timeout: 2000});
  } catch(e) {}
  await new Promise(r => setTimeout(r, 6000));
  await browser.close();
})();
