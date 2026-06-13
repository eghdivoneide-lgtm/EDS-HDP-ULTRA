// ============================================================
// ANÁLISE OVER/UNDER DE CANTOS — HT e FT
// Mercados: Over/Under 4 HT | Over/Under 4.5 HT | Over/Under 9.5 FT
// Ligas: BR_A, BR_B, ARG_A, ARG_B, USL, MLS, ECU, CHI
// ============================================================

const fs  = require("fs");
const vm  = require("vm");
const path = require("path");

const DATA = path.join(__dirname, "../data");

// ─── loader genérico de window.X = {...} ───────────────────
function loadJS(file) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(DATA, file), "utf8"), ctx);
  return ctx.window[Object.keys(ctx.window)[0]];
}

// ─── configuração de ligas ─────────────────────────────────
const LIGAS = [
  { key: "BR_A",  file: "brasileirao2026.js",   memKey: "BR"    },
  { key: "BR_B",  file: "brasileiraoB2026.js",  memKey: "BR_B"  },
  { key: "ARG_A", file: "argentina2026.js",      memKey: "ARG"   },
  { key: "ARG_B", file: "argentina_b2026.js",    memKey: "ARG_B" },
  { key: "USL",   file: "usl2026.js",            memKey: "USL"   },
  { key: "MLS",   file: "mls2026.js",            memKey: "MLS"   },
  { key: "ECU",   file: "equador2026.js",         memKey: "ECU"   },
  { key: "CHI",   file: "chile2026.js",           memKey: "CHI"   },
];

// ─── carregar memória de perfis ────────────────────────────
const MEM = loadJS("memoria_usl.js");

function getPerfil(ligaKey, time) {
  const memKey = LIGAS.find(l => l.key === ligaKey)?.memKey;
  if (!memKey || !MEM[memKey]) return null;
  return MEM[memKey].perfis?.[time] || null;
}

function getPerfilLabel(ligaKey, time) {
  const p = getPerfil(ligaKey, time);
  return p?.perfil_usl || "?";
}

function getDiffCantos(ligaKey, time) {
  const p = getPerfil(ligaKey, time);
  return p?.diff_cantos ?? null;
}

// ─── coleta de jogos ───────────────────────────────────────
const TODOS_JOGOS = [];

for (const liga of LIGAS) {
  const d = loadJS(liga.file);
  const jogos = d.jogos || [];
  for (const g of jogos) {
    if (!g.cantos?.ht || !g.cantos?.ft) continue;
    const { m: htm, v: htv } = g.cantos.ht;
    const { m: ftm, v: ftv } = g.cantos.ft;
    if (htm == null || htv == null || ftm == null || ftv == null) continue;

    const totalHT = htm + htv;
    const totalFT = ftm + ftv;

    // formação
    const form = g.formacao || {};
    const formH = form.mandante || form.m || null;
    const formV = form.visitante || form.v || null;

    // perfis
    const perfH = getPerfilLabel(liga.key, g.mandante);
    const perfV = getPerfilLabel(liga.key, g.visitante);
    const diffH = getDiffCantos(liga.key, g.mandante);
    const diffV = getDiffCantos(liga.key, g.visitante);
    const diffSum = (diffH != null && diffV != null) ? diffH + diffV : null;

    TODOS_JOGOS.push({
      liga: liga.key,
      mandante: g.mandante,
      visitante: g.visitante,
      totalHT,
      totalFT,
      htm, htv, ftm, ftv,
      over4HT:   totalHT >= 5,   // Over 4.0 = 5+ cantos
      over45HT:  totalHT >= 5,   // Over 4.5 = 5+ cantos (mesma condição p/ inteiros)
      over9FT:   totalFT >= 10,  // Over 9.5 = 10+ cantos
      over85FT:  totalFT >= 9,   // Over 8.5 = 9+ cantos
      over105FT: totalFT >= 11,  // Over 10.5 = 11+ cantos
      perfH, perfV,
      perfCombo: `${perfH}×${perfV}`,
      diffH, diffV, diffSum,
      formH, formV,
      formCombo: formH && formV ? `${formH}×${formV}` : null,
    });
  }
}

// ─── helpers ───────────────────────────────────────────────
function pct(n, d) { return d > 0 ? (100 * n / d).toFixed(1) + "%" : "-"; }
function avg(arr)   { return arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : "-"; }

