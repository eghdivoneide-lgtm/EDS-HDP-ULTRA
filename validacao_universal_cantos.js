#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
//  VALIDAÇÃO UNIVERSAL — Perfil G×S (Gerador × Sofredor) em 13 Ligas
//  Testa se o padrão é universal: corner differential → perfil → matchup
// ═══════════════════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');
const BASE = '/home/user/EDS-HDP-ULTRA/data';

function loadLeague(file) {
  const src = fs.readFileSync(path.join(BASE, file), 'utf8');
  const m = src.match(/window\.\w+\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) throw new Error('Formato inesperado: ' + file);
  return JSON.parse(m[1]);
}

const LIGAS = [
  { id: 'BR',    nome: 'Brasileirão Série A',       file: 'brasileirao2026.js',    temForm: true  },
  { id: 'BR_B',  nome: 'Brasileirão Série B',       file: 'brasileiraoB2026.js',   temForm: true  },
  { id: 'ARG',   nome: 'Argentina Liga Prof.',      file: 'argentina2026.js',      temForm: true  },
  { id: 'ARG_B', nome: 'Argentina Primera B',       file: 'argentina_b2026.js',    temForm: true  },
  { id: 'BUN',   nome: 'Bundesliga',                file: 'bundesliga2026.js',     temForm: true  },
  { id: 'ECU',   nome: 'Ecuador LigaPro',           file: 'equador2026.js',        temForm: true  },
  { id: 'MLS',   nome: 'MLS',                       file: 'mls2026.js',            temForm: true  },
  { id: 'USL',   nome: 'USL Championship',          file: 'usl2026.js',            temForm: true  },
  { id: 'CHI',   nome: 'Chile Primera División',    file: 'chile2026.js',          temForm: true  },
  { id: 'ALM',   nome: 'A-League (Austrália)',      file: 'aleague2026.js',        temForm: false },
  { id: 'MET',   nome: 'B Metropolitana (ARG)',     file: 'metropolitana2026.js',  temForm: false },
  { id: 'CHN2',  nome: 'China League Two',          file: 'chinatwo2026.js',       temForm: false },
  { id: 'J2',    nome: 'J2 League (Japão)',         file: 'j2league2026.js',       temForm: false },
];

// ── USL Thresholds ────────────────────────────────────────────────────────
// G_STRONG ≥2.0 | G 0.75–2.0 | N -0.75–0.75 | S -2.0–-0.75 | S_STRONG <-2.0

function classifyUSL(diff) {
  if (diff >= 2.0)   return 'G_STRONG';
  if (diff >= 0.75)  return 'G';
  if (diff >= -0.75) return 'N';
  if (diff >= -2.0)  return 'S';
  return 'S_STRONG';
}

function isGerador(p)  { return p === 'G_STRONG' || p === 'G'; }
function isSofredor(p) { return p === 'S_STRONG' || p === 'S'; }

// ── Extração ──────────────────────────────────────────────────────────────

function extractJogos(data) {
  const raw = data.jogos || data.partidas || [];
  return raw.filter(j => {
    const cm = j.cantos?.ft?.m;
    const cv = j.cantos?.ft?.v;
    return cm != null && cv != null && !isNaN(+cm) && !isNaN(+cv);
  }).map(j => ({
    mandante:  j.mandante,
    visitante: j.visitante,
    cm: +j.cantos.ft.m,
    cv: +j.cantos.ft.v,
    oddM:  j.mercado?.oddM  ? +j.mercado.oddM  : null,
    oddE:  j.mercado?.oddEmpate ? +j.mercado.oddEmpate : null,
    oddV:  j.mercado?.oddV  ? +j.mercado.oddV  : null,
    formM: j.formacao?.m || null,
    formV: j.formacao?.v || null,
  }));
}

// ── Perfis por Time ───────────────────────────────────────────────────────

