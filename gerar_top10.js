#!/usr/bin/env node
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = __dirname;

const sinais = JSON.parse(fs.readFileSync(path.join(ROOT, "sinais_output.json"), "utf8"));
const ou     = JSON.parse(fs.readFileSync(path.join(ROOT, "ou_output.json"), "utf8"));

const BASE_HAND = { BRB: 60, USL: 46, ARG: 50, CHI: 50 };

const handMap = {};
for (const r of sinais.sinais) {
  handMap[r.liga + "|" + r.mand + "|" + r.vis] = r;
}

const combined = [];
for (const r of ou.sinais) {
  const h = handMap[r.liga + "|" + r.mand + "|" + r.vis];
  const ouScore = Math.abs(r.edgeFT);
  let best = { mercado: "O/U", lado: r.ladoFT + " " + r.lineFT + " FT", prob: r.probFT, score: ouScore };

  if (h) {
    const hScore = h.confFinal - (BASE_HAND[r.liga] || 50);
    if (hScore > ouScore) {
      const sinalTime = h.lado === "MAND" ? h.mand : h.vis;
      best = { mercado: "DUELO", lado: sinalTime, prob: h.confFinal, score: hScore };
    }
  }
  combined.push({ liga: r.liga, horario: r.horario, mand: r.mand, vis: r.vis, ...best });
}

combined.sort((a, b) => b.score - a.score);
const top10 = combined.slice(0, 10);

// linha FT para duelo (do sinais_output)
for (const r of top10) {
  if (r.mercado === "DUELO") {
    const h = handMap[r.liga + "|" + r.mand + "|" + r.vis];
    r.lineFT = h?.lineFT || "ML";
    r.tier = h?.tier || "";
  } else {
    r.tier = ou.sinais.find(x => x.liga===r.liga && x.mand===r.mand && x.vis===r.vis)?.forcaFT || "";
  }
}

const LIGA_NOME = { BRB:"Brasileirão B", USL:"USL Championship", ARG:"ARG B Nacional", CHI:"Chile" };
const LINHA_OU = { BRB:"9.5", USL:"8.5", ARG:"8.5", CHI:"9.5" };

function tierColor(r) {
  if (r.mercado === "DUELO") {
    const t = r.tier;
    if (t.includes("TRIPLE LOCK FORTE")) return { bg:"#1B5E20", cl:"#a5d6a7", label:"🔒🔒 LOCK FORTE" };
    if (t.includes("TRIPLE LOCK"))       return { bg:"#2E7D32", cl:"#c8e6c9", label:"🔒 LOCK" };
    if (t.includes("G×S"))               return { bg:"#E65100", cl:"#ffcc80", label:"★ G×S FORTE" };
    if (t.includes("MARGINAL"))          return { bg:"#7f1d1d", cl:"#fca5a5", label:"⚠️ MARGINAL" };
    return { bg:"#4527A0", cl:"#ce93d8", label:"⚡ NEUTRO FORTE" };
  }
  // O/U
  const f = r.tier;
  if (f === "FORTE") return { bg:"#1B5E20", cl:"#a5d6a7", label:"FORTE" };
  if (f === "MÉDIO") return { bg:"#1f4e79", cl:"#9cc3e6", label:"MÉDIO" };
  return { bg:"#374151", cl:"#9ca3af", label:"LEAN" };
}

function renderCard(r, i) {
  const tc = tierColor(r);
  const isOver = r.lado.startsWith("OVER");
  const isUnder = r.lado.startsWith("UNDER");
  const isDuelo = r.mercado === "DUELO";

  const ladoColor = isDuelo ? "#58a6ff"
    : isOver ? "#4ade80"
    : isUnder ? "#f87171"
    : "#58a6ff";

  const mercadoBadge = isDuelo
    ? `<span style="background:#0d2137;color:#58a6ff;border:1px solid #1e4a7a;font-size:9px;font-weight:700;padding:1px 7px;border-radius:4px">DUELO</span>`
    : `<span style="background:#14291e;color:#4ade80;border:1px solid #1b5e20;font-size:9px;font-weight:700;padding:1px 7px;border-radius:4px">O/U ${LINHA_OU[r.liga]}</span>`;

  const sinalText = isDuelo
    ? `Mandante: <b style="color:#58a6ff">${r.lado}</b>`
    : `<b style="color:${ladoColor}">${r.lado}</b>`;

  const linhaExtra = isDuelo && r.lineFT
    ? `<span style="color:#6b7280;font-size:10px"> · ${r.lineFT}</span>` : "";

  return `
  <div style="background:#161b22;border:1px solid #30363d;border-radius:10px;overflow:hidden;display:flex;align-items:stretch">
    <!-- Rank -->
    <div style="width:44px;background:#0d1117;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-right:1px solid #30363d">
      <span style="font-size:18px;font-weight:700;color:${i<=2?'#f59e0b':i<=4?'#9ca3af':'#4b5563'}">${i}</span>
    </div>
    <!-- Body -->
    <div style="flex:1;min-width:0;padding:10px 13px">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
        <span style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:.5px">${LIGA_NOME[r.liga]||r.liga}</span>
        <span style="font-size:9px;color:#4b5563">${r.horario}</span>
        ${mercadoBadge}
        <span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:4px;background:${tc.bg};color:${tc.cl};margin-left:auto">${tc.label}</span>
      </div>
      <div style="font-size:13px;font-weight:700;color:#e6edf3;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        ${r.mand} <span style="color:#6b7280;font-weight:400">×</span> ${r.vis}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:12px">${sinalText}${linhaExtra}</div>
        <div style="font-size:17px;font-weight:700;color:#fff;margin-left:12px;flex-shrink:0">${r.prob}%</div>
      </div>
    </div>
  </div>`;
}

const cards = top10.map((r, i) => renderCard(r, i + 1)).join("\n");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDS HDP Ultra — Top 10 Sinais 13-16/jun/2026</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d1117;color:#c9d1d9;font-family:'Segoe UI',system-ui,sans-serif;font-size:13px;line-height:1.4}
.wrap{max-width:600px;margin:0 auto;padding:24px 14px}
</style>
</head>
<body>
<div class="wrap">

  <div style="text-align:center;padding:22px 0 18px;border-bottom:1px solid #30363d;margin-bottom:20px">
    <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#58a6ff;font-weight:700;margin-bottom:7px">EDS HDP Ultra · Cantos</div>
    <h1 style="font-size:22px;font-weight:700;color:#fff">Top 10 Sinais <span style="color:#58a6ff">13–16 jun 2026</span></h1>
    <div style="color:#8b949e;font-size:11px;margin-top:5px">Duelo de cantos + Over/Under · melhor mercado por jogo</div>
  </div>

  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;justify-content:center">
    <span style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:700;background:#0d2137;color:#58a6ff;border:1px solid #1e4a7a">DUELO = handicap cantos</span>
    <span style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:700;background:#14291e;color:#4ade80;border:1px solid #1b5e20">O/U = over/under cantos FT</span>
  </div>

  <div style="display:flex;flex-direction:column;gap:9px">
    ${cards}
  </div>

  <div style="text-align:center;padding:16px 0;color:#4b5563;font-size:10px;border-top:1px solid #30363d;margin-top:22px">
    EDS HDP Ultra · rodada ${sinais.rodada} · confiança = probabilidade histórica do sinal
  </div>

</div>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, "EDS_TOP10_13_16_jun_2026.html"), html);
console.log("Salvo: EDS_TOP10_13_16_jun_2026.html (" + (html.length/1024).toFixed(1) + " KB)");
