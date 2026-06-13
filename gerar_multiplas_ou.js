#!/usr/bin/env node
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = __dirname;

const sinais = JSON.parse(fs.readFileSync(path.join(ROOT, "sinais_output.json"), "utf8"));
const ou     = JSON.parse(fs.readFileSync(path.join(ROOT, "ou_output.json"), "utf8"));
const BASE_HAND = { BRB:60, USL:46, ARG:50, CHI:50 };

// ── Build unified pool ────────────────────────────────────────
const handMap = {};
for (const r of sinais.sinais) handMap[r.liga+"|"+r.mand+"|"+r.vis] = r;

const pool = [];
for (const r of ou.sinais) {
  const h = handMap[r.liga+"|"+r.mand+"|"+r.vis];
  const candidates = [];

  // O/U FT
  candidates.push({ mercado:"O/U FT", lado: r.ladoFT+" "+r.lineFT+" FT",
    prob:r.probFT, score:Math.abs(r.edgeFT), forca:r.forcaFT, linha:r.lineFT+" FT" });

  // O/U HT
  if (r.sinalHT && r.forcaHT !== "BASE" && r.probHT) {
    candidates.push({ mercado:"O/U HT", lado: r.ladoHT+" "+r.lineHT+" HT",
      prob:r.probHT, score:Math.abs(r.edgeHT||0), forca:r.forcaHT, linha:r.lineHT+" HT" });
  }

  // Handicap FT
  if (h) {
    const sc = h.confFinal - (BASE_HAND[r.liga]||50);
    const timeN = h.lado==="MAND" ? h.mand : h.vis;
    candidates.push({ mercado:"DUELO FT", lado: timeN,
      prob:h.confFinal, score:sc, forca:h.tier, linha:h.lineFT||"ML" });
  }

  const best = candidates.sort((a,b)=>b.score-a.score)[0];
  pool.push({ liga:r.liga, horario:r.horario, mand:r.mand, vis:r.vis, ...best });
}
pool.sort((a,b)=>b.score-a.score);
const P = pool.slice(0,15); // top 15

// Tiers
// A=0-2, RA=3-6, RB=7-10, RC=11-14
const TIER = i => i<=2?"A": i<=6?"RA": i<=10?"RB":"RC";

// ── Composições das múltiplas ─────────────────────────────────
// Índices das pernas em cada múltipla
const COMPS = [
  // M1-M7: 5 pernas = A(0,1,2) + 2 de RA(3..6)
  [0,1,2,3,4],
  [0,1,2,3,5],
  [0,1,2,3,6],
  [0,1,2,4,5],
  [0,1,2,4,6],
  [0,1,2,5,6],
  [0,1,2,3,7],   // M7 já puxa RB1
  // M8-M10: 7 pernas = A(0,1,2) + 3 RA + 1 RB
  [0,1,2,3,4,5,7],
  [0,1,2,3,4,6,8],
  [0,1,2,4,5,6,9],
  // M11-M12: 10 pernas = A(0-2) + RA(3-6) + 3 RB
  [0,1,2,3,4,5,6,7,8,9],
  [0,1,2,3,4,5,6,7,8,10],
  // M13-M14: 12 pernas = A(0-2) + RA(3-6) + RB(7-10) + 1 RC
  [0,1,2,3,4,5,6,7,8,9,10,11],
  [0,1,2,3,4,5,6,7,8,9,10,12],
  // M15: 15 pernas = tudo
  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
];

// ── Prob combinada ────────────────────────────────────────────
const combProb = idxs => idxs.reduce((acc,i)=>acc*(P[i].prob/100),1)*100;

// ── HTML helpers ──────────────────────────────────────────────
const LIGA_NOME = { BRB:"BR_B", USL:"USL", ARG:"ARG_B", CHI:"CHI" };

function tierDot(i) {
  const t = TIER(i);
  if (t==="A")  return "dot-a";
  if (t==="RA") return "dot-ra";
  if (t==="RB") return "dot-rb";
  return "dot-rc";
}
function legBg(i) {
  const t = TIER(i);
  if (t==="A")  return "leg-a";
  if (t==="RB") return "leg-rb";
  if (t==="RC") return "leg-rc";
  return "";
}

