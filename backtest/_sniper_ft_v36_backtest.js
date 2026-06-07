/**
 * BACKTEST CEGO — Sniper FT v3.5 (linha global=10) vs v3.6 (linha por liga)
 *
 * Para cada jogo em ordem cronológica:
 *   1. Calcula expTotalFT usando médias dos últimos 5+ jogos de cada time ANTES da partida
 *   2. Calcula Poisson P(cantos > LINHA) com:
 *      - LINHA_v35 = 10 (global antigo)
 *      - LINHA_v36 = round(mediaFT da liga) (novo)
 *   3. Aplica zona neutra [42%, 58%]:
 *      - P > 58% → OVER
 *      - P < 42% → UNDER
 *      - else  → NEUTRO
 *   4. Confere resultado real e marca hit/miss
 *
 * Critérios EDS:
 *   - R5: mínimo 5 jogos por time antes de contar sinal
 *   - R10: relatório completo com todas métricas
 */
const fs = require('fs');
const path = require('path');

const LIGA_DNA = {
  BR:     { mediaFT: 10.08, arq: 'ofensiva',    novaLinha: 10 },
  BR_B:   { mediaFT: 10.29, arq: 'ofensiva',    novaLinha: 10 },
  MLS:    { mediaFT: 10.30, arq: 'ofensiva',    novaLinha: 10 },
  BUN:    { mediaFT:  9.74, arq: 'equilibrada', novaLinha: 10 },
  USL:    { mediaFT:  9.15, arq: 'equilibrada', novaLinha:  9 }, // ★ mudou
  ARG:    { mediaFT:  8.56, arq: 'trucada',     novaLinha:  9 }, // ★ mudou
  ARG_B:  { mediaFT:  8.60, arq: 'trucada',     novaLinha:  9 }, // ★ mudou
  J1:     { mediaFT:  9.61, arq: 'equilibrada', novaLinha: 10 },
  J2_J3:  { mediaFT:  9.87, arq: 'ofensiva',    novaLinha: 10 },
  ALM:    { mediaFT: 10.28, arq: 'ofensiva',    novaLinha: 10 },
  CHI:    { mediaFT:  9.55, arq: 'equilibrada', novaLinha: 10 },
  ECU:    { mediaFT:  9.22, arq: 'equilibrada', novaLinha:  9 }, // ★ mudou
  CHN_SUP:{ mediaFT: 10.38, arq: 'ofensiva',    novaLinha: 10 },
  CHN_1:  { mediaFT:  9.29, arq: 'equilibrada', novaLinha:  9 }  // ★ mudou
};

const ARQUIVOS = {
  BR:'brasileirao2026.js', BR_B:'brasileiraoB2026.js', MLS:'mls2026.js',
  USL:'usl2026.js', ARG:'argentina2026.js', ARG_B:'argentina_b2026.js',
  BUN:'bundesliga2026.js', J1:'j1league2026.js', J2_J3:'j2j3league2026.js',
  CHI:'chile2026.js', ECU:'equador2026.js',
  CHN_SUP:'chinasuper2026.js', CHN_1:'chinaone2026.js'
};
const VAR_JS = {
  BR:'DADOS_BR', BR_B:'DADOS_BR_B', MLS:'DADOS_MLS', USL:'DADOS_USL',
  ARG:'DADOS_ARG', ARG_B:'DADOS_ARG_B', BUN:'DADOS_BUN',
  J1:'DADOS_J1', J2_J3:'DADOS_J2_J3',
  CHI:'DADOS_CHI', ECU:'DADOS_ECU', CHN_SUP:'DADOS_CHN_SUP', CHN_1:'DADOS_CHN_1'
};

const LINHA_ANTIGA = 10;
const ZONA_OVER  = 58;
const ZONA_UNDER = 42;
const MIN_AMOSTRA = 5; // R5 EDS

// ── Poisson PMF/CDF ──
function poisson(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}
function probOver(lambda, linha) {
  let pUnder = 0;
  for (let k = 0; k <= linha; k++) pUnder += poisson(k, lambda);
  return Math.max(0, Math.min(1, 1 - pUnder)) * 100;
}

// ── Parser de data (formato dd.mm.yyyy ou ISO) ──
function parseData(s) {
  if (!s) return 0;
  s = s.split(' ')[0];
  let m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime();
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(s).getTime();
  return 0;
}

function cantosFT(j) {
  if (!j.cantos?.ft) return null;
  const t = (j.cantos.ft.m || 0) + (j.cantos.ft.v || 0);
  return isNaN(t) ? null : t;
}
function cantosFTPorTime(j, time) {
  if (!j.cantos?.ft) return null;
  if (j.mandante === time)  return j.cantos.ft.m || 0;
  if (j.visitante === time) return j.cantos.ft.v || 0;
  return null;
}

