#!/usr/bin/env node
// ============================================================
// EDS-HDP ULTRA — Motor de Over/Under Cantos v1.0
// Uso: node engine_ou.js [fixtures.json]
// Mercados: O/U FT (linha por liga) + O/U HT
// Gatilhos calculados AO VIVO do histórico:
//   - combo de perfil (perfH × perfV)
//   - diffSum (diff_cantos mandante + visitante via memoria_usl)
// Filosofia HDP: manifesta sempre (OVER ou UNDER), nunca SKIP.
// ============================================================
"use strict";
const fs = require("fs"), vm = require("vm"), path = require("path");

const ROOT  = path.join(__dirname);
const INPUT = process.argv[2] || path.join(ROOT, "fixtures.json");

// ── Carrega dados ────────────────────────────────────────────
const ctx = { window: {} };
vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(ROOT, "data", f), "utf8"), ctx);
load("brasileiraoB2026.js");
load("usl2026.js");
load("argentina_b2026.js");
load("chile2026.js");
load("memoria_usl.js");

const DADOS = {
  BRB: ctx.window.DADOS_BR_B,
  USL: ctx.window.DADOS_USL,
  ARG: ctx.window.DADOS_ARG_B,
  CHI: ctx.window.DADOS_CHI,
};
const MEM = ctx.window.MEMORIA_USL;
const MEM_KEYS = { BRB: "BR_B", USL: "USL", ARG: "ARG_B", CHI: "CHI" };

// Linha FT por liga (média FT: ARG/USL baixas → 8.5; BRB/CHI → 9.5)
const LINHA_FT = { BRB: 9.5, USL: 8.5, ARG: 8.5, CHI: 9.5 };
const LINHA_HT = { BRB: 3.5, USL: 3.5, ARG: 3.5, CHI: 3.5 };

// ── Utilitários ──────────────────────────────────────────────
const sortJogos = arr =>
  (arr || []).filter(j => j.cantos && j.cantos.ft);

const findTeam = (names, query) => {
  if (!query) return null;
  if (names.has(query)) return query;
  const q = query.toLowerCase();
  for (const t of names) {
    const tl = t.toLowerCase();
    if (tl === q || tl.includes(q) || q.includes(tl)) return t;
  }
  return null;
};

function getPerfil(ligaKey, team) {
  const sec = MEM?.[ligaKey];
  if (!sec?.perfis) return null;
  const p = sec.perfis[team] || sec.perfis[
    Object.keys(sec.perfis).find(k => k.toLowerCase() === (team || "").toLowerCase())
  ];
  return p || null;
}

// ── Tabelas históricas por liga (calculadas ao vivo) ─────────
function buildLeagueTables(jogos, ligaKey, ftCut, htCut) {
  let nFT = 0, oFT = 0, nHT = 0, oHT = 0;
  const combo = {};   // "pH×pV" → { n, oFT, oHT }
  const diffB = {};   // bucket → { n, oFT }

  const bucketOf = ds =>
    ds < -3   ? "≤-3" :
    ds < -1.5 ? "-3a-1.5" :
    ds < 0    ? "-1.5a0" :
    ds < 1.5  ? "0a1.5" :
    ds < 3    ? "1.5a3" : ">3";

  for (const j of jogos) {
    const m = j.cantos.ft.m, v = j.cantos.ft.v;
    if (m == null || v == null) continue;
    const ft = m + v;
    const ht = j.cantos.ht ? (j.cantos.ht.m + j.cantos.ht.v) : null;

    const pH = getPerfil(ligaKey, j.mandante)?.perfil_usl || "N";
    const pV = getPerfil(ligaKey, j.visitante)?.perfil_usl || "N";
    const dH = getPerfil(ligaKey, j.mandante)?.diff_cantos || 0;
    const dV = getPerfil(ligaKey, j.visitante)?.diff_cantos || 0;
    const ds = dH + dV;

    const isO = ft >= ftCut;
    nFT++; if (isO) oFT++;
    if (ht != null) { nHT++; if (ht >= htCut) oHT++; }

    const ck = pH + "×" + pV;
    if (!combo[ck]) combo[ck] = { n: 0, oFT: 0, oHT: 0 };
    combo[ck].n++; if (isO) combo[ck].oFT++;
    if (ht != null && ht >= htCut) combo[ck].oHT++;

    const bk = bucketOf(ds);
    if (!diffB[bk]) diffB[bk] = { n: 0, oFT: 0 };
    diffB[bk].n++; if (isO) diffB[bk].oFT++;
  }

  return {
    baseOverFT: nFT ? 100 * oFT / nFT : 50,
    baseOverHT: nHT ? 100 * oHT / nHT : 50,
    combo, diffB, nFT, nHT, bucketOf,
  };
}

// ── Classificação de força por edge + amostra ────────────────
function forcaDe(edge, n) {
  const a = Math.abs(edge);
  if (n < 5)  return null;                 // amostra insuficiente p/ gatilho
  if (a >= 18 && n >= 8)  return "FORTE";
  if (a >= 15)            return "FORTE";
  if (a >= 10)            return "MÉDIO";
  if (a >= 6)             return "LEAN";
  return null;
}

