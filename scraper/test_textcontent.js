const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const urlStats = `https://www.flashscore.com/match/r1DNXnig/#/match-summary/match-statistics/0`;
  await page.goto(urlStats, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000); 

  try {
     const showMoreBtn = await page.getByText(/Show more|Mostrar mais/i).first();
     if (showMoreBtn) {
        await showMoreBtn.click({force: true});
        await page.waitForTimeout(1500); 
     }
  } catch(e) {}

  const stats = await page.evaluate(() => {
    let res = { ft_cantos_m: 0, test_names: [], text_contents: [] };
    const statCategories = Array.from(document.querySelectorAll('[data-testid="wcl-statistics"]'));
    statCategories.forEach(row => {
      const categoryEl = row.querySelector('[data-testid="wcl-statistics-category"]');
      if(!categoryEl) return;
      res.test_names.push(categoryEl.innerText.trim().toLowerCase());
      res.text_contents.push(categoryEl.textContent.trim().toLowerCase());
      
      const values = Array.from(row.querySelectorAll('[data-testid="wcl-statistics-value"]'));
      if(values.length < 2) return;
      
      const valH = parseInt(values[0].textContent.replace('%','').trim()) || 0;
      
      if (categoryEl.textContent.toLowerCase().includes('corner')) {
         res.ft_cantos_m = valH;
      }
    });
    return res;
  });
  
  console.log(stats);
  await browser.close();
})();
