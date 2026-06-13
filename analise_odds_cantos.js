#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
//  ANÁLISE: Equilíbrio de Odds × Cantos × Formação Tática
//  Cruza odds 1X2 pré-jogo com resultado de cantos em 9 ligas
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const BASE = '/home/user/EDS-HDP-ULTRA/data';

// ── leitura dos arquivos JS ───────────────────────────────────────────────

function loadLeague(file) {
  const src = fs.readFileSync(path.join(BASE, file), 'utf8');
  // extrai o objeto do window.DADOS_XXX = { ... }
  const m = src.match(/window\.\w+\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) throw new Error('Formato inesperado: ' + file);
  return JSON.parse(m[1]);
}

const LIGAS = [
  { id: 'BR',    file: 'brasileirao2026.js',  nome: 'Brasileirão Série A' },
  { id: 'BR_B',  file: 'brasileiraoB2026.js', nome: 'Brasileirão Série B' },
  { id: 'ARG',   file: 'argentina2026.js',    nome: 'Liga Profesional ARG' },
  { id: 'ARG_B', file: 'argentina_b2026.js',  nome: 'Primera Nacional ARG' },
  { id: 'BUN',   file: 'bundesliga2026.js',   nome: 'Bundesliga' },
  { id: 'MLS',   file: 'mls2026.js',          nome: 'MLS' },
  { id: 'USL',   file: 'usl2026.js',          nome: 'USL Championship' },
  { id: 'CHI',   file: 'chile2026.js',        nome: 'Primera División CHI' },
  { id: 'ECU',   file: 'equador2026.js',      nome: 'Liga Pro ECU' },
];

// ── classificação de equilíbrio ───────────────────────────────────────────
// Calcula diferença de probabilidade normalizada entre mandante e visitante

function calcEquilibrio(oddM, oddE, oddV) {
  const oM = parseFloat(oddM), oE = parseFloat(oddE), oV = parseFloat(oddV);
  if (!oM || !oV || oM <= 1 || oV <= 1) return null;

  const pM = 1 / oM, pV = 1 / oV, pE = 1 / oE;
  const total = pM + pE + pV;                    // inclui margem da casa
  const pMn = pM / total, pVn = pV / total;      // probabilidades normalizadas
  const diff = pMn - pVn;                        // >0 = mandante favorito
  const absDiff = Math.abs(diff);

  let categoria;
  if (absDiff < 0.08)       categoria = 'EQUILIBRADO';
  else if (absDiff < 0.20)  categoria = 'LEVE_DESEQUIL';
  else if (absDiff < 0.38)  categoria = 'DESEQUILIBRADO';
  else                      categoria = 'DOMINIO';

  return {
    pMn: +pMn.toFixed(4),
    pVn: +pVn.toFixed(4),
    diff: +diff.toFixed(4),
    absDiff: +absDiff.toFixed(4),
    categoria,
    favorito: diff > 0.02 ? 'mandante' : diff < -0.02 ? 'visitante' : 'neutro',
    oddM: oM, oddV: oV
  };
}

// ── estruturas de acumulação ──────────────────────────────────────────────

function novaBucket() {
  return {
    n: 0,
    total_ft: 0, total_ht: 0,
    cantos_fav: 0, cantos_azarao: 0,
    cantos_m: 0, cantos_v: 0,
    fav_wins: 0, fav_empate: 0,
    m_wins: 0,
    over95_ft: 0, under95_ft: 0,
    over85_ft: 0,
    over35_ht: 0, over45_ht: 0,
  };
}

function add(bucket, jogo, eq) {
  const cft = jogo.cantos && jogo.cantos.ft;
  const cht = jogo.cantos && jogo.cantos.ht;
  if (!cft || cft.m == null || cft.v == null) return false;

  const cm = +cft.m, cv = +cft.v;
  const hm = cht ? (+cht.m || 0) : 0, hv = cht ? (+cht.v || 0) : 0;
  const total_ft = cm + cv;
  const total_ht = hm + hv;

  bucket.n++;
  bucket.total_ft  += total_ft;
  bucket.total_ht  += total_ht;
  bucket.cantos_m  += cm;
  bucket.cantos_v  += cv;

  // cantos do favorito vs azarão
  const cfav   = eq.favorito === 'mandante' ? cm : eq.favorito === 'visitante' ? cv : null;
  const cazarao = eq.favorito === 'mandante' ? cv : eq.favorito === 'visitante' ? cm : null;
  if (cfav !== null) {
    bucket.cantos_fav    += cfav;
    bucket.cantos_azarao += cazarao;
    if (cfav > cazarao)       bucket.fav_wins++;
    else if (cfav === cazarao) bucket.fav_empate++;
  }

  if (cm > cv) bucket.m_wins++;

  // Over/Under
  if (total_ft > 9.5)  bucket.over95_ft++;
  else                 bucket.under95_ft++;
  if (total_ft > 8.5)  bucket.over85_ft++;
  if (total_ht > 3.5)  bucket.over35_ht++;
  if (total_ht > 4.5)  bucket.over45_ht++;

  return true;
}