function rodarBacktest(liga) {
  const banco = fs.readFileSync(path.join(__dirname, '..', 'data', ARQUIVOS[liga]), 'utf8').replace(/^\s*\/\/.*$/gm,'');
  const sb = { window:{} };
  new Function('window', banco)(sb.window);
  const jogos = (sb.window[VAR_JS[liga]].jogos || [])
    .filter(j => cantosFT(j) !== null && j.mandante && j.visitante && (j.data || j.data_partida))
    .map(j => ({ ...j, _ts: parseData(j.data || j.data_partida) }))
    .filter(j => j._ts > 0)
    .sort((a, b) => a._ts - b._ts);

  const dna = LIGA_DNA[liga];
  const linhaNova = dna.novaLinha;
  const mediaLigaFT = dna.mediaFT;
  const mudou = (linhaNova !== LINHA_ANTIGA);

  let sinalAntigo = { over:0, under:0, neutro:0, overHit:0, overMiss:0, underHit:0, underMiss:0 };
  let sinalNovo   = { over:0, under:0, neutro:0, overHit:0, overMiss:0, underHit:0, underMiss:0 };
  let amostraSuficiente = 0, amostraInsuficiente = 0;

  jogos.forEach((j, idx) => {
    const m = j.mandante, v = j.visitante;
    // Coleta jogos anteriores do mandante e visitante (cego — apenas ts anterior)
    const histM = jogos.slice(0, idx).filter(x => x.mandante === m || x.visitante === m);
    const histV = jogos.slice(0, idx).filter(x => x.mandante === v || x.visitante === v);

    if (histM.length < MIN_AMOSTRA || histV.length < MIN_AMOSTRA) {
      amostraInsuficiente++;
      return;
    }
    amostraSuficiente++;

    // Média de cantos pró de cada time, somada → projeção ingênua
    const avgM = histM.reduce((s, x) => s + (cantosFTPorTime(x, m) || 0), 0) / histM.length;
    const avgV = histV.reduce((s, x) => s + (cantosFTPorTime(x, v) || 0), 0) / histV.length;
    const expTotalFT = Math.max(0.5, avgM + avgV);

    // Resultado real
    const totReal = cantosFT(j);

    // ── Sinal v3.5 (linha antiga global = 10) ──
    const pAntiga = probOver(expTotalFT, LINHA_ANTIGA);
    let sinalA = pAntiga >= ZONA_OVER ? 'OVER' : (pAntiga <= ZONA_UNDER ? 'UNDER' : 'NEUTRO');
    if (sinalA === 'OVER')  { sinalAntigo.over++;  if (totReal >  LINHA_ANTIGA) sinalAntigo.overHit++;  else sinalAntigo.overMiss++; }
    if (sinalA === 'UNDER') { sinalAntigo.under++; if (totReal <= LINHA_ANTIGA) sinalAntigo.underHit++; else sinalAntigo.underMiss++; }
    if (sinalA === 'NEUTRO') sinalAntigo.neutro++;

    // ── Sinal v3.6 (linha nova por liga) ──
    const pNova = probOver(expTotalFT, linhaNova);
    let sinalN = pNova >= ZONA_OVER ? 'OVER' : (pNova <= ZONA_UNDER ? 'UNDER' : 'NEUTRO');
    if (sinalN === 'OVER')  { sinalNovo.over++;  if (totReal >  linhaNova) sinalNovo.overHit++;  else sinalNovo.overMiss++; }
    if (sinalN === 'UNDER') { sinalNovo.under++; if (totReal <= linhaNova) sinalNovo.underHit++; else sinalNovo.underMiss++; }
    if (sinalN === 'NEUTRO') sinalNovo.neutro++;
  });

  const wr = (a,b) => (a+b) > 0 ? ((a/(a+b))*100).toFixed(1) : '—';
  return {
    liga, mudou, linhaAntiga: LINHA_ANTIGA, linhaNova, mediaLigaFT,
    jogosTotal: jogos.length, amostraSuficiente, amostraInsuficiente,
    v35: {
      ...sinalAntigo,
      total: sinalAntigo.over + sinalAntigo.under,
      wrOver:  wr(sinalAntigo.overHit, sinalAntigo.overMiss),
      wrUnder: wr(sinalAntigo.underHit, sinalAntigo.underMiss),
      wrGeral: wr(sinalAntigo.overHit + sinalAntigo.underHit, sinalAntigo.overMiss + sinalAntigo.underMiss)
    },
    v36: {
      ...sinalNovo,
      total: sinalNovo.over + sinalNovo.under,
      wrOver:  wr(sinalNovo.overHit, sinalNovo.overMiss),
      wrUnder: wr(sinalNovo.underHit, sinalNovo.underMiss),
      wrGeral: wr(sinalNovo.overHit + sinalNovo.underHit, sinalNovo.overMiss + sinalNovo.underMiss)
    }
  };
}