function buildProfiles(jogos) {
  const s = {};
  for (const j of jogos) {
    for (const [t, pro, sof] of [[j.mandante,j.cm,j.cv],[j.visitante,j.cv,j.cm]]) {
      if (!t) continue;
      if (!s[t]) s[t] = { pro:0, sof:0, n:0 };
      s[t].pro += pro; s[t].sof += sof; s[t].n++;
    }
  }
  const out = {};
  for (const [t, v] of Object.entries(s)) {
    if (v.n < 3) continue;
    const diff = (v.pro - v.sof) / v.n;
    out[t] = { diff: +diff.toFixed(2), perfil: classifyUSL(diff), n: v.n,
               avgPro: +(v.pro/v.n).toFixed(2), avgSof: +(v.sof/v.n).toFixed(2) };
  }
  return out;
}

// ── Matchup Analysis ──────────────────────────────────────────────────────

function analyze(jogos, profiles) {
  // G×S aggregate
  let gxs = { n:0, diffSum:0, mandWin:0 };
  let sxg = { n:0, diffSum:0, visWin:0 };
  let gxg = { n:0, diffSum:0 };
  let sxs = { n:0, diffSum:0 };

  // Backtest: apostar no lado com maior perfil
  const bt = {};
  for (const sig of ['FORTE','MEDIO','FRACO']) bt[sig] = { n:0, w:0, l:0, e:0 };

  for (const j of jogos) {
    const pm = profiles[j.mandante];
    const pv = profiles[j.visitante];
    if (!pm || !pv) continue;

    const diff = j.cm - j.cv;
    const mandWon = diff > 0;
    const visWon  = diff < 0;
    const empate  = diff === 0;

    // Matchup categories
    if (isGerador(pm.perfil) && isSofredor(pv.perfil)) {
      gxs.n++; gxs.diffSum += diff;
      if (mandWon) gxs.mandWin++;
    } else if (isSofredor(pm.perfil) && isGerador(pv.perfil)) {
      sxg.n++; sxg.diffSum += diff;
      if (visWon) sxg.visWin++;
    } else if (isGerador(pm.perfil) && isGerador(pv.perfil)) {
      gxg.n++; gxg.diffSum += diff;
    } else if (isSofredor(pm.perfil) && isSofredor(pv.perfil)) {
      sxs.n++; sxs.diffSum += diff;
    }

    // Backtest signal
    const scoreDiff = pm.diff - pv.diff;
    let sig, ladoAposta;
    if (Math.abs(scoreDiff) >= 2.0) {
      sig = 'FORTE';
      ladoAposta = scoreDiff > 0 ? 'M' : 'V';
    } else if (Math.abs(scoreDiff) >= 0.75) {
      sig = 'MEDIO';
      ladoAposta = scoreDiff > 0 ? 'M' : 'V';
    } else {
      sig = 'FRACO';
      ladoAposta = 'M';
    }

    const vencedor = mandWon ? 'M' : visWon ? 'V' : 'E';
    const b = bt[sig];
    b.n++;
    if (vencedor === ladoAposta) b.w++;
    else if (vencedor === 'E') b.e++;
    else b.l++;
  }

  return { gxs, sxg, gxg, sxs, bt };
}

// ── Formação Analysis ─────────────────────────────────────────────────────

function analyzeFormacoes(jogos) {
  const s = {};
  for (const j of jogos) {
    for (const [form, pro, sof] of [[j.formM,j.cm,j.cv],[j.formV,j.cv,j.cm]]) {
      if (!form) continue;
      if (!s[form]) s[form] = { pro:0, sof:0, n:0, wins:0 };
      s[form].pro += pro; s[form].sof += sof; s[form].n++;
      if (pro > sof) s[form].wins++;
    }
  }
  return Object.entries(s)
    .filter(([,v]) => v.n >= 8)
    .map(([form, v]) => ({
      form, n: v.n,
      avgPro: +(v.pro/v.n).toFixed(2),
      avgSof: +(v.sof/v.n).toFixed(2),
      diff:   +((v.pro-v.sof)/v.n).toFixed(2),
      winPct: +(v.wins/v.n*100).toFixed(1),
    }))
    .sort((a,b) => b.diff - a.diff);
}

