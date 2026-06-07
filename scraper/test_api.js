const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false }); // usar false pra não ser bloqueado rápido
  const page = await browser.newPage();
  
  page.on('response', async response => {
    if (response.url().includes('feed/df_st')) {
       console.log('>>> [API-INTERCEPT] Fetching stats from:', response.url());
       try {
           const text = await response.text();
           console.log('>>> PAYLOAD:', text.substring(0, 150)); // mostrando inicio do payload
           if(text.includes('Corner')) console.log('Achou "Corner" no payload!');
       } catch(e) {}
    }
  });

  await page.goto('https://www.flashscore.com/match/r1DNXnig/#/match-summary/match-statistics/0', { waitUntil: 'load', timeout: 30000 });
  
  // click stats tab
  try {
     const abaStats = await page.getByRole('link', { name: /Estatísticas|Stats/i }).first();
     if (abaStats) { await abaStats.click({timeout: 1000}); }
  } catch(e) {}

  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