function segment(jogos, pred) {
  const g = jogos.filter(pred);
  return {
    n: g.length,
    avgHT:  avg(g.map(x=>x.totalHT)),
    avgFT:  avg(g.map(x=>x.totalFT)),
    o4HT:   pct(g.filter(x=>x.over4HT).length,  g.length),
    o45HT:  pct(g.filter(x=>x.over45HT).length, g.length),
    o9FT:   pct(g.filter(x=>x.over9FT).length,  g.length),
    o85FT:  pct(g.filter(x=>x.over85FT).length,  g.length),
    o105FT: pct(g.filter(x=>x.over105FT).length, g.length),
  };
}

function banner(t) { console.log("\n" + "═".repeat(70)); console.log(" " + t); console.log("═".repeat(70)); }
function sub(t)    { console.log("\n── " + t + " ──"); }

// ─── OUTPUT ────────────────────────────────────────────────
banner("ANÁLISE OVER/UNDER CANTOS — 8 LIGAS · " + TODOS_JOGOS.length + " JOGOS");

// ── 1. BASE RATES POR LIGA ─────────────────────────────────
banner("1. BASE RATES POR LIGA");
console.log("Liga   │ N   │ Avg HT │ Avg FT │ O/4 HT │ O/4.5 HT│ O/8.5 FT│ O/9.5 FT│ O/10.5 FT");
console.log("─".repeat(90));
for (const liga of LIGAS) {
  const s = segment(TODOS_JOGOS, j => j.liga === liga.key);
  if (s.n === 0) continue;
  console.log(
    liga.key.padEnd(6) + " │ " +
    String(s.n).padEnd(3)  + " │ " +
    String(s.avgHT).padEnd(6) + " │ " +
    String(s.avgFT).padEnd(6) + " │ " +
    String(s.o4HT).padEnd(7) + "│ " +
    String(s.o45HT).padEnd(8) + "│ " +
    String(s.o85FT).padEnd(8) + "│ " +
    String(s.o9FT).padEnd(8) + "│ " +
    s.o105FT
  );
}

// ── 2. POR COMBINAÇÃO DE PERFIL (GLOBAL) ──────────────────
banner("2. OVER/UNDER POR COMBO DE PERFIL (todas as ligas · mín 8 jogos)");
const perfCombos = {};
for (const j of TODOS_JOGOS) {
  const k = j.perfCombo;
  (perfCombos[k] = perfCombos[k] || []).push(j);
}
const PERFIL_ORDER = ["G_STRONG","G","N","S","S_STRONG","?"];
const sortedCombos = Object.entries(perfCombos)
  .filter(([,v]) => v.length >= 8)
  .sort((a,b) => {
    const ai = PERFIL_ORDER.indexOf(a[0].split("×")[0]);
    const bi = PERFIL_ORDER.indexOf(b[0].split("×")[0]);
    if (ai !== bi) return ai - bi;
    return PERFIL_ORDER.indexOf(a[0].split("×")[1]) - PERFIL_ORDER.indexOf(b[0].split("×")[1]);
  });

console.log("Combo H×V                  │ N   │ Avg HT│ Avg FT│ O/4HT │ O/9.5FT│ O/8.5FT");
console.log("─".repeat(78));
for (const [combo, jogos] of sortedCombos) {
  const s = segment(jogos, ()=>true);
  console.log(
    combo.padEnd(26) + " │ " +
    String(s.n).padEnd(3)  + " │ " +
    String(s.avgHT).padEnd(6) + "│ " +
    String(s.avgFT).padEnd(6) + "│ " +
    String(s.o4HT).padEnd(6) + " │ " +
    String(s.o9FT).padEnd(7) + "│ " +
    s.o85FT
  );
}

// ── 3. POR COMBO DE PERFIL × LIGA ─────────────────────────
banner("3. OVER 9.5 FT POR COMBO DE PERFIL DENTRO DE CADA LIGA (mín 5 jogos)");
for (const liga of LIGAS) {
  const ligaJogos = TODOS_JOGOS.filter(j => j.liga === liga.key);
  if (ligaJogos.length < 10) continue;
  const combosLiga = {};
  for (const j of ligaJogos) (combosLiga[j.perfCombo] = combosLiga[j.perfCombo]||[]).push(j);
  const entries = Object.entries(combosLiga).filter(([,v])=>v.length>=5)
    .sort((a,b)=>b[1].filter(x=>x.over9FT).length/b[1].length - a[1].filter(x=>x.over9FT).length/a[1].length);
  if (!entries.length) continue;
  sub(liga.key);
  for (const [combo, jogos] of entries) {
    const over9 = jogos.filter(x=>x.over9FT).length;
    const over4 = jogos.filter(x=>x.over4HT).length;
    const avgFT = avg(jogos.map(x=>x.totalFT));
    const avgHT = avg(jogos.map(x=>x.totalHT));
    console.log(`  ${combo.padEnd(24)} n=${String(jogos.length).padEnd(3)} avgFT=${avgFT.padEnd(5)} O9.5=${pct(over9,jogos.length).padEnd(7)} avgHT=${avgHT.padEnd(5)} O4HT=${pct(over4,jogos.length)}`);
  }
}