// ── Cálculo ROI ───────────────────────────────────────────────────────────

function roi(b, odd=1.85) {
  if (!b || b.n === 0) return null;
  const profit = b.w*(odd-1)*100 - (b.l+b.e)*100;
  return { n:b.n, wr:+(b.w/b.n*100).toFixed(1), roi:+(profit/(b.n*100)*100).toFixed(1) };
}

function avg(arr, key) {
  const vs = arr.map(a=>a[key]).filter(v=>v!=null);
  return vs.length ? +(vs.reduce((s,v)=>s+v,0)/vs.length).toFixed(2) : null;
}

// ── Distribuição ──────────────────────────────────────────────────────────

function dist(profiles) {
  const d = { G_STRONG:0, G:0, N:0, S:0, S_STRONG:0 };
  for (const p of Object.values(profiles)) d[p.perfil]++;
  return d;
}

function topTimes(profiles, n, asc=false) {
  return Object.entries(profiles)
    .sort((a,b) => asc ? a[1].diff-b[1].diff : b[1].diff-a[1].diff)
    .slice(0,n)
    .map(([t,p]) => `${t}(${p.diff>=0?'+':''}${p.diff})`).join(' | ');
}

// ══════════════════════════════════════════════════════════════════════════
const SEP  = '═'.repeat(92);
const LINE = '─'.repeat(92);

console.log(SEP);
console.log('  VALIDAÇÃO UNIVERSAL — PADRÃO G×S (GERADOR × SOFREDOR) EM 13 LIGAS');
console.log('  Base: diferencial médio de cantos → perfil → matchup → backtest');
console.log(SEP);

const results = [];

for (const liga of LIGAS) {
  let data, jogos, profiles, an;
  try {
    data = loadLeague(liga.file);
    jogos = extractJogos(data);
    if (jogos.length < 15) { console.log(`\n⚠  ${liga.id}: apenas ${jogos.length} jogos — pulando`); continue; }
    profiles = buildProfiles(jogos);
    const nT = Object.keys(profiles).length;
    if (nT < 4) { console.log(`\n⚠  ${liga.id}: apenas ${nT} times com perfil — pulando`); continue; }
    an = analyze(jogos, profiles);
  } catch(e) {
    console.log(`\n⚠  ${liga.id}: ERRO — ${e.message}`);
    continue;
  }

  const avgTotal = jogos.reduce((s,j) => s+j.cm+j.cv, 0) / jogos.length;
  const d = dist(profiles);
  const gxsHit = an.gxs.n > 0 ? +(an.gxs.mandWin/an.gxs.n*100).toFixed(1) : 0;
  const gxsDiff = an.gxs.n > 0 ? +(an.gxs.diffSum/an.gxs.n).toFixed(2) : 0;
  const sxgDiff = an.sxg.n > 0 ? +(an.sxg.diffSum/an.sxg.n).toFixed(2) : 0;
  const forteR = roi(an.bt.FORTE);
  const medioR = roi(an.bt.MEDIO);

  results.push({ liga, jogos: jogos.length, avgTotal, d, gxsHit, gxsDiff, sxgDiff, forteR, medioR, profiles, an, jogosRaw: jogos });

  console.log(`\n${'▌ '+liga.nome+' ['+liga.id+']'} — ${jogos.length} jogos | ${Object.keys(profiles).length} times | avg total: ${avgTotal.toFixed(2)} cantos`);
  console.log(`  Perfis: G_STRONG=${d.G_STRONG} | G=${d.G} | N=${d.N} | S=${d.S} | S_STRONG=${d.S_STRONG}`);
  console.log(`  TOP GERADORES : ${topTimes(profiles,5)}`);
  console.log(`  TOP SOFREDORES: ${topTimes(profiles,4,true)}`);

  if (an.gxs.n > 0) {
    const icon = gxsHit >= 60 ? '🟢' : gxsHit >= 50 ? '🟡' : '🔴';
    console.log(`  G×S (n=${an.gxs.n}): avg diff=+${gxsDiff} | Mand Hit=${gxsHit}% ${icon}`);
  }
  if (an.sxg.n > 0) {
    const icon = sxgDiff < 0 ? '🟢' : '🔴';
    console.log(`  S×G (n=${an.sxg.n}): avg diff=${sxgDiff} (negativo = visitante gerador domina) ${icon}`);
  }
  if (forteR) {
    const icon = forteR.roi > 0 ? '🟢' : '🔴';
    console.log(`  Backtest FORTE: ${forteR.n} apostas | WR=${forteR.wr}% | ROI=${forteR.roi>0?'+':''}${forteR.roi}% ${icon}`);
  }
  if (medioR) {
    const icon = medioR.roi > 0 ? '🟢' : '⚠';
    console.log(`  Backtest MÉDIO: ${medioR.n} apostas | WR=${medioR.wr}% | ROI=${medioR.roi>0?'+':''}${medioR.roi}% ${icon}`);
  }
}

