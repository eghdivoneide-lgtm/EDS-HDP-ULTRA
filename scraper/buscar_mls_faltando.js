/**
 * BUSCA MLS — Coleta rodada 6 completa + 4 jogos rodada 1 sem placar
 * Roda no seu PC com: node buscar_mls_faltando.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
async function delayRandom(min, max) {
  const t = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(r => setTimeout(r, t));
}

// IDs que precisamos re-scraper (rodada 1 sem placar)
const IDS_RODADA1 = ['l2KEZ8Mt','bwu5F5yP','fgQqSCeB','xOjdHR6C'];

async function coletarIdsMLS(page) {
  console.log('\n🔍 Buscando IDs da rodada 6 MLS no FlashScore...');
  await page.goto('https://www.flashscore.com/football/usa/mls/results/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(4000);

  // Clicar em "Mostrar mais" várias vezes para carregar mais jogos
  for (let i = 0; i < 5; i++) {
    try {
      const btn = await page.$('.event__more, [class*="showMore"]');
      if (btn) { await btn.click(); await delay(2000); }
      else break;
    } catch(e) { break; }
  }

  // Extrair todos os IDs com data
  const jogos = await page.evaluate(() => {
    const items = document.querySelectorAll('.event__match');
    const result = [];
    items.forEach(el => {
      const id = el.id?.split('_').slice(-1)[0];
      const dateEl = el.closest('.event__round')?.previousElementSibling;
      const teams = el.querySelectorAll('.event__participant');
      if (id && teams.length >= 2) {
        result.push({
          id,
          mandante: teams[0].textContent.trim(),
          visitante: teams[1].textContent.trim()
        });
      }
    });
    return result;
  });

  console.log('IDs encontrados:', jogos.length);
  return jogos;
}

async function scrapeJogo(page, id) {
  const url = `https://www.flashscore.com/match/${id}/#/match-summary/match-statistics/0`;
  const res = { id, gols: { ht: {m:0,v:0}, ft: {m:0,v:0} }, cantos: { ht:{m:0,v:0}, ft:{m:0,v:0} }, stats_taticas: { posse:{m:50,v:50}, finalizacoes:{m:0,v:0} }, placar: null };

  let ftData = null;
  const interceptor = async response => {
    try {
      if (response.url().includes('/_fd/match-statistics') || response.url().includes('StatisticsData')) {
        const text = await response.text();
        if (text.includes('Corner') || text.includes('corner')) ftData = text;
      }
    } catch(e) {}
  };
  page.on('response', interceptor);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(3000);

  // Extrair placar FT
  try {
    const scores = await page.evaluate(() => {
      const home = document.querySelector('.detailScore__wrapper span:first-child, [class*="homeScore"]');
      const away = document.querySelector('.detailScore__wrapper span:last-child, [class*="awayScore"]');
      return { m: parseInt(home?.textContent) || 0, v: parseInt(away?.textContent) || 0 };
    });
    res.gols.ft = scores;
    res.placar = { m: scores.m, v: scores.v };
  } catch(e) {}

  page.off('response', interceptor);
  return res;
}

(async () => {
  console.log('🏟️  BUSCA MLS — Rodada 6 + 4 jogos rodada 1');
  console.log('='.repeat(50));

  // Carregar dados atuais
  const DATA_DIR = path.join(__dirname, '..', 'data');
  const MLS_FILE = path.join(DATA_DIR, 'mls2026.js');

  const rawFile = fs.readFileSync(MLS_FILE, 'utf8');
  const fn = new Function('window','module', rawFile.replace(/^\/\/.*/mg,'') + '\nreturn window;');
  const dados = fn({},{exports:{}}).DADOS_MLS;
  const idsExistentes = new Set(dados.jogos.map(j => j.id));
  console.log('Jogos já na base:', dados.jogos.length);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Passo 1: Coletar IDs da rodada 6
  let novosIds = [];
  try {
    const todosIds = await coletarIdsMLS(page);
    novosIds = todosIds.filter(j => !idsExistentes.has(j.id));
    console.log('Novos IDs rodada 6:', novosIds.length);
  } catch(e) {
    console.log('Erro ao coletar IDs:', e.message);
  }

  // Passo 2: Incluir os 4 IDs da rodada 1 sem placar
  const rodada1Faltando = dados.jogos.filter(j => j.rodada === 1 && (!j.placar || j.placar.m == null));
  console.log('Rodada 1 para re-scraping:', rodada1Faltando.length);

  // Passo 3: Scraping de todos
  const paraScrapear = [
    ...rodada1Faltando.map(j => ({ id: j.id, rodada: 1, mandante: j.mandante, visitante: j.visitante })),
    ...novosIds.map(j => ({ ...j, rodada: 6 }))
  ];

  const resultados = [];
  for (const jogo of paraScrapear) {
    console.log(`\n⚽ [${jogo.rodada}] ${jogo.mandante} x ${jogo.visitante} (${jogo.id})`);
    try {
      const res = await scrapeJogo(page, jogo.id);
      res.mandante = jogo.mandante;
      res.visitante = jogo.visitante;
      res.rodada = jogo.rodada;
      console.log(`   ✅ FT: ${res.gols.ft.m}-${res.gols.ft.v}`);
      resultados.push(res);
    } catch(e) {
      console.log(`   ❌ Erro: ${e.message}`);
    }
    await delayRandom(2000, 4000);
  }

  await browser.close();

  // Passo 4: Integrar resultados
  if (resultados.length === 0) {
    console.log('\n⚠️ Nenhum resultado coletado.');
    return;
  }

  // Atualizar jogos existentes (rodada 1 sem placar)
  resultados.forEach(r => {
    const idx = dados.jogos.findIndex(j => j.id === r.id);
    if (idx >= 0) {
      dados.jogos[idx].gols = r.gols;
      dados.jogos[idx].placar = r.placar;
      dados.jogos[idx].cantos = r.cantos;
      dados.jogos[idx].stats_taticas = r.stats_taticas;
      console.log(`Atualizado: ${r.mandante} x ${r.visitante}`);
    } else {
      // Novo jogo (rodada 6)
      dados.jogos.push({
        id: r.id,
        mandante: r.mandante,
        visitante: r.visitante,
        gols: r.gols,
        cantos: r.cantos,
        stats_taticas: r.stats_taticas,
        rodada: r.rodada,
        placar: r.placar
      });
      console.log(`Adicionado: ${r.mandante} x ${r.visitante}`);
    }
  });

  // Salvar
  const saida = '// MLS 2026 - Atualizado pela coleta noturna\nwindow.DADOS_MLS = ' + JSON.stringify(dados, null, 2) + ';\n';
  const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  fs.copyFileSync(MLS_FILE, MLS_FILE.replace('.js', `.js.backup_${ts}`));
  fs.writeFileSync(MLS_FILE, saida);

  // Salvar também no path raiz
  const MLS2 = MLS_FILE.replace('EDS-Analise-ODDS/especialista-cantos', 'especialista-cantos');
  if (fs.existsSync(MLS2)) fs.writeFileSync(MLS2, saida);

  console.log('\n✅ MLS atualizada:', dados.jogos.length, 'jogos');
  console.log('💾 Arquivo salvo:', MLS_FILE);
})();