// ── 4. ANÁLISE POR SOMA DE DIFF (diffH + diffV) ───────────
banner("4. OVER 9.5 FT POR FAIXA DE SOMA DE DIFF (diffH + diffV)");
const faixas = [
  ["≥ 6.0  (dois G_STRONG)",   j => j.diffSum != null && j.diffSum >= 6.0],
  ["4.0–5.9 (G_STRONG+G ou G+G)", j => j.diffSum != null && j.diffSum >= 4.0 && j.diffSum < 6.0],
  ["2.0–3.9 (G_STRONG+N ou G+N)", j => j.diffSum != null && j.diffSum >= 2.0 && j.diffSum < 4.0],
  ["0.0–1.9 (N×N ou misto)",   j => j.diffSum != null && j.diffSum >= 0.0 && j.diffSum < 2.0],
  ["-2.0–-0.1 (inclui S)",     j => j.diffSum != null && j.diffSum >= -2.0 && j.diffSum < 0.0],
  ["< -2.0  (um/dois S_STRONG)", j => j.diffSum != null && j.diffSum < -2.0],
];
console.log("Faixa diffH+diffV               │ N   │ Avg FT │ O/8.5│ O/9.5│ O/10.5│ Avg HT │ O/4HT");
console.log("─".repeat(86));
for (const [label, pred] of faixas) {
  const s = segment(TODOS_JOGOS, pred);
  if (s.n < 5) continue;
  console.log(label.padEnd(33) + " │ " + String(s.n).padEnd(3) + " │ " +
    String(s.avgFT).padEnd(7) + "│ " + String(s.o85FT).padEnd(5) + "│ " +
    String(s.o9FT).padEnd(5) + "│ " + String(s.o105FT).padEnd(6) + "│ " +
    String(s.avgHT).padEnd(7) + "│ " + s.o4HT);
}

// ── 5. FORMAÇÕES (mín 15 jogos) ───────────────────────────
banner("5. OVER 9.5 FT POR MATCHUP DE FORMAÇÃO (mín 15 jogos)");
const formCombos = {};
for (const j of TODOS_JOGOS) {
  if (!j.formCombo) continue;
  (formCombos[j.formCombo] = formCombos[j.formCombo]||[]).push(j);
}
const formEntries = Object.entries(formCombos)
  .filter(([,v]) => v.length >= 15)
  .sort((a,b) => {
    const ra = a[1].filter(x=>x.over9FT).length/a[1].length;
    const rb = b[1].filter(x=>x.over9FT).length/b[1].length;
    return rb - ra;
  });
console.log("Formação H × V           │ N   │ Avg FT │ O/9.5│ O/8.5│ O/10.5 │ Avg HT │ O/4HT");
console.log("─".repeat(84));
for (const [combo, jogos] of formEntries) {
  const s = segment(jogos, ()=>true);
  console.log(combo.padEnd(25) + " │ " + String(s.n).padEnd(3) + " │ " +
    String(s.avgFT).padEnd(7) + "│ " + String(s.o9FT).padEnd(5) + "│ " +
    String(s.o85FT).padEnd(5) + "│ " + String(s.o105FT).padEnd(7) + "│ " +
    String(s.avgHT).padEnd(7) + "│ " + s.o4HT);
}

// ── 6. TOP TIMES GERADORES DE OVER (médias individuais) ───
banner("6. TOP 20 TIMES GERADORES DE TOTAL ALTO DE CANTOS (mín 6 jogos)");
const timeMap = {};
for (const j of TODOS_JOGOS) {
  for (const [role, time, totalFT, totalHT, over9, over4] of [
    ["casa", j.mandante, j.totalFT, j.totalHT, j.over9FT, j.over4HT],
    ["fora", j.visitante, j.totalFT, j.totalHT, j.over9FT, j.over4HT],
  ]) {
    const k = `${j.liga}·${time}`;
    if (!timeMap[k]) timeMap[k] = { liga: j.liga, time, jogos: 0, sumFT: 0, sumHT: 0, over9: 0, over4HT: 0 };
    timeMap[k].jogos++;
    timeMap[k].sumFT += totalFT;
    timeMap[k].sumHT += totalHT;
    timeMap[k].over9 += over9 ? 1 : 0;
    timeMap[k].over4HT += over4 ? 1 : 0;
  }
}
const timeSorted = Object.values(timeMap)
  .filter(t => t.jogos >= 6)
  .map(t => ({ ...t, avgFT: t.sumFT/t.jogos, pctOver9: t.over9/t.jogos }))
  .sort((a,b) => b.avgFT - a.avgFT)
  .slice(0, 20);