// ── Motor por jogo ───────────────────────────────────────────
function calcOU(fix, prep) {
  const { jogos, tab, ligaKey, ftCut, htCut, lineFT, lineHT } = prep;
  const names = new Set([...jogos.map(j => j.mandante), ...jogos.map(j => j.visitante)]);

  const hn = findTeam(names, fix.mandante) || fix.mandante;
  const vn = findTeam(names, fix.visitante) || fix.visitante;

  const pHd = getPerfil(ligaKey, hn);
  const pVd = getPerfil(ligaKey, vn);
  const perfH = pHd?.perfil_usl || "N";
  const perfV = pVd?.perfil_usl || "N";
  const diffSum = (pHd?.diff_cantos || 0) + (pVd?.diff_cantos || 0);

  // 1) Gatilho de combo de perfil
  const ck = perfH + "×" + perfV;
  const cData = tab.combo[ck];
  let comboOverFT = null, comboEdgeFT = 0, comboN = 0, comboOverHT = null;
  if (cData && cData.n >= 5) {
    comboOverFT = 100 * cData.oFT / cData.n;
    comboEdgeFT = comboOverFT - tab.baseOverFT;
    comboOverHT = 100 * cData.oHT / cData.n;
    comboN = cData.n;
  }

  // 2) Gatilho de diffSum
  const bk = tab.bucketOf(diffSum);
  const dData = tab.diffB[bk];
  let diffOverFT = null, diffEdgeFT = 0, diffN = 0;
  if (dData && dData.n >= 5) {
    diffOverFT = 100 * dData.oFT / dData.n;
    diffEdgeFT = diffOverFT - tab.baseOverFT;
    diffN = dData.n;
  }

  // 3) Sinal combinado FT — prioriza combo (efeito estrutural), diffSum confirma
  let edgeFT = comboEdgeFT;
  let nFT = comboN;
  let fonte = "combo";
  if (comboOverFT == null && diffOverFT != null) {
    edgeFT = diffEdgeFT; nFT = diffN; fonte = "diffSum";
  } else if (comboOverFT != null && diffOverFT != null) {
    // se ambos concordam no sentido → bônus de confiança (+3 edge efetivo)
    const concordam = Math.sign(comboEdgeFT) === Math.sign(diffEdgeFT);
    if (concordam) { edgeFT = comboEdgeFT + Math.sign(comboEdgeFT) * 3; fonte = "combo+diffSum"; }
    else { edgeFT = comboEdgeFT * 0.6; fonte = "combo (diffSum diverge)"; } // conflito → atenua
  }

  const ladoFT = edgeFT >= 0 ? "OVER" : "UNDER";
  const probFT = comboOverFT != null
    ? (ladoFT === "OVER" ? comboOverFT : 100 - comboOverFT)
    : (diffOverFT != null ? (ladoFT === "OVER" ? diffOverFT : 100 - diffOverFT) : tab.baseOverFT);
  const forcaFT = forcaDe(edgeFT, nFT) || "BASE";

  // 4) Sinal HT (apenas combo, amostra menor)
  let ladoHT = null, probHT = null, edgeHT = 0, forcaHT = "BASE";
  if (comboOverHT != null && comboN >= 6) {
    edgeHT = comboOverHT - tab.baseOverHT;
    ladoHT = edgeHT >= 0 ? "OVER" : "UNDER";
    probHT = ladoHT === "OVER" ? comboOverHT : 100 - comboOverHT;
    forcaHT = forcaDe(edgeHT, comboN) || "BASE";
  }

  return {
    liga: fix.liga, horario: fix.horario || "—",
    mand: hn, vis: vn, perfH, perfV, diffSum: parseFloat(diffSum.toFixed(2)),
    // FT
    lineFT: lineFT, ladoFT, probFT: parseFloat(probFT.toFixed(1)),
    edgeFT: parseFloat(edgeFT.toFixed(1)), forcaFT, nFT, fonte,
    sinalFT: `${ladoFT} ${lineFT} FT`,
    // HT
    lineHT, ladoHT, probHT: probHT != null ? parseFloat(probHT.toFixed(1)) : null,
    edgeHT: parseFloat(edgeHT.toFixed(1)), forcaHT,
    sinalHT: ladoHT ? `${ladoHT} ${lineHT} HT` : null,
    baseOverFT: parseFloat(tab.baseOverFT.toFixed(1)),
    comboKey: ck, comboN,
  };
}

// ── Processa fixtures ────────────────────────────────────────
const fixtures = JSON.parse(fs.readFileSync(INPUT, "utf8"));

const PREP = {};
for (const [code, data] of Object.entries(DADOS)) {
  const jogos = sortJogos(data.jogos);
  const ftCut = LINHA_FT[code] + 0.5;   // O/8.5 → ≥9 ; O/9.5 → ≥10
  const htCut = LINHA_HT[code] + 0.5;
  PREP[code] = {
    jogos,
    tab: buildLeagueTables(jogos, MEM_KEYS[code], ftCut, htCut),
    ligaKey: MEM_KEYS[code],
    ftCut, htCut,
    lineFT: LINHA_FT[code], lineHT: LINHA_HT[code],
  };
}