function mercadoBadge(r) {
  if (r.mercado==="DUELO FT") return `<span class="mbadge mb-d">DUELO</span>`;
  if (r.mercado==="O/U FT")   return `<span class="mbadge mb-ou">O/U FT</span>`;
  return `<span class="mbadge mb-ht">O/U HT</span>`;
}

function renderLeg(idx, rank) {
  const r = P[idx];
  const linha = r.mercado==="DUELO FT" ? r.linha : r.lado;
  return `
        <div class="leg ${legBg(idx)}">
          <span class="rk">${rank}</span>
          <span class="dot ${tierDot(idx)}"></span>
          <div class="tm">
            <div class="nm">${r.mand} × ${r.vis}</div>
            <div class="mt">${LIGA_NOME[r.liga]} · ${r.horario} · ${linha}</div>
          </div>
          ${mercadoBadge(r)}
          <span class="cv" style="color:${r.mercado.includes("DUELO")?"#58a6ff":r.lado.startsWith("OVER")?"#4ade80":"#f87171"}">${r.prob}%</span>
        </div>`;
}

function renderCard(comps, mId, nLegs, cp) {
  const legs = comps.map((idx, ri) => renderLeg(idx, ri+1)).join("");
  return `
  <div class="mc">
    <div class="mc-hd">
      <span class="mc-id">${mId}</span>
      <span class="mc-legs">${nLegs} pernas</span>
      <span class="mc-prob">prob. combinada <span>${cp.toFixed(1)}%</span></span>
    </div>
    ${legs}
  </div>`;
}

// ── Contagem de aparições por pick ────────────────────────────
const count = Array(15).fill(0);
for (const c of COMPS) for (const i of c) count[i]++;

// ── Gera seções ───────────────────────────────────────────────
const SIZES = [5,5,5,5,5,5,5,7,7,7,10,10,12,12,15];
const SECTION_DEFS = [
  { range:[0,6],  n:5,  label:"Múltiplas de 5 Pernas", pill:"M1–M7",  desc:"3 âncoras + 2 de rotação" },
  { range:[7,9],  n:7,  label:"Múltiplas de 7 Pernas", pill:"M8–M10", desc:"3 âncoras + 3 RA + 1 RB" },
  { range:[10,11],n:10, label:"Múltiplas de 10 Pernas",pill:"M11–M12",desc:"3 âncoras + 4 RA + 3 RB" },
  { range:[12,13],n:12, label:"Múltiplas de 12 Pernas",pill:"M13–M14",desc:"3 âncoras + 4 RA + 4 RB + 1 RC" },
  { range:[14,14],n:15, label:"Múltipla de 15 Pernas", pill:"M15",    desc:"todas as 15 pernas" },
];

let secoes = "";
for (const sec of SECTION_DEFS) {
  const [from, to] = sec.range;
  let cards = "";
  for (let m = from; m <= to; m++) {
    const cp = combProb(COMPS[m]);
    cards += renderCard(COMPS[m], "M"+(m+1), SIZES[m], cp);
  }
  const cols = sec.n <= 5 ? "g3" : sec.n <= 7 ? "g2" : "g1";
  secoes += `
<div class="sec">
  <h2>${sec.label}</h2>
  <span class="pill">${sec.pill}</span>
  <span class="desc">${sec.desc}</span>
</div>
<div class="${cols}">
${cards}
</div>`;
}

