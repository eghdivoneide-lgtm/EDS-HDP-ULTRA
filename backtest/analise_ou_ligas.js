'use strict';

const vm = require('vm');
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'data');

function loadJS(file) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(DATA, file), 'utf8'), ctx);
  return ctx.window[Object.keys(ctx.window)[0]];
}

const mem = loadJS('memoria_usl.js');

function getTeamData(team, sec) {
  const p = (mem[sec] || {}).perfis || {};
  const exact = p[team];
  if (exact) return exact;
  const key = Object.keys(p).find(k => k.toLowerCase() === (team || '').toLowerCase());
  return key ? p[key] : null;
}

function getProfile(team, sec) {
  const d = getTeamData(team, sec);
  return d ? (d.perfil_usl || 'N') : 'N';
}

function getDiff(team, sec) {
  const d = getTeamData(team, sec);
  return d ? (d.diff_cantos || 0) : 0;
}

function getGames(file) {
  const data = loadJS(file);
  if (Array.isArray(data)) return data;
  if (data.jogos) return Array.isArray(data.jogos) ? data.jogos : Object.values(data.jogos).flat();
  return Object.values(data).flat().filter(x => typeof x === 'object' && x.mandante);
}

function analyzeLeague(games, name, sec, ftThr, htThr) {
  const ftCut = ftThr + 1;
  const htCut = htThr + 1;

  const totals = { oFT: 0, uFT: 0, oHT: 0, uHT: 0 };
  const byProfile = {};
  const byDiff = { 'diffSum<-3': {n:0,o:0}, '-3a-1.5': {n:0,o:0}, '-1.5a0': {n:0,o:0}, '0a1.5': {n:0,o:0}, '1.5a3': {n:0,o:0}, 'diffSum>3': {n:0,o:0} };
  const byTeam = {};

  for (const g of games) {
    const c = g.cantos || g.corners;
    if (!c) continue;

    let ftH, ftV, htH, htV;
    if (c.ft) { ftH = c.ft.m; ftV = c.ft.v; }
    else if (c.mandante !== undefined) { ftH = c.mandante; ftV = c.visitante; }
    if (c.ht) { htH = c.ht.m; htV = c.ht.v; }

    if (ftH == null || ftV == null || isNaN(+ftH) || isNaN(+ftV)) continue;

    const ftTotal = +ftH + +ftV;
    const htTotal = (htH != null && htV != null && !isNaN(+htH) && !isNaN(+htV)) ? +htH + +htV : null;

    const mand = (g.mandante || g.home || '').trim();
    const vis  = (g.visitante || g.away || '').trim();

    const pH = getProfile(mand, sec);
    const pV = getProfile(vis, sec);
    const dH = getDiff(mand, sec);
    const dV = getDiff(vis, sec);
    const diffSum = dH + dV;

    const profKey = pH + 'x' + pV;
    if (!byProfile[profKey]) byProfile[profKey] = { n: 0, oFT: 0, oHT: 0 };
    byProfile[profKey].n++;

    const isOFT = ftTotal >= ftCut;
    const isOHT = htTotal !== null && htTotal >= htCut;

    if (isOFT) { totals.oFT++; byProfile[profKey].oFT++; } else totals.uFT++;
    if (htTotal !== null) {
      if (isOHT) { totals.oHT++; byProfile[profKey].oHT++; } else totals.uHT++;
    }

    // diffSum bucket
    let bk;
    if (diffSum < -3) bk = 'diffSum<-3';
    else if (diffSum < -1.5) bk = '-3a-1.5';
    else if (diffSum < 0) bk = '-1.5a0';
    else if (diffSum < 1.5) bk = '0a1.5';
    else if (diffSum < 3) bk = '1.5a3';
    else bk = 'diffSum>3';
    byDiff[bk].n++;
    if (isOFT) byDiff[bk].o++;

    // per-team (mandante)
    if (mand) {
      if (!byTeam[mand]) byTeam[mand] = { n: 0, oFT: 0 };
      byTeam[mand].n++;
      if (isOFT) byTeam[mand].oFT++;
    }
  }

  const nFT = totals.oFT + totals.uFT;
  const nHT = totals.oHT + totals.uHT;

  console.log('\n' + '='.repeat(65));
  console.log('LIGA: ' + name + '  |  FT O/' + ftThr + '  |  HT O/' + htThr + '  |  n=' + nFT);
  console.log('='.repeat(65));
  console.log('FT base: OVER ' + (totals.oFT/nFT*100).toFixed(1) + '%  UNDER ' + (totals.uFT/nFT*100).toFixed(1) + '%');
  console.log('HT base: OVER ' + (totals.oHT/nHT*100).toFixed(1) + '%  UNDER ' + (totals.uHT/nHT*100).toFixed(1) + '%  (n=' + nHT + ')');

  // Profile table sorted by OVER%
  console.log('\n--- PERFIS (min n=5) ---');
  const pSorted = Object.entries(byProfile)
    .filter(([,v]) => v.n >= 5)
    .sort((a, b) => b[1].oFT / b[1].n - a[1].oFT / a[1].n);

  for (const [k, v] of pSorted) {
    const pFT = (v.oFT / v.n * 100).toFixed(1);
    const pHT = (v.oHT / v.n * 100).toFixed(1);
    const baseRate = totals.oFT / nFT;
    const edge = (v.oFT / v.n - baseRate) * 100;
    const flag = edge >= 12 ? ' *** OVER+' : edge <= -12 ? ' *** UNDER+' : edge >= 7 ? ' * OVER' : edge <= -7 ? ' * UNDER' : '';
    console.log('  ' + k.padEnd(24) + 'n=' + String(v.n).padStart(3) + '  FT:' + String(pFT).padStart(6) + '%  HT:' + String(pHT).padStart(6) + '%  edge:' + (edge >= 0 ? '+' : '') + edge.toFixed(1) + '%' + flag);
  }

  // diffSum buckets
  console.log('\n--- DIFF_SUM BUCKETS (FT O/' + ftThr + ') ---');
  for (const [b, v] of Object.entries(byDiff)) {
    if (v.n < 5) continue;
    const pFT = (v.o / v.n * 100).toFixed(1);
    const edge = (v.o / v.n - totals.oFT / nFT) * 100;
    const flag = edge >= 10 ? ' *** OVER' : edge <= -10 ? ' *** UNDER' : '';
    console.log('  ' + b.padEnd(14) + 'n=' + String(v.n).padStart(3) + '  O/:' + String(pFT).padStart(6) + '%  edge:' + (edge >= 0 ? '+' : '') + edge.toFixed(1) + '%' + flag);
  }

  // Top teams OVER (mandante only, min 5 home games)
  const teamsSorted = Object.entries(byTeam).filter(([,v]) => v.n >= 5).sort((a,b) => b[1].oFT/b[1].n - a[1].oFT/a[1].n);
  if (teamsSorted.length) {
    console.log('\n--- TOP OVER MANDANTES (FT, min 5 jogos em casa) ---');
    for (const [t, v] of teamsSorted.slice(0, 8)) {
      const p = (v.oFT / v.n * 100).toFixed(0);
      const prof = getProfile(t, sec);
      if (v.oFT / v.n >= 0.60) console.log('  ' + t.padEnd(25) + 'n=' + v.n + '  ' + p + '%  [' + prof + ']');
    }
    console.log('\n--- TOP UNDER MANDANTES (FT, min 5 jogos em casa) ---');
    for (const [t, v] of [...teamsSorted].reverse().slice(0, 8)) {
      const p = (v.oFT / v.n * 100).toFixed(0);
      const prof = getProfile(t, sec);
      if (v.oFT / v.n <= 0.38) console.log('  ' + t.padEnd(25) + 'n=' + v.n + '  O/' + ftThr + '=' + p + '%  [' + prof + ']');
    }
  }
}

// ─── RUN ALL LEAGUES ─────────────────────────────────────────────────────────
const leagues = [
  ['usl2026.js',         'USL Championship',   'USL',  8.5, 3.5],
  ['mls2026.js',         'MLS',                'MLS',  9.5, 4.5],
  ['equador2026.js',     'Liga Pro Ecuador',   'ECU',  8.5, 3.5],
  ['chile2026.js',       'Liga Primera Chile', 'CHI',  9.5, 3.5],
  ['brasileirao2026.js', 'Brasileirão A',      'BR',   9.5, 3.5],
  ['brasileiraoB2026.js','Brasileirão B',      'BR_B', 9.5, 3.5],
  ['argentina2026.js',   'ARG Primera',        'ARG',  8.5, 3.5],
  ['argentina_b2026.js', 'ARG B Nacional',     'ARG_B',8.5, 3.5],
];

for (const [file, name, sec, ftThr, htThr] of leagues) {
  try {
    const games = getGames(file);
    analyzeLeague(games, name, sec, ftThr, htThr);
  } catch (e) {
    console.log('\n[ERRO] ' + name + ': ' + e.message);
  }
}
