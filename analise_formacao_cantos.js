#!/usr/bin/env node
// Análise: Formação/DNA vs Desempenho em Cantos
// Cruza perfis de times com histórico de partidas

const fs = require('fs');
const path = require('path');

// ── helpers ───────────────────────────────────────────────────────────────────

function readJSON(fp) {
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

// Extrai um objeto JS com window.XXX = {...}  →  retorna o objeto interno
function extractWindowVar(fp) {
  const src = fs.readFileSync(fp, 'utf8');
  const m = src.match(/window\.\w+\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) throw new Error('Não achei window.xxx em ' + fp);
  return JSON.parse(m[1]);
}

// ── carregamento dos dados ────────────────────────────────────────────────────

const BASE = '/home/user/EDS-HDP-ULTRA';

// 1. DNA por liga (perfil_dna, categoria, powerScore)
const dnaData = readJSON(path.join(BASE, 'memoria Fotografica/03_MEMORIA_DNA.json'));

// Monta mapa  { liga → { nome_time → { perfil_dna, categoria, powerScore } } }
const dnaMap = {};
const LIGAS_DNA = ['BR','BR_B','ARG','ARG_B','MLS','USL','BUN','J1','J2_J3'];
for (const liga of LIGAS_DNA) {
  if (!dnaData[liga] || !dnaData[liga].ranking_powerscore) continue;
  dnaMap[liga] = {};
  for (const t of dnaData[liga].ranking_powerscore) {
    dnaMap[liga][t.time] = {
      perfil_dna : t.perfil_dna,
      categoria  : t.categoria,
      powerScore : t.powerScore
    };
  }
}

// 2. Perfis qualitativos por liga (perfil_ataque, tendencia_cantos, etc.)
const qualRaw = fs.readFileSync(path.join(BASE, 'data/memoria_qualitativa.js'), 'utf8');
const qualMatch = qualRaw.match(/window\.MEMORIA_QUALITATIVA\s*=\s*(\{[\s\S]*?\});\s*$/);
let qualMap = {}; // { liga → { time → { perfil_ataque, tendencia_cantos, perfil_defesa_vis, ... } } }
if (qualMatch) {
  try {
    const q = JSON.parse(qualMatch[1]);
    for (const liga of Object.keys(q)) {
      if (!q[liga].perfis_times) continue;
      qualMap[liga] = q[liga].perfis_times;
    }
  } catch(e) { /* continua sem perfis qualitativos */ }
}

// 3. Históricos de jogos das 9 ligas
const HISTORICO_DIR = path.join(BASE, 'memoria Fotografica/04_HISTORICO_JOGO_A_JOGO');
const ligaFiles = {
  BR    : 'BR.json',
  BR_B  : 'BR_B.json',
  ARG   : 'ARG.json',
  ARG_B : 'ARG_B.json',
  MLS   : 'MLS.json',
  USL   : 'USL.json',
  BUN   : 'BUN.json',
  J1    : 'J1.json',
  J2_J3 : 'J2_J3.json',
};

// ── estruturas de agregação ──────────────────────────────────────────────────

// Por perfil DNA
const statsDNA = {}; // { perfil_dna → { jogos, cantos_pro_total, cantos_contra_total, wins_corner } }
// Por perfil de ataque (qualitativo)
const statsAtaque = {};
// Por tendência de cantos
const statsTendencia = {};
// Por categoria (ELITE/MEDIO/AZARAO)
const statsCategoria = {};
// Por liga — baseline de cantos
const statsLiga = {};
// Por DNA + condição (mandante/visitante)
const statsDNACond = {};

function inc(obj, key) {
  if (!obj[key]) obj[key] = { jogos: 0, cantos_pro: 0, cantos_contra: 0, wins_corner: 0, empates_corner: 0 };
  return obj[key];
}

function addObservation(obj, key, pro, contra) {
  const s = inc(obj, key);
  s.jogos++;
  s.cantos_pro += pro;
  s.cantos_contra += contra;
  if (pro > contra) s.wins_corner++;
  else if (pro === contra) s.empates_corner++;
}

// ── processa cada liga ────────────────────────────────────────────────────────

let totalJogos = 0;

for (const [liga, file] of Object.entries(ligaFiles)) {
  const fp = path.join(HISTORICO_DIR, file);
  if (!fs.existsSync(fp)) continue;

  const data = readJSON(fp);
  const jogos = data.jogos || [];

  statsLiga[liga] = { jogos: 0, total_cantos_ft: 0, total_cantos_ht: 0 };

  for (const j of jogos) {
    const cft = j.cantos && j.cantos.ft;
    if (!cft) continue;
    const m_cantos = cft.m ?? null;
    const v_cantos = cft.v ?? null;
    if (m_cantos === null || v_cantos === null) continue;

    totalJogos++;
    statsLiga[liga].jogos++;
    statsLiga[liga].total_cantos_ft += m_cantos + v_cantos;
    if (j.cantos.ht) {
      statsLiga[liga].total_cantos_ht += (j.cantos.ht.m ?? 0) + (j.cantos.ht.v ?? 0);
    }

    // ─ para mandante ─
    for (const [time, pro, contra, cond] of [
      [j.mandante, m_cantos, v_cantos, 'mandante'],
      [j.visitante, v_cantos, m_cantos, 'visitante']
    ]) {
      // DNA
      const dnaInfo = dnaMap[liga] && dnaMap[liga][time];
      if (dnaInfo) {
        addObservation(statsDNA, dnaInfo.perfil_dna, pro, contra);
        addObservation(statsCategoria, dnaInfo.categoria, pro, contra);
        const condKey = `${dnaInfo.perfil_dna}__${cond}`;
        addObservation(statsDNACond, condKey, pro, contra);
      }

      // Qualitativo
      const qLiga = qualMap[liga] || qualMap[liga.replace('_','')] || {};
      const qInfo = qLiga[time];
      if (qInfo) {
        if (qInfo.perfil_ataque) addObservation(statsAtaque, qInfo.perfil_ataque, pro, contra);
        if (qInfo.tendencia_cantos) addObservation(statsTendencia, qInfo.tendencia_cantos, pro, contra);
      }
    }
  }
}

// ── processamento Ecuador (formação tática) ──────────────────────────────────

const ecuFile = path.join(BASE, 'data/equador2026.js');
let statsFormacao = {}; // { formacao → { jogos, cantos_pro, cantos_contra, wins_corner } }
let ecuTotal = 0;

if (fs.existsSync(ecuFile)) {
  try {
    const ecuData = extractWindowVar(ecuFile);
    const jogosEcu = ecuData.jogos || [];

    for (const j of jogosEcu) {
      const cft = j.cantos && j.cantos.ft;
      if (!cft) continue;
      const m_cantos = cft.m ?? null;
      const v_cantos = cft.v ?? null;
      if (m_cantos === null || v_cantos === null) continue;

      const form = j.formacao;
      if (!form) continue;

      ecuTotal++;

      // mandante
      if (form.m) addObservation(statsFormacao, form.m, m_cantos, v_cantos);
      // visitante
      if (form.v) addObservation(statsFormacao, form.v, v_cantos, m_cantos);
    }
  } catch(e) {
    console.error('Erro ao processar Ecuador:', e.message);
  }
}

// ── funções de formatação ────────────────────────────────────────────────────

function fmt(stats, label) {
  const entries = Object.entries(stats)
    .filter(([,s]) => s.jogos >= 5)
    .map(([k, s]) => ({
      nome       : k,
      jogos      : s.jogos,
      avg_pro    : +(s.cantos_pro / s.jogos).toFixed(2),
      avg_contra : +(s.cantos_contra / s.jogos).toFixed(2),
      balance    : +((s.cantos_pro - s.cantos_contra) / s.jogos).toFixed(2),
      win_pct    : +(s.wins_corner / s.jogos * 100).toFixed(1),
      empate_pct : +(s.empates_corner / s.jogos * 100).toFixed(1),
    }))
    .sort((a, b) => b.avg_pro - a.avg_pro);
  return entries;
}

// ── output do relatório ───────────────────────────────────────────────────────

const out = [];
const sep = '═'.repeat(72);
const sep2 = '─'.repeat(72);

out.push(sep);
out.push('  RELATÓRIO: FORMAÇÃO/DNA × DESEMPENHO EM CANTOS');
out.push('  Base: ' + totalJogos + ' jogos | 9 ligas | até 2026-05-16');
out.push(sep);

// ── 1. BASELINE POR LIGA ──────────────────────────────────────────────────────
out.push('\n■ 1. BASELINE DE CANTOS POR LIGA\n');
out.push(String('Liga').padEnd(8) + String('Jogos').padStart(7) + String('Média FT').padStart(10) + String('Média HT').padStart(10) + String('FT/jogo').padStart(9));
out.push(sep2);
for (const [liga, s] of Object.entries(statsLiga).sort((a,b)=>b[1].total_cantos_ft/b[1].jogos - a[1].total_cantos_ft/a[1].jogos)) {
  if (s.jogos === 0) continue;
  const mft = (s.total_cantos_ft / s.jogos).toFixed(2);
  const mht = (s.total_cantos_ht / s.jogos).toFixed(2);
  out.push(
    liga.padEnd(8) +
    String(s.jogos).padStart(7) +
    String(mft).padStart(10) +
    String(mht).padStart(10) +
    String((s.total_cantos_ft / s.jogos / 2).toFixed(2)).padStart(9)
  );
}

// ── 2. DNA vs CANTOS (TODAS AS LIGAS) ────────────────────────────────────────
out.push('\n■ 2. PERFIL DNA × DESEMPENHO EM CANTOS (todas as ligas)\n');
out.push('  Explicação dos campos:');
out.push('  avg_pro    = média de cantos A FAVOR por partida');
out.push('  avg_contra = média de cantos CONTRA por partida');
out.push('  balance    = avg_pro − avg_contra (>0 = domina cantos)');
out.push('  win_pct    = % de jogos onde o time venceu o duelo de cantos\n');

const dnaCols = ['Perfil DNA', 'Jogos', 'Avg Pró', 'Avg Contra', 'Balance', 'Win%'];
out.push(
  dnaCols[0].padEnd(22) +
  dnaCols[1].padStart(7) +
  dnaCols[2].padStart(10) +
  dnaCols[3].padStart(12) +
  dnaCols[4].padStart(9) +
  dnaCols[5].padStart(7)
);
out.push(sep2);

const dnaRows = fmt(statsDNA);
for (const r of dnaRows) {
  out.push(
    r.nome.padEnd(22) +
    String(r.jogos).padStart(7) +
    String(r.avg_pro).padStart(10) +
    String(r.avg_contra).padStart(12) +
    String(r.balance).padStart(9) +
    String(r.win_pct + '%').padStart(7)
  );
}

// Detalhamento por condição (mandante/visitante) para cada DNA
out.push('\n  ─ Desdobramento por condição (mandante vs visitante) ─\n');
const condRows = fmt(statsDNACond)
  .filter(r => r.jogos >= 10)
  .sort((a,b) => b.balance - a.balance);
for (const r of condRows) {
  const [dna, cond] = r.nome.split('__');
  out.push(
    `  ${dna.padEnd(20)} [${cond.padEnd(9)}]  avg_pró=${r.avg_pro}  avg_contra=${r.avg_contra}  balance=${r.balance}  win=${r.win_pct}%`
  );
}

// ── 3. CATEGORIA (ELITE / MÉDIO / AZARÃO) ────────────────────────────────────
out.push('\n■ 3. CATEGORIA POWERSCORE × CANTOS\n');
const catRows = fmt(statsCategoria).sort((a,b)=>b.avg_pro-a.avg_pro);
for (const r of catRows) {
  out.push(
    r.nome.padEnd(22) +
    String(r.jogos).padStart(7) +
    String(r.avg_pro).padStart(10) +
    String(r.avg_contra).padStart(12) +
    String(r.balance).padStart(9) +
    String(r.win_pct + '%').padStart(7)
  );
}

// ── 4. PERFIL DE ATAQUE (qualitativo) ────────────────────────────────────────
out.push('\n■ 4. PERFIL DE ATAQUE × CANTOS (ligas com dados qualitativos)\n');
const atqRows = fmt(statsAtaque).sort((a,b)=>b.avg_pro-a.avg_pro);
if (atqRows.length === 0) {
  out.push('  (dados insuficientes para cross-liga)');
} else {
  for (const r of atqRows) {
    out.push(
      r.nome.padEnd(22) +
      String(r.jogos).padStart(7) +
      String(r.avg_pro).padStart(10) +
      String(r.avg_contra).padStart(12) +
      String(r.balance).padStart(9) +
      String(r.win_pct + '%').padStart(7)
    );
  }
}

// ── 5. TENDÊNCIA DE CANTOS ────────────────────────────────────────────────────
out.push('\n■ 5. TENDÊNCIA DE CANTOS × PERFORMANCE REAL\n');
const tendRows = fmt(statsTendencia).sort((a,b)=>b.avg_pro-a.avg_pro);
if (tendRows.length === 0) {
  out.push('  (dados insuficientes)');
} else {
  for (const r of tendRows) {
    out.push(
      r.nome.padEnd(22) +
      String(r.jogos).padStart(7) +
      String(r.avg_pro).padStart(10) +
      String(r.avg_contra).padStart(12) +
      String(r.balance).padStart(9) +
      String(r.win_pct + '%').padStart(7)
    );
  }
}

// ── 6. FORMAÇÃO TÁTICA — EQUADOR ─────────────────────────────────────────────
out.push('\n■ 6. FORMAÇÃO TÁTICA × CANTOS — Liga Pro (Equador 2026)\n');
out.push(`  Base: ${ecuTotal} jogos com formação identificada\n`);
if (Object.keys(statsFormacao).length === 0) {
  out.push('  (sem dados de formação)');
} else {
  const formRows = fmt(statsFormacao).sort((a,b)=>b.avg_pro-a.avg_pro);
  out.push(
    'Formação'.padEnd(14) +
    'Jogos'.padStart(7) +
    'Avg Pró'.padStart(10) +
    'Avg Contra'.padStart(12) +
    'Balance'.padStart(9) +
    'Win%'.padStart(7)
  );
  out.push(sep2);
  for (const r of formRows) {
    out.push(
      r.nome.padEnd(14) +
      String(r.jogos).padStart(7) +
      String(r.avg_pro).padStart(10) +
      String(r.avg_contra).padStart(12) +
      String(r.balance).padStart(9) +
      String(r.win_pct + '%').padStart(7)
    );
  }
}

// ── 7. ANÁLISE POR LIGA INDIVIDUAL ───────────────────────────────────────────
out.push('\n■ 7. TOP TIMES POR DNA × LIGA\n');

for (const liga of LIGAS_DNA) {
  if (!dnaMap[liga] || !statsLiga[liga]) continue;
  const s = statsLiga[liga];
  if (s.jogos === 0) continue;

  out.push(`  [ ${liga} ] — ${s.jogos} jogos — Média cantos FT: ${(s.total_cantos_ft/s.jogos).toFixed(2)}`);

  // agrupa DNA desta liga
  const ligaDNA = {};
  const fp = path.join(HISTORICO_DIR, ligaFiles[liga]);
  if (!fs.existsSync(fp)) { out.push(''); continue; }
  const data = readJSON(fp);

  for (const j of (data.jogos || [])) {
    const cft = j.cantos && j.cantos.ft;
    if (!cft || cft.m === null || cft.v === null) continue;
    for (const [time, pro, contra] of [[j.mandante, cft.m, cft.v],[j.visitante, cft.v, cft.m]]) {
      const dnaInfo = dnaMap[liga] && dnaMap[liga][time];
      if (!dnaInfo) continue;
      const k = dnaInfo.perfil_dna;
      if (!ligaDNA[k]) ligaDNA[k] = { jogos:0, cp:0, cc:0, wins:0 };
      ligaDNA[k].jogos++;
      ligaDNA[k].cp += pro;
      ligaDNA[k].cc += contra;
      if (pro > contra) ligaDNA[k].wins++;
    }
  }

  const rows = Object.entries(ligaDNA)
    .filter(([,v])=>v.jogos>=3)
    .map(([k,v])=>({ nome:k, jogos:v.jogos, ap:+(v.cp/v.jogos).toFixed(2), ac:+(v.cc/v.jogos).toFixed(2), bal:+((v.cp-v.cc)/v.jogos).toFixed(2), wp:+(v.wins/v.jogos*100).toFixed(1) }))
    .sort((a,b)=>b.ap-a.ap);

  for (const r of rows) {
    out.push(`    ${r.nome.padEnd(22)} jogos=${String(r.jogos).padStart(4)}  avg_pró=${r.ap}  balance=${r.bal}  win%=${r.wp}`);
  }
  out.push('');
}

// ── 8. INSIGHTS E CONCLUSÕES ──────────────────────────────────────────────────
out.push('■ 8. INSIGHTS AUTOMÁTICOS\n');

// DNA com maior avg_pro
const topDNA = [...dnaRows].sort((a,b)=>b.avg_pro-a.avg_pro);
const botDNA = [...dnaRows].sort((a,b)=>a.avg_pro-b.avg_pro);
if (topDNA.length > 0) {
  out.push(`  → DNA que MAIS gera cantos pró:      ${topDNA[0].nome}  (avg ${topDNA[0].avg_pro} / jogo)`);
  out.push(`  → DNA que MENOS gera cantos pró:     ${botDNA[0].nome}  (avg ${botDNA[0].avg_pro} / jogo)`);
  out.push(`  → DNA com MELHOR balanço de cantos:  ${[...dnaRows].sort((a,b)=>b.balance-a.balance)[0].nome}  (balance ${[...dnaRows].sort((a,b)=>b.balance-a.balance)[0].balance})`);
  out.push(`  → DNA com MAIOR win% cantos:         ${[...dnaRows].sort((a,b)=>b.win_pct-a.win_pct)[0].nome}  (${[...dnaRows].sort((a,b)=>b.win_pct-a.win_pct)[0].win_pct}%)`);
}

if (catRows.length > 0) {
  out.push(`  → Categoria que DOMINA cantos:       ${catRows[0].nome}  (avg ${catRows[0].avg_pro}, win% ${catRows[0].win_pct})`);
}

if (atqRows.length > 0) {
  out.push(`  → Perfil ataque maior produção:      ${atqRows[0].nome}  (avg ${atqRows[0].avg_pro})`);
  out.push(`  → Perfil ataque menor produção:      ${[...atqRows].sort((a,b)=>a.avg_pro-b.avg_pro)[0].nome}  (avg ${[...atqRows].sort((a,b)=>a.avg_pro-b.avg_pro)[0].avg_pro})`);
}

if (tendRows.length > 0) {
  out.push(`  → Tendência com MAIS cantos pró:     ${tendRows[0].nome}  (avg ${tendRows[0].avg_pro})`);
}

const formRows2 = Object.entries(statsFormacao)
  .filter(([,s])=>s.jogos>=3)
  .map(([k,s])=>({ nome:k, avg_pro:+(s.cantos_pro/s.jogos).toFixed(2), balance:+((s.cantos_pro-s.cantos_contra)/s.jogos).toFixed(2), win_pct:+(s.wins_corner/s.jogos*100).toFixed(1), jogos:s.jogos }));
const topForm = [...formRows2].sort((a,b)=>b.avg_pro-a.avg_pro);
if (topForm.length > 0) {
  out.push(`  → Formação ECU mais cantos pró:      ${topForm[0].nome}  (avg ${topForm[0].avg_pro}, jogos=${topForm[0].jogos})`);
  out.push(`  → Formação ECU melhor balanço:       ${[...topForm].sort((a,b)=>b.balance-a.balance)[0].nome}  (balance ${[...topForm].sort((a,b)=>b.balance-a.balance)[0].balance})`);
}

out.push('');
out.push(sep);
out.push('  FIM DO RELATÓRIO');
out.push(sep);

const report = out.join('\n');
console.log(report);

// Salva em arquivo
fs.writeFileSync(path.join(BASE, 'relatorio_formacao_cantos.txt'), report, 'utf8');
console.error('\n→ Salvo em: relatorio_formacao_cantos.txt');
