// minerador_rodada.js — Varredor de Rodada parametrizado (v1.0, 2026-05-15)
// Uso: node minerador_rodada.js <LIGA>
//   Ligas suportadas: BR, BR_B, ARG, ARG_B, BUN
//   Lê:    match_ids_rodada_09-12-maio_<liga>.json
//   Salva: raw_rodada_09-12-maio_<liga>.json
//
// Coleta: cantos HT/FT, gols FT, posse, finalizações, nomes dos times.
// Base: derivado de minerador_br.js (mantido intacto).

const { chromium } = require('playwright');
const fs = require('fs');

const LIGA = (process.argv[2] || '').toUpperCase();
const LIGAS_VALIDAS = ['BR', 'BR_B', 'ARG', 'ARG_B', 'BUN'];
if (!LIGAS_VALIDAS.includes(LIGA)) {
  console.log('❌ Uso: node minerador_rodada.js <LIGA>');
  console.log('   Ligas válidas: ' + LIGAS_VALIDAS.join(', '));
  process.exit(1);
}

const sufixo = LIGA.toLowerCase();
const ARQ_IN  = `match_ids_rodada_09-12-maio_${sufixo}.json`;
const ARQ_OUT = `raw_rodada_09-12-maio_${sufixo}.json`;

async function delay(t) { return new Promise(r => setTimeout(r, t)); }
async function delayRandom(min, max) {
  const t = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(r => setTimeout(r, t));
}

// Parseia pacote exótico Flashscore (~SD÷...¬SG÷Corner kicks¬SH÷7¬SI÷8)
function parseFlashscoreStats(textoCru) {
  const r = { m_posse: null, v_posse: null, m_chutes: null, v_chutes: null, m_cantos: null, v_cantos: null };
  textoCru.split('~').forEach(bloco => {
    if (!bloco.includes('SG÷')) return;
    const parts = bloco.split('¬');
    let nome = '', m = 0, v = 0;
    parts.forEach(p => {
      if (p.startsWith('SG÷')) nome = p.replace('SG÷','').toLowerCase();
      if (p.startsWith('SH÷')) m = parseInt(p.replace('SH÷','').replace('%','')) || 0;
      if (p.startsWith('SI÷')) v = parseInt(p.replace('SI÷','').replace('%','')) || 0;
    });
    if (nome.includes('possession') || nome.includes('posse')) {
      if (r.m_posse === null) { r.m_posse = m; r.v_posse = v; }
    } else if (nome.includes('corner') || nome.includes('escanteio') || nome.includes('cantos')) {
      if (r.m_cantos === null) { r.m_cantos = m; r.v_cantos = v; }
    } else if (nome.includes('total shots') || nome.includes('goal attempts') || nome.includes('tentativas')) {
      if (r.m_chutes === null || nome.includes('total shots')) { r.m_chutes = m; r.v_chutes = v; }
    }
  });
  return r;
}