function stats(b) {
  if (b.n === 0) return null;
  const hasFav = b.cantos_fav > 0 || b.cantos_azarao > 0;
  return {
    n:            b.n,
    avg_total_ft: +(b.total_ft  / b.n).toFixed(2),
    avg_total_ht: +(b.total_ht  / b.n).toFixed(2),
    avg_canto_m:  +(b.cantos_m  / b.n).toFixed(2),
    avg_canto_v:  +(b.cantos_v  / b.n).toFixed(2),
    avg_fav:      hasFav ? +(b.cantos_fav    / b.n).toFixed(2) : '—',
    avg_azarao:   hasFav ? +(b.cantos_azarao / b.n).toFixed(2) : '—',
    fav_win_pct:  hasFav ? +(b.fav_wins / b.n * 100).toFixed(1) : '—',
    m_win_pct:    +(b.m_wins / b.n * 100).toFixed(1),
    over95_pct:   +(b.over95_ft / b.n * 100).toFixed(1),
    over85_pct:   +(b.over85_ft / b.n * 100).toFixed(1),
    over35ht_pct: +(b.over35_ht / b.n * 100).toFixed(1),
    over45ht_pct: +(b.over45_ht / b.n * 100).toFixed(1),
  };
}

// ── buckets principais ────────────────────────────────────────────────────

const global_eq = {
  EQUILIBRADO:    novaBucket(),
  LEVE_DESEQUIL:  novaBucket(),
  DESEQUILIBRADO: novaBucket(),
  DOMINIO:        novaBucket(),
};

// por liga
const por_liga = {};

// por formação × equilíbrio (Ecuador)
const formacao_eq = {};

// distribuição de total FT por faixa de odds
const faixas_odd = {};   // { '1.20-1.40': bucket, ... }

function faixaOdd(oddFav) {
  if (oddFav <= 1.25) return '≤1.25 (domínio total)';
  if (oddFav <= 1.40) return '1.26-1.40';
  if (oddFav <= 1.60) return '1.41-1.60';
  if (oddFav <= 1.80) return '1.61-1.80';
  if (oddFav <= 2.00) return '1.81-2.00';
  if (oddFav <= 2.50) return '2.01-2.50';
  return '>2.50 (equilíbrio)';
}

// ── processamento ─────────────────────────────────────────────────────────

let totalJogos = 0, jogosComOdds = 0;

for (const liga of LIGAS) {
  let data;
  try { data = loadLeague(liga.file); } catch(e) { continue; }

  const jogos = data.jogos || [];
  por_liga[liga.id] = {
    nome: liga.nome,
    buckets: {
      EQUILIBRADO: novaBucket(), LEVE_DESEQUIL: novaBucket(),
      DESEQUILIBRADO: novaBucket(), DOMINIO: novaBucket(),
    }
  };

  for (const j of jogos) {
    totalJogos++;
    const merc = j.mercado;
    if (!merc || !merc.oddM || !merc.oddV) continue;

    const eq = calcEquilibrio(merc.oddM, merc.oddEmpate, merc.oddV);
    if (!eq) continue;

    jogosComOdds++;

    // global
    add(global_eq[eq.categoria], j, eq);

    // por liga
    add(por_liga[liga.id].buckets[eq.categoria], j, eq);

    // faixa de odd do favorito
    const oddFav = eq.favorito === 'mandante' ? eq.oddM
                 : eq.favorito === 'visitante' ? eq.oddV
                 : Math.min(eq.oddM, eq.oddV);
    const fk = faixaOdd(oddFav);
    if (!faixas_odd[fk]) faixas_odd[fk] = novaBucket();
    add(faixas_odd[fk], j, eq);

    // formação × equilíbrio (só ECU tem formação)
    if (j.formacao) {
      for (const [pos, form] of [['m', j.formacao.m], ['v', j.formacao.v]]) {
        if (!form) continue;
        const chave = `${form}__${eq.categoria}`;
        if (!formacao_eq[chave]) formacao_eq[chave] = novaBucket();
        const jFake = {
          cantos: {
            ft: { m: pos==='m' ? j.cantos.ft.m : j.cantos.ft.v,
                  v: pos==='m' ? j.cantos.ft.v : j.cantos.ft.m },
            ht: j.cantos.ht ? {
              m: pos==='m' ? j.cantos.ht.m : j.cantos.ht.v,
              v: pos==='m' ? j.cantos.ht.v : j.cantos.ht.m } : null
          }
        };
        // para formação, só interessa cantos pró (como mandante ou visitante)
        const b = formacao_eq[chave];
        const cft = jFake.cantos.ft;
        if (cft.m == null) continue;
        b.n++;
        b.total_ft  += cft.m + cft.v;
        b.cantos_m  += cft.m;
        b.total_ht  += j.cantos.ht ? (pos==='m'?j.cantos.ht.m:j.cantos.ht.v) + (pos==='m'?j.cantos.ht.v:j.cantos.ht.m) : 0;
        if (cft.m > cft.v)  b.m_wins++;
        if (cft.m + cft.v > 9.5) b.over95_ft++;
        else b.under95_ft++;
      }
    }
  }
}