// ── TABELA COMPARATIVA ────────────────────────────────────────────────────

console.log(`\n\n${SEP}`);
console.log('  TABELA COMPARATIVA — PADRÃO G×S POR LIGA');
console.log(SEP);
console.log('Liga       Jogos  AvgFT   G×S n  G×S Diff  G×S Hit%  S×G Diff  Forte WR%  Forte ROI%  Status');
console.log(LINE);

let totJ=0, totGxsN=0, totGxsDiffSum=0, totGxsHitSum=0, totFN=0, totFW=0;
let ligasROIpos=0, ligasGxsOK=0;

for (const r of results) {
  const gd = r.gxsDiff >= 0 ? `+${r.gxsDiff}` : `${r.gxsDiff}`;
  const sd = r.sxgDiff;
  const fw = r.forteR ? `${r.forteR.wr}%` : '—';
  const fr = r.forteR ? (r.forteR.roi>=0?`+${r.forteR.roi}%`:`${r.forteR.roi}%`) : '—';
  const st = r.forteR ? (r.forteR.roi>0?'🟢 OK':'🔴 NEG') : '—';
  const gxsHitStr = r.an.gxs.n > 0 ? `${r.gxsHit}%` : '—';

  console.log(
    `${r.liga.id.padEnd(10)} ${String(r.jogos).padEnd(6)} ${r.avgTotal.toFixed(1).padEnd(7)} ` +
    `${String(r.an.gxs.n).padEnd(6)} ${gd.padEnd(9)} ${gxsHitStr.padEnd(9)} ` +
    `${String(sd).padEnd(9)} ${fw.padEnd(10)} ${fr.padEnd(11)} ${st}`
  );

  totJ += r.jogos;
  if (r.an.gxs.n>0) { totGxsN+=r.an.gxs.n; totGxsDiffSum+=r.an.gxs.n*r.gxsDiff; totGxsHitSum+=r.an.gxs.n*r.gxsHit; }
  if (r.forteR) { totFN+=r.forteR.n; totFW+=Math.round(r.forteR.n*r.forteR.wr/100); if(r.forteR.roi>0) ligasROIpos++; }
  if (r.an.gxs.n>0 && r.gxsHit>=55) ligasGxsOK++;
}

console.log(LINE);
const gGxsDiff = totGxsN>0 ? +(totGxsDiffSum/totGxsN).toFixed(2) : 0;
const gGxsHit  = totGxsN>0 ? +(totGxsHitSum/totGxsN).toFixed(1) : 0;
const gFWR     = totFN>0    ? +(totFW/totFN*100).toFixed(1) : 0;
console.log(`${'GLOBAL'.padEnd(10)} ${String(totJ).padEnd(6)} —       ${String(totGxsN).padEnd(6)} +${String(gGxsDiff).padEnd(8)} ${gGxsHit}%      —         ${gFWR}%`);

// ── ANÁLISE DE FORMAÇÕES CROSS-LIGA ───────────────────────────────────────

