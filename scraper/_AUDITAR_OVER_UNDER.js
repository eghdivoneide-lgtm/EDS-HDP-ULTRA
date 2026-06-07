// ═══════════════════════════════════════════════════════════════
// AUDITORIA OVER/UNDER — Sinais 26/04 vs Resultados Reais
// 5 análises: Sniper FT, Sniper HT, Qualidade quantitativa,
// Linhas alternativas, Combos OURO
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, '..', 'Auditoria Especialista em cantos', 'Auditoria copleta', 'auditoria_completa_2026-04-26.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));

const FILES = {
  BR: 'brasileirao2026.js', ARG: 'argentina2026.js', ARG_B: 'argentina_b2026.js',
  MLS: 'mls2026.js', USL: 'usl2026.js', BUN: 'bundesliga2026.js',
  ALM: 'aleague2026.js', J1: 'j1league2026.js', CHI: 'chile2026.js', ECU: 'equador2026.js'
};

// Carrega resultados reais (jogos com data 2026-04-26)
const resultadosPorLiga = {};
for (const [code, file] of Object.entries(FILES)) {
  try {
    const codeJs = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    const ctx = { window: {} };
    new Function('window', codeJs)(ctx.window);
    const d = ctx.window[Object.keys(ctx.window)[0]];
    resultadosPorLiga[code] = d.jogos.filter(j => j.data === '2026-04-26');
  } catch(e) { console.error('Erro ' + code, e.message); }
}