// ── output ────────────────────────────────────────────────────────────────

const out = [];
const SEP  = '═'.repeat(76);
const sep2 = '─'.repeat(76);

out.push(SEP);
out.push('  ANÁLISE: EQUILÍBRIO DE ODDS 1X2 × CANTOS × FORMAÇÃO');
out.push(`  Base: ${jogosComOdds} jogos com odds | ${totalJogos} jogos totais | 9 ligas`);
out.push(SEP);

// ── GLOSSÁRIO ─────────────────────────────────────────────────────────────
out.push(`
■ CATEGORIAS DE EQUILÍBRIO (baseado na diferença de probabilidade normalizada)

  EQUILIBRADO    → |diff| < 0.08  — odds muito próximas  (ex: 2.5 / 3.1 / 2.6)
  LEVE_DESEQUIL  → 0.08–0.20     — favorito leve         (ex: 1.9 / 3.3 / 3.8)
  DESEQUILIBRADO → 0.20–0.38     — favorito claro         (ex: 1.5 / 4.0 / 6.5)
  DOMINIO        → >0.38         — favorito pesado        (ex: 1.2 / 5.5 / 13.0)
`);

// ── 1. VISÃO GLOBAL ───────────────────────────────────────────────────────
out.push('■ 1. VISÃO GLOBAL: EQUILÍBRIO × CANTOS (todas as ligas)\n');

const COLS = ['Categoria','N','Avg FT','Avg HT','Avg Fav','Avg Azarão','Fav Win%','M Win%','Over9.5%','Over8.5%'];
out.push(
  COLS[0].padEnd(16) + COLS[1].padStart(6) +
  COLS[2].padStart(9) + COLS[3].padStart(9) +
  COLS[4].padStart(10) + COLS[5].padStart(12) +
  COLS[6].padStart(10) + COLS[7].padStart(9) +
  COLS[8].padStart(11) + COLS[9].padStart(11)
);
out.push(sep2);

const ORDER = ['EQUILIBRADO','LEVE_DESEQUIL','DESEQUILIBRADO','DOMINIO'];
for (const cat of ORDER) {
  const s = stats(global_eq[cat]);
  if (!s) continue;
  out.push(
    cat.padEnd(16) +
    String(s.n).padStart(6) +
    String(s.avg_total_ft).padStart(9) +
    String(s.avg_total_ht).padStart(9) +
    String(s.avg_fav).padStart(10) +
    String(s.avg_azarao).padStart(12) +
    String(s.fav_win_pct+'%').padStart(10) +
    String(s.m_win_pct+'%').padStart(9) +
    String(s.over95_pct+'%').padStart(11) +
    String(s.over85_pct+'%').padStart(11)
  );
}

// ── 2. FAIXA DE ODD DO FAVORITO ───────────────────────────────────────────
out.push('\n■ 2. FAIXA DE ODD DO FAVORITO × CANTOS\n');
out.push('  (odd do favorito = a menor odd entre mandante e visitante)\n');

const faixaOrder = ['≤1.25 (domínio total)','1.26-1.40','1.41-1.60','1.61-1.80','1.81-2.00','2.01-2.50','>2.50 (equilíbrio)'];
out.push(
  'Faixa Odd Fav'.padEnd(24) + 'N'.padStart(6) +
  'Avg FT'.padStart(9) + 'Avg Fav'.padStart(10) + 'Avg Azarão'.padStart(12) +
  'Fav Win%'.padStart(10) + 'Over9.5%'.padStart(11) + 'Over8.5%'.padStart(11)
);
out.push(sep2);