console.log(`\n\n${SEP}`);
console.log('  CROSS-LIGA: FORMAÇÃO × CANTOS (ligas com dado de formação)');
console.log(SEP);

// Aggregate all games with formation data
const formGlobal = {};
let totalFormJogos = 0;
const ligaFormResults = {};

for (const r of results) {
  if (!r.liga.temForm) continue;
  const comForm = r.jogosRaw.filter(j => j.formM && j.formV);
  if (comForm.length < 5) continue;
  totalFormJogos += comForm.length;
  const rankForm = analyzeFormacoes(comForm);
  ligaFormResults[r.liga.id] = { nome: r.liga.nome, rankForm, n: comForm.length };

  // Accumulate global
  for (const j of comForm) {
    for (const [form, pro, sof] of [[j.formM,j.cm,j.cv],[j.formV,j.cv,j.cm]]) {
      if (!form) continue;
      if (!formGlobal[form]) formGlobal[form] = { pro:0, sof:0, n:0, wins:0, ligas: new Set() };
      formGlobal[form].pro += pro;
      formGlobal[form].sof += sof;
      formGlobal[form].n++;
      if (pro>sof) formGlobal[form].wins++;
      formGlobal[form].ligas.add(r.liga.id);
    }
  }
}

// Print per-league formation ranking
for (const [id, v] of Object.entries(ligaFormResults)) {
  console.log(`\n▌ ${v.nome} [${id}] — ${v.n} jogos com formação`);
  console.log('  Form        N    AvgPro  AvgSof  Diff    Win%   Classe');
  console.log('  ' + '─'.repeat(65));
  for (const r of v.rankForm.slice(0,8)) {
    const cl = r.diff >= 0.5 ? '✅ GERADORA' : r.diff <= -0.5 ? '🔴 SOFREDORA' : '➖ NEUTRA';
    console.log(
      `  ${r.form.padEnd(12)} ${String(r.n).padEnd(5)} ${String(r.avgPro).padEnd(8)} ${String(r.avgSof).padEnd(8)} ` +
      `${(r.diff>=0?'+':'')+r.diff.toFixed(2).padEnd(7)} ${r.winPct}%  ${cl}`
    );
  }
}

// Global formation ranking
const globalFormRank = Object.entries(formGlobal)
  .filter(([,v]) => v.n >= 20)
  .map(([form, v]) => ({
    form, n: v.n,
    avgPro: +(v.pro/v.n).toFixed(2),
    avgSof: +(v.sof/v.n).toFixed(2),
    diff:   +((v.pro-v.sof)/v.n).toFixed(2),
    winPct: +(v.wins/v.n*100).toFixed(1),
    nLigas: v.ligas.size,
    ligas:  [...v.ligas].join(','),
  }))
  .sort((a,b) => b.diff - a.diff);

console.log(`\n\n${'─'.repeat(92)}`);
console.log(`  RANKING GLOBAL DE FORMAÇÕES — ${totalFormJogos} jogos com dados de formação (todas as ligas)`);
console.log(`${'─'.repeat(92)}`);
console.log('  Formação     N     Ligas  nL  AvgPro  AvgSof  Diff    Win%   Classe');
console.log('  ' + '─'.repeat(80));
for (const r of globalFormRank) {
  const cl = r.diff >= 0.5 ? '✅ GERADORA' : r.diff <= -0.5 ? '🔴 SOFREDORA' : '➖ NEUTRA';
  const listr = r.ligas.length > 30 ? r.ligas.slice(0,30)+'…' : r.ligas;
  console.log(
    `  ${r.form.padEnd(13)} ${String(r.n).padEnd(6)} ${listr.padEnd(30)} ${String(r.nLigas).padEnd(4)} ` +
    `${String(r.avgPro).padEnd(8)} ${String(r.avgSof).padEnd(8)} ${(r.diff>=0?'+':'')+r.diff.toFixed(2).padEnd(7)} ${r.winPct}%  ${cl}`
  );
}

// ── VERIFICAÇÃO: 4-2-3-1 vs 3-4-3 cross-liga ────────────────────────────

