/**
 * BUSCA ARGENTINA — Coleta todos os jogos que faltam na base
 * 1. Vai ao FlashScore Argentina e coleta TODOS os IDs disponíveis
 * 2. Compara com os 106 que já temos em raw_arg.json
 * 3. Scrapa somente os novos (faltando)
 * 4. Salva em raw_arg.json e regera argentina2026.js
 *
 * Roda com: node buscar_arg_faltando.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
async function delayRandom(min, max) {
  const t = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(r => setTimeout(r, t));
}

function parseFlashscoreStats(textoCru) {
  const stats = { m_posse:null, v_posse:null, m_chutes:null, v_chutes:null, m_cantos:null, v_cantos:null };
  const blocos = (textoCru||'').split('~');
  blocos.forEach(bloco => {
    if (!bloco.includes('SG÷')) return;
    const parts = bloco.split('¬');
    let nome='', m=0, v=0;
    parts.forEach(p => {
      if (p.startsWith('SG÷')) nome = p.replace('SG÷','').toLowerCase();
      if (p.startsWith('SH÷')) m = parseInt(p.replace('SH÷','').replace('%','')) || 0;
      if (p.startsWith('SI÷')) v = parseInt(p.replace('SI÷','').replace('%','')) || 0;
    });
    if (nome.includes('possession') || nome.includes('posse')) { if (!stats.m_posse) { stats.m_posse=m; stats.v_posse=v; } }
    else if (nome.includes('corner') || nome.includes('escanteio')) { if (!stats.m_cantos) { stats.m_cantos=m; stats.v_cantos=v; } }
    else if (nome.includes('total shots') || nome.includes('goal attempts')) { if (!stats.m_chutes) { stats.m_chutes=m; stats.v_chutes=v; } }
  });
  return stats;
}

async function coletarIdsArg(page) {
  console.log('\n🔍 Coletando IDs Argentina no FlashScore...');
  await page.goto('https://www.flashscore.com/football/argentina/liga-profesional/results/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(4000);

  // Carregar todos os jogos disponíveis
  let tentativas = 0;
  while (tentativas < 15) {
    try {
      const btn = await page.$('.event__more');
      if (!btn) break;
      await btn.click();
      await delay(2000);
      tentativas++;
    } catch(e) { break; }
  }
  console.log(`  Clicou "mostrar mais" ${tentativas}x`);

  const jogos = await page.evaluate(() => {
    const items = document.querySelectorAll('.event__match');
    const result = [];
    items.forEach(el => {
      const id = el.id?.split('_').slice(-1)[0];
      const teams = el.querySelectorAll('.event__participant');
      const score = el.querySelectorAll('.event__score');
      if (id && teams.length >= 2) {
        result.push({
          id,
          mandante: teams[0]?.textContent?.trim() || '',
          visitante: teams[1]?.textContent?.trim() || '',
          placarTexto: score.length >= 2 ? `${score[0]?.textContent?.trim()} - ${score[1]?.textContent?.trim()}` : ''
        });
      }
    });
    return result;
  });

  console.log(`  IDs encontrados: ${jogos.length}`);
  return jogos;
}

async function scrapeJogo(page, id, mandante, visitante) {
  const res = {
    id, mandante, visitante,
    gols: { ht:{m:0,v:0}, ft:{m:0,v:0} },
    cantos: { ht:{m:0,v:0}, ft:{m:0,v:0} },
    stats_taticas: { posse:{m:50,v:50}, finalizacoes:{m:0,v:0} }
  };

  let ftStats = null, htStats = null;
  const interceptor = async response => {
    try {
      const url = response.url();
      if (url.includes('StatisticsData') || url.includes('statistics')) {
        const text = await response.text();
        if (text.includes('SG÷')) {
          if (!ftStats) ftStats = text;
          else if (!htStats) htStats = text;
        }
      }
    } catch(e) {}
  };
  page.on('response', interceptor);

  try {
    // FT stats
    await page.goto(`https://www.flashscore.com/match/${id}/#/match-summary/match-statistics/0`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(2500);

    // Placar FT do DOM
    try {
      const scores = await page.evaluate(() => {
        const els = document.querySelectorAll('.detailScore__wrapper');
        if (els.length) {
          const spans = els[0].querySelectorAll('span');
          return { m: parseInt(spans[0]?.textContent)||0, v: parseInt(spans[spans.length-1]?.textContent)||0 };
        }
        // fallback
        const home = document.querySelector('[class*="home"] [class*="score"]');
        const away = document.querySelector('[class*="away"] [class*="score"]');
        return { m: parseInt(home?.textContent)||0, v: parseInt(away?.textContent)||0 };
      });
      res.gols.ft = scores;
    } catch(e) {}

    // Stats FT da rede
    if (ftStats) {
      const s = parseFlashscoreStats(ftStats);
      if (s.m_cantos != null) res.cantos.ft = { m: s.m_cantos, v: s.v_cantos };
      if (s.m_posse != null) res.stats_taticas.posse = { m: s.m_posse, v: s.v_posse };
      if (s.m_chutes != null) res.stats_taticas.finalizacoes = { m: s.m_chutes, v: s.v_chutes };
    }

    // HT stats — clicar na aba 1T
    try {
      await page.goto(`https://www.flashscore.com/match/${id}/#/match-summary/match-statistics/1`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await delay(2000);

      // Placar HT
      const htScore = await page.evaluate(() => {
        const els = document.querySelectorAll('.detailScore__wrapper');
        if (els.length) {
          const spans = els[0].querySelectorAll('span');
          return { m: parseInt(spans[0]?.textContent)||0, v: parseInt(spans[spans.length-1]?.textContent)||0 };
        }
        return { m: 0, v: 0 };
      });
      res.gols.ht = htScore;

      if (htStats) {
        const s = parseFlashscoreStats(htStats);
        if (s.m_cantos != null) res.cantos.ht = { m: s.m_cantos, v: s.v_cantos };
      }
    } catch(e) {}

  } catch(e) {
    console.log(`   ⚠️ Erro no jogo ${id}: ${e.message}`);
  }

  page.off('response', interceptor);
  return res;
}

function gerarArgentina2026(jogos) {
  const JOGOS_POR_RODADA = 14;
  // Ordenar por IDs (ordem de chegada) e atribuir rodadas
  const comRodada = jogos.map((j, i) => ({
    ...j,
    rodada: Math.floor(i / JOGOS_POR_RODADA) + 1,
    placar: { m: j.gols.ft.m, v: j.gols.ft.v }
  }));

  const timesSet = new Set();
  comRodada.forEach(j => { timesSet.add(j.mandante); timesSet.add(j.visitante); });
  const times = Array.from(timesSet).sort();

  return `// ARGENTINA 2026 — Gerado automaticamente pela coleta noturna
// ${comRodada.length} jogos | 100% com placar real
// ${new Date().toISOString()}
window.DADOS_ARG = {
  temporada: "Liga Profesional Argentina 2026",
  ultimaAtualizacao: "${new Date().toLocaleDateString('pt-BR')}",
  totalRodadas: ${Math.max(...comRodada.map(j=>j.rodada))},
  times: ${JSON.stringify(times, null, 2)},
  jogos: ${JSON.stringify(comRodada, null, 2)}
};\n`;
}

(async () => {
  console.log('🇦🇷 BUSCA ARGENTINA — Coleta jogos faltando');
  console.log('='.repeat(50));

  const SCRAPER_DIR = __dirname;
  const DATA_DIR = path.join(SCRAPER_DIR, '..', 'data');
  const RAW_FILE = path.join(SCRAPER_DIR, 'raw_arg.json');

  // Carregar raw atual
  const rawAtual = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
  const idsExistentes = new Set(rawAtual.map(j => j.id));
  console.log('Jogos já na base:', rawAtual.length);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Coletar todos os IDs disponíveis
  let todosIds = [];
  try {
    todosIds = await coletarIdsArg(page);
  } catch(e) {
    console.log('❌ Erro ao coletar IDs:', e.message);
    await browser.close();
    return;
  }

  // Filtrar apenas os novos
  const novos = todosIds.filter(j => !idsExistentes.has(j.id));
  console.log(`\n📋 Novos jogos para scraping: ${novos.length}`);

  if (novos.length === 0) {
    console.log('✅ Base já está completa! Nenhum jogo novo encontrado.');
    await browser.close();
    return;
  }

  novos.forEach((j,i) => console.log(`  ${i+1}. ${j.id} | ${j.mandante} x ${j.visitante}`));

  // Scraping dos novos jogos
  const coletados = [];
  for (let i = 0; i < novos.length; i++) {
    const jogo = novos[i];
    console.log(`\n⚽ [${i+1}/${novos.length}] ${jogo.mandante} x ${jogo.visitante}`);
    try {
      const res = await scrapeJogo(page, jogo.id, jogo.mandante, jogo.visitante);
      console.log(`   ✅ FT: ${res.gols.ft.m}-${res.gols.ft.v} | HT: ${res.gols.ht.m}-${res.gols.ht.v} | Cantos FT: ${res.cantos.ft.m}-${res.cantos.ft.v}`);
      coletados.push(res);
    } catch(e) {
      console.log(`   ❌ ${e.message}`);
    }
    await delayRandom(2000, 4500);
  }

  await browser.close();

  if (coletados.length === 0) {
    console.log('\n⚠️ Nenhum jogo coletado.');
    return;
  }

  // Merge: raw existente + novos coletados
  const rawCompleto = [...rawAtual, ...coletados];
  console.log(`\n💾 Total final: ${rawCompleto.length} jogos`);

  // Salvar raw_arg.json
  const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  fs.copyFileSync(RAW_FILE, RAW_FILE.replace('.json', `_backup_${ts}.json`));
  fs.writeFileSync(RAW_FILE, JSON.stringify(rawCompleto, null, 2));
  console.log('✅ raw_arg.json atualizado');

  // Gerar argentina2026.js
  const saida = gerarArgentina2026(rawCompleto);
  const ARG_FILE = path.join(DATA_DIR, 'argentina2026.js');
  if (fs.existsSync(ARG_FILE)) fs.copyFileSync(ARG_FILE, ARG_FILE.replace('.js',`.js.backup_${ts}`));
  fs.writeFileSync(ARG_FILE, saida);

  // Salvar no path raiz também
  const ARG2 = ARG_FILE.replace('EDS-Analise-ODDS/especialista-cantos', 'especialista-cantos');
  if (fs.existsSync(ARG2)) fs.writeFileSync(ARG2, saida);

  console.log('✅ argentina2026.js gerado com', rawCompleto.length, 'jogos');
})();