function _norm(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/['.\-]/g,'').replace(/\s+/g,' ').trim();
}
function matchJogo(m, v, jogos) {
  const nm = _norm(m), nv = _norm(v);
  return jogos.find(j => {
    const jm = _norm(j.mandante), jv = _norm(j.visitante);
    return (jm === nm || jm.includes(nm) || nm.includes(jm))
        && (jv === nv || jv.includes(nv) || nv.includes(jv));
  });
}

// Avalia veredito UNDER/OVER em uma linha
function avaliarLinha(veredito, totalReal, linha) {
  if (!veredito || veredito === 'NEUTRO') return null;
  if (totalReal === linha) return 'PUSH';
  if (veredito.startsWith('OVER')) return totalReal > linha ? 'GREEN' : 'RED';
  if (veredito.startsWith('UNDER')) return totalReal < linha ? 'GREEN' : 'RED';
  return null;
}

const _zero = () => ({ g: 0, r: 0, p: 0 });

// ── ROLLUPS ──
const sniperFT = { OVER: _zero(), UNDER: _zero(), NEUTRO: 0 };
const sniperHT = { OVER: _zero(), UNDER: _zero(), NEUTRO: 0 };
const sniperFTPorLiga = {};
const sniperHTPorLiga = {};
const errosFT = []; // { liga, exp, real, erro }
const errosHT = [];
const linhasAlternativas = {
  ft: { 8.5: _zero(), 9.5: _zero(), 10.5: _zero(), 11.5: _zero(), 12.5: _zero() },
  ht: { 3.5: _zero(), 4.5: _zero(), 5.5: _zero() }
};
const combos = {
  underFT_forte:  _zero(),  // exp_ft<=8 + sniper UNDER 10 + conf>=60
  overFT_forte:   _zero(),  // exp_ft>=11 + sniper OVER 10
  overFT_premium: _zero(),  // overFT_forte + reis ABSOLUTO
  underFT_premium:_zero(),  // exp_ft<=7 + sniper UNDER 10 + conf>=70
  underHT_forte:  _zero(),  // exp_ht<=3 + sniper UNDER 4
  overHT_forte:   _zero(),  // exp_ht>=5 + sniper OVER 4
  convergencia_under: _zero(), // sniper HT UNDER + sniper FT UNDER
  convergencia_over:  _zero()  // sniper HT OVER + sniper FT OVER
};

let totalJogos = 0, naoEncontrados = 0;

for (const [code, snap] of Object.entries(audit.ligas)) {
  if (!snap.teacher || snap.status !== 'ok') continue;
  if (!resultadosPorLiga[code]) continue;
  const jogosReais = resultadosPorLiga[code];

  if (!sniperFTPorLiga[code]) sniperFTPorLiga[code] = { OVER: _zero(), UNDER: _zero() };
  if (!sniperHTPorLiga[code]) sniperHTPorLiga[code] = { OVER: _zero(), UNDER: _zero() };

  snap.teacher.forEach(t => {
    if (!t.valido) return;
    const jogo = matchJogo(t.m, t.v, jogosReais);
    if (!jogo) { naoEncontrados++; return; }
    totalJogos++;

    const totalFT = jogo.cantos.ft.m + jogo.cantos.ft.v;
    const totalHT = jogo.cantos.ht.m + jogo.cantos.ht.v;

    // ANÁLISE 1 — Sniper FT
    const sftVer = t.sniper && t.sniper.ft;
    if (sftVer === 'NEUTRO') {
      sniperFT.NEUTRO++;
    } else {
      const r = avaliarLinha(sftVer, totalFT, 10);
      if (r) {
        const tipo = sftVer.startsWith('OVER') ? 'OVER' : 'UNDER';
        const k = r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p');
        sniperFT[tipo][k]++;
        sniperFTPorLiga[code][tipo][k]++;
      }
    }

    // ANÁLISE 2 — Sniper HT
    const shtVer = t.sniper && t.sniper.ht;
    if (shtVer === 'NEUTRO') {
      sniperHT.NEUTRO++;
    } else {
      const r = avaliarLinha(shtVer, totalHT, 4);
      if (r) {
        const tipo = shtVer.startsWith('OVER') ? 'OVER' : 'UNDER';
        const k = r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p');
        sniperHT[tipo][k]++;
        sniperHTPorLiga[code][tipo][k]++;
      }
    }

    // ANÁLISE 3 — Qualidade quantitativa
    if (t.exp_ft) {
      errosFT.push({ liga: code, exp: t.exp_ft, real: totalFT, erro: t.exp_ft - totalFT });
    }
    if (t.exp_ht) {
      errosHT.push({ liga: code, exp: t.exp_ht, real: totalHT, erro: t.exp_ht - totalHT });
    }

    // ANÁLISE 4 — Linhas alternativas (deduzidas pelo exp_ft)
    // Para cada linha, simulo: se exp_ft > linha, aposto OVER; se exp_ft < linha, aposto UNDER
    [8.5, 9.5, 10.5, 11.5, 12.5].forEach(linha => {
      if (Math.abs(t.exp_ft - linha) < 0.5) return; // muito próximo, NEUTRO
      const lado = t.exp_ft > linha ? 'OVER' : 'UNDER';
      const r = avaliarLinha(lado + ' ' + linha, totalFT, linha);
      if (r) {
        const k = r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p');
        linhasAlternativas.ft[linha][k]++;
      }
    });
    [3.5, 4.5, 5.5].forEach(linha => {
      if (Math.abs(t.exp_ht - linha) < 0.3) return;
      const lado = t.exp_ht > linha ? 'OVER' : 'UNDER';
      const r = avaliarLinha(lado + ' ' + linha, totalHT, linha);
      if (r) {
        const k = r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p');
        linhasAlternativas.ht[linha][k]++;
      }
    });

    // ANÁLISE 5 — Combos OURO
    const reisAbs = t.reis && t.reis.faixa === 'ABSOLUTO';

    // Combo A — UNDER FT forte
    if (t.exp_ft <= 8 && sftVer === 'UNDER 10' && t.conf_ft >= 60) {
      const r = avaliarLinha('UNDER', totalFT, 10);
      if (r) combos.underFT_forte[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
    // Combo A+ — UNDER FT premium
    if (t.exp_ft <= 7 && sftVer === 'UNDER 10' && t.conf_ft >= 70) {
      const r = avaliarLinha('UNDER', totalFT, 10);
      if (r) combos.underFT_premium[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
    // Combo B — OVER FT forte
    if (t.exp_ft >= 11 && sftVer === 'OVER 10') {
      const r = avaliarLinha('OVER', totalFT, 10);
      if (r) combos.overFT_forte[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
    // Combo B+ — OVER FT premium (com Reis ABSOLUTO)
    if (t.exp_ft >= 11 && sftVer === 'OVER 10' && reisAbs) {
      const r = avaliarLinha('OVER', totalFT, 10);
      if (r) combos.overFT_premium[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
    // Combo C — UNDER HT forte
    if (t.exp_ht <= 3 && shtVer === 'UNDER 4') {
      const r = avaliarLinha('UNDER', totalHT, 4);
      if (r) combos.underHT_forte[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
    // Combo D — OVER HT forte
    if (t.exp_ht >= 5 && shtVer === 'OVER 4') {
      const r = avaliarLinha('OVER', totalHT, 4);
      if (r) combos.overHT_forte[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
    // Combo E — Convergência sniper HT+FT mesmo lado
    if (sftVer === 'UNDER 10' && shtVer === 'UNDER 4') {
      const r = avaliarLinha('UNDER', totalFT, 10);
      if (r) combos.convergencia_under[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
    if (sftVer === 'OVER 10' && shtVer === 'OVER 4') {
      const r = avaliarLinha('OVER', totalFT, 10);
      if (r) combos.convergencia_over[r === 'GREEN' ? 'g' : (r === 'RED' ? 'r' : 'p')]++;
    }
  });
}

// ── RELATÓRIO ──
const hr = (m) => {
  const tot = m.g + m.r + m.p;
  if (tot === 0) return '—';
  const den = tot - m.p;
  const taxa = den > 0 ? ((100 * m.g / den).toFixed(1) + '%') : 'PUSH';
  return taxa + ' (' + m.g + 'G ' + m.r + 'R ' + m.p + 'P · n=' + tot + ')';
};

console.log('═══════════════════════════════════════════════════════════');
console.log('AUDITORIA OVER/UNDER — Projeções 26/04 vs Reais (n=' + totalJogos + ')');
console.log('═══════════════════════════════════════════════════════════');
console.log();

// ANÁLISE 1
console.log('🎯 ANÁLISE 1 — SNIPER FT (linha 10)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  OVER 10:   ' + hr(sniperFT.OVER));
console.log('  UNDER 10:  ' + hr(sniperFT.UNDER));
console.log('  NEUTRO:    ' + sniperFT.NEUTRO + ' jogos (motor sem opinião)');
console.log();

// ANÁLISE 2
console.log('🎯 ANÁLISE 2 — SNIPER HT (linha 4)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  OVER 4:    ' + hr(sniperHT.OVER));
console.log('  UNDER 4:   ' + hr(sniperHT.UNDER));
console.log('  NEUTRO:    ' + sniperHT.NEUTRO + ' jogos');
console.log();

// ANÁLISE 3 — Qualidade quantitativa
console.log('📐 ANÁLISE 3 — QUALIDADE DA PROJEÇÃO QUANTITATIVA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
function calcStats(arr) {
  const n = arr.length;
  if (!n) return null;
  const errosAbs = arr.map(x => Math.abs(x.erro));
  const erroMedio = errosAbs.reduce((a,b)=>a+b,0) / n;
  const viesMedio = arr.reduce((s,x)=>s+x.erro,0) / n; // sinalizado
  // R² = 1 - (SS_res / SS_tot)
  const realMedia = arr.reduce((s,x)=>s+x.real,0) / n;
  const ssTot = arr.reduce((s,x) => s + Math.pow(x.real - realMedia, 2), 0);
  const ssRes = arr.reduce((s,x) => s + Math.pow(x.real - x.exp, 2), 0);
  const r2 = 1 - (ssRes / ssTot);
  return { n, erroMedio, viesMedio, r2 };
}
const sFT = calcStats(errosFT);
const sHT = calcStats(errosHT);
console.log('  FT: erro médio ±' + sFT.erroMedio.toFixed(2) + ' cantos · viés ' + (sFT.viesMedio>=0?'+':'') + sFT.viesMedio.toFixed(2) + ' · R² = ' + sFT.r2.toFixed(3));
console.log('  HT: erro médio ±' + sHT.erroMedio.toFixed(2) + ' cantos · viés ' + (sHT.viesMedio>=0?'+':'') + sHT.viesMedio.toFixed(2) + ' · R² = ' + sHT.r2.toFixed(3));
console.log();
console.log('  💡 Interpretação:');
console.log('     R² > 0.7 = motor afiado · 0.4-0.7 = razoável · <0.4 = ruim');
console.log('     Viés positivo = motor projeta acima do real (subestima realidade)');
console.log('     Viés negativo = motor projeta abaixo do real (subestima jogos viajados)');
console.log();

// ANÁLISE 4
console.log('📊 ANÁLISE 4 — LINHAS ALTERNATIVAS HIPOTÉTICAS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Hipótese: aposto OVER se exp_ft > linha, UNDER se exp_ft < linha');
console.log('FT:');
Object.entries(linhasAlternativas.ft).forEach(([linha, m]) => {
  console.log('  Linha ' + linha + ': ' + hr(m));
});
console.log('HT:');
Object.entries(linhasAlternativas.ht).forEach(([linha, m]) => {
  console.log('  Linha ' + linha + ': ' + hr(m));
});
console.log();

// ANÁLISE 5 — Combos
console.log('🥇 ANÁLISE 5 — COMBOS OURO OVER/UNDER');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Combo A — UNDER FT forte (exp_ft≤8 + sniper UNDER + conf≥60%)');
console.log('  ' + hr(combos.underFT_forte));
console.log();
console.log('Combo A+ — UNDER FT premium (exp_ft≤7 + sniper UNDER + conf≥70%)');
console.log('  ' + hr(combos.underFT_premium));
console.log();
console.log('Combo B — OVER FT forte (exp_ft≥11 + sniper OVER)');
console.log('  ' + hr(combos.overFT_forte));
console.log();
console.log('Combo B+ — OVER FT premium (Combo B + Reis ABSOLUTO)');
console.log('  ' + hr(combos.overFT_premium));
console.log();
console.log('Combo C — UNDER HT forte (exp_ht≤3 + sniper UNDER 4)');
console.log('  ' + hr(combos.underHT_forte));
console.log();
console.log('Combo D — OVER HT forte (exp_ht≥5 + sniper OVER 4)');
console.log('  ' + hr(combos.overHT_forte));
console.log();
console.log('Combo E — Convergência sniper HT+FT UNDER (UNDER 4 + UNDER 10)');
console.log('  ' + hr(combos.convergencia_under));
console.log();
console.log('Combo F — Convergência sniper HT+FT OVER (OVER 4 + OVER 10)');
console.log('  ' + hr(combos.convergencia_over));
console.log();

// HIT RATE POR LIGA
console.log('🌍 HIT RATE POR LIGA — SNIPER FT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(sniperFTPorLiga).forEach(([code, m]) => {
  const totOver = m.OVER.g + m.OVER.r + m.OVER.p;
  const totUnder = m.UNDER.g + m.UNDER.r + m.UNDER.p;
  if (totOver + totUnder > 0) {
    console.log('  ' + code.padEnd(6) + 'OVER:  ' + hr(m.OVER));
    console.log('  ' + ' '.repeat(6) + 'UNDER: ' + hr(m.UNDER));
  }
});
console.log();

// Erro por liga
console.log('📐 ERRO MÉDIO E VIÉS POR LIGA (FT)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const errosPorLiga = {};
errosFT.forEach(e => {
  if (!errosPorLiga[e.liga]) errosPorLiga[e.liga] = [];
  errosPorLiga[e.liga].push(e);
});
Object.entries(errosPorLiga).forEach(([liga, arr]) => {
  const s = calcStats(arr);
  console.log('  ' + liga.padEnd(6) + 'erro ±' + s.erroMedio.toFixed(2) + ' · viés ' + (s.viesMedio>=0?'+':'') + s.viesMedio.toFixed(2) + ' · R² ' + s.r2.toFixed(2) + ' · n=' + s.n);
});
