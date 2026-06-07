const { chromium } = require('playwright');
const fs = require('fs');

const LEAGUE_RESULTS_URL = 'https://www.flashscore.com/football/usa/mls/results/';

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
  console.log('Iniciando o Scraper (FlashScore Crawler)...');
  const browser = await chromium.launch({ headless: false }); // Vemos a tela pescando os dados
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Acessando Liga:', LEAGUE_RESULTS_URL);
  await page.goto(LEAGUE_RESULTS_URL, { waitUntil: 'domcontentloaded' });

  // Fechar banner de cookies se existir
  try {
    const cookieBtn = await page.waitForSelector('#onetrust-reject-all-handler', { timeout: 3000 });
    if (cookieBtn) await cookieBtn.click();
  } catch (e) { /* Ignorar se não existir */ }

  console.log('Abrindo todos os jogos (Clicando em carregar mais)...');
  let hasMore = true;
  while(hasMore) {
    try {
      const moreBtn = await page.waitForSelector('.event__more', { timeout: 2000, state: 'visible' });
      await moreBtn.click();
      await delay(1000);
    } catch(e) {
      hasMore = false; // Não tem mais botão
    }
  }

  // Pegar todos os Match IDs
  console.log('Coletando IDs das partidas...');
  const matchIds = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.event__match'));
    return rows.map(r => r.id.replace('g_1_', ''));
  });

  console.log(`Total de Jogos mapeados: ${matchIds.length}`);
  if(!matchIds.length) {
    console.log('Nenhum jogo encontrado. Parando.');
    await browser.close();
    return;
  }

  // Salvar a lista bruta de IDs pra não perder a primeira fase
  fs.writeFileSync('match_ids.json', JSON.stringify(matchIds));
  console.log('IDs salvos em match_ids.json. Testando a captura do jogo mais recente (apenas o primeiro para validar)...');

  // Testar 1 Jogo para Validação
  const testId = matchIds[0];
  const urlStats = `https://www.flashscore.com/match/${testId}/#/match-summary/match-statistics/0`;
  console.log(`Pescando Estatísticas do Jogo: ${urlStats}`);
  
  await page.goto(urlStats, { waitUntil: 'load' });
  await delay(1500); // Deixar Flashscore carregar o JS dos dados

  const stats = await page.evaluate(() => {
    let result = { 
      mandante: '?', visitante: '?', 
      placarHT: '?', placarFT: '?',
      estatisticas: {} 
    };
    
    // Nomes
    const homeEl = document.querySelector('.duelParticipant__home .participant__participantName');
    const awayEl = document.querySelector('.duelParticipant__away .participant__participantName');
    if (homeEl) result.mandante = homeEl.innerText.trim();
    if (awayEl) result.visitante = awayEl.innerText.trim();

    // Scores
    const resultEl = document.querySelector('.detailScore__wrapper');
    if (resultEl) result.placarFT = resultEl.innerText.replace(/\n/g, '').trim();

    // Linhas de Estatística (Posse, Cantos, etc)
    const statRows = document.querySelectorAll('.stat__category');
    statRows.forEach(row => {
      const name = row.querySelector('.stat__categoryName')?.innerText.trim().toLowerCase();
      const valHome = row.querySelector('.stat__homeValue')?.innerText.replace('%','').trim();
      const valAway = row.querySelector('.stat__awayValue')?.innerText.replace('%','').trim();
      if (name) {
        result.estatisticas[name] = { h: Number(valHome) || valHome, a: Number(valAway) || valAway };
      }
    });

    return result;
  });

  console.log('🔍 RESULTADO DO TESTE DO SCRAPER:');
  console.log(stats);

  await browser.close();
  console.log('Teste concluído. Validando estrutura...');
})();
