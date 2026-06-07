const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.flashscore.com/match/r1DNXnig/#/match-summary/match-statistics/0', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // click show more
  try {
     await page.getByText(/Show more/i).first().click();
     await page.waitForTimeout(2000);
  } catch(e) { }
  
  const categories = await page.evaluate(() => {
     let cnames = [];
     const statRows = document.querySelectorAll('[data-testid="wcl-statistics"]');
     statRows.forEach(row => {
        const cel = row.querySelector('[data-testid="wcl-statistics-category"]');
        if(cel) cnames.push(cel.innerText.trim().toLowerCase());
     });
     return cnames;
  });
  console.log("CATEGORIAS ENCONTRADAS:");
  console.log(categories);
  await browser.close();
})();