console.log(`\n\n${SEP}`);
console.log('  FOCO: 4-2-3-1 vs 3-4-3 (as formações mais discutidas) — confirmação cross-liga');
console.log(SEP);

for (const [id, v] of Object.entries(ligaFormResults)) {
  const f1 = v.rankForm.find(r => r.form === '4-2-3-1');
  const f2 = v.rankForm.find(r => r.form === '3-4-3');
  const f3 = v.rankForm.find(r => r.form === '4-3-3');
  const f4 = v.rankForm.find(r => r.form === '4-4-2');
  const f5 = v.rankForm.find(r => r.form === '3-4-2-1');
  const fmt = (f) => f ? `${f.diff>=0?'+':''}${f.diff}(n=${f.n})` : '—';
  console.log(`  ${id.padEnd(6)}: 4-2-3-1=${fmt(f1)} | 3-4-3=${fmt(f2)} | 4-3-3=${fmt(f3)} | 4-4-2=${fmt(f4)} | 3-4-2-1=${fmt(f5)}`);
}

// ── RESUMO EXECUTIVO ──────────────────────────────────────────────────────

const nLigasComBacktest = results.filter(r => r.forteR).length;
const nLigasComGxs = results.filter(r => r.an.gxs.n > 0).length;

console.log(`\n\n${SEP}`);
console.log('  VEREDICTO — O PADRÃO É UNIVERSAL?');
console.log(SEP);
console.log(`\n  Total de jogos analisados : ${totJ.toLocaleString()}`);
console.log(`  Ligas na amostra          : ${results.length}`);
console.log(`  Ligas com dado de formação: ${Object.keys(ligaFormResults).length}`);
console.log(`\n  BACKTEST FORTE (odd 1.85):`);
console.log(`    Ligas com ROI positivo  : ${ligasROIpos} / ${nLigasComBacktest} (${(ligasROIpos/nLigasComBacktest*100).toFixed(0)}%)`);
console.log(`    WR% global FORTE        : ${gFWR}%`);
console.log(`\n  G×S MATCHUP:`);
console.log(`    Ligas com Hit Rate ≥55% : ${ligasGxsOK} / ${nLigasComGxs} (${(ligasGxsOK/nLigasComGxs*100).toFixed(0)}%)`);
console.log(`    Diff médio global G×S   : +${gGxsDiff} cantos`);
console.log(`    Hit Rate global G×S     : ${gGxsHit}%`);
console.log(`\n  FORMAÇÃO:`);
if (formGlobal['4-2-3-1'] && formGlobal['3-4-3']) {
  const f1 = formGlobal['4-2-3-1'];
  const f2 = formGlobal['3-4-3'];
  const d1 = +((f1.pro-f1.sof)/f1.n).toFixed(2);
  const d2 = +((f2.pro-f2.sof)/f2.n).toFixed(2);
  console.log(`    4-2-3-1: diff=${d1>=0?'+':''}${d1} em ${f1.ligas.size} ligas (n=${f1.n})`);
  console.log(`    3-4-3  : diff=${d2>=0?'+':''}${d2} em ${f2.ligas.size} ligas (n=${f2.n})`);
}

const threshold_roi = ligasROIpos/nLigasComBacktest >= 0.60;
const threshold_gxs = ligasGxsOK/nLigasComGxs >= 0.60;
const universal = threshold_roi && threshold_gxs;

console.log(`\n  ─────────────────────────────────────────────`);
console.log(`  BACKTEST ROI+ em ≥60% das ligas : ${threshold_roi ? '✅ SIM' : '❌ NÃO'}`);
console.log(`  G×S Hit Rate ≥55% em ≥60% ligas : ${threshold_gxs ? '✅ SIM' : '❌ NÃO'}`);
console.log(`\n  VEREDICTO: ${universal ? '🟢 PADRÃO CONFIRMADO COMO UNIVERSAL' : '🟡 PADRÃO PARCIALMENTE CONFIRMADO — investigar ligas negativas'}`);
console.log(SEP);
