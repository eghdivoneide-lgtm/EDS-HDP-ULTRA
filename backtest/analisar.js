#!/usr/bin/env node
// ============================================================
//  EDS — Analisador de backtest (apostas reais na Pinnacle)
// ============================================================
//  Lê bets_*.json e calcula, por liga e por tipo de mercado:
//    - Win rate (V / V+D)
//    - ROI (lucro / total apostado)
//    - Acerto relativo do app vs implied probability da odd
//    - Quando o app escolheu bem (acerto) vs mal (resultado negativo)
//
//  Uso: node backtest/analisar.js [arquivo.json]
// ============================================================

const fs = require('fs');
const path = require('path');

const arquivo = process.argv[2] || path.join(__dirname, 'bets_2026-04-17_to_20.json');
const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));

const apostas = dados.apostas;

// Agrupa por chave
function groupBy(arr, keyFn) {
  return arr.reduce((acc, it) => {
    const k = keyFn(it);
    (acc[k] = acc[k] || []).push(it);
    return acc;
  }, {});
}

// Calcula estatísticas de um lote de apostas.
// - Reembolso devolve o stake (P&L = 0).
// - Vitória: lucro = stake * (odd - 1).
// - Derrota: lucro = -stake.
function stats(lote) {
  let V = 0, D = 0, R = 0;
  let totalStake = 0, totalRetorno = 0;
  let somaOddVit = 0, somaOddDer = 0;
  for (const b of lote) {
    totalStake += b.stake;
    if (b.resultado === 'V') { V++; totalRetorno += b.stake * b.odd; somaOddVit += b.odd; }
    else if (b.resultado === 'D') { D++; somaOddDer += b.odd; /* retorno 0 */ }
    else if (b.resultado === 'R') { R++; totalRetorno += b.stake; /* reembolso */ }
  }
  const lucro = totalRetorno - totalStake;
  const roi = totalStake > 0 ? lucro / totalStake : 0;
  const winRate = (V + D) > 0 ? V / (V + D) : 0;
  // Implied prob média (prob que o mercado acha que a aposta acerta).
  // Pinnacle tem margem baixa, então é um proxy razoável.
  const oddMediaVit = V > 0 ? somaOddVit / V : null;
  const oddMediaDer = D > 0 ? somaOddDer / D : null;
  // Win rate "esperado" se o app fosse calibrado na odd = 1/odd.
  const impliedMedia = lote.length > 0 ? lote.reduce((s,b) => s + (1/b.odd), 0) / lote.length : 0;
  return {
    n: lote.length, V, D, R,
    winRate: +(winRate * 100).toFixed(1),
    impliedEsperado: +(impliedMedia * 100).toFixed(1),
    edge: +((winRate - impliedMedia) * 100).toFixed(1), // diferença entre real e esperado
    totalStake: +totalStake.toFixed(2),
    lucro: +lucro.toFixed(2),
    roi: +(roi * 100).toFixed(1),
    oddMediaVit, oddMediaDer
  };
}

// Helper de formato de tabela
function linha(cols, widths) {
  return cols.map((c, i) => String(c).padEnd(widths[i])).join(' | ');
}

// === POR LIGA ===
console.log('\n' + '='.repeat(88));
console.log('  ANÁLISE POR LIGA');
console.log('='.repeat(88));

const w = [8, 5, 5, 5, 5, 7, 8, 9, 8];
console.log(linha(['LIGA', 'N', 'V', 'D', 'R', 'WIN%', 'IMPL%', 'EDGE%', 'ROI%'], w));
console.log('-'.repeat(88));

const porLiga = groupBy(apostas, b => b.liga);
const resumoLigas = [];
for (const [liga, lote] of Object.entries(porLiga)) {
  const s = stats(lote);
  resumoLigas.push({ liga, ...s });
  console.log(linha([liga, s.n, s.V, s.D, s.R, s.winRate, s.impliedEsperado,
    (s.edge >= 0 ? '+' : '') + s.edge, (s.roi >= 0 ? '+' : '') + s.roi], w));
}

// Totalizador
console.log('-'.repeat(88));
const total = stats(apostas);
console.log(linha(['TOTAL', total.n, total.V, total.D, total.R,
  total.winRate, total.impliedEsperado,
  (total.edge >= 0 ? '+' : '') + total.edge,
  (total.roi >= 0 ? '+' : '') + total.roi], w));