for (const fk of faixaOrder) {
  const b = faixas_odd[fk];
  if (!b || b.n < 3) continue;
  const s = stats(b);
  out.push(
    fk.padEnd(24) +
    String(s.n).padStart(6) +
    String(s.avg_total_ft).padStart(9) +
    String(s.avg_fav).padStart(10) +
    String(s.avg_azarao).padStart(12) +
    String(s.fav_win_pct+'%').padStart(10) +
    String(s.over95_pct+'%').padStart(11) +
    String(s.over85_pct+'%').padStart(11)
  );
}

// ── 3. POR LIGA × CATEGORIA ───────────────────────────────────────────────
out.push('\n■ 3. POR LIGA × CATEGORIA DE EQUILÍBRIO\n');

for (const liga of LIGAS) {
  const ld = por_liga[liga.id];
  if (!ld) continue;

  const totN = ORDER.reduce((s,k) => s + (ld.buckets[k]?.n || 0), 0);
  if (totN === 0) continue;

  out.push(`  [ ${liga.id} ] ${liga.nome} — ${totN} jogos`);
  out.push(`  ${'Categoria'.padEnd(16)} ${'N'.padStart(5)} ${'Avg FT'.padStart(8)} ${'Fav Win%'.padStart(10)} ${'Over9.5%'.padStart(10)} ${'Avg Fav'.padStart(9)} ${'Avg Azarão'.padStart(11)}`);
  out.push('  ' + '─'.repeat(72));

  for (const cat of ORDER) {
    const s = stats(ld.buckets[cat]);
    if (!s || s.n < 3) continue;
    out.push(
      `  ${cat.padEnd(16)} ${String(s.n).padStart(5)} ${String(s.avg_total_ft).padStart(8)} ` +
      `${String(s.fav_win_pct+'%').padStart(10)} ${String(s.over95_pct+'%').padStart(10)} ` +
      `${String(s.avg_fav).padStart(9)} ${String(s.avg_azarao).padStart(11)}`
    );
  }
  out.push('');
}

// ── 4. FORMAÇÃO × EQUILÍBRIO (EQUADOR) ────────────────────────────────────
out.push('■ 4. FORMAÇÃO TÁTICA × EQUILÍBRIO DE ODDS — Liga Pro Ecuador\n');
out.push('  (jogos por formação, desdobrados por categoria de odds)\n');

// agrega por formação simples primeiro
const formSimples = {};
for (const [chave, b] of Object.entries(formacao_eq)) {
  const [form, cat] = chave.split('__');
  if (!formSimples[form]) formSimples[form] = { total: novaBucket() };
  if (!formSimples[form][cat]) formSimples[form][cat] = novaBucket();
  // soma os counts
  for (const k of Object.keys(b)) {
    formSimples[form][cat][k] = (formSimples[form][cat][k] || 0) + b[k];
    formSimples[form]['total'][k] = (formSimples[form]['total'][k] || 0) + b[k];
  }
}

const formsOrdenadas = Object.entries(formSimples)
  .filter(([,v]) => v.total.n >= 5)
  .sort((a,b) => (b[1].total.cantos_m/b[1].total.n) - (a[1].total.cantos_m/a[1].total.n));

out.push(`  ${'Formação'.padEnd(12)} ${'Cat Odds'.padEnd(16)} ${'N'.padStart(5)} ${'Avg Pró'.padStart(9)} ${'Avg Total'.padStart(11)} ${'M Win%'.padStart(9)} ${'Over9.5%'.padStart(10)}`);
out.push('  ' + '─'.repeat(72));

for (const [form, cats] of formsOrdenadas) {
  // linha total
  const tot = cats.total;
  if (tot.n < 5) continue;
  const avgPro = +(tot.cantos_m / tot.n).toFixed(2);
  const avgTot = +(tot.total_ft / tot.n).toFixed(2);
  const mWin   = +(tot.m_wins  / tot.n * 100).toFixed(1);
  const ov95   = +(tot.over95_ft / tot.n * 100).toFixed(1);
  out.push(`  ${form.padEnd(12)} ${'[GERAL]'.padEnd(16)} ${String(tot.n).padStart(5)} ${String(avgPro).padStart(9)} ${String(avgTot).padStart(11)} ${String(mWin+'%').padStart(9)} ${String(ov95+'%').padStart(10)}`);

  // por categoria de odds
  for (const cat of ORDER) {
    const b = cats[cat];
    if (!b || b.n < 3) continue;
    const ap = +(b.cantos_m / b.n).toFixed(2);
    const at = +(b.total_ft / b.n).toFixed(2);
    const mw = +(b.m_wins   / b.n * 100).toFixed(1);
    const o9 = +(b.over95_ft / b.n * 100).toFixed(1);
    out.push(`  ${''.padEnd(12)} ${('↳ '+cat).padEnd(16)} ${String(b.n).padStart(5)} ${String(ap).padStart(9)} ${String(at).padStart(11)} ${String(mw+'%').padStart(9)} ${String(o9+'%').padStart(10)}`);
  }
  out.push('');
}