console.log("Liga   │ Time                    │ Jogos│ Avg FT│ O/9.5│ Avg HT│ O/4HT");
console.log("─".repeat(74));
for (const t of timeSorted) {
  console.log(
    t.liga.padEnd(6) + " │ " +
    t.time.slice(0,23).padEnd(23) + " │ " +
    String(t.jogos).padEnd(5) + "│ " +
    (t.avgFT).toFixed(2).padEnd(6) + " │ " +
    pct(t.over9, t.jogos).padEnd(5) + "│ " +
    (t.sumHT/t.jogos).toFixed(2).padEnd(6) + " │ " +
    pct(t.over4HT, t.jogos)
  );
}

// ── 7. ANÁLISE HT ISOLADO — O QUE PREDIZ O OVER 4 HT? ────
banner("7. OVER 4 HT — SEGMENTAÇÃO DETALHADA");
sub("Seg. por combo de perfil (G_STRONG envolvido vs outros)");
const htSegs = [
  ["G_STRONG × G_STRONG",    j => j.perfH==="G_STRONG" && j.perfV==="G_STRONG"],
  ["G_STRONG × G",           j => (j.perfH==="G_STRONG"&&j.perfV==="G")||(j.perfH==="G"&&j.perfV==="G_STRONG")],
  ["G_STRONG × N",           j => (j.perfH==="G_STRONG"&&j.perfV==="N")||(j.perfH==="N"&&j.perfV==="G_STRONG")],
  ["G_STRONG × S/S_STRONG",  j => j.perfH==="G_STRONG" && (j.perfV==="S"||j.perfV==="S_STRONG")],
  ["G × G",                  j => j.perfH==="G" && j.perfV==="G"],
  ["G × N",                  j => (j.perfH==="G"&&j.perfV==="N")||(j.perfH==="N"&&j.perfV==="G")],
  ["G × S/S_STRONG",         j => j.perfH==="G" && (j.perfV==="S"||j.perfV==="S_STRONG")],
  ["N × N",                  j => j.perfH==="N" && j.perfV==="N"],
  ["N × S/S_STRONG",         j => j.perfH==="N" && (j.perfV==="S"||j.perfV==="S_STRONG")],
  ["S/S_STRONG × S/S_STRONG",j => (j.perfH==="S"||j.perfH==="S_STRONG") && (j.perfV==="S"||j.perfV==="S_STRONG")],
  ["Desconhecido (?)",        j => j.perfH==="?" || j.perfV==="?"],
];
console.log("Segmento                       │ N   │ Avg HT│ O/4HT │ O/4.5HT│ Avg FT│ O/9.5FT");
console.log("─".repeat(82));
for (const [label, pred] of htSegs) {
  const s = segment(TODOS_JOGOS, pred);
  if (s.n < 5) continue;
  console.log(
    label.padEnd(31) + " │ " + String(s.n).padEnd(3) + " │ " +
    String(s.avgHT).padEnd(6) + "│ " + String(s.o4HT).padEnd(6) + " │ " +
    String(s.o45HT).padEnd(7) + "│ " + String(s.avgFT).padEnd(6) + "│ " +
    s.o9FT
  );
}

