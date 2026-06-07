const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('response', async r => {
    if(r.url().includes('feed/df_st_1_')) {
      try {
          const txt = await r.text();
          let currentStage = '';
          let out = '';
          txt.split('~').forEach(b => {
             if (b.startsWith('SD÷')) {
                 currentStage = b.split('¬')[0];
             }
             if (b.includes('Corner') || b.includes('posse') || b.includes('Possession') || b.includes('shots') || b.includes('attempts')) {
                 out += currentStage + ' | ' + b.split('¬')[1] + ' | M: ' + (b.split('SH÷')[1]?.split('¬')[0]||'') + ' V: ' + (b.split('SI÷')[1]?.split('¬')[0]||'') + '\n';
             }
          });
          fs.writeFileSync('sd_out.txt', out, 'utf-8');
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