// ── 5. INSIGHTS AUTOMÁTICOS ───────────────────────────────────────────────
out.push('■ 5. INSIGHTS AUTOMÁTICOS\n');

const eq_s   = stats(global_eq['EQUILIBRADO']);
const leve_s = stats(global_eq['LEVE_DESEQUIL']);
const deseq_s= stats(global_eq['DESEQUILIBRADO']);
const dom_s  = stats(global_eq['DOMINIO']);

if (eq_s && dom_s) {
  const diffFT = +(dom_s.avg_total_ft - eq_s.avg_total_ft).toFixed(2);
  out.push(`  → Total FT médio:  EQUILIBRADO=${eq_s.avg_total_ft}  vs  DOMÍNIO=${dom_s.avg_total_ft}  (diff ${diffFT > 0 ? '+' : ''}${diffFT})`);
  out.push(`  → Favorito vence cantos:  EQUIL=${eq_s.fav_win_pct}%  LEVE=${leve_s?.fav_win_pct}%  DESEQ=${deseq_s?.fav_win_pct}%  DOMÍNIO=${dom_s.fav_win_pct}%`);
  out.push(`  → Over 9.5 FT:  EQUIL=${eq_s.over95_pct}%  LEVE=${leve_s?.over95_pct}%  DESEQ=${deseq_s?.over95_pct}%  DOMÍNIO=${dom_s.over95_pct}%`);
  out.push(`  → Over 8.5 FT:  EQUIL=${eq_s.over85_pct}%  LEVE=${leve_s?.over85_pct}%  DESEQ=${deseq_s?.over85_pct}%  DOMÍNIO=${dom_s.over85_pct}%`);
  out.push(`  → Avg cantos fav vs azarão em DOMÍNIO: ${dom_s.avg_fav} vs ${dom_s.avg_azarao}  (edge ${+(dom_s.avg_fav - dom_s.avg_azarao).toFixed(2)})`);
  out.push(`  → Avg cantos fav vs azarão em EQUIL:   ${eq_s.avg_fav} vs ${eq_s.avg_azarao}`);
}

// Melhor formação em jogos equilibrados (ECU)
const formEq = formsOrdenadas.filter(([,v]) => v['EQUILIBRADO'] && v['EQUILIBRADO'].n >= 3);
if (formEq.length > 0) {
  const [bestF, bestV] = formEq.sort((a,b) => {
    const ra = a[1]['EQUILIBRADO'] ? a[1]['EQUILIBRADO'].cantos_m / a[1]['EQUILIBRADO'].n : 0;
    const rb = b[1]['EQUILIBRADO'] ? b[1]['EQUILIBRADO'].cantos_m / b[1]['EQUILIBRADO'].n : 0;
    return rb - ra;
  })[0];
  const bEq = bestV['EQUILIBRADO'];
  out.push(`  → Formação mais eficiente em jogo EQUILIBRADO (ECU): ${bestF}  avg_pró=${+(bEq.cantos_m/bEq.n).toFixed(2)}  win%=${+(bEq.m_wins/bEq.n*100).toFixed(1)}%`);
}

// Over HT
if (eq_s && dom_s) {
  out.push(`  → Over 3.5 HT:  EQUIL=${eq_s.over35ht_pct}%  DOMÍNIO=${dom_s.over35ht_pct}%`);
  out.push(`  → Over 4.5 HT:  EQUIL=${eq_s.over45ht_pct}%  DOMÍNIO=${dom_s.over45ht_pct}%`);
}

out.push('');
out.push(SEP);
out.push('  FIM DO RELATÓRIO');
out.push(SEP);

const report = out.join('\n');
console.log(report);
fs.writeFileSync('/home/user/EDS-HDP-ULTRA/relatorio_odds_cantos.txt', report, 'utf8');
console.error('\n→ Salvo em: relatorio_odds_cantos.txt');
