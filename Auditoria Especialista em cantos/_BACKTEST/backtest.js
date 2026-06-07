// BACKTEST PROFUNDO — análise rodada por rodada, liga por liga
// Gera relatório de WR histórico por mercado × liga.
// Uso: node backtest.js

const fs = require('fs');
const path = require('path');

// ============ SETUP ============
const ROOT = path.resolve(__dirname, '..', '..');
const LIGAS_ARQS = {
  BR:    'data/brasileirao2026.js',
  BR_B:  'data/brasileiraoB2026.js',
  ARG:   'data/argentina2026.js',
  ARG_B: 'data/argentina_b2026.js',
  MLS:   'data/mls2026.js',
  USL:   'data/usl2026.js',
  BUN:   'data/bundesliga2026.js',
  J1:    'data/j1league2026.js',
  J2_J3: 'data/j2j3league2026.js'
};

function carregaDataset(arq) {
  const txt = fs.readFileSync(path.join(ROOT, arq), 'utf-8');
  const ini = txt.indexOf('{');
  const fim = txt.lastIndexOf('}') + 1;
  return JSON.parse(txt.slice(ini, fim));
}

function jogoValido(j) {
  return j.cantos && j.cantos.ft &&
         typeof j.cantos.ft.m === 'number' && typeof j.cantos.ft.v === 'number' &&
         (j.cantos.ft.m + j.cantos.ft.v) > 0;
}

function totalFT(j) { return j.cantos.ft.m + j.cantos.ft.v; }
function totalHT(j) { return j.cantos.ht ? (j.cantos.ht.m || 0) + (j.cantos.ht.v || 0) : 0; }
function diffFT(j)  { return j.cantos.ft.m - j.cantos.ft.v; }

// ============ MEMORIA DNA ============
const memMaster = JSON.parse(fs.readFileSync(path.join(ROOT, 'Auditoria Especialista em cantos/_AnaliseDNA/_MEMORIA_TIMES_MASTER.json'), 'utf-8'));

function normNome(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getDnaTime(liga, nome) {
  const m = memMaster[liga];
  if (!m || !m.times) return null;
  if (m.times[nome]) return m.times[nome];
  const alvo = normNome(nome);
  const k = Object.keys(m.times).find(x => {
    const nx = normNome(x);
    return nx === alvo || nx.startsWith(alvo.slice(0, 6)) || alvo.startsWith(nx.slice(0, 6));
  });
  return k ? m.times[k] : null;
}

function temAssinatura(dna, nome) {
  if (!dna || !dna.assinaturas) return false;
  return dna.assinaturas.some(a => a.nome === nome && a.presente && a.qualifier === 'consolidado');
}

function powerScore(dna) {
  return dna && dna.identidade ? dna.identidade.powerScore : null;
}

// ============ FASE 1 — Estatísticas base ============
const ligaStats = {};
const linhasFT = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5];
const linhasHT = [2.5, 3.5, 4.5, 5.5];

Object.entries(LIGAS_ARQS).forEach(([liga, arq]) => {
  const ds = carregaDataset(arq);
  const jogos = (ds.jogos || []).filter(jogoValido);
  if (jogos.length === 0) return;

  const ftVals = jogos.map(totalFT);
  const htVals = jogos.map(totalHT);

  const mean = a => a.reduce((s,x)=>s+x,0) / a.length;
  const std  = a => {
    const m = mean(a);
    return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0) / a.length);
  };

  const overPct = (vals, linha) => 100 * vals.filter(v => v > linha).length / vals.length;
  const underPct = (vals, linha) => 100 * vals.filter(v => v < linha).length / vals.length;

  ligaStats[liga] = {
    n: jogos.length,
    media_ft: mean(ftVals),
    std_ft: std(ftVals),
    min_ft: Math.min(...ftVals),
    max_ft: Math.max(...ftVals),
    media_ht: mean(htVals),
    over_pcts: Object.fromEntries(linhasFT.map(l => [l, overPct(ftVals, l)])),
    under_pcts: Object.fromEntries(linhasFT.map(l => [l, underPct(ftVals, l)])),
    over_ht_pcts: Object.fromEntries(linhasHT.map(l => [l, overPct(htVals, l)])),
    // Dominância: % jogos onde lado favorito fez ≥ 60% / 67% / 75% dos cantos
    dom_60: 100 * jogos.filter(j => {
      const t = totalFT(j);
      return t > 0 && (Math.max(j.cantos.ft.m, j.cantos.ft.v) / t) >= 0.60;
    }).length / jogos.length,
    dom_67: 100 * jogos.filter(j => {
      const t = totalFT(j);
      return t > 0 && (Math.max(j.cantos.ft.m, j.cantos.ft.v) / t) >= 0.67;
    }).length / jogos.length,
    dom_75: 100 * jogos.filter(j => {
      const t = totalFT(j);
      return t > 0 && (Math.max(j.cantos.ft.m, j.cantos.ft.v) / t) >= 0.75;
    }).length / jogos.length
  };
});

// ============ OUTPUT — FASE 1 ============
console.log('═══════════════════════════════════════════════════════');
console.log('  FASE 1 — Estatísticas Base por Liga (N=' +
  Object.values(ligaStats).reduce((s,x)=>s+x.n,0) + ' jogos totais)');
console.log('═══════════════════════════════════════════════════════\n');

console.log('Liga    | N    | Média FT | σ FT | min-max | Média HT');
console.log('--------|------|----------|------|---------|----------');
Object.entries(ligaStats).forEach(([l, s]) => {
  console.log(`${l.padEnd(7)} | ${String(s.n).padStart(4)} | ${s.media_ft.toFixed(2).padStart(8)} | ${s.std_ft.toFixed(2).padStart(4)} | ${String(s.min_ft).padStart(2)}-${String(s.max_ft).padStart(2)}   | ${s.media_ht.toFixed(2).padStart(8)}`);
});

console.log('\n--- % Over 9.5 FT (histórico real) ---');
Object.entries(ligaStats).forEach(([l, s]) => {
  console.log(`  ${l.padEnd(7)}: Over 9.5 = ${s.over_pcts[9.5].toFixed(1)}% | Under 9.5 = ${s.under_pcts[9.5].toFixed(1)}%`);
});

console.log('\n--- Linha de equilíbrio (% Over mais próximo de 50%) ---');
Object.entries(ligaStats).forEach(([l, s]) => {
  const linhas = Object.entries(s.over_pcts).map(([linha, pct]) => ({linha:parseFloat(linha), pct, dist: Math.abs(pct-50)}));
  linhas.sort((a,b)=>a.dist-b.dist);
  const equilibrio = linhas[0];
  console.log(`  ${l.padEnd(7)}: linha ${equilibrio.linha} (Over ${equilibrio.pct.toFixed(1)}%) — divisor natural`);
});

// Salva FASE 1 pra o relatório final
fs.writeFileSync(path.join(__dirname, 'fase1_stats.json'), JSON.stringify(ligaStats, null, 2));
console.log('\n💾 Fase 1 salva em fase1_stats.json');