// ── Stats ─────────────────────────────────────────────────────
const nDuelo = P.filter(r=>r.mercado==="DUELO FT").length;
const nOUFT  = P.filter(r=>r.mercado==="O/U FT").length;
const nOUHT  = P.filter(r=>r.mercado==="O/U HT").length;
const nA=3, nRA=4, nRB=4, nRC=4;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDS HDP Ultra — Múltiplas O/U + Duelo 13-16/jun/2026</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d1117;color:#c9d1d9;font-family:'Segoe UI',system-ui,sans-serif;font-size:13px;line-height:1.4}
.container{max-width:1120px;margin:0 auto;padding:20px 14px}
.header{text-align:center;padding:28px 0 20px;border-bottom:1px solid #30363d;margin-bottom:22px}
.header .logo{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#58a6ff;font-weight:700;margin-bottom:8px}
.header h1{font-size:25px;font-weight:700;color:#fff}
.header h1 span{color:#58a6ff}
.header .sub{color:#8b949e;font-size:12px;margin-top:5px}
.tag-row{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:14px}
.tag{padding:3px 11px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.4px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:9px;margin-bottom:24px}
.sc{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:13px;text-align:center}
.sc .n{font-size:24px;font-weight:700}
.sc .l{font-size:10px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:.4px}
.sec{margin:26px 0 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.sec h2{font-size:16px;font-weight:700;color:#fff}
.pill{padding:2px 10px;border-radius:10px;font-size:10px;font-weight:700;background:#1f2937;color:#58a6ff;border:1px solid #374151}
.sec .desc{font-size:11px;color:#8b949e;margin-left:auto}
.g3{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.g2{display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:12px}
.g1{display:grid;grid-template-columns:1fr;gap:12px}
/* Card */
.mc{background:#161b22;border:1px solid #30363d;border-radius:10px;overflow:hidden}
.mc-hd{background:#1c2128;padding:9px 13px;border-bottom:1px solid #30363d;display:flex;align-items:center;gap:9px}
.mc-id{font-size:15px;font-weight:700;color:#fff}
.mc-legs{font-size:10px;font-weight:700;padding:2px 8px;background:#0d1117;border:1px solid #30363d;border-radius:8px;color:#8b949e}
.mc-prob{margin-left:auto;font-size:11px;color:#8b949e}
.mc-prob span{color:#58a6ff;font-weight:700;font-size:13px}
/* Legs */
.leg{display:flex;align-items:center;gap:7px;padding:5px 11px;border-bottom:1px solid rgba(48,54,61,0.45)}
.leg:last-child{border-bottom:none}
.leg-a{background:rgba(22,73,41,0.13)}
.leg-rb{background:rgba(69,39,160,0.07)}
.leg-rc{background:rgba(120,53,15,0.07)}
.rk{width:17px;text-align:center;font-size:10px;color:#8b949e;font-weight:600;flex-shrink:0}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dot-a{background:#4ade80}
.dot-ra{background:#fb923c}
.dot-rb{background:#c084fc}
.dot-rc{background:#f59e0b}
.tm{flex:1;min-width:0}
.nm{font-size:11.5px;font-weight:600;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mt{font-size:10px;color:#8b949e}
.mbadge{font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;flex-shrink:0}
.mb-d{background:#0d2137;color:#58a6ff;border:1px solid #1e4a7a}
.mb-ou{background:#14291e;color:#4ade80;border:1px solid #1b5e20}
.mb-ht{background:#1e1440;color:#c084fc;border:1px solid #4527a0}
.cv{font-size:12px;font-weight:700;min-width:38px;text-align:right;flex-shrink:0}
/* Legend */
.legenda{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:12px 16px;margin-top:24px;font-size:11px;color:#8b949e;line-height:1.8}
.legenda h3{font-size:12px;color:#c9d1d9;margin-bottom:6px}
.footer{text-align:center;padding:18px 0;color:#8b949e;font-size:11px;border-top:1px solid #30363d;margin-top:28px}
</style>
</head>
<body>
<div class="container">

<div class="header">
  <div class="logo">EDS HDP Ultra · Múltiplos Mercados de Cantos</div>
  <h1>Múltiplas <span>13–16 jun 2026</span></h1>
  <div class="sub">15 combinações · Top 15 unificados (Duelo + O/U FT + O/U HT) · 1 mercado por jogo</div>
  <div class="tag-row">
    <span class="tag" style="background:#1B5E20;color:#a5d6a7">🟢 Âncora (top 3)</span>
    <span class="tag" style="background:#E65100;color:#ffcc80">🟠 Rot-A (4–7)</span>
    <span class="tag" style="background:#4527A0;color:#ce93d8">🟣 Rot-B (8–11)</span>
    <span class="tag" style="background:#78350F;color:#fcd34d">🟡 Rot-C (12–15)</span>
  </div>
</div>

<div class="stats">
  <div class="sc"><div class="n" style="color:#58a6ff">15</div><div class="l">Múltiplas</div></div>
  <div class="sc"><div class="n" style="color:#4ade80">7</div><div class="l">de 5 pernas</div></div>
  <div class="sc"><div class="n" style="color:#86efac">3</div><div class="l">de 7 pernas</div></div>
  <div class="sc"><div class="n" style="color:#fb923c">2</div><div class="l">de 10 pernas</div></div>
  <div class="sc"><div class="n" style="color:#c084fc">2</div><div class="l">de 12 pernas</div></div>
  <div class="sc"><div class="n" style="color:#f59e0b">1</div><div class="l">de 15 pernas</div></div>
  <div class="sc"><div class="n" style="color:#58a6ff">${nDuelo}</div><div class="l">Duelo FT</div></div>
  <div class="sc"><div class="n" style="color:#4ade80">${nOUFT}</div><div class="l">O/U FT</div></div>
  <div class="sc"><div class="n" style="color:#c084fc">${nOUHT}</div><div class="l">O/U HT</div></div>
</div>

<div style="background:#161b22;border:1px solid #30363d;border-left:3px solid #58a6ff;border-radius:6px;padding:11px 14px;margin-bottom:22px;font-size:12px;color:#8b949e;line-height:1.6">
  <strong style="color:#c9d1d9">Picks únicos (top 15):</strong>
  ${P.map((r,i)=>`<span style="color:${TIER(i)==="A"?"#4ade80":TIER(i)==="RA"?"#fb923c":TIER(i)==="RB"?"#c084fc":"#f59e0b"}">${i+1}. ${r.mand.split(" ")[0]}(${r.prob}%)</span>`).join("  ·  ")}
</div>

${secoes}

<div class="legenda">
  <h3>Legenda de mercados</h3>
  <span style="background:#0d2137;color:#58a6ff;border:1px solid #1e4a7a;font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px">DUELO</span> Handicap de cantos FT — apostar no time indicado vencer o total de cantos &nbsp;·&nbsp;
  <span style="background:#14291e;color:#4ade80;border:1px solid #1b5e20;font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px">O/U FT</span> Over/Under total cantos Full Time &nbsp;·&nbsp;
  <span style="background:#1e1440;color:#c084fc;border:1px solid #4527a0;font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px">O/U HT</span> Over/Under total cantos Meio Tempo<br>
  A % mostrada em cada perna é a <strong style="color:#c9d1d9">probabilidade histórica</strong> do sinal, calculada do banco de dados próprio (1.324 jogos).
</div>

<div class="footer">
  EDS HDP Ultra · Múltiplas combinadas · rodada ${sinais.rodada}<br>
  Top 15 unificados: melhor mercado por jogo · pool = Duelo FT + O/U FT + O/U HT
</div>

</div>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, "EDS_MULTIPLAS_OU_13_16_jun_2026.html"), html);
console.log("Salvo: EDS_MULTIPLAS_OU_13_16_jun_2026.html (" + (html.length/1024).toFixed(1) + " KB)");

// Print summary
console.log("\nTop 15 picks:");
P.forEach((r,i) => console.log((i+1)+". ["+TIER(i)+"] "+r.liga+" "+r.horario+" "+r.mand+" x "+r.vis+" | "+r.mercado+" | "+r.lado+" | "+r.prob+"%"));
console.log("\nProb combinadas:");
COMPS.forEach((c,i) => console.log("M"+(i+1)+" ("+c.length+"p): "+combProb(c).toFixed(1)+"%"));