// ── EXECUÇÃO ──
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  BACKTEST CEGO — Sniper FT v3.5 (linha=10) vs v3.6 (linha=round(mediaFT))');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log('  Critérios: amostra mínima 5 jogos por time (cego), zona neutra [42%,58%]');
console.log('  Métrica: Win Rate (WR%) = acertos / (acertos + erros)');
console.log('');

const ligasOrdem = ['ARG','ARG_B','USL','ECU','CHN_1','BR','BR_B','MLS','BUN','J1','J2_J3','ALM','CHI','CHN_SUP'];
const resumo = [];

console.log('  Liga    | LinAnt | LinNov | Sinais v3.5 | WR v3.5 | Sinais v3.6 | WR v3.6 | Mudou?');
console.log('  ' + '─'.repeat(95));

ligasOrdem.forEach(L => {
  try {
    const r = rodarBacktest(L);
    resumo.push(r);
    const flag = r.mudou ? '★ SIM' : '— não';
    console.log('  ' +
      L.padEnd(8) + ' |   ' + String(r.linhaAntiga).padStart(2) + '   |   ' + String(r.linhaNova).padStart(2) + '   |  ' +
      String(r.v35.total).padStart(4) + ' sinais  |  ' + r.v35.wrGeral.padStart(5) + '%  |  ' +
      String(r.v36.total).padStart(4) + ' sinais  |  ' + r.v36.wrGeral.padStart(5) + '%  | ' + flag);
  } catch(e) {
    console.log('  ' + L.padEnd(8) + ' | ERRO: ' + e.message);
  }
});

console.log('');
console.log('═══ DETALHE — 5 ligas que TIVERAM mudança (Sniper FT recalibrado) ═══');
console.log('');
const mudadas = resumo.filter(r => r.mudou);
mudadas.forEach(r => {
  console.log('▸ ' + r.liga + ' (mediaFT ' + r.mediaLigaFT + ')');
  console.log('    v3.5 (linha ' + r.linhaAntiga + '):  ' +
    r.v35.over + ' OVER (WR ' + r.v35.wrOver + '%) + ' +
    r.v35.under + ' UNDER (WR ' + r.v35.wrUnder + '%) → WR geral ' + r.v35.wrGeral + '%');
  console.log('    v3.6 (linha ' + r.linhaNova + ' ★): ' +
    r.v36.over + ' OVER (WR ' + r.v36.wrOver + '%) + ' +
    r.v36.under + ' UNDER (WR ' + r.v36.wrUnder + '%) → WR geral ' + r.v36.wrGeral + '%');
  const deltaSinais = r.v36.total - r.v35.total;
  const deltaWR = (parseFloat(r.v36.wrGeral) - parseFloat(r.v35.wrGeral)).toFixed(1);
  console.log('    Δ: ' + (deltaSinais>=0?'+':'') + deltaSinais + ' sinais | ' + (deltaWR>=0?'+':'') + deltaWR + 'pp WR');
  console.log('');
});

console.log('═══ AGREGADO DAS 5 MUDADAS ═══');
const agg = mudadas.reduce((a, r) => ({
  v35_total: a.v35_total + r.v35.total,
  v35_hit:   a.v35_hit + r.v35.overHit + r.v35.underHit,
  v35_miss:  a.v35_miss + r.v35.overMiss + r.v35.underMiss,
  v36_total: a.v36_total + r.v36.total,
  v36_hit:   a.v36_hit + r.v36.overHit + r.v36.underHit,
  v36_miss:  a.v36_miss + r.v36.overMiss + r.v36.underMiss
}), {v35_total:0,v35_hit:0,v35_miss:0,v36_total:0,v36_hit:0,v36_miss:0});
const wrA = agg.v35_total > 0 ? (agg.v35_hit/(agg.v35_hit+agg.v35_miss)*100).toFixed(1) : '—';
const wrN = agg.v36_total > 0 ? (agg.v36_hit/(agg.v36_hit+agg.v36_miss)*100).toFixed(1) : '—';
console.log('  v3.5: ' + agg.v35_total + ' sinais | ' + agg.v35_hit + ' hits / ' + agg.v35_miss + ' miss → WR ' + wrA + '%');
console.log('  v3.6: ' + agg.v36_total + ' sinais | ' + agg.v36_hit + ' hits / ' + agg.v36_miss + ' miss → WR ' + wrN + '%');
console.log('  Δ sinais: ' + (agg.v36_total - agg.v35_total) + '  |  Δ WR: ' + (parseFloat(wrN) - parseFloat(wrA)).toFixed(1) + 'pp');

const outJSON = path.join(__dirname, '_sniper_ft_v36_resultado.json');
fs.writeFileSync(outJSON, JSON.stringify({ data: new Date().toISOString(), resumo, agregado_mudadas: { ...agg, wrA, wrN } }, null, 2));
console.log('');
console.log('Salvo em: backtest/_sniper_ft_v36_resultado.json');