const resultados = fixtures.jogos.map(fix => {
  const prep = PREP[fix.liga];
  if (!prep) return { ...fix, erro: "Liga não encontrada: " + fix.liga };
  return calcOU(fix, prep);
});

// ── Saída console ────────────────────────────────────────────
const R = "\x1b[0m", B = "\x1b[1m", D = "\x1b[2m";
const G = "\x1b[32m", Y = "\x1b[33m", RED = "\x1b[31m", C = "\x1b[36m", BL = "\x1b[34m";
const corForca = f => f === "FORTE" ? G + B : f === "MÉDIO" ? C : f === "LEAN" ? Y : D;
const corLado  = l => l === "OVER" ? G : RED;

console.log("\n" + B + "══════════════════════════════════════════════════════════════════════" + R);
console.log(B + "  EDS-HDP ULTRA — OVER/UNDER CANTOS v1.0 | " + fixtures.rodada + R);
console.log(B + "  Gatilhos: combo perfil + diffSum (histórico próprio)" + R);
console.log(B + "══════════════════════════════════════════════════════════════════════" + R);

const BAND = { BRB: "🇧🇷 BR_B (O/9.5)", USL: "🇺🇸 USL (O/8.5)", ARG: "🇦🇷 ARG_B (O/8.5)", CHI: "🇨🇱 CHI (O/9.5)" };
const porLiga = {};
for (const r of resultados) {
  if (r.erro) { console.log(RED + "  ERRO: " + r.erro + R); continue; }
  (porLiga[r.liga] = porLiga[r.liga] || []).push(r);
}

const ordemForca = { FORTE: 3, "MÉDIO": 2, LEAN: 1, BASE: 0 };
const todos = [];

for (const liga of ["BRB", "USL", "ARG", "CHI"]) {
  const list = porLiga[liga];
  if (!list) continue;
  list.sort((a, b) => (ordemForca[b.forcaFT] - ordemForca[a.forcaFT]) || (Math.abs(b.edgeFT) - Math.abs(a.edgeFT)));

  console.log("\n" + B + BL + "  " + BAND[liga] + " — base OVER " + list[0].baseOverFT + "%" + R);
  console.log("  " + D + "─".repeat(70) + R);
  for (const r of list) {
    const sinalCor = corLado(r.ladoFT) + B + r.sinalFT.padEnd(15) + R;
    const fCor = corForca(r.forcaFT) + r.forcaFT.padEnd(6) + R;
    const htStr = r.sinalHT && r.forcaHT !== "BASE"
      ? "  " + D + "| HT: " + r.ladoHT + " " + r.lineHT + " (" + r.probHT + "%)" + R : "";
    console.log("  " + (r.horario || "").padEnd(13) +
      (r.mand + " × " + r.vis).substring(0, 32).padEnd(33) +
      sinalCor + fCor +
      (r.probFT + "%").padEnd(7) +
      D + "edge " + (r.edgeFT >= 0 ? "+" : "") + r.edgeFT + "% [" + r.perfH + "×" + r.perfV + " n=" + r.nFT + "]" + R +
      htStr);
    todos.push(r);
  }
}

// Ranking geral das melhores
const melhores = todos.filter(r => r.forcaFT === "FORTE" || r.forcaFT === "MÉDIO")
  .sort((a, b) => (ordemForca[b.forcaFT] - ordemForca[a.forcaFT]) || (Math.abs(b.edgeFT) - Math.abs(a.edgeFT)));

console.log("\n" + B + "══════════════════════════════════════════════════════════════════════" + R);
console.log(B + "  MELHORES INDICAÇÕES O/U — " + melhores.length + " sinais (FORTE + MÉDIO)" + R);
console.log(B + "══════════════════════════════════════════════════════════════════════" + R + "\n");
melhores.forEach((r, i) => {
  console.log("  " + B + (String(i + 1) + ".").padEnd(4) + R +
    r.liga.padEnd(5) + (r.horario || "").padEnd(13) +
    (r.mand + " × " + r.vis).substring(0, 32).padEnd(33) +
    corLado(r.ladoFT) + B + r.sinalFT.padEnd(15) + R +
    corForca(r.forcaFT) + r.forcaFT.padEnd(6) + R +
    (r.probFT + "%").padEnd(7) +
    D + "edge " + (r.edgeFT >= 0 ? "+" : "") + r.edgeFT + "%" + R);
});

// ── Salva JSON ───────────────────────────────────────────────
fs.writeFileSync(path.join(ROOT, "ou_output.json"), JSON.stringify({
  rodada: fixtures.rodada,
  gerado_em: new Date().toISOString(),
  linhas: LINHA_FT,
  sinais: resultados.filter(r => !r.erro),
  melhores,
}, null, 2));
console.log("\n" + D + "  JSON salvo: ou_output.json" + R + "\n");