// ── 8. RESUMO FINAL — GATILHOS DE SINAL ───────────────────
banner("8. RESUMO — CANDIDATOS A GATILHO (Over e Under)");
console.log("\n[OVER 9.5 FT — gatilhos fortes]");
const overGatilhos = [
  ["diffSum ≥ 6.0 (2 G_STRONG)",             TODOS_JOGOS.filter(j=>j.diffSum!=null&&j.diffSum>=6.0)],
  ["diffSum 4.0–5.9 (G_STRONG+G)",            TODOS_JOGOS.filter(j=>j.diffSum!=null&&j.diffSum>=4.0&&j.diffSum<6.0)],
  ["G_STRONG×G_STRONG (combo direto)",         TODOS_JOGOS.filter(j=>j.perfH==="G_STRONG"&&j.perfV==="G_STRONG")],
  ["G_STRONG home (qualquer visitante)",       TODOS_JOGOS.filter(j=>j.perfH==="G_STRONG")],
  ["G_STRONG visitante (qualquer mandante)",   TODOS_JOGOS.filter(j=>j.perfV==="G_STRONG")],
];
for (const [label, jgs] of overGatilhos) {
  if (!jgs.length) continue;
  const o9 = jgs.filter(x=>x.over9FT).length;
  const o85 = jgs.filter(x=>x.over85FT).length;
  const o105 = jgs.filter(x=>x.over105FT).length;
  console.log(`  ${label.padEnd(43)} n=${String(jgs.length).padEnd(4)} O/9.5=${pct(o9,jgs.length).padEnd(7)} O/8.5=${pct(o85,jgs.length).padEnd(7)} O/10.5=${pct(o105,jgs.length)}`);
}

console.log("\n[UNDER 9.5 FT — gatilhos fortes]");
const underGatilhos = [
  ["S_STRONG×S_STRONG",                       TODOS_JOGOS.filter(j=>j.perfH==="S_STRONG"&&j.perfV==="S_STRONG")],
  ["S_STRONG home × S visitante",              TODOS_JOGOS.filter(j=>j.perfH==="S_STRONG"&&(j.perfV==="S"||j.perfV==="S_STRONG"))],
  ["diffSum ≤ -3.0",                           TODOS_JOGOS.filter(j=>j.diffSum!=null&&j.diffSum<=-3.0)],
  ["S×S (ambos sofredores)",                   TODOS_JOGOS.filter(j=>(j.perfH==="S"||j.perfH==="S_STRONG")&&(j.perfV==="S"||j.perfV==="S_STRONG"))],
];
for (const [label, jgs] of underGatilhos) {
  if (!jgs.length) continue;
  const under9 = jgs.filter(x=>!x.over9FT).length;
  const under85 = jgs.filter(x=>!x.over85FT).length;
  console.log(`  ${label.padEnd(43)} n=${String(jgs.length).padEnd(4)} U/9.5=${pct(under9,jgs.length).padEnd(7)} U/8.5=${pct(under85,jgs.length)}`);
}

console.log("\n[OVER 4 HT — gatilhos]");
const htGatilhos = [
  ["G_STRONG × G_STRONG",                     TODOS_JOGOS.filter(j=>j.perfH==="G_STRONG"&&j.perfV==="G_STRONG")],
  ["G_STRONG envolvido (H ou V)",              TODOS_JOGOS.filter(j=>j.perfH==="G_STRONG"||j.perfV==="G_STRONG")],
  ["diffSum ≥ 4.0",                            TODOS_JOGOS.filter(j=>j.diffSum!=null&&j.diffSum>=4.0)],
  ["G×G",                                     TODOS_JOGOS.filter(j=>j.perfH==="G"&&j.perfV==="G")],
];
for (const [label, jgs] of htGatilhos) {
  if (!jgs.length) continue;
  const o4 = jgs.filter(x=>x.over4HT).length;
  const o45 = jgs.filter(x=>x.over45HT).length;
  console.log(`  ${label.padEnd(43)} n=${String(jgs.length).padEnd(4)} O/4HT=${pct(o4,jgs.length).padEnd(7)} O/4.5HT=${pct(o45,jgs.length)}`);
}

console.log("\n[UNDER 4 HT — gatilhos]");
const htUnderGatilhos = [
  ["S_STRONG × S_STRONG",                     TODOS_JOGOS.filter(j=>j.perfH==="S_STRONG"&&j.perfV==="S_STRONG")],
  ["S×S (ambos)",                             TODOS_JOGOS.filter(j=>(j.perfH==="S"||j.perfH==="S_STRONG")&&(j.perfV==="S"||j.perfV==="S_STRONG"))],
  ["diffSum ≤ -2.0",                          TODOS_JOGOS.filter(j=>j.diffSum!=null&&j.diffSum<=-2.0)],
];
for (const [label, jgs] of htUnderGatilhos) {
  if (!jgs.length) continue;
  const u4 = jgs.filter(x=>!x.over4HT).length;
  const u45 = jgs.filter(x=>!x.over45HT).length;
  console.log(`  ${label.padEnd(43)} n=${String(jgs.length).padEnd(4)} U/4HT=${pct(u4,jgs.length).padEnd(7)} U/4.5HT=${pct(u45,jgs.length)}`);
}

console.log("\n\n[FIM DA ANÁLISE]");