// === POR MERCADO ===
console.log('\n' + '='.repeat(88));
console.log('  ANÁLISE POR TIPO DE MERCADO');
console.log('='.repeat(88));
console.log(linha(['MERCADO', 'N', 'V', 'D', 'R', 'WIN%', 'IMPL%', 'EDGE%', 'ROI%'], [12, 5, 5, 5, 5, 7, 8, 9, 8]));
console.log('-'.repeat(88));

const porMercado = groupBy(apostas, b => b.mercado);
for (const [merc, lote] of Object.entries(porMercado)) {
  const s = stats(lote);
  console.log(linha([merc, s.n, s.V, s.D, s.R, s.winRate, s.impliedEsperado,
    (s.edge >= 0 ? '+' : '') + s.edge, (s.roi >= 0 ? '+' : '') + s.roi],
    [12, 5, 5, 5, 5, 7, 8, 9, 8]));
}

// === CALIBRAÇÃO RECOMENDADA ===
console.log('\n' + '='.repeat(88));
console.log('  CALIBRAÇÃO RECOMENDADA DO OARF_PESO_POR_LIGA');
console.log('='.repeat(88));
console.log('  (regra simples: ligas com ROI ≥ +20% podem manter/subir peso;');
console.log('   ligas com ROI < 0% devem baixar peso ou exigir mais evidência.)');
console.log();

const OARF_ATUAL = { BR: 0.30, MLS: 0.30, ARG: 0.60, ARG_B: 0.60, USL: 0.60,
                     BUN: 0.60, CL: 0.30, ECU: 0.30, ALM: 0.30, J1: 0.30, CHI: 0.30 };

const wC = [8, 7, 8, 12, 16];
console.log(linha(['LIGA', 'N', 'ROI%', 'PESO ATUAL', 'SUGESTÃO'], wC));
console.log('-'.repeat(88));
for (const r of resumoLigas.sort((a,b) => b.roi - a.roi)) {
  const atual = OARF_ATUAL[r.liga] ?? 0.30;
  let sugest;
  if (r.n < 8) sugest = `manter ${atual} (amostra pequena n=${r.n})`;
  else if (r.roi >= 30) sugest = `subir para ${(atual + 0.10).toFixed(2)} (ROI forte)`;
  else if (r.roi >= 15) sugest = `manter ${atual} (performando bem)`;
  else if (r.roi >= 0) sugest = `manter ${atual}, monitorar`;
  else if (r.roi >= -20) sugest = `BAIXAR para ${Math.max(0.10, atual - 0.10).toFixed(2)} (ROI negativo)`;
  else sugest = `BAIXAR para 0.10 ou investigar coleta`;
  console.log(linha([r.liga, r.n, (r.roi >= 0 ? '+' : '') + r.roi, atual, sugest], wC));
}

// === DIAGNÓSTICO DE ERROS CONCENTRADOS ===
console.log('\n' + '='.repeat(88));
console.log('  APOSTAS PERDEDORAS — CONCENTRAÇÃO');
console.log('='.repeat(88));
const derrotas = apostas.filter(b => b.resultado === 'D');
const derrotasPorLigaMercado = groupBy(derrotas, b => b.liga + '/' + b.mercado);
const top = Object.entries(derrotasPorLigaMercado)
  .map(([k, arr]) => ({ chave: k, n: arr.length, stake: arr.reduce((s,b)=>s+b.stake,0) }))
  .sort((a,b) => b.n - a.n)
  .slice(0, 10);

console.log(linha(['LIGA/MERCADO', 'N DERROTAS', 'R$ PERDIDOS'], [28, 12, 14]));
console.log('-'.repeat(88));
for (const t of top) {
  console.log(linha([t.chave, t.n, 'R$ -' + t.stake.toFixed(2)], [28, 12, 14]));
}

console.log('\n' + '='.repeat(88));
console.log(`  Total apostado: R$ ${total.totalStake.toFixed(2)} | Lucro: R$ ${total.lucro.toFixed(2)} | ROI: ${total.roi >= 0 ? '+' : ''}${total.roi}%`);
console.log('='.repeat(88) + '\n');
