const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log("Abrindo navegador oculto para diagnóstico...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  const url = 'https://www.flashscore.com/match/r1DNXnig/#/match-summary/match-statistics/0';
  console.log("Visitando: " + url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  
  await page.waitForTimeout(3000); // Dar tempo extra pro Javascript deles
  
  // Salvar captura de tela
  await page.screenshot({ path: 'diagnose.png', fullPage: true });
  console.log("Screenshot salvo.");

  // Obter texto bruto para saber se os dados estão na página
  const fullText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('diagnose_text.txt', fullText);
  
  // Tentar encontrar o bloco de estatísticas
  const htmlSnippets = await page.evaluate(() => {
     // Procurar a palavra 'possession'
     let blocks = Array.from(document.querySelectorAll('div'));
     let row = blocks.find(el => {
         return el.innerText.toLowerCase().includes('possession') && el.childElementCount < 5 && el.innerText.length < 50;
     });
     
     if(row) {
        return "FOUND POSSESSION ROW:\n" + row.outerHTML + "\n\nPARENT ROW:\n" + (row.parentElement ? row.parentElement.outerHTML : '');
     }
     return "POSSESSION NOT FOUND";
  });
  
  fs.writeFileSync('diagnose_html.txt', htmlSnippets);
  
  console.log("Diagnóstico HTML concluído. Fechando.");
  await browser.close();
})();
