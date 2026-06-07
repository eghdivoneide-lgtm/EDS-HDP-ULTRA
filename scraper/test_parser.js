const { chromium } = require('playwright');
function parseFlashscoreStats(textoCru) {
  const statsResult = { m_posse: 0, v_posse: 0, m_chutes: 0, v_chutes: 0, m_cantos: 0, v_cantos: 0 };
  const blocos = textoCru.split('~');
  blocos.forEach(bloco => {
    if (bloco.includes('SG÷')) {
      const parts = bloco.split('¬');
      let nome = ''; let m = 0; let v = 0;
      parts.forEach(p => {
        if (p.startsWith('SG÷')) nome = p.replace('SG÷', '').toLowerCase();
        if (p.startsWith('SH÷')) m = parseInt(p.replace('SH÷', '').replace('%', ''));
        if (p.startsWith('SI÷')) v = parseInt(p.replace('SI÷', '').replace('%', ''));
      });
      console.log(`Linha extraída: ${nome} | m:${m} | v:${v}`);
      if (nome.includes('possession') || nome.includes('posse')) {
        statsResult.m_posse = m || 0; statsResult.v_posse = v || 0;
      } else if (nome.includes('corner') || nome.includes('escanteio')) {
        statsResult.m_cantos = m || 0; statsResult.v_cantos = v || 0;
      } else if (nome.includes('total shots') || nome.includes('goal attempts') || nome.includes('tentativas')) {
        if (!statsResult.m_chutes || nome.includes('total shots')) {
           statsResult.m_chutes = m || 0; statsResult.v_chutes = v || 0;
        }
      }
    }
  });
  return statsResult;
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('response', async response => {
    if (response.url().includes('feed/df_st_')) {
       const text = await response.text();
       console.log("PAYLOAD RAW START: ", text.substring(0, 100));
       const p = parseFlashscoreStats(text);
       console.log("RESULTADO FINAL: ", p);
    }
  });
  await page.goto('https://www.flashscore.com/match/MuSyUYQb/#/match-summary/match-statistics/0', { waitUntil: 'load' });
  try {
     const abaStats = await page.getByRole('link', { name: /Estatísticas|Stats/i }).first();
     if (abaStats) await abaStats.click({timeout: 1000});
  } catch(e) {}
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
