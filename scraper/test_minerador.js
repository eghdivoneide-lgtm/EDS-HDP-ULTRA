const { chromium } = require('playwright');
const fs = require('fs');

async function delay(time) { return new Promise(resolve => setTimeout(resolve, time)); }

(async () => {
  console.log('Iniciando TESTE RAPIDO MLS (Apenas 2 Jogos)...');
  const matchIds = JSON.parse(fs.readFileSync('match_ids.json', 'utf-8')).slice(2, 4);

  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const resultadosDaLiga = [];

  for (let i = 0; i < matchIds.length; i++) {
    const id = matchIds[i];
    const urlStats = `https://www.flashscore.com/match/${id}/#/match-summary/match-statistics/0`;
    console.log(`Pescando Jogo TESTE [${i+3}]: ${urlStats}`);
    
    try {
      await page.goto(urlStats, { waitUntil: 'load', timeout: 30000 });
      await delay(2000); 
      
      try {
         const showMoreBtn = await page.getByText(/Show more|Mostrar mais/i).first();
         if (await showMoreBtn.isVisible()) {
            await showMoreBtn.click({force: true});
            try { await page.waitForSelector('text="Corner kicks"', { timeout: 3000 }); } catch(e){}
         }
      } catch(e) { console.log("Sem botão Show more"); }
      
      // Salvar depois do clique (diagnostico)
      await page.screenshot({path: `test_after_click_${i}.png`, fullPage: true});

      const stats = await page.evaluate(() => {
        let res = { id: '', mandante: '', visitante: '', cantos: { ft: { m: 0, v: 0 } }, stats_taticas: { posse: { m: 0, v: 0 }, finalizacoes: { m: 0, v: 0 } } };

        const homeEl = document.querySelector('.duelParticipant__home .participant__participantName');
        const awayEl = document.querySelector('.duelParticipant__away .participant__participantName');
        if (homeEl) res.mandante = homeEl.innerText.trim();
        if (awayEl) res.visitante = awayEl.innerText.trim();

        // Pega nomes crus para debugar no console também
        res._rawCategories = [];

        const statCategories = Array.from(document.querySelectorAll('[data-testid="wcl-statistics"]'));
        statCategories.forEach(row => {
          const categoryEl = row.querySelector('[data-testid="wcl-statistics-category"]');
          if(!categoryEl) return;
          const name = categoryEl.innerText.trim().toLowerCase();
          res._rawCategories.push(name);
          
          const values = Array.from(row.querySelectorAll('[data-testid="wcl-statistics-value"]'));
          if (values.length < 2) return;
          
          const valH = parseInt(values[0].innerText.replace('%','').trim()) || 0;
          const valA = parseInt(values[1].innerText.replace('%','').trim()) || 0;
          
          if (name.includes('possession') || name.includes('posse')) {
            res.stats_taticas.posse.m = valH; res.stats_taticas.posse.v = valA;
          } else if (name.includes('attempts') || name.includes('shots') || name.includes('tentativas') || name.includes('finalizações')) {
            if (!res.stats_taticas.finalizacoes.m && name.includes('total shots')) {
               res.stats_taticas.finalizacoes.m = valH; res.stats_taticas.finalizacoes.v = valA;
            } else if (name.includes('goal attempts') || name.includes('tentativas de gol')) {
               res.stats_taticas.finalizacoes.m = valH; res.stats_taticas.finalizacoes.v = valA;
            }
          } else if (name.includes('corner kicks') || name.includes('escanteios')) {
            res.cantos.ft.m = valH; res.cantos.ft.v = valA;
          }
        });
        return res;
      });
      
      console.log(`> RESULTADO HT/FT de ${stats.mandante}`);
      resultadosDaLiga.push(stats);
    } catch(err) {
      console.log(`Erro crítico no ID ${id}: ${err.message}`);
    }
  }

  fs.writeFileSync('test_output_safe.json', JSON.stringify(resultadosDaLiga, null, 2), 'utf-8');
  await browser.close();
  console.log('✅ TESTE RAPIDO Concluído!');
})();