(async () => {
  console.log(`📡 Varredor de Rodada — ${LIGA} (09-12/05/2026)`);

  if (!fs.existsSync(ARQ_IN)) {
    console.log(`❌ Arquivo não encontrado: ${ARQ_IN}`);
    return;
  }
  const matchIds = JSON.parse(fs.readFileSync(ARQ_IN, 'utf-8'));
  console.log(`Carregou ${matchIds.length} jogos da ${LIGA} para minerar.`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  const resultados = [];

  for (let i = 0; i < matchIds.length; i++) {
    const id = matchIds[i];
    console.log(`[${i+1}/${matchIds.length}] ${LIGA} | match_id: ${id}`);

    const res = {
      id, liga: LIGA,
      mandante: '', visitante: '',
      gols:   { ht: { m: 0, v: 0 }, ft: { m: 0, v: 0 } },
      cantos: { ht: { m: 0, v: 0 }, ft: { m: 0, v: 0 } },
      stats_taticas: { posse: { m: 0, v: 0 }, finalizacoes: { m: 0, v: 0 } }
    };

    let foundFT = false, foundHT = false;
    const interceptor = async (response) => {
      if (response.url().includes('feed/df_st_1_') && response.url().includes(id)) {
        try {
          const txt = await response.text();
          const p = parseFlashscoreStats(txt);
          res.cantos.ft.m = p.m_cantos; res.cantos.ft.v = p.v_cantos;
          res.stats_taticas.posse.m = p.m_posse; res.stats_taticas.posse.v = p.v_posse;
          res.stats_taticas.finalizacoes.m = p.m_chutes; res.stats_taticas.finalizacoes.v = p.v_chutes;
          foundFT = true;
        } catch(e) {}
      }
      if (response.url().includes('feed/df_st_2_') && response.url().includes(id)) {
        try {
          const txt = await response.text();
          const p = parseFlashscoreStats(txt);
          res.cantos.ht.m = p.m_cantos; res.cantos.ht.v = p.v_cantos;
          foundHT = true;
        } catch(e) {}
      }
    };
    page.on('response', interceptor);

    try {
      await page.goto(`https://www.flashscore.com/match/${id}/#/match-summary/match-statistics/0`, { waitUntil: 'load', timeout: 25000 });

      // Dispara fetch de estatísticas
      try {
        const abaStats = await page.getByRole('link', { name: /Estatísticas|Stats/i }).first();
        if (abaStats) await abaStats.click({ timeout: 2000 });
      } catch(e) {}

      // Nomes dos times + gols FT via DOM
      try {
        const dados = await page.evaluate(() => {
          let h='', a='', hG=0, aG=0;
          const hEl = document.querySelector('.duelParticipant__home .participant__participantName');
          const aEl = document.querySelector('.duelParticipant__away .participant__participantName');
          if (hEl) h = hEl.textContent.trim();
          if (aEl) a = aEl.textContent.trim();
          const pHome = document.querySelector('.duelParticipant__home');
          if (pHome) {
            const score = pHome.closest('.duelParticipant')?.querySelector('.detailScore__wrapper');
            if (score) {
              const spans = score.querySelectorAll('span');
              if (spans.length >= 3) {
                hG = parseInt(spans[0].textContent) || 0;
                aG = parseInt(spans[2].textContent) || 0;
              }
            }
          }
          return { mandante: h, visitante: a, gol_m: hG, gol_v: aG };
        });
        res.mandante = dados.mandante;
        res.visitante = dados.visitante;
        res.gols.ft.m = dados.gol_m;
        res.gols.ft.v = dados.gol_v;
      } catch(e) {}

      // Aguarda pacote FT
      let waitFT = 0;
      while (!foundFT && waitFT < 10) { await delay(500); waitFT++; }

      // Click aba HT (1st Half / 1º Tempo)
      try {
        const abaHT = await page.getByRole('link', { name: /1st Half|1º Tempo/i }).first();
        if (abaHT) await abaHT.click({ timeout: 2000 });
      } catch(e) {}

      // Aguarda pacote HT
      let waitHT = 0;
      while (!foundHT && waitHT < 10) { await delay(500); waitHT++; }

      await delay(1000);

      // Rota híbrida: DOM scrape pra cantos HT se rede falhou
      try {
        const htCantos = await page.evaluate(() => {
          let hm = 0, hv = 0;
          const divs = document.querySelectorAll('div');
          for (const c of divs) {
            const txt = c.textContent.trim().toLowerCase();
            if ((txt.includes('corner') || txt.includes('escanteio') || txt.includes('cantos')) && c.parentElement) {
              const parentText = c.parentElement.innerText;
              if (parentText) {
                const lines = parentText.split('\n').map(x => x.trim()).filter(x => x);
                if (lines.length >= 3 && lines[1].toLowerCase().includes('corner')) {
                  hm = parseInt(lines[0]) || 0;
                  hv = parseInt(lines[2]) || 0;
                  break;
                }
              }
            }
          }
          return { m: hm, v: hv };
        });
        if (!foundHT && (htCantos.m > 0 || htCantos.v > 0)) {
          res.cantos.ht.m = htCantos.m;
          res.cantos.ht.v = htCantos.v;
          foundHT = true;
        }
      } catch(e) {}

    } catch(err) {
      console.log(`⚠️ Erro no ID ${id}: ${err.message}`);
    } finally {
      page.off('response', interceptor);
    }

    const okFT = foundFT ? '✅' : '❌';
    const okHT = foundHT ? '✅' : '❌';
    console.log(`   ${okFT}FT ${okHT}HT [${res.mandante} x ${res.visitante}] | FT ${res.cantos.ft.m}-${res.cantos.ft.v} | HT ${res.cantos.ht.m}-${res.cantos.ht.v}`);

    resultados.push(res);

    // Anti-bot rate limit
    const delayMs = await delayRandom(1500, 3800);
    process.stdout.write(`   ⏱️  ${delayMs}ms\n`);
  }

  fs.writeFileSync(ARQ_OUT, JSON.stringify(resultados, null, 2), 'utf-8');
  await browser.close();

  // Estatísticas finais de qualidade
  const totalFT = resultados.filter(r => r.cantos.ft.m + r.cantos.ft.v > 0).length;
  const totalHT = resultados.filter(r => r.cantos.ht.m + r.cantos.ht.v > 0).length;
  const totalNomes = resultados.filter(r => r.mandante && r.visitante).length;
  console.log(`\n✅ Coleta concluída — ${ARQ_OUT}`);
  console.log(`   FT preenchido: ${totalFT}/${resultados.length}`);
  console.log(`   HT preenchido: ${totalHT}/${resultados.length}`);
  console.log(`   Nomes OK:      ${totalNomes}/${resultados.length}`);
})();
